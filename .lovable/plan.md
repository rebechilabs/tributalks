
# Plano de Implementação: Simpronto

## Resumo Executivo

O **Simpronto** é uma evolução significativa do atual "Comparativo de Regimes", adicionando simulações para as novas regras do Simples Nacional 2027 ("por dentro" e "por fora"). A ferramenta ajudará empresários a tomar decisões estratégicas antecipadas sobre regime tributário.

---

## 1. Estrutura de Arquivos

```text
CRIAR:
├── src/pages/dashboard/SimprontoPage.tsx          # Página principal
├── src/components/simpronto/
│   ├── SimprontoWizard.tsx                        # Wizard de 2 passos
│   ├── SimprontoResults.tsx                       # Tela de resultados
│   ├── RecommendationCard.tsx                     # Card de recomendação destaque
│   ├── ComparisonTable.tsx                        # Tabela comparativa 5 regimes
│   ├── ComparisonChart.tsx                        # Gráfico de barras
│   └── index.ts                                   # Exports

MODIFICAR:
├── src/App.tsx                                    # Adicionar nova rota
├── src/data/menuConfig.ts                         # Substituir "Comparativo" por "Simpronto"
├── src/pages/dashboard/EntenderPage.tsx           # Atualizar card do módulo
├── src/hooks/useRouteInfo.ts                      # Adicionar rota no mapa
```

---

## 2. Arquitetura do Frontend

### 2.1 Wizard de 2 Passos (SimprontoWizard.tsx)

**Passo 1 - Dados da Empresa:**
| Campo | Tipo | Validação |
|-------|------|-----------|
| `faturamento_anual` | Currency input (R$) | Obrigatório, > 0 |
| `folha_pagamento` | Currency input (R$) | Obrigatório, >= 0 |
| `cnae_principal` | Combobox com busca | Obrigatório |

**Passo 2 - Dados Operacionais:**
| Campo | Tipo | Validação |
|-------|------|-----------|
| `compras_insumos` | Currency input (R$) | Obrigatório, >= 0 |
| `margem_lucro` | Slider/Select (%) | Obrigatório, 0-100% |
| `perfil_clientes` | Radio Group (B2B/B2C/Misto) | Obrigatório |

### 2.2 Auto-preenchimento com DRE
- Buscar dados da tabela `company_dre` se existirem
- Pré-preencher: `faturamento_anual` (calc_receita_bruta × 12)
- Pré-preencher: `compras_insumos` (input_custo_mercadorias + input_custo_materiais)
- Mostrar banner amarelo: "Dados do DRE detectados. Ajuste se necessário."

### 2.3 Tela de Resultados (SimprontoResults.tsx)

```text
┌─────────────────────────────────────────────────────────────┐
│  🏆 RECOMENDAÇÃO SIMPRONTO                                  │
│  ────────────────────────────────────────────────────────── │
│  O regime mais econômico para você é:                       │
│  SIMPLES 2027 ("Por Fora")                                  │
│  Economia estimada: R$ 45.000/ano                           │
│  "Como você vende para outras empresas (B2B)..."            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📊 TABELA COMPARATIVA                                      │
│  ────────────────────────────────────────────────────────── │
│  Regime              │ Imposto │ Alíquota │ Créditos       │
│  Simples Nacional    │ R$ X    │ 10,2%    │ R$ 0           │
│  Lucro Presumido     │ R$ Y    │ 11,5%    │ R$ 0           │
│  Lucro Real          │ R$ Z    │ 15,3%    │ R$ 28k         │
│  Simples 2027 (Dentro)│ R$ A   │ 10,2%    │ R$ 0           │
│  Simples 2027 (Fora)*│ R$ B    │ 7,1%+CBS │ R$ 35k  ⭐     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📈 GRÁFICO COMPARATIVO (Recharts BarChart)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Lógica de Cálculo (Frontend-only, sem Edge Function)

A lógica será implementada no frontend para simplicidade e velocidade:

```typescript
interface SimprontoInput {
  faturamento_anual: number;
  folha_pagamento: number;
  cnae_principal: string;
  compras_insumos: number;
  margem_lucro: number;        // 0-1
  perfil_clientes: 'B2B' | 'B2C' | 'MISTO';
}

interface RegimeResult {
  nome: string;
  imposto_anual: number;
  aliquota_efetiva: number;
  creditos_gerados: number;
  vantagem: string;
}

interface SimprontoOutput {
  regimes: RegimeResult[];
  recomendado: string;
  economia_vs_segundo: number;
  justificativa: string;
}
```

### 3.1 Cálculos por Regime

| Regime | Fórmula |
|--------|---------|
| **Simples Nacional** | Tabelas do Anexo I-V baseadas em CNAE e faturamento. Fator R se serviços. |
| **Lucro Presumido** | Presunção (8% comércio, 32% serviços) × (15% IRPJ + 9% CSLL) + PIS/COFINS cumulativo (3,65%) |
| **Lucro Real** | (Lucro × 24%) + PIS/COFINS não-cumulativo (9,25%) - Créditos (9,25% sobre insumos) |
| **Simples 2027 (Dentro)** | Mesma alíquota Simples atual (placeholder para alíquota ajustada) |
| **Simples 2027 (Fora)** | DAS reduzido (−30%) + IBS/CBS (26,5%) − Créditos IBS/CBS (26,5% × insumos) |

### 3.2 Lógica de Recomendação

```typescript
const gerarJustificativa = (recomendado: string, perfil: string): string => {
  const justificativas = {
    'SIMPLES_2027_FORA': perfil === 'B2B' 
      ? 'Como você vende para outras empresas (B2B), a geração de créditos IBS/CBS torna sua empresa mais competitiva.'
      : 'Mesmo vendendo para consumidor final, seu volume de insumos gera economia via créditos.',
    'SIMPLES_2027_DENTRO': 'A simplicidade do regime unificado é ideal para vendas B2C, onde clientes não aproveitam créditos.',
    'LUCRO_REAL': 'Com sua margem e despesas, o Lucro Real permite abater mais custos e aproveitar créditos.',
    'LUCRO_PRESUMIDO': 'A alíquota fixa de presunção oferece menor carga para sua atividade.',
    'SIMPLES_NACIONAL': 'O Simples atual continua sendo a opção mais econômica para seu perfil.',
  };
  return justificativas[recomendado] || 'Análise baseada nos dados informados.';
};
```

---

## 4. Banco de Dados

### 4.1 Criar Tabela `simpronto_simulations`

```sql
CREATE TABLE simpronto_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES user_companies(id) ON DELETE SET NULL,
  
  -- Inputs
  faturamento_anual NUMERIC NOT NULL,
  folha_pagamento NUMERIC NOT NULL DEFAULT 0,
  cnae_principal TEXT,
  compras_insumos NUMERIC NOT NULL DEFAULT 0,
  margem_lucro NUMERIC NOT NULL,
  perfil_clientes TEXT NOT NULL CHECK (perfil_clientes IN ('B2B', 'B2C', 'MISTO')),
  
  -- Outputs (JSON para flexibilidade)
  resultados JSONB NOT NULL,
  regime_recomendado TEXT NOT NULL,
  economia_estimada NUMERIC,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE simpronto_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own simulations"
  ON simpronto_simulations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulations"
  ON simpronto_simulations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own simulations"
  ON simpronto_simulations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulations"
  ON simpronto_simulations FOR DELETE
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_simpronto_user_id ON simpronto_simulations(user_id);
CREATE INDEX idx_simpronto_created_at ON simpronto_simulations(created_at DESC);
```

---

## 5. Alterações nos Arquivos Existentes

### 5.1 App.tsx - Nova Rota

```typescript
// Adicionar import
import SimprontoPage from "./pages/dashboard/SimprontoPage";

// Substituir rota do comparativo
<Route 
  path="/dashboard/entender/simpronto" 
  element={<ProtectedRoute><SimprontoPage /></ProtectedRoute>} 
/>

// Redirect legacy
<Route path="/dashboard/entender/comparativo" element={<Navigate to="/dashboard/entender/simpronto" replace />} />
<Route path="/calculadora/comparativo-regimes" element={<Navigate to="/dashboard/entender/simpronto" replace />} />
```

### 5.2 menuConfig.ts - Substituir Item

```typescript
// Em MENU_PROFESSIONAL_V2, módulo ENTENDER:
{ 
  label: 'Simpronto', 
  href: '/dashboard/entender/simpronto', 
  icon: Scale, 
  description: 'Compare 5 regimes', 
  badge: '2027' 
}
```

### 5.3 EntenderPage.tsx - Atualizar Card

```typescript
{
  title: "Simpronto",
  description: "Compare 5 regimes tributários incluindo Simples 2027.",
  href: "/dashboard/entender/simpronto",
  icon: Scale,
  stepNumber: 3,
  statusKey: 'simpronto' as const,
}
```

### 5.4 useRouteInfo.ts - Adicionar Rota

```typescript
'/dashboard/entender/simpronto': { 
  label: 'Simpronto', 
  group: 'entender',
  groupLabel: 'Entender Meu Negócio',
  parent: '/dashboard/entender',
  relatedPaths: ['/dashboard/entender/dre', '/dashboard/entender/score'],
  icon: Scale
}
```

---

## 6. Componentes UI Utilizados

- **Wizard**: Tabs ou Steps customizado (similar ao DREWizard)
- **Inputs**: Input, Select, RadioGroup do shadcn/ui
- **Resultados**: Card, Table, Badge
- **Gráfico**: Recharts BarChart (já instalado)
- **Tooltips**: Para disclaimers sobre valores 2027

---

## 7. Disclaimers e UX

### 7.1 Avisos sobre 2027

Exibir em destaque:
```text
⚠️ Os valores para "Simples 2027" são simulações baseadas no cenário 
atual da Reforma Tributária (LC 214/2025) e podem sofrer alterações 
conforme regulamentação futura.
```

### 7.2 Tooltip nos Campos 2027
- IBS/CBS: "Alíquota estimada de 26,5% (média nacional)"
- DAS Reduzido: "Estimativa de redução de 30% para optantes 'por fora'"

---

## 8. Sequência de Implementação

| Ordem | Tarefa | Arquivos |
|-------|--------|----------|
| 1 | Criar tabela no banco | Migration SQL |
| 2 | Criar componentes base | SimprontoWizard.tsx, types |
| 3 | Implementar lógica de cálculo | utils/simprontoCalculations.ts |
| 4 | Criar tela de resultados | SimprontoResults.tsx, RecommendationCard |
| 5 | Criar página principal | SimprontoPage.tsx |
| 6 | Atualizar rotas e menu | App.tsx, menuConfig.ts, useRouteInfo.ts |
| 7 | Atualizar EntenderPage | EntenderPage.tsx |
| 8 | Testar fluxo completo | Manual testing |

---

## Seção Técnica

### Tipos TypeScript

```typescript
// src/types/simpronto.ts

export type PerfilClientes = 'B2B' | 'B2C' | 'MISTO';

export type RegimeType = 
  | 'SIMPLES_NACIONAL'
  | 'LUCRO_PRESUMIDO'
  | 'LUCRO_REAL'
  | 'SIMPLES_2027_DENTRO'
  | 'SIMPLES_2027_FORA';

export interface SimprontoFormData {
  // Passo 1
  faturamento_anual: string;
  folha_pagamento: string;
  cnae_principal: string;
  
  // Passo 2
  compras_insumos: string;
  margem_lucro: string;
  perfil_clientes: PerfilClientes | '';
}

export interface RegimeCalculation {
  tipo: RegimeType;
  nome: string;
  imposto_anual: number;
  aliquota_efetiva: number;
  creditos_gerados: number;
  vantagem: string;
  is_elegivel: boolean;
  motivo_inelegibilidade?: string;
}

export interface SimprontoResult {
  regimes: RegimeCalculation[];
  recomendado: RegimeType;
  economia_vs_segundo: number;
  justificativa: string;
  disclaimer: string;
}
```

### Hook para Auto-preenchimento

```typescript
// Dentro de SimprontoWizard.tsx
const { data: dreData } = useQuery({
  queryKey: ['dre-prefill', user?.id],
  queryFn: async () => {
    const { data } = await supabase
      .from('company_dre')
      .select('calc_receita_bruta, input_custo_mercadorias, input_custo_materiais, input_salarios_encargos')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  },
  enabled: !!user?.id,
});

// Efeito para pré-preencher
useEffect(() => {
  if (dreData) {
    setFormData(prev => ({
      ...prev,
      faturamento_anual: ((dreData.calc_receita_bruta || 0) * 12).toString(),
      compras_insumos: ((dreData.input_custo_mercadorias || 0) + (dreData.input_custo_materiais || 0)).toString(),
      folha_pagamento: (dreData.input_salarios_encargos || 0).toString(),
    }));
    setShowPrefillBanner(true);
  }
}, [dreData]);
```

### Constantes de Cálculo

```typescript
// src/utils/simprontoConstants.ts

export const ALIQUOTA_CBS_IBS = 0.265;  // 26.5% estimado
export const REDUCAO_DAS_POR_FORA = 0.30;  // 30% redução
export const LIMITE_SIMPLES = 4800000;  // R$ 4.8M/ano

export const PRESUNCAO_LUCRO: Record<string, number> = {
  comercio: 0.08,
  industria: 0.08,
  servicos: 0.32,
  tecnologia: 0.32,
  outro: 0.16,
};

export const ALIQUOTAS_SIMPLES: Record<string, number[]> = {
  comercio: [0.04, 0.073, 0.095, 0.107, 0.143],
  industria: [0.045, 0.078, 0.10, 0.112, 0.147],
  servicos: [0.06, 0.112, 0.135, 0.16, 0.21],
};

export const FAIXAS_SIMPLES = [360000, 720000, 1800000, 3600000, 4800000];
```
