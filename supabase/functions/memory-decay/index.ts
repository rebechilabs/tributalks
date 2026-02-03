import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DecayResult {
  patterns_decayed: number;
  patterns_removed: number;
  avg_confidence_before: number;
  avg_confidence_after: number;
}

interface MemoryDecayResult {
  memories_decayed: number;
  memories_expired: number;
  avg_importance_before: number;
  avg_importance_after: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log("[memory-decay] Starting daily memory decay process...");

    // 1. Apply pattern decay
    const { data: patternResult, error: patternError } = await supabase
      .rpc('apply_pattern_decay');

    if (patternError) {
      console.error("[memory-decay] Pattern decay error:", patternError);
      throw patternError;
    }

    const patternStats = patternResult?.[0] as DecayResult | undefined;
    console.log("[memory-decay] Pattern decay results:", {
      decayed: patternStats?.patterns_decayed || 0,
      removed: patternStats?.patterns_removed || 0,
      avgBefore: patternStats?.avg_confidence_before,
      avgAfter: patternStats?.avg_confidence_after,
    });

    // 2. Apply memory decay
    const { data: memoryResult, error: memoryError } = await supabase
      .rpc('apply_memory_decay');

    if (memoryError) {
      console.error("[memory-decay] Memory decay error:", memoryError);
      throw memoryError;
    }

    const memoryStats = memoryResult?.[0] as MemoryDecayResult | undefined;
    console.log("[memory-decay] Memory decay results:", {
      decayed: memoryStats?.memories_decayed || 0,
      expired: memoryStats?.memories_expired || 0,
      avgBefore: memoryStats?.avg_importance_before,
      avgAfter: memoryStats?.avg_importance_after,
    });

    // 3. Log summary to admin metrics
    const summary = {
      executed_at: new Date().toISOString(),
      patterns: {
        decayed: patternStats?.patterns_decayed || 0,
        removed: patternStats?.patterns_removed || 0,
        avg_confidence_delta: 
          (patternStats?.avg_confidence_after || 0) - (patternStats?.avg_confidence_before || 0),
      },
      memories: {
        decayed: memoryStats?.memories_decayed || 0,
        expired: memoryStats?.memories_expired || 0,
        avg_importance_delta:
          (memoryStats?.avg_importance_after || 0) - (memoryStats?.avg_importance_before || 0),
      },
    };

    // Store in admin_metrics for monitoring (optional - if table exists)
    try {
      await supabase.from('admin_metrics').insert({
        metric_type: 'memory_decay',
        metric_data: summary,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Table might not exist, that's okay
      console.log("[memory-decay] Could not log to admin_metrics (table may not exist)");
    }

    console.log("[memory-decay] Daily decay process completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        summary,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[memory-decay] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
