
# Atualizar Link Stripe do Plano Starter Anual

## Resumo

Substituir o placeholder `/cadastro?plan=starter&billing=annual` pelo link real do Stripe para o plano Starter Anual (R$ 3.970/ano).

---

## Mudança

| Arquivo | Linha | Valor Atual | Novo Valor |
|---------|-------|-------------|------------|
| `src/config/site.ts` | 6 | `/cadastro?plan=starter&billing=annual` | `https://buy.stripe.com/00wbIU4Zc5Do1rt1Qqbo401` |

---

## Código

```typescript
// Antes (linha 6)
STARTER_ANUAL: "/cadastro?plan=starter&billing=annual",

// Depois
STARTER_ANUAL: "https://buy.stripe.com/00wbIU4Zc5Do1rt1Qqbo401",
```

---

## Resultado

Quando usuários clicarem no botão de assinatura anual do plano Starter, serão redirecionados diretamente para o checkout do Stripe.
