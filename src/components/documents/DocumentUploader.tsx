import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AnalysisResult } from "@/pages/AnalisadorDocumentos";

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

  const readFileAsText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  };

  const readFileAsBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          // Remove the data URL prefix to get just the base64
          const base64 = result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsDataURL(file);
    });
  };

  const analyzeDocument = async () => {
    if (!uploadedFile) {
      toast.error("Selecione um arquivo primeiro");
      return;
    }

    setIsAnalyzing(true);
    onAnalysisComplete(null);

    try {
      setExtractionProgress("Preparando documento...");
      
      // Read the PDF as base64 and send to the edge function
      // The edge function will use Gemini's vision capabilities to read the PDF
      const base64Content = await readFileAsBase64(uploadedFile);
      
      setExtractionProgress("Analisando documento com IA...");

      // Call the edge function with the base64 content
      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: {
          documentBase64: base64Content,
          documentType: "Contrato Social",
          fileName: uploadedFile.name,
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
