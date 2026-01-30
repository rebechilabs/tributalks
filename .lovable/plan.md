
# Plano: Correção dos Preços na Landing Page

## Problema

Os preços dos planos Navigator e Professional estão incorretos na seção de preços da LP.

---

## Correções Necessárias

### Arquivo: `src/components/landing/PricingSection.tsx`

| Plano | Atual | Correto |
|-------|-------|---------|
| STARTER | R$ 297/mês • R$ 2.970/ano | ✅ Mantém |
| NAVIGATOR | R$ 1.997/mês • R$ 19.970/ano | **R$ 697/mês • R$ 6.970/ano** |
| PROFESSIONAL | R$ 2.997/mês • R$ 29.970/ano | **R$ 1.997/mês • R$ 19.970/ano** |
| ENTERPRISE | Sob consulta | ✅ Mantém |

---

## Mudanças no Código

### Linhas 58-59 (Navigator)
```typescript
// DE:
priceMonthly: 1997,
priceAnnual: 19970,

// PARA:
priceMonthly: 697,
priceAnnual: 6970,
```

### Linhas 81-82 (Professional)
```typescript
// DE:
priceMonthly: 2997,
priceAnnual: 29970,

// PARA:
priceMonthly: 1997,
priceAnnual: 19970,
```

---

## Resultado Final

| Plano | Mensal | Anual | Trial |
|-------|--------|-------|-------|
| STARTER | R$ 297 | R$ 2.970 | 7 dias grátis |
| NAVIGATOR | R$ 697 | R$ 6.970 | - |
| PROFESSIONAL | R$ 1.997 | R$ 19.970 | - |
| ENTERPRISE | Sob consulta | - | - |

---

## Observação

O desconto "2 meses grátis" para planos anuais permanece correto, pois:
- Navigator: R$ 697 × 10 = R$ 6.970 ✅
- Professional: R$ 1.997 × 10 = R$ 19.970 ✅
