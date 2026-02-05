

# Plano: Histórico de Cálculos por CNPJ

## Situação Atual

Atualmente, as simulações e cálculos são salvos **apenas por usuário** (`user_id`), sem distinção de qual empresa (CNPJ) estava selecionada no momento do cálculo.

### Tabelas afetadas:
| Tabela | Tem company_id? | Problema |
|--------|-----------------|----------|
| `simulations` | ❌ Não | Todas as simulações aparecem misturadas |
| `tax_calculations` | ❌ Não | Cálculos da Reforma sem vínculo com empresa |
| `tax_score_history` | ❌ Não | Score não vinculado à empresa |

## Solução Proposta

Adicionar `company_id` nas tabelas de histórico e filtrar por empresa ativa.

### 1. Alterações no Banco de Dados

```sql
-- Adicionar company_id às tabelas de histórico
ALTER TABLE simulations ADD COLUMN company_id UUID REFERENCES company_profile(id) ON DELETE SET NULL;
ALTER TABLE tax_calculations ADD COLUMN company_id UUID REFERENCES company_profile(id) ON DELETE SET NULL;
ALTER TABLE tax_score_history ADD COLUMN company_id UUID REFERENCES company_profile(id) ON DELETE SET NULL;

-- Índices para performance
CREATE INDEX idx_simulations_company ON simulations(company_id);
CREATE INDEX idx_tax_calculations_company ON tax_calculations(company_id);
CREATE INDEX idx_tax_score_history_company ON tax_score_history(company_id);
```

### 2. Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/calculadora/ComparativoRegimes.tsx` | Incluir `company_id` ao salvar simulação |
| `src/pages/calculadora/SplitPayment.tsx` | Incluir `company_id` ao salvar simulação |
| `src/pages/calculadora/CalculadoraRTC.tsx` | Incluir `company_id` ao salvar cálculo |
| `src/pages/calculadora/CalculadoraNBS.tsx` | Incluir `company_id` ao salvar cálculo |
| `src/pages/Historico.tsx` | Filtrar por `currentCompany.id` + mostrar empresa no card |
| `src/components/score/ScoreHistoryChart.tsx` | Filtrar por `company_id` |
| `src/hooks/useUserProgress.ts` | Filtrar queries por empresa |
| `src/hooks/useDashboardData.ts` | Filtrar queries por empresa |

### 3. Fluxo Atualizado

```text
┌────────────────────────────────────────────────────────────────┐
│  USUÁRIO SELECIONA EMPRESA "ACME LTDA" (CNPJ 12.345.678/0001-90)│
│                            ↓                                   │
│     ┌────────────────────────────────────────────────────────┐ │
│     │  Faz uma simulação no Comparativo de Regimes          │ │
│     │  Sistema salva com company_id = ID da ACME            │ │
│     └────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│     ┌────────────────────────────────────────────────────────┐ │
│     │  Troca para empresa "BETA S.A" no seletor             │ │
│     │  Histórico automaticamente filtra para BETA           │ │
│     └────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│     ┌────────────────────────────────────────────────────────┐ │
│     │  Página /historico mostra só simulações da BETA       │ │
│     │  Com badge indicando o CNPJ em cada registro          │ │
│     └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### 4. Exemplo de Código

**Salvando simulação com empresa:**
```typescript
// Em ComparativoRegimes.tsx
import { useCompany } from "@/contexts/CompanyContext";

const { currentCompany } = useCompany();

await supabase.from('simulations').insert([{
  user_id: user.id,
  company_id: currentCompany?.id,  // ← NOVO
  calculator_slug: 'comparativo-regimes',
  inputs: { ... },
  outputs: { ... },
}]);
```

**Filtrando histórico por empresa:**
```typescript
// Em Historico.tsx
const { currentCompany } = useCompany();

let query = supabase
  .from('simulations')
  .select('*')
  .eq('user_id', user.id);

// Filtra pela empresa ativa (se houver)
if (currentCompany?.id) {
  query = query.eq('company_id', currentCompany.id);
}
```

### 5. Experiência do Usuário

- ✅ Ao trocar de empresa, o histórico muda automaticamente
- ✅ Cada card de simulação mostra qual CNPJ foi usado
- ✅ Score history chart mostra evolução específica de cada empresa
- ✅ Registros antigos (sem company_id) continuam visíveis para todos

### 6. Migração de Dados Existentes

Registros existentes terão `company_id = NULL`. Opções:
1. **Manter NULL** - registros antigos aparecem em todas as empresas
2. **Atribuir à primeira empresa** - script preenche com a empresa mais antiga do usuário

**Recomendação:** Opção 1 (manter NULL) é mais segura e não requer script de migração.

