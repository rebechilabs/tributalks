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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find users whose score was last calculated more than 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: oldScores, error: scoresError } = await supabase
      .from('tax_score')
      .select('user_id, score_total, score_grade, updated_at')
      .lt('updated_at', thirtyDaysAgo.toISOString())
      .gt('score_total', 0);

    if (scoresError) throw scoresError;

    if (!oldScores || oldScores.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Nenhum score desatualizado encontrado',
        processed: 0 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    let notificationsCreated = 0;

    for (const score of oldScores) {
      // Check if notification already exists for this user recently
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: existingNotif } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', score.user_id)
        .eq('category', 'sistema')
        .ilike('title', '%score%recalcul%')
        .gt('created_at', sevenDaysAgo.toISOString())
        .maybeSingle();

      if (existingNotif) continue; // Skip if recently notified

      // Calculate days since last update
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(score.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Create notification
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: score.user_id,
          title: 'Seu Score precisa de atualização',
          message: `Seu Score Tributário foi calculado há ${daysSinceUpdate} dias. Recalcule agora para ver sua evolução e novas oportunidades.`,
          type: 'info',
          category: 'sistema',
          action_url: '/dashboard/score-tributario',
        });

      if (!notifError) {
        notificationsCreated++;
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: oldScores.length,
      notificationsCreated
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
