import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, Circle, Trophy, FileText, BarChart3, 
  Lightbulb, Workflow, TrendingUp 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProgressData } from "@/hooks/useUserProgress";

interface ProgressSummaryProps {
  progress: UserProgressData;
}

const JOURNEY_STEPS = [
  { key: 'score', label: 'Score', icon: Trophy },
  { key: 'xml', label: 'XMLs', icon: FileText },
  { key: 'dre', label: 'DRE', icon: BarChart3 },
  { key: 'opportunities', label: 'Oportunidades', icon: Lightbulb },
  { key: 'workflow', label: 'Workflow', icon: Workflow },
] as const;

export function ProgressSummary({ progress }: ProgressSummaryProps) {
  if (progress.loading) {
    return (
      <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-3 w-full mb-4" />
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-12 h-12 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const completionStatus = {
    score: progress.hasScore,
    xml: progress.hasXmls,
    dre: progress.hasDre,
    opportunities: progress.hasOpportunities,
    workflow: progress.hasWorkflow,
  };

  const completedCount = Object.values(completionStatus).filter(Boolean).length;

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Seu Progresso Tributário</h3>
              <p className="text-sm text-muted-foreground">
                {completedCount} de 5 etapas concluídas
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">{Math.round(progress.progressPercent)}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress.progressPercent} className="h-3 mb-6" />

        {/* Steps */}
        <div className="flex justify-between items-center">
          {JOURNEY_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completionStatus[step.key];
            const isNext = !isCompleted && 
              Object.entries(completionStatus)
                .findIndex(([k, v]) => !v) === Object.keys(completionStatus).indexOf(step.key);

            return (
              <div 
                key={step.key} 
                className={cn(
                  "flex flex-col items-center gap-1 transition-all",
                  isCompleted ? "opacity-100" : isNext ? "opacity-100" : "opacity-50"
                )}
              >
                <div className={cn(
                  "relative w-12 h-12 rounded-full flex items-center justify-center transition-all",
                  isCompleted 
                    ? "bg-primary text-primary-foreground" 
                    : isNext 
                      ? "bg-primary/20 text-primary ring-2 ring-primary ring-offset-2" 
                      : "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  
                  {/* Connector line */}
                  {index < JOURNEY_STEPS.length - 1 && (
                    <div className={cn(
                      "absolute left-full top-1/2 w-[calc(100%-12px)] h-0.5 -translate-y-1/2 ml-1",
                      completionStatus[JOURNEY_STEPS[index + 1].key] || isCompleted 
                        ? "bg-primary" 
                        : "bg-muted"
                    )} style={{ width: 'calc(100% - 4px)' }} />
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  isCompleted ? "text-primary" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
