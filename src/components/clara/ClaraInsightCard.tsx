import { useNavigate } from "react-router-dom";
import { AlertTriangle, Lightbulb, TrendingUp, Shield, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ClaraInsightCardProps {
  id: string;
  insightType: 'alert' | 'recommendation' | 'opportunity' | 'risk';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionCta?: string | null;
  actionRoute?: string | null;
  onDismiss?: (id: string) => void;
  onAction?: (id: string) => void;
  className?: string;
}

const INSIGHT_CONFIG = {
  alert: {
    icon: AlertTriangle,
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-500",
    label: "Alerta",
  },
  recommendation: {
    icon: Lightbulb,
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-500",
    label: "Recomendação",
  },
  opportunity: {
    icon: TrendingUp,
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    iconColor: "text-green-500",
    label: "Oportunidade",
  },
  risk: {
    icon: Shield,
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-500",
    label: "Risco",
  },
};

const PRIORITY_STYLES = {
  low: "opacity-80",
  medium: "",
  high: "ring-2 ring-amber-300 dark:ring-amber-700",
  critical: "ring-2 ring-red-400 dark:ring-red-600 animate-pulse",
};

/**
 * Card de insight proativo da Clara
 * Mostra alertas, recomendações, oportunidades e riscos detectados
 */
export function ClaraInsightCard({
  id,
  insightType,
  priority,
  title,
  description,
  actionCta,
  actionRoute,
  onDismiss,
  onAction,
  className,
}: ClaraInsightCardProps) {
  const navigate = useNavigate();
  const config = INSIGHT_CONFIG[insightType];
  const Icon = config.icon;

  const handleAction = () => {
    if (actionRoute) {
      navigate(actionRoute);
    }
    onAction?.(id);
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-md",
        config.bgColor,
        config.borderColor,
        PRIORITY_STYLES[priority],
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-full bg-background/50", config.iconColor)}>
            <Icon className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-xs font-medium uppercase tracking-wide", config.iconColor)}>
                {config.label}
              </span>
              {priority === 'critical' && (
                <span className="text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">
                  Urgente
                </span>
              )}
            </div>
            
            <h4 className="font-semibold text-sm text-foreground mb-1 line-clamp-1">
              Clara notou: {title}
            </h4>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {description}
            </p>
            
            <div className="flex items-center justify-between gap-2">
              {actionCta && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 gap-1"
                  onClick={handleAction}
                >
                  {actionCta}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 text-muted-foreground hover:text-foreground ml-auto"
                onClick={() => onDismiss?.(id)}
              >
                <X className="h-3 w-3 mr-1" />
                Dispensar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
