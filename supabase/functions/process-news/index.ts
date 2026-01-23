import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsInput {
  fonte: string;
  fonte_url?: string;
  titulo: string;
  conteudo: string;
}

interface ProcessedNews {
  titulo_original: string;
  fonte: string;
  fonte_url?: string;
  conteudo_original: string;
  resumo_executivo: string;
  o_que_muda: string;
  quem_e_afetado: string;
  acao_recomendada: string;
  relevancia: "ALTA" | "MEDIA" | "BAIXA";
  categoria: string;
  setores_afetados: string[];
  regimes_afetados: string[];
  tributos_relacionados: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar autenticação e autorização admin
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

    // Verificar se o usuário tem role de admin
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.log(`Acesso negado para usuário ${user.email} - não é admin`);
      return new Response(
        JSON.stringify({ error: "Acesso restrito a administradores" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { noticias }: { noticias: NewsInput[] } = await req.json();

    if (!noticias || !Array.isArray(noticias) || noticias.length === 0) {
      return new Response(
        JSON.stringify({ error: "Array de notícias é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const processedNews: ProcessedNews[] = [];

    for (const noticia of noticias) {
      console.log(`Processando: ${noticia.titulo}`);

      const systemPrompt = `Você é um especialista em tributação brasileira. Sua tarefa é analisar notícias tributárias e extrair informações estruturadas para empresários e contadores.

Analise a notícia e retorne um JSON com os seguintes campos:
- resumo_executivo: Resumo de 2-3 frases do impacto principal
- o_que_muda: Explicação clara das mudanças (máx 3 parágrafos)
- quem_e_afetado: Quem será impactado por essa mudança
- acao_recomendada: O que a empresa deve fazer (ação prática)
- relevancia: "ALTA" (impacto imediato/grande), "MEDIA" (impacto moderado) ou "BAIXA" (informativo)
- categoria: "LEGISLACAO", "JURISPRUDENCIA", "NOTICIA", "GUIA" ou "ALERTA"
- setores_afetados: Array de setores (ex: ["Varejo", "Serviços", "Indústria"])
- regimes_afetados: Array de regimes (ex: ["Simples Nacional", "Lucro Presumido", "Lucro Real"])
- tributos_relacionados: Array de tributos (ex: ["ICMS", "IBS", "CBS", "PIS", "COFINS"])

Responda APENAS com o JSON, sem explicações adicionais.`;

      const userPrompt = `Analise esta notícia tributária:

TÍTULO: ${noticia.titulo}

FONTE: ${noticia.fonte}

CONTEÚDO:
${noticia.conteudo}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.error("Rate limit exceeded");
          return new Response(
            JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          console.error("Payment required");
          return new Response(
            JSON.stringify({ error: "Créditos insuficientes. Adicione créditos para continuar." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices?.[0]?.message?.content;

      if (!content) {
        console.error("Resposta vazia da IA");
        continue;
      }

      // Parse JSON da resposta
      let parsed;
      try {
        // Remove possíveis marcadores de código
        const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        parsed = JSON.parse(cleanContent);
      } catch (parseError) {
        console.error("Erro ao parsear resposta da IA:", parseError);
        console.log("Conteúdo recebido:", content);
        continue;
      }

      const processed: ProcessedNews = {
        titulo_original: noticia.titulo,
        fonte: noticia.fonte,
        fonte_url: noticia.fonte_url,
        conteudo_original: noticia.conteudo,
        resumo_executivo: parsed.resumo_executivo || "",
        o_que_muda: parsed.o_que_muda || "",
        quem_e_afetado: parsed.quem_e_afetado || "",
        acao_recomendada: parsed.acao_recomendada || "",
        relevancia: parsed.relevancia || "MEDIA",
        categoria: parsed.categoria || "NOTICIA",
        setores_afetados: parsed.setores_afetados || [],
        regimes_afetados: parsed.regimes_afetados || [],
        tributos_relacionados: parsed.tributos_relacionados || [],
      };

      processedNews.push(processed);
    }

    // Inserir no banco de dados
    if (processedNews.length > 0) {
      const { data, error } = await supabase
        .from("noticias_tributarias")
        .insert(
          processedNews.map((news) => ({
            titulo_original: news.titulo_original,
            fonte: news.fonte,
            fonte_url: news.fonte_url,
            conteudo_original: news.conteudo_original,
            resumo_executivo: news.resumo_executivo,
            o_que_muda: news.o_que_muda,
            quem_e_afetado: news.quem_e_afetado,
            acao_recomendada: news.acao_recomendada,
            relevancia: news.relevancia,
            categoria: news.categoria,
            setores_afetados: news.setores_afetados,
            regimes_afetados: news.regimes_afetados,
            tributos_relacionados: news.tributos_relacionados,
            publicado: true,
            data_publicacao: new Date().toISOString(),
          }))
        )
        .select();

      if (error) {
        console.error("Erro ao inserir notícias:", error);
        throw error;
      }

      console.log(`${data?.length} notícias processadas e salvas`);

      return new Response(
        JSON.stringify({
          success: true,
          processadas: data?.length || 0,
          noticias: data,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        processadas: 0,
        message: "Nenhuma notícia foi processada com sucesso",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro no processamento:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
