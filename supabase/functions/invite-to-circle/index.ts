import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface InvitePayload {
  email: string;
  name?: string;
  user_id: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const circleApiKey = Deno.env.get('CIRCLE_API_KEY');
    const circleSpaceGroupIds = Deno.env.get('CIRCLE_SPACE_GROUP_IDS'); // comma-separated IDs
    
    if (!circleApiKey) {
      console.error('CIRCLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Circle API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: InvitePayload = await req.json();
    const { email, name, user_id } = payload;

    if (!email || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Email and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Inviting ${email} to Circle community...`);

    // Parse space group IDs
    const spaceGroupIds = circleSpaceGroupIds 
      ? circleSpaceGroupIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
      : [];

    // Call Circle API to invite member
    const circleResponse = await fetch('https://app.circle.so/api/v1/community_members', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${circleApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        name: name || email.split('@')[0],
        skip_invitation: false, // Circle will send official invite email
        space_group_ids: spaceGroupIds.length > 0 ? spaceGroupIds : undefined,
      }),
    });

    const circleData = await circleResponse.json();

    if (!circleResponse.ok) {
      console.error('Circle API error:', circleData);
      
      // If member already exists, that's OK - get their ID
      if (circleData.message?.includes('already') || circleResponse.status === 422) {
        console.log('Member already exists in Circle, updating profile...');
      } else {
        return new Response(
          JSON.stringify({ error: 'Failed to invite to Circle', details: circleData }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const circleMemberId = circleData.id?.toString() || circleData.community_member?.id?.toString();

    // Update profile with Circle info
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        circle_member_id: circleMemberId || 'invited',
        circle_invited_at: new Date().toISOString(),
      })
      .eq('user_id', user_id);

    if (updateError) {
      console.error('Failed to update profile with Circle info:', updateError);
    }

    console.log(`Successfully invited ${email} to Circle. Member ID: ${circleMemberId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        circle_member_id: circleMemberId,
        message: 'Invitation sent successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error inviting to Circle:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
