import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge Function: generate-clara-insights
 * 
 * Analisa dados do usuário e gera insights proativos.
 * Executada periodicamente via cron ou após eventos importantes.
 */

interface InsightRule {
  id: string;
  type: 'alert' | 'recommendation' | 'opportunity' | 'risk';
  priority: 'low' | 'medium' | 'high' | 'critical';
  condition: (data: UserAnalysisData) => boolean;
  title: string;
  description: (data: UserAnalysisData) => string;
  actionCta: string;
  actionRoute: string;
  triggerCondition: string;
}

interface UserAnalysisData {
  score: {
    total: number | null;
    grade: string | null;
    lastCalculated: string | null;
    daysSinceCalculation: number | null;
  };
  dre: {
    receitaBruta: number | null;
    margemLiquida: number | null;
    reformaImpactoPercent: number | null;
    lastUpdated: string | null;
    daysSinceUpdate: number | null;
  };
  credits: {
    totalPotential: number | null;
    countPending: number;
  };
  opportunities: {
    activeCount: number;
    totalSavings: number;
  };
  progress: {
    xmlsProcessed: number;
    onboardingComplete: boolean;
    workflowsInProgress: number;
  };
}

// Regras de insights baseadas em dados
const INSIGHT_RULES: InsightRule[] = [
  // SCORE TRIBUTÁRIO
  {
    id: 'score_drop_alert',
    type: 'alert',
    priority: 'high',
    condition: (d) => d.score.total !== null && d.score.total < 50,
    title: 'Score Tributário em zona de risco',
    description: (d) => `Seu Score caiu para ${d.score.total} pontos. Isso indica exposição a autuações. Vamos revisar os pontos críticos?`,
    actionCta: 'Ver Score',
    actionRoute: '/dashboard/score-tributario',
    triggerCondition: 'score_below_50',
  },
  {
    id: 'score_outdated',
    type: 'recommendation',
    priority: 'medium',
    condition: (d) => d.score.daysSinceCalculation !== null && d.score.daysSinceCalculation > 30,
    title: 'Score desatualizado há mais de 30 dias',
    description: () => 'Sua situação fiscal pode ter mudado. Recalcule o Score para ter uma visão atualizada.',
    actionCta: 'Recalcular',
    actionRoute: '/dashboard/score-tributario',
    triggerCondition: 'score_older_than_30_days',
  },
  
  // DRE / MARGEM
  {
    id: 'margin_at_risk',
    type: 'risk',
    priority: 'high',
    condition: (d) => d.dre.reformaImpactoPercent !== null && d.dre.reformaImpactoPercent < -2,
    title: 'Margem vai cair com a Reforma',
    description: (d) => `Sua margem pode cair ${Math.abs(d.dre.reformaImpactoPercent || 0).toFixed(1)}pp com a Reforma. Vamos simular estratégias de mitigação?`,
    actionCta: 'Simular cenários',
    actionRoute: '/dashboard/dre',
    triggerCondition: 'reforma_impact_negative',
  },
  {
    id: 'low_margin_warning',
    type: 'alert',
    priority: 'critical',
    condition: (d) => d.dre.margemLiquida !== null && d.dre.margemLiquida < 5,
    title: 'Margem líquida crítica',
    description: (d) => `Sua margem líquida está em ${d.dre.margemLiquida?.toFixed(1)}%. Qualquer aumento de carga tributária pode gerar prejuízo.`,
    actionCta: 'Analisar DRE',
    actionRoute: '/dashboard/dre',
    triggerCondition: 'margin_below_5',
  },
  
  // CRÉDITOS
  {
    id: 'credits_available',
    type: 'opportunity',
    priority: 'high',
    condition: (d) => d.credits.totalPotential !== null && d.credits.totalPotential > 10000,
    title: 'Créditos tributários identificados',
    description: (d) => `Encontrei R$ ${((d.credits.totalPotential || 0) / 1000).toFixed(0)}k em créditos que podem ser recuperados. Vamos validar?`,
    actionCta: 'Ver créditos',
    actionRoute: '/dashboard/radar-creditos',
    triggerCondition: 'credits_above_10k',
  },
  {
    id: 'credits_pending_validation',
    type: 'recommendation',
    priority: 'medium',
    condition: (d) => d.credits.countPending > 5,
    title: 'Créditos aguardando validação',
    description: (d) => `Você tem ${d.credits.countPending} créditos pendentes de validação. Revise para confirmar a recuperação.`,
    actionCta: 'Revisar',
    actionRoute: '/dashboard/radar-creditos',
    triggerCondition: 'pending_credits',
  },
  
  // OPORTUNIDADES
  {
    id: 'opportunities_available',
    type: 'opportunity',
    priority: 'medium',
    condition: (d) => d.opportunities.activeCount > 0 && d.opportunities.totalSavings > 5000,
    title: 'Economia fiscal identificada',
    description: (d) => `${d.opportunities.activeCount} oportunidades podem gerar R$ ${((d.opportunities.totalSavings || 0) / 1000).toFixed(0)}k/ano de economia.`,
    actionCta: 'Ver oportunidades',
    actionRoute: '/dashboard/oportunidades',
    triggerCondition: 'opportunities_available',
  },
  
  // ONBOARDING
  {
    id: 'complete_onboarding',
    type: 'recommendation',
    priority: 'low',
    condition: (d) => !d.progress.onboardingComplete && d.progress.xmlsProcessed > 0,
    title: 'Complete seu setup inicial',
    description: () => 'Você já importou XMLs, mas ainda não completou o setup. Finalize para desbloquear todos os recursos.',
    actionCta: 'Continuar',
    actionRoute: '/dashboard',
    triggerCondition: 'incomplete_onboarding',
  },
  
  // XMLS
  {
    id: 'import_more_xmls',
    type: 'recommendation',
    priority: 'low',
    condition: (d) => d.progress.xmlsProcessed < 10 && d.progress.xmlsProcessed > 0,
    title: 'Importe mais XMLs para análise completa',
    description: (d) => `Você tem apenas ${d.progress.xmlsProcessed} XMLs. Importe mais para diagnósticos mais precisos.`,
    actionCta: 'Importar',
    actionRoute: '/dashboard/importar-xmls',
    triggerCondition: 'few_xmls',
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

    // Valida autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Busca dados do usuário em paralelo
    const [
      scoreResult,
      dreResult,
      creditSummaryResult,
      creditsCountResult,
      opportunitiesResult,
      xmlCountResult,
      onboardingResult,
      workflowsResult,
      existingInsightsResult,
    ] = await Promise.all([
      supabase.from("tax_score").select("score_total, score_grade, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("company_dre").select("calc_receita_bruta, calc_margem_liquida, reforma_impacto_percentual, updated_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("credit_analysis_summary").select("total_potential").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("identified_credits").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "identified"),
      supabase.from("company_opportunities").select("id, economia_anual_min, economia_anual_max, status").eq("user_id", userId).neq("status", "descartada").neq("status", "implementada"),
      supabase.from("xml_imports").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("user_onboarding_progress").select("completed_at").eq("user_id", userId).maybeSingle(),
      supabase.from("workflow_progress").select("id", { count: "exact", head: true }).eq("user_id", userId).is("completed_at", null),
      supabase.from("clara_insights").select("trigger_condition").eq("user_id", userId).is("dismissed_at", null).is("acted_at", null),
    ]);

    // Calcula dias desde última atualização
    const daysSince = (dateStr: string | null): number | null => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    };

    // Monta objeto de análise
    const analysisData: UserAnalysisData = {
      score: {
        total: scoreResult.data?.score_total || null,
        grade: scoreResult.data?.score_grade || null,
        lastCalculated: scoreResult.data?.created_at || null,
        daysSinceCalculation: daysSince(scoreResult.data?.created_at),
      },
      dre: {
        receitaBruta: dreResult.data?.calc_receita_bruta || null,
        margemLiquida: dreResult.data?.calc_margem_liquida || null,
        reformaImpactoPercent: dreResult.data?.reforma_impacto_percentual || null,
        lastUpdated: dreResult.data?.updated_at || null,
        daysSinceUpdate: daysSince(dreResult.data?.updated_at),
      },
      credits: {
        totalPotential: creditSummaryResult.data?.total_potential || null,
        countPending: creditsCountResult.count || 0,
      },
      opportunities: {
        activeCount: (opportunitiesResult.data || []).length,
        totalSavings: (opportunitiesResult.data || []).reduce((acc, o) => acc + ((o.economia_anual_min || 0) + (o.economia_anual_max || 0)) / 2, 0),
      },
      progress: {
        xmlsProcessed: xmlCountResult.count || 0,
        onboardingComplete: !!onboardingResult.data?.completed_at,
        workflowsInProgress: workflowsResult.count || 0,
      },
    };

    // Verifica quais insights já existem para não duplicar
    const existingTriggers = new Set(
      (existingInsightsResult.data || []).map(i => i.trigger_condition)
    );

    // Avalia regras e gera insights
    const newInsights: Array<{
      user_id: string;
      insight_type: string;
      priority: string;
      title: string;
      description: string;
      action_cta: string;
      action_route: string;
      source_data: object;
      trigger_condition: string;
      expires_at: string;
    }> = [];

    for (const rule of INSIGHT_RULES) {
      // Pula se já existe insight com esse trigger
      if (existingTriggers.has(rule.triggerCondition)) {
        continue;
      }

      // Avalia condição
      if (rule.condition(analysisData)) {
        newInsights.push({
          user_id: userId,
          insight_type: rule.type,
          priority: rule.priority,
          title: rule.title,
          description: rule.description(analysisData),
          action_cta: rule.actionCta,
          action_route: rule.actionRoute,
          source_data: analysisData,
          trigger_condition: rule.triggerCondition,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
        });
      }
    }

    // Insere novos insights
    if (newInsights.length > 0) {
      const { error: insertError } = await supabase
        .from("clara_insights")
        .insert(newInsights);

      if (insertError) {
        console.error("Error inserting insights:", insertError);
      }
    }

    return new Response(
      JSON.stringify({
        analyzed: true,
        newInsightsCount: newInsights.length,
        insights: newInsights.map(i => ({ type: i.insight_type, title: i.title })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-clara-insights:", error);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
