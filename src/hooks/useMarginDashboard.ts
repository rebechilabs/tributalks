import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface MarginDashboardData {
  // OMC-AI
  totalComprasAnalisado: number;
  gapCreditoTotal: number;
  economiaPotencialRenegociacao: number;
  fornecedoresCriticos: number;
  fornecedoresAnalisados: number;
  
  // PriceGuard
  skusSimulados: number;
  variacaoMediaPreco: number;
  gapCompetitivoMedio: number;
  riscoPerdaMargem: number;
  skusEmRisco: number;
  
  // Consolidado
  impactoEbitdaAnualMin: number;
  impactoEbitdaAnualMax: number;
  scoreProntidao: number;
  temDados: boolean;
}

export function useMarginDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<MarginDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Fetch suppliers data
      const { data: suppliers } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user.id);

      // Fetch price simulations
      const { data: simulations } = await supabase
        .from('price_simulations')
        .select('*')
        .eq('user_id', user.id);

      // Calculate OMC-AI metrics
      const supplierList = suppliers || [];
      const totalCompras = supplierList.reduce((sum, s) => sum + (s.total_compras_12m || 0), 0);
      const fornecedoresCriticos = supplierList.filter(s => s.classificacao === 'substituir').length;
      
      // Gap calculation: difference between max credit (26.5%) and actual credit
      const gapTotal = supplierList.reduce((sum, s) => {
        const creditoMaximo = (s.total_compras_12m || 0) * 0.265;
        const creditoAtual = (s.total_compras_12m || 0) * ((s.aliquota_credito_estimada || 0) / 100);
        return sum + (creditoMaximo - creditoAtual);
      }, 0);

      // Economia potencial: gap de fornecedores com classificação renegociar/substituir
      const economiaPotencial = supplierList
        .filter(s => s.classificacao === 'renegociar' || s.classificacao === 'substituir')
        .reduce((sum, s) => {
          const creditoMaximo = (s.total_compras_12m || 0) * 0.265;
          const creditoAtual = (s.total_compras_12m || 0) * ((s.aliquota_credito_estimada || 0) / 100);
          return sum + (creditoMaximo - creditoAtual);
        }, 0);

      // Calculate PriceGuard metrics
      const simList = simulations || [];
      const skusSimulados = simList.length;
      const variacaoMedia = simList.length > 0
        ? simList.reduce((sum, s) => sum + (s.variacao_preco_percent || 0), 0) / simList.length
        : 0;
      const gapCompetitivoMedio = simList.length > 0
        ? simList.reduce((sum, s) => sum + Math.abs(s.gap_competitivo_percent || 0), 0) / simList.length
        : 0;
      // Gap competitivo acima deste % indica risco de perda de clientes/volume
      // Referência: estudos de elasticidade de preço em mercado B2B brasileiro
      const THRESHOLD_GAP_COMPETITIVO = 5;

      const skusEmRisco = simList.filter(s => 
        (s.gap_competitivo_percent || 0) > THRESHOLD_GAP_COMPETITIVO
      ).length;
      
      // Risco de perda: estimativa baseada no gap competitivo × volume
      const riscoPerdaMargem = simList
        .filter(s => (s.gap_competitivo_percent || 0) > THRESHOLD_GAP_COMPETITIVO)
        .reduce((sum, s) => {
          const precoAtual = s.preco_atual || 0;
          const volumeMensal = s.volume_mensal || 1; // unidades/mês
          const gap = (s.gap_competitivo_percent || 0) / 100;
          return sum + (precoAtual * volumeMensal * gap * 12); // Anualizado com volume
        }, 0);

      // Calculate consolidated impact
      // Pessimista: gap de crédito atual + risco de perda de vendas (abs garante sinal correto)
      const impactoMin = -(Math.abs(gapTotal) + Math.abs(riscoPerdaMargem));
      // Taxa de captura: estimativa conservadora de que 70% da economia potencial
      // identificada é efetivamente realizada após renegociações e troca de fornecedores
      const TAXA_CAPTURA_ECONOMIA = 0.7;
      const impactoMax = economiaPotencial * TAXA_CAPTURA_ECONOMIA;

      // Score de prontidão
      const hasSuppliers = supplierList.length > 0;
      const hasSimulations = simList.length > 0;
      const hasLowRiskSuppliers = supplierList.filter(s => s.classificacao === 'manter').length / Math.max(supplierList.length, 1) > 0.5;
      const hasLowRiskProducts = skusEmRisco / Math.max(skusSimulados, 1) < 0.3;
      
      let score = 20; // Base
      if (hasSuppliers) score += 20;
      if (hasSimulations) score += 20;
      if (hasLowRiskSuppliers) score += 20;
      if (hasLowRiskProducts) score += 20;

      setData({
        totalComprasAnalisado: totalCompras,
        gapCreditoTotal: gapTotal,
        economiaPotencialRenegociacao: economiaPotencial,
        fornecedoresCriticos,
        fornecedoresAnalisados: supplierList.length,
        skusSimulados,
        variacaoMediaPreco: variacaoMedia,
        gapCompetitivoMedio,
        riscoPerdaMargem,
        skusEmRisco,
        impactoEbitdaAnualMin: impactoMin,
        impactoEbitdaAnualMax: impactoMax,
        scoreProntidao: Math.min(score, 100),
        temDados: supplierList.length > 0 || simList.length > 0,
      });

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    refetch: fetchDashboardData
  };
}
