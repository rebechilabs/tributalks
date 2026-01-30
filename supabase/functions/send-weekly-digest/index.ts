import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get users who opted in for weekly digest
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, email, nome, regime, setor')
      .eq('notif_novidades', true)
      .eq('onboarding_complete', true);

    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Nenhum usuário optou pelo resumo semanal',
        processed: 0 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get recent news
    const { data: recentNews } = await supabase
      .from('noticias_tributarias')
      .select('titulo_original, resumo_executivo, relevancia')
      .eq('publicado', true)
      .gt('created_at', oneWeekAgo.toISOString())
      .order('relevancia', { ascending: false })
      .limit(3);

    // Get upcoming deadlines
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const { data: upcomingDeadlines } = await supabase
      .from('prazos_reforma')
      .select('titulo, data_prazo, tipo')
      .eq('ativo', true)
      .gte('data_prazo', new Date().toISOString().split('T')[0])
      .lte('data_prazo', nextMonth.toISOString().split('T')[0])
      .order('data_prazo', { ascending: true })
      .limit(3);

    let digestsSent = 0;
    let notificationsCreated = 0;

    for (const user of users) {
      // Get user-specific data
      const [scoreResult, creditsResult, opportunitiesResult] = await Promise.all([
        supabase.from('tax_score').select('score_total, score_grade').eq('user_id', user.user_id).maybeSingle(),
        supabase.from('identified_credits')
          .select('potential_recovery')
          .eq('user_id', user.user_id)
          .eq('status', 'identified'),
        supabase.from('company_opportunities')
          .select('id')
          .eq('user_id', user.user_id)
          .eq('status', 'nova'),
      ]);

      const totalCredits = creditsResult.data?.reduce((sum, c) => sum + (c.potential_recovery || 0), 0) || 0;
      const newOpportunities = opportunitiesResult.data?.length || 0;

      // Build digest content
      let digestParts: string[] = [];

      if (scoreResult.data && scoreResult.data.score_total > 0) {
        digestParts.push(`📊 Seu Score: ${scoreResult.data.score_total} (${scoreResult.data.score_grade})`);
      }

      if (totalCredits > 0) {
        digestParts.push(`💰 Créditos identificados: R$ ${totalCredits.toLocaleString('pt-BR')}`);
      }

      if (newOpportunities > 0) {
        digestParts.push(`🎯 Novas oportunidades: ${newOpportunities}`);
      }

      if (recentNews && recentNews.length > 0) {
        digestParts.push(`📰 ${recentNews.length} notícia(s) relevante(s) esta semana`);
      }

      if (upcomingDeadlines && upcomingDeadlines.length > 0) {
        digestParts.push(`📅 ${upcomingDeadlines.length} prazo(s) importante(s) se aproximando`);
      }

      // Create in-app notification with digest summary
      const digestMessage = digestParts.length > 0 
        ? digestParts.join(' • ')
        : 'Confira as novidades da plataforma esta semana.';

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.user_id,
          title: 'Seu resumo semanal',
          message: digestMessage,
          type: 'info',
          category: 'sistema',
          action_url: '/dashboard',
        });

      if (!notifError) {
        notificationsCreated++;
      }

      // Send email if Resend is configured
      if (resendApiKey && user.email) {
        try {
          const emailHtml = buildDigestEmailHtml(
            user.nome || 'Usuário',
            scoreResult.data,
            totalCredits,
            newOpportunities,
            recentNews || [],
            upcomingDeadlines || []
          );

          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'TribuTalks <noreply@tributalks.com.br>',
              to: user.email,
              subject: '📊 Seu Resumo Semanal - TribuTalks',
              html: emailHtml,
            }),
          });

          if (emailResponse.ok) {
            digestsSent++;
          }
        } catch (emailError) {
          console.error('Error sending email to', user.email, emailError);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: users.length,
      notificationsCreated,
      digestsSent
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

function buildDigestEmailHtml(
  nome: string,
  score: { score_total: number; score_grade: string } | null,
  totalCredits: number,
  newOpportunities: number,
  news: any[],
  deadlines: any[]
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .metric { background: #f9fafb; border-radius: 8px; padding: 15px; text-align: center; }
    .metric-value { font-size: 24px; font-weight: 700; color: #10b981; }
    .metric-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .list-item { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .list-item:last-child { border-bottom: none; }
    .cta { text-align: center; margin-top: 30px; }
    .cta-button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Seu Resumo Semanal</h1>
      <p style="margin: 10px 0 0; opacity: 0.9;">Olá, ${nome}!</p>
    </div>
    <div class="content">
      ${score ? `
      <div class="section">
        <div class="section-title">🎯 Seu Score Tributário</div>
        <div class="metric-grid">
          <div class="metric">
            <div class="metric-value">${score.score_total}</div>
            <div class="metric-label">Pontuação</div>
          </div>
          <div class="metric">
            <div class="metric-value">${score.score_grade}</div>
            <div class="metric-label">Classificação</div>
          </div>
        </div>
      </div>
      ` : ''}
      
      <div class="section">
        <div class="section-title">💡 Oportunidades</div>
        <div class="metric-grid">
          <div class="metric">
            <div class="metric-value">R$ ${totalCredits.toLocaleString('pt-BR')}</div>
            <div class="metric-label">Créditos identificados</div>
          </div>
          <div class="metric">
            <div class="metric-value">${newOpportunities}</div>
            <div class="metric-label">Novas oportunidades</div>
          </div>
        </div>
      </div>

      ${news.length > 0 ? `
      <div class="section">
        <div class="section-title">📰 Notícias da Semana</div>
        ${news.map(n => `<div class="list-item"><strong>${n.titulo_original}</strong></div>`).join('')}
      </div>
      ` : ''}

      ${deadlines.length > 0 ? `
      <div class="section">
        <div class="section-title">📅 Prazos Importantes</div>
        ${deadlines.map(d => `<div class="list-item">${d.titulo} - ${new Date(d.data_prazo).toLocaleDateString('pt-BR')}</div>`).join('')}
      </div>
      ` : ''}

      <div class="cta">
        <a href="https://tributechai.lovable.app/dashboard" class="cta-button">Acessar TribuTalks</a>
      </div>
    </div>
    <div class="footer">
      <p>TribuTalks - Simplificando a gestão tributária</p>
      <p>Para não receber mais este email, desative nas configurações da plataforma.</p>
    </div>
  </div>
</body>
</html>
  `;
}
