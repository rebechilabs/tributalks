import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiagnosticRequest {
  xmlPaths: string[];
  userId: string;
}

interface CreditItem {
  ncm: string;
  value: number;
  type: string;
  confidence: 'high' | 'medium' | 'low';
}

interface DiagnosticResult {
  status: 'complete' | 'partial' | 'error';
  credits?: { total: number; items: CreditItem[] };
  cashflow?: { risk: 'low' | 'medium' | 'high'; impact_q2_2027: number };
  margin?: { current: number; projected: number; delta_pp: number };
  insights: string[];
  processing_time_ms: number;
}

// Timeout wrapper for individual analyses
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  ]);
}

// Parse XML and extract relevant data
async function parseXmls(
  supabase: any,
  xmlPaths: string[]
): Promise<any[]> {
  const parsedData: any[] = [];
  
  for (const path of xmlPaths) {
    try {
      const { data, error } = await supabase.storage
        .from('xml-imports')
        .download(path);
      
      if (error || !data) continue;
      
      const text = await data.text();
      
      // Extract key data from NFe XML
      const nfeMatch = text.match(/<nNF>(\d+)<\/nNF>/);
      const valorMatch = text.match(/<vNF>([^<]+)<\/vNF>/);
      const ncmMatches = text.matchAll(/<NCM>(\d+)<\/NCM>/g);
      const icmsMatches = text.matchAll(/<vICMS>([^<]+)<\/vICMS>/g);
      const pisMatches = text.matchAll(/<vPIS>([^<]+)<\/vPIS>/g);
      const cofinsMatches = text.matchAll(/<vCOFINS>([^<]+)<\/vCOFINS>/g);
      const ncms = [...ncmMatches].map(m => m[1]);
      const icmsValues = [...icmsMatches].map(m => parseFloat(m[1]) || 0);
      const pisValues = [...pisMatches].map(m => parseFloat(m[1]) || 0);
      const cofinsValues = [...cofinsMatches].map(m => parseFloat(m[1]) || 0);
      
      parsedData.push({
        nfe: nfeMatch ? nfeMatch[1] : 'unknown',
        valor: valorMatch ? parseFloat(valorMatch[1]) : 0,
        ncms,
        totalIcms: icmsValues.reduce((a, b) => a + b, 0),
        totalPis: pisValues.reduce((a, b) => a + b, 0),
        totalCofins: cofinsValues.reduce((a, b) => a + b, 0),
      });
    } catch (e) {
      console.error('Error parsing XML:', path, e);
    }
  }
  
  return parsedData;
}

// Analyze credits from parsed data
async function analyzeCredits(parsedData: any[]): Promise<{ total: number; items: CreditItem[] }> {
  const credits: CreditItem[] = [];
  let total = 0;
  
  for (const nfe of parsedData) {
    // Identify potential PIS/COFINS credits
    if (nfe.totalPis > 0) {
      const creditValue = nfe.totalPis * 0.15; // Simplified: 15% potential recovery
      credits.push({
        ncm: nfe.ncms[0] || 'N/A',
        value: creditValue,
        type: 'PIS',
        confidence: 'medium'
      });
      total += creditValue;
    }
    
    if (nfe.totalCofins > 0) {
      const creditValue = nfe.totalCofins * 0.12;
      credits.push({
        ncm: nfe.ncms[0] || 'N/A',
        value: creditValue,
        type: 'COFINS',
        confidence: 'medium'
      });
      total += creditValue;
    }
    
    // ICMS-ST potential credits
    if (nfe.totalIcms > 500) {
      const creditValue = nfe.totalIcms * 0.08;
      credits.push({
        ncm: nfe.ncms[0] || 'N/A',
        value: creditValue,
        type: 'ICMS-ST',
        confidence: 'low'
      });
      total += creditValue;
    }
  }
  
  return { total, items: credits.slice(0, 10) }; // Limit to top 10
}

// Project cashflow impact
async function projectCashflow(parsedData: any[]): Promise<{ risk: 'low' | 'medium' | 'high'; impact_q2_2027: number }> {
  const totalValue = parsedData.reduce((acc, nfe) => acc + nfe.valor, 0);
  const totalTaxes = parsedData.reduce((acc, nfe) => 
    acc + nfe.totalIcms + nfe.totalPis + nfe.totalCofins, 0);
  
  // Split payment impact simulation
  const splitPaymentImpact = totalTaxes * 0.3; // 30% earlier payment
  
  // Risk assessment based on tax burden
  const taxBurden = totalTaxes / totalValue;
  let risk: 'low' | 'medium' | 'high' = 'low';
  if (taxBurden > 0.25) risk = 'high';
  else if (taxBurden > 0.15) risk = 'medium';
  
  return {
    risk,
    impact_q2_2027: -splitPaymentImpact // Negative impact on cashflow
  };
}

// Calculate margin impact
async function calculateMarginImpact(parsedData: any[]): Promise<{ current: number; projected: number; delta_pp: number }> {
  const totalValue = parsedData.reduce((acc, nfe) => acc + nfe.valor, 0);
  const totalTaxes = parsedData.reduce((acc, nfe) => 
    acc + nfe.totalIcms + nfe.totalPis + nfe.totalCofins, 0);
  
  // Estimated current margin (simplified)
  const currentMargin = 12; // 12% assumed base
  
  // Reform impact on margin (CBS/IBS change)
  const reformImpact = (totalTaxes / totalValue) * 100 * 0.15; // 15% change in tax structure
  const projectedMargin = currentMargin - reformImpact;
  
  return {
    current: currentMargin,
    projected: projectedMargin,
    delta_pp: projectedMargin - currentMargin
  };
}

// Generate insights from analysis
function generateInsights(
  credits: { total: number; items: CreditItem[] },
  cashflow: { risk: 'low' | 'medium' | 'high'; impact_q2_2027: number },
  margin: { current: number; projected: number; delta_pp: number }
): string[] {
  const insights: string[] = [];
  
  if (credits.total > 10000) {
    insights.push(`Identificados R$ ${credits.total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} em créditos potenciais para recuperação`);
  }
  
  if (cashflow.risk === 'high') {
    insights.push("Alto risco de impacto no fluxo de caixa com o Split Payment em 2027");
  } else if (cashflow.risk === 'medium') {
    insights.push("Impacto moderado esperado no fluxo de caixa — planejamento recomendado");
  }
  
  if (margin.delta_pp < -2) {
    insights.push(`Margem pode reduzir ${Math.abs(margin.delta_pp).toFixed(1)}pp — ações de precificação necessárias`);
  }
  
  const pisCredits = credits.items.filter(c => c.type === 'PIS').length;
  const cofinsCredits = credits.items.filter(c => c.type === 'COFINS').length;
  
  if (pisCredits > 0 || cofinsCredits > 0) {
    insights.push(`${pisCredits + cofinsCredits} oportunidades de crédito PIS/COFINS identificadas`);
  }
  
  if (insights.length === 0) {
    insights.push("Análise inicial concluída — explore o NEXUS para detalhes completos");
  }
  
  return insights;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Validar Bearer token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    if (body.userId && body.userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { xmlPaths, userId } = body as DiagnosticRequest;

    if (!xmlPaths || !userId) {
      throw new Error('Missing required parameters');
    }

    // Parse XMLs (with 15s timeout)
    const parsedData = await withTimeout(
      parseXmls(supabase, xmlPaths),
      15000,
      []
    );

    if (parsedData.length === 0) {
      throw new Error('Could not parse any XML files');
    }

    // Run analyses in parallel with individual timeouts
    const [credits, cashflow, margin] = await Promise.all([
      withTimeout(analyzeCredits(parsedData), 25000, { total: 0, items: [] }),
      withTimeout(projectCashflow(parsedData), 30000, { risk: 'medium' as const, impact_q2_2027: 0 }),
      withTimeout(calculateMarginImpact(parsedData), 25000, { current: 0, projected: 0, delta_pp: 0 }),
    ]);

    const insights = generateInsights(credits, cashflow, margin);
    
    const processingTime = Date.now() - startTime;

    // Determine status
    const isPartial = credits.total === 0 && margin.current === 0;
    
    const result: DiagnosticResult = {
      status: isPartial ? 'partial' : 'complete',
      credits: credits.total > 0 ? credits : undefined,
      cashflow,
      margin: margin.current > 0 ? margin : undefined,
      insights,
      processing_time_ms: processingTime
    };

    // Save result to database
    const { error: saveError } = await supabase
      .from('diagnostic_results')
      .insert({
        user_id: userId,
        status: result.status,
        source: 'xml',
        credits_total: credits.total,
        credits_items: credits.items,
        cashflow_risk: cashflow.risk,
        cashflow_impact_q2_2027: cashflow.impact_q2_2027,
        margin_current: margin.current,
        margin_projected: margin.projected,
        margin_delta_pp: margin.delta_pp,
        insights: insights,
        processing_time_ms: processingTime,
        xmls_processed: parsedData.length,
      });

    if (saveError) {
      console.error('Error saving diagnostic result:', saveError);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Quick diagnostic error:', error);
    
    const processingTime = Date.now() - startTime;
    
    const errorResult: DiagnosticResult = {
      status: 'error',
      insights: ['Não foi possível completar a análise. Tente novamente com outros arquivos.'],
      processing_time_ms: processingTime
    };

    return new Response(JSON.stringify(errorResult), {
      status: 200, // Return 200 with error status in body
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
