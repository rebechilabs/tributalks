
# Preencher Comparativo de Regimes com dados do DRE

## Problema
O formulário do Comparativo de Regimes usa apenas o `useSharedCompanyData` (que lê da tabela `company_profile`), mas campos importantes como folha de pagamento, compras e insumos estão zerados ou nulos nessa tabela. Enquanto isso, o DRE (`company_dre`) tem dados reais que poderiam ser usados como fallback.

## Solucao

Modificar o `ComparativoRegimesWizard.tsx` para buscar dados do DRE como fonte alternativa quando os campos do `company_profile` estiverem vazios/zerados.

### Campos a preencher do DRE

| Campo do Formulario | Fonte primaria (company_profile) | Fallback DRE |
|---|---|---|
| Faturamento Anual | `faturamento_anual` | `calc_receita_bruta` (anualizar se mensal) |
| Folha de Pagamento | `folha_mensal * 12` | `input_salarios_encargos + input_prolabore` (anualizar) |
| Compras e Insumos | `compras_insumos_mensal * 12` | `input_custo_mercadorias + input_custo_materiais` (anualizar) |
| CNAE | `cnae_principal` | (sem equivalente no DRE) |

### Detalhes tecnicos

1. **`ComparativoRegimesWizard.tsx`**: Adicionar query ao `company_dre` (mais recente, filtrado por `company_id`) dentro do `useEffect` de prefill. Quando o valor do `company_profile` for 0 ou null, usar o valor correspondente do DRE.

2. O DRE armazena valores por periodo (mensal/trimestral/anual). Sera necessario verificar o `period_type` para anualizar corretamente (multiplicar por 12 se mensal, por 4 se trimestral).

3. O banner de autopreenchimento ja existe e continuara funcionando -- so precisa indicar a origem correta via `DataSourceBadge`.
