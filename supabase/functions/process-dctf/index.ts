import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://tributalks.com.br",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Mapeamento de códigos de receita para descrições
const CODIGOS_RECEITA: Record<string, string> = {
  "0220": "IRRF - Rendimentos do Trabalho",
  "0561": "IRRF - Rendimentos do Trabalho Assalariado",
  "1708": "IRRF - Remuneração de Serviços Prestados por PJ",
  "2063": "PIS/PASEP - Faturamento",
  "2172": "COFINS - Faturamento",
  "3208": "IRPJ - Lucro Real Mensal",
  "2089": "CSLL - Lucro Real Mensal",
  "0588": "IPI - Outros",
  "8109": "IRPJ - Lucro Real Trimestral",
  "2484": "CSLL - Lucro Real Trimestral",
  "2372": "CSLL - Lucro Presumido",
  "2456": "IRPJ - Lucro Presumido",
  "5856": "COFINS - Não Cumulativa",
  "6912": "PIS - Não Cumulativa",
  "8301": "IRRF - Juros sobre Capital Próprio",
  "5952": "PIS - Importação",
  "5960": "COFINS - Importação",
};

interface DCTFDebito {
  codigoReceita: string;
  descricaoTributo: string;
  periodoApuracao: string;
  valorPrincipal: number;
  valorMulta: number;
  valorJuros: number;
  valorTotal: number;
  creditoVinculado: number;
  pagamentoVinculado: number;
  saldoDevedor: number;
}

interface DCTFParsed {
  cnpj: string;
  razaoSocial: string;
  periodoApuracao: string;
  anoCalendario: number;
  mesReferencia: number;
  tipoDeclaracao: string;
  retificadora: boolean;
  debitos: DCTFDebito[];
  totalDebitos: number;
  totalCreditos: number;
  totalPagamentos: number;
  gapIdentificado: number;
}

function parseDCTF(content: string): DCTFParsed {
  const lines = content.split("\n").filter((l) => l.trim());
  
  let cnpj = "";
  let razaoSocial = "";
  let periodoApuracao = "";
  let anoCalendario = new Date().getFullYear();
  let mesReferencia = 1;
  let tipoDeclaracao = "Original";
  let retificadora = false;
  
  const debitos: DCTFDebito[] = [];
  let totalDebitos = 0;
  let totalCreditos = 0;
  let totalPagamentos = 0;

  for (const line of lines) {
    const campos = line.split("|");
    const registro = campos[1];

    // Registro 0000 - Abertura
    if (registro === "0000") {
      cnpj = campos[6] || "";
      razaoSocial = campos[7] || "";
      const dtIni = campos[3] || "";
      const dtFim = campos[4] || "";
      
      if (dtIni.length === 8) {
        anoCalendario = parseInt(dtIni.substring(4, 8));
        mesReferencia = parseInt(dtIni.substring(2, 4));
        periodoApuracao = `${mesReferencia.toString().padStart(2, "0")}/${anoCalendario}`;
      }
      
      tipoDeclaracao = campos[2] === "1" ? "Original" : "Retificadora";
      retificadora = campos[2] !== "1";
    }

    // Registro R200 - Débitos declarados (simulação baseada em layout típico)
    if (registro === "R200" || registro === "Y540" || registro === "0120") {
      const codigoReceita = campos[2] || "";
      const valorPrincipal = parseFloat(campos[3]?.replace(",", ".") || "0");
      const valorMulta = parseFloat(campos[4]?.replace(",", ".") || "0");
      const valorJuros = parseFloat(campos[5]?.replace(",", ".") || "0");
      const valorTotal = valorPrincipal + valorMulta + valorJuros;
      const creditoVinculado = parseFloat(campos[6]?.replace(",", ".") || "0");
      const pagamentoVinculado = parseFloat(campos[7]?.replace(",", ".") || "0");
      const saldoDevedor = valorTotal - creditoVinculado - pagamentoVinculado;

      if (codigoReceita && valorTotal > 0) {
        debitos.push({
          codigoReceita,
          descricaoTributo: CODIGOS_RECEITA[codigoReceita] || `Tributo ${codigoReceita}`,
          periodoApuracao,
          valorPrincipal,
          valorMulta,
          valorJuros,
          valorTotal,
          creditoVinculado,
          pagamentoVinculado,
          saldoDevedor: Math.max(0, saldoDevedor),
        });

        totalDebitos += valorTotal;
        totalCreditos += creditoVinculado;
        totalPagamentos += pagamentoVinculado;
      }
    }

    // Registro 0120 - Débitos por código de receita (layout alternativo)
    if (registro === "0120") {
      const codigoReceita = campos[2] || "";
      const valorDebito = parseFloat(campos[3]?.replace(",", ".") || "0");
      
      if (codigoReceita && valorDebito > 0 && !debitos.find(d => d.codigoReceita === codigoReceita)) {
        debitos.push({
          codigoReceita,
          descricaoTributo: CODIGOS_RECEITA[codigoReceita] || `Tributo ${codigoReceita}`,
          periodoApuracao,
          valorPrincipal: valorDebito,
          valorMulta: 0,
          valorJuros: 0,
          valorTotal: valorDebito,
          creditoVinculado: 0,
          pagamentoVinculado: 0,
          saldoDevedor: valorDebito,
        });

        totalDebitos += valorDebito;
      }
    }
  }

  // Se não encontrou débitos estruturados, tenta parser genérico
  if (debitos.length === 0) {
    for (const line of lines) {
      const campos = line.split("|").filter(c => c.trim());
      
      // Procura por padrões de código de receita (4 dígitos) seguido de valores
      for (let i = 0; i < campos.length - 1; i++) {
        const campo = campos[i].trim();
        if (/^\d{4}$/.test(campo) && CODIGOS_RECEITA[campo]) {
          const proximoValor = parseFloat(campos[i + 1]?.replace(",", ".") || "0");
          if (proximoValor > 0) {
            debitos.push({
              codigoReceita: campo,
              descricaoTributo: CODIGOS_RECEITA[campo],
              periodoApuracao,
              valorPrincipal: proximoValor,
              valorMulta: 0,
              valorJuros: 0,
              valorTotal: proximoValor,
              creditoVinculado: 0,
              pagamentoVinculado: 0,
              saldoDevedor: proximoValor,
            });
            totalDebitos += proximoValor;
          }
        }
      }
    }
  }

  const gapIdentificado = Math.max(0, totalDebitos - totalCreditos - totalPagamentos);

  return {
    cnpj,
    razaoSocial,
    periodoApuracao,
    anoCalendario,
    mesReferencia,
    tipoDeclaracao,
    retificadora,
    debitos,
    totalDebitos,
    totalCreditos,
    totalPagamentos,
    gapIdentificado,
  };
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

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      throw new Error("No file provided");
    }

    const content = await file.text();
    const parsed = parseDCTF(content);

    // Insert declaration header
    const { data: dctfData, error: dctfError } = await supabase
      .from("dctf_declaracoes")
      .insert({
        user_id: user.id,
        cnpj: parsed.cnpj,
        razao_social: parsed.razaoSocial,
        periodo_apuracao: parsed.periodoApuracao,
        ano_calendario: parsed.anoCalendario,
        mes_referencia: parsed.mesReferencia,
        tipo_declaracao: parsed.tipoDeclaracao,
        retificadora: parsed.retificadora,
        arquivo_nome: file.name,
        total_debitos_declarados: parsed.totalDebitos,
        total_creditos_vinculados: parsed.totalCreditos,
        total_pagamentos: parsed.totalPagamentos,
        gap_identificado: parsed.gapIdentificado,
      })
      .select()
      .single();

    if (dctfError) {
      throw dctfError;
    }

    // Insert debits
    if (parsed.debitos.length > 0) {
      const debitosInsert = parsed.debitos.map((d) => ({
        dctf_id: dctfData.id,
        user_id: user.id,
        codigo_receita: d.codigoReceita,
        descricao_tributo: d.descricaoTributo,
        periodo_apuracao: d.periodoApuracao,
        valor_principal: d.valorPrincipal,
        valor_multa: d.valorMulta,
        valor_juros: d.valorJuros,
        valor_total: d.valorTotal,
        credito_vinculado: d.creditoVinculado,
        pagamento_vinculado: d.pagamentoVinculado,
        saldo_devedor: d.saldoDevedor,
        status_quitacao: d.saldoDevedor > 0 ? "pendente" : "quitado",
      }));

      const { error: debitosError } = await supabase
        .from("dctf_debitos")
        .insert(debitosInsert);

      if (debitosError) {
        console.error("Error inserting debitos:", debitosError);
      }
    }

    // Create identified credits for gaps found
    if (parsed.gapIdentificado > 0) {
      const { error: creditError } = await supabase
        .from("identified_credits")
        .insert({
          user_id: user.id,
          nfe_number: `DCTF-${parsed.periodoApuracao}`,
          nfe_date: new Date().toISOString(),
          supplier_name: parsed.razaoSocial || "DCTF",
          supplier_cnpj: parsed.cnpj,
          product_description: `Gap identificado DCTF ${parsed.periodoApuracao}`,
          original_tax_value: parsed.totalDebitos,
          potential_recovery: parsed.gapIdentificado,
          confidence_level: "medium",
          confidence_score: 70,
          status: "pendente",
        });

      if (creditError) {
        console.error("Error creating identified credit:", creditError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        dctf_id: dctfData.id,
        summary: {
          cnpj: parsed.cnpj,
          razaoSocial: parsed.razaoSocial,
          periodo: parsed.periodoApuracao,
          totalDebitos: parsed.totalDebitos,
          totalCreditos: parsed.totalCreditos,
          totalPagamentos: parsed.totalPagamentos,
          gapIdentificado: parsed.gapIdentificado,
          quantidadeDebitos: parsed.debitos.length,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing DCTF:", error);
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
