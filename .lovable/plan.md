
# Atualizar Link Stripe do Plano Professional Anual

## Resumo

Substituir o placeholder `/cadastro?plan=professional&billing=annual` pelo link real do Stripe para o plano Professional Anual (R$ 29.970,00/ano).

---

## Mudança

| Arquivo | Linha | Valor Atual | Novo Valor |
|---------|-------|-------------|------------|
| `src/config/site.ts` | 12 | `/cadastro?plan=professional&billing=annual` | `https://buy.stripe.com/3cI9AM3V89TEgmn2Uubo406` |

---

## Código

```typescript
// Antes (linha 12)
PROFESSIONAL_ANUAL: "/cadastro?plan=professional&billing=annual",

// Depois
PROFESSIONAL_ANUAL: "https://buy.stripe.com/3cI9AM3V89TEgmn2Uubo406",
```

---

## Resultado

Quando usuários clicarem no botão de assinatura anual do plano Professional, serão redirecionados diretamente para o checkout do Stripe no valor de R$ 29.970,00/ano.
