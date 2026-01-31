

# Melhoria UX: Período Dinâmico nas Perguntas do DRE Wizard

## Contexto

Atualmente o usuário seleciona mês/ano no header (linhas 214-217), mas as perguntas são genéricas:
- "Quanto sua empresa vendeu **neste período**?" (linha 124)
- "Quanto custou o que você vendeu?" (linha 149)
- etc.

## Antes vs Depois

| Antes | Depois |
|-------|--------|
| "Quanto sua empresa vendeu **neste período**?" | "Quanto sua empresa vendeu em **Jan/2026**?" |
| "Quanto custou o que você vendeu?" | "Quanto custou o que você vendeu em **Jan/2026**?" |
| "Quanto você gasta para manter a empresa?" | "Quanto você gastou para manter a empresa em **Jan/2026**?" |
| "Receitas e despesas financeiras" | "Receitas e despesas financeiras de **Jan/2026**" |
| "Como sua empresa paga impostos?" | "Como sua empresa pagou impostos em **Jan/2026**?" |

## Implementação

### Arquivo: `src/components/dre/DREWizard.tsx`

**1. Criar helper para formatar período (após linha 78):**

```tsx
const getPeriodLabel = () => {
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${monthNames[selectedMonth - 1]}/${selectedYear}`;
};
```

**2. Atualizar textos do Step 1 (linha 124):**

| Elemento | Antes | Depois |
|----------|-------|--------|
| Título | "Quanto sua empresa vendeu neste período?" | `Quanto sua empresa vendeu em ${getPeriodLabel()}?` |
| Subtítulo | "Informe os valores totais de vendas do mês selecionado" | `Informe os valores totais de vendas de ${getPeriodLabel()}` |

**3. Atualizar textos do Step 2 (linha 149):**

| Elemento | Antes | Depois |
|----------|-------|--------|
| Título | "Quanto custou o que você vendeu?" | `Quanto custou o que você vendeu em ${getPeriodLabel()}?` |
| Subtítulo | "Custos diretamente ligados aos produtos ou serviços vendidos" | `Custos diretamente ligados às vendas de ${getPeriodLabel()}` |

**4. Atualizar textos do Step 3 (linha 169):**

| Elemento | Antes | Depois |
|----------|-------|--------|
| Título | "Quanto você gasta para manter a empresa?" | `Quanto você gastou para manter a empresa em ${getPeriodLabel()}?` |
| Subtítulo | "Despesas operacionais do dia a dia" | `Despesas operacionais de ${getPeriodLabel()}` |

**5. Atualizar textos do Step 4 (linha 180):**

| Elemento | Antes | Depois |
|----------|-------|--------|
| Título | "Receitas e despesas financeiras" | `Receitas e despesas financeiras de ${getPeriodLabel()}` |
| Subtítulo | "Juros, tarifas bancárias e outros custos financeiros" | `Juros, tarifas e custos financeiros de ${getPeriodLabel()}` |

**6. Atualizar textos do Step 5 (linha 192):**

| Elemento | Antes | Depois |
|----------|-------|--------|
| Título | "Como sua empresa paga impostos?" | `Como sua empresa pagou impostos em ${getPeriodLabel()}?` |
| Subtítulo | "Selecione o regime tributário e informe os impostos pagos" | `Regime tributário e impostos de ${getPeriodLabel()}` |

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/dre/DREWizard.tsx` | Adicionar `getPeriodLabel()` e atualizar textos das 5 etapas |

## Benefícios

- **Clareza imediata**: O usuário sabe exatamente a qual período está respondendo
- **Contexto sempre visível**: Período aparece tanto no header quanto nas perguntas
- **Evita confusão**: Ao preencher múltiplos meses, não há dúvida sobre qual período está sendo editado
- **UX mais pessoal**: Perguntas direcionadas ao período específico

## Resultado Visual Esperado

```text
┌──────────────────────────────────────────────────────────────────┐
│  DRE Inteligente                           [ Jan ▼] [ 2026 ▼]   │
│  Preencha os dados e receba um diagnóstico completo             │
├──────────────────────────────────────────────────────────────────┤
│  ○ ────── ● ────── ○ ────── ○ ────── ○                          │
│  Vendas   Custos  Despesas  Financ.  Impostos                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🛒 Suas Vendas                                                  │
│                                                                  │
│  Quanto sua empresa vendeu em Jan/2026?                          │
│  Informe os valores totais de vendas de Jan/2026                │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │ Vendas de produtos  │  │ Vendas de serviços  │               │
│  │ R$ ____________     │  │ R$ ____________     │               │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

