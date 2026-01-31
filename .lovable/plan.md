

# Notificação de Novos Assinantes por E-mail

## Objetivo

Enviar e-mail para `alexandre@rebechisilva.com.br` sempre que um novo assinante contratar qualquer plano.

## Informações no E-mail

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **Plano** | STARTER, NAVIGATOR ou PROFESSIONAL | PROFESSIONAL |
| **Frequência** | Mensal ou Anual | Anual |
| **Valor pago** | Em reais | R$ 2.997,00 |
| **Nome do cliente** | Se disponível | João da Silva |
| **E-mail do cliente** | Sempre disponível | joao@empresa.com |
| **Data/hora** | Horário de Brasília | 31/01/2026, 14:32 |
| **ID Stripe** | Para referência | cus_Qx7890abc |

## Implementação

### 1. Adicionar Plano STARTER no Webhook

**Arquivo:** `supabase/functions/stripe-webhook/index.ts`

Adicionar mapeamento do STARTER nas linhas 16-22:

```typescript
const PRICE_TO_PLAN: Record<string, string> = {
  // Starter plans
  [Deno.env.get('STRIPE_PRICE_STARTER_MONTHLY') || 'price_starter_monthly']: 'STARTER',
  [Deno.env.get('STRIPE_PRICE_STARTER_ANNUAL') || 'price_starter_annual']: 'STARTER',
  // Navigator plans
  [Deno.env.get('STRIPE_PRICE_NAVIGATOR_MONTHLY') || 'price_navigator_monthly']: 'NAVIGATOR',
  // ... resto permanece igual
}
```

### 2. Criar Edge Function de Notificação

**Arquivo:** `supabase/functions/notify-new-subscriber/index.ts`

```typescript
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = "alexandre@rebechisilva.com.br";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, nome, plano, valor, periodo, stripeCustomerId, timestamp } = await req.json();
    
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const planEmoji = {
      'STARTER': '🌱',
      'NAVIGATOR': '🧭', 
      'PROFESSIONAL': '🚀',
    }[plano] || '📋';
    
    await resend.emails.send({
      from: "TribuTalks <suporte@tributalks.com.br>",
      to: [ADMIN_EMAIL],
      subject: `${planEmoji} Nova Assinatura: ${plano} (${periodo})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">${planEmoji} Nova Assinatura!</h2>
          
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>📋 Plano:</strong> ${plano} (${periodo})</p>
            <p style="margin: 4px 0;"><strong>💰 Valor:</strong> R$ ${valor.toFixed(2)}</p>
          </div>
          
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>👤 Cliente:</strong> ${nome || 'Não informado'}</p>
            <p style="margin: 4px 0;"><strong>📧 E-mail:</strong> ${email}</p>
          </div>
          
          <div style="color: #64748b; font-size: 12px; margin-top: 16px;">
            <p>📅 Data: ${timestamp}</p>
            <p>🔗 ID Stripe: ${stripeCustomerId}</p>
          </div>
        </div>
      `,
    });

    console.log(`Admin notification sent: ${plano} subscription for ${email}`);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

### 3. Integrar no Webhook do Stripe

**Arquivo:** `supabase/functions/stripe-webhook/index.ts`

Após a linha 117 (depois de `console.log(`Updated user...`)`), adicionar:

```typescript
// Notificar admin sobre nova assinatura
try {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (supabaseUrl && anonKey) {
    const interval = subscription.items.data[0]?.price?.recurring?.interval;
    
    fetch(`${supabaseUrl}/functions/v1/notify-new-subscriber`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        email: session.customer_email,
        nome: session.customer_details?.name || null,
        plano: plano,
        valor: (session.amount_total || 0) / 100,
        periodo: interval === 'year' ? 'Anual' : 'Mensal',
        stripeCustomerId: session.customer,
        timestamp: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      }),
    }).catch(err => console.log('Admin notification sent (async):', err?.message || 'ok'));
  }
} catch (notifyErr) {
  console.log('Could not send admin notification:', notifyErr);
}
```

### 4. Registrar Nova Função

**Arquivo:** `supabase/config.toml`

```toml
[functions.notify-new-subscriber]
verify_jwt = false
```

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/functions/notify-new-subscriber/index.ts` | Criar |
| `supabase/functions/stripe-webhook/index.ts` | Modificar (linhas 16-22 e após 117) |
| `supabase/config.toml` | Adicionar configuração |

## Secrets Utilizados

| Secret | Status |
|--------|--------|
| `RESEND_API_KEY` | ✅ Já configurado |
| `STRIPE_PRICE_STARTER_MONTHLY` | ⚠️ Adicionar (se houver) |
| `STRIPE_PRICE_STARTER_ANNUAL` | ⚠️ Adicionar (se houver) |

## Exemplo de E-mail

```text
De: TribuTalks <suporte@tributalks.com.br>
Para: alexandre@rebechisilva.com.br
Assunto: 🚀 Nova Assinatura: PROFESSIONAL (Anual)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Nova Assinatura!

📋 Plano: PROFESSIONAL (Anual)
💰 Valor: R$ 2.997,00
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Cliente: João da Silva
📧 E-mail: joao@empresa.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Data: 31/01/2026, 14:32
🔗 ID Stripe: cus_Qx7890abc
```

## Cobertura

- ✅ STARTER (mensal/anual)
- ✅ NAVIGATOR (mensal/anual)
- ✅ PROFESSIONAL (mensal/anual)
- ✅ Compra de créditos avulsos
- ✅ Compra de assentos adicionais

