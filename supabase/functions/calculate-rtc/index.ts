import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ItemInput {
  numero: number;
  ncm: string;
  descricao?: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  cst: string;
  cClassTrib?: string;
}

interface CalculateRequest {
  municipio: number;
  municipioNome?: string;
  uf: string;
  itens: ItemInput[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user with Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Usuário não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: CalculateRequest = await req.json();
    const { municipio, municipioNome, uf, itens } = body;

    // Validate required fields
    if (!municipio || !uf || !itens || itens.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Dados incompletos. Informe município, UF e ao menos um item." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build API payload
    const apiPayload = {
      id: crypto.randomUUID(),
      versao: "1.0.0",
      dhFatoGerador: new Date().toISOString(),
      municipio: municipio,
      uf: uf,
      itens: itens.map((item) => ({
        numero: item.numero,
        ncm: item.ncm.replace(/\D/g, ""),
        quantidade: item.quantidade,
        unidade: item.unidade,
        cst: item.cst,
        baseCalculo: item.quantidade * item.valorUnitario,
        cClassTrib: item.cClassTrib || "000001",
        tributacaoRegular: {
          cst: item.cst,
          cClassTrib: item.cClassTrib || "000001",
        },
      })),
    };

    console.log("Enviando para API RTC:", JSON.stringify(apiPayload, null, 2));

    // Call RFB API
    const apiResponse = await fetch(
      "https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/calculadora/regime-geral",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      }
    );

    // Capture warning header
    const warningHeader = apiResponse.headers.get("x-warning-dados-simulados");

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("Erro API RTC:", apiResponse.status, errorText);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Erro na API da Receita Federal: ${apiResponse.status}`,
          details: errorText,
        }),
        { status: apiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiData = await apiResponse.json();
    console.log("Resposta API RTC:", JSON.stringify(apiData, null, 2));

    // Calculate totals
    let totalCbs = 0;
    let totalIbsUf = 0;
    let totalIbsMun = 0;
    let totalIs = 0;

    if (apiData.itens) {
      for (const item of apiData.itens) {
        if (item.tributosCalculados) {
          totalCbs += item.tributosCalculados.cbs?.valor || 0;
          totalIbsUf += item.tributosCalculados.ibsUf?.valor || 0;
          totalIbsMun += item.tributosCalculados.ibsMun?.valor || 0;
          totalIs += item.tributosCalculados.is?.valor || 0;
        }
      }
    }

    const totalGeral = totalCbs + totalIbsUf + totalIbsMun + totalIs;

    // Save to database
    const { error: insertError } = await supabase.from("tax_calculations").insert({
      user_id: user.id,
      municipio_codigo: municipio,
      municipio_nome: municipioNome || null,
      uf: uf,
      input_data: body,
      result_data: apiData,
      total_cbs: totalCbs,
      total_ibs_uf: totalIbsUf,
      total_ibs_mun: totalIbsMun,
      total_is: totalIs,
      total_geral: totalGeral,
      items_count: itens.length,
      has_simulated_data: !!warningHeader,
    });

    if (insertError) {
      console.error("Erro ao salvar cálculo:", insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: apiData,
        totals: {
          cbs: totalCbs,
          ibsUf: totalIbsUf,
          ibsMun: totalIbsMun,
          is: totalIs,
          total: totalGeral,
        },
        warning: warningHeader ? parseInt(warningHeader) : null,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Erro interno:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno do servidor", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
