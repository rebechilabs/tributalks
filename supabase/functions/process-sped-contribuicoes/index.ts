import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://tributalks.com.br",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Tipos de crédito PIS/COFINS conforme layout SPED
const TIPOS_CREDITO: Record<string, string> = {
  "01": "Aquisição de bens para revenda",
  "02": "Aquisição de bens utilizados como insumo",
  "03": "Aquisição de serviços utilizados como insumo",
  "04": "Energia elétrica e térmica, inclusive sob a forma de vapor",
  "05": "Aluguéis de prédios",
  "06": "Aluguéis de máquinas e equipamentos",
  "07": "Armazenagem de mercadoria e frete na operação de venda",
  "08": "Contraprestações de arrendamento mercantil",
  "09": "Máquinas, equipamentos e outros bens incorporados ao ativo imobilizado",
  "10": "Máquinas, equipamentos e outros bens incorporados ao ativo imobilizado (aquisição)",
  "11": "Amortização e depreciação de edificações e benfeitorias em imóveis",
  "12": "Devolução de vendas sujeitas à alíquota geral",
  "13": "Outras operações com direito a crédito",
  "14": "Atividade de transporte de cargas - subcontratação",
  "15": "Atividade imobiliária - custo incorrido de unidade imobiliária",
  "16": "Atividade imobiliária - custo orçado de unidade não concluída",
  "17": "Atividade de prestação de serviços de limpeza, conservação e manutenção",
  "18": "Estoque de abertura de bens",
};

interface SpedLine {
  registro: string;
  campos: string[];
}

interface ParsedSped {
  header: {
    cnpj: string;
    razaoSocial: string;
    periodoInicio: string;
    periodoFim: string;
    regimeApuracao: string;
    tipoEscrituracao: string;
  };
  creditosPIS: CreditoItem[];
  creditosCOFINS: CreditoItem[];
  consolidacaoPIS: ConsolidacaoItem | null;
  consolidacaoCOFINS: ConsolidacaoItem | null;
}

interface CreditoItem {
  tipoCredito: string;
  tipoCredioDescricao: string;
  baseCalculo: number;
  aliquota: number;
  valorCredito: number;
  naturezaCredito: string;
  origemCredito: string;
}

interface ConsolidacaoItem {
  totalCredito: number;
  totalDebito: number;
  totalApurado: number;
}

function parseLine(line: string): SpedLine | null {
  if (!line.startsWith("|") || !line.endsWith("|")) return null;
  
  const campos = line.slice(1, -1).split("|");
  if (campos.length < 1) return null;
  
  return {
    registro: campos[0],
    campos: campos,
  };
}

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  // SPED usa vírgula como separador decimal
  return parseFloat(value.replace(",", ".")) || 0;
}

function parseDate(value: string | undefined): string | null {
  if (!value || value.length !== 8) return null;
  // Formato SPED: DDMMAAAA
  const day = value.slice(0, 2);
  const month = value.slice(2, 4);
  const year = value.slice(4, 8);
  return `${year}-${month}-${day}`;
}

function parseSped(content: string): ParsedSped {
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  
  const result: ParsedSped = {
    header: {
      cnpj: "",
      razaoSocial: "",
      periodoInicio: "",
      periodoFim: "",
      regimeApuracao: "",
      tipoEscrituracao: "",
    },
    creditosPIS: [],
    creditosCOFINS: [],
    consolidacaoPIS: null,
    consolidacaoCOFINS: null,
  };

  for (const line of lines) {
    const parsed = parseLine(line);
    if (!parsed) continue;

    switch (parsed.registro) {
      case "0000": // Abertura do arquivo
        result.header.cnpj = parsed.campos[7] || "";
        result.header.razaoSocial = parsed.campos[8] || "";
        result.header.periodoInicio = parseDate(parsed.campos[4]) || "";
        result.header.periodoFim = parseDate(parsed.campos[5]) || "";
        result.header.tipoEscrituracao = parsed.campos[2] || "";
        break;

      case "0110": // Regime de apuração
        result.header.regimeApuracao = parsed.campos[2] || "";
        break;

      case "M100": // Crédito de PIS/Pasep relativo ao período
        result.creditosPIS.push({
          tipoCredito: parsed.campos[2] || "",
          tipoCredioDescricao: TIPOS_CREDITO[parsed.campos[2]] || "Outros",
          baseCalculo: parseNumber(parsed.campos[5]),
          aliquota: parseNumber(parsed.campos[6]),
          valorCredito: parseNumber(parsed.campos[7]),
          naturezaCredito: parsed.campos[4] || "",
          origemCredito: parsed.campos[3] || "",
        });
        break;

      case "M200": // Consolidação da contribuição para o PIS/Pasep do período
        result.consolidacaoPIS = {
          totalCredito: parseNumber(parsed.campos[8]),
          totalDebito: parseNumber(parsed.campos[2]),
          totalApurado: parseNumber(parsed.campos[11]),
        };
        break;

      case "M500": // Crédito de COFINS relativo ao período
        result.creditosCOFINS.push({
          tipoCredito: parsed.campos[2] || "",
          tipoCredioDescricao: TIPOS_CREDITO[parsed.campos[2]] || "Outros",
          baseCalculo: parseNumber(parsed.campos[5]),
          aliquota: parseNumber(parsed.campos[6]),
          valorCredito: parseNumber(parsed.campos[7]),
          naturezaCredito: parsed.campos[4] || "",
          origemCredito: parsed.campos[3] || "",
        });
        break;

      case "M600": // Consolidação da contribuição para a COFINS do período
        result.consolidacaoCOFINS = {
          totalCredito: parseNumber(parsed.campos[8]),
          totalDebito: parseNumber(parsed.campos[2]),
          totalApurado: parseNumber(parsed.campos[11]),
        };
        break;
    }
  }

  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validar autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { spedId, storagePath } = await req.json();

    if (!spedId || !storagePath) {
      return new Response(
        JSON.stringify({ error: "spedId e storagePath são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[process-sped] Processando SPED ${spedId} para usuário ${user.id}`);

    // Baixar arquivo do storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("sped-files")
      .download(storagePath);

    if (downloadError || !fileData) {
      console.error("[process-sped] Erro ao baixar arquivo:", downloadError);
      await supabase
        .from("sped_contribuicoes")
        .update({ status: "erro", erro_mensagem: "Erro ao baixar arquivo do storage" })
        .eq("id", spedId);
      
      return new Response(
        JSON.stringify({ error: "Erro ao baixar arquivo" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ler conteúdo do arquivo
    const content = await fileData.text();
    console.log(`[process-sped] Arquivo lido, ${content.length} caracteres`);

    // Parsear SPED
    const parsed = parseSped(content);
    console.log(`[process-sped] SPED parseado: CNPJ ${parsed.header.cnpj}, ${parsed.creditosPIS.length} créditos PIS, ${parsed.creditosCOFINS.length} créditos COFINS`);

    // Atualizar registro principal
    const { error: updateError } = await supabase
      .from("sped_contribuicoes")
      .update({
        cnpj: parsed.header.cnpj,
        razao_social: parsed.header.razaoSocial,
        periodo_inicio: parsed.header.periodoInicio || null,
        periodo_fim: parsed.header.periodoFim || null,
        regime_apuracao: parsed.header.regimeApuracao,
        tipo_escrituracao: parsed.header.tipoEscrituracao,
        total_credito_pis: parsed.consolidacaoPIS?.totalCredito || 0,
        total_debito_pis: parsed.consolidacaoPIS?.totalDebito || 0,
        total_pis_apurado: parsed.consolidacaoPIS?.totalApurado || 0,
        total_credito_cofins: parsed.consolidacaoCOFINS?.totalCredito || 0,
        total_debito_cofins: parsed.consolidacaoCOFINS?.totalDebito || 0,
        total_cofins_apurado: parsed.consolidacaoCOFINS?.totalApurado || 0,
        registros_processados: parsed.creditosPIS.length + parsed.creditosCOFINS.length,
        status: "concluido",
      })
      .eq("id", spedId);

    if (updateError) {
      console.error("[process-sped] Erro ao atualizar registro:", updateError);
      throw updateError;
    }

    // Inserir itens de crédito PIS
    const pisItems = parsed.creditosPIS.map(c => ({
      sped_id: spedId,
      user_id: user.id,
      tipo_tributo: "PIS",
      bloco: "M100",
      tipo_credito: c.tipoCredito,
      tipo_credito_descricao: c.tipoCredioDescricao,
      base_calculo: c.baseCalculo,
      aliquota: c.aliquota,
      valor_credito: c.valorCredito,
      natureza_credito: c.naturezaCredito,
      origem_credito: c.origemCredito,
      potencial_recuperacao: c.valorCredito * 0.1, // 10% estimado como recuperável
    }));

    // Inserir itens de crédito COFINS
    const cofinsItems = parsed.creditosCOFINS.map(c => ({
      sped_id: spedId,
      user_id: user.id,
      tipo_tributo: "COFINS",
      bloco: "M500",
      tipo_credito: c.tipoCredito,
      tipo_credito_descricao: c.tipoCredioDescricao,
      base_calculo: c.baseCalculo,
      aliquota: c.aliquota,
      valor_credito: c.valorCredito,
      natureza_credito: c.naturezaCredito,
      origem_credito: c.origemCredito,
      potencial_recuperacao: c.valorCredito * 0.1,
    }));

    const allItems = [...pisItems, ...cofinsItems];
    
    if (allItems.length > 0) {
      const { error: insertError } = await supabase
        .from("sped_contribuicoes_items")
        .insert(allItems);

      if (insertError) {
        console.error("[process-sped] Erro ao inserir itens:", insertError);
      }
    }

    // Integrar com Radar de Créditos - criar créditos identificados
    const potencialTotal = allItems.reduce((acc, item) => acc + (item.potencial_recuperacao || 0), 0);
    
    if (potencialTotal > 0) {
      // Criar entrada consolidada no identified_credits
      await supabase.from("identified_credits").insert({
        user_id: user.id,
        nfe_key: `SPED-${spedId}`,
        nfe_number: `SPED ${parsed.header.periodoInicio?.slice(0, 7) || 'N/A'}`,
        nfe_date: parsed.header.periodoInicio || null,
        supplier_cnpj: parsed.header.cnpj,
        supplier_name: parsed.header.razaoSocial,
        product_description: `Créditos PIS/COFINS - SPED Contribuições`,
        ncm_code: null,
        cfop: null,
        cst: null,
        original_tax_value: (parsed.consolidacaoPIS?.totalCredito || 0) + (parsed.consolidacaoCOFINS?.totalCredito || 0),
        credit_not_used: potencialTotal,
        potential_recovery: potencialTotal,
        confidence_level: "high",
        confidence_score: 85,
        status: "identified",
        accountant_notes: `Créditos identificados via SPED Contribuições. PIS: ${parsed.creditosPIS.length} registros. COFINS: ${parsed.creditosCOFINS.length} registros.`,
      });
    }

    console.log(`[process-sped] Processamento concluído. ${allItems.length} itens, R$ ${potencialTotal.toFixed(2)} potencial`);

    return new Response(
      JSON.stringify({
        success: true,
        spedId,
        cnpj: parsed.header.cnpj,
        periodo: `${parsed.header.periodoInicio} a ${parsed.header.periodoFim}`,
        creditosPIS: parsed.creditosPIS.length,
        creditosCOFINS: parsed.creditosCOFINS.length,
        totalCreditoPIS: parsed.consolidacaoPIS?.totalCredito || 0,
        totalCreditoCOFINS: parsed.consolidacaoCOFINS?.totalCredito || 0,
        potencialRecuperacao: potencialTotal,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[process-sped] Erro geral:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
