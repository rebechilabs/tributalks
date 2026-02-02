import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// AES-256-GCM Encryption Functions
// ============================================================================

async function getEncryptionKey(): Promise<CryptoKey> {
  const keyString = Deno.env.get("ERP_ENCRYPTION_KEY");
  if (!keyString || keyString.length < 32) {
    throw new Error("ERP_ENCRYPTION_KEY não configurada corretamente");
  }
  
  const keyData = new TextEncoder().encode(keyString.slice(0, 32));
  
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptCredentials(data: Record<string, string>): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );
  
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

// ============================================================================
// OAuth 2.0 Flow Implementation
// ============================================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    const clientId = Deno.env.get('CONTAAZUL_CLIENT_ID');
    const clientSecret = Deno.env.get('CONTAAZUL_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      console.error('[contaazul-oauth] Missing credentials');
      return new Response(
        JSON.stringify({ error: 'Credenciais OAuth não configuradas. Contate o suporte.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // ACTION: Generate Authorization URL
    // ========================================================================
    if (action === 'authorize') {
      const redirectUri = url.searchParams.get('redirect_uri');
      
      if (!redirectUri) {
        return new Response(
          JSON.stringify({ error: 'redirect_uri é obrigatório' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate cryptographically random state
      const state = crypto.randomUUID().replace(/-/g, '');
      
      // Build authorization URL with offline scope for refresh tokens
      const authParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'offline sales purchases products customers suppliers fiscal-invoices bank-accounts treasury', // Include offline for refresh token
        state: state,
      });

      const authUrl = `https://api.contaazul.com/auth/authorize?${authParams}`;

      console.log('[contaazul-oauth] Authorization URL generated');

      return new Response(
        JSON.stringify({ 
          authorization_url: authUrl,
          state: state,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // ACTION: Exchange Authorization Code for Tokens
    // ========================================================================
    if (action === 'exchange') {
      console.log('[contaazul-oauth] === Starting token exchange flow ===');
      
      // Verify authentication
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        console.error('[contaazul-oauth] No authorization header provided');
        return new Response(
          JSON.stringify({ error: 'Não autorizado' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace('Bearer ', '');
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !userData.user) {
        console.error('[contaazul-oauth] Auth validation failed:', userError?.message);
        return new Response(
          JSON.stringify({ error: 'Token inválido' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const userId = userData.user.id;
      const userEmail = userData.user.email;
      console.log(`[contaazul-oauth] User authenticated: ${userEmail} (${userId})`);

      // Get body parameters
      const body = await req.json();
      const { code, redirect_uri, state, stored_state, connection_name } = body;

      console.log(`[contaazul-oauth] Exchange params: redirect_uri=${redirect_uri}, connection_name=${connection_name || 'default'}`);

      if (!code || !redirect_uri) {
        console.error('[contaazul-oauth] Missing required params: code or redirect_uri');
        return new Response(
          JSON.stringify({ error: 'code e redirect_uri são obrigatórios' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate state to prevent CSRF attacks
      if (state !== stored_state) {
        console.error(`[contaazul-oauth] State mismatch - possible CSRF attack. Received: ${state}, Expected: ${stored_state}`);
        return new Response(
          JSON.stringify({ error: 'Estado inválido. Tente novamente.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[contaazul-oauth] State validated, exchanging code for tokens...');

      // Exchange authorization code for tokens
      const auth = btoa(`${clientId}:${clientSecret}`);
      
      const tokenResponse = await fetch('https://api.contaazul.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirect_uri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('[contaazul-oauth] Token exchange failed:', errorText);
        return new Response(
          JSON.stringify({ error: 'Falha ao obter tokens. Tente reconectar.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tokens = await tokenResponse.json();
      
      console.log('[contaazul-oauth] Token exchange successful');

      // Validate we got a refresh token (required for auto-refresh)
      if (!tokens.refresh_token) {
        console.error('[contaazul-oauth] No refresh token received');
        return new Response(
          JSON.stringify({ error: 'Refresh token não recebido. Verifique as permissões do aplicativo.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate the access token by making a test API call
      const validateResponse = await fetch('https://api.contaazul.com/v1/companies', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Accept': 'application/json',
        },
      });

      let companyData = null;
      if (validateResponse.ok) {
        companyData = await validateResponse.json();
        console.log('[contaazul-oauth] Token validation successful');
      } else {
        console.warn('[contaazul-oauth] Token validation failed, but continuing...');
      }

      // Prepare credentials for storage
      const credentials = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: String(Date.now() + (tokens.expires_in || 3600) * 1000),
        client_id: clientId,
        client_secret: clientSecret,
      };

      // Encrypt credentials
      const encryptedCredentials = await encryptCredentials(credentials);

      // Use service role to store connection
      const serviceSupabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      console.log(`[contaazul-oauth] Preparing to save connection for user: ${userId} (${userEmail})`);

      // Check if connection already exists
      const { data: existingConn } = await serviceSupabase
        .from('erp_connections')
        .select('id')
        .eq('user_id', userId)
        .eq('erp_type', 'contaazul')
        .single();

      if (existingConn) {
        console.log(`[contaazul-oauth] Updating existing connection: ${existingConn.id}`);
        
        // Update existing connection
        const { error: updateError } = await serviceSupabase
          .from('erp_connections')
          .update({
            credentials: encryptedCredentials,
            status: 'active',
            status_message: 'Conectado via OAuth 2.0',
            metadata: companyData ? { empresa: companyData } : {},
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingConn.id);

        if (updateError) {
          console.error(`[contaazul-oauth] Update error for connection ${existingConn.id}:`, updateError);
          throw updateError;
        }

        console.log(`[contaazul-oauth] Connection ${existingConn.id} updated successfully for user ${userEmail}`);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Conta Azul reconectado com sucesso!',
            connection_id: existingConn.id,
            company: companyData,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[contaazul-oauth] Creating new connection for user: ${userId} (${userEmail})`);

      // Create new connection
      const { data: newConn, error: insertError } = await serviceSupabase
        .from('erp_connections')
        .insert({
          user_id: userId,
          erp_type: 'contaazul',
          connection_name: connection_name || 'Conta Azul',
          credentials: encryptedCredentials,
          status: 'active',
          status_message: 'Conectado via OAuth 2.0',
          sync_config: {
            modules: ['nfe', 'produtos', 'financeiro', 'empresa'],
            frequency_hours: 24,
            auto_sync: true,
          },
          metadata: companyData ? { empresa: companyData } : {},
        })
        .select('id')
        .single();

      if (insertError) {
        console.error(`[contaazul-oauth] Insert error for user ${userEmail}:`, insertError);
        throw insertError;
      }

      console.log(`[contaazul-oauth] New connection ${newConn?.id} created successfully for user ${userEmail}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Conta Azul conectado com sucesso!',
          connection_id: newConn?.id,
          company: companyData,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Ação não suportada. Use action=authorize ou action=exchange' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[contaazul-oauth] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Ocorreu um erro ao processar sua solicitação.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
