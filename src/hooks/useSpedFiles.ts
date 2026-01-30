import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface SpedContribuicao {
  id: string;
  cnpj: string;
  razao_social: string | null;
  periodo_inicio: string;
  periodo_fim: string;
  regime_apuracao: string | null;
  total_credito_pis: number;
  total_debito_pis: number;
  total_pis_apurado: number;
  total_credito_cofins: number;
  total_debito_cofins: number;
  total_cofins_apurado: number;
  arquivo_nome: string | null;
  status: string;
  registros_processados: number;
  created_at: string;
}

export function useSpedFiles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sped-contribuicoes", user?.id],
    queryFn: async (): Promise<SpedContribuicao[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("sped_contribuicoes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useSpedItems(spedId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sped-items", spedId],
    queryFn: async () => {
      if (!user || !spedId) return [];

      const { data, error } = await supabase
        .from("sped_contribuicoes_items")
        .select("*")
        .eq("sped_id", spedId)
        .eq("user_id", user.id)
        .order("valor_credito", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!spedId,
  });
}
