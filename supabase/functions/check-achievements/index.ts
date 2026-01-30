import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AchievementCheck {
  code: string;
  name: string;
  description: string;
  condition: (data: UserData) => boolean;
}

interface UserData {
  scoreCount: number;
  currentScore: number;
  previousScore: number | null;
  xmlCount: number;
  creditsTotal: number;
  workflowsComplete: number;
  referralsCount: number;
  currentStreak: number;
  dreCount: number;
  opportunitiesCount: number;
}

const ACHIEVEMENTS: AchievementCheck[] = [
  {
    code: "first_score",
    name: "Primeiro Score",
    description: "Calculou o Score Tributário pela primeira vez",
    condition: (data) => data.scoreCount >= 1,
  },
  {
    code: "score_a_plus",
    name: "Score A+",
    description: "Atingiu nota A+ no Score Tributário",
    condition: (data) => data.currentScore >= 900,
  },
  {
    code: "score_improved",
    name: "Score Melhorou!",
    description: "Seu Score subiu 10+ pontos",
    condition: (data) => 
      data.previousScore !== null && 
      data.currentScore - data.previousScore >= 10,
  },
  {
    code: "xml_100",
    name: "100 XMLs Importados",
    description: "Importou 100 notas fiscais",
    condition: (data) => data.xmlCount >= 100,
  },
  {
    code: "xml_1000",
    name: "1.000 XMLs Importados",
    description: "Importou 1.000 notas fiscais",
    condition: (data) => data.xmlCount >= 1000,
  },
  {
    code: "credits_10k",
    name: "R$10k em Créditos",
    description: "Identificou R$10.000+ em créditos tributários",
    condition: (data) => data.creditsTotal >= 10000,
  },
  {
    code: "credits_100k",
    name: "R$100k em Créditos",
    description: "Identificou R$100.000+ em créditos tributários",
    condition: (data) => data.creditsTotal >= 100000,
  },
  {
    code: "workflow_complete",
    name: "Workflow Completo",
    description: "Completou seu primeiro Workflow Guiado",
    condition: (data) => data.workflowsComplete >= 1,
  },
  {
    code: "workflow_all",
    name: "Mestre dos Workflows",
    description: "Completou todos os 4 Workflows Guiados",
    condition: (data) => data.workflowsComplete >= 4,
  },
  {
    code: "referral_3",
    name: "Embaixador",
    description: "Indicou 3 amigos para a plataforma",
    condition: (data) => data.referralsCount >= 3,
  },
  {
    code: "streak_5",
    name: "5 Dias Seguidos",
    description: "Acessou a plataforma por 5 dias consecutivos",
    condition: (data) => data.currentStreak >= 5,
  },
  {
    code: "streak_30",
    name: "Dedicação Total",
    description: "Acessou a plataforma por 30 dias consecutivos",
    condition: (data) => data.currentStreak >= 30,
  },
  {
    code: "first_dre",
    name: "Primeira Análise DRE",
    description: "Completou sua primeira análise de DRE",
    condition: (data) => data.dreCount >= 1,
  },
  {
    code: "opportunities_explorer",
    name: "Explorador de Oportunidades",
    description: "Descobriu 5+ oportunidades tributárias",
    condition: (data) => data.opportunitiesCount >= 5,
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error("user_id is required");
    }

    // Fetch all user data in parallel
    const [
      scoreHistory,
      xmlImports,
      credits,
      workflows,
      referrals,
      profile,
      dre,
      opportunities,
      existingAchievements,
    ] = await Promise.all([
      supabase
        .from("tax_score_history")
        .select("score_total")
        .eq("user_id", user_id)
        .order("calculated_at", { ascending: false }),
      supabase
        .from("xml_imports")
        .select("id", { count: "exact" })
        .eq("user_id", user_id),
      supabase
        .from("identified_credits")
        .select("potential_recovery")
        .eq("user_id", user_id),
      supabase
        .from("workflow_progress")
        .select("id")
        .eq("user_id", user_id)
        .not("completed_at", "is", null),
      supabase
        .from("referral_codes")
        .select("successful_referrals")
        .eq("user_id", user_id)
        .single(),
      supabase
        .from("profiles")
        .select("current_streak")
        .eq("user_id", user_id)
        .single(),
      supabase
        .from("company_dre")
        .select("id", { count: "exact" })
        .eq("user_id", user_id),
      supabase
        .from("company_opportunities")
        .select("id", { count: "exact" })
        .eq("user_id", user_id),
      supabase
        .from("user_achievements")
        .select("achievement_code")
        .eq("user_id", user_id),
    ]);

    const scores = scoreHistory.data || [];
    const currentScore = scores[0]?.score_total || 0;
    const previousScore = scores[1]?.score_total || null;

    const creditsTotal = (credits.data || []).reduce(
      (sum, c) => sum + (c.potential_recovery || 0),
      0
    );

    const userData: UserData = {
      scoreCount: scores.length,
      currentScore,
      previousScore,
      xmlCount: xmlImports.count || 0,
      creditsTotal,
      workflowsComplete: workflows.data?.length || 0,
      referralsCount: referrals.data?.successful_referrals || 0,
      currentStreak: profile.data?.current_streak || 0,
      dreCount: dre.count || 0,
      opportunitiesCount: opportunities.count || 0,
    };

    const existingCodes = new Set(
      (existingAchievements.data || []).map((a) => a.achievement_code)
    );

    const newAchievements: string[] = [];

    // Check each achievement
    for (const achievement of ACHIEVEMENTS) {
      if (existingCodes.has(achievement.code)) continue;

      if (achievement.condition(userData)) {
        // Grant achievement
        const { error } = await supabase.from("user_achievements").insert({
          user_id,
          achievement_code: achievement.code,
          metadata: { name: achievement.name, description: achievement.description },
        });

        if (!error) {
          newAchievements.push(achievement.code);

          // Create notification
          await supabase.from("notifications").insert({
            user_id,
            title: `🏆 Conquista Desbloqueada!`,
            message: `${achievement.name}: ${achievement.description}`,
            type: "success",
            category: "conquistas",
            action_url: "/perfil",
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        new_achievements: newAchievements,
        total_achievements: existingCodes.size + newAchievements.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error checking achievements:", error);
    return new Response(
      JSON.stringify({ error: "Ocorreu um erro ao processar sua solicitação." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
