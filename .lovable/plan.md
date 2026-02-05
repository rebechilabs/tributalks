
# Plano: Adicionar Campo de Despesas com Análise de Creditamento PIS/COFINS

## Objetivo
Adicionar um novo campo "Despesas Operacionais" no wizard do Comparativo de Regimes, permitindo que o usuário informe gastos como energia, marketing, combustível, etc. O sistema calculará o potencial de crédito de PIS/COFINS sobre essas despesas, deixando claro que a análise é subjetiva e requer validação profissional.

## O que será feito

### 1. Novo Campo no Formulário (Passo 2)
- Adicionar campo "Despesas Operacionais" (R$)
- Incluir exemplos: energia elétrica, combustíveis, marketing, manutenção
- Exibir alerta amarelo explicando a subjetividade do creditamento

### 2. Lógica de Cálculo
- Despesas operacionais poderão gerar crédito de PIS/COFINS (9,25%) no Lucro Real
- Aplicar fator de "essencialidade" conservador (estimativa de 50%) para refletir a subjetividade
- Os créditos aparecerão na comparação, mas com ressalvas claras

### 3. Alertas e Disclaimers
- Exibir alerta no formulário: "A creditação de despesas é subjetiva e depende da comprovação de essencialidade e relevância para a atividade. Consulte um advogado tributarista."
- Adicionar nota nos resultados sobre a natureza educativa da análise

---

## Detalhes Técnicos

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/types/simpronto.ts` | Adicionar `despesas_operacionais` ao `SimprontoFormData` e `SimprontoInput` |
| `src/components/simpronto/SimprontoWizard.tsx` | Adicionar campo de despesas no Passo 2 com alerta de subjetividade |
| `src/utils/simprontoCalculations.ts` | Incluir despesas no cálculo de créditos do Lucro Real (com fator de 50%) |
| `src/pages/dashboard/SimprontoPage.tsx` | Passar o novo campo para a mutation de salvamento |
| Migração SQL | Adicionar coluna `despesas_operacionais` na tabela `simpronto_simulations` |

### Novo Campo no Wizard
```text
┌─────────────────────────────────────────────────────────────┐
│ Despesas Operacionais (energia, marketing, combustível)    │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ R$ [                                                   ]││
│ └─────────────────────────────────────────────────────────┘│
│ Despesas essenciais à atividade podem gerar crédito        │
│                                                             │
│ ⚠️ Atenção: A creditação de despesas para PIS/COFINS é     │
│ subjetiva e depende da comprovação de que são essenciais   │
│ e relevantes à atividade da empresa. Esta análise requer   │
│ parecer de um advogado tributarista habilitado.            │
└─────────────────────────────────────────────────────────────┘
```

### Fórmula de Crédito (Lucro Real)
```
Crédito Potencial = despesas_operacionais × 9,25% × 50% (fator conservador)
```

O fator de 50% é uma estimativa conservadora, refletindo que nem todas as despesas são automaticamente aceitas pela Receita Federal.
