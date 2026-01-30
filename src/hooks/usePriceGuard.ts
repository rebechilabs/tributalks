import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PriceSimulation {
  id: string;
  sku_code: string | null;
  product_name: string;
  ncm_code: string | null;
  nbs_code: string | null;
  uf: string | null;
  municipio_codigo: number | null;
  municipio_nome: string | null;
  preco_atual: number;
  custo_unitario: number;
  despesa_proporcional: number;
  margem_atual_percent: number;
  aliquota_pis_cofins: number;
  aliquota_icms: number;
  aliquota_iss: number;
  aliquota_ipi: number;
  aliquota_cbs: number;
  aliquota_ibs_uf: number;
  aliquota_ibs_mun: number;
  aliquota_is: number;
  credito_insumo_estimado: number;
  credito_fonte: string | null;
  preco_2026_necessario: number | null;
  variacao_preco_percent: number | null;
  margem_2026_mantida: number | null;
  lucro_unitario_atual: number | null;
  lucro_unitario_2026: number | null;
  preco_concorrente: number | null;
  gap_competitivo_percent: number | null;
  recomendacao: string | null;
  cenario_pessimista: any;
  cenario_otimista: any;
  simulation_batch_id: string | null;
  data_quality: string;
  created_at: string;
  updated_at: string;
}

export function usePriceGuard() {
  const { user } = useAuth();
  const [simulations, setSimulations] = useState<PriceSimulation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSimulations = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('price_simulations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSimulations(data || []);
    } catch (error) {
      console.error('Erro ao buscar simulações:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  const saveSimulation = async (simulationData: Partial<PriceSimulation>) => {
    if (!user?.id) throw new Error('Usuário não autenticado');

    try {
      const insertData = {
        user_id: user.id,
        product_name: simulationData.product_name || 'Produto sem nome',
        sku_code: simulationData.sku_code || null,
        ncm_code: simulationData.ncm_code || null,
        nbs_code: simulationData.nbs_code || null,
        uf: simulationData.uf || 'SP',
        municipio_codigo: simulationData.municipio_codigo || null,
        municipio_nome: simulationData.municipio_nome || null,
        preco_atual: simulationData.preco_atual || 0,
        custo_unitario: simulationData.custo_unitario || 0,
        despesa_proporcional: simulationData.despesa_proporcional || 0,
        margem_atual_percent: simulationData.margem_atual_percent || 0,
        aliquota_pis_cofins: simulationData.aliquota_pis_cofins || 0,
        aliquota_icms: simulationData.aliquota_icms || 0,
        aliquota_iss: simulationData.aliquota_iss || 0,
        aliquota_ipi: simulationData.aliquota_ipi || 0,
        aliquota_cbs: simulationData.aliquota_cbs || 0,
        aliquota_ibs_uf: simulationData.aliquota_ibs_uf || 0,
        aliquota_ibs_mun: simulationData.aliquota_ibs_mun || 0,
        aliquota_is: simulationData.aliquota_is || 0,
        credito_insumo_estimado: simulationData.credito_insumo_estimado || 0,
        credito_fonte: simulationData.credito_fonte || 'manual',
        preco_2026_necessario: simulationData.preco_2026_necessario || null,
        variacao_preco_percent: simulationData.variacao_preco_percent || null,
        preco_concorrente: simulationData.preco_concorrente || null,
        gap_competitivo_percent: simulationData.gap_competitivo_percent || null,
      };

      const { error } = await supabase
        .from('price_simulations')
        .insert(insertData);

      if (error) throw error;
      await fetchSimulations();
    } catch (error) {
      console.error('Erro ao salvar simulação:', error);
      throw error;
    }
  };

  const updateSimulation = async (id: string, updates: Partial<PriceSimulation>) => {
    try {
      const { error } = await supabase
        .from('price_simulations')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchSimulations();
    } catch (error) {
      console.error('Erro ao atualizar simulação:', error);
      throw error;
    }
  };

  const deleteSimulation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('price_simulations')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchSimulations();
    } catch (error) {
      console.error('Erro ao excluir simulação:', error);
      throw error;
    }
  };

  return {
    simulations,
    loading,
    refetch: fetchSimulations,
    saveSimulation,
    updateSimulation,
    deleteSimulation
  };
}
