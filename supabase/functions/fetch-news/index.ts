import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fontes configuradas para busca automática (quando Firecrawl estiver ativo)
const FONTES_TRIBUTARIAS = [
  {
    nome: "Receita Federal",
    url: "https://www.gov.br/receitafederal/pt-br/assuntos/noticias",
    seletorConteudo: ".noticias-listagem",
  },
  {
    nome: "PGFN",
    url: "https://www.gov.br/pgfn/pt-br/assuntos/noticias",
    seletorConteudo: ".noticias-listagem",
  },
  {
    nome: "Confaz",
    url: "https://www.confaz.fazenda.gov.br/noticias",
    seletorConteudo: ".news-listing",
  },
  {
    nome: "Portal Tributário",
    url: "https://www.portaltributario.com.br/noticias/",
    seletorConteudo: ".news-content",
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Se Firecrawl não está configurado, retornar modo manual
    if (!FIRECRAWL_API_KEY) {
      console.log("Firecrawl não configurado - modo manual ativo");
      
      return new Response(
        JSON.stringify({
          success: true,
          modo: "manual",
          message: "Firecrawl não está configurado. Use o endpoint /process-news para inserir notícias manualmente.",
          fontes_disponiveis: FONTES_TRIBUTARIAS.map((f) => ({
            nome: f.nome,
            url: f.url,
          })),
          instrucoes: {
            endpoint: "/functions/v1/process-news",
            metodo: "POST",
            body: {
              noticias: [
                {
                  fonte: "Nome da Fonte",
                  fonte_url: "https://url-da-noticia.com",
                  titulo: "Título da Notícia",
                  conteudo: "Conteúdo completo da notícia...",
                },
              ],
            },
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Firecrawl está configurado - buscar notícias automaticamente
    console.log("Firecrawl configurado - iniciando busca automática");

    const noticiasEncontradas: Array<{
      fonte: string;
      fonte_url: string;
      titulo: string;
      conteudo: string;
    }> = [];

    for (const fonte of FONTES_TRIBUTARIAS) {
      console.log(`Buscando notícias de: ${fonte.nome}`);

      try {
        // Usar Firecrawl para scraping
        const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: fonte.url,
            formats: ["markdown", "links"],
            onlyMainContent: true,
          }),
        });

        if (!scrapeResponse.ok) {
          console.error(`Erro ao buscar ${fonte.nome}: ${scrapeResponse.status}`);
          continue;
        }

        const scrapeData = await scrapeResponse.json();
        const markdown = scrapeData.data?.markdown || scrapeData.markdown;
        const links = scrapeData.data?.links || scrapeData.links || [];

        if (markdown) {
          // Extrair notícias do conteúdo
          // Dividir por títulos (linhas que começam com #)
          const sections = markdown.split(/\n(?=#+\s)/);

          for (const section of sections.slice(0, 5)) {
            // Limitar a 5 notícias por fonte
            const lines = section.trim().split("\n");
            const titulo = lines[0]?.replace(/^#+\s*/, "").trim();
            const conteudo = lines.slice(1).join("\n").trim();

            if (titulo && conteudo && titulo.length > 10) {
              // Encontrar link relacionado
              const linkRelacionado = links.find(
                (l: string) =>
                  l.toLowerCase().includes(titulo.toLowerCase().slice(0, 20)) ||
                  titulo.toLowerCase().includes(l.split("/").pop()?.replace(/-/g, " ") || "")
              );

              noticiasEncontradas.push({
                fonte: fonte.nome,
                fonte_url: linkRelacionado || fonte.url,
                titulo,
                conteudo: conteudo.slice(0, 5000), // Limitar tamanho
              });
            }
          }
        }
      } catch (sourceError) {
        console.error(`Erro ao processar ${fonte.nome}:`, sourceError);
      }
    }

    if (noticiasEncontradas.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          modo: "automatico",
          message: "Nenhuma notícia nova encontrada nas fontes",
          fontes_verificadas: FONTES_TRIBUTARIAS.length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enviar para processamento com IA
    const processResponse = await fetch(`${supabaseUrl}/functions/v1/process-news`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ noticias: noticiasEncontradas }),
    });

    const processResult = await processResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        modo: "automatico",
        noticias_encontradas: noticiasEncontradas.length,
        noticias_processadas: processResult.processadas || 0,
        fontes_verificadas: FONTES_TRIBUTARIAS.length,
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
