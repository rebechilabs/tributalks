/**
 * Authentication utilities for Edge Functions
 */
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

export interface AuthResult {
  userId: string;
  email?: string;
  role?: string;
  supabase: SupabaseClient;
}

export interface AuthError {
  error: string;
  status: number;
}

/**
 * Validate JWT and return user info
 * Uses getClaims() for efficient validation
 */
export async function validateAuth(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<AuthResult | AuthError> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', status: 401 };
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data, error } = await supabase.auth.getClaims(token);
    
    if (error || !data?.claims) {
      console.error('Auth validation failed:', error);
      return { error: 'Invalid or expired token', status: 401 };
    }

    return {
      userId: data.claims.sub as string,
      email: data.claims.email as string | undefined,
      role: data.claims.role as string | undefined,
      supabase,
    };
  } catch (err) {
    console.error('Auth error:', err);
    return { error: 'Authentication failed', status: 401 };
  }
}

/**
 * Check if auth result is an error
 */
export function isAuthError(result: AuthResult | AuthError): result is AuthError {
  return 'error' in result;
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(
  error: string,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ error }),
    { 
      status: 401, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Get user's plan from profile for rate limiting tiers
 */
export async function getUserPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('plano')
      .eq('user_id', userId)
      .single();
    
    return data?.plano || 'FREE';
  } catch {
    return 'FREE';
  }
}
