

# Diagnóstico: Dashboard Lento - Múltiplas Queries Paralelas

## Problema Identificado

O Dashboard está lento porque faz **mais de 30 queries** ao banco de dados simultaneamente quando carrega. Cada componente faz suas próprias requisições independentes:

### Contagem de Queries por Componente

| Componente | Queries | Tabelas Consultadas |
|------------|---------|---------------------|
| Dashboard (principal) | 2 | simulations (2x) |
| useUserProgress | 8 | company_profile, tax_score_history, xml_imports, company_dre, company_opportunities, workflow_progress, identified_credits, simulations |
| useExecutiveData | 9 | profiles, tax_score, company_dre, credit_analysis_summary, identified_credits, score_actions, company_opportunities, company_profile, sector_benchmarks |
| useAchievements | 2 | user_achievements + Edge Function |
| useOnboardingProgress | 1 | user_onboarding_progress |
| useStreak | 1 | profiles |
| ExpiringBenefitsAlert | 1 | company_opportunities (com join) |
| InProgressWorkflows | 1 | workflow_progress |
| NextRelevantDeadline | 2 | company_profile + prazos_reforma |
| ExecutiveSummaryCard | 1 | score_actions |
| NotificationBell | 1 | notifications |
| DashboardLayout | 0 | (usa useAuth que já carregou) |

**Total: ~29 queries + 1 Edge Function call**

### Problemas Adicionais

1. **Dados Duplicados**: O mesmo dado é buscado várias vezes:
   - `profiles` → useStreak, useExecutiveData
   - `company_profile` → useUserProgress, useExecutiveData, NextRelevantDeadline
   - `company_opportunities` → useUserProgress, useExecutiveData, ExpiringBenefitsAlert
   - `workflow_progress` → useUserProgress, InProgressWorkflows
   - `score_actions` → useExecutiveData, ExecutiveSummaryCard

2. **Queries Sequenciais**: Alguns hooks aguardam outros antes de iniciar

3. **Edge Function**: `check-achievements` é chamada no mount

## Solução Proposta

### Estratégia: Data Fetching Centralizado

Criar um **único hook consolidado** que busca todos os dados necessários em uma única chamada paralela, eliminando redundâncias.

### Arquitetura

```text
┌─────────────────────────────────────────────────────────┐
│                      Dashboard                           │
│                          │                               │
│              useDashboardData() ◄── NOVO HOOK           │
│                          │                               │
│     ┌────────────────────┼────────────────────┐         │
│     ▼                    ▼                    ▼         │
│ Promise.all([                                           │
│   profiles,                                             │
│   company_profile,                                      │
│   tax_score,                                            │
│   company_dre,                                          │
│   xml_imports (count),                                  │
│   company_opportunities,                                │
│   workflow_progress,                                    │
│   identified_credits,                                   │
│   simulations,                                          │
│   score_actions,                                        │
│   notifications,                                        │
│   prazos_reforma,                                       │
│   user_onboarding_progress,                             │
│   user_achievements                                     │
│ ])                                                      │
│                          │                               │
│                 SINGLE BATCH REQUEST                     │
│                          │                               │
│     ┌────────────────────┼────────────────────┐         │
│     ▼                    ▼                    ▼         │
│ [Componentes recebem dados via props]                   │
└─────────────────────────────────────────────────────────┘
```

### Mudanças Técnicas

#### 1. Criar Hook Consolidado: `useDashboardData.ts`

```typescript
// src/hooks/useDashboardData.ts
interface DashboardData {
  // Profile & Company
  profile: ProfileData | null;
  companyProfile: CompanyProfile | null;
  
  // Score & Health
  taxScore: TaxScore | null;
  scoreActions: ScoreAction[];
  achievements: Achievement[];
  
  // Financial
  dre: CompanyDre | null;
  credits: IdentifiedCredit[];
  opportunities: CompanyOpportunity[];
  
  // Activity
  workflows: WorkflowProgress[];
  simulations: Simulation[];
  xmlCount: number;
  
  // Alerts
  notifications: Notification[];
  upcomingDeadlines: Prazo[];
  onboardingProgress: OnboardingProgress | null;
  
  // Computed values (calculados localmente)
  thermometerData: ThermometerData;
  userProgress: UserProgressData;
  expiringBenefits: ExpiringBenefit[];
}

export function useDashboardData() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard-data', user?.id],
    queryFn: async () => {
      // Uma única chamada Promise.all com todas as queries
      const [profile, company, score, ...] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('company_profile').select('*').eq('user_id', userId).maybeSingle(),
        // ... todas as outras queries
      ]);
      
      // Processar e retornar dados consolidados
      return processedData;
    },
    enabled: !!user?.id,
    staleTime: 60000, // Cache por 1 minuto
  });
}
```

#### 2. Atualizar Dashboard para Usar Hook Único

```typescript
// src/pages/Dashboard.tsx
const Dashboard = () => {
  const { data, loading, refetch } = useDashboardData();
  
  if (loading) return <DashboardSkeleton />;
  
  return (
    <DashboardLayout>
      <ProgressSummary progress={data.userProgress} />
      <ExecutiveSummaryCard thermometerData={data.thermometerData} />
      <InProgressWorkflows workflows={data.workflows} />
      {/* Componentes recebem dados via props */}
    </DashboardLayout>
  );
};
```

#### 3. Refatorar Componentes para Receber Props

```typescript
// Antes (cada componente busca seus dados)
export function InProgressWorkflows() {
  const [workflows, setWorkflows] = useState([]);
  useEffect(() => { fetchWorkflows(); }, []);
  // ...
}

// Depois (recebe dados via props)
export function InProgressWorkflows({ workflows }: { workflows: WorkflowProgress[] }) {
  // Apenas renderiza, sem fetch
}
```

### Benefícios Esperados

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Queries ao DB | ~29 | ~14 | -52% |
| Roundtrips de rede | ~29 | 1 | -97% |
| Dados duplicados | 8 tabelas | 0 | -100% |
| Tempo de carregamento | ~2-4s | ~500ms | -75% |

### Arquivos a Modificar

1. **Criar**: `src/hooks/useDashboardData.ts` - Hook consolidado
2. **Editar**: `src/pages/Dashboard.tsx` - Usar novo hook
3. **Editar**: `src/components/dashboard/ExecutiveSummaryCard.tsx` - Receber props
4. **Editar**: `src/components/dashboard/InProgressWorkflows.tsx` - Receber props
5. **Editar**: `src/components/dashboard/NextRelevantDeadline.tsx` - Receber props
6. **Editar**: `src/components/dashboard/ExpiringBenefitsAlert.tsx` - Receber props
7. **Editar**: `src/components/onboarding/OnboardingChecklist.tsx` - Receber props
8. **Editar**: `src/components/achievements/StreakDisplay.tsx` - Receber props

### Otimização Adicional: Edge Function `check-achievements`

Mover a chamada para um momento posterior (lazy load) em vez de no mount:

```typescript
// Só verifica achievements quando o usuário interage
const checkAchievementsLazy = useCallback(() => {
  if (!hasChecked.current) {
    checkAchievements();
    hasChecked.current = true;
  }
}, []);
```

### Plano de Implementação

1. Criar `useDashboardData.ts` com todas as queries consolidadas
2. Atualizar Dashboard para usar o novo hook
3. Converter componentes para receber dados via props (um por um)
4. Remover hooks antigos que não são mais necessários em outros lugares
5. Testar performance

