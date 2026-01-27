import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Temas de busca para notícias
const SEARCH_TOPICS = [
  // Reforma Tributária
  {
    query: "reforma tributária Brasil IBS CBS 2026 últimas notícias",
    categoria: "REFORMA",
  },
  {
    query: "split payment nota fiscal eletrônica Brasil",
    categoria: "REFORMA",
  },
  // Economia e Empresas
  {
    query: "economia brasileira empresas mercado financeiro últimas notícias",
    categoria: "ECONOMIA",
  },
  {
    query: "tributação empresas Brasil impostos negócios",
    categoria: "TRIBUTOS",
  },
  // Receita Federal e Fiscalização
  {
    query: "Receita Federal fiscalização empresas novidades",
    categoria: "FISCALIZACAO",
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

    const noticiasEncontradas: NoticiaProcessada[] = [];

    // Buscar notícias para cada tópico
    for (const topic of SEARCH_TOPICS) {
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
                
Retorne EXATAMENTE 3 notícias recentes e relevantes no seguinte formato JSON:
[
  {
    "titulo": "Título da notícia",
    "resumo": "Resumo de 2-3 parágrafos explicando o conteúdo principal",
    "fonte": "Nome do veículo/site"
  }
]

Priorize notícias dos últimos 7 dias de fontes confiáveis como: Valor Econômico, InfoMoney, Folha, Estadão, G1, Portal Contábeis, Receita Federal.`
              },
              {
                role: "user",
                content: topic.query
              }
            ],
            search_recency_filter: "week",
          }),
        });

        if (!response.ok) {
          console.error(`Erro Perplexity para ${topic.categoria}: ${response.status}`);
          continue;
        }

        const data: PerplexityResult = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        const citations = data.citations || [];

        // Tentar parsear o JSON da resposta
        try {
          // Extrair JSON do conteúdo (pode vir com texto extra)
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const noticias = JSON.parse(jsonMatch[0]);
            
            for (let i = 0; i < noticias.length && i < 3; i++) {
              const noticia = noticias[i];
              noticiasEncontradas.push({
                titulo_original: noticia.titulo,
                conteudo_original: noticia.resumo,
                fonte: noticia.fonte || "Perplexity Search",
                fonte_url: citations[i] || "",
                categoria: topic.categoria,
              });
            }
          }
        } catch (parseError) {
          console.error(`Erro ao parsear resposta para ${topic.categoria}:`, parseError);
          // Mesmo sem JSON, criar uma notícia com o conteúdo
          if (content.length > 100) {
            noticiasEncontradas.push({
              titulo_original: `Atualização: ${topic.categoria}`,
              conteudo_original: content.slice(0, 2000),
              fonte: "Perplexity Search",
              fonte_url: citations[0] || "",
              categoria: topic.categoria,
            });
          }
        }

        // Pequeno delay entre requisições para evitar rate limit
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (topicError) {
        console.error(`Erro ao buscar ${topic.categoria}:`, topicError);
      }
    }

    if (noticiasEncontradas.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Nenhuma notícia nova encontrada",
          processadas: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Encontradas ${noticiasEncontradas.length} notícias, enviando para processamento...`);

    // Enviar para processamento com IA (process-news já existe)
    const processResponse = await fetch(`${supabaseUrl}/functions/v1/process-news`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ noticias: noticiasEncontradas }),
    });

    const processResult = await processResponse.json();

    console.log(`Processamento concluído: ${processResult.processadas || 0} notícias`);

    return new Response(
      JSON.stringify({
        success: true,
        noticias_encontradas: noticiasEncontradas.length,
        noticias_processadas: processResult.processadas || 0,
        categorias: [...new Set(noticiasEncontradas.map(n => n.categoria))],
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
