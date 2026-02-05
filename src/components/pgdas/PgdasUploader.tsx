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
  Receipt,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PgdasFile {
  id: string;
  file: File;
  status: "waiting" | "uploading" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
  pgdasId?: string;
  result?: {
    cnpj: string;
    periodo: string;
    receitaBruta: number;
    valorDevido: number;
    aliquotaEfetiva: number;
    anexoSimples: string;
  };
}

// Valida se o arquivo é um PGDAS válido (aceita .pdf ou .txt)
const isValidPgdasFile = (file: File): boolean => {
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || name.endsWith(".txt");
};

export function PgdasUploader() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<PgdasFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

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

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(isValidPgdasFile);
    const invalidCount = droppedFiles.length - validFiles.length;

    if (invalidCount > 0) {
      toast({
        title: `${invalidCount} arquivo(s) ignorado(s)`,
        description: "Apenas arquivos .pdf ou .txt são aceitos",
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      addFiles(validFiles);
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(isValidPgdasFile);
      const invalidCount = selectedFiles.length - validFiles.length;

      if (invalidCount > 0) {
        toast({
          title: `${invalidCount} arquivo(s) ignorado(s)`,
          description: "Apenas arquivos .pdf ou .txt são aceitos",
          variant: "destructive",
        });
      }

      if (validFiles.length > 0) {
        addFiles(validFiles);
      }
    }
  };

  const addFiles = (newFiles: File[]) => {
    console.log("[PgdasUploader] Adicionando arquivos:", newFiles.map(f => f.name));
    
    const fileItems: PgdasFile[] = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: "waiting",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...fileItems]);
    setLastError(null);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearQueue = () => {
    setFiles([]);
    setLastError(null);
  };

  const processFile = async (fileItem: PgdasFile) => {
    if (!user) {
      console.error("[PgdasUploader] Usuário não autenticado");
      setLastError("Usuário não autenticado. Faça login novamente.");
      return;
    }

    console.log("[PgdasUploader] Iniciando processamento:", fileItem.file.name);

    try {
      // 1. Upload para storage
      console.log("[PgdasUploader] Etapa 1: Iniciando upload para storage...");
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, status: "uploading", progress: 20 } : f
        )
      );

      const storagePath = `${user.id}/${Date.now()}_${fileItem.file.name}`;
      console.log("[PgdasUploader] Storage path:", storagePath);

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("pgdas-files")
        .upload(storagePath, fileItem.file);

      if (uploadError) {
        console.error("[PgdasUploader] Erro no upload:", uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log("[PgdasUploader] Upload concluído com sucesso:", uploadData);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, progress: 40 } : f
        )
      );

      // 2. Criar registro no banco
      console.log("[PgdasUploader] Etapa 2: Criando registro no banco...");
      const { data: pgdasRecord, error: insertError } = await supabase
        .from("pgdas_arquivos")
        .insert({
          user_id: user.id,
          arquivo_nome: fileItem.file.name,
          arquivo_storage_path: storagePath,
          status: "processing",
        })
        .select()
        .single();

      if (insertError) {
        console.error("[PgdasUploader] Erro ao criar registro:", insertError);
        throw new Error(`Erro ao criar registro: ${insertError.message}`);
      }

      console.log("[PgdasUploader] Registro criado:", pgdasRecord.id);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, pgdasId: pgdasRecord.id, status: "processing", progress: 60 }
            : f
        )
      );

      // 3. Chamar Edge Function para processar
      console.log("[PgdasUploader] Etapa 3: Chamando edge function process-pgdas...");
      const { data: result, error: fnError } = await supabase.functions.invoke(
        "process-pgdas",
        {
          body: { pgdasId: pgdasRecord.id, storagePath },
        }
      );

      if (fnError) {
        console.error("[PgdasUploader] Erro na edge function:", fnError);
        throw new Error(`Erro no processamento: ${fnError.message}`);
      }

      console.log("[PgdasUploader] Edge function retornou:", result);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: "completed",
                progress: 100,
                result: {
                  cnpj: result.cnpj || "N/A",
                  periodo: result.periodo || "N/A",
                  receitaBruta: result.receitaBruta || 0,
                  valorDevido: result.valorDevido || 0,
                  aliquotaEfetiva: result.aliquotaEfetiva || 0,
                  anexoSimples: result.anexoSimples || "N/A",
                },
              }
            : f
        )
      );

      toast({
        title: "PGDAS processado com sucesso",
        description: `Período: ${result.periodo || "N/A"} • Valor devido: ${formatCurrency(result.valorDevido || 0)}`,
      });

      console.log("[PgdasUploader] Processamento concluído com sucesso!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[PgdasUploader] Erro no processamento:", errorMessage);
      
      setLastError(errorMessage);
      
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, status: "error", error: errorMessage }
            : f
        )
      );

      toast({
        title: "Erro no processamento",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const processAll = async () => {
    console.log("[PgdasUploader] Iniciando processamento de todos os arquivos...");
    setIsProcessing(true);
    setLastError(null);

    const waitingFiles = files.filter((f) => f.status === "waiting");
    console.log("[PgdasUploader] Arquivos aguardando:", waitingFiles.length);

    for (const file of waitingFiles) {
      await processFile(file);
    }

    setIsProcessing(false);
    console.log("[PgdasUploader] Processamento finalizado");
  };

  const retryFailed = async () => {
    // Reset status to waiting
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "error" ? { ...f, status: "waiting", error: undefined, progress: 0 } : f
      )
    );

    // Then process all
    setTimeout(() => processAll(), 100);
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

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

  const waitingCount = files.filter((f) => f.status === "waiting").length;
  const completedCount = files.filter((f) => f.status === "completed").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const totalValorDevido = files
    .filter((f) => f.result)
    .reduce((acc, f) => acc + (f.result?.valorDevido || 0), 0);

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {lastError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Último erro:</strong> {lastError}
            <br />
            <span className="text-xs">Verifique o console do navegador (F12) para mais detalhes.</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            PGDAS-D (Simples Nacional)
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
            onClick={() => document.getElementById("pgdas-file-input")?.click()}
          >
            <input
              id="pgdas-file-input"
              type="file"
              multiple
              accept=".pdf,.txt"
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
                  Arraste arquivos PGDAS-D aqui
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Arquivos .pdf ou .txt do Simples Nacional • <strong>Suporta múltiplos arquivos</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Clique ou arraste para selecionar
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
                <CardTitle className="text-lg">Arquivos PGDAS</CardTitle>
                <Badge variant="outline">{files.length} arquivo(s)</Badge>
                {totalValorDevido > 0 && (
                  <Badge variant="default" className="bg-blue-600">
                    {formatCurrency(totalValorDevido)} total devido
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {errorCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryFailed}
                    disabled={isProcessing}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Retry ({errorCount})
                  </Button>
                )}
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
                  className={`p-4 rounded-lg transition-colors ${
                    fileItem.status === "error" 
                      ? "bg-destructive/10 border border-destructive/30" 
                      : "bg-muted/50 hover:bg-muted"
                  }`}
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
                          <div className="mt-2 p-2 rounded bg-blue-500/10 border border-blue-500/20">
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                              {fileItem.result.cnpj} • {fileItem.result.periodo}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Anexo {fileItem.result.anexoSimples} • 
                              Alíquota: {formatPercent(fileItem.result.aliquotaEfetiva)}
                            </p>
                            <div className="flex gap-4 mt-1">
                              <p className="text-sm">
                                Receita: <span className="font-medium">{formatCurrency(fileItem.result.receitaBruta)}</span>
                              </p>
                              <p className="text-sm font-bold text-blue-600">
                                Devido: {formatCurrency(fileItem.result.valorDevido)}
                              </p>
                            </div>
                          </div>
                        )}

                        {fileItem.error && (
                          <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
                            <p className="text-sm text-destructive font-medium">
                              Erro: {fileItem.error}
                            </p>
                          </div>
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

                      {(fileItem.status === "waiting" || fileItem.status === "error") && (
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo do Processamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Processados</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Erros</p>
                <p className="text-2xl font-bold text-destructive">{errorCount}</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10">
                <p className="text-sm text-muted-foreground">Total Devido</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalValorDevido)}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">
                  {((completedCount / (completedCount + errorCount)) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
