import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ============================================
// MOTOR DE TRIGGERS AUTOMÁTICOS
// ============================================

interface TriggerDefinition {
  agentType: string;
  actionType: string;
  payload: Record<string, unknown>;
  requiresApproval: boolean;
  priority: string;
}

const TRIGGERS: Record<string, TriggerDefinition> = {
  xml_imported: {
    agentType: "fiscal",
    actionType: "analyze_credits",
    payload: { analysis_type: "full" },
    requiresApproval: false,
    priority: "medium",
  },
  score_below_60: {
    agentType: "fiscal",
    actionType: "generate_compliance_alert",
    payload: { threshold: 60, severity: "high" },
    requiresApproval: false,
    priority: "high",
  },
  dctf_gap_detected: {
    agentType: "fiscal",
    actionType: "notify_gap",
    payload: { notification_type: "gap_alert" },
    requiresApproval: false,
    priority: "urgent",
  },
  margin_drop_5pp: {
    agentType: "margin",
    actionType: "generate_margin_alert",
    payload: { drop_threshold: 5 },
    requiresApproval: false,
    priority: "high",
  },
  dre_updated: {
    agentType: "margin",
    actionType: "recalculate_projections",
    payload: {},
    requiresApproval: false,
    priority: "low",
  },
  deadline_7_days: {
    agentType: "compliance",
    actionType: "send_deadline_reminder",
    payload: { days_before: 7 },
    requiresApproval: false,
    priority: "medium",
  },
  benefit_expiring: {
    agentType: "compliance",
    actionType: "alert_benefit_expiration",
    payload: {},
    requiresApproval: false,
    priority: "high",
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const { event, user_id, trigger_data } = body as {
      event: string;
      user_id: string;
      trigger_data?: Record<string, unknown>;
    };

    if (!event || !user_id) {
      return new Response(
        JSON.stringify({ error: "event e user_id são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trigger = TRIGGERS[event];
    if (!trigger) {
      console.log(`Trigger não definido para evento: ${event}`);
      return new Response(
        JSON.stringify({ message: `Trigger não definido para: ${event}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verifica se já existe ação pendente para o mesmo evento (evita duplicatas)
    const { data: existingAction } = await supabase
      .from("clara_autonomous_actions")
      .select("id")
      .eq("user_id", user_id)
      .eq("trigger_event", event)
      .eq("status", "pending")
      .single();

    if (existingAction) {
      console.log(`Ação já existe para evento ${event}, user ${user_id}`);
      return new Response(
        JSON.stringify({ 
          message: "Ação já existe", 
          action_id: existingAction.id 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cria a ação autônoma
    const { data: actionId, error } = await supabase.rpc("create_autonomous_action", {
      p_user_id: user_id,
      p_agent_type: trigger.agentType,
      p_action_type: trigger.actionType,
      p_trigger_event: event,
      p_trigger_data: trigger_data || {},
      p_action_payload: trigger.payload,
      p_requires_approval: trigger.requiresApproval,
      p_priority: trigger.priority,
    });

    if (error) {
      console.error("Erro ao criar ação:", error);
      throw error;
    }

    console.log(`Ação criada: ${actionId} para evento ${event}`);

    // Se não requer aprovação, executa imediatamente
    if (!trigger.requiresApproval) {
      // O trigger do banco já vai mudar para 'approved' e disparar execução
      console.log(`Ação ${actionId} não requer aprovação, será executada automaticamente`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        action_id: actionId,
        requires_approval: trigger.requiresApproval,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro no trigger:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
