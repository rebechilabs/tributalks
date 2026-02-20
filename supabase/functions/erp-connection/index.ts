import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================================
// AES-256-GCM Encryption Functions
// ============================================================================

async function getEncryptionKey(): Promise<CryptoKey> {
  const keyString = Deno.env.get("ERP_ENCRYPTION_KEY");
  if (!keyString || keyString.length < 32) {
    throw new Error("ERP_ENCRYPTION_KEY não configurada corretamente");
  }
  
  // Use first 32 bytes for AES-256
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
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV for AES-GCM
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );
  
  // Combine IV + ciphertext (includes auth tag)
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  // Base64 encode
  return btoa(String.fromCharCode(...combined));
}

// ERP API endpoints for validation
const ERP_ENDPOINTS = {
  omie: "https://app.omie.com.br/api/v1/geral/empresas/",
  bling: "https://api.bling.com.br/Api/v3/empresas",
  contaazul: "https://api.contaazul.com/v1/companies",
  tiny: "https://api.tiny.com.br/api2/info.php",
  sankhya: "https://api.sankhya.com.br/gateway/v1/",
  totvs: "https://api.totvs.com.br/",
};

// ERP display names
const ERP_NAMES: Record<string, string> = {
  omie: "Omie ERP",
  bling: "Bling",
  contaazul: "Conta Azul",
  tiny: "Tiny ERP",
  sankhya: "Sankhya",
  totvs: "TOTVS",
};

interface ConnectionRequest {
  erp_type: string;
  connection_name: string;
  credentials: Record<string, string>;
  sync_config?: {
    modules: string[];
    frequency_hours: number;
    auto_sync: boolean;
  };
}

async function validateOmieCredentials(appKey: string, appSecret: string): Promise<{ valid: boolean; message: string; data?: any }> {
  try {
    const response = await fetch("https://app.omie.com.br/api/v1/geral/empresas/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        call: "ListarEmpresas",
        app_key: appKey,
        app_secret: appSecret,
        param: [{ pagina: 1, registros_por_pagina: 1 }],
      }),
    });

    const data = await response.json();
    
    if (data.faultstring) {
      return { valid: false, message: "Credenciais inválidas" };
    }
    
    return { 
      valid: true, 
      message: "Credenciais válidas",
      data: data.empresas_cadastro?.[0] || null
    };
  } catch (error: unknown) {
    console.error("Omie validation error:", error);
    return { valid: false, message: "Erro ao validar credenciais" };
  }
}

async function validateBlingCredentials(accessToken: string): Promise<{ valid: boolean; message: string; data?: any }> {
  try {
    const response = await fetch("https://api.bling.com.br/Api/v3/empresas", {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
      },
    });

    if (!response.ok) {
      return { valid: false, message: "Token de acesso inválido" };
    }

    const data = await response.json();
    return { 
      valid: true, 
      message: "Credenciais válidas",
      data: data.data?.[0] || null
    };
  } catch (error: unknown) {
    console.error("Bling validation error:", error);
    return { valid: false, message: "Erro ao validar credenciais" };
  }
}

async function validateContaAzulCredentials(credentials: Record<string, string>): Promise<{ valid: boolean; message: string; data?: any }> {
  try {
    // Conta Azul uses OAuth 2.0 - validate by making an API call
    const response = await fetch("https://api.contaazul.com/v1/companies", {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${credentials.access_token}`,
        "Accept": "application/json"
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (errorText.includes('invalid_token') || errorText.includes('expired')) {
        return { valid: false, message: "Token de acesso expirado. Reconecte sua conta." };
      }
      return { valid: false, message: "Token de acesso inválido" };
    }

    const data = await response.json();
    return { 
      valid: true, 
      message: "Credenciais válidas",
      data: data || null
    };
  } catch (error: unknown) {
    console.error("Conta Azul validation error:", error);
    return { valid: false, message: "Erro ao validar credenciais" };
  }
}

async function validateCredentials(erpType: string, credentials: Record<string, string>): Promise<{ valid: boolean; message: string; data?: any }> {
  switch (erpType) {
    case "omie":
      if (!credentials.app_key || !credentials.app_secret) {
        return { valid: false, message: "App Key e App Secret são obrigatórios" };
      }
      return validateOmieCredentials(credentials.app_key, credentials.app_secret);
    
    case "bling":
      if (!credentials.access_token) {
        return { valid: false, message: "Access Token é obrigatório" };
      }
      return validateBlingCredentials(credentials.access_token);
    
    case "contaazul":
      if (!credentials.access_token) {
        return { valid: false, message: "Access Token é obrigatório" };
      }
      if (!credentials.client_id || !credentials.client_secret) {
        return { valid: false, message: "Client ID e Client Secret são obrigatórios para renovação automática de token" };
      }
      if (!credentials.refresh_token) {
        return { valid: false, message: "Refresh Token é obrigatório para renovação automática de token" };
      }
      return validateContaAzulCredentials(credentials);
    
    case "tiny":
    case "sankhya":
    case "totvs":
      // Para estes ERPs, apenas validamos se as credenciais foram fornecidas
      // A validação real será feita na primeira sincronização
      if (Object.keys(credentials).length === 0) {
        return { valid: false, message: "Credenciais são obrigatórias" };
      }
      return { valid: true, message: "Credenciais salvas (validação na sincronização)" };
    
    default:
      return { valid: false, message: "Tipo de ERP não suportado" };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    const url = new URL(req.url);
    const connectionId = url.searchParams.get("id");

    // GET - List connections or get specific connection
    if (req.method === "GET") {
      if (connectionId) {
        const { data, error } = await supabase
          .from("erp_connections")
          .select("id, erp_type, connection_name, status, status_message, last_sync_at, next_sync_at, sync_config, metadata, created_at, updated_at")
          .eq("id", connectionId)
          .eq("user_id", userId)
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ error: "Conexão não encontrada" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ connection: data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // List all connections
      const { data, error } = await supabase
        .from("erp_connections")
        .select("id, erp_type, connection_name, status, status_message, last_sync_at, next_sync_at, sync_config, metadata, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Also get recent sync logs
      const { data: logs } = await supabase
        .from("erp_sync_logs")
        .select("id, connection_id, sync_type, status, records_synced, started_at, completed_at")
        .eq("user_id", userId)
        .order("started_at", { ascending: false })
        .limit(10);

      return new Response(
        JSON.stringify({ 
          connections: data || [],
          recent_logs: logs || [],
          available_erps: Object.entries(ERP_NAMES).map(([key, name]) => ({
            type: key,
            name,
            connected: data?.some(c => c.erp_type === key) || false
          }))
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST - Create new connection
    if (req.method === "POST") {
      const body: ConnectionRequest = await req.json();
      
      if (!body.erp_type || !body.connection_name || !body.credentials) {
        return new Response(
          JSON.stringify({ error: "erp_type, connection_name e credentials são obrigatórios" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate credentials BEFORE encrypting
      const validation = await validateCredentials(body.erp_type, body.credentials);
      
      // Encrypt credentials before storing
      let encryptedCredentials: string;
      try {
        encryptedCredentials = await encryptCredentials(body.credentials);
      } catch (encryptError) {
        console.error("Encryption error:", encryptError);
        return new Response(
          JSON.stringify({ error: "Erro ao processar credenciais" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const connectionData = {
        user_id: userId,
        erp_type: body.erp_type,
        connection_name: body.connection_name,
        credentials: encryptedCredentials, // Store encrypted string
        status: validation.valid ? "active" : "error",
        status_message: validation.message,
        sync_config: body.sync_config || {
          modules: ["nfe", "produtos", "financeiro", "empresa"],
          frequency_hours: 24,
          auto_sync: true
        },
        metadata: validation.data ? { empresa: validation.data } : {}
      };

      const { data, error } = await supabase
        .from("erp_connections")
        .insert(connectionData)
        .select("id, erp_type, connection_name, status, status_message, sync_config, created_at")
        .single();

      if (error) {
        if (error.code === "23505") {
          return new Response(
            JSON.stringify({ error: `Já existe uma conexão com ${ERP_NAMES[body.erp_type] || body.erp_type}` }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw error;
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: validation.valid 
            ? `Conexão com ${ERP_NAMES[body.erp_type]} criada com sucesso!` 
            : `Conexão criada, mas com erro de validação`,
          connection: data,
          validation: { valid: validation.valid, message: validation.message }
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PUT - Update connection
    if (req.method === "PUT") {
      if (!connectionId) {
        return new Response(
          JSON.stringify({ error: "ID da conexão é obrigatório" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();
      const updateData: Record<string, any> = {};

      if (body.connection_name) updateData.connection_name = body.connection_name;
      if (body.sync_config) updateData.sync_config = body.sync_config;
      
      // If credentials are being updated, revalidate and re-encrypt
      if (body.credentials) {
        // First get the current connection to know the ERP type
        const { data: currentConn } = await supabase
          .from("erp_connections")
          .select("erp_type")
          .eq("id", connectionId)
          .eq("user_id", userId)
          .single();

        if (currentConn) {
          const validation = await validateCredentials(currentConn.erp_type, body.credentials);
          
          // Encrypt new credentials
          try {
            updateData.credentials = await encryptCredentials(body.credentials);
          } catch (encryptError) {
            console.error("Encryption error:", encryptError);
            return new Response(
              JSON.stringify({ error: "Erro ao processar credenciais" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          updateData.status = validation.valid ? "active" : "error";
          updateData.status_message = validation.message;
          if (validation.data) {
            updateData.metadata = { empresa: validation.data };
          }
        }
      }

      const { data, error } = await supabase
        .from("erp_connections")
        .update(updateData)
        .eq("id", connectionId)
        .eq("user_id", userId)
        .select("id, erp_type, connection_name, status, status_message, sync_config, updated_at")
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return new Response(
          JSON.stringify({ error: "Conexão não encontrada" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, connection: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE - Remove connection
    if (req.method === "DELETE") {
      // Support both query param and body for backwards compatibility
      let deleteConnectionId = connectionId;
      
      if (!deleteConnectionId) {
        try {
          const body = await req.json();
          deleteConnectionId = body.id;
        } catch {
          // No body provided
        }
      }

      if (!deleteConnectionId) {
        return new Response(
          JSON.stringify({ error: "ID da conexão é obrigatório" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[erp-connection] DELETE request for connection: ${deleteConnectionId}, user: ${userId}`);

      const { data, error } = await supabase
        .from("erp_connections")
        .delete()
        .eq("id", deleteConnectionId)
        .eq("user_id", userId)
        .select("id");

      if (error) {
        console.error(`[erp-connection] DELETE error:`, error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn(`[erp-connection] Connection not found or no permission: ${deleteConnectionId}`);
        return new Response(
          JSON.stringify({ error: "Conexão não encontrada ou você não tem permissão" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[erp-connection] Connection deleted successfully: ${deleteConnectionId}`);

      return new Response(
        JSON.stringify({ success: true, message: "Conexão removida com sucesso" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Método não suportado" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in erp-connection:", error);
    // Sanitized error response - no technical details exposed
    return new Response(
      JSON.stringify({ error: "Ocorreu um erro ao processar sua solicitação. Tente novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
