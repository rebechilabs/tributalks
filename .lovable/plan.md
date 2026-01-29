

# Plano: Configurar Stripe Payment Links para Produção

## Resumo Executivo

Configurar a integração completa do Stripe para aceitar assinaturas pagas. Isso envolve adicionar os secrets necessários no backend e substituir os Payment Links de teste pelos links de produção.

---

## 1. Status Atual

| Item | Estado | Ação |
|------|--------|------|
| Payment Links de teste | Configurados | Substituir por produção |
| Webhook `stripe-webhook` | Pronto | Falta configurar secrets |
| `STRIPE_SECRET_KEY` | Não configurado | Adicionar |
| `STRIPE_WEBHOOK_SECRET` | Não configurado | Adicionar |
| Price IDs | Placeholders | Adicionar |

---

## 2. Secrets Necessários

Você precisará fornecer os seguintes valores do seu painel do Stripe:

| Secret | Onde encontrar |
|--------|----------------|
| `STRIPE_SECRET_KEY` | Dashboard Stripe → Developers → API Keys → Secret key |
| `STRIPE_WEBHOOK_SECRET` | Dashboard Stripe → Developers → Webhooks → Signing secret |
| `STRIPE_PRICE_NAVIGATOR_MONTHLY` | ID do preço mensal Navigator (ex: `price_1ABC...`) |
| `STRIPE_PRICE_NAVIGATOR_ANNUAL` | ID do preço anual Navigator |
| `STRIPE_PRICE_PROFESSIONAL_MONTHLY` | ID do preço mensal Professional |
| `STRIPE_PRICE_PROFESSIONAL_ANNUAL` | ID do preço anual Professional |
| `STRIPE_PRICE_CREDITS_10` | ID do pacote de 10 créditos |
| `STRIPE_PRICE_CREDITS_20` | ID do pacote de 20 créditos |
| `STRIPE_PRICE_CREDITS_30` | ID do pacote de 30 créditos |

---

## 3. Passos no Painel do Stripe

### 3.1 Criar Produtos e Preços

No Dashboard do Stripe (https://dashboard.stripe.com/products):

**Produto 1: Plano Navigator**
- Nome: "Tributech Navigator"
- Preço Mensal: R$ 697,00/mês (recorrente)
- Preço Anual: R$ 6.970,00/ano (recorrente)

**Produto 2: Plano Professional**
- Nome: "Tributech Professional"
- Preço Mensal: R$ 2.497,00/mês (recorrente)
- Preço Anual: R$ 24.970,00/ano (recorrente)

**Produto 3: Pacotes de Créditos** (pagamento único)
- 10 Créditos: R$ 29,90
- 20 Créditos: R$ 54,90
- 30 Créditos: R$ 74,90

### 3.2 Gerar Payment Links

Para cada preço criado, gerar um Payment Link:
1. Vá em Products → Selecione o produto
2. Clique no preço → "Create payment link"
3. Copie a URL gerada (formato: `https://buy.stripe.com/...`)

### 3.3 Configurar Webhook

No Dashboard do Stripe → Developers → Webhooks:

1. Clique em "Add endpoint"
2. URL: `https://rhhzsmupixdhurricppk.supabase.co/functions/v1/stripe-webhook`
3. Eventos a escutar:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copie o "Signing secret" (começa com `whsec_`)

---

## 4. Implementação

### 4.1 Adicionar Secrets no Backend

Solicitar que o usuário insira os secrets via ferramenta de adição de secrets.

### 4.2 Atualizar Payment Links

Atualizar `src/config/site.ts` com os Payment Links de produção fornecidos pelo usuário.

---

## 5. Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/config/site.ts` | Substituir URLs de teste por produção |
| Backend Secrets | Adicionar 9 secrets do Stripe |

---

## 6. Fluxo de Assinatura (já implementado)

```text
1. Usuário clica em "Assinar Navigator" ou "Assinar Professional"
   └─► Redireciona para Stripe Checkout (Payment Link)
   
2. Usuário completa pagamento
   └─► Stripe envia evento `checkout.session.completed`
   
3. Webhook processa evento
   └─► Busca usuário por email
   └─► Atualiza `profiles.plano` para NAVIGATOR/PROFESSIONAL
   └─► Salva `stripe_customer_id` e `stripe_subscription_id`
   
4. Renovação automática
   └─► Stripe cobra automaticamente
   └─► Webhook atualiza `subscription_period_end`
   
5. Cancelamento
   └─► Evento `subscription.deleted`
   └─► Webhook reverte plano para FREE
```

---

## 7. Próximos Passos

1. **Você precisa criar os produtos no Stripe** seguindo as instruções do passo 3.1
2. **Gerar os Payment Links** para cada preço
3. **Configurar o webhook** e copiar o signing secret
4. **Me fornecer**:
   - Os 4 Payment Links de produção (Navigator mensal/anual, Professional mensal/anual)
   - Os 3 Payment Links de créditos (10, 20, 30)
   - STRIPE_SECRET_KEY (sk_live_...)
   - STRIPE_WEBHOOK_SECRET (whsec_...)
   - Os 7 Price IDs (price_...)

Após você me fornecer esses dados, eu configuro tudo automaticamente no sistema.

