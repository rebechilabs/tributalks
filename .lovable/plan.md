
# Plano: Atualizar Informações do Plano Professional

## Alterações Solicitadas

| Campo | Valor Atual | Novo Valor |
|-------|-------------|------------|
| Preço mensal | R$ 1.997/mês | R$ 2.997/mês |
| Preço anual | R$ 19.970/ano | R$ 29.970/ano |
| CNPJs/Usuários | 5 CNPJs • 5 Usuários | 5 CNPJs • 4 Usuários |

## Arquivo a Modificar

**`src/components/landing/PricingSection.tsx`** (linhas 81-85)

```tsx
// De:
priceMonthly: 1997,
priceAnnual: 19970,
highlighted: true,
popular: true,
cnpjLimit: "5 CNPJs • 5 Usuários",

// Para:
priceMonthly: 2997,
priceAnnual: 29970,
highlighted: true,
popular: true,
cnpjLimit: "5 CNPJs • 4 Usuários",
```

## Impacto

- A seção de preços da landing page exibirá o novo valor de R$ 2.997/mês
- O plano anual será calculado como R$ 29.970/ano (10x mensal, equivalente a 2 meses grátis)
- O limite de usuários será atualizado para 4
