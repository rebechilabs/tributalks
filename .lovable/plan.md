
# Eliminacao Completa do Nome "Simpronto"

## Escopo

Renomear todas as ocorrencias de "Simpronto"/"simpronto" no codigo, mantendo rotas/URLs existentes e sem alterar landing page, Stripe ou trial.

## Arquivos a alterar (12 arquivos)

### 1. Tipos e Utilitarios

**`src/types/simpronto.ts`** - Renomear arquivo para `src/types/comparativoRegimes.ts`
- `SimprontoFormData` -> `ComparativoRegimesFormData`
- `SimprontoResult` -> `ComparativoRegimesResult`
- `SimprontoInput` -> `ComparativoRegimesInput`

**`src/utils/simprontoCalculations.ts`** - Renomear arquivo para `src/utils/comparativoRegimesCalculations.ts`
- `calcularSimpronto()` -> `calcularComparativoRegimes()`
- Atualizar imports de tipos

### 2. Componentes (pasta `src/components/simpronto/` -> `src/components/comparativo-regimes/`)

Renomear a pasta e os arquivos internos:

**`index.ts`**
- `SimprontoWizard` -> `ComparativoRegimesWizard`
- `SimprontoResults` -> `ComparativoRegimesResults`

**`SimprontoWizard.tsx` -> `ComparativoRegimesWizard.tsx`**
- Renomear interface `SimprontoWizardProps` -> `ComparativoRegimesWizardProps`
- Renomear funcao `SimprontoWizard` -> `ComparativoRegimesWizard`
- Atualizar queryKey `'dre-prefill-simpronto'` -> `'dre-prefill-comparativo-regimes'`
- Atualizar todos os imports de tipos

**`SimprontoResults.tsx` -> `ComparativoRegimesResults.tsx`**
- Renomear interface e funcao
- Atualizar imports

**`ComparisonChart.tsx`** - Atualizar imports de tipos
**`ComparisonTable.tsx`** - Atualizar imports de tipos
**`RecommendationCard.tsx`** - Atualizar imports de tipos
**`DespesasOperacionaisSelector.tsx`** - Sem mudancas (nao usa "simpronto")

### 3. Pagina Principal

**`src/pages/dashboard/SimprontoPage.tsx`** - Renomear para `ComparativoRegimesPage.tsx`
- Atualizar imports dos componentes e tipos
- `calcularSimpronto` -> `calcularComparativoRegimes`
- `simpronto_simulations` (tabela DB) - MANTER como esta (nao renomear tabela)
- `FeatureGate feature="simpronto"` -> `FeatureGate feature="comparativo_regimes"`

### 4. Hook de Feature Access

**`src/hooks/useFeatureAccess.ts`**
- Remover `'simpronto'` do type `FeatureKey` (ja existe `'comparativo_regimes'`)
- Remover `simpronto: { minPlan: 'STARTER' }` do `FEATURE_CONFIG` (ja existe `comparativo_regimes`)
- Em `CLARA_TOOL_SCOPE.STARTER`: trocar `'simpronto'` por `'comparativo_regimes'`

### 5. Router

**`src/App.tsx`**
- Renomear import `SimprontoPage` -> `ComparativoRegimesPage`
- Atualizar path do lazy import
- Atualizar `<SimprontoPage />` -> `<ComparativoRegimesPage />`
- Manter redirect de `/dashboard/entender/simpronto` -> `/dashboard/entender/comparativo`

### 6. Pagina Entender

**`src/pages/dashboard/EntenderPage.tsx`**
- `statusKey: 'simpronto'` -> `statusKey: 'comparativo'`
- `case 'simpronto':` -> `case 'comparativo':`
- Remover comentario "Simpronto requires DRE"

### 7. Landing Page (MUDANCA MINIMA)

**`src/components/landing/PricingSection.tsx`**
- Linha 51: `"Simpronto 2027"` -> `"Comparativo 2027"` (apenas o texto visivel, NAO altera botoes)

## Tabela do banco de dados

A tabela `simpronto_simulations` no banco permanece com o nome atual. Renomear tabelas em producao e algo arriscado e desnecessario - o nome e interno. Apenas o codigo referencia o nome da tabela via string, que sera mantida.

## O que NAO muda

- Rotas/URLs existentes (mantidas)
- Redirect legado `/dashboard/entender/simpronto` (mantido)
- Tabela `simpronto_simulations` no banco (mantida)
- Botoes da landing page
- Configuracoes do Stripe
- Logica de trial de 7 dias
- Logica interna de calculo (apenas nomes)
- `src/integrations/supabase/types.ts` (auto-gerado, nao editavel)

## Secao tecnica: Ordem de execucao

1. Criar novos arquivos (tipos, utils, componentes) com nomes novos
2. Atualizar imports em todos os consumidores
3. Atualizar useFeatureAccess (remover key duplicada)
4. Atualizar App.tsx e EntenderPage.tsx
5. Atualizar PricingSection.tsx (texto visivel)
6. Remover arquivos antigos (implicitamente ao reescrever)

Total: ~12 arquivos alterados, 0 mudancas no banco de dados.
