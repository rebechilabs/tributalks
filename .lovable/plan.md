
# Simplificar Cards do Modulo Precificar

## Mudanca

Reduzir de 3 cards para 2 cards na pagina `/dashboard/precificacao`:

1. **Margem Ativa + PriceGuard** — consolida os dois numa unica entrada (ja que PriceGuard e uma aba dentro de Margem Ativa)
2. **Split Payment** — permanece igual

## Arquivo alterado

`src/pages/dashboard/PrecificacaoPage.tsx`

## Detalhes tecnicos

- Remover o card "PriceGuard" (item 3) do array `tools`
- Renomear o card "Margem Ativa" para **"Margem Ativa + PriceGuard"**
- Atualizar a descricao para refletir ambas as funcionalidades (analise de margens + calculo de novos precos)
- Ajustar `stepNumber` do Split Payment para 2 (ja esta)
- Mudar o grid de `lg:grid-cols-3` para `lg:grid-cols-2` para melhor layout com 2 cards
- Remover import do icone `Shield` (nao mais usado)
- Simplificar `getToolStatus` removendo o caso especifico do `priceguard`
