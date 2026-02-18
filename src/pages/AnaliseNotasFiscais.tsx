import { useState, useCallback, useRef } from "react";
import { MotivationalBanner } from "@/components/common/MotivationalBanner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FileStack } from "lucide-react";
import { 
  type ProcessingPhase,
  type ImportSummaryData,
  type ImportErrorItem
} from "@/components/xml";
import { RadarStepper } from "@/components/radar/RadarStepper";
import { RegimeSelector } from "@/components/radar/RegimeSelector";
import { DocumentUploadStep } from "@/components/radar/DocumentUploadStep";
import { AnalysisStep } from "@/components/radar/AnalysisStep";
import { type RegimeType, type DocStatus } from "@/components/radar/regimeConfig";

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

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRegime, setSelectedRegime] = useState<RegimeType | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, DocStatus>>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // XML files state (kept from original)
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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
  const [summaryData, setSummaryData] = useState<ImportSummaryData | null>(null);

  // --- Navigation ---
  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleRegimeNext = () => {
    setCompletedSteps((prev) => (prev.includes(1) ? prev : [...prev, 1]));
    goToStep(2);
  };

  const handleUploadNext = () => {
    setCompletedSteps((prev) => (prev.includes(2) ? prev : [...prev, 2]));
    goToStep(3);
    // Start processing XMLs
    uploadAndProcess();
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setSelectedRegime(null);
    setUploadedDocs({});
    setCompletedSteps([]);
    setFiles([]);
    setIsProcessing(false);
    setProcessingPhase('preparing');
    setProcessedCount(0);
    setSuccessCount(0);
    setErrorCount(0);
    setSummaryData(null);
  };

  // --- XML file handling ---
  const addXmlFiles = useCallback((newFiles: File[]) => {
    const remainingSlots = MAX_FILES - files.length;
    const filesToAdd = newFiles.slice(0, remainingSlots);

    if (newFiles.length > remainingSlots) {
      toast({
        title: "Limite de arquivos",
        description: `Apenas ${remainingSlots} arquivos foram adicionados. Limite máximo: ${MAX_FILES}.`,
        variant: "destructive",
      });
    }

    const fileItems: FileItem[] = filesToAdd.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: 'waiting',
      progress: 0,
      year: extractYearFromFile(file),
    }));

    setFiles((prev) => [...prev, ...fileItems]);
  }, [files.length, toast]);

  const handleDocStatusChange = (docId: string, status: DocStatus) => {
    setUploadedDocs((prev) => ({ ...prev, [docId]: status }));
  };

  // --- Processing logic (preserved from original) ---
  const calculateETA = (startTime: Date, processed: number, total: number): number => {
    const elapsed = Date.now() - startTime.getTime();
    if (processed === 0) return 0;
    const rate = processed / elapsed;
    const remaining = total - processed;
    return remaining / rate;
  };

  const processChunk = async (chunkFiles: FileItem[]): Promise<BatchResult | null> => {
    const importIds: string[] = [];
    const batchId = `${user!.id}_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12)}`;

    for (const fileItem of chunkFiles) {
      try {
        setCurrentFile(fileItem.file.name);
        setFiles((prev) => prev.map((f) => (f.id === fileItem.id ? { ...f, status: 'uploading', progress: 30 } : f)));

        const date = new Date();
        const path = `${user!.id}/${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}/${fileItem.id}_${fileItem.file.name}`;

        const { error: uploadError } = await supabase.storage.from('xml-imports').upload(path, fileItem.file);
        if (uploadError) throw uploadError;

        setFiles((prev) => prev.map((f) => (f.id === fileItem.id ? { ...f, progress: 60 } : f)));

        const { data: importRecord, error: importError } = await supabase
          .from('xml_imports')
          .insert({ user_id: user!.id, file_name: fileItem.file.name, file_size: fileItem.file.size, file_path: path, status: 'PENDING', batch_id: batchId })
          .select()
          .single();

        if (importError) throw importError;

        setFiles((prev) => prev.map((f) => (f.id === fileItem.id ? { ...f, progress: 70, importId: importRecord.id } : f)));
        importIds.push(importRecord.id);
      } catch (error) {
        console.error('Upload error:', error);
        setFiles((prev) => prev.map((f) => (f.id === fileItem.id ? { ...f, status: 'error', error: 'Erro no upload' } : f)));
        setErrorCount((prev) => prev + 1);
      }
    }

    if (importIds.length === 0) return null;

    setFiles((prev) => prev.map((f) => (f.importId && importIds.includes(f.importId) ? { ...f, status: 'processing', progress: 80 } : f)));

    try {
      const response = await supabase.functions.invoke('process-xml-batch', { body: { importIds } });
      if (response.error) throw response.error;
      const result: BatchResult = response.data;

      if (result.results) {
        for (const res of result.results) {
          setFiles((prev) => prev.map((f) => (f.importId === res.importId ? { ...f, status: 'completed', progress: 100 } : f)));
          setSuccessCount((prev) => prev + 1);
        }
      }
      if (result.errorDetails) {
        for (const err of result.errorDetails) {
          setFiles((prev) => prev.map((f) => (f.importId === err.importId ? { ...f, status: 'error', error: err.error } : f)));
          setErrorCount((prev) => prev + 1);
        }
      }
      return result;
    } catch (error) {
      console.error('Processing error:', error);
      for (const id of importIds) {
        setFiles((prev) => prev.map((f) => (f.importId === id ? { ...f, status: 'error', error: String(error) } : f)));
        setErrorCount((prev) => prev + 1);
      }
      return null;
    }
  };

  const uploadAndProcess = async () => {
    if (!user || files.length === 0) {
      // No XML files — just mark as complete for non-xml only flows
      setProcessingPhase('complete');
      setCompletedSteps((prev) => (prev.includes(3) ? prev : [...prev, 3]));
      return;
    }

    setIsProcessing(true);
    setProcessedCount(0);
    setSuccessCount(0);
    setErrorCount(0);
    startTimeRef.current = new Date();

    setProcessingPhase('preparing');
    await new Promise((resolve) => setTimeout(resolve, 500));
    setProcessingPhase('uploading');

    const waitingFiles = files.filter((f) => f.status === 'waiting');
    const totalFiles = waitingFiles.length;
    const chunks: FileItem[][] = [];
    for (let i = 0; i < waitingFiles.length; i += CHUNK_SIZE) {
      chunks.push(waitingFiles.slice(i, i + CHUNK_SIZE));
    }

    const allResults: BatchResult[] = [];
    let processed = 0;
    setProcessingPhase('processing');

    for (let i = 0; i < chunks.length; i += PARALLEL_CHUNKS) {
      const parallelChunks = chunks.slice(i, i + PARALLEL_CHUNKS);
      const chunkResults = await Promise.all(parallelChunks.map((chunk) => processChunk(chunk)));
      for (const result of chunkResults) {
        if (result) allResults.push(result);
      }
      processed += parallelChunks.reduce((acc, c) => acc + c.length, 0);
      setProcessedCount(processed);
      const elapsed = Date.now() - startTimeRef.current.getTime();
      const rate = processed / (elapsed / 1000);
      setFilesPerSecond(rate);
      setEstimatedTimeRemaining(calculateETA(startTimeRef.current, processed, totalFiles));
    }

    setProcessingPhase('analyzing');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Build summary
    let totalCreditsValue = 0;
    let creditsFoundCount = 0;
    for (const result of allResults) {
      if (result.creditAnalysis) {
        totalCreditsValue += result.creditAnalysis.totalPotential || 0;
        creditsFoundCount += result.creditAnalysis.creditsFound || 0;
      }
    }

    const totalProcessed = allResults.reduce((acc, r) => acc + r.processed, 0);
    const totalErrors = allResults.reduce((acc, r) => acc + r.errors, 0);

    setSummaryData({
      totalProcessed,
      totalErrors,
      processingTimeMs: Date.now() - startTimeRef.current.getTime(),
      byYear: [],
      topSuppliers: [],
      creditsFound: [],
      errors: [],
      totalCreditsValue,
    });

    setProcessingPhase('complete');
    setCompletedSteps((prev) => (prev.includes(3) ? prev : [...prev, 3]));
    setIsProcessing(false);

    toast({
      title: "Processamento concluído",
      description: `${totalProcessed} arquivo(s) processado(s), ${totalErrors} erro(s)`,
    });
  };

  const xmlCount = files.length;
  const totalCredits = summaryData?.totalCreditsValue || 0;
  const opportunitiesCount = summaryData?.creditsFound?.length || 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileStack className="h-7 w-7 text-primary" />
              Radar de Créditos Tributários
            </h1>
            <p className="text-muted-foreground">
              Fluxo guiado para identificar créditos recuperáveis com base no seu regime
            </p>
          </div>

          <MotivationalBanner
            id="radar"
            icon="🔍"
            text="Siga os 3 passos para que nossa IA identifique automaticamente créditos tributários não aproveitados, pagamentos em duplicidade e alíquotas incorretas."
          />

          {/* Stepper */}
          <RadarStepper currentStep={currentStep} completedSteps={completedSteps} />

          {/* Step content */}
          {currentStep === 1 && (
            <RegimeSelector
              selectedRegime={selectedRegime}
              onSelect={setSelectedRegime}
              onNext={handleRegimeNext}
            />
          )}

          {currentStep === 2 && selectedRegime && (
            <DocumentUploadStep
              regime={selectedRegime}
              uploadedDocs={uploadedDocs}
              onDocStatusChange={handleDocStatusChange}
              onBack={() => goToStep(1)}
              onNext={handleUploadNext}
              onXmlFiles={addXmlFiles}
              xmlCount={xmlCount}
            />
          )}

          {currentStep === 3 && selectedRegime && (
            <AnalysisStep
              regime={selectedRegime}
              isProcessing={isProcessing}
              processingPhase={processingPhase}
              processedCount={processedCount}
              totalFiles={files.filter((f) => f.status !== 'completed' && f.status !== 'error').length + processedCount}
              successCount={successCount}
              errorCount={errorCount}
              currentFile={currentFile}
              startTime={startTimeRef.current}
              estimatedTimeRemaining={estimatedTimeRemaining}
              filesPerSecond={filesPerSecond}
              totalCredits={totalCredits}
              opportunitiesCount={opportunitiesCount}
              onBack={() => goToStep(2)}
              onRestart={handleRestart}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
