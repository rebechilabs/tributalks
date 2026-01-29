import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReferralReward {
  referrer_id: string;
  successful_count: number;
  discount_percentage: number;
}

function getDiscountPercentage(successfulReferrals: number): number {
  if (successfulReferrals >= 10) return 20;
  if (successfulReferrals >= 5) return 15;
  if (successfulReferrals >= 3) return 10;
  if (successfulReferrals >= 1) return 5;
  return 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
            const discount = getDiscountPercentage(successfulCount);

            // Update successful_referrals count
            await supabase
              .from("referral_codes")
              .update({ successful_referrals: successfulCount })
              .eq("user_id", referral.referrer_id);

            rewards.push({
              referrer_id: referral.referrer_id,
              successful_count: successfulCount,
              discount_percentage: discount,
            });

            // Create notification for referrer
            await supabase.from("notifications").insert({
              user_id: referral.referrer_id,
              title: "🎉 Indicação qualificada!",
              message: `Sua indicação assinou um plano! Você agora tem ${discount}% de desconto na sua próxima renovação.`,
              type: "success",
              category: "indicacao",
              action_url: "/indicar",
            });
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
