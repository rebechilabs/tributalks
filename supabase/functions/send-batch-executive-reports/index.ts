import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Batch send executive reports to all premium users
 * This function is designed to be called monthly (manually or via cron)
 * It will:
 * 1. Find all users with premium access (PREMIUM plan)
 * 2. For each user, gather their executive data
 * 3. Call send-executive-report for each user
 */

interface BatchResult {
  userId: string;
  companyName?: string;
  status: 'sent' | 'failed' | 'skipped';
  error?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Optional: parse referenceMonth from request, default to previous month
    const body = await req.json().catch(() => ({}));
    let referenceMonth = body.referenceMonth;
    
    if (!referenceMonth) {
      // Calculate previous month
      const now = new Date();
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      referenceMonth = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
    }
    
    console.log(`Starting batch send for reference month: ${referenceMonth}`);
    
    // Get all premium users
    const { data: premiumUsers, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, nome, email, empresa')
      .eq('plano', 'PREMIUM');
    
    if (usersError) {
      throw new Error(`Failed to fetch premium users: ${usersError.message}`);
    }
    
    if (!premiumUsers || premiumUsers.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No premium users found",
          processed: 0,
          results: []
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Found ${premiumUsers.length} premium users`);
    
    const results: BatchResult[] = [];
    
    for (const user of premiumUsers) {
      try {
        // Check if report was already sent this month
        const { data: existingLog } = await supabase
          .from('executive_report_logs')
          .select('id')
          .eq('user_id', user.user_id)
          .eq('reference_month', `${referenceMonth}-01`)
          .eq('status', 'sent')
          .single();
        
        if (existingLog) {
          results.push({
            userId: user.user_id,
            companyName: user.empresa,
            status: 'skipped',
            error: 'Report already sent this month'
          });
          continue;
        }
        
        // Gather executive data for this user
        const [taxScore, dre, creditSummary, opportunities, scoreActions] = await Promise.all([
          supabase.from('tax_score').select('*').eq('user_id', user.user_id).order('created_at', { ascending: false }).limit(1).single(),
          supabase.from('company_dre').select('*').eq('user_id', user.user_id).order('created_at', { ascending: false }).limit(1).single(),
          supabase.from('credit_analysis_summary').select('*').eq('user_id', user.user_id).order('created_at', { ascending: false }).limit(1).single(),
          supabase.from('company_opportunities').select('*, opportunity:tax_opportunities(name, name_simples)').eq('user_id', user.user_id).order('economia_anual_max', { ascending: false }).limit(5),
          supabase.from('score_actions').select('*').eq('user_id', user.user_id).eq('status', 'pending').order('priority', { ascending: true }).limit(5)
        ]);
        
        // Build thermometer data
        const score = taxScore.data;
        const dreData = dre.data;
        const credits = creditSummary.data;
        
        const thermometerData = {
          userName: user.nome,
          scoreGrade: score?.score_grade || 'E',
          scoreTotal: score?.score_total || 0,
          cargaEfetivaPercent: dreData ? 
            ((dreData.calc_lucro_bruto || 0) > 0 ? 
              Math.round(((dreData.calc_despesas_operacionais_total || 0) / (dreData.calc_lucro_bruto || 1)) * 100) : null) : null,
          caixaPotencialMin: (credits?.total_potential || 0) + (score?.economia_potencial || 0),
          caixaPotencialMax: ((credits?.total_potential || 0) + (score?.economia_potencial || 0)) * 1.5,
          riscoNivel: score?.risco_autuacao > 60 ? 'alto' : score?.risco_autuacao > 30 ? 'medio' : 'baixo',
        };
        
        // Build projects from actions and opportunities
        const topProjects = [
          ...(scoreActions.data || []).map((a: any) => ({
            id: a.id,
            nome: a.action_title,
            impactoMin: a.economia_estimada || 0,
            impactoMax: (a.economia_estimada || 0) * 1.2,
          })),
          ...(opportunities.data || []).map((o: any) => ({
            id: o.id,
            nome: o.opportunity?.name_simples || o.opportunity?.name || 'Oportunidade',
            impactoMin: o.economia_anual_min || 0,
            impactoMax: o.economia_anual_max || 0,
          }))
        ].slice(0, 5);
        
        // Reform data
        const reformData = dreData?.reforma_impacto_lucro ? {
          hasData: true,
          impostosAtuais: dreData.reforma_impostos_atuais || 0,
          impostosNovos: dreData.reforma_impostos_novos || 0,
          impactoLucroAnual: Math.abs(dreData.reforma_impacto_lucro || 0) * 12,
          impactoPercentual: dreData.reforma_impacto_percentual || 0,
        } : { hasData: false };
        
        // Risks
        const risks: any[] = [];
        if (score?.score_conformidade && score.score_conformidade < 100) {
          risks.push({ categoria: 'Conformidade', descricao: 'Pendências na documentação fiscal', nivel: 'medio' });
        }
        if (score?.risco_autuacao && score.risco_autuacao > 50) {
          risks.push({ categoria: 'Autuação', descricao: 'Risco elevado de fiscalização', nivel: 'alto' });
        }
        
        // Call the send function internally
        const sendResponse = await fetch(`${supabaseUrl}/functions/v1/send-executive-report`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.user_id,
            referenceMonth,
            reportData: {
              thermometerData,
              topProjects,
              reformData,
              risks,
              companyName: user.empresa,
            }
          })
        });
        
        const sendResult = await sendResponse.json();
        
        if (sendResponse.ok && sendResult.success) {
          results.push({
            userId: user.user_id,
            companyName: user.empresa,
            status: 'sent'
          });
        } else {
          results.push({
            userId: user.user_id,
            companyName: user.empresa,
            status: 'failed',
            error: sendResult.error || 'Unknown error'
          });
        }
        
      } catch (error) {
        results.push({
          userId: user.user_id,
          companyName: user.empresa,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const summary = {
      referenceMonth,
      totalUsers: premiumUsers.length,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      results
    };
    
    console.log(`Batch complete: ${summary.sent} sent, ${summary.failed} failed, ${summary.skipped} skipped`);
    
    return new Response(
      JSON.stringify(summary),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in batch send:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
