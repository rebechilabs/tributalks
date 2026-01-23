import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Map Stripe price IDs to plan names
const PRICE_TO_PLAN: Record<string, string> = {
  // Monthly prices
  [Deno.env.get('STRIPE_PRICE_BASICO_MONTHLY') || 'price_basico_monthly']: 'BASICO',
  [Deno.env.get('STRIPE_PRICE_PRO_MONTHLY') || 'price_pro_monthly']: 'PROFISSIONAL',
  [Deno.env.get('STRIPE_PRICE_PREMIUM_MONTHLY') || 'price_premium_monthly']: 'PREMIUM',
  // Annual prices
  [Deno.env.get('STRIPE_PRICE_BASICO_ANNUAL') || 'price_basico_annual']: 'BASICO',
  [Deno.env.get('STRIPE_PRICE_PRO_ANNUAL') || 'price_pro_annual']: 'PROFISSIONAL',
  [Deno.env.get('STRIPE_PRICE_PREMIUM_ANNUAL') || 'price_premium_annual']: 'PREMIUM',
}

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  const body = await req.text()
  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', errorMessage)
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 })
  }

  console.log('Received Stripe event:', event.type)

  // Log the event
  try {
    await supabaseAdmin.from('subscription_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data.object as any,
    })
  } catch (logError) {
    console.error('Failed to log event:', logError)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const priceId = subscription.items.data[0]?.price?.id
          const plano = priceId ? PRICE_TO_PLAN[priceId] || 'FREE' : 'FREE'
          
          // Find user by email and update
          const { data: profiles, error: findError } = await supabaseAdmin
            .from('profiles')
            .select('user_id')
            .eq('email', session.customer_email)
            .limit(1)

          if (findError || !profiles?.length) {
            console.error('User not found for email:', session.customer_email)
            break
          }

          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              plano,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              subscription_status: 'active',
              subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('user_id', profiles[0].user_id)

          if (updateError) {
            console.error('Failed to update user subscription:', updateError)
          } else {
            console.log(`Updated user ${profiles[0].user_id} to plan ${plano}`)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price?.id
        const plano = priceId ? PRICE_TO_PLAN[priceId] || 'FREE' : 'FREE'

        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            plano: subscription.status === 'active' ? plano : 'FREE',
            subscription_status: subscription.status,
            subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('Failed to update subscription:', updateError)
        } else {
          console.log(`Subscription ${subscription.id} updated to ${subscription.status}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            plano: 'FREE',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('Failed to cancel subscription:', updateError)
        } else {
          console.log(`Subscription ${subscription.id} canceled`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: 'past_due',
            })
            .eq('stripe_subscription_id', invoice.subscription as string)

          if (updateError) {
            console.error('Failed to mark subscription as past_due:', updateError)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Mark event as processed
    await supabaseAdmin
      .from('subscription_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id)

  } catch (processingError) {
    console.error('Error processing webhook:', processingError)
    return new Response(JSON.stringify({ error: 'Processing failed' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
