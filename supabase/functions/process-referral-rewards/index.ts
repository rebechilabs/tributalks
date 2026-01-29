import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReferralReward {
  referrer_id: string;
  successful_count: number;
  discount_percentage: number;
  coupon_applied: boolean;
}

// Discount tiers with Stripe coupon IDs (will be created if not exist)
const DISCOUNT_TIERS = [
  { min: 10, percent: 20, couponId: "REFERRAL_20" },
  { min: 5, percent: 15, couponId: "REFERRAL_15" },
  { min: 3, percent: 10, couponId: "REFERRAL_10" },
  { min: 1, percent: 5, couponId: "REFERRAL_5" },
];

function getDiscountTier(successfulReferrals: number) {
  for (const tier of DISCOUNT_TIERS) {
    if (successfulReferrals >= tier.min) {
      return tier;
    }
  }
  return null;
}

async function getOrCreateCoupon(stripe: Stripe, tier: { percent: number; couponId: string }) {
  try {
    // Try to retrieve existing coupon
    const coupon = await stripe.coupons.retrieve(tier.couponId);
    return coupon;
  } catch (error) {
    // Coupon doesn't exist, create it
    const coupon = await stripe.coupons.create({
      id: tier.couponId,
      percent_off: tier.percent,
      duration: "once",
      name: `Indicação TribuTalks - ${tier.percent}% OFF`,
    });
    console.log(`Created coupon: ${tier.couponId}`);
    return coupon;
  }
}

async function applyDiscountToSubscription(
  stripe: Stripe,
  subscriptionId: string,
  couponId: string
): Promise<boolean> {
  try {
    await stripe.subscriptions.update(subscriptionId, {
      coupon: couponId,
    });
    console.log(`Applied coupon ${couponId} to subscription ${subscriptionId}`);
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to apply coupon to subscription: ${errorMessage}`);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find pending referrals where referred user has active subscription
    const { data: pendingReferrals, error: fetchError } = await supabase
      .from("referrals")
      .select(`
        id,
        referrer_id,
        referred_id,
        referral_code
      `)
      .eq("status", "pending");

    if (fetchError) {
      throw new Error(`Failed to fetch pending referrals: ${fetchError.message}`);
    }

    if (!pendingReferrals || pendingReferrals.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending referrals to process", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const processedReferrals: string[] = [];
    const rewards: ReferralReward[] = [];

    for (const referral of pendingReferrals) {
      // Check if referred user has active subscription
      const { data: referredProfile } = await supabase
        .from("profiles")
        .select("subscription_status, plano")
        .eq("user_id", referral.referred_id)
        .maybeSingle();

      if (
        referredProfile?.subscription_status === "active" &&
        referredProfile?.plano &&
        referredProfile.plano !== "FREE"
      ) {
        // Mark referral as qualified
        const { error: updateError } = await supabase
          .from("referrals")
          .update({
            status: "qualified",
            qualified_at: new Date().toISOString(),
            subscription_started_at: new Date().toISOString(),
          })
          .eq("id", referral.id);

        if (!updateError) {
          processedReferrals.push(referral.id);

          // Update referral code successful count
          await supabase.rpc("increment_referral_count", {
            referrer_user_id: referral.referrer_id,
          });

          // Get updated count for discount calculation
          const { data: codeData } = await supabase
            .from("referral_codes")
            .select("successful_referrals")
            .eq("user_id", referral.referrer_id)
            .maybeSingle();

          if (codeData) {
            const successfulCount = (codeData.successful_referrals || 0) + 1;
            const tier = getDiscountTier(successfulCount);

            // Update successful_referrals count
            await supabase
              .from("referral_codes")
              .update({ successful_referrals: successfulCount })
              .eq("user_id", referral.referrer_id);

            let couponApplied = false;

            if (tier) {
              // Get referrer's profile to apply discount
              const { data: referrerProfile } = await supabase
                .from("profiles")
                .select("stripe_subscription_id, stripe_customer_id, email")
                .eq("user_id", referral.referrer_id)
                .maybeSingle();

              if (referrerProfile?.stripe_subscription_id) {
                // Ensure coupon exists
                await getOrCreateCoupon(stripe, tier);

                // Apply discount to referrer's subscription
                couponApplied = await applyDiscountToSubscription(
                  stripe,
                  referrerProfile.stripe_subscription_id,
                  tier.couponId
                );

                if (couponApplied) {
                  // Update referral with reward info
                  await supabase
                    .from("referrals")
                    .update({
                      discount_percentage: tier.percent,
                      reward_applied_at: new Date().toISOString(),
                    })
                    .eq("id", referral.id);
                }
              }

              rewards.push({
                referrer_id: referral.referrer_id,
                successful_count: successfulCount,
                discount_percentage: tier.percent,
                coupon_applied: couponApplied,
              });

              // Create notification for referrer
              const notificationMessage = couponApplied
                ? `Sua indicação assinou um plano! O desconto de ${tier.percent}% já foi aplicado na sua próxima renovação.`
                : `Sua indicação assinou um plano! Você tem direito a ${tier.percent}% de desconto. Entre em contato para aplicar.`;

              await supabase.from("notifications").insert({
                user_id: referral.referrer_id,
                title: "🎉 Indicação qualificada!",
                message: notificationMessage,
                type: "success",
                category: "indicacao",
                action_url: "/indicar",
              });
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: "Referrals processed successfully",
        processed: processedReferrals.length,
        rewards,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing referrals:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process referrals" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
