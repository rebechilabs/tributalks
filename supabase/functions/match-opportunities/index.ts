import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CompanyProfile {
  user_id: string;
  setor?: string;
  porte?: string;
  faturamento_anual?: number;
  faturamento_mensal_medio?: number;
  regime_tributario?: string;
  qtd_cnpjs?: number;
  tem_holding?: boolean;
  vende_produtos?: boolean;
  vende_servicos?: boolean;
  tem_atividades_mistas?: boolean;
  tem_produtos_monofasicos?: boolean;
  vende_combustiveis?: boolean;
  vende_bebidas?: boolean;
  vende_cosmeticos?: boolean;
  vende_farmacos?: boolean;
  vende_autopecas?: boolean;
  vende_pneus?: boolean;
  vende_eletronicos?: boolean;
  exporta_produtos?: boolean;
  exporta_servicos?: boolean;
  tem_atividade_pd?: boolean;
  uf_sede?: string;
  folha_percentual_faturamento?: number;
}

interface TaxOpportunity {
  id: string;
  code: string;
  name: string;
  name_simples: string;
  description_ceo?: string;
  category: string;
  tipo_tributo: string;
  tributos_afetados: string[];
  criterios: Record<string, unknown>;
  economia_tipo: string;
  economia_percentual_min?: number;
  economia_percentual_max?: number;
  economia_base?: string;
  economia_descricao_simples?: string;
  complexidade: string;
  tempo_implementacao?: string;
  risco_fiscal?: string;
  base_legal_resumo?: string;
}

function evaluateOpportunity(
  profile: CompanyProfile, 
  opportunity: TaxOpportunity
): { eligible: boolean; score: number; reasons: string[]; missing: string[] } {
  const criterios = opportunity.criterios;
  const reasons: string[] = [];
  const missing: string[] = [];
  let score = 0;
  let requiredMet = true;

  // Evaluate each criteria
  for (const [key, value] of Object.entries(criterios)) {
    // Handle special operators
    if (key.endsWith('_in')) {
      const field = key.replace('_in', '');
      const profileValue = profile[field as keyof CompanyProfile];
      if (Array.isArray(value) && value.includes(profileValue)) {
        score += 20;
        reasons.push(`${field} compatível`);
      } else if (Array.isArray(value)) {
        missing.push(`${field} não está na lista de elegíveis`);
      }
      continue;
    }

    if (key.endsWith('_min')) {
      const field = key.replace('_min', '');
      const profileValue = profile[field as keyof CompanyProfile] as number;
      if (profileValue && profileValue >= (value as number)) {
        score += 15;
        reasons.push(`${field} acima do mínimo`);
      } else {
        missing.push(`${field} abaixo do mínimo requerido`);
        requiredMet = false;
      }
      continue;
    }

    // Direct boolean match
    if (typeof value === 'boolean') {
      const profileValue = profile[key as keyof CompanyProfile];
      if (profileValue === value) {
        score += 25;
        reasons.push(`${key.replace(/_/g, ' ')}`);
      } else if (value === true) {
        // If required true but profile is false/undefined
        missing.push(`Requer: ${key.replace(/_/g, ' ')}`);
        requiredMet = false;
      }
      continue;
    }

    // String match
    if (typeof value === 'string') {
      const profileValue = profile[key as keyof CompanyProfile];
      if (profileValue === value) {
        score += 20;
        reasons.push(`${key}: ${value}`);
      } else {
        missing.push(`Requer ${key}: ${value}`);
        requiredMet = false;
      }
    }
  }

  // Cap score at 100
  score = Math.min(score, 100);

  return {
    eligible: requiredMet && score >= 20,
    score,
    reasons,
    missing
  };
}

function calculateEconomia(
  profile: CompanyProfile, 
  opportunity: TaxOpportunity
): { mensal_min: number; mensal_max: number; anual_min: number; anual_max: number } {
  const fatMensal = profile.faturamento_mensal_medio || 0;
  const fatAnual = profile.faturamento_anual || fatMensal * 12;

  if (!opportunity.economia_percentual_min) {
    // Variable or case-by-case
    return {
      mensal_min: 0,
      mensal_max: 0,
      anual_min: 0,
      anual_max: 0
    };
  }

  // Determine base for calculation
  let base = fatMensal;
  const economiaBase = opportunity.economia_base || 'faturamento_total';

  // Estimate specific revenue based on profile
  if (economiaBase.includes('combustiveis') && profile.vende_combustiveis) {
    base = fatMensal * 0.7; // Assume 70% is fuel revenue
  } else if (economiaBase.includes('bebidas') && profile.vende_bebidas) {
    base = fatMensal * 0.4;
  } else if (economiaBase.includes('cosmeticos') && profile.vende_cosmeticos) {
    base = fatMensal * 0.5;
  } else if (economiaBase.includes('farmacos') && profile.vende_farmacos) {
    base = fatMensal * 0.6;
  } else if (economiaBase.includes('autopecas') && profile.vende_autopecas) {
    base = fatMensal * 0.5;
  } else if (economiaBase.includes('pneus') && profile.vende_pneus) {
    base = fatMensal * 0.3;
  } else if (economiaBase.includes('servicos') && profile.vende_servicos) {
    base = fatMensal * (profile.vende_produtos ? 0.5 : 0.9);
  } else if (economiaBase.includes('exportacao') && (profile.exporta_produtos || profile.exporta_servicos)) {
    base = fatMensal * 0.3;
  } else if (economiaBase.includes('das')) {
    // DAS is roughly 6-15% of revenue for Simples
    base = fatMensal * 0.10;
  } else if (economiaBase.includes('irpj_csll')) {
    // IRPJ/CSLL is roughly 3-8% of revenue
    base = fatMensal * 0.05;
  }

  const mensalMin = base * (opportunity.economia_percentual_min / 100);
  const mensalMax = base * (opportunity.economia_percentual_max || opportunity.economia_percentual_min) / 100;

  return {
    mensal_min: Math.round(mensalMin),
    mensal_max: Math.round(mensalMax),
    anual_min: Math.round(mensalMin * 12),
    anual_max: Math.round(mensalMax * 12)
  };
}

function calculatePrioridade(
  opportunity: TaxOpportunity, 
  economia: { anual_max: number }
): number {
  // 1 = highest priority
  let prioridade = 3;

  // Quick wins get priority
  if (opportunity.complexidade === 'muito_baixa' || opportunity.complexidade === 'baixa') {
    prioridade--;
  }

  // High impact gets priority
  if (economia.anual_max > 50000) {
    prioridade--;
  }

  // Low risk gets priority
  if (opportunity.risco_fiscal === 'nenhum') {
    prioridade--;
  }

  return Math.max(1, prioridade);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { user_id } = await req.json()

    if (!user_id) {
      return new Response(JSON.stringify({ 
        error: 'missing_user_id',
        message: 'User ID is required'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 1. FETCH PROFILE
    const { data: profile, error: profileError } = await supabase
      .from('company_profile')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (profileError || !profile) {
      return new Response(JSON.stringify({ 
        error: 'complete_profile',
        message: 'Complete seu perfil para ver as oportunidades'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. FETCH ACTIVE OPPORTUNITIES
    const { data: opportunities, error: oppError } = await supabase
      .from('tax_opportunities')
      .select('*')
      .eq('is_active', true)

    if (oppError || !opportunities) {
      throw new Error('Failed to fetch opportunities')
    }

    // 3. MATCH OPPORTUNITIES
    const matches = []

    for (const opp of opportunities) {
      const result = evaluateOpportunity(profile as CompanyProfile, opp as TaxOpportunity)
      
      if (result.eligible) {
        const economia = calculateEconomia(profile as CompanyProfile, opp as TaxOpportunity)
        const prioridade = calculatePrioridade(opp as TaxOpportunity, economia)
        
        matches.push({
          opportunity_id: opp.id,
          opportunity: opp,
          match_score: result.score,
          match_reasons: result.reasons,
          missing_criteria: result.missing,
          economia_mensal_min: economia.mensal_min,
          economia_mensal_max: economia.mensal_max,
          economia_anual_min: economia.anual_min,
          economia_anual_max: economia.anual_max,
          quick_win: opp.complexidade === 'muito_baixa' || opp.complexidade === 'baixa',
          alto_impacto: economia.anual_max > 50000,
          prioridade
        })
      }
    }

    // 4. SORT BY PRIORITY
    matches.sort((a, b) => {
      // Quick wins first
      if (a.quick_win && !b.quick_win) return -1
      if (!a.quick_win && b.quick_win) return 1
      // Then by economia
      return b.economia_anual_max - a.economia_anual_max
    })

    // 5. UPSERT COMPANY OPPORTUNITIES
    // First delete old matches
    await supabase
      .from('company_opportunities')
      .delete()
      .eq('user_id', user_id)
      .eq('status', 'nova')

    // Insert new matches
    if (matches.length > 0) {
      const toInsert = matches.map(m => ({
        user_id,
        opportunity_id: m.opportunity_id,
        match_score: m.match_score,
        match_reasons: m.match_reasons,
        missing_criteria: m.missing_criteria,
        economia_mensal_min: m.economia_mensal_min,
        economia_mensal_max: m.economia_mensal_max,
        economia_anual_min: m.economia_anual_min,
        economia_anual_max: m.economia_anual_max,
        quick_win: m.quick_win,
        alto_impacto: m.alto_impacto,
        prioridade: m.prioridade,
        status: 'nova'
      }))

      await supabase
        .from('company_opportunities')
        .upsert(toInsert, { onConflict: 'user_id,opportunity_id' })
    }

    // 6. CALCULATE SUMMARY
    const totalEconomiaMin = matches.reduce((sum, m) => sum + m.economia_anual_min, 0)
    const totalEconomiaMax = matches.reduce((sum, m) => sum + m.economia_anual_max, 0)
    const quickWins = matches.filter(m => m.quick_win).length
    const highImpact = matches.filter(m => m.alto_impacto).length

    return new Response(JSON.stringify({
      success: true,
      total_opportunities: matches.length,
      quick_wins: quickWins,
      high_impact: highImpact,
      economia_anual_min: totalEconomiaMin,
      economia_anual_max: totalEconomiaMax,
      opportunities: matches.map(m => ({
        id: m.opportunity_id,
        code: m.opportunity.code,
        name: m.opportunity.name_simples,
        description: m.opportunity.description_ceo,
        category: m.opportunity.category,
        match_score: m.match_score,
        match_reasons: m.match_reasons,
        economia_anual_min: m.economia_anual_min,
        economia_anual_max: m.economia_anual_max,
        complexidade: m.opportunity.complexidade,
        tempo_implementacao: m.opportunity.tempo_implementacao,
        risco_fiscal: m.opportunity.risco_fiscal,
        quick_win: m.quick_win,
        alto_impacto: m.alto_impacto,
        prioridade: m.prioridade,
        tributos_afetados: m.opportunity.tributos_afetados
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Match opportunities error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ 
      error: 'internal_error',
      message: errorMessage 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
