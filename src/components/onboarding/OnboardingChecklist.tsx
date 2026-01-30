import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, X, Target, Calculator, Calendar, User } from "lucide-react";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { Link } from "react-router-dom";
import { useState } from "react";

const CHECKLIST_ITEMS = [
  {
    key: "score" as const,
    label: "Calcular seu Score Tributário",
    description: "Descubra como está sua saúde tributária",
    icon: Target,
    link: "/dashboard/score-tributario",
  },
  {
    key: "simulation" as const,
    label: "Fazer sua primeira simulação",
    description: "Simule o impacto da Reforma Tributária",
    icon: Calculator,
    link: "/dashboard/calculadora-rtc",
  },
  {
    key: "timeline" as const,
    label: "Explorar a Timeline da Reforma",
    description: "Veja os prazos que afetam sua empresa",
    icon: Calendar,
    link: "/dashboard/timeline-reforma",
  },
  {
    key: "profile" as const,
    label: "Completar seu perfil empresarial",
    description: "Receba recomendações personalizadas",
    icon: User,
    link: "/dashboard/perfil-empresa",
  },
];

export function OnboardingChecklist() {
  const { progress, showChecklist, checklistProgress, completeChecklistItem } = useOnboardingProgress();
  const [dismissed, setDismissed] = useState(false);

  if (!showChecklist || dismissed) {
    return null;
  }

  const completedItems = progress?.checklist_items || {
    score: false,
    simulation: false,
    timeline: false,
    profile: false,
  };

  const progressPercent = (checklistProgress / 4) * 100;

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            🚀 Primeiros Passos
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Seu progresso</span>
            <span className="font-medium">{checklistProgress}/4 completos</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {CHECKLIST_ITEMS.map((item) => {
            const isComplete = completedItems[item.key];
            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                to={item.link}
                onClick={() => !isComplete && completeChecklistItem(item.key)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg transition-all
                  ${isComplete 
                    ? "bg-green-500/10 border border-green-500/20" 
                    : "bg-card hover:bg-accent/50 border border-border"
                  }
                `}
              >
                <div className={`
                  p-2 rounded-full
                  ${isComplete ? "bg-green-500/20" : "bg-muted"}
                `}>
                  <Icon className={`h-4 w-4 ${isComplete ? "text-green-500" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isComplete ? "line-through text-muted-foreground" : ""}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </p>
                </div>
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/30 flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
