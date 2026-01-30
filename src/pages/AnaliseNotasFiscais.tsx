import { useState, useCallback, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  FlaskConical,
  FolderArchive,
  Target,
  TrendingDown,
  FileStack,
  FileSpreadsheet
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ImportProgressBar, 
  ImportFilesByYear, 
  ImportSummaryCard,
  ImportErrorsList,
  type ProcessingPhase,
  type ImportSummaryData,
  type ImportErrorItem
} from "@/components/xml";
import { CreditRadar } from "@/components/credits/CreditRadar";
import { ExposureProjection } from "@/components/credits/ExposureProjection";
import { SavingsSummaryCard } from "@/components/credits/SavingsSummaryCard";
import { SpedUploader } from "@/components/sped";
import { DctfUploader } from "@/components/dctf";
import { FiscalGapsDashboard } from "@/components/fiscal";
import { GitCompare } from "lucide-react";
import xmlCompra from "../../test-xml/ciclo-comercial/01-compra-mercadoria.xml?raw";
import xmlVendaPJ from "../../test-xml/ciclo-comercial/02-venda-mercadoria.xml?raw";
import xmlVendaPF from "../../test-xml/ciclo-comercial/03-venda-consumidor-final.xml?raw";
import xmlDevolucaoCliente from "../../test-xml/ciclo-comercial/04-devolucao-cliente.xml?raw";
import xmlDevolucaoFornecedor from "../../test-xml/ciclo-comercial/05-devolucao-fornecedor.xml?raw";

// Processing configuration
const CHUNK_SIZE = 20;
const PARALLEL_CHUNKS = 5;
const MAX_FILES = 1000;

interface FileItem {
  id: string;
  file: File;
  status: 'waiting' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  importId?: string;
  year?: number;
}

interface ProcessingResult {
  importId: string;
  analysisId?: string;
  documentNumber: string;
  documentType: string;
  currentTaxTotal: number;
  reformTaxTotal: number;
  differenceValue: number;
  differencePercent: number;
  isBeneficial: boolean;
  itemsCount: number;
  issuerName?: string;
  issuerCnpj?: string;
  documentTotal?: number;
  issueDate?: string;
}

interface BatchResult {
  success: boolean;
  processed: number;
  errors: number;
  results: ProcessingResult[];
  errorDetails: { importId: string; error: string }[];
  metadata?: {
    processingTimeMs: number;
    byYear: Record<string, { count: number; totalValue: number; taxes: number }>;
    byType: Record<string, { count: number; totalValue: number }>;
    suppliers: { cnpj: string; name: string; count: number; total: number }[];
  };
  creditAnalysis?: {
    creditsFound: number;
    totalPotential: number;
    byCategory?: { category: string; potential: number; count: number }[];
  };
}

const TEST_XML_FILES = [
  { name: "01-compra-mercadoria.xml", content: xmlCompra },
  { name: "02-venda-mercadoria.xml", content: xmlVendaPJ },
  { name: "03-venda-consumidor-final.xml", content: xmlVendaPF },
  { name: "04-devolucao-cliente.xml", content: xmlDevolucaoCliente },
  { name: "05-devolucao-fornecedor.xml", content: xmlDevolucaoFornecedor },
];

function extractYearFromFile(file: File): number {
  const yearMatch = file.name.match(/(\d{4})/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year >= 2018 && year <= new Date().getFullYear()) {
      return year;
    }
  }
  return new Date(file.lastModified).getFullYear();
}

export default function AnaliseNotasFiscais() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as 'importar' | 'sped' | 'dctf' | 'cruzamento' | 'creditos' | 'exposicao' | null;
  
  const [activeTab, setActiveTab] = useState(initialTab || 'importar');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingTestFiles, setIsLoadingTestFiles] = useState(false);
  
  // Progress state
  const [processingPhase, setProcessingPhase] = useState<ProcessingPhase>('preparing');
  const [processedCount, setProcessedCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [currentFile, setCurrentFile] = useState<string | undefined>();
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | undefined>();
  const [filesPerSecond, setFilesPerSecond] = useState(0);
  const startTimeRef = useRef<Date>(new Date());
  
  // Summary state
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<ImportSummaryData | null>(null);
  const [importErrors, setImportErrors] = useState<ImportErrorItem[]>([]);

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
    const remainingSlots = MAX_FILES - files.length;
    const filesToAdd = newFiles.slice(0, remainingSlots);
    
    if (newFiles.length > remainingSlots) {
      toast({
        title: "Limite de arquivos",
        description: `Apenas ${remainingSlots} arquivos foram adicionados. Limite máximo: ${MAX_FILES} arquivos.`,
        variant: "destructive"
      });
    }
    
    const fileItems: FileItem[] = filesToAdd.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'waiting',
      progress: 0,
      year: extractYearFromFile(file)
    }));
    
    setFiles(prev => [...prev, ...fileItems]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearQueue = () => {
    setFiles([]);
    setShowSummary(false);
    setSummaryData(null);
    setImportErrors([]);
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

  const calculateETA = (startTime: Date, processed: number, total: number): number => {
    const elapsed = Date.now() - startTime.getTime();
    if (processed === 0) return 0;
    const rate = processed / elapsed;
    const remaining = total - processed;
    return remaining / rate;
  };

  const processChunk = async (chunkFiles: FileItem[]): Promise<BatchResult | null> => {
    const importIds: string[] = [];
    
    for (const fileItem of chunkFiles) {
      try {
        setCurrentFile(fileItem.file.name);
        
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'uploading', progress: 30 } : f
        ));

        const date = new Date();
        const path = `${user!.id}/${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}/${fileItem.id}_${fileItem.file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('xml-imports')
          .upload(path, fileItem.file);

        if (uploadError) throw uploadError;

        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, progress: 60 } : f
        ));

        const { data: importRecord, error: importError } = await supabase
          .from('xml_imports')
          .insert({
            user_id: user!.id,
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
        setErrorCount(prev => prev + 1);
      }
    }

    if (importIds.length === 0) return null;

    setFiles(prev => prev.map(f => 
      f.importId && importIds.includes(f.importId) 
        ? { ...f, status: 'processing', progress: 80 } 
        : f
    ));

    try {
      const response = await supabase.functions.invoke('process-xml-batch', {
        body: { importIds }
      });

      if (response.error) throw response.error;

      const result: BatchResult = response.data;

      if (result.results) {
        for (const res of result.results) {
          setFiles(prev => prev.map(f => 
            f.importId === res.importId 
              ? { ...f, status: 'completed', progress: 100 } 
              : f
          ));
          setSuccessCount(prev => prev + 1);
        }
      }

      if (result.errorDetails) {
        for (const err of result.errorDetails) {
          setFiles(prev => prev.map(f => 
            f.importId === err.importId 
              ? { ...f, status: 'error', error: err.error } 
              : f
          ));
          setErrorCount(prev => prev + 1);
        }
      }

      return result;
    } catch (error) {
      console.error('Processing error:', error);
      for (const id of importIds) {
        setFiles(prev => prev.map(f => 
          f.importId === id ? { ...f, status: 'error', error: String(error) } : f
        ));
        setErrorCount(prev => prev + 1);
      }
      return null;
    }
  };

  const uploadAndProcess = async () => {
    if (!user || files.length === 0) return;
    
    setIsProcessing(true);
    setShowSummary(false);
    setSummaryData(null);
    setImportErrors([]);
    setProcessedCount(0);
    setSuccessCount(0);
    setErrorCount(0);
    startTimeRef.current = new Date();
    
    const waitingFiles = files.filter(f => f.status === 'waiting');
    const totalFiles = waitingFiles.length;

    setProcessingPhase('preparing');
    await new Promise(resolve => setTimeout(resolve, 500));

    setProcessingPhase('uploading');

    const chunks: FileItem[][] = [];
    for (let i = 0; i < waitingFiles.length; i += CHUNK_SIZE) {
      chunks.push(waitingFiles.slice(i, i + CHUNK_SIZE));
    }

    const allResults: BatchResult[] = [];
    let processed = 0;

    setProcessingPhase('processing');

    for (let i = 0; i < chunks.length; i += PARALLEL_CHUNKS) {
      const parallelChunks = chunks.slice(i, i + PARALLEL_CHUNKS);
      
      const chunkResults = await Promise.all(
        parallelChunks.map(chunk => processChunk(chunk))
      );

      for (const result of chunkResults) {
        if (result) {
          allResults.push(result);
        }
      }

      processed += parallelChunks.reduce((acc, c) => acc + c.length, 0);
      setProcessedCount(processed);

      const elapsed = Date.now() - startTimeRef.current.getTime();
      const rate = processed / (elapsed / 1000);
      setFilesPerSecond(rate);
      setEstimatedTimeRemaining(calculateETA(startTimeRef.current, processed, totalFiles));
    }

    setProcessingPhase('analyzing');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Build summary data
    const processingTimeMs = Date.now() - startTimeRef.current.getTime();
    const byYearMap = new Map<number, { count: number; totalValue: number; currentTaxes: number; reformTaxes: number }>();
    const suppliersMap = new Map<string, { name: string; cnpj: string; notesCount: number; totalValue: number }>();
    const errors: ImportErrorItem[] = [];
    let totalCreditsValue = 0;
    const creditCategories = new Map<string, { potential: number; count: number }>();

    for (const result of allResults) {
      for (const r of result.results || []) {
        const year = r.issueDate ? new Date(r.issueDate).getFullYear() : new Date().getFullYear();
        
        if (!byYearMap.has(year)) {
          byYearMap.set(year, { count: 0, totalValue: 0, currentTaxes: 0, reformTaxes: 0 });
        }
        const yearData = byYearMap.get(year)!;
        yearData.count++;
        yearData.totalValue += r.documentTotal || 0;
        yearData.currentTaxes += r.currentTaxTotal;
        yearData.reformTaxes += r.reformTaxTotal;

        if (r.issuerCnpj) {
          if (!suppliersMap.has(r.issuerCnpj)) {
            suppliersMap.set(r.issuerCnpj, { 
              name: r.issuerName || 'Desconhecido', 
              cnpj: r.issuerCnpj, 
              notesCount: 0, 
              totalValue: 0 
            });
          }
          const supplier = suppliersMap.get(r.issuerCnpj)!;
          supplier.notesCount++;
          supplier.totalValue += r.documentTotal || 0;
        }
      }

      for (const err of result.errorDetails || []) {
        const file = files.find(f => f.importId === err.importId);
        errors.push({
          fileName: file?.file.name || 'Arquivo desconhecido',
          errorType: err.error.includes('XML') ? 'xml_invalid' : 
                     err.error.includes('duplicad') ? 'duplicate' : 'parse_error',
          message: err.error
        });
      }

      if (result.creditAnalysis) {
        totalCreditsValue += result.creditAnalysis.totalPotential || 0;
        
        for (const cat of result.creditAnalysis.byCategory || []) {
          if (!creditCategories.has(cat.category)) {
            creditCategories.set(cat.category, { potential: 0, count: 0 });
          }
          const catData = creditCategories.get(cat.category)!;
          catData.potential += cat.potential;
          catData.count += cat.count;
        }
      }
    }

    const summary: ImportSummaryData = {
      totalProcessed: allResults.reduce((acc, r) => acc + r.processed, 0),
      totalErrors: allResults.reduce((acc, r) => acc + r.errors, 0),
      processingTimeMs,
      byYear: Array.from(byYearMap.entries())
        .map(([year, data]) => ({ year, ...data }))
        .sort((a, b) => b.year - a.year),
      topSuppliers: Array.from(suppliersMap.values())
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 10),
      creditsFound: Array.from(creditCategories.entries())
        .map(([category, data]) => ({
          category,
          potential: data.potential,
          count: data.count,
          confidence: data.potential > 10000 ? 'high' as const : 
                     data.potential > 1000 ? 'medium' as const : 'low' as const
        })),
      errors,
      totalCreditsValue
    };

    setSummaryData(summary);
    setImportErrors(errors);
    setShowSummary(true);
    setProcessingPhase('complete');

    toast({
      title: "Processamento concluído",
      description: `${summary.totalProcessed} arquivo(s) processado(s), ${summary.totalErrors} erro(s)`,
    });

    setIsProcessing(false);
    
    // Auto-switch to credits tab after processing
    if (summary.totalProcessed > 0) {
      setTimeout(() => setActiveTab('creditos'), 1500);
    }
  };

  const completedCount = files.filter(f => f.status === 'completed').length;
  const waitingCount = files.filter(f => f.status === 'waiting').length;
  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileStack className="h-7 w-7 text-primary" />
            Análise de Créditos Tributários
          </h1>
          <p className="text-muted-foreground">
            Importe XMLs, identifique créditos recuperáveis e projete sua exposição tributária
          </p>
        </div>

        {/* Savings Summary Card */}
        <SavingsSummaryCard />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-6">
            <TabsTrigger value="importar" className="gap-2">
              <Upload className="h-4 w-4" />
              XMLs
            </TabsTrigger>
            <TabsTrigger value="sped" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              SPED
            </TabsTrigger>
            <TabsTrigger value="dctf" className="gap-2">
              <FileText className="h-4 w-4" />
              DCTF
            </TabsTrigger>
            <TabsTrigger value="cruzamento" className="gap-2">
              <GitCompare className="h-4 w-4" />
              Cruzamento
            </TabsTrigger>
            <TabsTrigger value="creditos" className="gap-2">
              <Target className="h-4 w-4" />
              Créditos
            </TabsTrigger>
            <TabsTrigger value="exposicao" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              Exposição
            </TabsTrigger>
          </TabsList>

          {/* Tab: Importar XMLs */}
          <TabsContent value="importar" className="space-y-6">
            {/* Summary Card (shown after processing) */}
            {showSummary && summaryData && (
              <ImportSummaryCard data={summaryData} />
            )}

            {/* Errors List */}
            {importErrors.length > 0 && (
              <ImportErrorsList errors={importErrors} />
            )}

            {/* Upload Area */}
            {!showSummary && (
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
                          Suporta NFe, NFSe, CTe • Até {MAX_FILES.toLocaleString()} arquivos por vez • Aceita .xml e .zip
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              loadTestFiles();
                            }}
                            disabled={isLoadingTestFiles}
                          >
                            {isLoadingTestFiles ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <FlaskConical className="mr-2 h-4 w-4" />
                            )}
                            Carregar XMLs de Teste (5)
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground"
                          >
                            <FolderArchive className="mr-2 h-4 w-4" />
                            Histórico 5 anos suportado
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <ImportProgressBar
                phase={processingPhase}
                totalFiles={files.filter(f => f.status !== 'completed' && f.status !== 'error').length + processedCount}
                processedFiles={processedCount}
                successCount={successCount}
                errorCount={errorCount}
                currentFile={currentFile}
                startTime={startTimeRef.current}
                estimatedTimeRemaining={estimatedTimeRemaining}
                filesPerSecond={filesPerSecond}
              />
            )}

            {/* Files by Year */}
            {files.length > 0 && !showSummary && (
              <ImportFilesByYear files={files} showDetails={!isProcessing} />
            )}

            {/* File Queue */}
            {files.length > 0 && !showSummary && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-lg">Fila de Processamento</CardTitle>
                      <Badge variant="outline">{files.length} arquivo(s)</Badge>
                      <Badge variant="secondary">{formatFileSize(totalSize)}</Badge>
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
                        disabled={isProcessing || waitingCount === 0}
                      >
                        {isProcessing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="mr-2 h-4 w-4" />
                        )}
                        Processar {waitingCount > 0 ? `(${waitingCount})` : 'Todos'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {files.slice(0, 50).map((fileItem) => (
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
                              {fileItem.year && ` • ${fileItem.year}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {fileItem.status === 'waiting' && <Clock className="h-4 w-4 text-muted-foreground" />}
                            {(fileItem.status === 'uploading' || fileItem.status === 'processing') && (
                              <Loader2 className="h-4 w-4 text-primary animate-spin" />
                            )}
                            {fileItem.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            {fileItem.status === 'error' && <XCircle className="h-4 w-4 text-destructive" />}
                            
                            <span className={`text-sm ${fileItem.status === 'error' ? 'text-destructive' : ''}`}>
                              {fileItem.status === 'waiting' && 'Aguardando'}
                              {fileItem.status === 'uploading' && 'Enviando...'}
                              {fileItem.status === 'processing' && 'Processando...'}
                              {fileItem.status === 'completed' && 'Concluído'}
                              {fileItem.status === 'error' && 'Erro'}
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
                    
                    {files.length > 50 && (
                      <div className="text-center text-sm text-muted-foreground py-2">
                        ... e mais {files.length - 50} arquivos
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistics */}
            {files.length > 0 && !showSummary && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Clock className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{waitingCount}</p>
                        <p className="text-sm text-muted-foreground">Aguardando</p>
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
                        <p className="text-2xl font-bold">{files.filter(f => f.status === 'error').length}</p>
                        <p className="text-sm text-muted-foreground">Erros</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* New Import Button (shown after summary) */}
            {showSummary && (
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={clearQueue}>
                  <Upload className="mr-2 h-4 w-4" />
                  Nova Importação
                </Button>
                <Button onClick={() => setActiveTab('creditos')}>
                  <Target className="mr-2 h-4 w-4" />
                  Ver Créditos Identificados
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Tab: SPED Contribuições */}
          <TabsContent value="sped">
            <SpedUploader />
          </TabsContent>

          {/* Tab: DCTF */}
          <TabsContent value="dctf">
            <DctfUploader />
          </TabsContent>

          {/* Tab: Cruzamento SPED x DCTF */}
          <TabsContent value="cruzamento">
            <FiscalGapsDashboard />
          </TabsContent>

          {/* Tab: Créditos Recuperáveis */}
          <TabsContent value="creditos">
            <CreditRadar />
          </TabsContent>

          {/* Tab: Exposição Projetada */}
          <TabsContent value="exposicao">
            <ExposureProjection />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
