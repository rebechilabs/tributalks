
# Plano: Corrigir FAQ sobre Cartão de Crédito

## Problema Atual

A FAQ diz:
> "Preciso de cartão para começar?"
> "Não. O plano FREE é completamente gratuito e não requer cartão de crédito..."

Isso está incorreto porque:
1. Não existe mais plano "FREE" - o plano inicial é STARTER
2. O STARTER tem trial de 7 dias, mas **requer cartão de crédito** no Mercado Pago

## Alteração Proposta

**Arquivo:** `src/components/landing/FAQSection.tsx`

**De:**
```typescript
{
  question: "Preciso de cartão para começar?",
  answer: "Não. O plano FREE é completamente gratuito e não requer cartão de crédito. Você só precisa informar dados de pagamento se decidir fazer upgrade para um plano pago.",
}
```

**Para:**
```typescript
{
  question: "Preciso de cartão para começar?",
  answer: "Sim. Para ativar o período de teste gratuito de 7 dias do plano Starter, é necessário cadastrar um cartão de crédito no Mercado Pago. Você pode cancelar a qualquer momento durante o trial sem ser cobrado.",
}
```

## Resultado Esperado

- FAQ reflete a política real de trial com cartão
- Alinhamento com o modelo de precificação atual (STARTER com trial de 7 dias)
- Transparência para o cliente sobre a necessidade de cartão
