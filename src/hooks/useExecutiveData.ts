import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ThermometerData {
  userName: string;
  scoreGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';
  scoreTotal: number;
  cargaEfetivaPercent: number;
  caixaPotencialMin: number;
  caixaPotencialMax: number;
  riscoNivel: 'baixo' | 'medio' | 'alto';
  alertasCount: number;
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

function getRiscoNivel(score: number): 'baixo' | 'medio' | 'alto' {
  if (score >= 150) return 'baixo';
  if (score >= 80) return 'medio';
  return 'alto';
}

function getRiscoNivelFromScore(score: number, maxScore: number = 200): 'baixo' | 'medio' | 'alto' {
  const percent = (score / maxScore) * 100;
  if (percent >= 70) return 'baixo';
  if (percent >= 40) return 'medio';
  return 'alto';
}

function getPrazo(priority: number): 'curto' | 'medio' | 'longo' {
  if (priority <= 2) return 'curto';
  if (priority <= 4) return 'medio';
  return 'longo';
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
      const [profileResult, taxScoreResult, dreResult, creditSummaryResult, actionsResult] = await Promise.all([
        supabase.from('profiles').select('nome').eq('user_id', userId).maybeSingle(),
        supabase.from('tax_score').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('company_dre').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('credit_analysis_summary').select('total_potential').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('score_actions').select('*').eq('user_id', userId).order('priority', { ascending: true }).limit(3),
      ]);

      // Build thermometer data
      const userName = profileResult.data?.nome || 'Usuário';
      const taxScore = taxScoreResult.data;
      const dre = dreResult.data;
      const creditSummary = creditSummaryResult.data;

      // Calculate effective tax burden
      let cargaEfetivaPercent = 0;
      if (dre && dre.calc_receita_bruta && dre.calc_receita_bruta > 0) {
        cargaEfetivaPercent = ((dre.input_impostos_sobre_vendas || 0) / dre.calc_receita_bruta) * 100;
      }

      // Calculate potential cash (credits + savings)
      const economiaPotencial = taxScore?.economia_potencial || 0;
      const creditosPotenciais = creditSummary?.total_potential || 0;
      const totalPotencial = economiaPotencial + creditosPotenciais;
      const caixaPotencialMin = totalPotencial * 0.8;
      const caixaPotencialMax = totalPotencial * 1.2;

      // Risk level from risco_autuacao
      const riscoAuditoria = taxScore?.risco_autuacao || 0;
      const riscoNivel = getRiscoNivel(riscoAuditoria > 0 ? 200 - riscoAuditoria : (taxScore?.score_risco || 100));

      // Count alerts (pending actions)
      const alertasCount = actionsResult.data?.filter(a => a.status === 'pending').length || 0;

      setThermometerData({
        userName,
        scoreGrade: (taxScore?.score_grade as ThermometerData['scoreGrade']) || 'E',
        scoreTotal: taxScore?.score_total || 0,
        cargaEfetivaPercent: Math.round(cargaEfetivaPercent * 10) / 10,
        caixaPotencialMin,
        caixaPotencialMax,
        riscoNivel,
        alertasCount,
      });

      // Build top projects
      const projects: ProjetoTributario[] = (actionsResult.data || []).map((action) => ({
        id: action.id,
        nome: action.action_title,
        descricaoSimples: action.action_description || '',
        impactoMin: (action.economia_estimada || 0) * 0.8,
        impactoMax: (action.economia_estimada || 0) * 1.2,
        prazo: getPrazo(action.priority || 3),
        riscoNivel: 'baixo' as const,
        status: (action.status as ProjetoTributario['status']) || 'pendente',
      }));
      setTopProjects(projects);

      // Build reform impact data
      if (dre && (dre.reforma_impostos_atuais || dre.reforma_impostos_novos)) {
        const impostosAtuais = dre.reforma_impostos_atuais || 0;
        const impostosNovos = dre.reforma_impostos_novos || 0;
        const impactoPercentual = dre.reforma_impacto_percentual || 0;
        const lucroLiquido = dre.calc_lucro_liquido || 0;
        const impactoLucroAnual = (lucroLiquido * Math.abs(impactoPercentual)) / 100;

        setReformData({
          impostosAtuais: Number(impostosAtuais),
          impostosNovos: Number(impostosNovos),
          impactoPercentual: Number(impactoPercentual),
          impactoLucroAnual: Number(impactoLucroAnual),
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
          { categoria: 'Conformidade' as const, score: taxScore.score_conformidade || 0, desc: 'Adequação às obrigações fiscais' },
          { categoria: 'Eficiencia' as const, score: taxScore.score_eficiencia || 0, desc: 'Otimização da carga tributária' },
          { categoria: 'Documentacao' as const, score: taxScore.score_documentacao || 0, desc: 'Organização de documentos fiscais' },
          { categoria: 'Gestao' as const, score: taxScore.score_gestao || 0, desc: 'Controles e processos internos' },
          { categoria: 'Risco' as const, score: taxScore.score_risco || 0, desc: 'Exposição a autuações e multas' },
        ];

        dimensions.forEach(dim => {
          const nivel = getRiscoNivelFromScore(dim.score);
          if (nivel !== 'baixo') {
            riskItems.push({
              categoria: dim.categoria,
              descricao: dim.desc,
              nivel,
              scoreAtual: dim.score,
            });
          }
        });

        // If all scores are good, show at least one with "baixo"
        if (riskItems.length === 0 && dimensions.length > 0) {
          const lowestDim = dimensions.reduce((min, d) => d.score < min.score ? d : min, dimensions[0]);
          riskItems.push({
            categoria: lowestDim.categoria,
            descricao: lowestDim.desc,
            nivel: getRiscoNivelFromScore(lowestDim.score),
            scoreAtual: lowestDim.score,
          });
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
