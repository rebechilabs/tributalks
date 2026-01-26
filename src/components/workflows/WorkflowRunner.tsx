import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Clock,
  ExternalLink,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Workflow, WorkflowStep } from "@/pages/WorkflowsGuiados";

interface WorkflowRunnerProps {
  workflow: Workflow;
  onBack: () => void;
}

export function WorkflowRunner({ workflow, onBack }: WorkflowRunnerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const currentStep = workflow.steps[currentStepIndex];
  const progress = (completedSteps.size / workflow.steps.length) * 100;

  const markAsComplete = () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStep.id);
    setCompletedSteps(newCompleted);
    
    if (currentStepIndex < workflow.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  const isCompleted = completedSteps.has(currentStep.id);
  const allCompleted = completedSteps.size === workflow.steps.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Workflows
        </Button>
        <Badge variant="outline" className="gap-1">
          <Clock className="w-3 h-3" />
          {workflow.estimatedTime}
        </Badge>
      </div>

      {/* Title & Progress */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">{workflow.title}</h2>
            <p className="text-sm text-muted-foreground">{workflow.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Progress value={progress} className="flex-1" />
          <span className="text-sm font-medium text-foreground">
            {completedSteps.size}/{workflow.steps.length} etapas
          </span>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps List */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-medium text-foreground mb-4">Etapas</h3>
          <div className="space-y-2">
            {workflow.steps.map((step, index) => {
              const isStepCompleted = completedSteps.has(step.id);
              const isCurrent = index === currentStepIndex;
              
              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    isCurrent 
                      ? "bg-primary/10 border border-primary/30" 
                      : "hover:bg-muted"
                  }`}
                >
                  {isStepCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  ) : (
                    <Circle className={`w-5 h-5 flex-shrink-0 ${
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    }`} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isStepCompleted 
                        ? "text-muted-foreground line-through" 
                        : "text-foreground"
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.duration}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Step Details */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          {allCompleted ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                Workflow Concluído! 🎉
              </h3>
              <p className="text-muted-foreground mb-6">
                Você completou todas as etapas do {workflow.title}.
              </p>
              <Button onClick={onBack}>
                Ver outros workflows
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    Etapa {currentStepIndex + 1} de {workflow.steps.length}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="w-3 h-3" />
                    {currentStep.duration}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {currentStep.title}
                </h3>
                <p className="text-muted-foreground">
                  {currentStep.description}
                </p>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Ferramenta utilizada nesta etapa:
                </p>
                <div className="flex items-center gap-3">
                  <Badge className="text-sm">{currentStep.tool}</Badge>
                  <Link 
                    to={currentStep.toolPath}
                    target="_blank"
                    className="text-primary text-sm hover:underline flex items-center gap-1"
                  >
                    Abrir em nova aba
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link to={currentStep.toolPath} className="flex-1">
                  <Button className="w-full gap-2">
                    Ir para {currentStep.tool}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={markAsComplete}
                  disabled={isCompleted}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
                      Concluída
                    </>
                  ) : (
                    "Marcar como concluída"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
