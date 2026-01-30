import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CrossAnalysisResult {
  periodo: string;
  ano: number;
  mes: number;
  spedData: {
    pisCredito: number;
    pisDebito: number;
    cofinsCredito: number;
    cofinsDebito: number;
  } | null;
  dctfData: {
    pisDeclarado: number;
    cofinsDeclarado: number;
  } | null;
  divergencias: {
    pis: number;
    cofins: number;
    total: number;
  };
  nivelRisco: string;
}

function calcularNivelRisco(divergenciaTotal: number): string {
  if (divergenciaTotal > 50000) return "critico";
  if (divergenciaTotal > 10000) return "alto";
  if (divergenciaTotal > 1000) return "medio";
  return "baixo";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header missing");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    // Fetch SPED data
    const { data: spedData, error: spedError } = await supabase
      .from("sped_contribuicoes")
      .select("*")
      .eq("user_id", user.id)
      .order("periodo_inicio", { ascending: false });

    if (spedError) throw spedError;

    // Fetch DCTF data
    const { data: dctfData, error: dctfError } = await supabase
      .from("dctf_declaracoes")
      .select("*")
      .eq("user_id", user.id)
      .order("ano_calendario", { ascending: false });

    if (dctfError) throw dctfError;

    // Group by period (year/month)
    const periodMap = new Map<string, CrossAnalysisResult>();

    // Process SPED data
    for (const sped of spedData || []) {
      const periodoInicio = new Date(sped.periodo_inicio);
      const ano = periodoInicio.getFullYear();
      const mes = periodoInicio.getMonth() + 1;
      const key = `${ano}-${mes.toString().padStart(2, "0")}`;

      if (!periodMap.has(key)) {
        periodMap.set(key, {
          periodo: key,
          ano,
          mes,
          spedData: null,
          dctfData: null,
          divergencias: { pis: 0, cofins: 0, total: 0 },
          nivelRisco: "baixo",
        });
      }

      const entry = periodMap.get(key)!;
      entry.spedData = {
        pisCredito: Number(sped.total_credito_pis) || 0,
        pisDebito: Number(sped.total_debito_pis) || 0,
        cofinsCredito: Number(sped.total_credito_cofins) || 0,
        cofinsDebito: Number(sped.total_debito_cofins) || 0,
      };
    }

    // Process DCTF data
    for (const dctf of dctfData || []) {
      const ano = dctf.ano_calendario;
      const mes = dctf.mes_referencia || 1;
      const key = `${ano}-${mes.toString().padStart(2, "0")}`;

      if (!periodMap.has(key)) {
        periodMap.set(key, {
          periodo: key,
          ano,
          mes,
          spedData: null,
          dctfData: null,
          divergencias: { pis: 0, cofins: 0, total: 0 },
          nivelRisco: "baixo",
        });
      }

      const entry = periodMap.get(key)!;
      
      // Extract PIS/COFINS from DCTF debits
      const { data: debitos } = await supabase
        .from("dctf_debitos")
        .select("*")
        .eq("dctf_id", dctf.id);

      let pisDeclarado = 0;
      let cofinsDeclarado = 0;

      for (const debito of debitos || []) {
        const codigo = debito.codigo_receita;
        const valor = Number(debito.valor_total) || 0;
        
        // PIS codes: 2063, 6912
        if (["2063", "6912"].includes(codigo)) {
          pisDeclarado += valor;
        }
        // COFINS codes: 2172, 5856
        if (["2172", "5856"].includes(codigo)) {
          cofinsDeclarado += valor;
        }
      }

      entry.dctfData = { pisDeclarado, cofinsDeclarado };
    }

    // Calculate divergences and save to database
    const results: CrossAnalysisResult[] = [];
    const analysisToInsert: any[] = [];

    for (const [key, entry] of periodMap.entries()) {
      if (entry.spedData && entry.dctfData) {
        // SPED apurado = débito - crédito (valor a pagar)
        const spedPisApurado = entry.spedData.pisDebito - entry.spedData.pisCredito;
        const spedCofinsApurado = entry.spedData.cofinsDebito - entry.spedData.cofinsCredito;

        // Divergência = diferença entre declarado na DCTF e apurado no SPED
        entry.divergencias.pis = Math.abs(entry.dctfData.pisDeclarado - spedPisApurado);
        entry.divergencias.cofins = Math.abs(entry.dctfData.cofinsDeclarado - spedCofinsApurado);
        entry.divergencias.total = entry.divergencias.pis + entry.divergencias.cofins;
        entry.nivelRisco = calcularNivelRisco(entry.divergencias.total);
      } else if (entry.spedData && !entry.dctfData) {
        // SPED sem DCTF correspondente
        entry.divergencias.pis = entry.spedData.pisDebito - entry.spedData.pisCredito;
        entry.divergencias.cofins = entry.spedData.cofinsDebito - entry.spedData.cofinsCredito;
        entry.divergencias.total = entry.divergencias.pis + entry.divergencias.cofins;
        entry.nivelRisco = "alto"; // Missing DCTF is a risk
      }

      results.push(entry);

      // Prepare for database insert
      if (entry.divergencias.total > 0) {
        analysisToInsert.push({
          user_id: user.id,
          periodo_referencia: key,
          ano: entry.ano,
          mes: entry.mes,
          sped_pis_credito: entry.spedData?.pisCredito || 0,
          sped_pis_debito: entry.spedData?.pisDebito || 0,
          sped_cofins_credito: entry.spedData?.cofinsCredito || 0,
          sped_cofins_debito: entry.spedData?.cofinsDebito || 0,
          dctf_pis_declarado: entry.dctfData?.pisDeclarado || 0,
          dctf_cofins_declarado: entry.dctfData?.cofinsDeclarado || 0,
          divergencia_pis: entry.divergencias.pis,
          divergencia_cofins: entry.divergencias.cofins,
          divergencia_total: entry.divergencias.total,
          nivel_risco: entry.nivelRisco,
          status: "analisado",
        });
      }
    }

    // Clear previous analysis and insert new ones
    await supabase
      .from("fiscal_cross_analysis")
      .delete()
      .eq("user_id", user.id);

    if (analysisToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("fiscal_cross_analysis")
        .insert(analysisToInsert);

      if (insertError) {
        console.error("Error inserting analysis:", insertError);
      }
    }

    // Create notifications for critical divergences
    const criticalDivergences = results.filter(r => r.nivelRisco === "critico" || r.nivelRisco === "alto");
    
    for (const div of criticalDivergences.slice(0, 3)) {
      await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          title: `Divergência ${div.nivelRisco === "critico" ? "Crítica" : "Alta"} Detectada`,
          message: `Período ${div.periodo}: Divergência de R$ ${div.divergencias.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} entre SPED e DCTF`,
          type: div.nivelRisco === "critico" ? "error" : "warning",
          category: "fiscal",
          action_url: "/dashboard/analise-notas?tab=creditos",
        });
    }

    // Summary
    const totalDivergencia = results.reduce((acc, r) => acc + r.divergencias.total, 0);
    const periodosAnalisados = results.length;
    const periodosComDivergencia = results.filter(r => r.divergencias.total > 0).length;

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          periodosAnalisados,
          periodosComDivergencia,
          totalDivergencia,
          resultados: results.sort((a, b) => b.divergencias.total - a.divergencias.total),
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in cross-analysis:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
