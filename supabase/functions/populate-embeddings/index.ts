import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://tributalks.com.br",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================
// POPULATION DE EMBEDDINGS - Batch Processing
// ============================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verifica se o usuário é admin
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", authData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { targetTable, batchSize = 10 } = await req.json();

    // Valida a tabela alvo
    const validTables = ["clara_knowledge_base", "clara_memory", "clara_learned_patterns"];
    if (!validTables.includes(targetTable)) {
      return new Response(JSON.stringify({ error: "Invalid target table" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Busca registros sem embedding
    let query = supabase.from(targetTable).select("id");
    
    if (targetTable === "clara_knowledge_base") {
      query = query.is("embedding", null).eq("status", "published").limit(batchSize);
    } else {
      query = query.is("embedding", null).limit(batchSize);
    }

    const { data: records, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching records:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to fetch records" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!records || records.length === 0) {
      return new Response(JSON.stringify({ 
        message: "No records need embedding",
        processed: 0,
        total: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Chama a edge function de geração de embeddings para cada registro
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const record of records) {
      try {
        // Busca o conteúdo completo do registro
        let contentField = "summary";
        if (targetTable === "clara_memory") contentField = "content";
        if (targetTable === "clara_learned_patterns") contentField = "pattern_key";

        const { data: fullRecord } = await supabase
          .from(targetTable)
          .select("*")
          .eq("id", record.id)
          .single();

        if (!fullRecord) continue;

        // Prepara o conteúdo para embedding
        let content = "";
        if (targetTable === "clara_knowledge_base") {
          content = `${fullRecord.title}\n${fullRecord.summary}\n${fullRecord.full_content || ""}`;
        } else if (targetTable === "clara_memory") {
          content = `${fullRecord.category}: ${fullRecord.content}`;
        } else if (targetTable === "clara_learned_patterns") {
          content = `${fullRecord.pattern_type}: ${fullRecord.pattern_key} - ${JSON.stringify(fullRecord.pattern_value)}`;
        }

        // Chama a edge function de embeddings
        const response = await fetch(`${supabaseUrl}/functions/v1/generate-embeddings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            content,
            contentType: targetTable === "clara_knowledge_base" ? "knowledge" 
              : targetTable === "clara_memory" ? "memory" : "pattern",
            recordId: record.id,
          }),
        });

        if (response.ok) {
          results.success++;
        } else {
          results.failed++;
          const errorText = await response.text();
          results.errors.push(`${record.id}: ${errorText}`);
        }

        // Rate limiting - espera 200ms entre chamadas
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err) {
        results.failed++;
        results.errors.push(`${record.id}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    // Conta quantos registros ainda precisam de embedding
    const { count: remainingCount } = await supabase
      .from(targetTable)
      .select("id", { count: "exact", head: true })
      .is("embedding", null);

    console.log(`Embeddings populated: ${results.success} success, ${results.failed} failed, ${remainingCount} remaining`);

    return new Response(JSON.stringify({
      message: "Embeddings population completed",
      processed: results.success,
      failed: results.failed,
      remaining: remainingCount || 0,
      errors: results.errors.slice(0, 5), // Limita a 5 erros no response
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in populate-embeddings:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
