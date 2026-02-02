import { useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useClaraInsights } from "@/hooks/useClaraMemory";
import { ClaraInsightCard } from "./ClaraInsightCard";
import { cn } from "@/lib/utils";

interface ClaraInsightsPanelProps {
  maxInsights?: number;
  className?: string;
}

/**
 * Painel de insights proativos da Clara
 * Exibe cards com alertas, recomendações e oportunidades detectadas
 */
export function ClaraInsightsPanel({ maxInsights = 3, className }: ClaraInsightsPanelProps) {
  const { insights, loading, fetchActiveInsights, dismissInsight, markInsightActed } = useClaraInsights();

  useEffect(() => {
    fetchActiveInsights();
  }, [fetchActiveInsights]);

  // Não mostra nada se não houver insights
  if (!loading && insights.length === 0) {
    return null;
  }

  const displayedInsights = insights.slice(0, maxInsights);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>Clara notou algo importante</span>
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
      </div>
      
      <div className="space-y-2">
        {displayedInsights.map((insight) => (
          <ClaraInsightCard
            key={insight.id}
            id={insight.id}
            insightType={insight.insight_type as 'alert' | 'recommendation' | 'opportunity' | 'risk'}
            priority={insight.priority as 'low' | 'medium' | 'high' | 'critical'}
            title={insight.title}
            description={insight.description}
            actionCta={insight.action_cta}
            actionRoute={insight.action_route}
            onDismiss={dismissInsight}
            onAction={markInsightActed}
          />
        ))}
      </div>
      
      {insights.length > maxInsights && (
        <p className="text-xs text-muted-foreground text-center">
          +{insights.length - maxInsights} insight{insights.length - maxInsights !== 1 ? 's' : ''} disponíve{insights.length - maxInsights !== 1 ? 'is' : 'l'}
        </p>
      )}
    </div>
  );
}
