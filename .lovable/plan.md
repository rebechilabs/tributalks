
# Atualizar Link Stripe do Pacote Clara IA - 50 Créditos

## Resumo

Substituir o placeholder `/cadastro?credits=50` pelo link real do Stripe para o pacote Clara IA de 50 créditos por dia (R$ 130,00).

---

## Mudança

| Arquivo | Linha | Valor Atual | Novo Valor |
|---------|-------|-------------|------------|
| `src/config/site.ts` | 17 | `/cadastro?credits=50` | `https://buy.stripe.com/cNibIU2R4e9Ub2366Gbo408` |

---

## Código

```typescript
// Antes (linha 17)
CREDITS_50: "/cadastro?credits=50",

// Depois
CREDITS_50: "https://buy.stripe.com/cNibIU2R4e9Ub2366Gbo408",
```

---

## Resultado

Quando usuários clicarem no botão de compra do pacote de 50 créditos Clara IA, serão redirecionados diretamente para o checkout do Stripe no valor de R$ 130,00.
