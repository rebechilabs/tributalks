import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  FileUp,
  BarChart3,
  FlaskConical
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// XMLs de teste do ciclo comercial
import xmlCompra from "../../test-xml/ciclo-comercial/01-compra-mercadoria.xml?raw";
import xmlVendaPJ from "../../test-xml/ciclo-comercial/02-venda-mercadoria.xml?raw";
import xmlVendaPF from "../../test-xml/ciclo-comercial/03-venda-consumidor-final.xml?raw";
import xmlDevolucaoCliente from "../../test-xml/ciclo-comercial/04-devolucao-cliente.xml?raw";
import xmlDevolucaoFornecedor from "../../test-xml/ciclo-comercial/05-devolucao-fornecedor.xml?raw";

interface FileItem {
  id: string;
  file: File;
  status: 'waiting' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  importId?: string;
}

const TEST_XML_FILES = [
  { name: "01-compra-mercadoria.xml", content: xmlCompra },
  { name: "02-venda-mercadoria.xml", content: xmlVendaPJ },
  { name: "03-venda-consumidor-final.xml", content: xmlVendaPF },
  { name: "04-devolucao-cliente.xml", content: xmlDevolucaoCliente },
  { name: "05-devolucao-fornecedor.xml", content: xmlDevolucaoFornecedor },
];

export default function ImportarXML() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingTestFiles, setIsLoadingTestFiles] = useState(false);

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
      file => file.name.endsWith('.xml') || file.name.endsWith('.zip')
    );
    
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        file => file.name.endsWith('.xml') || file.name.endsWith('.zip')
      );
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const fileItems: FileItem[] = newFiles.slice(0, 100 - files.length).map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'waiting',
      progress: 0
    }));
    
    setFiles(prev => [...prev, ...fileItems]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearQueue = () => {
    setFiles([]);
  };

  const loadTestFiles = async () => {
    setIsLoadingTestFiles(true);
    
    try {
      const testFiles: File[] = TEST_XML_FILES.map(({ name, content }) => {
        const blob = new Blob([content], { type: 'application/xml' });
        return new File([blob], name, { type: 'application/xml' });
      });
      
      addFiles(testFiles);
      
      toast({
        title: "XMLs de teste carregados",
        description: `${testFiles.length} arquivos do ciclo comercial adicionados à fila`,
      });
    } catch (error) {
      console.error('Error loading test files:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar os XMLs de teste",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTestFiles(false);
    }
  };

  const uploadAndProcess = async () => {
    if (!user || files.length === 0) return;
    
    setIsProcessing(true);
    const importIds: string[] = [];

    // Upload all files first
    for (const fileItem of files) {
      if (fileItem.status !== 'waiting') continue;

      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'uploading', progress: 10 } : f
        ));

        const date = new Date();
        const path = `${user.id}/${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}/${fileItem.id}_${fileItem.file.name}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('xml-imports')
          .upload(path, fileItem.file);

        if (uploadError) throw uploadError;

        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, progress: 50 } : f
        ));

        // Create import record
        const { data: importRecord, error: importError } = await supabase
          .from('xml_imports')
          .insert({
            user_id: user.id,
            file_name: fileItem.file.name,
            file_size: fileItem.file.size,
            file_path: path,
            status: 'PENDING'
          })
          .select()
          .single();

        if (importError) throw importError;

        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, progress: 70, importId: importRecord.id } : f
        ));

        importIds.push(importRecord.id);

      } catch (error) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'error', error: 'Erro no upload' } : f
        ));
      }
    }

    // Process all uploaded files
    if (importIds.length > 0) {
      setFiles(prev => prev.map(f => 
        f.importId && importIds.includes(f.importId) 
          ? { ...f, status: 'processing', progress: 80 } 
          : f
      ));

      try {
        const { data: session } = await supabase.auth.getSession();
        
        const response = await supabase.functions.invoke('process-xml-batch', {
          body: { importIds }
        });

        if (response.error) throw response.error;

        const result = response.data;

        // Update file statuses based on results
        if (result.results) {
          for (const res of result.results) {
            setFiles(prev => prev.map(f => 
              f.importId === res.importId 
                ? { ...f, status: 'completed', progress: 100 } 
                : f
            ));
          }
        }

        if (result.errorDetails) {
          for (const err of result.errorDetails) {
            setFiles(prev => prev.map(f => 
              f.importId === err.importId 
                ? { ...f, status: 'error', error: err.error } 
                : f
            ));
          }
        }

        toast({
          title: "Processamento concluído",
          description: `${result.processed} arquivo(s) processado(s), ${result.errors} erro(s)`,
        });

      } catch (error) {
        console.error('Processing error:', error);
        toast({
          title: "Erro no processamento",
          description: "Ocorreu um erro ao processar os arquivos",
          variant: "destructive"
        });
      }
    }

    setIsProcessing(false);
  };

  const completedCount = files.filter(f => f.status === 'completed').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const processingCount = files.filter(f => f.status === 'processing' || f.status === 'uploading').length;
  const overallProgress = files.length > 0 
    ? Math.round(files.reduce((acc, f) => acc + f.progress, 0) / files.length) 
    : 0;

  const getStatusIcon = (status: FileItem['status']) => {
    switch (status) {
      case 'waiting': return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'uploading': return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'processing': return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusText = (status: FileItem['status']) => {
    switch (status) {
      case 'waiting': return 'Aguardando';
      case 'uploading': return 'Enviando...';
      case 'processing': return 'Processando...';
      case 'completed': return 'Concluído';
      case 'error': return 'Erro';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Importar XMLs</h1>
            <p className="text-muted-foreground">
              Compare tributos atuais vs reforma tributária
            </p>
          </div>
          {completedCount > 0 && (
            <Button onClick={() => navigate('/dashboard/xml-resultados')}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Ver Resultados ({completedCount})
            </Button>
          )}
        </div>

        {/* Upload Area */}
        <Card>
          <CardContent className="p-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer
                ${isDragging 
                  ? 'border-primary bg-primary/5 border-solid' 
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                }
              `}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                multiple
                accept=".xml,.zip"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="flex flex-col items-center gap-4">
                <div className={`
                  p-4 rounded-full transition-colors
                  ${isDragging ? 'bg-primary/20' : 'bg-muted'}
                `}>
                  <Upload className={`h-10 w-10 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                
                <div>
                  <p className="text-lg font-medium">
                    Arraste seus XMLs aqui ou clique para selecionar
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Suporta NFe, NFSe, CTe • Até 100 arquivos por vez • Aceita .xml e .zip
                  </p>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadTestFiles();
                    }}
                    disabled={isLoadingTestFiles}
                    className="mt-2"
                  >
                    {isLoadingTestFiles ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FlaskConical className="mr-2 h-4 w-4" />
                    )}
                    Carregar XMLs de Teste (5 arquivos)
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Queue */}
        {files.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-lg">Fila de Processamento</CardTitle>
                  <Badge variant="outline">{files.length} arquivo(s)</Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearQueue}
                    disabled={isProcessing}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Fila
                  </Button>
                  <Button 
                    size="sm"
                    onClick={uploadAndProcess}
                    disabled={isProcessing || files.every(f => f.status !== 'waiting')}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    Processar Todos
                  </Button>
                </div>
              </div>
              
              {isProcessing && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progresso geral</span>
                    <span className="font-medium">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {files.map((fileItem) => (
                  <div 
                    key={fileItem.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(fileItem.file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(fileItem.status)}
                        <span className={`text-sm ${fileItem.status === 'error' ? 'text-destructive' : ''}`}>
                          {getStatusText(fileItem.status)}
                        </span>
                      </div>
                      
                      {fileItem.status === 'waiting' && (
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
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        {files.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <FileUp className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{files.length}</p>
                    <p className="text-sm text-muted-foreground">Total de arquivos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{completedCount}</p>
                    <p className="text-sm text-muted-foreground">Processados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <XCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{errorCount}</p>
                    <p className="text-sm text-muted-foreground">Com erro</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}