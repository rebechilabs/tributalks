import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://tributalks.com.br",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
      
      // Try to parse error for better message
      let userMessage = `Erro na API da Receita Federal (${apiResponse.status})`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.detail) {
          userMessage = errorData.detail;
        }
      } catch {
        // Use default message
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: userMessage,
          details: errorText,
        }),
        { status: apiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiData = await apiResponse.json();
    console.log("Resposta API RTC:", JSON.stringify(apiData, null, 2));

    // Parse the API response - the structure uses "objetos" not "itens"
    // and has a different nested structure for taxes
    let totalCbs = 0;
    let totalIbsUf = 0;
    let totalIbsMun = 0;
    let totalIs = 0;

    // Parse from "total" section if available (more reliable)
    if (apiData.total?.tribCalc?.IBSCBSTot) {
      const totais = apiData.total.tribCalc.IBSCBSTot;
      totalCbs = parseFloat(totais.gCBS?.vCBS || "0");
      totalIbsUf = parseFloat(totais.gIBS?.gIBSUF?.vIBSUF || "0");
      totalIbsMun = parseFloat(totais.gIBS?.gIBSMun?.vIBSMun || "0");
    }

    // Parse IS (Imposto Seletivo) if present
    if (apiData.total?.tribCalc?.ISTot) {
      totalIs = parseFloat(apiData.total.tribCalc.ISTot.vIS || "0");
    }

    // Build processed items for display
    const processedItems = (apiData.objetos || []).map((obj: any, index: number) => {
      const tribCalc = obj.tribCalc?.IBSCBS?.gIBSCBS || {};
      const inputItem = itens[index] || {};
      
      const itemCbs = parseFloat(tribCalc.gCBS?.vCBS || "0");
      const itemIbsUf = parseFloat(tribCalc.gIBSUF?.vIBSUF || "0");
      const itemIbsMun = parseFloat(tribCalc.gIBSMun?.vIBSMun || "0");
      const baseCalculo = parseFloat(tribCalc.vBC || "0");
      
      // Get IS for item if present
      const itemIs = parseFloat(obj.tribCalc?.IS?.gIS?.vIS || "0");
      
      return {
        numero: obj.nObj || index + 1,
        ncm: inputItem.ncm || "",
        descricao: inputItem.descricao || "",
        baseCalculo: baseCalculo,
        tributosCalculados: {
          cbs: { 
            valor: itemCbs, 
            aliquota: parseFloat(tribCalc.gCBS?.pCBS || "0"),
            memoriaCalculo: tribCalc.gCBS?.memoriaCalculo || ""
          },
          ibsUf: { 
            valor: itemIbsUf, 
            aliquota: parseFloat(tribCalc.gIBSUF?.pIBSUF || "0"),
            memoriaCalculo: tribCalc.gIBSUF?.memoriaCalculo || ""
          },
          ibsMun: { 
            valor: itemIbsMun, 
            aliquota: parseFloat(tribCalc.gIBSMun?.pIBSMun || "0"),
            memoriaCalculo: tribCalc.gIBSMun?.memoriaCalculo || ""
          },
          is: { 
            valor: itemIs, 
            aliquota: parseFloat(obj.tribCalc?.IS?.gIS?.pIS || "0"),
            memoriaCalculo: obj.tribCalc?.IS?.gIS?.memoriaCalculo || ""
          },
        },
        memoriaCalculo: tribCalc.gCBS?.memoriaCalculo || "",
      };
    });

    const totalGeral = totalCbs + totalIbsUf + totalIbsMun + totalIs;

    console.log("Totais calculados:", { totalCbs, totalIbsUf, totalIbsMun, totalIs, totalGeral });

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
        data: {
          ...apiData,
          itens: processedItems, // Use processed items for frontend compatibility
        },
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
