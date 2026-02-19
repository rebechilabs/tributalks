import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://tributalks.com.br",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactRequest {
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
}

// ============================================================================
// Rate Limiting - In-memory store (resets on function cold start)
// ============================================================================
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 3; // 3 requests per window

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // New window or expired
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  record.count++;
  return false;
}

// ============================================================================
// Input Validation & Sanitization
// ============================================================================
function sanitizeInput(input: string, maxLength: number): string {
  if (typeof input !== 'string') return '';
  
  // Trim, remove null bytes, limit length
  return input
    .trim()
    .replace(/\0/g, '')
    .substring(0, maxLength);
}

function isValidEmail(email: string): boolean {
  // RFC 5322 compliant regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 255;
}

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };
  return text.replace(/[&<>"']/g, char => htmlEntities[char] || char);
}

// ============================================================================
// Email Sending
// ============================================================================
async function sendEmail(to: string[], subject: string, html: string, replyTo?: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "TribuTalks <noreply@tributalks.com.br>",
      to,
      subject,
      html,
      reply_to: replyTo,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return response.json();
}

// ============================================================================
// Request Handler
// ============================================================================
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("cf-connecting-ip") 
      || "unknown";
    
    if (isRateLimited(clientIp)) {
      console.warn(`Rate limit exceeded for IP: ${clientIp.substring(0, 10)}...`);
      return new Response(
        JSON.stringify({ error: "Limite de envios atingido. Tente novamente em alguns minutos." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Serviço temporariamente indisponível." }),
        {
          status: 503,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const body = await req.json();
    
    // Sanitize and validate inputs
    const nome = sanitizeInput(body.nome || '', 100);
    const email = sanitizeInput(body.email || '', 255);
    const assunto = sanitizeInput(body.assunto || '', 200);
    const mensagem = sanitizeInput(body.mensagem || '', 2000);

    // Validation
    if (!nome || nome.length < 2) {
      return new Response(
        JSON.stringify({ error: "Nome deve ter pelo menos 2 caracteres." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "E-mail inválido." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!assunto || assunto.length < 3) {
      return new Response(
        JSON.stringify({ error: "Assunto deve ter pelo menos 3 caracteres." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!mensagem || mensagem.length < 10) {
      return new Response(
        JSON.stringify({ error: "Mensagem deve ter pelo menos 10 caracteres." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Escape HTML for email body
    const safeNome = escapeHtml(nome);
    const safeEmail = escapeHtml(email);
    const safeAssunto = escapeHtml(assunto);
    const safeMensagem = escapeHtml(mensagem);

    // Send email to support
    await sendEmail(
      ["suporte@tributalks.com.br"],
      `[Contato] ${safeAssunto}`,
      `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1E40AF; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #374151; }
            .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border: 1px solid #e5e7eb; }
            .footer { padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">📩 Nova Mensagem de Contato</h2>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">TribuTalks - Plataforma de Inteligência Tributária</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">👤 Nome:</div>
                <div class="value">${safeNome}</div>
              </div>
              <div class="field">
                <div class="label">📧 E-mail:</div>
                <div class="value"><a href="mailto:${safeEmail}">${safeEmail}</a></div>
              </div>
              <div class="field">
                <div class="label">📋 Assunto:</div>
                <div class="value">${safeAssunto}</div>
              </div>
              <div class="field">
                <div class="label">💬 Mensagem:</div>
                <div class="value" style="white-space: pre-wrap;">${safeMensagem}</div>
              </div>
            </div>
            <div class="footer">
              <p>Esta mensagem foi enviada através do formulário de contato do site.</p>
              <p>Responda diretamente para o e-mail do remetente.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      email // reply_to uses original (validated) email
    );

    console.log("Contact email sent successfully to support");

    // Send confirmation to the user
    await sendEmail(
      [email],
      `Recebemos sua mensagem - ${safeAssunto}`,
      `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1E40AF; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">✅ Mensagem Recebida!</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${safeNome}</strong>,</p>
              <p>Recebemos sua mensagem sobre "<strong>${safeAssunto}</strong>" e nossa equipe entrará em contato em breve.</p>
              <p>Tempo médio de resposta: <strong>até 24 horas úteis</strong>.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="font-size: 14px; color: #6b7280;">
                Para assuntos urgentes, entre em contato pelo WhatsApp:<br>
                <a href="https://wa.me/5511914523971" style="color: #1E40AF;">+55 11 91452-3971</a>
              </p>
            </div>
            <div class="footer">
              <p><strong>TribuTalks</strong> - Seu GPS da Reforma Tributária</p>
              <p>Uma iniciativa Rebechi & Silva Produções</p>
            </div>
          </div>
        </body>
        </html>
      `
    );

    console.log("Confirmation email sent to user");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    // Log error internally for debugging, but return sanitized message
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao enviar mensagem. Tente novamente." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
