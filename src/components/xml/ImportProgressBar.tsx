import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, FileSearch, BarChart3, CheckCircle2 } from "lucide-react";

export type ProcessingPhase = 'preparing' | 'uploading' | 'processing' | 'analyzing' | 'complete';

interface ImportProgressBarProps {
  phase: ProcessingPhase;
  totalFiles: number;
  processedFiles: number;
  successCount: number;
  errorCount: number;
  currentFile?: string;
  startTime: Date;
  estimatedTimeRemaining?: number;
  bytesUploaded?: number;
  totalBytes?: number;
  filesPerSecond?: number;
}

const phaseConfig: Record<ProcessingPhase, { 
  label: string; 
  icon: React.ComponentType<{ className?: string }>; 
  progressRange: [number, number];
  color: string;
}> = {
  preparing: { 
    label: 'Preparando', 
    icon: FileSearch, 
    progressRange: [0, 5],
    color: 'text-muted-foreground'
  },
  uploading: { 
    label: 'Enviando arquivos', 
    icon: Upload, 
    progressRange: [5, 25],
    color: 'text-blue-500'
  },
  processing: { 
    label: 'Processando XMLs', 
    icon: Loader2, 
    progressRange: [25, 85],
    color: 'text-primary'
  },
  analyzing: { 
    label: 'Analisando créditos', 
    icon: BarChart3, 
    progressRange: [85, 100],
    color: 'text-amber-500'
  },
  complete: { 
    label: 'Concluído', 
    icon: CheckCircle2, 
    progressRange: [100, 100],
    color: 'text-green-500'
  }
};

function formatTime(ms: number): string {
  if (ms < 1000) return 'menos de 1s';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}min ${remainingSeconds}s`;
}

export function ImportProgressBar({
  phase,
  totalFiles,
  processedFiles,
  successCount,
  errorCount,
  currentFile,
  startTime,
  estimatedTimeRemaining,
  filesPerSecond = 0
}: ImportProgressBarProps) {
  const config = phaseConfig[phase];
  const Icon = config.icon;
  
  // Calculate overall progress based on phase and file progress
  const phaseProgress = totalFiles > 0 ? (processedFiles / totalFiles) * 100 : 0;
  const [rangeStart, rangeEnd] = config.progressRange;
  const phaseWidth = rangeEnd - rangeStart;
  const overallProgress = phase === 'complete' 
    ? 100 
    : rangeStart + (phaseProgress * phaseWidth / 100);

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      {/* Phase indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.color} ${phase !== 'complete' ? 'animate-pulse' : ''}`} />
          <span className="font-medium">{config.label}</span>
          {phase !== 'complete' && phase !== 'preparing' && (
            <Badge variant="outline" className="ml-2">
              {processedFiles} / {totalFiles}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {filesPerSecond > 0 && phase === 'processing' && (
            <span>~{filesPerSecond.toFixed(1)} arquivos/s</span>
          )}
          {estimatedTimeRemaining && phase !== 'complete' && (
            <span>~{formatTime(estimatedTimeRemaining)} restantes</span>
          )}
        </div>
      </div>

      {/* Main progress bar */}
      <div className="space-y-1">
        <Progress value={overallProgress} className="h-3" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round(overallProgress)}% completo</span>
          <span>
            {phase !== 'complete' && formatTime(Date.now() - startTime.getTime())} decorrido
          </span>
        </div>
      </div>

      {/* Current file indicator */}
      {currentFile && phase !== 'complete' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="truncate max-w-md">{currentFile}</span>
        </div>
      )}

      {/* Stats summary */}
      {(successCount > 0 || errorCount > 0) && (
        <div className="flex gap-4 text-sm pt-2 border-t">
          <span className="text-green-600">
            ✓ {successCount} processados
          </span>
          {errorCount > 0 && (
            <span className="text-destructive">
              ✗ {errorCount} erros
            </span>
          )}
        </div>
      )}
    </div>
  );
}
