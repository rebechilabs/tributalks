import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Supplier {
  id: string;
  cnpj: string;
  razao_social: string | null;
  regime_tributario: string;
  regime_confianca: string;
  total_compras_12m: number;
  qtd_notas_12m: number;
  ncms_frequentes: string[];
  uf: string | null;
  municipio: string | null;
  cnae_principal: string | null;
  aliquota_credito_estimada: number;
  custo_efetivo_score: number;
  classificacao: string;
  ultima_atualizacao: string;
  created_at: string;
}

export function useSupplierAnalysis() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user.id)
        .order('total_compras_12m', { ascending: false });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const analyzeSuppliers = async () => {
    if (!user?.id) return;
    
    setAnalyzing(true);
    try {
      // Call edge function to analyze suppliers from identified_credits
      const { data, error } = await supabase.functions.invoke('analyze-suppliers', {
        body: { userId: user.id }
      });

      if (error) throw error;
      
      // Refresh the list
      await fetchSuppliers();
    } catch (error) {
      console.error('Erro ao analisar fornecedores:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchSuppliers();
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      throw error;
    }
  };

  return {
    suppliers,
    loading,
    analyzing,
    refetch: fetchSuppliers,
    analyzeSuppliers,
    updateSupplier
  };
}
