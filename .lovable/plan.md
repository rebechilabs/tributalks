

# Atualizar `src/data/codigos-fiscais.ts` com interfaces enriquecidas do Prompt 3

## O que muda

O arquivo atual tem interfaces simplificadas (`CodigoCSOSN` com 4 campos, `CodigoCST` com 5 campos). O Prompt 3 traz interfaces mais ricas com campos adicionais de relevancia para o Radar de Creditos:

- **`CsosnInfo`** substitui `CodigoCSOSN`: adiciona `icmsJaRecolhidoPorST` (booleano explicito) e `relevanciaPataRadar` (texto explicativo para cada codigo)
- **`CstPisCofinsInfo`** substitui `CodigoCST`: adiciona `tributado`, `tipo` detalhado (monofasico, aliquota_zero, etc.) e `relevanciaPataRadar`
- **`isMonofasicoPorCst()`** muda de `["04","05","06"]` para apenas `"04"` (mais preciso tecnicamente -- CST 05 e 06 nao sao monofasicos, sao ST e aliquota zero respectivamente)

## Impacto

- Unico consumidor externo: `src/lib/simples-nacional-rules.ts` importa `isMonofasicoPorCst` e `isIcmsRecolhidoPorST` -- assinaturas identicas, sem quebra
- `CSOSN_TABLE` e `CST_PIS_COFINS_SAIDA` nao sao importados em nenhum outro arquivo
- Nenhum outro arquivo referencia `CodigoCST` ou `CodigoCSOSN`

## Implementacao

**Arquivo unico:** Reescrever `src/data/codigos-fiscais.ts` com o conteudo exato do Prompt 3, incluindo:
1. Novas interfaces `CsosnInfo` e `CstPisCofinsInfo`
2. `CSOSN_TABLE` com campos enriquecidos (10 codigos)
3. `CST_PIS_COFINS_SAIDA` com campos enriquecidos (11 codigos)
4. Funcoes auxiliares atualizadas (`isMonofasicoPorCst` retorna `cst === "04"` em vez de array)
