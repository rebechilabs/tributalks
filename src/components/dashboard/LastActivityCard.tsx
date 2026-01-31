import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ArrowRight, Trophy, FileText, BarChart3, Lightbulb, Workflow, Calculator } from "lucide-react";
import { formatDistanceBrasilia } from "@/lib/dateUtils";
import type { UserProgressData } from "@/hooks/useDashboardData";

interface LastActivityCardProps {
  progress: UserProgressData;
}

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  score: Trophy,
  xml: FileText,
  dre: BarChart3,
  opportunity: Lightbulb,
  workflow: Workflow,
  simulation: Calculator,
};

const ACTIVITY_LABELS: Record<string, string> = {
  score: 'Score Tributário',
  xml: 'Importação de XMLs',
  dre: 'DRE Inteligente',
  opportunity: 'Oportunidades',
  workflow: 'Workflows',
  simulation: 'Simulação',
};

export function LastActivityCard({ progress }: LastActivityCardProps) {

  const { lastActivity } = progress;

  // No activity yet
  if (!lastActivity.type || !lastActivity.date) {
    return null;
  }

  const Icon = ACTIVITY_ICONS[lastActivity.type] || Clock;
  const label = ACTIVITY_LABELS[lastActivity.type] || 'Atividade';

  return (
    <Card className="border-border/50 mb-6 hover:shadow-sm transition-shadow">
      <CardContent className="pt-4 pb-4">
        <Link to={lastActivity.link || '/dashboard'} className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
              <Clock className="w-3 h-3" />
              <span>Última atividade</span>
              <span>•</span>
              <span>{formatDistanceBrasilia(lastActivity.date)}</span>
            </div>
            <p className="text-sm font-medium text-foreground truncate">
              {label}: {lastActivity.description}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </Link>
      </CardContent>
    </Card>
  );
}
