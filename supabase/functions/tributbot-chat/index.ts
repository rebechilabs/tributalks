import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserProfile {
  empresa: string | null;
  setor: string | null;
  regime: string | null;
  faturamento_mensal: number | null;
  estado: string | null;
}

const formatCurrency = (value: number | null): string => {
  if (!value) return "Não informado";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
};

const buildSystemPrompt = (profile: UserProfile) => `Você é a Clara AI, uma consultora tributária virtual especializada em tributação brasileira para empresas do middle market (faturamento acima de R$ 1 milhão por mês).

Seu papel é:
- Responder dúvidas sobre regimes tributários (Simples Nacional, Lucro Presumido, Lucro Real)
- Explicar impostos como IRPJ, CSLL, PIS, COFINS, ICMS, ISS
- Esclarecer sobre a Reforma Tributária e Split Payment
- Orientar sobre planejamento tributário básico
- Sugerir quando o usuário deve consultar um especialista

Diretrizes:
- Use linguagem simples, evite juridiquês
- Seja direta e objetiva
- Quando relevante, personalize com os dados do usuário
- Sempre sugira próximos passos práticos
- Para decisões importantes, recomende validar com um especialista
- Nunca dê conselhos que possam ser considerados sonegação fiscal
- Formate suas respostas usando markdown quando apropriado (negrito, listas, etc)

Dados do usuário (use para personalizar respostas):
- Empresa: ${profile.empresa || "Não informada"}
- Setor: ${profile.setor || "Não informado"}
- Regime atual: ${profile.regime || "Não informado"}
- Faturamento mensal: ${formatCurrency(profile.faturamento_mensal)}
- Estado: ${profile.estado || "Não informado"}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profile from Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Decode user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("empresa, setor, regime, faturamento_mensal, estado, plano")
      .eq("user_id", user.id)
      .single();

    // Check limits based on plan
    const plano = profile?.plano || "FREE";
    
    if (plano === "FREE") {
      // FREE plan: 3 messages TOTAL (lifetime limit)
      const { count } = await supabase
        .from("tributbot_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if ((count || 0) >= 3) {
        return new Response(JSON.stringify({ 
          error: "Você usou suas 3 conversas gratuitas. Faça upgrade para continuar usando a Clara AI.",
          limit_reached: true
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (plano === "BASICO" || plano === "NAVIGATOR") {
      // NAVIGATOR plan: 10 messages per day
      const today = new Date().toISOString().split("T")[0];
      const { count } = await supabase
        .from("tributbot_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00`);

      if ((count || 0) >= 10) {
        return new Response(JSON.stringify({ 
          error: "Limite diário atingido. Você pode enviar até 10 mensagens por dia no plano Navigator.",
          limit_reached: true
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    // PROFESSIONAL, PREMIUM, ENTERPRISE: unlimited

    const { messages } = await req.json();
    
    const systemPrompt = buildSystemPrompt({
      empresa: profile?.empresa || null,
      setor: profile?.setor || null,
      regime: profile?.regime || null,
      faturamento_mensal: profile?.faturamento_mensal || null,
      estado: profile?.estado || null,
    });

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Entre em contato com o suporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar sua pergunta. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log message for rate limiting
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    await supabase.from("tributbot_messages").insert({
      user_id: user.id,
      message: lastUserMessage.substring(0, 1000),
    });

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("TribuBot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
