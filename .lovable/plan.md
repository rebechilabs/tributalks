
# Plano: Integração Mercado Pago (Temporário) + Migração Futura para Stripe

## Resumo

Implementar o Mercado Pago como gateway de pagamento inicial, com arquitetura preparada para migração transparente para Stripe quando liberado.

---

## Arquitetura Proposta

```text
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ PricingSection │    │ CreditDisplay │    │ Config/site │         │
│  │  (Payment Links) │    │ (Buy Credits)  │    │ (PAYMENT_LINKS)│         │
│  └───────┬─────┘    └───────┬─────┘    └───────┬─────┘         │
│          │                  │                  │                │
│          └──────────────────┴──────────────────┘                │
│                             │                                   │
│                     PAYMENT_LINKS                               │
│           (MP Checkout Pro URLs ou Edge Function)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MERCADO PAGO                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 1. Checkout Pro (Payment Preference)                        ││
│  │ 2. Assinaturas Recorrentes (Preapproval)                   ││
│  │ 3. Webhooks (IPN - Instant Payment Notification)           ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Edge Functions)                     │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │ mp-create-checkout │    │ mp-webhook       │                  │
│  │ (Cria preferência) │    │ (Processa IPN)   │                  │
│  └────────┬─────────┘    └────────┬─────────┘                  │
│           │                       │                             │
│           └───────────────────────┘                             │
│                       │                                         │
│                       ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                     TABELAS                                 ││
│  │ • mp_subscription_events (logs)                             ││
│  │ • profiles (plano, mp_customer_id, mp_subscription_id)     ││
│  │ • user_credits (saldo de créditos)                          ││
│  │ • credit_purchases (histórico de compras)                   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Componentes a Criar/Modificar

### 1. Novos Secrets Necessários
- `MP_ACCESS_TOKEN` - Token de produção do Mercado Pago
- `MP_PUBLIC_KEY` - Chave pública (opcional, para Checkout Transparente)
- `MP_WEBHOOK_SECRET` - Para validar assinatura dos webhooks (opcional)

### 2. Nova Tabela: `mp_subscription_events`
```sql
CREATE TABLE public.mp_subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mp_event_id text UNIQUE,
  event_type text NOT NULL,
  payload jsonb,
  processed boolean DEFAULT false,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.mp_subscription_events ENABLE ROW LEVEL SECURITY;

-- Apenas service role pode inserir/atualizar (webhook)
CREATE POLICY "Service can manage mp events" ON public.mp_subscription_events
FOR ALL TO service_role USING (true) WITH CHECK (true);
```

### 3. Alterar Tabela `profiles`
```sql
-- Adicionar colunas para Mercado Pago (paralelas às do Stripe)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS mp_customer_id text,
ADD COLUMN IF NOT EXISTS mp_subscription_id text;
```

### 4. Nova Edge Function: `mp-create-checkout/index.ts`
Cria preferência de pagamento ou assinatura no Mercado Pago:
- Recebe: `plan`, `billing_period`, `user_email`
- Retorna: `init_point` (URL do checkout)

### 5. Nova Edge Function: `mp-webhook/index.ts`
Processa notificações IPN do Mercado Pago:
- Eventos de assinatura: `subscription_preapproval`
- Eventos de pagamento: `payment`
- Atualiza `profiles.plano` conforme status

### 6. Atualizar `src/config/site.ts`
```typescript
export const CONFIG = {
  // Gateway ativo (para migração futura)
  PAYMENT_GATEWAY: 'mercadopago' as 'mercadopago' | 'stripe',
  
  // Links Mercado Pago (gerados pela edge function ou URLs diretas)
  MERCADOPAGO_LINKS: {
    STARTER_MENSAL: '/api/mp-checkout?plan=STARTER&period=monthly',
    STARTER_ANUAL: '/api/mp-checkout?plan=STARTER&period=annual',
    NAVIGATOR_MENSAL: '/api/mp-checkout?plan=NAVIGATOR&period=monthly',
    NAVIGATOR_ANUAL: '/api/mp-checkout?plan=NAVIGATOR&period=annual',
    PROFESSIONAL_MENSAL: '/api/mp-checkout?plan=PROFESSIONAL&period=monthly',
    PROFESSIONAL_ANUAL: '/api/mp-checkout?plan=PROFESSIONAL&period=annual',
    CREDITS_10: '/api/mp-checkout?type=credits&amount=10',
    CREDITS_20: '/api/mp-checkout?type=credits&amount=20',
    CREDITS_30: '/api/mp-checkout?type=credits&amount=30',
  },
  
  // Manter links Stripe para migração futura
  STRIPE_PAYMENT_LINKS: {
    // ... (mantidos como estão)
  },
};
```

### 7. Atualizar `PricingSection.tsx`
Lógica condicional para usar o gateway ativo:
```typescript
const link = CONFIG.PAYMENT_GATEWAY === 'mercadopago'
  ? CONFIG.MERCADOPAGO_LINKS[`${plan.name}_${billingPeriod.toUpperCase()}`]
  : CONFIG.STRIPE_PAYMENT_LINKS[`${plan.name}_${billingPeriod.toUpperCase()}`];
```

---

## Fluxo de Assinatura (Mercado Pago)

1. Usuário clica em "Assinar Navigator"
2. Frontend chama edge function `mp-create-checkout`
3. Edge function cria `preapproval` (assinatura) no MP
4. Retorna `init_point` → Usuário é redirecionado
5. Mercado Pago processa o pagamento
6. Webhook `mp-webhook` recebe IPN
7. Edge function atualiza `profiles.plano`

---

## Migração Futura para Stripe

Quando Stripe for liberado:
1. Mudar `CONFIG.PAYMENT_GATEWAY` para `'stripe'`
2. Atualizar Payment Links em `STRIPE_PAYMENT_LINKS`
3. Novos usuários usarão Stripe automaticamente
4. Usuários existentes com MP continuam funcionando (webhooks paralelos)

---

## Preços dos Planos (Mercado Pago)

| Plano | Mensal | Anual |
|-------|--------|-------|
| Starter | R$ 297 | R$ 2.970 |
| Navigator | R$ 1.997 | R$ 19.970 |
| Professional | R$ 2.997 | R$ 29.970 |

| Créditos | Preço |
|----------|-------|
| 10 créditos | R$ 29,90 |
| 20 créditos | R$ 54,90 |
| 30 créditos | R$ 74,90 |

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `supabase/functions/mp-create-checkout/index.ts` | Cria preferência de checkout |
| `supabase/functions/mp-webhook/index.ts` | Processa webhooks IPN |

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/config/site.ts` | Adicionar PAYMENT_GATEWAY e MERCADOPAGO_LINKS |
| `src/components/landing/PricingSection.tsx` | Lógica condicional de gateway |
| `src/hooks/useUserCredits.ts` | Usar links MP para créditos |
| Migração SQL | Criar tabela mp_subscription_events e colunas em profiles |

---

## Requisito do Usuário

Você precisará fornecer o **Access Token** do Mercado Pago. Para obter:
1. Acesse https://www.mercadopago.com.br/developers/panel
2. Crie uma aplicação ou use existente
3. Copie o "Access Token" de produção

---

## Vantagens desta Abordagem

- **PIX integrado**: Mercado Pago oferece PIX nativamente
- **Boleto bancário**: Opção adicional para clientes
- **Parcelamento**: Até 12x no cartão brasileiro
- **Migração transparente**: Flag única para trocar gateways
- **Sem downtime**: Webhooks de ambos gateways coexistem
