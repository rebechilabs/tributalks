
# Atualizar Link Stripe do Pacote Clara IA - 100 Créditos

## Resumo

Substituir o placeholder `/cadastro?credits=100` pelo link real do Stripe para o pacote Clara IA de 100 créditos por dia (R$ 250,00).

---

## Mudança

| Arquivo | Linha | Valor Atual | Novo Valor |
|---------|-------|-------------|------------|
| `src/config/site.ts` | 18 | `/cadastro?credits=100` | `https://buy.stripe.com/7sY14g77kaXIeefbr0bo409` |

---

## Codigo

```typescript
// Antes (linha 18)
CREDITS_100: "/cadastro?credits=100",

// Depois
CREDITS_100: "https://buy.stripe.com/7sY14g77kaXIeefbr0bo409",
```

---

## Resultado

Quando usuarios clicarem no botao de compra do pacote de 100 creditos Clara IA, serao redirecionados diretamente para o checkout do Stripe no valor de R$ 250,00.

---

## Status dos Links de Creditos Clara IA

Apos esta atualizacao, todos os pacotes de creditos Clara IA estarao configurados:

| Pacote | Valor | Status |
|--------|-------|--------|
| 30 creditos/dia | R$ 80,00 | Configurado |
| 50 creditos/dia | R$ 130,00 | Configurado |
| 100 creditos/dia | R$ 250,00 | Sera configurado |
