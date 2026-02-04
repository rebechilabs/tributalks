import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ThermometerData {
  userName: string;
  scoreGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | null;
  scoreTotal: number | null;
  cargaEfetivaPercent: number | null;
  caixaPotencialMin: number | null;
  caixaPotencialMax: number | null;
  riscoNivel: 'baixo' | 'medio' | 'alto' | null;
  alertasCount: number;
  hasScoreData: boolean;
  hasDreData: boolean;
  hasCreditsData: boolean;
}

export interface ProjetoTributario {
  id: string;
  nome: string;
  descricaoSimples: string;
  impactoMin: number;
  impactoMax: number;
  prazo: 'curto' | 'medio' | 'longo';
  riscoNivel: 'baixo' | 'medio' | 'alto';
  status: 'pendente' | 'em_andamento' | 'concluido' | 'descartado';
  source: 'score_actions' | 'opportunities';
}

export interface ReformImpactData {
  impostosAtuais: number;
  impostosNovos: number;
  impactoPercentual: number;
  impactoLucroAnual: number;
  hasData: boolean;
}

export interface RiskItem {
  categoria: 'Conformidade' | 'Eficiencia' | 'Documentacao' | 'Gestao' | 'Risco';
  descricao: string;
  nivel: 'baixo' | 'medio' | 'alto';
  scoreAtual: number;
}

export interface ValuationMethodResult {
  valuationMin: number;
  valuationMax: number;
  multiple: number;
  label: string;
}

export interface ValuationData {
  // EBITDA Method (primary)
  ebitda: ValuationMethodResult;
  // DCF Method
  dcf: ValuationMethodResult;
  // Revenue Multiple Method
  revenue: ValuationMethodResult;
  // Common data
  ajusteCompliance: number; // multiplier (e.g., 1.15 for +15%)
  ajustePercentual: number; // percentage (e.g., 15 for +15%)
  potencialMelhoria: number; // additional value if score improves to A
  sectorName: string;
  scoreGrade: string | null;
  scoreTotal: number | null;
  hasData: boolean;
  missingData: ('ebitda' | 'score' | 'sector' | 'receita')[];
  // Raw data for display
  ebitdaAnual: number | null;
  receitaAnual: number | null;
  lucroLiquido: number | null;
}

interface UseExecutiveDataReturn {
  thermometerData: ThermometerData | null;
  topProjects: ProjetoTributario[];
  reformData: ReformImpactData | null;
  risks: RiskItem[];
  valuationData: ValuationData | null;
  loading: boolean;
  lastUpdate: Date | null;
  refresh: () => Promise<void>;
}

// Default sector multiples for EBITDA, Revenue and DCF discount rates
const DEFAULT_SECTOR_MULTIPLES: Record<string, { 
  ebitdaMultiple: number; 
  revenueMultiple: number; 
  dcfDiscount: number; // Discount rate (WACC) for DCF
  name: string;
}> = {
  'tecnologia': { ebitdaMultiple: 7.0, revenueMultiple: 2.5, dcfDiscount: 0.12, name: 'Tecnologia' },
  'servicos': { ebitdaMultiple: 4.8, revenueMultiple: 1.2, dcfDiscount: 0.14, name: 'Serviços Profissionais' },
  'saude': { ebitdaMultiple: 5.5, revenueMultiple: 1.8, dcfDiscount: 0.13, name: 'Saúde' },
  'varejo': { ebitdaMultiple: 4.0, revenueMultiple: 0.8, dcfDiscount: 0.15, name: 'Varejo' },
  'industria': { ebitdaMultiple: 5.0, revenueMultiple: 1.0, dcfDiscount: 0.14, name: 'Indústria' },
  'construcao': { ebitdaMultiple: 4.5, revenueMultiple: 0.9, dcfDiscount: 0.15, name: 'Construção' },
  'agronegocio': { ebitdaMultiple: 5.5, revenueMultiple: 1.5, dcfDiscount: 0.13, name: 'Agronegócio' },
  'financeiro': { ebitdaMultiple: 6.0, revenueMultiple: 2.0, dcfDiscount: 0.11, name: 'Financeiro' },
  'educacao': { ebitdaMultiple: 5.0, revenueMultiple: 1.5, dcfDiscount: 0.13, name: 'Educação' },
  'default': { ebitdaMultiple: 5.0, revenueMultiple: 1.0, dcfDiscount: 0.14, name: 'Mercado Geral' },
};

// DCF Calculation helper - 5-year projection with terminal value
function calculateDCF(
  lucroLiquido: number, 
  discountRate: number, 
  growthRate: number = 0.05, // 5% growth per year
  terminalGrowth: number = 0.03 // 3% perpetuity growth
): number {
  if (lucroLiquido <= 0) return 0;
  
  let presentValue = 0;
  const years = 5;
  
  // Project cash flows for 5 years
  for (let year = 1; year <= years; year++) {
    const projectedCashFlow = lucroLiquido * Math.pow(1 + growthRate, year);
    const discountFactor = Math.pow(1 + discountRate, year);
    presentValue += projectedCashFlow / discountFactor;
  }
  
  // Terminal value (Gordon Growth Model)
  const terminalCashFlow = lucroLiquido * Math.pow(1 + growthRate, years + 1);
  const terminalValue = terminalCashFlow / (discountRate - terminalGrowth);
  const discountedTerminal = terminalValue / Math.pow(1 + discountRate, years);
  
  return presentValue + discountedTerminal;
}

// Compliance adjustment based on tax score (0-1000)
function getComplianceAdjustment(score: number | null): { multiplier: number; percentual: number } {
  if (score === null) return { multiplier: 1.0, percentual: 0 };
  
  if (score >= 900) return { multiplier: 1.15, percentual: 15 };  // A+/A
  if (score >= 750) return { multiplier: 1.05, percentual: 5 };   // B
  if (score >= 600) return { multiplier: 1.0, percentual: 0 };    // C
  if (score >= 400) return { multiplier: 0.85, percentual: -15 }; // D
  return { multiplier: 0.70, percentual: -30 };                    // E
}

// Risk level from risco_autuacao (0-100 scale)
function getRiscoNivelFromAuditRisk(value: number): 'baixo' | 'medio' | 'alto' {
  if (value <= 30) return 'baixo';
  if (value <= 70) return 'medio';
  return 'alto';
}

// Risk level from dimension score (higher score = lower risk)
function getRiscoNivelFromScore(score: number, maxScore: number = 200): 'baixo' | 'medio' | 'alto' {
  const percent = (score / maxScore) * 100;
  if (percent >= 70) return 'baixo';
  if (percent >= 40) return 'medio';
  return 'alto';
}

function getPrazoFromPriority(priority: number): 'curto' | 'medio' | 'longo' {
  if (priority <= 2) return 'curto';
  if (priority <= 4) return 'medio';
  return 'longo';
}

function getRiskDescriptionForDimension(categoria: string, nivel: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    'Conformidade': {
      'alto': 'Falhas de conformidade podem gerar autuações em ICMS/ISS.',
      'medio': 'Algumas obrigações fiscais podem estar pendentes.',
      'baixo': 'Situação regularizada com as obrigações fiscais.'
    },
    'Eficiencia': {
      'alto': 'Possível pagamento excessivo de tributos. Revise seu regime.',
      'medio': 'Há espaço para otimização da carga tributária.',
      'baixo': 'Carga tributária está dentro do esperado.'
    },
    'Documentacao': {
      'alto': 'Documentação fiscal incompleta aumenta risco de multas.',
      'medio': 'Alguns documentos fiscais podem estar desatualizados.',
      'baixo': 'Documentação fiscal organizada e atualizada.'
    },
    'Gestao': {
      'alto': 'Controles internos insuficientes podem gerar inconsistências.',
      'medio': 'Processos de gestão tributária podem ser melhorados.',
      'baixo': 'Gestão tributária bem estruturada.'
    },
    'Risco': {
      'alto': 'Exposição significativa a autuações fiscais.',
      'medio': 'Risco moderado de questionamentos fiscais.',
      'baixo': 'Baixa exposição a riscos tributários.'
    }
  };
  return descriptions[categoria]?.[nivel] || `Atenção necessária em ${categoria}.`;
}

export function useExecutiveData(userId: string | undefined): UseExecutiveDataReturn {
  const [thermometerData, setThermometerData] = useState<ThermometerData | null>(null);
  const [topProjects, setTopProjects] = useState<ProjetoTributario[]>([]);
  const [reformData, setReformData] = useState<ReformImpactData | null>(null);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [valuationData, setValuationData] = useState<ValuationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch all data in parallel
      const [
        profileResult,
        taxScoreResult,
        dreResult,
        creditSummaryResult,
        identifiedCreditsResult,
        actionsResult,
        opportunitiesResult,
        companyProfileResult,
        sectorBenchmarkResult
      ] = await Promise.all([
        supabase.from('profiles').select('nome, setor, cnae').eq('user_id', userId).maybeSingle(),
        supabase.from('tax_score').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('company_dre').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('credit_analysis_summary').select('total_potential').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('identified_credits').select('potential_recovery').eq('user_id', userId),
        supabase.from('score_actions').select('*').eq('user_id', userId).eq('status', 'pending').order('priority', { ascending: true }).limit(3),
        supabase.from('company_opportunities').select('*, opportunity:opportunity_id(name, name_simples, description, description_ceo)').eq('user_id', userId).order('economia_anual_max', { ascending: false }).limit(3),
        supabase.from('company_profile').select('setor, cnae_principal').eq('user_id', userId).maybeSingle(),
        supabase.from('sector_benchmarks').select('sector_name, avg_ebitda_margin').limit(10),
      ]);

      // Extract data
      const userName = profileResult.data?.nome || 'Usuário';
      const taxScore = taxScoreResult.data;
      const dre = dreResult.data;
      
      // Calculate credits total
      let creditosTotal = 0;
      if (creditSummaryResult.data?.total_potential) {
        creditosTotal = Number(creditSummaryResult.data.total_potential);
      } else if (identifiedCreditsResult.data && identifiedCreditsResult.data.length > 0) {
        creditosTotal = identifiedCreditsResult.data.reduce((sum, c) => sum + Number(c.potential_recovery || 0), 0);
      }

      // Flags for data availability
      const hasScoreData = !!taxScore && taxScore.score_total !== null;
      const hasDreData = !!dre && dre.calc_receita_bruta !== null && Number(dre.calc_receita_bruta) > 0;
      const hasCreditsData = creditosTotal > 0;

      // Calculate effective tax burden (only if DRE data exists)
      let cargaEfetivaPercent: number | null = null;
      if (hasDreData && dre.input_impostos_sobre_vendas && dre.calc_receita_bruta) {
        const impostos = Number(dre.input_impostos_sobre_vendas);
        const receita = Number(dre.calc_receita_bruta);
        if (receita > 0) {
          cargaEfetivaPercent = Math.round((impostos / receita) * 1000) / 10;
        }
      }

      // Calculate potential cash (economia_potencial + credits)
      const economiaPotencial = taxScore?.economia_potencial ? Number(taxScore.economia_potencial) : 0;
      const totalPotencial = economiaPotencial + creditosTotal;
      
      let caixaPotencialMin: number | null = null;
      let caixaPotencialMax: number | null = null;
      if (totalPotencial > 0) {
        caixaPotencialMin = totalPotencial * 0.7;
        caixaPotencialMax = totalPotencial * 1.3;
      }

      // Risk level from risco_autuacao (0-100)
      let riscoNivel: 'baixo' | 'medio' | 'alto' | null = null;
      if (taxScore?.risco_autuacao !== null && taxScore?.risco_autuacao !== undefined) {
        riscoNivel = getRiscoNivelFromAuditRisk(Number(taxScore.risco_autuacao));
      } else if (taxScore?.score_risco !== null && taxScore?.score_risco !== undefined) {
        // Fallback to score_risco (higher = better, so invert logic)
        riscoNivel = getRiscoNivelFromScore(Number(taxScore.score_risco));
      }

      // Count pending alerts
      const alertasCount = actionsResult.data?.length || 0;

      setThermometerData({
        userName,
        scoreGrade: hasScoreData ? (taxScore.score_grade as ThermometerData['scoreGrade']) : null,
        scoreTotal: hasScoreData ? taxScore.score_total : null,
        cargaEfetivaPercent,
        caixaPotencialMin,
        caixaPotencialMax,
        riscoNivel,
        alertasCount,
        hasScoreData,
        hasDreData,
        hasCreditsData,
      });

      // Build top projects from score_actions OR company_opportunities
      let projects: ProjetoTributario[] = [];
      
      if (actionsResult.data && actionsResult.data.length > 0) {
        projects = actionsResult.data.map((action) => {
          const economia = Number(action.economia_estimada || 0);
          return {
            id: action.id,
            nome: action.action_title,
            descricaoSimples: action.action_description || '',
            impactoMin: economia * 0.8,
            impactoMax: economia * 1.2,
            prazo: getPrazoFromPriority(action.priority || 3),
            riscoNivel: 'baixo' as const,
            status: (action.status as ProjetoTributario['status']) || 'pendente',
            source: 'score_actions' as const,
          };
        });
      } else if (opportunitiesResult.data && opportunitiesResult.data.length > 0) {
        projects = opportunitiesResult.data.map((opp) => {
          const opportunity = opp.opportunity as any;
          return {
            id: opp.id,
            nome: opportunity?.name_simples || opportunity?.name || 'Oportunidade identificada',
            descricaoSimples: opportunity?.description_ceo || opportunity?.description || '',
            impactoMin: Number(opp.economia_anual_min || 0),
            impactoMax: Number(opp.economia_anual_max || 0),
            prazo: opp.prioridade <= 2 ? 'curto' as const : opp.prioridade <= 4 ? 'medio' as const : 'longo' as const,
            riscoNivel: 'baixo' as const,
            status: (opp.status as ProjetoTributario['status']) || 'pendente',
            source: 'opportunities' as const,
          };
        });
      }
      setTopProjects(projects.slice(0, 3));

      // Build reform impact data
      const hasReformData = dre && (
        dre.reforma_impacto_percentual !== null && 
        dre.reforma_impacto_percentual !== undefined && 
        Number(dre.reforma_impacto_percentual) !== 0
      );

      if (hasReformData) {
        const impostosAtuais = Number(dre.reforma_impostos_atuais || 0);
        const impostosNovos = Number(dre.reforma_impostos_novos || 0);
        const impactoPercentual = Number(dre.reforma_impacto_percentual || 0);
        const lucroLiquido = Number(dre.calc_lucro_liquido || 0);
        const impactoLucroAnual = lucroLiquido > 0 ? (lucroLiquido * Math.abs(impactoPercentual)) / 100 : 0;

        setReformData({
          impostosAtuais,
          impostosNovos,
          impactoPercentual,
          impactoLucroAnual,
          hasData: true,
        });
      } else {
        setReformData({
          impostosAtuais: 0,
          impostosNovos: 0,
          impactoPercentual: 0,
          impactoLucroAnual: 0,
          hasData: false,
        });
      }

      // Build risks from tax_score dimensions
      const riskItems: RiskItem[] = [];
      
      if (taxScore) {
        const dimensions = [
          { categoria: 'Conformidade' as const, score: Number(taxScore.score_conformidade || 0) },
          { categoria: 'Eficiencia' as const, score: Number(taxScore.score_eficiencia || 0) },
          { categoria: 'Documentacao' as const, score: Number(taxScore.score_documentacao || 0) },
          { categoria: 'Gestao' as const, score: Number(taxScore.score_gestao || 0) },
          { categoria: 'Risco' as const, score: Number(taxScore.score_risco || 0) },
        ];

        // Only show dimensions with medium or high risk
        dimensions.forEach(dim => {
          if (dim.score > 0) {
            const nivel = getRiscoNivelFromScore(dim.score);
            if (nivel !== 'baixo') {
              riskItems.push({
                categoria: dim.categoria,
                descricao: getRiskDescriptionForDimension(dim.categoria, nivel),
                nivel,
                scoreAtual: dim.score,
              });
            }
          }
        });

        // If all scores are good, show the lowest one with its actual status
        if (riskItems.length === 0 && dimensions.some(d => d.score > 0)) {
          const lowestDim = dimensions.filter(d => d.score > 0).reduce((min, d) => d.score < min.score ? d : min, dimensions.find(d => d.score > 0) || dimensions[0]);
          if (lowestDim.score > 0) {
            const nivel = getRiscoNivelFromScore(lowestDim.score);
            riskItems.push({
              categoria: lowestDim.categoria,
              descricao: getRiskDescriptionForDimension(lowestDim.categoria, nivel),
              nivel,
              scoreAtual: lowestDim.score,
            });
          }
        }
      }

      setRisks(riskItems.slice(0, 4));

      // ========== VALUATION CALCULATION ==========
      const ebitda = dre?.calc_ebitda ? Number(dre.calc_ebitda) : null;
      const scoreTotal = taxScore?.score_total ? Number(taxScore.score_total) : null;
      const scoreGrade = taxScore?.score_grade || null;
      
      // Get sector from company_profile or profiles
      const sectorFromProfile = companyProfileResult.data?.setor || profileResult.data?.setor;
      const cnaeFromProfile = companyProfileResult.data?.cnae_principal || profileResult.data?.cnae;
      
      // Determine sector multiple
      let sectorKey = 'default';
      let sectorName = 'Mercado Geral';
      
      if (sectorFromProfile) {
        const normalizedSector = sectorFromProfile.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        // Map sector to our predefined multiples
        if (normalizedSector.includes('tecnologia') || normalizedSector.includes('software') || normalizedSector.includes('ti')) {
          sectorKey = 'tecnologia';
        } else if (normalizedSector.includes('saude') || normalizedSector.includes('medic') || normalizedSector.includes('hospital')) {
          sectorKey = 'saude';
        } else if (normalizedSector.includes('varejo') || normalizedSector.includes('comercio')) {
          sectorKey = 'varejo';
        } else if (normalizedSector.includes('industria') || normalizedSector.includes('manufatura')) {
          sectorKey = 'industria';
        } else if (normalizedSector.includes('construcao') || normalizedSector.includes('imobili')) {
          sectorKey = 'construcao';
        } else if (normalizedSector.includes('agro') || normalizedSector.includes('agricul')) {
          sectorKey = 'agronegocio';
        } else if (normalizedSector.includes('financ') || normalizedSector.includes('banco')) {
          sectorKey = 'financeiro';
        } else if (normalizedSector.includes('educa') || normalizedSector.includes('ensino')) {
          sectorKey = 'educacao';
        } else if (normalizedSector.includes('servic')) {
          sectorKey = 'servicos';
        }
      }
      
      const sectorData = DEFAULT_SECTOR_MULTIPLES[sectorKey] || DEFAULT_SECTOR_MULTIPLES['default'];
      sectorName = sectorData.name;
      const baseEbitdaMultiple = sectorData.ebitdaMultiple;
      const baseRevenueMultiple = sectorData.revenueMultiple;
      const discountRate = sectorData.dcfDiscount;

      // Get receita and lucro for other methods
      const receitaAnual = dre?.calc_receita_bruta ? Number(dre.calc_receita_bruta) * 12 : null;
      const lucroLiquido = dre?.calc_lucro_liquido ? Number(dre.calc_lucro_liquido) * 12 : null;
      const ebitdaAnual = ebitda ? ebitda * 12 : null;

      // Calculate valuation data
      const missingData: ('ebitda' | 'score' | 'sector' | 'receita')[] = [];
      if (!ebitda || ebitda <= 0) missingData.push('ebitda');
      if (scoreTotal === null) missingData.push('score');
      if (!sectorFromProfile && !cnaeFromProfile) missingData.push('sector');
      if (!receitaAnual || receitaAnual <= 0) missingData.push('receita');

      const hasValuationData = (ebitda !== null && ebitda > 0) || (receitaAnual !== null && receitaAnual > 0);

      if (hasValuationData) {
        const { multiplier, percentual } = getComplianceAdjustment(scoreTotal);
        
        // 1. EBITDA Multiple Method
        const adjustedEbitdaMultiple = baseEbitdaMultiple * multiplier;
        const ebitdaValuation = ebitdaAnual ? ebitdaAnual * adjustedEbitdaMultiple : 0;
        
        // 2. DCF Method
        const dcfValuation = lucroLiquido && lucroLiquido > 0 
          ? calculateDCF(lucroLiquido, discountRate) * multiplier 
          : 0;
        
        // 3. Revenue Multiple Method  
        const adjustedRevenueMultiple = baseRevenueMultiple * multiplier;
        const revenueValuation = receitaAnual ? receitaAnual * adjustedRevenueMultiple : 0;
        
        // Calculate potential improvement (what if score goes to A = 900+)
        const targetAdjustment = getComplianceAdjustment(900);
        const targetMultiple = baseEbitdaMultiple * targetAdjustment.multiplier;
        const targetValuation = ebitdaAnual ? ebitdaAnual * targetMultiple : 0;
        const potencialMelhoria = scoreTotal !== null && scoreTotal < 900 && ebitdaAnual
          ? Math.max(0, targetValuation - ebitdaValuation)
          : 0;

        setValuationData({
          ebitda: {
            valuationMin: ebitdaValuation * 0.8,
            valuationMax: ebitdaValuation * 1.2,
            multiple: adjustedEbitdaMultiple,
            label: 'Múltiplo de EBITDA',
          },
          dcf: {
            valuationMin: dcfValuation * 0.8,
            valuationMax: dcfValuation * 1.2,
            multiple: discountRate * 100, // Display as percentage
            label: 'Fluxo de Caixa Descontado',
          },
          revenue: {
            valuationMin: revenueValuation * 0.8,
            valuationMax: revenueValuation * 1.2,
            multiple: adjustedRevenueMultiple,
            label: 'Múltiplo de Receita',
          },
          ajusteCompliance: multiplier,
          ajustePercentual: percentual,
          potencialMelhoria,
          sectorName,
          scoreGrade,
          scoreTotal,
          hasData: true,
          missingData,
          ebitdaAnual,
          receitaAnual,
          lucroLiquido,
        });
      } else {
        setValuationData({
          ebitda: { valuationMin: 0, valuationMax: 0, multiple: baseEbitdaMultiple, label: 'Múltiplo de EBITDA' },
          dcf: { valuationMin: 0, valuationMax: 0, multiple: discountRate * 100, label: 'Fluxo de Caixa Descontado' },
          revenue: { valuationMin: 0, valuationMax: 0, multiple: baseRevenueMultiple, label: 'Múltiplo de Receita' },
          ajusteCompliance: 1,
          ajustePercentual: 0,
          potencialMelhoria: 0,
          sectorName,
          scoreGrade,
          scoreTotal,
          hasData: false,
          missingData,
          ebitdaAnual: null,
          receitaAnual: null,
          lucroLiquido: null,
        });
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching executive data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    thermometerData,
    topProjects,
    reformData,
    risks,
    valuationData,
    loading,
    lastUpdate,
    refresh: fetchData,
  };
}
