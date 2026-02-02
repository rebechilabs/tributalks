import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Trash2,
  Play,
  FileSpreadsheet,
} from "lucide-react";

interface SpedFile {
  id: string;
  file: File;
  status: "waiting" | "uploading" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
  spedId?: string;
  result?: {
    cnpj: string;
    periodo: string;
    creditosPIS: number;
    creditosCOFINS: number;
    potencialRecuperacao: number;
  };
}

export function SpedUploader() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<SpedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.name.endsWith(".txt") || file.name.toLowerCase().includes("sped")
    );

    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const fileItems: SpedFile[] = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: "waiting",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...fileItems]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearQueue = () => {
    setFiles([]);
  };

  const processFile = async (fileItem: SpedFile) => {
    if (!user) return;

    try {
      // 1. Upload para storage
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, status: "uploading", progress: 20 } : f
        )
      );

      const storagePath = `${user.id}/${Date.now()}_${fileItem.file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("sped-files")
        .upload(storagePath, fileItem.file);

      if (uploadError) throw uploadError;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, progress: 40 } : f
        )
      );

      // 2. Criar registro no banco
      const { data: spedRecord, error: insertError } = await supabase
        .from("sped_contribuicoes")
        .insert({
          user_id: user.id,
          cnpj: "Processando...",
          periodo_inicio: new Date().toISOString().split("T")[0],
          periodo_fim: new Date().toISOString().split("T")[0],
          arquivo_nome: fileItem.file.name,
          arquivo_storage_path: storagePath,
          status: "processando",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, spedId: spedRecord.id, status: "processing", progress: 60 }
            : f
        )
      );

      // 3. Chamar Edge Function para processar
      const { data: result, error: fnError } = await supabase.functions.invoke(
        "process-sped-contribuicoes",
        {
          body: { spedId: spedRecord.id, storagePath },
        }
      );

      if (fnError) throw fnError;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: "completed",
                progress: 100,
                result: {
                  cnpj: result.cnpj,
                  periodo: result.periodo,
                  creditosPIS: result.creditosPIS,
                  creditosCOFINS: result.creditosCOFINS,
                  potencialRecuperacao: result.potencialRecuperacao,
                },
              }
            : f
        )
      );

      toast({
        title: "SPED processado",
        description: `${result.creditosPIS + result.creditosCOFINS} créditos identificados`,
      });
    } catch (error) {
      console.error("Erro ao processar SPED:", error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, status: "error", error: String(error) }
            : f
        )
      );

      toast({
        title: "Erro no processamento",
        description: "Verifique se o arquivo é um SPED Contribuições válido",
        variant: "destructive",
      });
    }
  };

  const processAll = async () => {
    setIsProcessing(true);

    const waitingFiles = files.filter((f) => f.status === "waiting");

    for (const file of waitingFiles) {
      await processFile(file);
    }

    setIsProcessing(false);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const waitingCount = files.filter((f) => f.status === "waiting").length;
  const completedCount = files.filter((f) => f.status === "completed").length;
  const totalPotencial = files
    .filter((f) => f.result)
    .reduce((acc, f) => acc + (f.result?.potencialRecuperacao || 0), 0);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            SPED Contribuições
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
              ${
                isDragging
                  ? "border-primary bg-primary/5 border-solid"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
              }
            `}
            onClick={() => document.getElementById("sped-file-input")?.click()}
          >
            <input
              id="sped-file-input"
              type="file"
              multiple
              accept=".txt"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-3">
              <div
                className={`
                p-3 rounded-full transition-colors
                ${isDragging ? "bg-primary/20" : "bg-muted"}
              `}
              >
                <Upload
                  className={`h-8 w-8 ${
                    isDragging ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>

              <div>
                <p className="font-medium">
                  Arraste arquivos SPED Contribuições aqui
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Arquivos .txt no layout EFD-Contribuições (PIS/COFINS) • <strong>Suporta múltiplos arquivos</strong>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Queue */}
      {files.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">Arquivos SPED</CardTitle>
                <Badge variant="outline">{files.length} arquivo(s)</Badge>
                {totalPotencial > 0 && (
                  <Badge variant="default" className="bg-green-600">
                    {formatCurrency(totalPotencial)} potencial
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearQueue}
                  disabled={isProcessing}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar
                </Button>
                <Button
                  size="sm"
                  onClick={processAll}
                  disabled={isProcessing || waitingCount === 0}
                >
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Processar ({waitingCount})
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {fileItem.file.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(fileItem.file.size)}
                        </p>

                        {fileItem.result && (
                          <div className="mt-2 p-2 rounded bg-green-500/10 border border-green-500/20">
                            <p className="text-sm font-medium text-green-700 dark:text-green-400">
                              {fileItem.result.cnpj} • {fileItem.result.periodo}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {fileItem.result.creditosPIS} créditos PIS •{" "}
                              {fileItem.result.creditosCOFINS} créditos COFINS
                            </p>
                            <p className="text-sm font-bold text-green-600 mt-1">
                              Potencial: {formatCurrency(fileItem.result.potencialRecuperacao)}
                            </p>
                          </div>
                        )}

                        {fileItem.error && (
                          <p className="text-sm text-destructive mt-1">
                            {fileItem.error}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {fileItem.status === "waiting" && (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                      {(fileItem.status === "uploading" ||
                        fileItem.status === "processing") && (
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      )}
                      {fileItem.status === "completed" && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {fileItem.status === "error" && (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}

                      {fileItem.status === "waiting" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFile(fileItem.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {completedCount > 0 && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">
                  {completedCount} arquivo(s) processado(s)
                </p>
                <p className="text-sm text-muted-foreground">
                  Créditos adicionados ao Radar de Créditos
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalPotencial)}
                </p>
                <p className="text-xs text-muted-foreground">
                  potencial identificado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
