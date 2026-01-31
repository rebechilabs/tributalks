import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  Database, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  TrendingUp,
  Shield,
  Clock,
  ArrowRight,
  X
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface QuickDiagnosticModalProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

type DiagnosticPhase = 'choose' | 'uploading' | 'processing' | 'complete' | 'error';

interface DiagnosticResult {
  status: 'complete' | 'partial' | 'error';
  credits?: { total: number; items: any[] };
  cashflow?: { risk: 'low' | 'medium' | 'high'; impact_q2_2027: number };
  margin?: { current: number; projected: number; delta_pp: number };
  insights: string[];
  processing_time_ms: number;
}

const PROGRESS_MESSAGES = [
  { time: 0, text: "Iniciando análise..." },
  { time: 10, text: "Processando notas fiscais..." },
  { time: 25, text: "Identificando créditos tributários..." },
  { time: 45, text: "Calculando impacto na margem..." },
  { time: 65, text: "Projetando fluxo de caixa..." },
  { time: 80, text: "Gerando insights finais..." },
  { time: 95, text: "Quase lá! Preparando seu painel..." },
];

export function QuickDiagnosticModal({ open, onComplete, onSkip }: QuickDiagnosticModalProps) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<DiagnosticPhase>('choose');
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(PROGRESS_MESSAGES[0].text);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Progress animation during processing
  useEffect(() => {
    if (phase !== 'processing') return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedTime(elapsed);
      
      // Update progress (max 95% until complete)
      const newProgress = Math.min(elapsed * 1.1, 95);
      setProgress(newProgress);
      
      // Update message based on progress
      const message = PROGRESS_MESSAGES.reduce((acc, msg) => {
        if (newProgress >= msg.time) return msg.text;
        return acc;
      }, PROGRESS_MESSAGES[0].text);
      setCurrentMessage(message);
      
      // Safety timeout at 100s
      if (elapsed > 100) {
        clearInterval(interval);
        setPhase('error');
      }
    }, 500);

    return () => clearInterval(interval);
  }, [phase]);

  // Validate files before processing
  const validateFiles = useCallback((filesToValidate: File[]): string[] => {
    const errors: string[] = [];
    
    filesToValidate.forEach(file => {
      if (!file.name.toLowerCase().endsWith('.xml')) {
        errors.push(`${file.name} não é um arquivo XML válido`);
      }
      if (file.size > 500 * 1024) {
        errors.push(`${file.name} excede o limite de 500KB`);
      }
    });
    
    if (filesToValidate.length < 3) {
      errors.push(`Envie pelo menos 3 XMLs para um diagnóstico completo (você enviou ${filesToValidate.length})`);
    }
    
    return errors;
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const allFiles = [...files, ...acceptedFiles].slice(0, 20); // Max 20 files
    setFiles(allFiles);
    setValidationErrors(validateFiles(allFiles));
  }, [files, validateFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/xml': ['.xml'],
      'text/xml': ['.xml']
    },
    maxFiles: 20
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setValidationErrors(validateFiles(newFiles));
  };

  const startDiagnostic = async () => {
    if (!user || files.length < 3) return;
    
    const errors = validateFiles(files);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setPhase('uploading');
    setProgress(0);

    try {
      // Upload files to storage
      const uploadPromises = files.map(async (file, index) => {
        const fileName = `${user.id}/diagnostic/${Date.now()}_${index}_${file.name}`;
        const { error } = await supabase.storage
          .from('xml-imports')
          .upload(fileName, file);
        
        if (error) throw error;
        return fileName;
      });

      setProgress(20);
      const uploadedPaths = await Promise.all(uploadPromises);
      
      setPhase('processing');
      setProgress(25);

      // Call edge function for processing
      const { data, error } = await supabase.functions.invoke('quick-diagnostic', {
        body: {
          xmlPaths: uploadedPaths,
          userId: user.id
        }
      });

      if (error) throw error;

      setResult(data as DiagnosticResult);
      setProgress(100);
      setPhase('complete');

      toast({
        title: "Diagnóstico concluído!",
        description: "Seus insights estão prontos no NEXUS.",
      });

    } catch (error: any) {
      console.error('Diagnostic error:', error);
      setPhase('error');
      toast({
        title: "Erro no diagnóstico",
        description: error.message || "Tente novamente ou pule por enquanto.",
        variant: "destructive",
      });
    }
  };

  const handleSkip = () => {
    // Save pending flag
    localStorage.setItem('diagnostic_pending', 'true');
    onSkip();
  };

  const handleComplete = () => {
    localStorage.removeItem('needs_quick_diagnostic');
    localStorage.removeItem('diagnostic_pending');
    onComplete();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={() => {}} // Prevent closing
    >
      <DialogContent 
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        // Hide close button by not rendering DialogClose
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {phase === 'choose' && "Vamos diagnosticar sua empresa"}
                {phase === 'uploading' && "Enviando arquivos..."}
                {phase === 'processing' && "Analisando seus dados"}
                {phase === 'complete' && "Diagnóstico concluído!"}
                {phase === 'error' && "Ops, algo deu errado"}
              </DialogTitle>
              <DialogDescription>
                {phase === 'choose' && "Em menos de 2 minutos, você terá insights personalizados"}
                {phase === 'uploading' && "Preparando seus XMLs para análise"}
                {phase === 'processing' && currentMessage}
                {phase === 'complete' && "Seus insights estão prontos no NEXUS"}
                {phase === 'error' && "Não se preocupe, você pode tentar novamente"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Phase: Choose */}
        {phase === 'choose' && (
          <div className="space-y-6">
            {/* Benefits */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-muted/50">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Créditos identificados</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <Shield className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Riscos mapeados</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">~2 minutos</p>
              </div>
            </div>

            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                {isDragActive ? "Solte os arquivos aqui" : "Arraste XMLs de notas fiscais"}
              </p>
              <p className="text-xs text-muted-foreground">
                ou clique para selecionar (mínimo 3 arquivos)
              </p>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                  <div className="text-sm">
                    {validationErrors.map((error, i) => (
                      <p key={i} className="text-destructive">{error}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(0)}KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* ERP Option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              disabled
            >
              <Database className="w-4 h-4 mr-2" />
              Conectar ERP
              <Badge variant="secondary" className="ml-2">Em breve</Badge>
            </Button>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="flex-1"
              >
                Pular por enquanto
              </Button>
              <Button
                onClick={startDiagnostic}
                disabled={files.length < 3 || validationErrors.filter(e => !e.includes('pelo menos')).length > 0}
                className="flex-1"
              >
                Iniciar diagnóstico
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Phase: Uploading / Processing */}
        {(phase === 'uploading' || phase === 'processing') && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-lg font-medium mb-2">{currentMessage}</p>
              <p className="text-sm text-muted-foreground">
                {elapsedTime.toFixed(0)}s decorridos
              </p>
            </div>

            <Progress value={progress} className="h-3" />

            <div className="text-center text-xs text-muted-foreground">
              Analisando {files.length} arquivos...
            </div>
          </div>
        )}

        {/* Phase: Complete */}
        {phase === 'complete' && result && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">Análise concluída em {(result.processing_time_ms / 1000).toFixed(1)}s</p>
              {result.status === 'partial' && (
                <Badge variant="secondary" className="mt-2">Resultado parcial</Badge>
              )}
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.credits && (
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(result.credits.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">Créditos identificados</p>
                  </CardContent>
                </Card>
              )}
              
              {result.cashflow && (
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Badge 
                      variant={result.cashflow.risk === 'high' ? 'destructive' : result.cashflow.risk === 'medium' ? 'secondary' : 'default'}
                    >
                      Risco {result.cashflow.risk === 'high' ? 'Alto' : result.cashflow.risk === 'medium' ? 'Médio' : 'Baixo'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">Fluxo de caixa Q2/2027</p>
                  </CardContent>
                </Card>
              )}
              
              {result.margin && (
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className={`text-2xl font-bold ${result.margin.delta_pp < 0 ? 'text-destructive' : 'text-primary'}`}>
                      {result.margin.delta_pp > 0 ? '+' : ''}{result.margin.delta_pp.toFixed(1)}pp
                    </p>
                    <p className="text-xs text-muted-foreground">Impacto na margem</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Insights */}
            {result.insights.length > 0 && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Insights principais
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {result.insights.slice(0, 3).map((insight, i) => (
                    <li key={i}>• {insight}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={handleComplete} className="w-full">
              Ver detalhes no NEXUS
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Phase: Error */}
        {phase === 'error' && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <p className="text-lg font-medium mb-2">Não foi possível completar a análise</p>
              <p className="text-sm text-muted-foreground">
                Isso pode acontecer se os arquivos estão corrompidos ou em formato inesperado.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setPhase('choose');
                  setFiles([]);
                  setProgress(0);
                }}
                className="flex-1"
              >
                Tentar novamente
              </Button>
              <Button
                onClick={handleSkip}
                className="flex-1"
              >
                Pular por enquanto
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
