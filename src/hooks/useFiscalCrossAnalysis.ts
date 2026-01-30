import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface FiscalCrossAnalysis {
  id: string;
  periodo_referencia: string;
  ano: number;
  mes: number;
  sped_pis_credito: number | null;
  sped_pis_debito: number | null;
  sped_cofins_credito: number | null;
  sped_cofins_debito: number | null;
  dctf_pis_declarado: number | null;
  dctf_cofins_declarado: number | null;
  divergencia_pis: number | null;
  divergencia_cofins: number | null;
  divergencia_total: number | null;
  nivel_risco: string | null;
  status: string | null;
  created_at: string | null;
}

export function useFiscalCrossAnalysis() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["fiscal-cross-analysis", user?.id],
    queryFn: async (): Promise<FiscalCrossAnalysis[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("fiscal_cross_analysis")
        .select("*")
        .eq("user_id", user.id)
        .order("divergencia_total", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useRunCrossAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cross-analyze-fiscal`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionData.session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao executar análise cruzada");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscal-cross-analysis"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useFiscalGapsSummary() {
  const { data: analysis } = useFiscalCrossAnalysis();

  const summary = {
    totalDivergencia: 0,
    periodosAnalisados: 0,
    periodosComDivergencia: 0,
    divergenciaPis: 0,
    divergenciaCofins: 0,
    riscoCritico: 0,
    riscoAlto: 0,
    riscoMedio: 0,
    riscoBaixo: 0,
    evolucaoMensal: [] as { periodo: string; valor: number; risco: string }[],
  };

  if (!analysis) return summary;

  summary.periodosAnalisados = analysis.length;
  
  for (const item of analysis) {
    const divergencia = item.divergencia_total || 0;
    summary.totalDivergencia += divergencia;
    summary.divergenciaPis += item.divergencia_pis || 0;
    summary.divergenciaCofins += item.divergencia_cofins || 0;
    
    if (divergencia > 0) {
      summary.periodosComDivergencia++;
    }

    switch (item.nivel_risco) {
      case "critico":
        summary.riscoCritico++;
        break;
      case "alto":
        summary.riscoAlto++;
        break;
      case "medio":
        summary.riscoMedio++;
        break;
      default:
        summary.riscoBaixo++;
    }

    summary.evolucaoMensal.push({
      periodo: item.periodo_referencia,
      valor: divergencia,
      risco: item.nivel_risco || "baixo",
    });
  }

  // Sort by period
  summary.evolucaoMensal.sort((a, b) => a.periodo.localeCompare(b.periodo));

  return summary;
}
