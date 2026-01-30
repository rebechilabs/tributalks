import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DctfDeclaracao {
  id: string;
  cnpj: string;
  razao_social: string | null;
  periodo_apuracao: string;
  ano_calendario: number;
  mes_referencia: number | null;
  tipo_declaracao: string | null;
  retificadora: boolean | null;
  arquivo_nome: string | null;
  status: string | null;
  total_debitos_declarados: number | null;
  total_creditos_vinculados: number | null;
  total_pagamentos: number | null;
  gap_identificado: number | null;
  created_at: string | null;
}

export interface DctfDebito {
  id: string;
  dctf_id: string;
  codigo_receita: string;
  descricao_tributo: string | null;
  periodo_apuracao: string | null;
  valor_principal: number | null;
  valor_multa: number | null;
  valor_juros: number | null;
  valor_total: number | null;
  credito_vinculado: number | null;
  pagamento_vinculado: number | null;
  saldo_devedor: number | null;
  status_quitacao: string | null;
  created_at: string | null;
}

export function useDctfFiles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dctf-declaracoes", user?.id],
    queryFn: async (): Promise<DctfDeclaracao[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("dctf_declaracoes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useDctfDebitos(dctfId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dctf-debitos", dctfId],
    queryFn: async (): Promise<DctfDebito[]> => {
      if (!user || !dctfId) return [];

      const { data, error } = await supabase
        .from("dctf_debitos")
        .select("*")
        .eq("dctf_id", dctfId)
        .eq("user_id", user.id)
        .order("valor_total", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!dctfId,
  });
}
