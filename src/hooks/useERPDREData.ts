import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ERPConnection {
  id: string;
  erp_type: string;
  status: string;
  last_sync_at: string | null;
}

interface ERPDREData {
  vendas_produtos: number;
  vendas_servicos: number;
  custo_mercadorias: number;
  salarios_encargos: number;
  outras_despesas: number;
  source: string;
  synced_at: string;
}

interface UseERPDREDataResult {
  hasERPConnection: boolean;
  erpConnection: ERPConnection | null;
  dreData: ERPDREData | null;
  isLoading: boolean;
  hasSyncedData: boolean;
  refetch: () => void;
}

export function useERPDREData(selectedMonth: number, selectedYear: number): UseERPDREDataResult {
  const { user } = useAuth();

  // Buscar conexões ERP ativas
  const { data: erpConnections, isLoading: loadingConnections } = useQuery({
    queryKey: ['erp-connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('erp_connections')
        .select('id, erp_type, status, last_sync_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('last_sync_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar conexões ERP:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Buscar dados DRE sincronizados do ERP para o período selecionado
  const { data: syncedDRE, isLoading: loadingDRE, refetch } = useQuery({
    queryKey: ['erp-dre-data', user?.id, selectedMonth, selectedYear],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('company_dre')
        .select('*')
        .eq('user_id', user.id)
        .eq('period_type', 'monthly')
        .eq('period_year', selectedYear)
        .eq('period_month', selectedMonth)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao buscar DRE sincronizado:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id && (erpConnections?.length || 0) > 0,
  });

  const activeConnection = erpConnections?.[0] || null;
  
  // Formatar dados do DRE para uso no wizard
  const dreData: ERPDREData | null = syncedDRE ? {
    vendas_produtos: syncedDRE.input_vendas_produtos || 0,
    vendas_servicos: syncedDRE.input_vendas_servicos || 0,
    custo_mercadorias: syncedDRE.input_custo_mercadorias || 0,
    salarios_encargos: syncedDRE.input_salarios_encargos || 0,
    outras_despesas: syncedDRE.input_outras_despesas || 0,
    source: activeConnection?.erp_type || 'erp',
    synced_at: syncedDRE.updated_at || '',
  } : null;

  // Verificar se os dados são significativos (não apenas zeros)
  const hasMeaningfulData = dreData && (
    dreData.vendas_produtos > 0 || 
    dreData.vendas_servicos > 0 || 
    dreData.custo_mercadorias > 0
  );

  return {
    hasERPConnection: (erpConnections?.length || 0) > 0,
    erpConnection: activeConnection,
    dreData: hasMeaningfulData ? dreData : null,
    isLoading: loadingConnections || loadingDRE,
    hasSyncedData: !!hasMeaningfulData,
    refetch,
  };
}
