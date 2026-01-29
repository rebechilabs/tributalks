import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "alexandre@rebechisilva.com.br";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendApiKey);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user counts by plan
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("plano, subscription_status");

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    // Calculate metrics
    const planCounts: Record<string, number> = {
      FREE: 0,
      NAVIGATOR: 0,
      PROFESSIONAL: 0,
      ENTERPRISE: 0,
    };

    let activeSubscriptions = 0;
    const totalUsers = profiles?.length || 0;

    profiles?.forEach((profile) => {
      const plan = profile.plano?.toUpperCase() || "FREE";
      planCounts[plan] = (planCounts[plan] || 0) + 1;

      if (profile.subscription_status === "active") {
        activeSubscriptions++;
      }
    });

    // Get today's new users
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: newUsersToday } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // Get referral stats
    const { data: referralStats } = await supabase
      .from("referrals")
      .select("status");

    const pendingReferrals = referralStats?.filter(r => r.status === "pending").length || 0;
    const qualifiedReferrals = referralStats?.filter(r => r.status === "qualified").length || 0;

    const dateStr = new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fff; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; padding: 24px; }
    .header { text-align: center; margin-bottom: 24px; border-bottom: 1px solid #333; padding-bottom: 16px; }
    .logo { font-size: 24px; font-weight: bold; color: #f59e0b; }
    .date { color: #888; font-size: 14px; margin-top: 8px; }
    .metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
    .metric-card { background: #252525; border-radius: 8px; padding: 16px; text-align: center; }
    .metric-value { font-size: 32px; font-weight: bold; color: #f59e0b; }
    .metric-label { font-size: 12px; color: #888; margin-top: 4px; }
    .plan-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    .plan-table th, .plan-table td { padding: 12px; text-align: left; border-bottom: 1px solid #333; }
    .plan-table th { color: #888; font-weight: normal; font-size: 12px; }
    .plan-table td { font-weight: 500; }
    .plan-free { color: #888; }
    .plan-navigator { color: #3b82f6; }
    .plan-professional { color: #8b5cf6; }
    .plan-enterprise { color: #f59e0b; }
    .section-title { font-size: 14px; color: #888; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #333; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🤖 TribuTalks</div>
      <div class="date">Relatório Diário · ${dateStr}</div>
    </div>
    
    <div class="metric-grid">
      <div class="metric-card">
        <div class="metric-value">${totalUsers}</div>
        <div class="metric-label">Total de Usuários</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${newUsersToday || 0}</div>
        <div class="metric-label">Novos Hoje</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${activeSubscriptions}</div>
        <div class="metric-label">Assinaturas Ativas</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${qualifiedReferrals}</div>
        <div class="metric-label">Indicações Qualificadas</div>
      </div>
    </div>
    
    <div class="section-title">Distribuição por Plano</div>
    <table class="plan-table">
      <tr>
        <th>Plano</th>
        <th>Usuários</th>
        <th>% do Total</th>
      </tr>
      <tr>
        <td class="plan-free">FREE</td>
        <td>${planCounts.FREE}</td>
        <td>${totalUsers ? ((planCounts.FREE / totalUsers) * 100).toFixed(1) : 0}%</td>
      </tr>
      <tr>
        <td class="plan-navigator">NAVIGATOR</td>
        <td>${planCounts.NAVIGATOR}</td>
        <td>${totalUsers ? ((planCounts.NAVIGATOR / totalUsers) * 100).toFixed(1) : 0}%</td>
      </tr>
      <tr>
        <td class="plan-professional">PROFESSIONAL</td>
        <td>${planCounts.PROFESSIONAL}</td>
        <td>${totalUsers ? ((planCounts.PROFESSIONAL / totalUsers) * 100).toFixed(1) : 0}%</td>
      </tr>
      <tr>
        <td class="plan-enterprise">ENTERPRISE</td>
        <td>${planCounts.ENTERPRISE}</td>
        <td>${totalUsers ? ((planCounts.ENTERPRISE / totalUsers) * 100).toFixed(1) : 0}%</td>
      </tr>
    </table>
    
    <div class="footer">
      Este email é enviado automaticamente pela plataforma TribuTalks.
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "TribuTalks <suporte@tributalks.com.br>",
      to: [ADMIN_EMAIL],
      subject: `📊 Métricas Diárias TribuTalks - ${new Date().toLocaleDateString("pt-BR")}`,
      html: htmlContent,
    });

    console.log("Daily metrics email sent:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily metrics email sent",
        metrics: {
          totalUsers,
          newUsersToday,
          activeSubscriptions,
          planCounts,
          pendingReferrals,
          qualifiedReferrals,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending daily metrics:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send daily metrics" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
