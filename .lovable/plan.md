
# Correção de Preços dos Planos

## Objetivo
Atualizar os valores incorretos de preços no código para refletir os valores reais configurados no Mercado Pago.

## Alterações Necessárias

### 1. src/config/site.ts
**Atualizar comentários documentais:**
- Linha 4: Mudar de `R$2.970/ano` para `R$3.970/ano`
- Linha 10: Mudar de `R$1.997/mês` para `R$2.997/mês`

### 2. src/components/landing/PricingSection.tsx
**Corrigir valor do plano Starter Anual:**
- Linha 38: Mudar `priceAnnual: 2970` para `priceAnnual: 3970`

## Impacto Visual
Quando o usuário selecionar a opção "Anual" na seção de preços:
- O plano Starter mostrará **R$331/mês** (3970÷12) em vez de R$247/mês
- A nota abaixo mostrará **"R$3.970 cobrado anualmente"**

## Seção Técnica

```typescript
// src/config/site.ts - linha 4
// Antes:
// Starter - R$297/mês ou R$2.970/ano (7 dias grátis)

// Depois:
// Starter - R$297/mês ou R$3.970/ano (7 dias grátis)
```

```typescript
// src/config/site.ts - linha 10
// Antes:
// Professional - R$1.997/mês (anual não disponível por enquanto)

// Depois:
// Professional - R$2.997/mês (anual não disponível por enquanto)
```

```typescript
// src/components/landing/PricingSection.tsx - linha 38
// Antes:
priceAnnual: 2970,

// Depois:
priceAnnual: 3970,
```

## Observação
Com o preço anual de R$3.970, o desconto oferecido no plano anual Starter equivale a aproximadamente **1 mês grátis** (comparado aos R$3.564 de 12×R$297). Se você deseja manter a comunicação de "2 meses grátis" no banner, o preço anual deveria ser R$2.970. Posso ajustar a comunicação se necessário.
