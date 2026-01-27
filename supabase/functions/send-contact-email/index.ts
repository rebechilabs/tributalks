import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
}

async function sendEmail(to: string[], subject: string, html: string, replyTo?: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "TribuTech <noreply@tributalks.com.br>",
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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { nome, email, assunto, mensagem }: ContactRequest = await req.json();

    // Validate required fields
    if (!nome || !email || !assunto || !mensagem) {
      throw new Error("Campos obrigatórios: nome, email, assunto, mensagem");
    }

    // Send email to support
    await sendEmail(
      ["suporte@tributalks.com.br"],
      `[Contato] ${assunto}`,
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
              <p style="margin: 10px 0 0 0; opacity: 0.9;">TribuTech - Plataforma de Inteligência Tributária</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">👤 Nome:</div>
                <div class="value">${nome}</div>
              </div>
              <div class="field">
                <div class="label">📧 E-mail:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">📋 Assunto:</div>
                <div class="value">${assunto}</div>
              </div>
              <div class="field">
                <div class="label">💬 Mensagem:</div>
                <div class="value" style="white-space: pre-wrap;">${mensagem}</div>
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
      email
    );

    console.log("Contact email sent successfully to support");

    // Send confirmation to the user
    await sendEmail(
      [email],
      `Recebemos sua mensagem - ${assunto}`,
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
              <p>Olá <strong>${nome}</strong>,</p>
              <p>Recebemos sua mensagem sobre "<strong>${assunto}</strong>" e nossa equipe entrará em contato em breve.</p>
              <p>Tempo médio de resposta: <strong>até 24 horas úteis</strong>.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="font-size: 14px; color: #6b7280;">
                Para assuntos urgentes, entre em contato pelo WhatsApp:<br>
                <a href="https://wa.me/5511914523971" style="color: #1E40AF;">+55 11 91452-3971</a>
              </p>
            </div>
            <div class="footer">
              <p><strong>TribuTech</strong> - Seu GPS da Reforma Tributária</p>
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
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
