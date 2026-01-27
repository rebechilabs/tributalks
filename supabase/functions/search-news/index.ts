import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Temas de busca para notícias - SEPARADOS EM DOIS GRUPOS
const SEARCH_TOPICS_REFORMA = [
  {
    query: "reforma tributária Brasil IBS CBS 2026 2027 últimas notícias implementação",
    categoria: "REFORMA",
  },
  {
    query: "split payment nota fiscal eletrônica Brasil reforma tributária",
    categoria: "REFORMA",
  },
  {
    query: "transição tributária Brasil IVA dual CBS IBS cronograma",
    categoria: "REFORMA",
  },
  {
    query: "imposto seletivo Brasil reforma tributária produtos tributados",
    categoria: "REFORMA",
  },
  {
    query: "regulamentação reforma tributária LC 214 Senado Câmara votação",
    categoria: "REFORMA",
  },
];

const SEARCH_TOPICS_TRIBUTARIAS = [
  {
    query: "tributação empresas Brasil ICMS PIS COFINS novidades fiscais",
    categoria: "TRIBUTOS",
  },
  {
    query: "Receita Federal fiscalização empresas autuação malha fina",
    categoria: "FISCALIZACAO",
  },
  {
    query: "benefícios fiscais incentivos tributários empresas Brasil estados",
    categoria: "INCENTIVOS",
  },
  {
    query: "obrigações acessórias SPED EFD empresas prazos novidades",
    categoria: "OBRIGACOES",
  },
  {
    query: "jurisprudência tributária STF STJ decisões impostos empresas",
    categoria: "JURISPRUDENCIA",
  },
];

interface PerplexityResult {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  citations?: string[];
}

interface NoticiaProcessada {
  titulo_original: string;
  conteudo_original: string;
  fonte: string;
  fonte_url: string;
  categoria: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar se Perplexity está configurado
    if (!perplexityApiKey) {
      console.error("PERPLEXITY_API_KEY não configurada");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Perplexity não está configurado. Conecte o Perplexity nas configurações do projeto." 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Opcional: verificar autorização para chamadas manuais
    const authHeader = req.headers.get("Authorization");
    let isScheduledJob = false;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      // Se for o anon key, é um cron job agendado
      if (token === Deno.env.get("SUPABASE_ANON_KEY")) {
        isScheduledJob = true;
      } else {
        // Verificar se é admin para chamadas manuais
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
          return new Response(
            JSON.stringify({ error: "Não autorizado" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (!roleData) {
          return new Response(
            JSON.stringify({ error: "Acesso restrito a administradores" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    console.log(`Iniciando busca de notícias (scheduled: ${isScheduledJob})`);

    const noticiasReforma: NoticiaProcessada[] = [];
    const noticiasTributarias: NoticiaProcessada[] = [];

    // Função auxiliar para buscar notícias de um tópico
    async function buscarNoticias(topic: { query: string; categoria: string }, targetArray: NoticiaProcessada[]) {
      console.log(`Buscando: ${topic.query}`);

      try {
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${perplexityApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar",
            messages: [
              {
                role: "system",
                content: `Você é um assistente que busca e resume notícias recentes sobre tributação e economia empresarial no Brasil. 
                
Retorne EXATAMENTE 1 notícia recente e muito relevante no seguinte formato JSON:
[
  {
    "titulo": "Título da notícia (máximo 100 caracteres)",
    "resumo": "Resumo objetivo de 2-3 parágrafos explicando o conteúdo principal e impacto para empresas",
    "fonte": "Nome do veículo/site",
    "relevancia": "ALTA ou MEDIA (ALTA = impacto direto em empresas, MEDIA = informativo)"
  }
]

IMPORTANTE: Só retorne notícias dos últimos 3 dias. Se não houver notícia relevante recente, retorne array vazio [].
Priorize notícias de fontes confiáveis como: Valor Econômico, InfoMoney, Folha, Estadão, G1, Portal Contábeis, Receita Federal, Jota, Conjur.`
              },
              {
                role: "user",
                content: topic.query
              }
            ],
            search_recency_filter: "day",
          }),
        });

        if (!response.ok) {
          console.error(`Erro Perplexity para ${topic.categoria}: ${response.status}`);
          return;
        }

        const data: PerplexityResult = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        const citations = data.citations || [];

        try {
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const noticias = JSON.parse(jsonMatch[0]);
            
            for (const noticia of noticias) {
              // Só adiciona se for relevante
              if (noticia.titulo && noticia.resumo) {
                targetArray.push({
                  titulo_original: noticia.titulo,
                  conteudo_original: noticia.resumo,
                  fonte: noticia.fonte || "Perplexity Search",
                  fonte_url: citations[0] || "",
                  categoria: topic.categoria,
                });
              }
            }
          }
        } catch (parseError) {
          console.error(`Erro ao parsear resposta para ${topic.categoria}:`, parseError);
        }

        // Delay entre requisições
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (topicError) {
        console.error(`Erro ao buscar ${topic.categoria}:`, topicError);
      }
    }

    // Buscar notícias de REFORMA TRIBUTÁRIA (5 tópicos)
    console.log("=== Buscando notícias de REFORMA TRIBUTÁRIA ===");
    for (const topic of SEARCH_TOPICS_REFORMA) {
      await buscarNoticias(topic, noticiasReforma);
    }

    // Buscar notícias TRIBUTÁRIAS GERAIS (5 tópicos)
    console.log("=== Buscando notícias TRIBUTÁRIAS GERAIS ===");
    for (const topic of SEARCH_TOPICS_TRIBUTARIAS) {
      await buscarNoticias(topic, noticiasTributarias);
    }

    // Limitar a 5 de cada grupo
    const reformaFinal = noticiasReforma.slice(0, 5);
    const tributariasFinal = noticiasTributarias.slice(0, 5);

    console.log(`Reforma: ${reformaFinal.length} notícias | Tributárias: ${tributariasFinal.length} notícias`);

    // Só envia para processamento se houver novas notícias
    const todasNoticias = [...reformaFinal, ...tributariasFinal];

    if (todasNoticias.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Nenhuma notícia nova relevante encontrada. Notícias anteriores mantidas.",
          noticias_reforma: 0,
          noticias_tributarias: 0,
          timestamp: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Enviando ${todasNoticias.length} notícias para processamento...`);

    // Enviar para processamento com IA
    const processResponse = await fetch(`${supabaseUrl}/functions/v1/process-news`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ noticias: todasNoticias }),
    });

    const processResult = await processResponse.json();

    console.log(`Processamento concluído: ${processResult.processadas || 0} notícias`);

    return new Response(
      JSON.stringify({
        success: true,
        noticias_reforma: reformaFinal.length,
        noticias_tributarias: tributariasFinal.length,
        noticias_processadas: processResult.processadas || 0,
        categorias_reforma: [...new Set(reformaFinal.map(n => n.categoria))],
        categorias_tributarias: [...new Set(tributariasFinal.map(n => n.categoria))],
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro na busca de notícias:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
