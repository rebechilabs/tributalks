
# Plano de Implementação: Mercado Pago

## Visão Geral

Adicionar o **Mercado Pago** como opção alternativa de pagamento ao lado do Stripe já existente. Isso permitirá que clientes brasileiros paguem com métodos locais como PIX, boleto e cartões nacionais com parcelamento.

---

## Por que Mercado Pago?

| Vantagem | Detalhes |
|----------|----------|
| **PIX instantâneo** | Pagamento em segundos, sem taxa para o cliente |
| **Boleto bancário** | Opção para quem não tem cartão de crédito |
| **Parcelamento local** | Até 12x com taxas menores que Stripe |
| **Preferência do brasileiro** | 80% dos e-commerces BR usam MP |

---

## Arquitetura Técnica

```text
+------------------------------------------------------------------+
|                    Fluxo de Pagamento                             |
+------------------------------------------------------------------+
|                                                                   |
|  Usuário escolhe plano                                            |
|         |                                                         |
|         v                                                         |
|  +----------------+                                               |
|  | Selecionar     |                                               |
|  | Gateway        |                                               |
|  +-------+--------+                                               |
|          |                                                        |
|    +-----+-----+                                                  |
|    |           |                                                  |
|    v           v                                                  |
| [Stripe]    [Mercado Pago]                                        |
|    |           |                                                  |
|    v           v                                                  |
| Payment     Preference API                                        |
| Links       (Edge Function)                                       |
|    |           |                                                  |
|    v           v                                                  |
| stripe-     mercadopago-                                          |
| webhook     webhook                                               |
|    |           |                                                  |
|    +-----+-----+                                                  |
|          |                                                        |
|          v                                                        |
|  +----------------+                                               |
|  | profiles       |                                               |
|  | (plano, status)|                                               |
|  +----------------+                                               |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Banco de Dados

### Tabela existente `profiles` - campos a adicionar:

```sql
-- Adicionar campos para Mercado Pago
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  mp_customer_id TEXT,
  mp_subscription_id TEXT,
  payment_provider TEXT DEFAULT 'stripe'; -- 'stripe' ou 'mercadopago'
```

### Nova tabela `mp_subscription_events` (log de eventos):

```sql
CREATE TABLE mp_subscription_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mp_event_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## Edge Functions

### 1. `mercadopago-create-preference`

Cria uma preferência de pagamento (equivalente ao checkout do Stripe).

```typescript
// Entrada
{
  plan: 'NAVIGATOR' | 'PROFESSIONAL',
  billing: 'monthly' | 'annual',
  user_email: string,
  user_id: string
}

// Saída
{
  init_point: string,  // URL para redirecionar o usuário
  preference_id: string
}
```

**Lógica:**
1. Recebe plano e período
2. Busca preço correspondente
3. Cria preference na API do Mercado Pago
4. Retorna URL de checkout

### 2. `mercadopago-webhook`

Processa notificações de pagamento do Mercado Pago.

**Eventos tratados:**
- `payment.approved` - Pagamento aprovado (ativa plano)
- `payment.pending` - Pagamento pendente (PIX/Boleto aguardando)
- `payment.rejected` - Pagamento rejeitado
- `subscription_preapproval.authorized` - Assinatura ativada
- `subscription_preapproval.paused` - Assinatura pausada
- `subscription_preapproval.cancelled` - Assinatura cancelada

**Lógica (similar ao stripe-webhook):**
1. Valida assinatura do webhook
2. Extrai dados do evento
3. Busca usuário por `external_reference` (user_id)
4. Atualiza `profiles` com plano correto
5. Registra evento em `mp_subscription_events`

---

## Configuração de Secrets

Adicionar ao projeto:

| Secret | Descrição |
|--------|-----------|
| `MERCADOPAGO_ACCESS_TOKEN` | Token de acesso da conta MP |
| `MERCADOPAGO_PUBLIC_KEY` | Chave pública (para frontend) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Segredo para validar webhooks |

---

## Componentes de UI

### 1. Atualizar `PricingSection.tsx`

Adicionar seletor de método de pagamento:

```text
+------------------------------------------+
|  Como você prefere pagar?                |
|                                          |
|  [💳 Cartão Internacional (Stripe)]      |
|  [🇧🇷 PIX, Boleto ou Cartão (Mercado Pago)] |
|                                          |
+------------------------------------------+
```

### 2. Componente `PaymentGatewaySelector`

Novo componente para escolher gateway:

```typescript
interface PaymentGatewaySelectorProps {
  plan: 'NAVIGATOR' | 'PROFESSIONAL';
  billing: 'monthly' | 'annual';
  onSelect: (gateway: 'stripe' | 'mercadopago') => void;
}
```

### 3. Atualizar `config/site.ts`

Adicionar links do Mercado Pago:

```typescript
MERCADOPAGO_PREFERENCES: {
  NAVIGATOR_MENSAL: null, // Será gerado dinamicamente
  NAVIGATOR_ANUAL: null,
  PROFESSIONAL_MENSAL: null,
  PROFESSIONAL_ANUAL: null,
},
MERCADOPAGO_PRICES: {
  NAVIGATOR_MENSAL: 997,
  NAVIGATOR_ANUAL: 9970,
  PROFESSIONAL_MENSAL: 2997,
  PROFESSIONAL_ANUAL: 29970,
}
```

---

## Fluxo de Checkout Mercado Pago

1. Usuário clica em "Assinar" e escolhe "Mercado Pago"
2. Frontend chama Edge Function `mercadopago-create-preference`
3. Edge Function cria preference na API MP com:
   - Itens (plano escolhido)
   - `external_reference` = user_id
   - `notification_url` = URL do webhook
   - `back_urls` (success, pending, failure)
4. Usuário é redirecionado para checkout do Mercado Pago
5. Após pagamento, MP envia notificação para webhook
6. Webhook atualiza `profiles` com plano ativo

---

## Arquivos a Criar/Modificar

### Novos arquivos:

```
supabase/functions/mercadopago-create-preference/index.ts
supabase/functions/mercadopago-webhook/index.ts
src/components/payment/PaymentGatewaySelector.tsx
src/hooks/useMercadoPago.ts
```

### Arquivos a modificar:

```
src/config/site.ts                    # Adicionar configurações MP
src/components/landing/PricingSection.tsx  # Adicionar seletor de gateway
supabase/migrations/xxx_add_mercadopago_fields.sql
```

---

## Roadmap de Implementação

### Fase 1: Fundação (1 dia)
- Criar migração SQL (campos MP em profiles, tabela de eventos)
- Criar Edge Function `mercadopago-create-preference`
- Configurar secrets do Mercado Pago

### Fase 2: Webhook (1 dia)
- Criar Edge Function `mercadopago-webhook`
- Testar com sandbox do MP
- Validar atualização de planos

### Fase 3: UI (1 dia)
- Criar `PaymentGatewaySelector`
- Atualizar `PricingSection` com opção MP
- Adicionar fluxo de redirecionamento

### Fase 4: Testes e Deploy (1 dia)
- Testar fluxo completo em sandbox
- Configurar produção no MP
- Deploy e monitoramento

---

## Preços no Mercado Pago

| Plano | Mensal | Anual |
|-------|--------|-------|
| Navigator | R$ 997 | R$ 9.970 |
| Professional | R$ 2.997 | R$ 29.970 |

---

## Considerações Técnicas

1. **Assinaturas recorrentes:** O Mercado Pago tem API de assinaturas (`preapproval`), mas é mais complexa que o Stripe. Para MVP, podemos usar pagamentos únicos + renovação manual ou lembrete.

2. **PIX:** Funciona como pagamento único. Para assinaturas, o cliente recebe lembrete mensal.

3. **Boleto:** Tem prazo de 3 dias para pagamento. O plano só ativa após compensação.

4. **Webhook validation:** O MP usa assinatura `x-signature` diferente do Stripe. Implementar validação específica.

5. **Ambiente sandbox:** Testar com credenciais de teste antes de produção.

---

## Próximos Passos Após Aprovação

1. Solicitar configuração das secrets do Mercado Pago
2. Criar migração SQL para novos campos
3. Desenvolver Edge Function `mercadopago-create-preference`
4. Desenvolver Edge Function `mercadopago-webhook`
5. Atualizar UI com seletor de gateway
6. Testar fluxo completo em sandbox
