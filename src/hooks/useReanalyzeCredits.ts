import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useReanalyzeCredits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const reanalyze = async (importId?: string) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return { success: false, creditsFound: 0 };
    }

    setIsAnalyzing(true);
    setProgress({ current: 0, total: 0 });

    try {
      // Determine which import to analyze
      let targetImportId = importId;

      if (!targetImportId) {
        // Use the most recent completed import
        const { data: latestImport, error: latestError } = await supabase
          .from("xml_imports")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "COMPLETED")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (latestError || !latestImport) {
          toast.info("Nenhum XML processado para análise");
          setIsAnalyzing(false);
          return { success: false, creditsFound: 0 };
        }
        targetImportId = latestImport.id;
      }

      setProgress({ current: 0, total: 1 });

      // Call analyze-credits for this specific import
      const response = await supabase.functions.invoke('process-xml-batch', {
        body: { importIds: [targetImportId] }
      });

      let totalCreditsFound = 0;

      if (response.error) {
        console.error('Analysis error:', response.error);
      } else if (response.data?.creditAnalysis) {
        totalCreditsFound = response.data.creditAnalysis.creditsFound || 0;
      }

      setProgress({ current: 1, total: 1 });

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["identified-credits"] });
      await queryClient.invalidateQueries({ queryKey: ["identified-credits-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["xml-credits-summary"] });

      setIsAnalyzing(false);

      if (totalCreditsFound > 0) {
        toast.success(`${totalCreditsFound} créditos identificados!`);
      } else {
        toast.info("Análise concluída. Nenhum crédito adicional identificado.");
      }

      return { success: true, creditsFound: totalCreditsFound };
    } catch (error) {
      console.error('Reanalyze error:', error);
      toast.error("Erro ao analisar créditos");
      setIsAnalyzing(false);
      return { success: false, creditsFound: 0 };
    }
  };

  return {
    reanalyze,
    isAnalyzing,
    progress,
  };
}
