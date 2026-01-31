

# Remover Frases do Plano Enterprise

## Resumo

Remover 5 itens da lista de features do plano Enterprise na seção de preços.

---

## Features a Remover

| Linha | Feature |
|-------|---------|
| 113 | "Clara AI ilimitada" |
| 114 | "Tudo do Professional +" |
| 115 | "Painel Executivo Multi-empresa" |
| 118 | "API de integração dedicada" |
| 119 | "SLA prioritário" |

---

## Features que Permanecem

Apos a remocao, o plano Enterprise tera apenas:

1. **Consultoria com Rebechi & Silva Advogados**
2. **White Label** (seu logo, cores, dominio)

---

## Codigo

```typescript
// Antes (linhas 112-120)
features: [
  { text: "Clara AI ilimitada", included: true },
  { text: "Tudo do Professional +", included: true },
  { text: "Painel Executivo Multi-empresa", included: true },
  { text: "Consultoria com Rebechi & Silva Advogados", included: true },
  { text: "White Label", included: true, limitText: "(seu logo, cores, domínio)" },
  { text: "API de integração dedicada", included: true },
  { text: "SLA prioritário", included: true },
],

// Depois
features: [
  { text: "Consultoria com Rebechi & Silva Advogados", included: true },
  { text: "White Label", included: true, limitText: "(seu logo, cores, domínio)" },
],
```

---

## Arquivo Alterado

- `src/components/landing/PricingSection.tsx` (linhas 112-120)

