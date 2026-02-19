import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://tributalks.com.br",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Temas de busca REDUZIDOS para evitar timeout (3 queries em vez de 10)
const SEARCH_TOPICS = [
  {
    query: "reforma tributária Brasil IBS CBS split payment 2026 últimas notícias hoje",
    categoria: "REFORMA",
  },
  {
    query: "tributação empresas Brasil ICMS PIS COFINS Receita Federal novidades fiscais hoje",
    categoria: "TRIBUTOS",
  },
  {
    query: "lei complementar tributária Brasil regulamentação impostos decisões STF STJ hoje",
    categoria: "LEGISLACAO",
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

  const startTime = Date.now();
  console.log(`[search-news] Iniciando às ${new Date().toISOString()}`);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar se Perplexity está configurado
    if (!perplexityApiKey) {
      console.error("[search-news] PERPLEXITY_API_KEY não configurada");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Perplexity não está configurado" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Permitir chamadas do cron (anon key) ou admins
    const authHeader = req.headers.get("Authorization");
    const isScheduledJob = authHeader?.includes(Deno.env.get("SUPABASE_ANON_KEY") || "INVALID");
    
    console.log(`[search-news] Chamada via cron: ${isScheduledJob}`);

    const noticias: NoticiaProcessada[] = [];

    // Buscar todas as queries em PARALELO para ser mais rápido
    const promises = SEARCH_TOPICS.map(async (topic) => {
      console.log(`[search-news] Buscando: ${topic.categoria}`);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout por query

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
                content: `Você busca notícias tributárias do Brasil. Retorne EXATAMENTE 2 notícias recentes em JSON:
[{"titulo": "Título curto", "resumo": "Resumo de 2 parágrafos", "fonte": "Nome do veículo"}]
APENAS notícias das últimas 24 horas. Se não houver, retorne [].`
              },
              { role: "user", content: topic.query }
            ],
            search_recency_filter: "day",
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error(`[search-news] Erro Perplexity ${topic.categoria}: ${response.status}`);
          return [];
        }

        const data: PerplexityResult = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        const citations = data.citations || [];

        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed.map((n: any) => ({
            titulo_original: n.titulo || "",
            conteudo_original: n.resumo || "",
            fonte: n.fonte || "Perplexity",
            fonte_url: citations[0] || "",
            categoria: topic.categoria,
          })).filter((n: NoticiaProcessada) => n.titulo_original.length > 10);
        }
        return [];
      } catch (err) {
        console.error(`[search-news] Erro ${topic.categoria}:`, err);
        return [];
      }
    });

    const results = await Promise.all(promises);
    results.forEach(r => noticias.push(...r));

    console.log(`[search-news] Total encontradas: ${noticias.length}`);

    if (noticias.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Nenhuma notícia nova nas últimas 24h",
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Inserir diretamente no banco (mais rápido que chamar outra função)
    let insertedCount = 0;
    for (const noticia of noticias.slice(0, 6)) { // Máximo 6 notícias
      // Verificar duplicatas pelo título
      const { data: existing } = await supabase
        .from("noticias_tributarias")
        .select("id")
        .ilike("titulo_original", `%${noticia.titulo_original.slice(0, 50)}%`)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log(`[search-news] Notícia duplicada: ${noticia.titulo_original.slice(0, 40)}...`);
        continue;
      }

      const { error } = await supabase.from("noticias_tributarias").insert({
        titulo_original: noticia.titulo_original,
        conteudo_original: noticia.conteudo_original,
        fonte: noticia.fonte,
        fonte_url: noticia.fonte_url,
        categoria: noticia.categoria,
        resumo_executivo: noticia.conteudo_original.slice(0, 500),
        relevancia: "MEDIA",
        publicado: true,
        data_publicacao: new Date().toISOString(),
      });

      if (error) {
        console.error(`[search-news] Erro insert:`, error);
      } else {
        insertedCount++;
        console.log(`[search-news] Inserida: ${noticia.titulo_original.slice(0, 40)}...`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[search-news] Finalizado em ${duration}ms. Inseridas: ${insertedCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        noticias_encontradas: noticias.length,
        noticias_inseridas: insertedCount,
        timestamp: new Date().toISOString(),
        duration_ms: duration,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[search-news] Erro geral:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro desconhecido",
        duration_ms: Date.now() - startTime,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});