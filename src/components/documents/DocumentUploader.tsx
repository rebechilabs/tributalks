import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AnalysisResult } from "@/pages/AnalisadorDocumentos";

// Dynamic import to avoid top-level await issues
let pdfjsLib: typeof import("pdfjs-dist") | null = null;

const loadPdfJs = async () => {
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  return pdfjsLib;
};

interface DocumentUploaderProps {
  onAnalysisComplete: (result: AnalysisResult | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;
}

export function DocumentUploader({
  onAnalysisComplete,
  isAnalyzing,
  setIsAnalyzing,
}: DocumentUploaderProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractionProgress, setExtractionProgress] = useState("");

  const extractTextFromPdf = async (file: File): Promise<string> => {
    setExtractionProgress("Carregando biblioteca PDF...");
    const pdfjs = await loadPdfJs();
    
    setExtractionProgress("Lendo arquivo PDF...");
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    const totalPages = pdf.numPages;
    
    for (let i = 1; i <= Math.min(totalPages, 20); i++) {
      setExtractionProgress(`Extraindo página ${i} de ${Math.min(totalPages, 20)}...`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n\n";
    }
    
    return fullText;
  };

  const analyzeDocument = async () => {
    if (!uploadedFile) {
      toast.error("Selecione um arquivo primeiro");
      return;
    }

    setIsAnalyzing(true);
    onAnalysisComplete(null);

    try {
      // Extract text from PDF
      const documentText = await extractTextFromPdf(uploadedFile);
      
      if (documentText.trim().length < 100) {
        throw new Error("O documento parece estar vazio ou ser uma imagem escaneada. Use um PDF com texto selecionável.");
      }

      setExtractionProgress("Analisando documento com IA...");

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: {
          documentText,
          documentType: "Contrato Social",
        },
      });

      if (error) {
        throw new Error(error.message || "Erro ao analisar documento");
      }

      if (!data.success) {
        throw new Error(data.error || "Análise falhou");
      }

      onAnalysisComplete({
        extractedData: data.extractedData,
        matchedOpportunities: data.matchedOpportunities,
        totalMatches: data.totalMatches,
      });

      toast.success("Documento analisado com sucesso!");
    } catch (error) {
      console.error("Error analyzing document:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao analisar documento"
      );
    } finally {
      setIsAnalyzing(false);
      setExtractionProgress("");
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Apenas arquivos PDF são suportados");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo: 10MB");
        return;
      }
      setUploadedFile(file);
      onAnalysisComplete(null);
    }
  }, [onAnalysisComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: isAnalyzing,
  });

  const clearFile = () => {
    setUploadedFile(null);
    onAnalysisComplete(null);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="font-semibold text-foreground mb-4">Upload do Documento</h2>

      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-1">
            {isDragActive ? "Solte o arquivo aqui" : "Arraste um PDF ou clique para selecionar"}
          </p>
          <p className="text-sm text-muted-foreground">
            Contrato Social em PDF • Máximo 10MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
            <FileText className="w-10 h-10 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {uploadedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {!isAnalyzing && (
              <Button variant="ghost" size="icon" onClick={clearFile}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {extractionProgress && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {extractionProgress}
            </div>
          )}

          <Button
            className="w-full"
            onClick={analyzeDocument}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Analisar Documento
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
