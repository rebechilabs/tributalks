import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ClauseAnalysis {
  clausula: string;
  tipo: "positivo" | "atencao" | "melhoria";
  descricao: string;
  sugestao?: string;
}

interface DocumentSuggestion {
  titulo: string;
  descricao: string;
  motivo: string;
}

interface LegalAnalysisResult {
  tipoDocumento: string;
  resumoGeral: string;
  pontosPositivos: ClauseAnalysis[];
  pontosAtencao: ClauseAnalysis[];
  sugestoesMelhorias: ClauseAnalysis[];
  documentoSugerido?: DocumentSuggestion;
  avaliacaoGeral: {
    nota: number;
    classificacao: "Excelente" | "Bom" | "Regular" | "Requer Atenção";
  };
}

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { documentBase64, fileName } = await req.json();

    if (!documentBase64) {
      return new Response(
        JSON.stringify({ error: "Document content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysisPrompt = `Você é um advogado experiente especializado em análise de contratos empresariais brasileiros.

Analise este documento jurídico (arquivo: ${fileName || "documento.pdf"}) como um advogado profissional faria.

Sua análise deve incluir:

1. **Identificação do tipo de documento** (Contrato Social, Contrato de Prestação de Serviços, Acordo de Sócios, Contrato de Trabalho, NDA, Contrato de Locação, etc.)

2. **Resumo executivo** do documento em 2-3 frases

3. **Pontos positivos**: Cláusulas bem redigidas que protegem as partes adequadamente

4. **Pontos de atenção**: Cláusulas que podem gerar riscos, ambiguidades ou problemas futuros

5. **Sugestões de melhoria**: Cláusulas ausentes ou que poderiam ser aprimoradas

6. **Recomendação de documento**: Se identificar que outro tipo de documento seria mais adequado para a situação

7. **Avaliação geral**: Nota de 1 a 10 baseada na segurança jurídica do documento

Responda APENAS com um JSON válido no seguinte formato (sem markdown, sem explicações):
{
  "tipoDocumento": "Tipo do documento identificado",
  "resumoGeral": "Resumo executivo do documento em 2-3 frases",
  "pontosPositivos": [
    {
      "clausula": "Nome/número da cláusula",
      "tipo": "positivo",
      "descricao": "Explicação do que está bem feito"
    }
  ],
  "pontosAtencao": [
    {
      "clausula": "Nome/número da cláusula",
      "tipo": "atencao",
      "descricao": "Explicação do risco ou problema",
      "sugestao": "Como corrigir ou mitigar"
    }
  ],
  "sugestoesMelhorias": [
    {
      "clausula": "Cláusula ausente ou a melhorar",
      "tipo": "melhoria",
      "descricao": "O que está faltando ou pode ser melhorado",
      "sugestao": "Redação sugerida ou orientação"
    }
  ],
  "documentoSugerido": {
    "titulo": "Nome do documento recomendado",
    "descricao": "Breve descrição do documento",
    "motivo": "Por que seria mais adequado"
  },
  "avaliacaoGeral": {
    "nota": 7,
    "classificacao": "Bom"
  }
}

Classificações possíveis:
- 8-10: "Excelente"
- 6-7: "Bom"  
- 4-5: "Regular"
- 1-3: "Requer Atenção"

Se documentoSugerido não for aplicável (o documento atual é adequado), use null.

IMPORTANTE:
- Seja específico nas análises, citando cláusulas quando possível
- Foque em aspectos práticos e de risco empresarial
- Mantenha linguagem acessível mas profissional
- Inclua entre 3-6 itens em cada categoria (positivos, atenção, melhorias)`;

    const messages = [
      { 
        role: "system", 
        content: "Você é um advogado empresarial experiente. Analise documentos jurídicos de forma profissional e prática. Responda apenas com JSON válido." 
      },
      { 
        role: "user", 
        content: [
          { type: "text", text: analysisPrompt },
          { 
            type: "file", 
            file: {
              filename: fileName || "document.pdf",
              file_data: `data:application/pdf;base64,${documentBase64}`
            }
          }
        ]
      },
    ];

    console.log("Calling AI for legal document analysis...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI analysis error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Adicione mais créditos para continuar." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysisContent = aiData.choices?.[0]?.message?.content || "";
    
    console.log("AI response received, parsing...");

    // Parse the analysis JSON
    let analysisResult: LegalAnalysisResult;
    try {
      // Remove any markdown formatting if present
      const jsonStr = analysisContent.replace(/```json\n?|\n?```/g, "").trim();
      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", analysisContent);
      // Return a default structure if parsing fails
      analysisResult = {
        tipoDocumento: "Documento não identificado",
        resumoGeral: "Não foi possível analisar completamente o documento. Por favor, verifique se o PDF está legível e tente novamente.",
        pontosPositivos: [],
        pontosAtencao: [{
          clausula: "Análise",
          tipo: "atencao",
          descricao: "O documento não pôde ser analisado completamente. Pode estar ilegível ou em formato não suportado.",
          sugestao: "Tente enviar um PDF com texto selecionável (não escaneado)"
        }],
        sugestoesMelhorias: [],
        avaliacaoGeral: {
          nota: 0,
          classificacao: "Requer Atenção"
        }
      };
    }

    console.log("Analysis complete:", analysisResult.tipoDocumento);

    return new Response(
      JSON.stringify({
        success: true,
        result: analysisResult,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in analyze-document:", error);
    return new Response(
      JSON.stringify({ error: "Ocorreu um erro ao processar sua solicitação." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
