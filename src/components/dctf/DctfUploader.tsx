import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDctfFiles, useDctfDebitos } from "@/hooks/useDctfFiles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ChevronDown, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { toast } from "sonner";

export function DctfUploader() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: dctfFiles, isLoading } = useDctfFiles();
  const [selectedDctf, setSelectedDctf] = useState<string | null>(null);
  const { data: debitos } = useDctfDebitos(selectedDctf);
  const [uploadProgress, setUploadProgress] = useState(0);

  const processMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Usuário não autenticado");

      setUploadProgress(30);

      const formData = new FormData();
      formData.append("file", file);

      const { data: sessionData } = await supabase.auth.getSession();
      
      setUploadProgress(60);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-dctf`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionData.session?.access_token}`,
          },
          body: formData,
        }
      );

      setUploadProgress(90);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao processar DCTF");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUploadProgress(100);
      queryClient.invalidateQueries({ queryKey: ["dctf-declaracoes"] });
      queryClient.invalidateQueries({ queryKey: ["identified-credits"] });
      
      const gapValue = data.summary?.gapIdentificado || 0;
      if (gapValue > 0) {
        toast.success(
          `DCTF processada! Gap de R$ ${gapValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} identificado.`
        );
      } else {
        toast.success("DCTF processada com sucesso!");
      }
      
      setTimeout(() => setUploadProgress(0), 1000);
    },
    onError: (error: Error) => {
      setUploadProgress(0);
      toast.error(`Erro: ${error.message}`);
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Processa todos os arquivos em lote
      for (const file of acceptedFiles) {
        processMutation.mutate(file);
      }
    },
    [processMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/xml": [".xml"],
    },
    maxFiles: 50, // Permite até 50 arquivos de uma vez
    multiple: true, // Habilita seleção múltipla
    disabled: processMutation.isPending,
  });

  const formatCurrency = (value: number | null) => {
    if (value === null) return "R$ 0,00";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Totais
  const totalGap = dctfFiles?.reduce((acc, d) => acc + (d.gap_identificado || 0), 0) || 0;
  const totalDebitos = dctfFiles?.reduce((acc, d) => acc + (d.total_debitos_declarados || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Upload de DCTF
          </CardTitle>
          <CardDescription>
            Faça upload de arquivos DCTF (.txt) para identificar gaps entre débitos declarados e pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            } ${processMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} />
            {processMutation.isPending ? (
              <div className="space-y-4">
                <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Processando DCTF...</p>
                <Progress value={uploadProgress} className="max-w-xs mx-auto" />
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? "Solte os arquivos aqui..."
                    : "Arraste arquivos DCTF ou clique para selecionar"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Formatos aceitos: .txt (layout RFB) • <strong>Suporta múltiplos arquivos</strong>
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {dctfFiles && dctfFiles.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">DCTFs Processadas</p>
                  <p className="text-2xl font-bold">{dctfFiles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-500/10">
                  <DollarSign className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Débitos</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalDebitos)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-500/10">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gap Total</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalGap)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>DCTFs Processadas</CardTitle>
          <CardDescription>
            Histórico de declarações processadas com gaps identificados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : dctfFiles && dctfFiles.length > 0 ? (
            <div className="space-y-3">
              {dctfFiles.map((dctf) => (
                <Collapsible key={dctf.id}>
                  <Card className="border">
                    <CollapsibleTrigger asChild>
                      <CardContent 
                        className="py-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedDctf(selectedDctf === dctf.id ? null : dctf.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{dctf.arquivo_nome || "DCTF"}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>CNPJ: {dctf.cnpj || "N/A"}</span>
                                <span>•</span>
                                <span>Período: {dctf.periodo_apuracao}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Débitos</p>
                              <p className="font-medium">{formatCurrency(dctf.total_debitos_declarados)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Gap</p>
                              <p className={`font-medium ${(dctf.gap_identificado || 0) > 0 ? "text-red-600" : "text-green-600"}`}>
                                {formatCurrency(dctf.gap_identificado)}
                              </p>
                            </div>
                            <Badge variant={dctf.status === "processado" ? "default" : "secondary"}>
                              {dctf.retificadora ? "Retificadora" : "Original"}
                            </Badge>
                            <ChevronDown className={`h-4 w-4 transition-transform ${selectedDctf === dctf.id ? "rotate-180" : ""}`} />
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      {selectedDctf === dctf.id && debitos && debitos.length > 0 && (
                        <div className="border-t px-4 py-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Tributo</TableHead>
                                <TableHead className="text-right">Principal</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Saldo Devedor</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {debitos.map((debito) => (
                                <TableRow key={debito.id}>
                                  <TableCell className="font-mono">{debito.codigo_receita}</TableCell>
                                  <TableCell>{debito.descricao_tributo}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(debito.valor_principal)}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(debito.valor_total)}</TableCell>
                                  <TableCell className={`text-right ${(debito.saldo_devedor || 0) > 0 ? "text-red-600 font-medium" : ""}`}>
                                    {formatCurrency(debito.saldo_devedor)}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={debito.status_quitacao === "quitado" ? "default" : "destructive"}>
                                      {debito.status_quitacao === "quitado" ? (
                                        <><CheckCircle className="h-3 w-3 mr-1" /> Quitado</>
                                      ) : (
                                        <><AlertCircle className="h-3 w-3 mr-1" /> Pendente</>
                                      )}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                      {selectedDctf === dctf.id && (!debitos || debitos.length === 0) && (
                        <div className="border-t px-4 py-8 text-center text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Nenhum débito encontrado nesta declaração</p>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma DCTF processada ainda</p>
              <p className="text-sm">Faça upload de um arquivo para começar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
