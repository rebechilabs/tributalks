import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://tributalks.com.br",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AlertConfig {
  user_id: string;
  ativo: boolean;
  setores_filtro: string[];
  regimes_filtro: string[];
  relevancia_minima: string;
}

interface UserProfile {
  user_id: string;
  email: string;
  nome: string;
  plano: string;
}

interface Noticia {
  id: string;
  titulo_original: string;
  resumo_executivo: string;
  relevancia: string;
  setores_afetados: string[];
  regimes_afetados: string[];
  fonte: string;
  data_publicacao: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar notícias das últimas 24 horas
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);

    const { data: noticias, error: noticiasError } = await supabase
      .from("noticias_tributarias")
      .select("*")
      .eq("publicado", true)
      .gte("data_publicacao", ontem.toISOString())
      .order("data_publicacao", { ascending: false });

    if (noticiasError) {
      throw noticiasError;
    }

    if (!noticias || noticias.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Nenhuma notícia nova para enviar alertas",
          alertas_enviados: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`${noticias.length} notícias encontradas para alertas`);

    // Buscar usuários com alertas ativos (plano Basic ou superior)
    const { data: alertConfigs, error: alertError } = await supabase
      .from("alertas_configuracao")
      .select("*")
      .eq("ativo", true);

    if (alertError) {
      throw alertError;
    }

    if (!alertConfigs || alertConfigs.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Nenhum usuário com alertas ativos",
          alertas_enviados: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar perfis dos usuários com alertas
    const userIds = alertConfigs.map((c) => c.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, email, nome, plano")
      .in("user_id", userIds)
      .in("plano", ["BASIC", "PREMIUM", "ENTERPRISE"]);

    if (profilesError) {
      throw profilesError;
    }

    const relevanciaOrdem = { ALTA: 3, MEDIA: 2, BAIXA: 1 };
    let alertasPreparados = 0;

    for (const profile of profiles || []) {
      const config = alertConfigs.find((c) => c.user_id === profile.user_id);
      if (!config) continue;

      // Filtrar notícias para este usuário
      const noticiasParaUsuario = (noticias as Noticia[]).filter((noticia) => {
        // Filtro de relevância
        const relevanciaNotiica = relevanciaOrdem[noticia.relevancia as keyof typeof relevanciaOrdem] || 0;
        const relevanciaMinima = relevanciaOrdem[config.relevancia_minima as keyof typeof relevanciaOrdem] || 0;
        if (relevanciaNotiica < relevanciaMinima) return false;

        // Filtro de setores (se configurado)
        if (config.setores_filtro && config.setores_filtro.length > 0) {
          const temSetorComum = config.setores_filtro.some((s: string) =>
            noticia.setores_afetados?.includes(s)
          );
          if (!temSetorComum) return false;
        }

        // Filtro de regimes (se configurado)
        if (config.regimes_filtro && config.regimes_filtro.length > 0) {
          const temRegimeComum = config.regimes_filtro.some((r: string) =>
            noticia.regimes_afetados?.includes(r)
          );
          if (!temRegimeComum) return false;
        }

        return true;
      });

      if (noticiasParaUsuario.length === 0) continue;

      // Preparar conteúdo do e-mail
      const emailContent = {
        to: profile.email,
        subject: `📰 ${noticiasParaUsuario.length} nova(s) notícia(s) tributária(s) - TribuTalks`,
        html: gerarEmailHTML(profile.nome || "Usuário", noticiasParaUsuario),
      };

      console.log(`Alerta preparado para ${profile.email}: ${noticiasParaUsuario.length} notícias`);
      alertasPreparados++;

      // TODO: Quando Resend estiver configurado, enviar e-mail
      // Por enquanto, apenas logamos o alerta preparado
      console.log("Email preparado:", emailContent.subject);
    }

    return new Response(
      JSON.stringify({
        success: true,
        noticias_disponiveis: noticias.length,
        usuarios_com_alertas: profiles?.length || 0,
        alertas_preparados: alertasPreparados,
        message: "Alertas preparados. Configure Resend para envio automático de e-mails.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao enviar alertas:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function gerarEmailHTML(nome: string, noticias: Noticia[]): string {
  const noticiasHTML = noticias
    .map(
      (n) => `
    <div style="margin-bottom: 24px; padding: 16px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid ${
      n.relevancia === "ALTA" ? "#dc3545" : n.relevancia === "MEDIA" ? "#ffc107" : "#28a745"
    };">
      <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 16px;">
        ${n.titulo_original}
      </h3>
      <p style="margin: 0 0 12px 0; color: #666; font-size: 14px; line-height: 1.5;">
        ${n.resumo_executivo}
      </p>
      <div style="display: flex; gap: 12px; font-size: 12px; color: #888;">
        <span>📍 ${n.fonte}</span>
        <span>🏷️ ${n.relevancia}</span>
      </div>
    </div>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">
          📰 TribuTalks News
        </h1>
        <p style="color: #666; margin: 8px 0 0 0;">
          Seu resumo de notícias tributárias
        </p>
      </div>
      
      <p style="color: #333; font-size: 16px; margin-bottom: 24px;">
        Olá, ${nome}!
      </p>
      
      <p style="color: #666; font-size: 14px; margin-bottom: 24px;">
        Encontramos <strong>${noticias.length}</strong> notícia(s) relevante(s) para você nas últimas 24 horas:
      </p>
      
      ${noticiasHTML}
      
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; text-align: center;">
        <a href="https://tributalks.com.br/noticias" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
          Ver todas as notícias
        </a>
      </div>
      
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
        Você está recebendo este e-mail porque ativou os alertas de notícias tributárias.<br>
        <a href="https://tributalks.com.br/configuracoes" style="color: #666;">Gerenciar preferências</a>
      </p>
    </body>
    </html>
  `;
}
