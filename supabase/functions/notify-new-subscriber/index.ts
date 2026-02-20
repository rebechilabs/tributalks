import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "alexandre@rebechisilva.com.br";

interface NotificationPayload {
  email: string;
  nome: string | null;
  plano: string;
  valor: number;
  periodo: string;
  stripeCustomerId: string;
  timestamp: string;
  tipo?: 'assinatura' | 'creditos' | 'assento';
  quantidade?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { email, nome, plano, valor, periodo, stripeCustomerId, timestamp, tipo = 'assinatura', quantidade } = payload;
    
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const planEmoji: Record<string, string> = {
      'STARTER': '🌱',
      'NAVIGATOR': '🧭', 
      'PROFESSIONAL': '🚀',
    };
    
    const emoji = planEmoji[plano] || '📋';
    
    let subject: string;
    let tipoLabel: string;
    
    switch (tipo) {
      case 'creditos':
        subject = `💳 Compra de Créditos: ${quantidade} créditos`;
        tipoLabel = `Créditos: ${quantidade} unidades`;
        break;
      case 'assento':
        subject = `🪑 Novo Assento: ${plano}`;
        tipoLabel = `Assento adicional (${plano})`;
        break;
      default:
        subject = `${emoji} Nova Assinatura: ${plano} (${periodo})`;
        tipoLabel = `${plano} (${periodo})`;
    }
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${tipo === 'assinatura' ? emoji : tipo === 'creditos' ? '💳' : '🪑'} ${tipo === 'assinatura' ? 'Nova Assinatura!' : tipo === 'creditos' ? 'Compra de Créditos!' : 'Novo Assento!'}</h1>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-left: 4px solid #16a34a;">
          <p style="margin: 8px 0; font-size: 16px;"><strong>📋 Tipo:</strong> ${tipoLabel}</p>
          <p style="margin: 8px 0; font-size: 18px; color: #16a34a;"><strong>💰 Valor:</strong> R$ ${valor.toFixed(2).replace('.', ',')}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; margin-top: 2px;">
          <p style="margin: 8px 0;"><strong>👤 Cliente:</strong> ${nome || 'Não informado'}</p>
          <p style="margin: 8px 0;"><strong>📧 E-mail:</strong> <a href="mailto:${email}" style="color: #16a34a;">${email}</a></p>
        </div>
        
        <div style="padding: 16px 20px; color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 4px 0;">📅 Data: ${timestamp}</p>
          <p style="margin: 4px 0;">🔗 ID Stripe: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${stripeCustomerId}</code></p>
        </div>
        
        <div style="text-align: center; padding: 16px; color: #94a3b8; font-size: 12px;">
          <p>TribuTalks - Notificação automática de vendas</p>
        </div>
      </div>
    `;
    
    const { error: emailError } = await resend.emails.send({
      from: "TribuTalks <suporte@tributalks.com.br>",
      to: [ADMIN_EMAIL],
      subject,
      html: htmlContent,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log(`Admin notification sent: ${tipo} - ${plano} for ${email}`);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending notification:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
