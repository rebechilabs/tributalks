import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://tributalks.com.br",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================
// TIPOS
// ============================================

interface AutonomousAction {
  id: string;
  user_id: string;
  agent_type: string;
  action_type: string;
  trigger_event: string;
  trigger_data: Record<string, unknown>;
  action_payload: Record<string, unknown>;
  status: string;
  priority: string;
}

interface ExecutionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

// deno-lint-ignore no-explicit-any
type SupabaseClientAny = ReturnType<typeof createClient<any>>;

// ============================================
// EXECUTORES POR TIPO DE AÇÃO
// ============================================

async function executeAnalyzeCredits(
  supabase: SupabaseClientAny,
  action: AutonomousAction
): Promise<ExecutionResult> {
  // Chama a edge function de análise de créditos
  const { data, error } = await supabase.functions.invoke("analyze-credits", {
    body: { user_id: action.user_id },
  });

  if (error) {
    return { success: false, message: `Erro ao analisar créditos: ${error.message}` };
  }

  // Cria insight sobre os créditos encontrados
  if (data?.total_potential > 0) {
    await supabase.from("clara_insights").insert({
      user_id: action.user_id,
      insight_type: "credit_opportunity",
      priority: "high",
      title: "Créditos Tributários Identificados",
      description: `A Clara identificou R$ ${data.total_potential.toLocaleString("pt-BR")} em potenciais créditos recuperáveis.`,
      action_cta: "Ver Detalhes",
      action_route: "/radar-creditos",
      source_data: data,
    });
  }

  return {
    success: true,
    message: `Análise concluída: ${data?.credits_found_count || 0} créditos encontrados`,
    data,
  };
}

async function executeGenerateComplianceAlert(
  supabase: SupabaseClientAny,
  action: AutonomousAction
): Promise<ExecutionResult> {
  const { threshold } = action.action_payload as { threshold: number };

  // Cria alerta de compliance
  await supabase.from("clara_insights").insert({
    user_id: action.user_id,
    insight_type: "compliance_alert",
    priority: "urgent",
    title: "Score Tributário Crítico",
    description: `Seu score está abaixo de ${threshold}. Isso pode indicar riscos fiscais que precisam de atenção imediata.`,
    action_cta: "Analisar Score",
    action_route: "/score-tributario",
    source_data: action.trigger_data,
  });

  return {
    success: true,
    message: `Alerta de compliance gerado para score < ${threshold}`,
  };
}

async function executeNotifyGap(
  supabase: SupabaseClientAny,
  action: AutonomousAction
): Promise<ExecutionResult> {
  await supabase.from("clara_insights").insert({
    user_id: action.user_id,
    insight_type: "dctf_gap",
    priority: "urgent",
    title: "Divergência DCTF Detectada",
    description: "Foi identificada uma divergência entre os valores declarados na DCTF e os documentos fiscais importados.",
    action_cta: "Ver Divergências",
    action_route: "/fiscal-gaps",
    source_data: action.trigger_data,
  });

  return {
    success: true,
    message: "Notificação de gap DCTF criada",
  };
}

async function executeGenerateMarginAlert(
  supabase: SupabaseClientAny,
  action: AutonomousAction
): Promise<ExecutionResult> {
  const { drop_threshold } = action.action_payload as { drop_threshold: number };

  await supabase.from("clara_insights").insert({
    user_id: action.user_id,
    insight_type: "margin_alert",
    priority: "high",
    title: "Queda de Margem Detectada",
    description: `A margem operacional caiu mais de ${drop_threshold}pp. Isso pode impactar significativamente seu resultado.`,
    action_cta: "Analisar DRE",
    action_route: "/dre",
    source_data: action.trigger_data,
  });

  return {
    success: true,
    message: `Alerta de margem gerado (queda > ${drop_threshold}pp)`,
  };
}

async function executeRecalculateProjections(
  supabase: SupabaseClientAny,
  action: AutonomousAction
): Promise<ExecutionResult> {
  // Chama a edge function de processamento DRE
  const { error } = await supabase.functions.invoke("process-dre", {
    body: { user_id: action.user_id, recalculate_reform: true },
  });

  if (error) {
    return { success: false, message: `Erro ao recalcular: ${error.message}` };
  }

  return {
    success: true,
    message: "Projeções recalculadas com base no DRE atualizado",
  };
}

async function executeSendDeadlineReminder(
  supabase: SupabaseClientAny,
  action: AutonomousAction
): Promise<ExecutionResult> {
  const { days_before } = action.action_payload as { days_before: number };

  await supabase.from("clara_insights").insert({
    user_id: action.user_id,
    insight_type: "deadline_reminder",
    priority: "medium",
    title: "Prazo Fiscal se Aproximando",
    description: `Você tem uma obrigação fiscal com vencimento em ${days_before} dias. Não deixe para a última hora.`,
    action_cta: "Ver Calendário",
    action_route: "/timeline-reforma",
    source_data: action.trigger_data,
    expires_at: new Date(Date.now() + days_before * 24 * 60 * 60 * 1000).toISOString(),
  });

  return {
    success: true,
    message: `Lembrete de prazo criado (${days_before} dias)`,
  };
}

async function executeAlertBenefitExpiration(
  supabase: SupabaseClientAny,
  action: AutonomousAction
): Promise<ExecutionResult> {
  await supabase.from("clara_insights").insert({
    user_id: action.user_id,
    insight_type: "benefit_expiration",
    priority: "high",
    title: "Benefício Fiscal Expirando",
    description: "Um benefício fiscal que você utiliza está próximo do vencimento. Verifique as condições de renovação.",
    action_cta: "Ver Benefícios",
    action_route: "/oportunidades",
    source_data: action.trigger_data,
  });

  return {
    success: true,
    message: "Alerta de expiração de benefício criado",
  };
}

// ============================================
// ROUTER DE EXECUÇÃO
// ============================================

async function executeAction(
  supabase: SupabaseClientAny,
  action: AutonomousAction
): Promise<ExecutionResult> {
  const executors: Record<string, (s: SupabaseClientAny, a: AutonomousAction) => Promise<ExecutionResult>> = {
    analyze_credits: executeAnalyzeCredits,
    generate_compliance_alert: executeGenerateComplianceAlert,
    notify_gap: executeNotifyGap,
    generate_margin_alert: executeGenerateMarginAlert,
    recalculate_projections: executeRecalculateProjections,
    send_deadline_reminder: executeSendDeadlineReminder,
    alert_benefit_expiration: executeAlertBenefitExpiration,
  };

  const executor = executors[action.action_type];

  if (!executor) {
    return {
      success: false,
      message: `Executor não encontrado para action_type: ${action.action_type}`,
    };
  }

  return executor(supabase, action);
}

// ============================================
// HANDLER PRINCIPAL
// ============================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validar Bearer token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const { action_id, process_all } = body as { action_id?: string; process_all?: boolean };

    let actionsToProcess: AutonomousAction[] = [];

    if (action_id) {
      // Executa uma ação específica
      const { data, error } = await supabase
        .from("clara_autonomous_actions")
        .select("*")
        .eq("id", action_id)
        .eq("status", "approved")
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: "Ação não encontrada ou não aprovada" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      actionsToProcess = [data as AutonomousAction];
    } else if (process_all) {
      // Processa todas as ações aprovadas pendentes
      const { data, error } = await supabase
        .from("clara_autonomous_actions")
        .select("*")
        .eq("status", "approved")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) throw error;
      actionsToProcess = (data || []) as AutonomousAction[];
    } else {
      return new Response(
        JSON.stringify({ error: "Forneça action_id ou process_all=true" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Executa cada ação
    const results: Array<{ action_id: string; result: ExecutionResult }> = [];

    for (const action of actionsToProcess) {
      console.log(`Executando ação ${action.id} (${action.action_type})...`);

      const result = await executeAction(supabase, action);

      // Atualiza o status da ação
      const newStatus = result.success ? "executed" : "failed";
      await supabase
        .from("clara_autonomous_actions")
        .update({
          status: newStatus,
          executed_at: new Date().toISOString(),
          result: result,
        })
        .eq("id", action.id);

      results.push({ action_id: action.id, result });

      console.log(`Ação ${action.id}: ${result.success ? "✓" : "✗"} - ${result.message}`);
    }

    const successCount = results.filter((r) => r.result.success).length;
    const failCount = results.length - successCount;

    return new Response(
      JSON.stringify({
        processed: results.length,
        success: successCount,
        failed: failCount,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao executar ações:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
