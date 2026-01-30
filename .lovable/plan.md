
# NEXUS - Centro de Comando Executivo

## Visao Geral

O NEXUS sera um novo modulo premium dentro do Painel Executivo do TribuTalks, apresentando os **8 KPIs mais importantes** para CEOs e CFOs em uma unica tela de comando. Ele conecta dados financeiros (DRE) com dados tributarios (Score, Creditos, Reforma) para gerar insights automaticos acionaveis.

---

## Arquitetura de Componentes

```text
src/pages/Nexus.tsx (nova pagina)
├── src/components/nexus/
│   ├── index.ts
│   ├── NexusHeader.tsx
│   ├── NexusGrid.tsx
│   ├── NexusKpiCard.tsx
│   ├── NexusKpiSkeleton.tsx
│   ├── NexusInsightsSection.tsx
│   └── NexusInsightCard.tsx
└── src/hooks/useNexusData.ts (novo hook)
```

---

## Mapeamento de Dados: Tabelas Existentes para os 8 KPIs

| KPI | Fonte de Dados | Tabela/Campo |
|-----|---------------|--------------|
| 1. Fluxo de Caixa | DRE + Creditos | `company_dre.calc_ebitda` + `credit_analysis_summary.total_potential` |
| 2. Receita Mensal | DRE | `company_dre.calc_receita_bruta` |
| 3. Margem de Contribuicao | DRE | `company_dre.calc_margem_bruta` |
| 4. Margem Liquida | DRE | `company_dre.calc_margem_liquida` + `reforma_impacto_percentual` (projecao 2027) |
| 5. Impacto Tribut. Caixa | DRE | `company_dre.input_impostos_sobre_vendas` |
| 6. Impacto Tribut. Margem | DRE | Calculado: `impostos / receita * 100` |
| 7. Creditos Disponiveis | Credit Summary | `credit_analysis_summary.total_potential` |
| 8. Risco Fiscal | Tax Score | `tax_score.score_total` + `score_grade` |

---

## Estrutura Visual

### Layout Responsivo

- **Desktop (>1024px)**: Grid 2 linhas x 4 colunas
- **Tablet (768-1023px)**: Grid 2x2 com scroll horizontal
- **Mobile (<768px)**: Stack vertical, 1 card por linha

### Paleta de Cores

- Verde (Sucesso): `#10B981` - Tailwind `emerald-500`
- Amarelo (Atencao): `#F59E0B` - Tailwind `amber-500`
- Vermelho (Critico): `#EF4444` - Tailwind `red-500`

---

## Especificacao dos 8 Cards

### Card 1: Fluxo de Caixa (Projetado)
- **Icone**: Wallet
- **Valor**: EBITDA mensal + Creditos recuperaveis (R$)
- **Status**:
  - Verde: > R$ 300k
  - Amarelo: R$ 100k-300k
  - Vermelho: < R$ 100k
- **Variacao**: Delta vs mes anterior (se disponivel)

### Card 2: Receita Mensal
- **Icone**: TrendingUp
- **Valor**: `calc_receita_bruta` formatada
- **Status**:
  - Verde: Crescimento > 5%
  - Amarelo: 0-5%
  - Vermelho: Negativo
- **Variacao**: % vs periodo anterior

### Card 3: Margem de Contribuicao
- **Icone**: Percent
- **Valor**: `calc_margem_bruta`%
- **Status**:
  - Verde: > 40%
  - Amarelo: 25-40%
  - Vermelho: < 25%

### Card 4: Margem Liquida
- **Icone**: Gem
- **Valor**: `calc_margem_liquida`%
- **Alerta especial**: Mostra projecao 2027 com base em `reforma_impacto_percentual`
- **Status**:
  - Verde: > 15%
  - Amarelo: 5-15%
  - Vermelho: < 5%

### Card 5: Impacto Tributario no Caixa
- **Icone**: Building2
- **Valor**: `input_impostos_sobre_vendas` formatado
- **Status**: Baseado em proporcao caixa/impostos
- **Variacao**: Data vencimento aproximada (15 do proximo mes)

### Card 6: Impacto Tributario na Margem
- **Icone**: Scale
- **Valor**: `(impostos / receita) * 100` pp
- **Status**:
  - Verde: < 20pp
  - Amarelo: 20-30pp
  - Vermelho: > 30pp

### Card 7: Creditos Disponiveis
- **Icone**: Lightbulb
- **Valor**: `total_potential` da tabela `credit_analysis_summary`
- **Status**:
  - Verde: < R$ 10k parado
  - Amarelo: R$ 10k-50k
  - Vermelho: > R$ 50k (oportunidade perdida)
- **Acao**: Link para Radar de Creditos

### Card 8: Risco Fiscal (Score)
- **Icone**: Shield
- **Valor**: Score + Nivel (A+, A, B, C, D, E)
- **Status**:
  - Verde: > 700
  - Amarelo: 500-700
  - Vermelho: < 500
- **Acao**: Link para Score Tributario

---

## Sistema de Insights Automaticos

Cada insight e gerado por regras condicionais que cruzam os KPIs:

### Insight 1: Oportunidade de Credito
**Condicao**: `creditos_disponiveis > 30000 AND fluxo_caixa < imposto * 1.2`
**Template**: "Seu caixa esta em R$ {caixa}, mas voce tem R$ {creditos} em creditos disponiveis..."
**Acao**: [Ver Creditos no Radar]

### Insight 2: Alerta de Margem 2027
**Condicao**: `margem_2027 < margem_atual - 2pp`
**Template**: "Sua margem liquida hoje e {atual}%, mas vai cair para {2027}% em 2027..."
**Acao**: [Simular Cenarios]

### Insight 3: Risco de Caixa
**Condicao**: `impostos > caixa_projetado * 0.9`
**Template**: "Voce tem R$ {imposto} de impostos vencendo, mas seu caixa projetado e apenas R$ {caixa}..."
**Acao**: [Ver Projecao]

### Insight 4: Score Baixo
**Condicao**: `score < 600`
**Template**: "Seu Score Tributario esta em {score} ({nivel}). Isso pode dificultar financiamentos..."
**Acao**: [Melhorar Score]

**Priorizacao**: Vermelho > Amarelo > Verde (maximo 3 insights visiveis)

---

## Arquivos a Criar

1. **`src/pages/Nexus.tsx`** - Pagina principal do modulo
2. **`src/hooks/useNexusData.ts`** - Hook para buscar e consolidar dados dos 8 KPIs
3. **`src/components/nexus/index.ts`** - Exportacoes
4. **`src/components/nexus/NexusHeader.tsx`** - Header com logo, titulo, botoes
5. **`src/components/nexus/NexusGrid.tsx`** - Grid responsivo dos 8 cards
6. **`src/components/nexus/NexusKpiCard.tsx`** - Componente de card reutilizavel
7. **`src/components/nexus/NexusKpiSkeleton.tsx`** - Loading state
8. **`src/components/nexus/NexusInsightsSection.tsx`** - Secao de insights
9. **`src/components/nexus/NexusInsightCard.tsx`** - Card de insight individual

---

## Arquivos a Modificar

1. **`src/App.tsx`** - Adicionar rota `/dashboard/nexus`
2. **`src/components/dashboard/Sidebar.tsx`** - Adicionar item de menu "NEXUS"
3. **`src/components/dashboard/MobileNav.tsx`** - Adicionar item de menu mobile
4. **`src/components/executive/index.ts`** - Opcional: reexportar tipos

---

## Ordem de Implementacao

### Etapa 1: Estrutura Base
1. Criar pasta `src/components/nexus/`
2. Criar hook `useNexusData.ts` reutilizando queries do `useExecutiveData`
3. Criar componentes de UI (cards, grid, skeleton)

### Etapa 2: Interface Visual
4. Implementar `NexusKpiCard` com props tipadas
5. Implementar `NexusGrid` com layout responsivo
6. Adicionar animacoes de fade-in (stagger 50ms)

### Etapa 3: Logica de Negocios
7. Implementar calculos de status (verde/amarelo/vermelho)
8. Implementar motor de insights com condicoes
9. Implementar ordenacao por severidade

### Etapa 4: Integracao
10. Criar pagina `Nexus.tsx`
11. Adicionar rotas e navegacao
12. Testar responsividade e loading states

---

## Detalhes Tecnicos

### Interface TypeScript para KpiCard

```typescript
interface NexusKpiCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  formattedValue?: string;
  variation?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    label?: string;
  };
  status: 'success' | 'warning' | 'danger';
  tooltip: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  sparklineData?: number[];
}
```

### Interface para Insight

```typescript
interface NexusInsight {
  id: string;
  type: 'opportunity' | 'alert' | 'critical';
  icon: string;
  message: string;
  action: {
    label: string;
    href: string;
  };
  priority: number;
}
```

### Fontes de Dados (Hook)

O hook `useNexusData` ira consumir os mesmos endpoints do `useExecutiveData`:
- `company_dre` - DRE mais recente
- `tax_score` - Score tributario
- `credit_analysis_summary` - Resumo de creditos
- `identified_credits` - Creditos identificados (fallback)

---

## Criterios de Aceite

- [ ] 8 cards renderizam com dados mockados ou reais
- [ ] Status (verde/amarelo/vermelho) calculado corretamente
- [ ] Insights automaticos aparecem baseados nas condicoes
- [ ] Interface responsiva (desktop, tablet, mobile)
- [ ] Loading states funcionam (skeleton)
- [ ] Botoes de acao navegam corretamente
- [ ] Animacoes de entrada suaves
- [ ] Codigo componentizado e tipado
- [ ] Acesso restrito ao plano Professional+

---

## Restricao de Acesso

O NEXUS sera acessivel apenas para usuarios dos planos **Professional** e **Enterprise**, utilizando a mesma logica de `usePlanAccess` ja implementada no projeto.
