
# Correção de Preço do Plano Starter Mensal

## Objetivo
Atualizar o valor do plano Starter Mensal de R$ 297,00 para R$ 397,00, refletindo o preço real configurado no Mercado Pago.

## Alterações Necessárias

### 1. src/components/landing/PricingSection.tsx
**Corrigir valor do plano Starter Mensal:**
- Linha 37: Mudar `priceMonthly: 297` para `priceMonthly: 397`

### 2. src/config/site.ts
**Atualizar comentário documental:**
- Linha 4: Mudar de `R$297/mês` para `R$397/mês`

## Impacto Visual
Na seção de preços da landing page:
- O plano Starter mostrará **R$397/mês** quando a opção "Mensal" estiver selecionada (antes mostrava R$297)

## Seção Técnica

```typescript
// src/components/landing/PricingSection.tsx - linha 37
// Antes:
priceMonthly: 297,

// Depois:
priceMonthly: 397,
```

```typescript
// src/config/site.ts - linha 4
// Antes:
// Starter - R$297/mês ou R$3.970/ano (7 dias grátis)

// Depois:
// Starter - R$397/mês ou R$3.970/ano (7 dias grátis)
```

## Observação sobre Desconto Anual
Com o novo preço mensal de R$ 397 e o anual de R$ 3.970:
- 12 meses × R$ 397 = R$ 4.764
- Plano anual = R$ 3.970
- **Economia de R$ 794** (~2 meses grátis ✓)

A comunicação de "2 meses grátis" no toggle anual agora está matematicamente correta!
