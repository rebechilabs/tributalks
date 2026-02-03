import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Target, 
  CheckCircle2, 
  Circle, 
  SkipForward,
  Clock,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Bot,
  RefreshCw,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Roadmap, RoadmapStep } from "@/hooks/useAdaptiveRoadmap";
import { cn } from "@/lib/utils";

interface MissionDashboardProps {
  roadmap: Roadmap;
  onCompleteStep: (tool: string) => void;
  onSkipStep: (tool: string) => void;
  onFeedback: (feedback: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function MissionDashboard({
  roadmap,
  onCompleteStep,
  onSkipStep,
  onFeedback,
  onRefresh,
  isRefreshing,
}: MissionDashboardProps) {
  const navigate = useNavigate();

  const getStepStatus = (step: RoadmapStep) => {
    if (roadmap.completedSteps.includes(step.tool)) return 'completed';
    if (roadmap.skippedSteps.includes(step.tool)) return 'skipped';
    
    // Primeiro não-completado é o atual
    const firstIncomplete = roadmap.steps.find(
      s => !roadmap.completedSteps.includes(s.tool) && !roadmap.skippedSteps.includes(s.tool)
    );
    if (firstIncomplete?.tool === step.tool) return 'current';
    
    return 'pending';
  };

  const handleStepClick = (step: RoadmapStep) => {
    navigate(step.toolRoute);
    // Marcar como em progresso após pequeno delay
    setTimeout(() => {
      onCompleteStep(step.tool);
    }, 1000);
  };

  const getIcon = (iconName: string) => {
    const icons = LucideIcons as unknown as Record<string, React.ElementType>;
    const Icon = icons[iconName];
    return Icon || LucideIcons.Circle;
  };

  const allCompleted = roadmap.progress === 100;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                Sua Missão Hoje
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {roadmap.estimatedTotalTime} min
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">
                {roadmap.sessionGoal}
              </p>
            </div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn(
                    "w-4 h-4",
                    isRefreshing && "animate-spin"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mudar foco</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{roadmap.progress}%</span>
          </div>
          <Progress value={roadmap.progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {roadmap.steps.map((step, index) => {
          const status = getStepStatus(step);
          const Icon = getIcon(step.icon);
          
          return (
            <motion.div
              key={step.tool}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={cn(
                "p-4 rounded-xl border transition-all duration-200",
                status === 'current' && "border-primary bg-primary/5 shadow-sm",
                status === 'completed' && "border-green-500/30 bg-green-500/5",
                status === 'skipped' && "border-muted bg-muted/30 opacity-60",
                status === 'pending' && "border-border hover:border-primary/30"
              )}>
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    status === 'completed' && "bg-green-500/20 text-green-500",
                    status === 'current' && "bg-primary/20 text-primary",
                    status === 'skipped' && "bg-muted text-muted-foreground",
                    status === 'pending' && "bg-muted text-muted-foreground"
                  )}>
                    {status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : status === 'skipped' ? (
                      <SkipForward className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={cn(
                        "font-medium",
                        status === 'completed' && "line-through text-muted-foreground",
                        status === 'skipped' && "line-through text-muted-foreground"
                      )}>
                        {step.action}
                      </p>
                      {step.priority === 'urgent' && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          Urgente
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {step.why}
                    </p>

                    {/* Actions for current step */}
                    {status === 'current' && (
                      <div className="flex items-center gap-2 mt-3">
                        <Button 
                          size="sm" 
                          onClick={() => handleStepClick(step)}
                          className="gap-1"
                        >
                          Iniciar
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => onSkipStep(step.tool)}
                          className="text-muted-foreground"
                        >
                          Pular
                        </Button>
                        <span className="text-xs text-muted-foreground ml-auto">
                          ~{step.estimatedTime}
                        </span>
                      </div>
                    )}

                    {/* Pending step - subtle action */}
                    {status === 'pending' && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleStepClick(step)}
                        className="mt-2 text-muted-foreground hover:text-foreground"
                      >
                        Fazer agora
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Completion State */}
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-green-500" />
            </div>
            <h4 className="font-semibold text-green-700 dark:text-green-400 mb-1">
              Missão Completa! 🎉
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Você completou todas as ações de hoje. Como foi?
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onFeedback('util')}
                className="gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                Útil
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onFeedback('nao_relevante')}
                className="gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                Não ajudou
              </Button>
            </div>
          </motion.div>
        )}

        {/* Clara Suggestion */}
        {!allCompleted && roadmap.progress > 0 && roadmap.progress < 100 && (
          <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-3">
            <Bot className="w-5 h-5 text-primary mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Clara diz:</span>{" "}
              {roadmap.progress < 50 
                ? "Você está indo bem! Complete o próximo passo para ganhar momentum."
                : "Mais da metade concluída! Vamos terminar forte hoje."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
