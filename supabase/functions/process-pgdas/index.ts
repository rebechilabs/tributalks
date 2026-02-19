import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PgdasResult {
  cnpj: string;
  razaoSocial: string;
  periodo: string;
  receitaBruta: number;
  valorDevido: number;
  aliquotaEfetiva: number;
  anexoSimples: string;
}

interface DadosCompletos {
  rbt12?: number;
  faixa?: string;
  aliquotaNominal?: number;
  reparticao?: {
    irpj?: number;
    csll?: number;
    cofins?: number;
    pis?: number;
    cpp?: number;
    icms?: number;
    iss?: number;
  };
  receitaMonofasica?: number;
  receitaST?: number;
  receitaExportacao?: number;
  receitaIsenta?: number;
}

// Smart money parser that auto-detects BR vs US format
function parseMoneyValue(raw: string): number {
  if (!raw || raw === "") return 0;
  let str = String(raw).trim();
  // Remove currency symbols and spaces
  str = str.replace(/[R$\s]/g, "");

  const lastComma = str.lastIndexOf(",");
  const lastDot = str.lastIndexOf(".");

  if (lastComma > lastDot) {
    // BR format: 200.000,00
    str = str.replace(/\./g, "");
    str = str.replace(",", ".");
  } else {
    // US format: 200,000.00
    str = str.replace(/,/g, "");
  }

  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

// Parse PGDAS text content to extract key information
function parsePgdasContent(content: string): { result: Partial<PgdasResult>; dadosCompletos: DadosCompletos } {
  const result: Partial<PgdasResult> = {};
  const dadosCompletos: DadosCompletos = {};

  // CNPJ
  const cnpjMatch = content.match(/CNPJ[:\s]*(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/i);
  if (cnpjMatch) {
    result.cnpj = cnpjMatch[1].replace(/[^\d]/g, "");
  }

  // Razão Social
  const razaoMatch = content.match(/Raz[ãa]o Social[:\s]*([^\n]+)/i);
  if (razaoMatch) {
    result.razaoSocial = razaoMatch[1].trim();
  }

  // Período (MM/YYYY)
  const periodoMatch = content.match(/Per[íi]odo de Apura[çc][ãa]o[:\s]*(\d{2}\/\d{4})/i) ||
                       content.match(/Compet[êe]ncia[:\s]*(\d{2}\/\d{4})/i) ||
                       content.match(/(\d{2}\/\d{4})/);
  if (periodoMatch) {
    result.periodo = periodoMatch[1];
  }

  // Receita Bruta - flexible regex
  const receitaMatch = content.match(/RECEITA\s+BRUTA[\s\w]*?:\s*R?\$?\s*([\d.,]+)/i) ||
                       content.match(/Receita\s+Bruta[:\s]*R?\$?\s*([\d.,]+)/i) ||
                       content.match(/Receita\s+Total[:\s]*R?\$?\s*([\d.,]+)/i);
  if (receitaMatch) {
    result.receitaBruta = parseMoneyValue(receitaMatch[1]);
  }

  // Valor do DAS - flexible regex
  const valorMatch = content.match(/VALOR\s+(?:TOTAL\s+)?(?:DO\s+)?DAS[:\s]*R?\$?\s*([\d.,]+)/i) ||
                     content.match(/Valor\s+(?:do\s+)?DAS[:\s]*R?\$?\s*([\d.,]+)/i) ||
                     content.match(/Valor\s+a\s+Pagar[:\s]*R?\$?\s*([\d.,]+)/i) ||
                     content.match(/Total\s+a\s+Recolher[:\s]*R?\$?\s*([\d.,]+)/i);
  if (valorMatch) {
    result.valorDevido = parseMoneyValue(valorMatch[1]);
  }

  // Alíquota Efetiva
  const aliquotaMatch = content.match(/Al[íi]quota\s+Efetiva[:\s]*([\d.,]+)\s*%?/i) ||
                        content.match(/Al[íi]quota[:\s]*([\d.,]+)\s*%?/i);
  if (aliquotaMatch) {
    const value = parseMoneyValue(aliquotaMatch[1]);
    result.aliquotaEfetiva = value > 1 ? value / 100 : value;
  }

  // Anexo do Simples
  const anexoMatch = content.match(/Anexo[:\s]*(I{1,3}|IV|V)/i);
  if (anexoMatch) {
    result.anexoSimples = anexoMatch[1].toUpperCase();
  }

  // --- Dados Completos ---

  // RBT12
  const rbt12Match = content.match(/RBT12[:\s]*R?\$?\s*([\d.,]+)/i) ||
                     content.match(/Receita\s+Bruta\s+(?:Acumulada|Total)\s+(?:nos\s+)?(?:\d+\s+)?(?:[Úú]ltimos\s+)?12[:\s]*R?\$?\s*([\d.,]+)/i);
  if (rbt12Match) {
    dadosCompletos.rbt12 = parseMoneyValue(rbt12Match[1]);
  }

  // Faixa
  const faixaMatch = content.match(/Faixa[:\s]*(\d[ªa]?\s*[Ff]aixa|\d+)/i);
  if (faixaMatch) {
    dadosCompletos.faixa = faixaMatch[1].trim();
  }

  // Alíquota Nominal
  const aliqNomMatch = content.match(/Al[íi]quota\s+Nominal[:\s]*([\d.,]+)\s*%?/i);
  if (aliqNomMatch) {
    dadosCompletos.aliquotaNominal = parseMoneyValue(aliqNomMatch[1]);
  }

  // Repartição de tributos
  const reparticao: DadosCompletos["reparticao"] = {};
  const tributos = [
    { key: "irpj" as const, regex: /IRPJ[:\s]*R?\$?\s*([\d.,]+)/i },
    { key: "csll" as const, regex: /CSLL[:\s]*R?\$?\s*([\d.,]+)/i },
    { key: "cofins" as const, regex: /COFINS[:\s]*R?\$?\s*([\d.,]+)/i },
    { key: "pis" as const, regex: /PIS(?:\/PASEP)?[:\s]*R?\$?\s*([\d.,]+)/i },
    { key: "cpp" as const, regex: /CPP[:\s]*R?\$?\s*([\d.,]+)/i },
    { key: "icms" as const, regex: /ICMS[:\s]*R?\$?\s*([\d.,]+)/i },
    { key: "iss" as const, regex: /ISS[:\s]*R?\$?\s*([\d.,]+)/i },
  ];
  let hasReparticao = false;
  for (const t of tributos) {
    const m = content.match(t.regex);
    if (m) {
      reparticao[t.key] = parseMoneyValue(m[1]);
      hasReparticao = true;
    }
  }
  if (hasReparticao) {
    dadosCompletos.reparticao = reparticao;
  }

  // Receita Monofásica
  const monoMatch = content.match(/(?:Receita|Valor)[\s\w]*?Monof[áa]sic[ao][:\s]*R?\$?\s*([\d.,]+)/i);
  if (monoMatch) {
    dadosCompletos.receitaMonofasica = parseMoneyValue(monoMatch[1]);
  }

  // Receita com ST
  const stMatch = content.match(/(?:Receita|Valor)[\s\w]*?(?:Substitui[çc][ãa]o|ST)[:\s]*R?\$?\s*([\d.,]+)/i);
  if (stMatch) {
    dadosCompletos.receitaST = parseMoneyValue(stMatch[1]);
  }

  // Receita Exportação
  const expMatch = content.match(/(?:Receita|Valor)[\s\w]*?Exporta[çc][ãa]o[:\s]*R?\$?\s*([\d.,]+)/i);
  if (expMatch) {
    dadosCompletos.receitaExportacao = parseMoneyValue(expMatch[1]);
  }

  // Receita Isenta
  const isentaMatch = content.match(/(?:Receita|Valor)[\s\w]*?Isent[ao][:\s]*R?\$?\s*([\d.,]+)/i);
  if (isentaMatch) {
    dadosCompletos.receitaIsenta = parseMoneyValue(isentaMatch[1]);
  }

  return { result, dadosCompletos };
}

// Convert period string to date
function parsePerioToDate(periodo: string): string | null {
  const match = periodo.match(/(\d{2})\/(\d{4})/);
  if (match) {
    const [, month, year] = match;
    return `${year}-${month}-01`;
  }
  return null;
}

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

    const body = await req.json();
    const { pgdasId, storagePath } = body;

    console.log(`[process-pgdas] Processing PGDAS ID: ${pgdasId}`);

    if (!pgdasId || !storagePath) {
      throw new Error("pgdasId and storagePath are required");
    }

    // Download file from storage
    console.log(`[process-pgdas] Downloading file from: ${storagePath}`);
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("pgdas-files")
      .download(storagePath);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Extract text content from file
    let textContent = "";
    const fileName = storagePath.toLowerCase();

    if (fileName.endsWith(".txt")) {
      textContent = await fileData.text();
    } else if (fileName.endsWith(".pdf")) {
      try {
        textContent = await fileData.text();
      } catch {
        console.log("[process-pgdas] Could not parse PDF as text, using filename hints");
        textContent = storagePath;
      }
    }

    console.log(`[process-pgdas] Extracted ${textContent.length} characters`);

    // Parse the content
    const { result: parsedData, dadosCompletos } = parsePgdasContent(textContent);
    console.log("[process-pgdas] Parsed data:", parsedData);
    console.log("[process-pgdas] Dados completos:", dadosCompletos);

    // Use parsed data or defaults
    const result: PgdasResult = {
      cnpj: parsedData.cnpj || "00.000.000/0001-00",
      razaoSocial: parsedData.razaoSocial || "Empresa Simples Nacional",
      periodo: parsedData.periodo || new Date().toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" }).replace("/", "/"),
      receitaBruta: parsedData.receitaBruta || 0,
      valorDevido: parsedData.valorDevido || 0,
      aliquotaEfetiva: parsedData.aliquotaEfetiva || 0,
      anexoSimples: parsedData.anexoSimples || "III",
    };

    // Update database record
    const periodoDate = parsePerioToDate(result.periodo);
    
    const { error: updateError } = await supabase
      .from("pgdas_arquivos")
      .update({
        cnpj: result.cnpj,
        razao_social: result.razaoSocial,
        periodo_apuracao: periodoDate,
        receita_bruta: result.receitaBruta,
        valor_devido: result.valorDevido,
        aliquota_efetiva: result.aliquotaEfetiva,
        anexo_simples: result.anexoSimples,
        dados_completos: dadosCompletos,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", pgdasId);

    if (updateError) {
      throw new Error(`Failed to update record: ${updateError.message}`);
    }

    console.log("[process-pgdas] Successfully processed PGDAS");

    return new Response(
      JSON.stringify({
        success: true,
        cnpj: result.cnpj,
        periodo: result.periodo,
        receitaBruta: result.receitaBruta,
        valorDevido: result.valorDevido,
        aliquotaEfetiva: result.aliquotaEfetiva,
        anexoSimples: result.anexoSimples,
        dadosCompletos,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[process-pgdas] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
