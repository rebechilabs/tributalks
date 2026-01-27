import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportRequest {
  userId: string;
  referenceMonth: string; // YYYY-MM format
  recipients?: string[]; // Override recipients
  reportData: {
    thermometerData: any;
    topProjects: any[];
    reformData: any;
    risks: any[];
    companyName?: string;
  };
}

interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonthYear(dateStr: string): string {
  const date = new Date(dateStr + '-01');
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function generateEmailContent(data: ReportRequest['reportData'], referenceMonth: string): EmailContent {
  const { thermometerData, topProjects, reformData, risks, companyName } = data;
  const monthYear = formatMonthYear(referenceMonth);
  const company = companyName || 'Sua Empresa';
  
  const subject = `Relatório Tributário Executivo – ${company} – ${monthYear}`;
  
  // Plain text version
  let text = `RELATÓRIO TRIBUTÁRIO EXECUTIVO\n`;
  text += `${company} - ${monthYear}\n\n`;
  
  if (thermometerData) {
    text += `RESUMO EXECUTIVO\n`;
    text += `Nota Tributária: ${thermometerData.scoreGrade || 'N/A'} (${thermometerData.scoreTotal || 0}/1000 pontos)\n`;
    if (thermometerData.cargaEfetivaPercent) {
      text += `Carga tributária efetiva: ${thermometerData.cargaEfetivaPercent}%\n`;
    }
    if (thermometerData.caixaPotencialMin && thermometerData.caixaPotencialMax) {
      text += `Caixa em jogo: ${formatCurrency(thermometerData.caixaPotencialMin)} - ${formatCurrency(thermometerData.caixaPotencialMax)}\n`;
    }
    text += `\n`;
  }
  
  if (topProjects.length > 0) {
    text += `PROJETOS PRIORITÁRIOS\n`;
    topProjects.forEach((p, i) => {
      text += `${i + 1}. ${p.nome}`;
      if (p.impactoMax > 0) {
        text += ` (potencial: ${formatCurrency(p.impactoMin)} - ${formatCurrency(p.impactoMax)})`;
      }
      text += `\n`;
    });
    text += `\n`;
  }
  
  if (risks.length > 0) {
    text += `RISCOS A MONITORAR\n`;
    risks.forEach((r) => {
      text += `• ${r.categoria}: ${r.descricao} (risco ${r.nivel})\n`;
    });
    text += `\n`;
  }
  
  if (reformData?.hasData) {
    text += `IMPACTO DA REFORMA TRIBUTÁRIA\n`;
    text += `Impostos atuais: ${formatCurrency(reformData.impostosAtuais)}\n`;
    text += `Impostos novos: ${formatCurrency(reformData.impostosNovos)}\n`;
    if (reformData.impactoLucroAnual > 0) {
      const sinal = reformData.impactoPercentual < 0 ? '+' : '-';
      text += `Impacto no lucro: ${sinal}${formatCurrency(reformData.impactoLucroAnual)}\n`;
    }
  }
  
  text += `\n---\nRelatório gerado automaticamente pela plataforma Tributech`;
  
  // HTML version
  const gradeColorMap: Record<string, string> = {
    'A+': '#059669', 'A': '#059669', 'B': '#16a34a',
    'C': '#ca8a04', 'D': '#ea580c', 'E': '#dc2626'
  };
  const gradeColor = gradeColorMap[thermometerData?.scoreGrade || ''] || '#6b7280';
  
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 20px; font-weight: 600;">
                Relatório Tributário Executivo
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                ${company} · ${monthYear}
              </p>
            </td>
          </tr>
          
          <!-- Score Badge -->
          ${thermometerData?.scoreGrade ? `
          <tr>
            <td style="padding: 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <div style="display: inline-block; width: 64px; height: 64px; line-height: 64px; border-radius: 50%; background: ${gradeColor}15; color: ${gradeColor}; font-size: 28px; font-weight: bold;">
                ${thermometerData.scoreGrade}
              </div>
              <p style="margin: 12px 0 0; color: #374151; font-size: 14px;">
                Nota Tributária: <strong>${thermometerData.scoreTotal || 0}/1000</strong> pontos
              </p>
              ${thermometerData.cargaEfetivaPercent ? `
              <p style="margin: 4px 0 0; color: #6b7280; font-size: 13px;">
                Carga efetiva: ${thermometerData.cargaEfetivaPercent}% do faturamento
              </p>
              ` : ''}
            </td>
          </tr>
          ` : ''}
          
          <!-- Cash Potential -->
          ${thermometerData?.caixaPotencialMin && thermometerData?.caixaPotencialMax ? `
          <tr>
            <td style="padding: 20px 24px; background: #ecfdf5;">
              <p style="margin: 0 0 4px; color: #065f46; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                Caixa tributário em jogo
              </p>
              <p style="margin: 0; color: #047857; font-size: 24px; font-weight: bold;">
                ${formatCurrency(thermometerData.caixaPotencialMin)} – ${formatCurrency(thermometerData.caixaPotencialMax)}
              </p>
            </td>
          </tr>
          ` : ''}
          
          <!-- Projects -->
          ${topProjects.length > 0 ? `
          <tr>
            <td style="padding: 24px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 16px; font-weight: 600;">
                📋 Projetos Prioritários
              </h2>
              ${topProjects.map((p, i) => `
              <div style="padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 8px;">
                <p style="margin: 0; color: #374151; font-size: 14px;">
                  <strong>${i + 1}.</strong> ${p.nome}
                  ${p.impactoMax > 0 ? `<span style="color: #059669; float: right;">${formatCurrency(p.impactoMin)} – ${formatCurrency(p.impactoMax)}</span>` : ''}
                </p>
              </div>
              `).join('')}
            </td>
          </tr>
          ` : ''}
          
          <!-- Risks -->
          ${risks.length > 0 ? `
          <tr>
            <td style="padding: 0 24px 24px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 16px; font-weight: 600;">
                ⚠️ Riscos a Monitorar
              </h2>
          ${risks.map(r => {
                const riskColorMap: Record<string, string> = { baixo: '#059669', medio: '#ca8a04', alto: '#dc2626' };
                const riskColor = riskColorMap[r.nivel as string] || '#6b7280';
                return `
                <div style="padding: 12px; border-left: 3px solid ${riskColor}; background: #f9fafb; margin-bottom: 8px;">
                  <p style="margin: 0; color: #374151; font-size: 14px;">
                    <strong>${r.categoria}:</strong> ${r.descricao}
                    <span style="color: ${riskColor}; font-size: 12px;"> (${r.nivel})</span>
                  </p>
                </div>
                `;
              }).join('')}
            </td>
          </tr>
          ` : ''}
          
          <!-- Reform Impact -->
          ${reformData?.hasData ? `
          <tr>
            <td style="padding: 0 24px 24px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 16px; font-weight: 600;">
                📊 Impacto da Reforma Tributária
              </h2>
              <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
                <p style="margin: 0; color: #374151; font-size: 14px;">
                  Sua carga tributária tende a mudar de 
                  <strong>${formatCurrency(reformData.impostosAtuais)}</strong> para 
                  <strong>${formatCurrency(reformData.impostosNovos)}</strong>
                  ${reformData.impactoLucroAnual > 0 ? `, com impacto de 
                  <span style="color: ${reformData.impactoPercentual < 0 ? '#059669' : '#dc2626'}; font-weight: bold;">
                    ${reformData.impactoPercentual < 0 ? '+' : '-'}${formatCurrency(reformData.impactoLucroAnual)}
                  </span> no lucro anual` : ''}.
                </p>
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 24px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Relatório gerado automaticamente pela plataforma <strong>Tributech</strong>
              </p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 11px;">
                Para acessar detalhes completos, entre na plataforma.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  
  return { subject, html, text };
}

async function sendWithResend(
  apiKey: string,
  to: string[],
  content: EmailContent,
  fromEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: to,
        subject: content.subject,
        html: content.html,
        text: content.text,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Failed to send email' };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { userId, referenceMonth, recipients: overrideRecipients, reportData } = await req.json() as ReportRequest;
    
    if (!userId || !referenceMonth || !reportData) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userId, referenceMonth, reportData" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Validate referenceMonth format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(referenceMonth)) {
      return new Response(
        JSON.stringify({ error: "Invalid referenceMonth format. Use YYYY-MM" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get user profile and company profile for recipient emails
    const [profileResult, companyProfileResult] = await Promise.all([
      supabase.from('profiles').select('email, nome, empresa').eq('user_id', userId).single(),
      supabase.from('company_profile').select('email_ceo, email_cfo, email_contador, razao_social, nome_fantasia').eq('user_id', userId).single()
    ]);
    
    const profile = profileResult.data;
    const companyProfile = companyProfileResult.data;
    
    // Build recipient list
    let recipients: string[] = [];
    
    if (overrideRecipients && overrideRecipients.length > 0) {
      recipients = overrideRecipients;
    } else {
      // Default: use emails from profiles
      if (profile?.email) recipients.push(profile.email);
      if (companyProfile?.email_ceo && !recipients.includes(companyProfile.email_ceo)) {
        recipients.push(companyProfile.email_ceo);
      }
      if (companyProfile?.email_cfo && !recipients.includes(companyProfile.email_cfo)) {
        recipients.push(companyProfile.email_cfo);
      }
      // Contador goes as CC conceptually, but we add to recipients for simplicity
      if (companyProfile?.email_contador && !recipients.includes(companyProfile.email_contador)) {
        recipients.push(companyProfile.email_contador);
      }
    }
    
    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: "No recipients found. Please configure email addresses." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Use company name from data or profile
    const companyName = reportData.companyName || 
      companyProfile?.nome_fantasia || 
      companyProfile?.razao_social || 
      profile?.empresa || 
      `Empresa de ${profile?.nome}`;
    
    // Generate email content
    const enrichedReportData = { ...reportData, companyName };
    const emailContent = generateEmailContent(enrichedReportData, referenceMonth);
    
    // Create log entry first
    const { data: logEntry, error: logError } = await supabase
      .from('executive_report_logs')
      .insert({
        user_id: userId,
        company_name: companyName,
        reference_month: `${referenceMonth}-01`, // Convert to date
        sent_to: recipients,
        status: 'pending',
        report_data: enrichedReportData,
      })
      .select()
      .single();
    
    if (logError) {
      console.error('Failed to create log entry:', logError);
    }
    
    // Check if Resend is configured
    if (!resendApiKey) {
      // Update log as failed
      if (logEntry) {
        await supabase
          .from('executive_report_logs')
          .update({ 
            status: 'failed', 
            error_message: 'RESEND_API_KEY not configured' 
          })
          .eq('id', logEntry.id);
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Email service not configured. Please add RESEND_API_KEY secret.",
          recipients,
          logId: logEntry?.id
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Send email
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "TribuTalks <noreply@tributalks.com.br>";
    const sendResult = await sendWithResend(resendApiKey, recipients, emailContent, fromEmail);
    
    // Update log with result
    if (logEntry) {
      await supabase
        .from('executive_report_logs')
        .update({ 
          status: sendResult.success ? 'sent' : 'failed',
          error_message: sendResult.error || null,
          sent_at: new Date().toISOString(),
        })
        .eq('id', logEntry.id);
    }
    
    if (!sendResult.success) {
      return new Response(
        JSON.stringify({ 
          error: sendResult.error || 'Failed to send email',
          recipients,
          logId: logEntry?.id
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Report sent to ${recipients.length} recipient(s)`,
        recipients,
        logId: logEntry?.id
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in send-executive-report:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
