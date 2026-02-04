import { Link } from "react-router-dom";
import { CheckCircle2, Circle, AlertTriangle, ArrowRight, LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ToolStatus = 'completed' | 'pending' | 'attention';

export interface ModuleToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  status: ToolStatus;
  stepNumber?: number;
  badge?: string;
}

const statusConfig: Record<ToolStatus, { icon: LucideIcon; color: string; label: string }> = {
  completed: {
    icon: CheckCircle2,
    color: 'text-green-500',
    label: 'Concluído',
  },
  pending: {
    icon: Circle,
    color: 'text-muted-foreground',
    label: 'Pendente',
  },
  attention: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    label: 'Requer atenção',
  },
};

export function ModuleToolCard({
  title,
  description,
  href,
  icon: Icon,
  status,
  stepNumber,
  badge,
}: ModuleToolCardProps) {
  const StatusIcon = statusConfig[status].icon;
  const statusColor = statusConfig[status].color;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 group",
      status === 'completed' && "border-green-500/30 bg-green-500/5"
    )}>
      {/* Step number badge */}
      {stepNumber && (
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="text-xs font-bold">
            {stepNumber}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            status === 'completed' ? "bg-green-500/20" : "bg-primary/10"
          )}>
            <Icon className={cn(
              "w-5 h-5",
              status === 'completed' ? "text-green-500" : "text-primary"
            )} />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              {title}
              {badge && (
                <Badge variant="default" className="text-xs">
                  {badge}
                </Badge>
              )}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm">
          {description}
        </CardDescription>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <StatusIcon className={cn("w-4 h-4", statusColor)} />
          <span className={cn("text-xs", statusColor)}>
            {statusConfig[status].label}
          </span>
        </div>

        <Button asChild variant="default" className="w-full group-hover:bg-primary">
          <Link to={href} className="flex items-center gap-2">
            Acessar
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
