

# Corrigir campos em branco no Comparativo de Regimes

## Problema identificado

Os campos do Comparativo nao estao sendo preenchidos com os dados do DRE/perfil da empresa por causa de verificacoes "falsy" no JavaScript. Quando um valor e `0`, o JavaScript trata como `false`, e o sistema interpreta como "nao tem dado".

Exemplo: se `folha_mensal = 0` no banco, o codigo atual faz `0 ? 0 * 12 : null` que resulta em `null`.

## Mudancas necessarias

### 1. `src/hooks/useSharedCompanyData.ts`
Corrigir as verificacoes de valores numericos para usar `!= null` ao inves de checks falsy:

- `folha_anual`: trocar `c.folha_mensal ? c.folha_mensal * 12 : null` por `c.folha_mensal != null ? c.folha_mensal * 12 : null`
- `compras_insumos_anual`: trocar `c.compras_insumos_mensal ? c.compras_insumos_mensal * 12 : null` por `c.compras_insumos_mensal != null ? c.compras_insumos_mensal * 12 : null`

### 2. `src/components/comparativo-regimes/ComparativoRegimesWizard.tsx`
Corrigir as condicoes do useEffect de preenchimento automatico (linhas 54-69) para usar `!= null` ao inves de checks falsy:

- `shared.faturamento_anual` -> `shared.faturamento_anual != null`
- `shared.folha_anual` -> `shared.folha_anual != null`
- `shared.compras_insumos_anual` -> `shared.compras_insumos_anual != null`
- `shared.cnae_principal` -> `shared.cnae_principal != null`

## Secao tecnica

O problema e um padrao classico de JavaScript: `0` e um valor valido, mas e tratado como `false` em verificacoes booleanas. A correcao usa `!= null` que so retorna false para `null` e `undefined`, aceitando `0` como valor valido.

## O que NAO muda
- Nenhuma logica de calculo
- Nenhuma tabela ou consulta ao banco
- O restante do wizard e dashboard permanecem iguais
