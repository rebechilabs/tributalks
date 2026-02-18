
# Correção de ICMS-ST e Dupla Contagem PIS/COFINS

## Problema 1: ICMS-ST aparece como ICMS no dashboard

A tabela `credit_rules` tem `tax_type = 'ICMS'` para a regra `SIMPLES_ICMS_ST_001`. O frontend em `useIdentifiedCredits.ts` categoriza por `tax_type`: se for `'ICMS-ST'` vai para `icms_st_potential`, se for `'ICMS'` vai para `icms_potential`. Como o valor no banco esta errado, o credito de ICMS-ST cai na categoria errada.

**Solucao**: Atualizar o registro na tabela `credit_rules` de `tax_type = 'ICMS'` para `tax_type = 'ICMS-ST'` onde `rule_code = 'SIMPLES_ICMS_ST_001'`.

## Problema 2: PIS/COFINS inflado por dupla contagem

Na linha 531 da edge function:
```text
const baseIndevidaPisCofins = faturamentoMonofasico + faturamentoST
```

Produtos que sao monofasicos E com ST (ex: NCM 2202) sao contados em ambos `faturamentoMonofasico` e `faturamentoST`, inflando a base.

Para PIS/COFINS, a base correta e apenas `faturamentoMonofasico` (produtos monofasicos ja incluem os que tambem tem ST). O ICMS-ST usa `faturamentoST` separadamente, o que esta correto.

**Solucao**: Alterar para `const baseIndevidaPisCofins = faturamentoMonofasico`.

## Alteracoes

### 1. Banco de dados
- UPDATE na tabela `credit_rules`: setar `tax_type = 'ICMS-ST'` onde `rule_code = 'SIMPLES_ICMS_ST_001'`

### 2. Edge function `analyze-credits/index.ts`
- Linha 531: trocar `faturamentoMonofasico + faturamentoST` por `faturamentoMonofasico`
- Redeploy da funcao

### Resultado esperado
- PIS/COFINS: R$ 4.596,06
- ICMS-ST: R$ 639,61
- Total: R$ 5.235,67
