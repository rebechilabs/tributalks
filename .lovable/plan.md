

# Corrigir Badge "7 Dias Grátis" Cortado

## Problema

O badge "7 DIAS GRÁTIS" usa posicionamento absoluto com `-top-3` (12px acima do card), mas o container com `overflow-x-auto` na seção de preços está cortando elementos que ultrapassam seus limites.

## Solução

Adicionar padding-top ao container de scroll para dar espaço aos badges que ficam acima dos cards.

---

## Mudança

| Arquivo | Linha | Valor Atual | Novo Valor |
|---------|-------|-------------|------------|
| `src/components/landing/PricingSection.tsx` | 174 | `overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-4` | `overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pt-4 pb-4` |

---

## Código

```tsx
// Antes (linha 174)
<div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-4 md:pb-0 scrollbar-hide">

// Depois  
<div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pt-4 pb-4 md:pb-0 scrollbar-hide">
```

---

## Resultado

O badge "7 DIAS GRÁTIS" ficará totalmente visível, sem cortes, tanto em mobile quanto em desktop.

