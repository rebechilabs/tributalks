
# Plano: Corrigir Título do Professional Cortado pelo Badge

## Diagnóstico

O card do plano **Professional** exibe o badge "MAIS POPULAR" posicionado acima do card com `absolute -top-3`. No entanto, o conteúdo interno (título "PROFESSIONAL") tem apenas `pt-2` de padding superior, o que não deixa espaço suficiente entre o badge e o título.

**Situação atual:**
- Badge: `absolute -top-3` (posicionado 12px acima do card)
- Conteúdo: `pt-2` (apenas 8px de padding superior)
- Resultado: título fica visualmente "colado" no badge

## Solução

Aumentar o padding superior do header dos cards que possuem badges (popular ou trial), de `pt-2` para `pt-4` ou `pt-6`, para criar espaçamento adequado.

## Alteração

**Arquivo:** `src/components/landing/PricingSection.tsx`

**Linha 215** - Alterar de:
```tsx
<div className="text-center mb-4 md:mb-6 pt-2">
```

**Para:**
```tsx
<div className={`text-center mb-4 md:mb-6 ${plan.popular || plan.trialDays ? 'pt-4' : 'pt-2'}`}>
```

Isso aplica padding extra (`pt-4`) apenas nos cards que possuem badges (STARTER com "7 DIAS GRÁTIS" e PROFESSIONAL com "MAIS POPULAR"), mantendo `pt-2` nos demais.

## Resultado Esperado

- Título "PROFESSIONAL" totalmente visível, sem parecer cortado
- Badge "MAIS POPULAR" com espaçamento adequado do título
- Mesmo comportamento aplicado ao badge "7 DIAS GRÁTIS" do STARTER
- Cards sem badge mantêm o espaçamento atual
