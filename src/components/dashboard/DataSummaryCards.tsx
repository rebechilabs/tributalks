import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Coins, FileText, Workflow, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserProgressData } from "@/hooks/useDashboardData";

interface DataSummaryCardsProps {
  progress: UserProgressData;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getScoreColor(grade: string | null): string {
  if (!grade) return 'text-muted-foreground';
  const gradeUpper = grade.toUpperCase();
  if (['A+', 'A', 'B'].includes(gradeUpper)) return 'text-emerald-600';
  if (gradeUpper === 'C') return 'text-amber-600';
  return 'text-red-600';
}

export function DataSummaryCards({ progress }: DataSummaryCardsProps) {

  const cards = [
    {
      label: 'Score',
      value: progress.scoreGrade || '—',
      subValue: progress.scoreTotal ? `${progress.scoreTotal} pts` : null,
      icon: Trophy,
      href: '/dashboard/score-tributario',
      hasData: progress.hasScore,
      colorClass: getScoreColor(progress.scoreGrade),
      bgClass: progress.hasScore ? 'bg-primary/10' : 'bg-muted',
      iconClass: progress.hasScore ? 'text-primary' : 'text-muted-foreground',
    },
    {
      label: 'Créditos',
      value: progress.creditsTotal > 0 ? formatCurrency(progress.creditsTotal) : '—',
      subValue: progress.xmlCount > 0 ? `${progress.xmlCount} XMLs` : null,
      icon: Coins,
      href: '/dashboard/analise-notas',
      hasData: progress.creditsTotal > 0,
      colorClass: progress.creditsTotal > 0 ? 'text-emerald-600' : 'text-muted-foreground',
      bgClass: progress.hasXmls ? 'bg-emerald-500/10' : 'bg-muted',
      iconClass: progress.hasXmls ? 'text-emerald-600' : 'text-muted-foreground',
    },
    {
      label: 'XMLs',
      value: progress.xmlCount > 0 ? progress.xmlCount.toString() : '—',
      subValue: 'notas fiscais',
      icon: FileText,
      href: '/dashboard/analise-notas',
      hasData: progress.hasXmls,
      colorClass: progress.hasXmls ? 'text-blue-600' : 'text-muted-foreground',
      bgClass: progress.hasXmls ? 'bg-blue-500/10' : 'bg-muted',
      iconClass: progress.hasXmls ? 'text-blue-600' : 'text-muted-foreground',
    },
    {
      label: 'Workflows',
      value: progress.workflowsCompleted > 0 ? progress.workflowsCompleted.toString() : '—',
      subValue: progress.workflowsInProgress > 0 ? `${progress.workflowsInProgress} em andamento` : 'completos',
      icon: Workflow,
      href: '/dashboard/workflows',
      hasData: progress.workflowsCompleted > 0 || progress.workflowsInProgress > 0,
      colorClass: progress.workflowsCompleted > 0 ? 'text-purple-600' : 'text-muted-foreground',
      bgClass: progress.hasWorkflow ? 'bg-purple-500/10' : 'bg-muted',
      iconClass: progress.hasWorkflow ? 'text-purple-600' : 'text-muted-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        
        return (
          <Link key={card.label} to={card.href}>
            <Card className={cn(
              "border-border/50 transition-all hover:shadow-md hover:border-primary/30 cursor-pointer h-full",
              !card.hasData && "opacity-70"
            )}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", card.bgClass)}>
                    <Icon className={cn("w-5 h-5", card.iconClass)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{card.label}</p>
                    <p className={cn("text-xl font-bold truncate", card.colorClass)}>{card.value}</p>
                    {card.subValue && (
                      <p className="text-xs text-muted-foreground truncate">{card.subValue}</p>
                    )}
                  </div>
                </div>
                {!card.hasData && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                    <span>Iniciar</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
