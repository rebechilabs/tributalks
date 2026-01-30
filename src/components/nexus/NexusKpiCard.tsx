import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus, Info, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface NexusKpiCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  formattedValue?: string;
  variation?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    label?: string;
  };
  status: 'success' | 'warning' | 'danger';
  tooltip: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
  animationDelay?: number;
}

const statusColors = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

const statusBgColors = {
  success: 'bg-emerald-50 dark:bg-emerald-950/30',
  warning: 'bg-amber-50 dark:bg-amber-950/30',
  danger: 'bg-red-50 dark:bg-red-950/30',
};

const statusBorderColors = {
  success: 'border-emerald-200 dark:border-emerald-800',
  warning: 'border-amber-200 dark:border-amber-800',
  danger: 'border-red-200 dark:border-red-800',
};

export function NexusKpiCard({
  icon,
  title,
  value,
  formattedValue,
  variation,
  status,
  tooltip,
  action,
  className,
  animationDelay = 0,
}: NexusKpiCardProps) {
  const VariationIcon = variation?.direction === 'up' 
    ? ArrowUp 
    : variation?.direction === 'down' 
      ? ArrowDown 
      : Minus;

  const variationColor = variation?.direction === 'up'
    ? 'text-emerald-600 dark:text-emerald-400'
    : variation?.direction === 'down'
      ? 'text-red-600 dark:text-red-400'
      : 'text-muted-foreground';

  return (
    <Card
      className={cn(
        'relative p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border',
        statusBgColors[status],
        statusBorderColors[status],
        className
      )}
      style={{
        animationDelay: `${animationDelay}ms`,
        animation: 'fadeInUp 0.5s ease-out forwards',
        opacity: 0,
      }}
    >
      {/* Status indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className={cn('w-2.5 h-2.5 rounded-full', statusColors[status])} />
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Info className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-sm">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Icon and Title */}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-primary">{icon}</div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>

      {/* Value */}
      <div className="mb-2">
        <span className="text-2xl lg:text-3xl font-bold text-foreground">
          {formattedValue || value}
        </span>
      </div>

      {/* Variation */}
      {variation && (
        <div className={cn('flex items-center gap-1 text-xs', variationColor)}>
          <VariationIcon className="w-3 h-3" />
          <span className="font-medium">{variation.value}</span>
          {variation.label && (
            <span className="text-muted-foreground ml-1">{variation.label}</span>
          )}
        </div>
      )}

      {/* Action Button */}
      {action && (
        <div className="mt-4">
          {action.href ? (
            <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Link to={action.href}>
                {action.label}
                <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={action.onClick}
            >
              {action.label}
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
