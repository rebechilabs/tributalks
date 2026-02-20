import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PresencePayload {
  status: "online" | "away" | "offline";
  page_path?: string;
}

interface GeoData {
  country_code?: string;
  country_name?: string;
  city?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: PresencePayload = await req.json();
    const userAgent = req.headers.get("user-agent") || "";
    
    // Get IP address for geolocation
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("cf-connecting-ip") 
      || req.headers.get("x-real-ip")
      || "unknown";

    let geoData: GeoData = {};

    // Get geolocation from IP (using free ip-api.com service)
    if (clientIp !== "unknown" && clientIp !== "127.0.0.1" && !clientIp.startsWith("192.168")) {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,country,countryCode,city`);
        const geoJson = await geoResponse.json();
        
        if (geoJson.status === "success") {
          geoData = {
            country_code: geoJson.countryCode,
            country_name: geoJson.country,
            city: geoJson.city,
          };
        }
      } catch (geoError) {
        console.error("Geolocation error:", geoError);
      }
    }

    // Upsert presence
    const { error: presenceError } = await supabaseClient
      .from("user_presence")
      .upsert({
        user_id: user.id,
        status: body.status,
        last_active_at: new Date().toISOString(),
        page_path: body.page_path,
        user_agent: userAgent,
      }, { 
        onConflict: "user_id" 
      });

    if (presenceError) {
      console.error("Presence upsert error:", presenceError);
    }

    // Update profile with geolocation if we have new data
    if (geoData.country_code) {
      const { error: profileError } = await supabaseClient
        .from("profiles")
        .update({
          country_code: geoData.country_code,
          country_name: geoData.country_name,
          city: geoData.city,
          last_seen_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
      }
    } else {
      // Just update last_seen_at
      await supabaseClient
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("user_id", user.id);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      geo: geoData
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Track presence error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
