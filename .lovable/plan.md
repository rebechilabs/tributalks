
# Plano: Atualizar Pacotes de Créditos Clara

## Resumo

Atualizar os pacotes de créditos da Clara AI de (10, 20, 30) para os novos valores (30, 50, 100) com os preços informados.

---

## Novos Pacotes de Créditos

| Pacote | Créditos | Preço | Preço/Crédito |
|--------|----------|-------|---------------|
| Básico | 30 | R$ 74,90 | R$ 2,50 |
| Intermediário | 50 | R$ 109,90 | R$ 2,20 |
| Premium | 100 | R$ 199,90 | R$ 2,00 |

**Regra**: 1 crédito = 1 conversa com a Clara

---

## Arquivos a Modificar

### 1. `src/hooks/useUserCredits.ts`

Atualizar a função `getCreditPackages()`:

```typescript
export function getCreditPackages(): CreditPackage[] {
  return [
    {
      id: 'credits_30',
      credits: 30,
      price: 74.90,
      priceFormatted: 'R$ 74,90',
      paymentLink: CONFIG.PAYMENT_LINKS.CREDITS_30 || '',
    },
    {
      id: 'credits_50',
      credits: 50,
      price: 109.90,
      priceFormatted: 'R$ 109,90',
      paymentLink: CONFIG.PAYMENT_LINKS.CREDITS_50 || '',
    },
    {
      id: 'credits_100',
      credits: 100,
      price: 199.90,
      priceFormatted: 'R$ 199,90',
      paymentLink: CONFIG.PAYMENT_LINKS.CREDITS_100 || '',
    },
  ];
}
```

### 2. `src/config/site.ts`

Atualizar as chaves de links de pagamento:

```typescript
PAYMENT_LINKS: {
  // ... planos existentes ...
  
  // Pacotes de créditos Clara (1 crédito = 1 conversa)
  CREDITS_30: "/cadastro",   // R$ 74,90 - 30 créditos
  CREDITS_50: "/cadastro",   // R$ 109,90 - 50 créditos  
  CREDITS_100: "/cadastro",  // R$ 199,90 - 100 créditos
  
  // ... restante ...
}
```

---

## Correção Adicional

No arquivo `useUserCredits.ts`, também corrigir o mapeamento legado duplicado (linha 53):

```typescript
// Atual (incorreto - duplicado do useFeatureAccess.ts)
'BASICO': 'NAVIGATOR'

// Correto (deve manter consistência)
'BASICO': 'STARTER'
```

---

## Próximo Passo

Após aprovação, você poderá fornecer os **preference-ids do Mercado Pago** para cada pacote, e eu configurarei os links de pagamento reais.
