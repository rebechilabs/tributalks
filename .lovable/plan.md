
# Plano Otimizado: Arquitetura AI-First com MVP Enxuto

## Resumo Executivo

Plano revisado incorporando as otimizações da Claude para entrega rápida e validação incremental. Foco em **redução de fricção** e **entrega de valor imediata**.

---

## FASE 1: Fundação AI-First

### 1.1 Nova Tabela: `clara_prompt_configs`

Armazena configurações dinâmicas que podem ser atualizadas sem deploy.

```sql
CREATE TABLE clara_prompt_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_type TEXT NOT NULL,  -- 'plan_response', 'greeting', 'tool_scope'
  content JSONB NOT NULL,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_prompt_configs_type ON clara_prompt_configs(config_type);
CREATE INDEX idx_prompt_configs_key ON clara_prompt_configs(config_key);
CREATE INDEX idx_prompt_configs_status ON clara_prompt_configs(status);

-- RLS (apenas admin pode modificar)
ALTER TABLE clara_prompt_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active configs"
  ON clara_prompt_configs FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage configs"
  ON clara_prompt_configs FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
```

### 1.2 Migrar `PLAN_RESPONSES` para Banco

Inserir as respostas por plano (já existentes no código) como dados:

| config_key | config_type | content (JSONB resumido) |
|------------|-------------|--------------------------|
| `plan_response:FREE` | `plan_response` | `{ "greeting": "Oi! Para conversar...", "cta": "upgrade" }` |
| `plan_response:STARTER` | `plan_response` | `{ "greeting": "Oi! Vou te ajudar...", "tools": ["score", "rtc", "split"] }` |
| `plan_response:NAVIGATOR` | `plan_response` | `{ "greeting": "Ótimo! Você tem...", "phases": [...] }` |
| `plan_response:PROFESSIONAL` | `plan_response` | `{ "greeting": "Perfeito!", "workflows": [...], "cnpjs": 6 }` |
| `plan_response:ENTERPRISE` | `plan_response` | `{ "greeting": "Excelente!", "cnpjs": "ilimitados" }` |

### 1.3 Atualizar Edge Function com Cache

**Arquivo:** `supabase/functions/clara-assistant/index.ts`

Adicionar busca dinâmica com cache de 10 minutos:

```typescript
// Cache em memória para configs
const configCache = new Map<string, { data: any; timestamp: number }>();
const CONFIG_CACHE_TTL = 10 * 60 * 1000; // 10 minutos

async function getDynamicPlanResponse(supabase: SupabaseClient, plan: string): Promise<string> {
  const key = `plan_response:${plan}`;
  
  // Verifica cache
  const cached = configCache.get(key);
  if (cached && Date.now() - cached.timestamp < CONFIG_CACHE_TTL) {
    return cached.data.greeting;
  }
  
  // Busca do banco
  const { data } = await supabase
    .from('clara_prompt_configs')
    .select('content')
    .eq('config_key', key)
    .eq('status', 'active')
    .maybeSingle();
  
  if (data?.content?.greeting) {
    configCache.set(key, { data: data.content, timestamp: Date.now() });
    return data.content.greeting;
  }
  
  // Fallback para hardcoded (garante funcionamento)
  return PLAN_RESPONSES[plan] || PLAN_RESPONSES.STARTER;
}
```

### 1.4 Nova Página: `/welcome` (Simplificada - 1 Pergunta)

**Arquivo:** `src/pages/WelcomeAI.tsx`

Experiência conversacional com **apenas 1 pergunta obrigatória**:

```text
┌─────────────────────────────────────────────────────────────┐
│                    🤖 Clara AI                              │
│                                                             │
│  "Oi Alexandre! 👋                                          │
│   Vi que você é do setor de Serviços, Lucro Presumido.     │
│                                                             │
│   Qual é sua maior prioridade agora?"                      │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │ 💰 Caixa   │  │ 📊 Margem   │                          │
│  │ Fluxo,     │  │ Lucro,      │                          │
│  │ capital    │  │ rentabil.   │                          │
│  └─────────────┘  └─────────────┘                          │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │ ✅ Comply  │  │ 🚀 Crescer  │                          │
│  │ Fiscal,    │  │ Expansão,   │                          │
│  │ prazos     │  │ planejam.   │                          │
│  └─────────────┘  └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

**Por que 1 pergunta apenas:**
- Já temos regime, setor e faturamento do perfil
- Clara pode inferir tempo baseado no histórico
- Reduz fricção drasticamente

### 1.5 Componente: `PersonalizedToolPlan`

**Arquivo:** `src/components/welcome/PersonalizedToolPlan.tsx`

Após a única pergunta, gera o plano imediatamente:

```text
┌─────────────────────────────────────────────────────────────┐
│  📋 Seu Plano Personalizado                                 │
│                                                             │
│  Objetivo: Proteger seu fluxo de caixa                     │
│  Baseado em: Lucro Presumido + Serviços + R$1M/mês         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Score Tributário                          3 min  │   │
│  │    📊 Veja sua situação fiscal em segundos          │   │
│  │    ✅ 8 campos já preenchidos                       │   │
│  │    [ Iniciar → ]                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 2. Simulador Split Payment                   5 min  │   │
│  │    💰 Entenda quanto vai travar do seu caixa        │   │
│  │    ✅ UF e regime já preenchidos                    │   │
│  │    [ Iniciar → ]                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  💡 Clara vai te acompanhar em cada etapa!                 │
└─────────────────────────────────────────────────────────────┘
```

### 1.6 Roteamento Inteligente

**Arquivo:** `src/App.tsx`

Adicionar rota `/welcome`:

```typescript
// Nova rota
<Route 
  path="/welcome" 
  element={
    <ProtectedRoute>
      <WelcomeAI />
    </ProtectedRoute>
  } 
/>
```

**Arquivo:** `src/components/ProtectedRoute.tsx`

Lógica de redirecionamento:

```typescript
// Se onboarding completo mas nunca viu /welcome
if (profile.onboarding_complete && !localStorage.getItem('welcome_seen')) {
  navigate('/welcome');
  return;
}
```

---

## FASE 2: Smart Experience

### 2.1 Hook Aprimorado: `useSmartPrefill`

**Arquivo:** `src/hooks/useSmartPrefill.ts`

O hook já existe e está bem implementado. Melhorias:

```typescript
// Adicionar suporte para mais ferramentas
type Tool = 'rtc' | 'score' | 'dre' | 'priceguard' | 'omc' | 'split' | 'comparativo';

// Adicionar campo de confiança visual
export interface PrefillField {
  key: string;
  label: string;
  value: any;
  source: 'profile' | 'dre' | 'credits' | 'memory' | 'manual';
  confidence: 'high' | 'medium' | 'low';
  editable?: boolean;
  sourceLabel?: string;  // "Do seu perfil", "Do DRE anterior"
}
```

### 2.2 Componente: `SmartFormAssistant` (Responsivo)

**Arquivo:** `src/components/welcome/SmartFormAssistant.tsx`

**Desktop:** Card flutuante no canto inferior direito
**Mobile:** FAB pequeno → clica → abre bottom sheet

```typescript
interface SmartFormAssistantProps {
  toolId: string;
  prefillData: PrefillField[];
  missingFields: MissingField[];
  onFieldFocus?: (fieldName: string) => void;
}

export function SmartFormAssistant({ toolId, prefillData, missingFields }: SmartFormAssistantProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [showInitial, setShowInitial] = useState(true);
  
  // Só aparece automaticamente se preencheu campos OU se usuário parou 10s
  useIdleTimer({
    timeout: 10000,
    onIdle: () => setShowInitial(true),
  });
  
  if (isMobile) {
    return (
      <>
        {/* FAB pequeno */}
        <Button
          className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <Bot className="w-5 h-5" />
          {prefillData.length > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0">
              {prefillData.length}
            </Badge>
          )}
        </Button>
        
        {/* Bottom Sheet */}
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent>
            <AssistantContent prefillData={prefillData} missingFields={missingFields} />
          </DrawerContent>
        </Drawer>
      </>
    );
  }
  
  // Desktop: Card flutuante
  return (
    <AnimatePresence>
      {showInitial && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 w-80"
        >
          <Card className="shadow-lg border-primary/20">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <span className="font-medium">Clara</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowInitial(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <AssistantContent prefillData={prefillData} missingFields={missingFields} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 2.3 Integração no Score Tributário (Piloto)

**Arquivo:** `src/pages/ScoreTributario.tsx`

```typescript
import { useSmartPrefill } from "@/hooks/useSmartPrefill";
import { SmartFormAssistant } from "@/components/welcome/SmartFormAssistant";

export default function ScoreTributario() {
  const { preFilled, missing, loading, hasEnoughData } = useSmartPrefill({ tool: 'score' });
  
  // Auto-preencher campos quando dados disponíveis
  useEffect(() => {
    if (hasEnoughData && !scoreData) {
      preFilled.forEach(field => {
        // Mapeia para os campos do score
        if (field.key === 'regime') {
          updateManualAnswer('resp_situacao_fiscal', mapRegimeToSituacao(field.value));
        }
        if (field.key === 'faturamento') {
          updateManualAnswer('resp_faturamento_faixa', mapFaturamentoToFaixa(field.value));
        }
      });
      
      toast.success(`Clara preencheu ${preFilled.length} campos — confirme os dados`);
    }
  }, [hasEnoughData, preFilled]);

  return (
    <DashboardLayout title="Score Tributário">
      {/* ... conteúdo existente ... */}
      
      {/* Assistente flutuante */}
      <SmartFormAssistant 
        toolId="score-tributario"
        prefillData={preFilled}
        missingFields={missing}
      />
    </DashboardLayout>
  );
}
```

### 2.4 Nova Tabela: `user_ai_journey`

Rastreia o progresso do usuário na jornada AI-First:

```sql
CREATE TABLE user_ai_journey (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Contexto da sessão
  priority TEXT,  -- 'caixa', 'margem', 'compliance', 'crescimento'
  
  -- Plano gerado
  tool_plan JSONB DEFAULT '[]',
  completed_tools TEXT[] DEFAULT '{}',
  
  -- Resultados
  tool_results JSONB DEFAULT '{}',
  
  -- Métricas
  welcome_seen_at TIMESTAMPTZ,
  last_activity TIMESTAMPTZ DEFAULT now(),
  
  -- Feedback
  satisfaction_score INTEGER,  -- 1-5
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE user_ai_journey ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own journey"
  ON user_ai_journey FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);
```

### 2.5 Hook: `useAIJourney`

**Arquivo:** `src/hooks/useAIJourney.ts`

```typescript
export function useAIJourney() {
  const { user } = useAuth();
  
  const { data: journey, isLoading } = useQuery({
    queryKey: ['ai-journey', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_ai_journey')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });
  
  const startJourney = useMutation({
    mutationFn: async (priority: string) => {
      const plan = generateToolPlan(priority); // Função que monta o plano
      await supabase.from('user_ai_journey').upsert({
        user_id: user!.id,
        priority,
        tool_plan: plan,
        welcome_seen_at: new Date().toISOString(),
      });
    },
  });
  
  const completeTool = useMutation({
    mutationFn: async ({ toolId, result }: { toolId: string; result: any }) => {
      await supabase.from('user_ai_journey').update({
        completed_tools: [...(journey?.completed_tools || []), toolId],
        tool_results: { ...(journey?.tool_results || {}), [toolId]: result },
        last_activity: new Date().toISOString(),
      }).eq('user_id', user!.id);
    },
  });
  
  return { journey, isLoading, startJourney, completeTool };
}
```

---

## FASE 3: Expansão e Refinamento

### 3.1 Integrar SmartFormAssistant em Outras Ferramentas

| Ferramenta | Campos pré-preenchidos | Prioridade |
|------------|------------------------|------------|
| DRE | Faturamento, regime, setor | Alta |
| Split Payment | UF, regime, faturamento | Alta |
| Calculadora RTC | UF, município, NCMs identificados | Média |
| Comparativo Regimes | Regime atual, faturamento | Média |

### 3.2 Componente: `ResultExplainer` (Opt-in)

**Arquivo:** `src/components/welcome/ResultExplainer.tsx`

Não é modal automático — é um **botão** que abre explicação:

```typescript
interface ResultExplainerProps {
  toolId: string;
  result: any;
  onClose: () => void;
}

// No componente de resultado (ex: ScoreResults.tsx)
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <h3>Seu Score: {score}/100</h3>
        <Badge>{grade}</Badge>
      </div>
      <Button variant="outline" onClick={() => setShowExplanation(true)}>
        <Bot className="w-4 h-4 mr-2" />
        Clara explica
      </Button>
    </div>
  </CardHeader>
</Card>

{showExplanation && (
  <ResultExplainer 
    toolId="score" 
    result={scoreData}
    onClose={() => setShowExplanation(false)}
  />
)}
```

A explicação vem da Clara via edge function, interpretando os resultados.

### 3.3 Novos Agentes (Apenas Onboarding + Suporte)

**Arquivo:** Migration SQL

```sql
-- Apenas 2 agentes inicialmente (não 3)
INSERT INTO clara_agents (agent_type, name, description, capabilities, trigger_conditions, status)
VALUES 
(
  'onboarding',
  'Agente Onboarding',
  'Recebe novos usuários, configura perfil e cria plano personalizado',
  ARRAY['profile_setup', 'smart_prefill', 'tool_recommendation'],
  ARRAY['user_first_login', 'welcome_page'],
  'active'
),
(
  'support',
  'Agente Suporte',
  'Ajuda durante preenchimento de formulários e explica resultados',
  ARRAY['form_assistance', 'result_explanation', 'field_validation'],
  ARRAY['form_focus', 'help_button', 'result_generated'],
  'active'
);

-- Agente Upgrade fica para DEPOIS de validar os outros
-- (não implementar na fase inicial)
```

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/WelcomeAI.tsx` | Página de entrada AI-First (1 pergunta) |
| `src/components/welcome/PersonalizedToolPlan.tsx` | Exibe o plano gerado |
| `src/components/welcome/SmartFormAssistant.tsx` | Assistente responsivo |
| `src/components/welcome/ResultExplainer.tsx` | Explicação opt-in de resultados |
| `src/components/welcome/index.ts` | Barrel export |
| `src/hooks/useAIJourney.ts` | Gerencia jornada do usuário |

## Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `supabase/functions/clara-assistant/index.ts` | Adicionar busca dinâmica de configs com cache |
| `src/App.tsx` | Adicionar rota `/welcome` |
| `src/components/ProtectedRoute.tsx` | Lógica de redirect para `/welcome` |
| `src/pages/ScoreTributario.tsx` | Integrar SmartFormAssistant |
| `src/hooks/useSmartPrefill.ts` | Expandir para mais ferramentas |

## Migrações SQL

| Migration | Descrição |
|-----------|-----------|
| `create_clara_prompt_configs.sql` | Tabela de configs dinâmicas |
| `populate_plan_responses.sql` | Inserir PLAN_RESPONSES iniciais |
| `create_user_ai_journey.sql` | Tabela de jornada do usuário |
| `insert_agents_onboarding_support.sql` | 2 novos agentes |

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Performance da Edge Function | Cache de 10min + fallback para hardcoded |
| Pré-preenchimento errado | Campos editáveis + toast "confirme os dados" |
| Dados do perfil incompletos | Verificar campos críticos antes de mostrar /welcome |
| Mobile com card fixo | FAB + bottom sheet (não card fixo) |

---

## Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Time to first value | < 60s (da /welcome até primeiro resultado) |
| Taxa de conclusão /welcome | > 80% |
| % formulários com >50% campos preenchidos | > 60% |
| Taxa de edição de campos pré-preenchidos | < 20% (sinal de precisão) |
| Uso do assistente flutuante | 15-30% dos usuários |

---

## Ordem de Implementação

**Sprint 1 - Fundação:**
1. Criar tabela `clara_prompt_configs`
2. Migrar `PLAN_RESPONSES` para banco
3. Atualizar edge function com cache
4. Criar página `/welcome` (1 pergunta)
5. Criar `PersonalizedToolPlan`
6. Atualizar roteamento

**Sprint 2 - Smart Experience:**
1. Expandir `useSmartPrefill`
2. Criar `SmartFormAssistant` responsivo
3. Integrar no Score Tributário
4. Criar tabela `user_ai_journey`
5. Criar hook `useAIJourney`

**Sprint 3 - Expansão:**
1. Integrar SmartFormAssistant em DRE e Split Payment
2. Criar `ResultExplainer` opt-in
3. Inserir agentes Onboarding e Suporte
4. Analytics básicos
