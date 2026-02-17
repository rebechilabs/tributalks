import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const BATCH_SIZE = 50; // XMLs per batch call

export function useReanalyzeCredits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const cancelRef = useRef(false);

  const reanalyze = async (batchImportIds?: string[]) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return { success: false, creditsFound: 0 };
    }

    setIsAnalyzing(true);
    setProgress({ current: 0, total: 0 });
    cancelRef.current = false;

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

      // Fetch all xml_analysis records (only lightweight fields first)
      const { data: analyses, error: analysisError } = await supabase
        .from("xml_analysis")
        .select("id, raw_data, import_id")
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

      // Convert to parsed format
      const allParsedXmls = analyses.map((a: any) => {
        const raw = a.raw_data;
        if (!raw) return null;
        return {
          chave_nfe: raw.chave_nfe || raw.chaveNfe || '',
          numero: raw.numero || raw.nfe_number || '',
          data_emissao: raw.data_emissao || raw.dataEmissao || '',
          cnpj_emitente: raw.cnpj_emitente || raw.cnpjEmitente || '',
          nome_emitente: raw.nome_emitente || raw.nomeEmitente || '',
          itens: raw.itens || raw.items || [],
        };
      }).filter(Boolean);

      if (allParsedXmls.length === 0) {
        toast.info("Nenhum XML válido para análise.");
        setIsAnalyzing(false);
        return { success: false, creditsFound: 0 };
      }

      const totalXmls = allParsedXmls.length;
      setProgress({ current: 0, total: totalXmls });

      const referenceImportId = targetImportIds[0];
      let totalCreditsFound = 0;
      let processed = 0;

      // Process in batches
      for (let i = 0; i < totalXmls; i += BATCH_SIZE) {
        if (cancelRef.current) break;

        const batch = allParsedXmls.slice(i, i + BATCH_SIZE);
        const isFirstBatch = i === 0;

        try {
          const response = await supabase.functions.invoke('analyze-credits', {
            body: {
              parsed_xmls: batch,
              xml_import_id: referenceImportId,
              // Only first batch should archive/clean previous credits
              append_mode: !isFirstBatch,
            }
          });

          if (response.error) {
            console.error(`Batch ${i / BATCH_SIZE + 1} error:`, response.error);
          } else {
            totalCreditsFound += response.data?.credits_count || response.data?.creditAnalysis?.creditsFound || 0;
          }
        } catch (err) {
          console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, err);
        }

        processed += batch.length;
        setProgress({ current: processed, total: totalXmls });

        // Small delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < totalXmls) {
          await new Promise(r => setTimeout(r, 100));
        }
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
