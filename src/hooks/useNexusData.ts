import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Types
export interface NexusKpiData {
  fluxoCaixa: {
    valor: number;
    variacao: number | null;
    status: 'success' | 'warning' | 'danger';
  };
  receitaMensal: {
    valor: number;
    variacaoPercent: number | null;
    status: 'success' | 'warning' | 'danger';
  };
  margemContribuicao: {
    valor: number;
    status: 'success' | 'warning' | 'danger';
  };
  margemLiquida: {
    valor: number;
    projecao2027: number | null;
    status: 'success' | 'warning' | 'danger';
  };
  impactoTributarioCaixa: {
    valor: number;
    dataVencimento: Date;
    status: 'success' | 'warning' | 'danger';
  };
  impactoTributarioMargem: {
    valorPp: number;
    percentualReceita: number;
    status: 'success' | 'warning' | 'danger';
  };
  creditosDisponiveis: {
    valor: number;
    percentualAproveitado: number;
    status: 'success' | 'warning' | 'danger';
  };
  riscoFiscal: {
    score: number;
    nivel: string;
    status: 'success' | 'warning' | 'danger';
  };
}

export interface NexusInsight {
  id: string;
  type: 'opportunity' | 'alert' | 'critical';
  icon: string;
  message: string;
  action: {
    label: string;
    href: string;
  };
  priority: number;
}

interface UseNexusDataReturn {
  kpiData: NexusKpiData | null;
  insights: NexusInsight[];
  loading: boolean;
  lastUpdate: Date | null;
  refresh: () => Promise<void>;
  hasData: {
    dre: boolean;
    score: boolean;
    credits: boolean;
  };
}

// Status calculation helpers
function getFluxoCaixaStatus(valor: number): 'success' | 'warning' | 'danger' {
  if (valor > 300000) return 'success';
  if (valor >= 100000) return 'warning';
  return 'danger';
}

function getReceitaStatus(variacaoPercent: number | null): 'success' | 'warning' | 'danger' {
  if (variacaoPercent === null) return 'warning';
  if (variacaoPercent > 5) return 'success';
  if (variacaoPercent >= 0) return 'warning';
  return 'danger';
}

function getMargemContribuicaoStatus(valor: number): 'success' | 'warning' | 'danger' {
  if (valor > 40) return 'success';
  if (valor >= 25) return 'warning';
  return 'danger';
}

function getMargemLiquidaStatus(valor: number): 'success' | 'warning' | 'danger' {
  if (valor > 15) return 'success';
  if (valor >= 5) return 'warning';
  return 'danger';
}

function getImpactoCaixaStatus(impostos: number, caixa: number): 'success' | 'warning' | 'danger' {
  if (caixa > impostos * 1.5) return 'success';
  if (caixa > impostos * 1.1) return 'warning';
  return 'danger';
}

function getImpactoMargemStatus(valorPp: number): 'success' | 'warning' | 'danger' {
  if (valorPp < 20) return 'success';
  if (valorPp <= 30) return 'warning';
  return 'danger';
}

function getCreditosStatus(valor: number): 'success' | 'warning' | 'danger' {
  if (valor < 10000) return 'success';
  if (valor <= 50000) return 'warning';
  return 'danger';
}

function getScoreStatus(score: number): 'success' | 'warning' | 'danger' {
  if (score > 700) return 'success';
  if (score >= 500) return 'warning';
  return 'danger';
}

function getScoreNivel(score: number): string {
  if (score >= 900) return 'A+';
  if (score >= 800) return 'A';
  if (score >= 650) return 'B';
  if (score >= 500) return 'C';
  if (score >= 350) return 'D';
  return 'E';
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function useNexusData(): UseNexusDataReturn {
  const { user } = useAuth();
  const [kpiData, setKpiData] = useState<NexusKpiData | null>(null);
  const [insights, setInsights] = useState<NexusInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [hasData, setHasData] = useState({ dre: false, score: false, credits: false });

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch all data in parallel
      const [dreResult, dreAnteriorResult, taxScoreResult, creditSummaryResult, identifiedCreditsResult] = await Promise.all([
        supabase
          .from('company_dre')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('company_dre')
          .select('calc_receita_bruta, calc_ebitda')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(1, 1)
          .maybeSingle(),
        supabase
          .from('tax_score')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('credit_analysis_summary')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('identified_credits')
          .select('potential_recovery, status')
          .eq('user_id', user.id),
      ]);

      const dre = dreResult.data;
      const dreAnterior = dreAnteriorResult.data;
      const taxScore = taxScoreResult.data;
      const creditSummary = creditSummaryResult.data;
      const identifiedCredits = identifiedCreditsResult.data || [];

      // Calculate credits total
      let creditosTotal = 0;
      let creditosAproveitados = 0;
      
      if (creditSummary?.total_potential) {
        creditosTotal = Number(creditSummary.total_potential);
      } else if (identifiedCredits.length > 0) {
        creditosTotal = identifiedCredits.reduce((sum, c) => sum + Number(c.potential_recovery || 0), 0);
      }
      
      const creditsAproveitados = identifiedCredits.filter(c => c.status === 'validated' || c.status === 'recovered');
      if (identifiedCredits.length > 0) {
        creditosAproveitados = Math.round((creditsAproveitados.length / identifiedCredits.length) * 100);
      }

      // Data availability flags
      const hasDreData = !!dre && dre.calc_receita_bruta && Number(dre.calc_receita_bruta) > 0;
      const hasScoreData = !!taxScore && taxScore.score_total !== null;
      const hasCreditsData = creditosTotal > 0;

      setHasData({ dre: hasDreData, score: hasScoreData, credits: hasCreditsData });

      // Calculate KPIs
      const receitaBruta = Number(dre?.calc_receita_bruta || 0);
      const receitaAnterior = Number(dreAnterior?.calc_receita_bruta || 0);
      const ebitda = Number(dre?.calc_ebitda || 0);
      const ebitdaAnterior = Number(dreAnterior?.calc_ebitda || 0);
      const margemBruta = Number(dre?.calc_margem_bruta || 0);
      const margemLiquida = Number(dre?.calc_margem_liquida || 0);
      const impostosVendas = Number(dre?.input_impostos_sobre_vendas || 0);
      const reformaImpacto = Number(dre?.reforma_impacto_percentual || 0);
      const scoreTotal = taxScore?.score_total || 0;

      // Fluxo de Caixa = EBITDA + Créditos recuperáveis
      const fluxoCaixa = ebitda + creditosTotal;
      const fluxoCaixaAnterior = ebitdaAnterior > 0 ? ebitdaAnterior + creditosTotal : null;
      const variacaoFluxo = fluxoCaixaAnterior ? fluxoCaixa - fluxoCaixaAnterior : null;

      // Receita variation
      const variacaoReceita = receitaAnterior > 0 
        ? ((receitaBruta - receitaAnterior) / receitaAnterior) * 100 
        : null;

      // Impacto tributário na margem (pp)
      const impactoMargemPp = receitaBruta > 0 ? (impostosVendas / receitaBruta) * 100 : 0;

      // Margem líquida projetada 2027
      const margemProjetada2027 = reformaImpacto !== 0 ? margemLiquida - Math.abs(reformaImpacto) : null;

      // Data de vencimento aproximada (dia 15 do próximo mês)
      const hoje = new Date();
      const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 15);

      const kpis: NexusKpiData = {
        fluxoCaixa: {
          valor: fluxoCaixa,
          variacao: variacaoFluxo,
          status: getFluxoCaixaStatus(fluxoCaixa),
        },
        receitaMensal: {
          valor: receitaBruta,
          variacaoPercent: variacaoReceita,
          status: getReceitaStatus(variacaoReceita),
        },
        margemContribuicao: {
          valor: margemBruta,
          status: getMargemContribuicaoStatus(margemBruta),
        },
        margemLiquida: {
          valor: margemLiquida,
          projecao2027: margemProjetada2027,
          status: getMargemLiquidaStatus(margemLiquida),
        },
        impactoTributarioCaixa: {
          valor: impostosVendas,
          dataVencimento: proximoMes,
          status: getImpactoCaixaStatus(impostosVendas, fluxoCaixa),
        },
        impactoTributarioMargem: {
          valorPp: impactoMargemPp,
          percentualReceita: impactoMargemPp,
          status: getImpactoMargemStatus(impactoMargemPp),
        },
        creditosDisponiveis: {
          valor: creditosTotal,
          percentualAproveitado: creditosAproveitados,
          status: getCreditosStatus(creditosTotal),
        },
        riscoFiscal: {
          score: scoreTotal,
          nivel: getScoreNivel(scoreTotal),
          status: getScoreStatus(scoreTotal),
        },
      };

      setKpiData(kpis);

      // Generate insights
      const generatedInsights: NexusInsight[] = [];

      // Insight 1: Oportunidade de Crédito
      if (creditosTotal > 30000 && fluxoCaixa < impostosVendas * 1.2) {
        generatedInsights.push({
          id: 'credit-opportunity',
          type: 'opportunity',
          icon: '💡',
          message: `Seu caixa está em ${formatCurrency(fluxoCaixa)}, mas você tem ${formatCurrency(creditosTotal)} em créditos disponíveis. Recuperando esses créditos, seu caixa sobe para ${formatCurrency(fluxoCaixa + creditosTotal)}.`,
          action: { label: 'Ver Créditos no Radar', href: '/dashboard/analise-notas' },
          priority: 2,
        });
      }

      // Insight 2: Alerta de Margem 2027
      if (margemProjetada2027 !== null && margemProjetada2027 < margemLiquida - 2) {
        generatedInsights.push({
          id: 'margin-2027-alert',
          type: 'alert',
          icon: '⚠️',
          message: `Sua margem líquida hoje é ${margemLiquida.toFixed(1)}%, mas vai cair para ${margemProjetada2027.toFixed(1)}% em 2027 com a Reforma (impacto de ${(margemLiquida - margemProjetada2027).toFixed(1)}pp).`,
          action: { label: 'Simular Cenários', href: '/calculadora/comparativo-regimes' },
          priority: 1,
        });
      }

      // Insight 3: Risco de Caixa
      if (impostosVendas > fluxoCaixa * 0.9) {
        const diasVencimento = Math.ceil((proximoMes.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        generatedInsights.push({
          id: 'cash-risk',
          type: 'critical',
          icon: '🔴',
          message: `Você tem ${formatCurrency(impostosVendas)} de impostos vencendo em ${diasVencimento} dias, mas seu caixa projetado é apenas ${formatCurrency(fluxoCaixa)}. Reserva insuficiente.`,
          action: { label: 'Ver Projeção', href: '/dashboard/dre-resultados' },
          priority: 0,
        });
      }

      // Insight 4: Score Baixo
      if (scoreTotal > 0 && scoreTotal < 600) {
        const nivel = getScoreNivel(scoreTotal);
        generatedInsights.push({
          id: 'low-score',
          type: 'alert',
          icon: '⚠️',
          message: `Seu Score Tributário está em ${scoreTotal} (Nível ${nivel}). Isso pode dificultar financiamentos e aumentar risco de autuação.`,
          action: { label: 'Melhorar Score', href: '/dashboard/score-tributario' },
          priority: 1,
        });
      }

      // Sort by priority and limit to 3
      generatedInsights.sort((a, b) => a.priority - b.priority);
      setInsights(generatedInsights.slice(0, 3));

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching NEXUS data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    kpiData,
    insights,
    loading,
    lastUpdate,
    refresh: fetchData,
    hasData,
  };
}
