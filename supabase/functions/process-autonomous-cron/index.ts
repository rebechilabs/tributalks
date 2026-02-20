import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================
// CRON JOB - Processa ações aprovadas
// ============================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("[CRON] Iniciando processamento de ações autônomas...");

    // Busca ações aprovadas que ainda não foram executadas
    const { data: approvedActions, error: fetchError } = await supabase
      .from("clara_autonomous_actions")
      .select("*")
      .eq("status", "approved")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(100);

    if (fetchError) throw fetchError;

    if (!approvedActions || approvedActions.length === 0) {
      console.log("[CRON] Nenhuma ação aprovada para processar");
      return new Response(
        JSON.stringify({ processed: 0, message: "Nenhuma ação pendente" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[CRON] Encontradas ${approvedActions.length} ações para processar`);

    // Chama a edge function de execução com process_all
    const { data: result, error: execError } = await supabase.functions.invoke(
      "execute-autonomous-action",
      { body: { process_all: true } }
    );

    if (execError) {
      console.error("[CRON] Erro ao executar ações:", execError);
      throw execError;
    }

    console.log(`[CRON] Resultado: ${JSON.stringify(result)}`);

    return new Response(
      JSON.stringify({
        processed: result?.processed || 0,
        success: result?.success || 0,
        failed: result?.failed || 0,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[CRON] Erro fatal:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
