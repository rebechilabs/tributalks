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

function getDiscountPercent(successfulReferrals: number): number {
  if (successfulReferrals >= 10) return 20;
  if (successfulReferrals >= 5) return 15;
  if (successfulReferrals >= 3) return 10;
  if (successfulReferrals >= 1) return 5;
  return 0;
}

function checkLevelUp(previousCount: number, newCount: number): { leveledUp: boolean; newPercent: number; previousPercent: number } {
  const previousPercent = getDiscountPercent(previousCount);
  const newPercent = getDiscountPercent(newCount);
  return {
    leveledUp: newPercent > previousPercent,
    newPercent,
    previousPercent,
  };
}

function getLevelUpNotification(newPercent: number): { title: string; message: string } {
  switch (newPercent) {
    case 5:
      return {
        title: "🎉 Primeiro Desconto!",
        message: "Parabéns! Você conquistou 5% de desconto na mensalidade! Continue indicando para aumentar.",
      };
    case 10:
      return {
        title: "🚀 Nível 2 Desbloqueado!",
        message: "Você subiu para 10% de desconto! Faltam 2 indicações para o próximo nível.",
      };
    case 15:
      return {
        title: "⭐ Nível 3 Desbloqueado!",
        message: "Incrível! Agora você tem 15% de desconto! Faltam 5 indicações para o máximo!",
      };
    case 20:
      return {
        title: "🏆 Nível Máximo!",
        message: "Você atingiu o desconto máximo de 20%! Você é um embaixador top do TribuTalks!",
      };
    default:
      return {
        title: "🚀 Novo Nível!",
        message: `Parabéns! Você subiu para ${newPercent}% de desconto!`,
      };
  }
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

    // STEP 1: Find pending referrals to qualify (new signups with active subscription)
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

    const qualifiedReferrals: string[] = [];
    const rewardedReferrals: string[] = [];
    const rewards: ReferralReward[] = [];

    // Process pending → qualified
    for (const referral of pendingReferrals || []) {
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
        // Mark referral as qualified with timestamp
        const { error: updateError } = await supabase
          .from("referrals")
          .update({
            status: "qualified",
            qualified_at: new Date().toISOString(),
            subscription_started_at: new Date().toISOString(),
          })
          .eq("id", referral.id);

        if (!updateError) {
          qualifiedReferrals.push(referral.id);

          // Create notification for referrer about qualification
          await supabase.from("notifications").insert({
            user_id: referral.referrer_id,
            title: "🎯 Indicação qualificada!",
            message: "Sua indicação assinou um plano! Após 30 dias de assinatura ativa, seu desconto será aplicado.",
            type: "info",
            category: "indicacao",
            action_url: "/indicar",
          });
        }
      }
    }

    // STEP 2: Find qualified referrals that are 30+ days old to reward
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: qualifiedToReward, error: qualifiedError } = await supabase
      .from("referrals")
      .select(`
        id,
        referrer_id,
        referred_id,
        referral_code,
        subscription_started_at
      `)
      .eq("status", "qualified")
      .lt("subscription_started_at", thirtyDaysAgo.toISOString());

    if (qualifiedError) {
      console.error("Failed to fetch qualified referrals:", qualifiedError.message);
    }

    // Process qualified → rewarded
    for (const referral of qualifiedToReward || []) {
      // Verify referred user still has active subscription
      const { data: referredProfile } = await supabase
        .from("profiles")
        .select("subscription_status, plano")
        .eq("user_id", referral.referred_id)
        .maybeSingle();

      if (
        referredProfile?.subscription_status !== "active" ||
        !referredProfile?.plano ||
        referredProfile.plano === "FREE"
      ) {
        // Subscription was cancelled, mark as expired
        await supabase
          .from("referrals")
          .update({ status: "expired" })
          .eq("id", referral.id);
        continue;
      }

      // Increment successful referral count
      const { data: codeData } = await supabase
        .from("referral_codes")
        .select("successful_referrals")
        .eq("user_id", referral.referrer_id)
        .maybeSingle();

      if (codeData) {
        const previousCount = codeData.successful_referrals || 0;
        const successfulCount = previousCount + 1;
        const tier = getDiscountTier(successfulCount);

        // Verifica se subiu de nível
        const levelCheck = checkLevelUp(previousCount, successfulCount);

        // Update successful_referrals count
        await supabase
          .from("referral_codes")
          .update({ successful_referrals: successfulCount })
          .eq("user_id", referral.referrer_id);

        // Notificação especial de novo nível (antes da notificação de recompensa)
        if (levelCheck.leveledUp) {
          const levelNotification = getLevelUpNotification(levelCheck.newPercent);
          await supabase.from("notifications").insert({
            user_id: referral.referrer_id,
            title: levelNotification.title,
            message: levelNotification.message,
            type: "success",
            category: "indicacao",
            action_url: "/indicar",
          });
          console.log(`Level up notification sent: ${previousCount} -> ${successfulCount} (${levelCheck.previousPercent}% -> ${levelCheck.newPercent}%)`);
        }

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
          }

          // Mark as rewarded
          await supabase
            .from("referrals")
            .update({
              status: "rewarded",
              discount_percentage: tier.percent,
              reward_applied_at: new Date().toISOString(),
            })
            .eq("id", referral.id);

          rewardedReferrals.push(referral.id);

          rewards.push({
            referrer_id: referral.referrer_id,
            successful_count: successfulCount,
            discount_percentage: tier.percent,
            coupon_applied: couponApplied,
          });

          // Create notification for referrer about reward
          const notificationMessage = couponApplied
            ? `Parabéns! O desconto de ${tier.percent}% foi aplicado na sua assinatura. Total de ${successfulCount} indicações bem-sucedidas!`
            : `Parabéns! Você tem direito a ${tier.percent}% de desconto. Entre em contato para aplicar.`;

          await supabase.from("notifications").insert({
            user_id: referral.referrer_id,
            title: "🎉 Recompensa liberada!",
            message: notificationMessage,
            type: "success",
            category: "indicacao",
            action_url: "/indicar",
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: "Referrals processed successfully",
        qualified: qualifiedReferrals.length,
        rewarded: rewardedReferrals.length,
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
