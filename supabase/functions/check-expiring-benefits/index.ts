import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExpiringBenefit {
  user_id: string;
  opportunity_id: string;
  opportunity_name: string;
  futuro_reforma: string;
  validade_ate: string | null;
  months_until_expiry: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("🔍 Checking for expiring benefits...");

    // Get all active company opportunities with their tax_opportunities data
    const { data: companyOpportunities, error: oppError } = await supabase
      .from("company_opportunities")
      .select(`
        id,
        user_id,
        opportunity_id,
        status,
        economia_mensal_min,
        economia_mensal_max,
        tax_opportunities:opportunity_id (
          name,
          futuro_reforma,
          descricao_reforma,
          validade_ate,
          economia_percentual_min,
          economia_percentual_max
        )
      `)
      .in("status", ["nova", "analisando", "implementando", "implementada"]);

    if (oppError) {
      console.error("Error fetching opportunities:", oppError);
      throw oppError;
    }

    console.log(`Found ${companyOpportunities?.length || 0} active opportunities`);

    // Get reform deadlines
    const { data: prazos, error: prazosError } = await supabase
      .from("prazos_reforma")
      .select("data_prazo, titulo, tipo")
      .eq("ativo", true)
      .order("data_prazo", { ascending: true });

    if (prazosError) {
      console.error("Error fetching prazos:", prazosError);
    }

    const now = new Date();
    const notificationsToCreate: any[] = [];
    const processedUsers = new Set<string>();

    // Key transition dates from the reform
    const transitionDates = {
      cbs_start: new Date("2026-01-01"), // CBS starts
      icms_ibs_transition: new Date("2027-01-01"), // IBS starts replacing ICMS/ISS
      full_transition: new Date("2033-01-01"), // Full new system
    };

    for (const opp of companyOpportunities || []) {
      const taxOpp = opp.tax_opportunities as any;
      if (!taxOpp) continue;

      const futuroReforma = taxOpp.futuro_reforma;
      
      // Skip if benefit is maintained
      if (futuroReforma === "mantido") continue;

      // Determine expiry date based on futuro_reforma
      let expiryDate: Date | null = null;
      let urgencyLevel = "";
      let actionMessage = "";

      if (taxOpp.validade_ate) {
        expiryDate = new Date(taxOpp.validade_ate);
      } else if (futuroReforma === "extinto") {
        // Benefits being extinguished - assume 2026 transition
        expiryDate = transitionDates.cbs_start;
        actionMessage = "Este benefício será EXTINTO com a Reforma Tributária.";
      } else if (futuroReforma === "substituido") {
        // Being replaced by CBS/IBS mechanism
        expiryDate = transitionDates.icms_ibs_transition;
        actionMessage = "Este benefício será SUBSTITUÍDO pelo mecanismo CBS/IBS.";
      } else if (futuroReforma === "em_analise") {
        // Still being analyzed - warn but less urgent
        expiryDate = transitionDates.full_transition;
        actionMessage = "Este benefício está EM ANÁLISE e pode sofrer alterações.";
      } else if (futuroReforma === "reduzido") {
        expiryDate = transitionDates.icms_ibs_transition;
        actionMessage = "Este benefício será REDUZIDO com a transição tributária.";
      }

      if (!expiryDate) continue;

      const monthsUntilExpiry = Math.floor(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      // Determine notification frequency based on proximity
      let shouldNotify = false;
      let notificationType: "info" | "warning" | "alert" = "info";

      if (monthsUntilExpiry <= 3) {
        // Critical: weekly notifications
        shouldNotify = true;
        notificationType = "alert";
        urgencyLevel = "🚨 CRÍTICO";
      } else if (monthsUntilExpiry <= 6) {
        // Urgent: monthly notifications (check if it's start of month)
        shouldNotify = now.getDate() <= 7;
        notificationType = "warning";
        urgencyLevel = "⚠️ URGENTE";
      } else if (monthsUntilExpiry <= 12) {
        // Important: quarterly notifications
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const dayOfQuarter = now.getDate();
        shouldNotify = now.getMonth() % 3 === 0 && dayOfQuarter <= 7;
        notificationType = "warning";
        urgencyLevel = "📅 ATENÇÃO";
      }

      if (!shouldNotify) continue;

      // Check if we already sent a similar notification recently
      const { data: recentNotif } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", opp.user_id)
        .eq("category", "reforma")
        .ilike("title", `%${taxOpp.name}%`)
        .gte("created_at", new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (recentNotif && recentNotif.length > 0) {
        console.log(`Skipping - recent notification exists for ${taxOpp.name}`);
        continue;
      }

      // Calculate potential impact
      const economiaMin = opp.economia_mensal_min || 0;
      const economiaMax = opp.economia_mensal_max || 0;
      const impactoAnual = ((economiaMin + economiaMax) / 2) * 12;
      const impactoFormatted = impactoAnual > 0 
        ? `Impacto estimado: R$ ${impactoAnual.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/ano.`
        : "";

      const notification = {
        user_id: opp.user_id,
        title: `${urgencyLevel} ${taxOpp.name}`,
        message: `${actionMessage} ${impactoFormatted} Restam ${monthsUntilExpiry} meses. Acesse Oportunidades para ver alternativas.`,
        type: notificationType,
        category: "reforma",
        action_url: "/dashboard/oportunidades",
        read: false,
      };

      notificationsToCreate.push(notification);
      processedUsers.add(opp.user_id);
    }

    console.log(`Creating ${notificationsToCreate.length} notifications for ${processedUsers.size} users`);

    // Batch insert notifications
    if (notificationsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notificationsToCreate);

      if (insertError) {
        console.error("Error inserting notifications:", insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_created: notificationsToCreate.length,
        users_notified: processedUsers.size,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in check-expiring-benefits:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
