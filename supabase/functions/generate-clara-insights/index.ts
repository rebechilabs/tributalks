import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://tributalks.com.br",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

// Regras de insights baseadas em dados e agentes especializados
const INSIGHT_RULES: InsightRule[] = [
  // ============================================
  // AGENTE FISCAL - Triggers
  // ============================================
  {
    id: 'score_drop_alert',
    type: 'alert',
    priority: 'high',
    condition: (d) => d.score.total !== null && d.score.total < 50,
    title: '🔴 Score Tributário em zona de risco',
    description: (d) => `Seu Score caiu para ${d.score.total} pontos. O Agente Fiscal detectou exposição a autuações.`,
    actionCta: 'Ver Score',
    actionRoute: '/dashboard/score-tributario',
    triggerCondition: 'score_below_50',
  },
  {
    id: 'score_outdated',
    type: 'recommendation',
    priority: 'medium',
    condition: (d) => d.score.daysSinceCalculation !== null && d.score.daysSinceCalculation > 30,
    title: '📊 Score desatualizado',
    description: () => 'Sua situação fiscal pode ter mudado nos últimos 30 dias. Recalcule para uma visão atualizada.',
    actionCta: 'Recalcular',
    actionRoute: '/dashboard/score-tributario',
    triggerCondition: 'score_older_than_30_days',
  },
  {
    id: 'score_excellent',
    type: 'opportunity',
    priority: 'low',
    condition: (d) => d.score.total !== null && d.score.total >= 85,
    title: '🏆 Score excelente!',
    description: (d) => `Parabéns! Seu Score de ${d.score.total} pontos indica conformidade exemplar. Continue assim!`,
    actionCta: 'Ver detalhes',
    actionRoute: '/dashboard/score-tributario',
    triggerCondition: 'score_excellent',
  },
  
  // ============================================
  // AGENTE DE MARGEM - Triggers
  // ============================================
  {
    id: 'margin_at_risk',
    type: 'risk',
    priority: 'high',
    condition: (d) => d.dre.reformaImpactoPercent !== null && d.dre.reformaImpactoPercent < -2,
    title: '⚠️ Margem em risco com a Reforma',
    description: (d) => `O Agente de Margem projeta queda de ${Math.abs(d.dre.reformaImpactoPercent || 0).toFixed(1)}pp. Simule estratégias de mitigação.`,
    actionCta: 'Simular cenários',
    actionRoute: '/dashboard/dre',
    triggerCondition: 'reforma_impact_negative',
  },
  {
    id: 'low_margin_warning',
    type: 'alert',
    priority: 'critical',
    condition: (d) => d.dre.margemLiquida !== null && d.dre.margemLiquida < 5,
    title: '🚨 Margem líquida crítica',
    description: (d) => `Margem de ${d.dre.margemLiquida?.toFixed(1)}% está muito baixa. Aumento de carga pode gerar prejuízo.`,
    actionCta: 'Analisar DRE',
    actionRoute: '/dashboard/dre',
    triggerCondition: 'margin_below_5',
  },
  {
    id: 'margin_healthy',
    type: 'opportunity',
    priority: 'low',
    condition: (d) => d.dre.margemLiquida !== null && d.dre.margemLiquida >= 15,
    title: '💚 Margem saudável',
    description: (d) => `Sua margem de ${d.dre.margemLiquida?.toFixed(1)}% oferece boa resiliência tributária. Explore otimizações.`,
    actionCta: 'Ver DRE',
    actionRoute: '/dashboard/dre',
    triggerCondition: 'margin_healthy',
  },
  {
    id: 'dre_outdated',
    type: 'recommendation',
    priority: 'medium',
    condition: (d) => d.dre.daysSinceUpdate !== null && d.dre.daysSinceUpdate > 60,
    title: '📈 Atualize sua DRE',
    description: () => 'Sua DRE está há mais de 60 dias sem atualização. Dados recentes melhoram as projeções.',
    actionCta: 'Atualizar',
    actionRoute: '/dashboard/dre',
    triggerCondition: 'dre_outdated',
  },
  
  // ============================================
  // AGENTE DE COMPLIANCE - Triggers
  // ============================================
  {
    id: 'credits_available',
    type: 'opportunity',
    priority: 'high',
    condition: (d) => d.credits.totalPotential !== null && d.credits.totalPotential > 10000,
    title: '💰 Créditos tributários identificados',
    description: (d) => `O Agente Fiscal encontrou R$ ${((d.credits.totalPotential || 0) / 1000).toFixed(0)}k em créditos recuperáveis.`,
    actionCta: 'Ver créditos',
    actionRoute: '/dashboard/analise-notas',
    triggerCondition: 'credits_above_10k',
  },
  {
    id: 'credits_pending_validation',
    type: 'recommendation',
    priority: 'medium',
    condition: (d) => d.credits.countPending > 5,
    title: '📋 Créditos aguardando validação',
    description: (d) => `${d.credits.countPending} créditos precisam de validação para confirmar recuperação.`,
    actionCta: 'Revisar',
    actionRoute: '/dashboard/analise-notas',
    triggerCondition: 'pending_credits',
  },
  {
    id: 'credits_significant',
    type: 'opportunity',
    priority: 'critical',
    condition: (d) => d.credits.totalPotential !== null && d.credits.totalPotential > 50000,
    title: '🎯 Créditos significativos disponíveis',
    description: (d) => `R$ ${((d.credits.totalPotential || 0) / 1000).toFixed(0)}k em créditos! Priorize a validação e recuperação.`,
    actionCta: 'Priorizar',
    actionRoute: '/dashboard/analise-notas',
    triggerCondition: 'credits_above_50k',
  },
  
  // ============================================
  // OPORTUNIDADES & ECONOMIA
  // ============================================
  {
    id: 'opportunities_available',
    type: 'opportunity',
    priority: 'medium',
    condition: (d) => d.opportunities.activeCount > 0 && d.opportunities.totalSavings > 5000,
    title: '💡 Economia fiscal identificada',
    description: (d) => `${d.opportunities.activeCount} oportunidades podem gerar R$ ${((d.opportunities.totalSavings || 0) / 1000).toFixed(0)}k/ano de economia.`,
    actionCta: 'Ver oportunidades',
    actionRoute: '/dashboard/oportunidades',
    triggerCondition: 'opportunities_available',
  },
  {
    id: 'quick_wins_available',
    type: 'opportunity',
    priority: 'high',
    condition: (d) => d.opportunities.activeCount >= 3,
    title: '🚀 Quick wins disponíveis',
    description: (d) => `Você tem ${d.opportunities.activeCount} oportunidades ativas. Comece pelas mais rápidas de implementar.`,
    actionCta: 'Ver quick wins',
    actionRoute: '/dashboard/oportunidades',
    triggerCondition: 'multiple_opportunities',
  },
  
  // ============================================
  // PROGRESSO & ONBOARDING
  // ============================================
  {
    id: 'complete_onboarding',
    type: 'recommendation',
    priority: 'low',
    condition: (d) => !d.progress.onboardingComplete && d.progress.xmlsProcessed > 0,
    title: '✅ Complete seu setup inicial',
    description: () => 'Você já importou XMLs! Finalize o setup para desbloquear todos os recursos.',
    actionCta: 'Continuar',
    actionRoute: '/dashboard',
    triggerCondition: 'incomplete_onboarding',
  },
  {
    id: 'import_more_xmls',
    type: 'recommendation',
    priority: 'low',
    condition: (d) => d.progress.xmlsProcessed < 10 && d.progress.xmlsProcessed > 0,
    title: '📤 Importe mais XMLs',
    description: (d) => `Com apenas ${d.progress.xmlsProcessed} XMLs, os diagnósticos ficam limitados. Mais dados = mais precisão.`,
    actionCta: 'Importar',
    actionRoute: '/dashboard/analise-notas',
    triggerCondition: 'few_xmls',
  },
  {
    id: 'workflows_in_progress',
    type: 'recommendation',
    priority: 'medium',
    condition: (d) => d.progress.workflowsInProgress > 0,
    title: '🔄 Workflows em andamento',
    description: (d) => `Você tem ${d.progress.workflowsInProgress} workflow(s) iniciado(s). Continue para concluí-los.`,
    actionCta: 'Continuar',
    actionRoute: '/dashboard/workflows',
    triggerCondition: 'pending_workflows',
  },
  {
    id: 'first_xml_success',
    type: 'opportunity',
    priority: 'low',
    condition: (d) => d.progress.xmlsProcessed >= 1 && d.progress.xmlsProcessed <= 3,
    title: '🎉 Primeiros XMLs importados!',
    description: () => 'Excelente início! Importe mais XMLs para análises ainda mais precisas.',
    actionCta: 'Importar mais',
    actionRoute: '/dashboard/analise-notas',
    triggerCondition: 'first_xmls_imported',
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
