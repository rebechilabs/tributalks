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

  const reanalyze = async (batchImportIds?: string[]) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return { success: false, creditsFound: 0 };
    }

    setIsAnalyzing(true);
    setProgress({ current: 0, total: 0 });

    try {
      let targetImportIds = batchImportIds || [];

      // If no import IDs provided, use the most recent batch
      if (targetImportIds.length === 0) {
        const { data: latestImport } = await supabase
          .from("xml_imports")
          .select("id, batch_id")
          .eq("user_id", user.id)
          .eq("status", "COMPLETED")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!latestImport) {
          toast.info("Nenhum XML processado para análise");
          setIsAnalyzing(false);
          return { success: false, creditsFound: 0 };
        }

        // Get all imports in the same batch
        if (latestImport.batch_id) {
          const { data: batchImports } = await supabase
            .from("xml_imports")
            .select("id")
            .eq("batch_id", latestImport.batch_id)
            .eq("status", "COMPLETED");
          targetImportIds = (batchImports || []).map(i => i.id);
        } else {
          targetImportIds = [latestImport.id];
        }
      }

      setProgress({ current: 0, total: 1 });

      // Fetch already-parsed XML data from xml_analysis
      const { data: analyses, error: analysisError } = await supabase
        .from("xml_analysis")
        .select("raw_data, import_id")
        .in("import_id", targetImportIds);

      if (analysisError) {
        console.error("Error fetching xml_analysis:", analysisError);
        toast.error("Erro ao buscar dados dos XMLs");
        setIsAnalyzing(false);
        return { success: false, creditsFound: 0 };
      }

      if (!analyses || analyses.length === 0) {
        toast.info("Nenhum dado XML encontrado para análise. Reprocesse os XMLs primeiro.");
        setIsAnalyzing(false);
        return { success: false, creditsFound: 0 };
      }

      // Convert raw_data to parsed_xmls format expected by analyze-credits
      const parsedXmls = analyses.map((a: any) => {
        const raw = a.raw_data;
        if (!raw) return null;
        // raw_data from xml_analysis already has the NFe structure
        return {
          chave_nfe: raw.chave_nfe || raw.chaveNfe || '',
          numero: raw.numero || raw.nfe_number || '',
          data_emissao: raw.data_emissao || raw.dataEmissao || '',
          cnpj_emitente: raw.cnpj_emitente || raw.cnpjEmitente || '',
          nome_emitente: raw.nome_emitente || raw.nomeEmitente || '',
          itens: raw.itens || raw.items || [],
        };
      }).filter(Boolean);

      if (parsedXmls.length === 0) {
        toast.info("Nenhum XML válido para análise.");
        setIsAnalyzing(false);
        return { success: false, creditsFound: 0 };
      }

      // Use first import ID as the reference for this batch
      const referenceImportId = targetImportIds[0];

      // Call analyze-credits directly with the parsed data
      const response = await supabase.functions.invoke('analyze-credits', {
        body: {
          parsed_xmls: parsedXmls,
          xml_import_id: referenceImportId,
        }
      });

      let totalCreditsFound = 0;

      if (response.error) {
        console.error('Analysis error:', response.error);
        toast.error("Erro na análise de créditos");
      } else {
        totalCreditsFound = response.data?.credits_count || response.data?.creditAnalysis?.creditsFound || 0;
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
