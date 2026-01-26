import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractedData {
  razaoSocial?: string;
  cnpj?: string;
  cnaesPrincipais?: string[];
  cnaesSecundarios?: string[];
  objetoSocial?: string;
  regimeTributario?: string;
  capitalSocial?: number;
  dataConstituicao?: string;
  socios?: { nome: string; participacao?: number }[];
  endereco?: { cidade?: string; uf?: string };
  atividadesIdentificadas?: string[];
}

interface MatchedOpportunity {
  id: string;
  code: string;
  name: string;
  nameSimples: string;
  category: string;
  matchScore: number;
  matchReasons: string[];
  economiaDescricao?: string;
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

    const userId = claimsData.claims.sub;

    const { documentText, documentType } = await req.json();

    if (!documentText) {
      return new Response(
        JSON.stringify({ error: "Document text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Extract data from document using AI
    const extractionPrompt = `Você é um especialista em análise de documentos societários brasileiros.

Analise o seguinte texto extraído de um ${documentType || "Contrato Social"} e extraia as informações estruturadas.

TEXTO DO DOCUMENTO:
${documentText.substring(0, 15000)}

Responda APENAS com um JSON válido no seguinte formato (sem markdown, sem explicações):
{
  "razaoSocial": "Nome completo da empresa",
  "cnpj": "00.000.000/0000-00",
  "cnaesPrincipais": ["0000-0/00"],
  "cnaesSecundarios": ["0000-0/00"],
  "objetoSocial": "Descrição resumida do objeto social",
  "regimeTributario": "Simples Nacional|Lucro Presumido|Lucro Real|Não identificado",
  "capitalSocial": 100000,
  "dataConstituicao": "2020-01-15",
  "socios": [{"nome": "Nome do Sócio", "participacao": 50}],
  "endereco": {"cidade": "São Paulo", "uf": "SP"},
  "atividadesIdentificadas": ["Comércio varejista", "Prestação de serviços de TI"]
}

Se algum campo não for encontrado, use null. Mantenha o JSON válido.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Você é um analisador de documentos. Responda apenas com JSON válido." },
          { role: "user", content: extractionPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI extraction error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI extraction failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const extractedContent = aiData.choices?.[0]?.message?.content || "";
    
    // Parse the extracted JSON
    let extractedData: ExtractedData;
    try {
      // Remove any markdown formatting if present
      const jsonStr = extractedContent.replace(/```json\n?|\n?```/g, "").trim();
      extractedData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", extractedContent);
      extractedData = {
        razaoSocial: "Não identificado",
        atividadesIdentificadas: [],
      };
    }

    // Step 2: Fetch tax opportunities for matching
    const { data: opportunities, error: oppError } = await supabase
      .from("tax_opportunities")
      .select("*")
      .eq("is_active", true);

    if (oppError) {
      console.error("Error fetching opportunities:", oppError);
      throw oppError;
    }

    // Step 3: Match opportunities based on extracted data
    const matchedOpportunities: MatchedOpportunity[] = [];

    for (const opp of opportunities || []) {
      const matchReasons: string[] = [];
      let matchScore = 0;

      // Check CNAE matches
      const allCnaes = [...(extractedData.cnaesPrincipais || []), ...(extractedData.cnaesSecundarios || [])];
      const criterios = opp.criterios as Record<string, any>;
      
      if (criterios?.cnae_prefix && allCnaes.length > 0) {
        const prefixes = Array.isArray(criterios.cnae_prefix) ? criterios.cnae_prefix : [criterios.cnae_prefix];
        for (const cnae of allCnaes) {
          for (const prefix of prefixes) {
            if (cnae.startsWith(prefix)) {
              matchScore += 30;
              matchReasons.push(`CNAE ${cnae} compatível`);
              break;
            }
          }
        }
      }

      // Check regime tributário
      if (extractedData.regimeTributario) {
        if (criterios?.regime_tributario) {
          const regimes = Array.isArray(criterios.regime_tributario) 
            ? criterios.regime_tributario 
            : [criterios.regime_tributario];
          
          if (regimes.some((r: string) => 
            extractedData.regimeTributario?.toLowerCase().includes(r.toLowerCase())
          )) {
            matchScore += 20;
            matchReasons.push(`Regime ${extractedData.regimeTributario} elegível`);
          }
        }
      }

      // Check sector/category keywords
      const objetoSocial = extractedData.objetoSocial?.toLowerCase() || "";
      const atividades = extractedData.atividadesIdentificadas?.join(" ").toLowerCase() || "";
      const textToSearch = objetoSocial + " " + atividades;

      const categoryKeywords: Record<string, string[]> = {
        "Agro": ["agropecuária", "rural", "agricultura", "pecuária", "fazenda"],
        "Saúde": ["médico", "hospital", "clínica", "saúde", "farmácia", "laboratório"],
        "Tecnologia": ["software", "tecnologia", "informática", "sistemas", "desenvolvimento"],
        "Construção": ["construção", "engenharia", "imobiliária", "edificações"],
        "Comércio": ["comércio", "varejo", "atacado", "loja", "venda"],
        "Indústria": ["indústria", "fabricação", "manufatura", "produção"],
        "Transporte": ["transporte", "logística", "frete", "carga"],
        "Educação": ["educação", "ensino", "escola", "faculdade", "curso"],
        "Alimentação": ["restaurante", "alimentação", "bar", "lanchonete"],
      };

      if (opp.category && categoryKeywords[opp.category]) {
        const keywords = categoryKeywords[opp.category];
        for (const keyword of keywords) {
          if (textToSearch.includes(keyword)) {
            matchScore += 25;
            matchReasons.push(`Setor ${opp.category} identificado no objeto social`);
            break;
          }
        }
      }

      // Check UF-specific benefits
      if (extractedData.endereco?.uf) {
        if (criterios?.uf_operacao?.includes(extractedData.endereco.uf)) {
          matchScore += 15;
          matchReasons.push(`Benefício disponível em ${extractedData.endereco.uf}`);
        }
      }

      // Only include if there's at least one match reason
      if (matchScore > 0 && matchReasons.length > 0) {
        matchedOpportunities.push({
          id: opp.id,
          code: opp.code,
          name: opp.name,
          nameSimples: opp.name_simples,
          category: opp.category || "Geral",
          matchScore: Math.min(matchScore, 100),
          matchReasons: [...new Set(matchReasons)],
          economiaDescricao: opp.economia_descricao_simples,
        });
      }
    }

    // Sort by match score
    matchedOpportunities.sort((a, b) => b.matchScore - a.matchScore);

    // Return results
    return new Response(
      JSON.stringify({
        success: true,
        extractedData,
        matchedOpportunities: matchedOpportunities.slice(0, 15),
        totalMatches: matchedOpportunities.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in analyze-document:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Internal server error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
