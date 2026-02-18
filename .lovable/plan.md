
# Correção: ICMS-ST no banco de dados

## Situação atual

A linha `baseIndevidaPisCofins = faturamentoMonofasico + faturamentoST` ja esta correta no codigo. Nenhuma alteracao no codigo e necessaria.

## Unica alteracao necessaria

Executar UPDATE na tabela `credit_rules` para corrigir o `tax_type` da regra `SIMPLES_ICMS_ST_001` de `'ICMS'` para `'ICMS-ST'`.

```text
UPDATE credit_rules SET tax_type = 'ICMS-ST' WHERE rule_code = 'SIMPLES_ICMS_ST_001';
```

Depois, redeploy da edge function `analyze-credits` para garantir que esta atualizada.

## Resultado esperado

- ICMS-ST passa a aparecer corretamente no dashboard (nao mais zerado)
- PIS/COFINS permanece inalterado
