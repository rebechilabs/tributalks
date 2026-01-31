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
  // Starter plans
  [Deno.env.get('STRIPE_PRICE_STARTER_MONTHLY') || 'price_starter_monthly']: 'STARTER',
  [Deno.env.get('STRIPE_PRICE_STARTER_ANNUAL') || 'price_starter_annual']: 'STARTER',
  // Navigator plans
  [Deno.env.get('STRIPE_PRICE_NAVIGATOR_MONTHLY') || 'price_navigator_monthly']: 'NAVIGATOR',
  [Deno.env.get('STRIPE_PRICE_NAVIGATOR_ANNUAL') || 'price_navigator_annual']: 'NAVIGATOR',
  // Professional plans
  [Deno.env.get('STRIPE_PRICE_PROFESSIONAL_MONTHLY') || 'price_professional_monthly']: 'PROFESSIONAL',
  [Deno.env.get('STRIPE_PRICE_PROFESSIONAL_ANNUAL') || 'price_professional_annual']: 'PROFESSIONAL',
  // Legacy - keeping for compatibility
  [Deno.env.get('STRIPE_PRICE_BASICO_MONTHLY') || 'price_basico_monthly']: 'BASICO',
  [Deno.env.get('STRIPE_PRICE_PRO_MONTHLY') || 'price_pro_monthly']: 'PROFISSIONAL',
  [Deno.env.get('STRIPE_PRICE_PREMIUM_MONTHLY') || 'price_premium_monthly']: 'PREMIUM',
  [Deno.env.get('STRIPE_PRICE_BASICO_ANNUAL') || 'price_basico_annual']: 'BASICO',
  [Deno.env.get('STRIPE_PRICE_PRO_ANNUAL') || 'price_pro_annual']: 'PROFISSIONAL',
  [Deno.env.get('STRIPE_PRICE_PREMIUM_ANNUAL') || 'price_premium_annual']: 'PREMIUM',
}

// Map Stripe price IDs to credit amounts (for one-time purchases)
const PRICE_TO_CREDITS: Record<string, number> = {
  [Deno.env.get('STRIPE_PRICE_CREDITS_10') || 'price_credits_10']: 10,
  [Deno.env.get('STRIPE_PRICE_CREDITS_20') || 'price_credits_20']: 20,
  [Deno.env.get('STRIPE_PRICE_CREDITS_30') || 'price_credits_30']: 30,
}

// Map Stripe price IDs to seat purchases
const PRICE_TO_SEATS: Record<string, { seats: number; plan: string }> = {
  [Deno.env.get('STRIPE_PRICE_SEAT_PROFESSIONAL') || 'price_seat_professional']: { seats: 1, plan: 'PROFESSIONAL' },
  [Deno.env.get('STRIPE_PRICE_SEAT_ENTERPRISE') || 'price_seat_enterprise']: { seats: 1, plan: 'ENTERPRISE' },
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
        
        // Handle subscription checkout
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
            
            // Trigger referral processing and admin notification asynchronously
            const supabaseUrl = Deno.env.get('SUPABASE_URL')
            const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
            
            if (supabaseUrl && anonKey) {
              // Process referral rewards
              fetch(`${supabaseUrl}/functions/v1/process-referral-rewards`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${anonKey}`,
                },
              }).catch(err => console.log('Referral processing triggered (async):', err?.message || 'ok'))
              
              // Notify admin about new subscription
              const interval = subscription.items.data[0]?.price?.recurring?.interval
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
                  tipo: 'assinatura',
                }),
              }).catch(err => console.log('Admin notification sent (async):', err?.message || 'ok'))
            }
          }
        }
        
        // Handle one-time credit purchase
        if (session.mode === 'payment') {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
          const priceId = lineItems.data[0]?.price?.id
          const creditsAmount = priceId ? PRICE_TO_CREDITS[priceId] : null
          
          if (creditsAmount) {
            // Find user by email
            const { data: profiles, error: findError } = await supabaseAdmin
              .from('profiles')
              .select('user_id')
              .eq('email', session.customer_email)
              .limit(1)

            if (findError || !profiles?.length) {
              console.error('User not found for email:', session.customer_email)
              break
            }

            const userId = profiles[0].user_id

            // Get current credits or create new record
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
                balance: currentBalance + creditsAmount,
                total_purchased: currentTotal + creditsAmount,
                purchase_count: currentCount + 1,
              })

            if (creditError) {
              console.error('Failed to add credits:', creditError)
            } else {
              console.log(`Added ${creditsAmount} credits to user ${userId}`)
              
              // Notify admin about credit purchase
              const supabaseUrl = Deno.env.get('SUPABASE_URL')
              const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
              if (supabaseUrl && anonKey) {
                fetch(`${supabaseUrl}/functions/v1/notify-new-subscriber`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${anonKey}`,
                  },
                  body: JSON.stringify({
                    email: session.customer_email,
                    nome: session.customer_details?.name || null,
                    plano: 'CRÉDITOS',
                    valor: (session.amount_total || 0) / 100,
                    periodo: 'Avulso',
                    stripeCustomerId: session.customer as string,
                    timestamp: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
                    tipo: 'creditos',
                    quantidade: creditsAmount,
                  }),
                }).catch(err => console.log('Credit purchase notification sent (async):', err?.message || 'ok'))
              }
            }

            // Log the purchase
            await supabaseAdmin
              .from('credit_purchases')
              .insert({
                user_id: userId,
                credits_amount: creditsAmount,
                price_paid: session.amount_total ? session.amount_total / 100 : 0,
                stripe_payment_id: session.payment_intent as string,
                stripe_price_id: priceId,
                status: 'completed',
              })
          }
          
          // Handle seat purchase
          const seatInfo = priceId ? PRICE_TO_SEATS[priceId] : null
          if (seatInfo) {
            // Find user by email
            const { data: profiles, error: findError } = await supabaseAdmin
              .from('profiles')
              .select('user_id, extra_seats_purchased, plano')
              .eq('email', session.customer_email)
              .limit(1)

            if (findError || !profiles?.length) {
              console.error('User not found for seat purchase:', session.customer_email)
              break
            }

            const userId = profiles[0].user_id
            const currentSeats = profiles[0].extra_seats_purchased || 0

            // Verify user has the correct plan for this seat type
            if (profiles[0].plano !== seatInfo.plan) {
              console.error(`User ${userId} tried to buy ${seatInfo.plan} seat but has plan ${profiles[0].plano}`)
              break
            }

            // Add extra seat to profile
            const { error: updateError } = await supabaseAdmin
              .from('profiles')
              .update({
                extra_seats_purchased: currentSeats + seatInfo.seats,
              })
              .eq('user_id', userId)

            if (updateError) {
              console.error('Failed to add seat:', updateError)
            } else {
              console.log(`Added ${seatInfo.seats} seat(s) to user ${userId} (plan: ${seatInfo.plan})`)
              
              // Notify admin about seat purchase
              const supabaseUrl = Deno.env.get('SUPABASE_URL')
              const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
              if (supabaseUrl && anonKey) {
                fetch(`${supabaseUrl}/functions/v1/notify-new-subscriber`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${anonKey}`,
                  },
                  body: JSON.stringify({
                    email: session.customer_email,
                    nome: session.customer_details?.name || null,
                    plano: seatInfo.plan,
                    valor: (session.amount_total || 0) / 100,
                    periodo: 'Avulso',
                    stripeCustomerId: session.customer as string,
                    timestamp: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
                    tipo: 'assento',
                    quantidade: seatInfo.seats,
                  }),
                }).catch(err => console.log('Seat purchase notification sent (async):', err?.message || 'ok'))
              }
            }
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
