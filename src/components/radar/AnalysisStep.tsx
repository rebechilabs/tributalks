import { useState, useEffect, Component, type ReactNode, type ErrorInfo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Circle, Target, AlertTriangle, TrendingUp, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { REGIME_CONFIGS, type RegimeType } from './regimeConfig';
import {
  ImportProgressBar,
  type ProcessingPhase,
} from '@/components/xml';
import { CreditRadar } from '@/components/credits';
import { SavingsSummaryCard } from '@/components/credits';
import { motion, AnimatePresence } from 'framer-motion';

class ErrorBoundaryFallback extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('CreditRadar error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <Card><CardContent className="py-6 text-center text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Erro ao carregar dados. Tente novamente.</p>
        </CardContent></Card>
      );
    }
    return this.props.children;
  }
}

interface AnalysisStepProps {
  regime: RegimeType;
  isProcessing: boolean;
  processingPhase: ProcessingPhase;
  processedCount: number;
  totalFiles: number;
  successCount: number;
  errorCount: number;
  currentFile?: string;
  startTime: Date;
  estimatedTimeRemaining?: number;
  filesPerSecond: number;
  /** Summary values after analysis completes */
  totalCredits: number;
  opportunitiesCount: number;
  onBack: () => void;
  onRestart: () => void;
}

export function AnalysisStep({
  regime,
  isProcessing,
  processingPhase,
  processedCount,
  totalFiles,
  successCount,
  errorCount,
  currentFile,
  startTime,
  estimatedTimeRemaining,
  filesPerSecond,
  totalCredits,
  opportunitiesCount,
  onBack,
  onRestart,
}: AnalysisStepProps) {
  const config = REGIME_CONFIGS[regime];
  const isComplete = processingPhase === 'complete';
  const [visibleChecks, setVisibleChecks] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Animate checklist items during processing
  useEffect(() => {
    if (!isProcessing && !isComplete) return;

    if (isComplete) {
      setVisibleChecks(config.analysisChecklist.length);
      return;
    }

    const interval = setInterval(() => {
      setVisibleChecks((prev) => {
        if (prev >= config.analysisChecklist.length) return prev;
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isProcessing, isComplete, config.analysisChecklist.length]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">
          {isComplete ? 'Análise concluída' : 'Análise em andamento'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {isComplete
            ? 'Confira os créditos identificados para o seu regime'
            : `Verificando documentos do regime ${config.label}...`}
        </p>
      </div>

      {/* Progress bar during processing */}
      {isProcessing && (
        <ImportProgressBar
          phase={processingPhase}
          totalFiles={totalFiles}
          processedFiles={processedCount}
          successCount={successCount}
          errorCount={errorCount}
          currentFile={currentFile}
          startTime={startTime}
          estimatedTimeRemaining={estimatedTimeRemaining}
          filesPerSecond={filesPerSecond}
        />
      )}

      {/* Checklist */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
            Verificações — {config.label}
          </h3>
          <div className="space-y-3">
            <AnimatePresence>
              {config.analysisChecklist.map((item, i) => {
                const isVisible = i < visibleChecks;
                return (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0.3, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="flex items-center gap-3"
                  >
                    {isVisible ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40 flex-shrink-0" />
                    )}
                    <span
                      className={cn(
                        'text-sm',
                        isVisible ? 'text-foreground' : 'text-muted-foreground/40'
                      )}
                    >
                      {item}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Results summary card (shown when complete) */}
      {isComplete && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-primary/30">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Créditos Identificados</span>
                  </div>
                  <p className="text-2xl font-bold text-green-500">{formatCurrency(totalCredits)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Oportunidades</span>
                  </div>
                  <p className="text-2xl font-bold">{opportunitiesCount}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">Nível de risco</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-500">
                    {totalCredits > 50000 ? 'Alto' : totalCredits > 10000 ? 'Médio' : 'Baixo'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <Button variant="outline" onClick={() => setShowDetails(!showDetails)}>
                  {showDetails ? 'Ocultar detalhes' : 'Ver detalhes completos'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Full CreditRadar details */}
      {isComplete && showDetails && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <ErrorBoundaryFallback>
            <SavingsSummaryCard />
          </ErrorBoundaryFallback>
          <div className="mt-6">
            <ErrorBoundaryFallback>
              <CreditRadar />
            </ErrorBoundaryFallback>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={isComplete ? onRestart : onBack}>
          {isComplete ? (
            <>
              <RotateCcw className="mr-2 h-4 w-4" />
              Nova análise
            </>
          ) : (
            <>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
