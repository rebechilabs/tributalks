import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find users who haven't been active in 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: inactiveUsers, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, nome, updated_at')
      .lt('updated_at', sevenDaysAgo.toISOString())
      .eq('onboarding_complete', true);

    if (usersError) throw usersError;

    if (!inactiveUsers || inactiveUsers.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Nenhum usuário inativo encontrado',
        processed: 0 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    let notificationsCreated = 0;

    for (const user of inactiveUsers) {
      // Check if notification already exists for this user in last 14 days
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const { data: existingNotif } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.user_id)
        .eq('category', 'sistema')
        .ilike('title', '%saudade%')
        .gt('created_at', fourteenDaysAgo.toISOString())
        .maybeSingle();

      if (existingNotif) continue;

      // Check what data user has to personalize message
      const [dreResult, xmlResult, scoreResult, opportunitiesResult] = await Promise.all([
        supabase.from('company_dre').select('id').eq('user_id', user.user_id).maybeSingle(),
        supabase.from('xml_imports').select('id').eq('user_id', user.user_id).limit(1),
        supabase.from('tax_score').select('score_total').eq('user_id', user.user_id).maybeSingle(),
        supabase.from('company_opportunities').select('id').eq('user_id', user.user_id).eq('status', 'nova').limit(1),
      ]);

      let personalizedMessage = 'Sentimos sua falta! ';
      let actionUrl = '/dashboard';

      if (opportunitiesResult.data && opportunitiesResult.data.length > 0) {
        personalizedMessage += 'Você tem novas oportunidades de economia tributária para analisar.';
        actionUrl = '/dashboard/oportunidades';
      } else if (!scoreResult.data || scoreResult.data.score_total === 0) {
        personalizedMessage += 'Que tal calcular seu Score Tributário? Leva menos de 5 minutos.';
        actionUrl = '/dashboard/score-tributario';
      } else if (!dreResult.data) {
        personalizedMessage += 'Descubra a saúde financeira da sua empresa com o DRE Inteligente.';
        actionUrl = '/dashboard/dre';
      } else {
        personalizedMessage += 'Confira as novidades e atualizações da plataforma.';
      }

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.user_id,
          title: 'Estamos com saudade!',
          message: personalizedMessage,
          type: 'info',
          category: 'sistema',
          action_url: actionUrl,
        });

      if (!notifError) {
        notificationsCreated++;
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: inactiveUsers.length,
      notificationsCreated
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: unknown) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Ocorreu um erro ao processar sua solicitação.' 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
