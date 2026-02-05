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

  const reanalyze = async () => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return { success: false, creditsFound: 0 };
    }

    setIsAnalyzing(true);
    setProgress({ current: 0, total: 0 });

    try {
      // Get all completed XML imports for this user
      const { data: xmlImports, error: xmlError } = await supabase
        .from("xml_imports")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "COMPLETED")
        .order("created_at", { ascending: false })
        .limit(500); // Process in batches

      if (xmlError) throw xmlError;

      if (!xmlImports || xmlImports.length === 0) {
        toast.info("Nenhum XML processado para análise");
        setIsAnalyzing(false);
        return { success: false, creditsFound: 0 };
      }

      const importIds = xmlImports.map(x => x.id);
      setProgress({ current: 0, total: importIds.length });

      // Process in smaller batches to avoid timeouts
      const batchSize = 50;
      let totalCreditsFound = 0;

      for (let i = 0; i < importIds.length; i += batchSize) {
        const batch = importIds.slice(i, i + batchSize);
        
        const response = await supabase.functions.invoke('process-xml-batch', {
          body: { importIds: batch }
        });

        if (response.error) {
          console.error('Batch error:', response.error);
        } else if (response.data?.creditAnalysis) {
          totalCreditsFound += response.data.creditAnalysis.creditsFound || 0;
        }

        setProgress({ current: i + batch.length, total: importIds.length });
      }

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
