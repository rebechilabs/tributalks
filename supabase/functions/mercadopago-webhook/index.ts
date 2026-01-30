import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { createHmac } from "node:crypto"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
}

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Map Mercado Pago preapproval plan IDs to plan names
const PLAN_ID_TO_PLAN: Record<string, string> = {
  // Starter plans
  '8afa4ed679f649fc99fe3ebe6ea6bd94': 'STARTER', // Monthly
  'b816a10f5deb42bd8a92e711f60d5961': 'STARTER', // Annual
  // Navigator plans
  '89e78b22cd71461595f92886fcacfa17': 'NAVIGATOR', // Monthly
  // Professional plans
  '622791ff8aea48febbc1a8643e56fb2b': 'PROFESSIONAL', // Monthly
}

// Map payment external_reference patterns to credit amounts
const CREDIT_PACKAGES: Record<string, number> = {
  'credits_30': 30,
  'credits_50': 50,
  'credits_100': 100,
}

// Verify Mercado Pago webhook signature
function verifySignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  secret: string
): boolean {
  if (!xSignature || !xRequestId || !secret) {
    console.log('Missing signature components, skipping verification')
    return true // Skip verification if secret not configured
  }

  try {
    // Parse x-signature header
    const parts = xSignature.split(',')
    let ts = ''
    let v1 = ''
    
    for (const part of parts) {
      const [key, value] = part.split('=')
      if (key?.trim() === 'ts') ts = value?.trim() || ''
      if (key?.trim() === 'v1') v1 = value?.trim() || ''
    }

    if (!ts || !v1) {
      console.log('Could not parse ts or v1 from signature')
      return false
    }

    // Build manifest string
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
    
    // Generate HMAC SHA256
    const hmac = createHmac('sha256', secret)
    hmac.update(manifest)
    const generatedSignature = hmac.digest('hex')

    const isValid = generatedSignature === v1
    if (!isValid) {
      console.log('Signature mismatch:', { expected: v1, got: generatedSignature })
    }
    return isValid
  } catch (error) {
    console.error('Error verifying signature:', error)
    return false
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log('Received Mercado Pago webhook:', JSON.stringify(body))

    const { type, data, action } = body
    const dataId = data?.id?.toString() || ''

    // Verify webhook signature
    const xSignature = req.headers.get('x-signature')
    const xRequestId = req.headers.get('x-request-id')
    const webhookSecret = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET')

    if (webhookSecret && !verifySignature(xSignature, xRequestId, dataId, webhookSecret)) {
      console.error('Invalid webhook signature')
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Log the event
    try {
      await supabaseAdmin.from('mp_subscription_events').insert({
        mp_event_id: dataId,
        event_type: type,
        action: action || null,
        payload: body,
      })
    } catch (logError) {
      console.error('Failed to log MP event:', logError)
    }

    // Handle different event types
    if (type === 'payment') {
      await handlePaymentEvent(dataId)
    } else if (type === 'subscription_preapproval') {
      await handleSubscriptionEvent(dataId, action)
    } else if (type === 'subscription_authorized_payment') {
      console.log('Subscription payment received, no action needed')
    } else {
      console.log(`Unhandled event type: ${type}`)
    }

    // Mark event as processed
    await supabaseAdmin
      .from('mp_subscription_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('mp_event_id', dataId)

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(JSON.stringify({ error: 'Processing failed' }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function handlePaymentEvent(paymentId: string) {
  const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
  if (!accessToken) {
    console.error('MERCADOPAGO_ACCESS_TOKEN not configured')
    return
  }

  try {
    // Fetch payment details from Mercado Pago API
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch payment:', response.status)
      return
    }

    const payment = await response.json()
    console.log('Payment details:', JSON.stringify(payment))

    // Only process approved payments
    if (payment.status !== 'approved') {
      console.log(`Payment ${paymentId} status: ${payment.status}, skipping`)
      return
    }

    const payerEmail = payment.payer?.email
    const externalReference = payment.external_reference || ''

    // Check if this is a credit package purchase
    for (const [key, credits] of Object.entries(CREDIT_PACKAGES)) {
      if (externalReference.includes(key)) {
        await addCreditsToUser(payerEmail, credits, paymentId, payment.transaction_amount)
        return
      }
    }

    console.log('Payment processed, no specific action matched')

  } catch (error) {
    console.error('Error handling payment event:', error)
  }
}

async function handleSubscriptionEvent(preapprovalId: string, action: string) {
  const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
  if (!accessToken) {
    console.error('MERCADOPAGO_ACCESS_TOKEN not configured')
    return
  }

  try {
    // Fetch subscription (preapproval) details from Mercado Pago API
    const response = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch preapproval:', response.status)
      return
    }

    const preapproval = await response.json()
    console.log('Preapproval details:', JSON.stringify(preapproval))

    const payerEmail = preapproval.payer_email
    const planId = preapproval.preapproval_plan_id
    const status = preapproval.status // authorized, pending, paused, cancelled

    // Find user by email
    const { data: profiles, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, plano')
      .eq('email', payerEmail)
      .limit(1)

    if (findError || !profiles?.length) {
      console.error('User not found for email:', payerEmail)
      return
    }

    const userId = profiles[0].user_id
    const planName = PLAN_ID_TO_PLAN[planId] || 'STARTER'

    if (status === 'authorized') {
      // Subscription active - update user plan
      const nextPaymentDate = preapproval.next_payment_date 
        ? new Date(preapproval.next_payment_date).toISOString()
        : null

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          plano: planName,
          mp_customer_id: preapproval.payer_id?.toString() || null,
          mp_subscription_id: preapprovalId,
          subscription_status: 'active',
          subscription_period_end: nextPaymentDate,
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Failed to update user subscription:', updateError)
      } else {
        console.log(`User ${userId} subscribed to plan ${planName}`)
        
        // Create notification
        await supabaseAdmin.from('notifications').insert({
          user_id: userId,
          title: '🎉 Assinatura Ativada!',
          message: `Seu plano ${planName} está ativo. Aproveite todos os recursos!`,
          type: 'success',
          category: 'sistema',
          action_url: '/dashboard',
        })

        // Trigger referral processing
        try {
          const supabaseUrl = Deno.env.get('SUPABASE_URL')
          const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
          if (supabaseUrl && anonKey) {
            fetch(`${supabaseUrl}/functions/v1/process-referral-rewards`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${anonKey}`,
              },
            }).catch(err => console.log('Referral processing triggered'))
          }
        } catch (refErr) {
          console.log('Could not trigger referral processing')
        }
      }
    } else if (status === 'cancelled' || status === 'paused') {
      // Subscription cancelled/paused - downgrade to FREE
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          plano: 'FREE',
          subscription_status: status === 'cancelled' ? 'canceled' : 'paused',
          mp_subscription_id: null,
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Failed to cancel subscription:', updateError)
      } else {
        console.log(`User ${userId} subscription ${status}`)
        
        // Create notification
        await supabaseAdmin.from('notifications').insert({
          user_id: userId,
          title: status === 'cancelled' ? '⚠️ Assinatura Cancelada' : '⏸️ Assinatura Pausada',
          message: status === 'cancelled' 
            ? 'Sua assinatura foi cancelada. Você ainda pode usar recursos gratuitos.'
            : 'Sua assinatura está pausada. Retome quando quiser.',
          type: 'warning',
          category: 'sistema',
          action_url: '/configuracoes',
        })
      }
    } else if (status === 'pending') {
      console.log(`Subscription ${preapprovalId} is pending approval`)
    }

  } catch (error) {
    console.error('Error handling subscription event:', error)
  }
}

async function addCreditsToUser(email: string, credits: number, paymentId: string, amount: number) {
  // Find user by email
  const { data: profiles, error: findError } = await supabaseAdmin
    .from('profiles')
    .select('user_id')
    .eq('email', email)
    .limit(1)

  if (findError || !profiles?.length) {
    console.error('User not found for credit purchase:', email)
    return
  }

  const userId = profiles[0].user_id

  // Get current credits
  const { data: existingCredits } = await supabaseAdmin
    .from('user_credits')
    .select('balance, total_purchased, purchase_count')
    .eq('user_id', userId)
    .single()

  const currentBalance = existingCredits?.balance || 0
  const currentTotal = existingCredits?.total_purchased || 0
  const currentCount = existingCredits?.purchase_count || 0

  // Update or insert credits
  const { error: creditError } = await supabaseAdmin
    .from('user_credits')
    .upsert({
      user_id: userId,
      balance: currentBalance + credits,
      total_purchased: currentTotal + credits,
      purchase_count: currentCount + 1,
    })

  if (creditError) {
    console.error('Failed to add credits:', creditError)
  } else {
    console.log(`Added ${credits} credits to user ${userId}`)
    
    // Log the purchase
    await supabaseAdmin.from('credit_purchases').insert({
      user_id: userId,
      credits_amount: credits,
      price_paid: amount,
      stripe_payment_id: `mp_${paymentId}`, // Prefix to distinguish from Stripe
      status: 'completed',
    })

    // Create notification
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      title: '💳 Créditos Adicionados!',
      message: `${credits} créditos Clara foram adicionados à sua conta.`,
      type: 'success',
      category: 'sistema',
      action_url: '/tribubot',
    })
  }
}
