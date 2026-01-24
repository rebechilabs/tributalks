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

interface UseExecutiveDataReturn {
  thermometerData: ThermometerData | null;
  topProjects: ProjetoTributario[];
  reformData: ReformImpactData | null;
  risks: RiskItem[];
  loading: boolean;
  lastUpdate: Date | null;
  refresh: () => Promise<void>;
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
        opportunitiesResult
      ] = await Promise.all([
        supabase.from('profiles').select('nome').eq('user_id', userId).maybeSingle(),
        supabase.from('tax_score').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('company_dre').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('credit_analysis_summary').select('total_potential').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('identified_credits').select('potential_recovery').eq('user_id', userId),
        supabase.from('score_actions').select('*').eq('user_id', userId).eq('status', 'pending').order('priority', { ascending: true }).limit(3),
        supabase.from('company_opportunities').select('*, opportunity:opportunity_id(name, name_simples, description, description_ceo)').eq('user_id', userId).order('economia_anual_max', { ascending: false }).limit(3),
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
    loading,
    lastUpdate,
    refresh: fetchData,
  };
}
