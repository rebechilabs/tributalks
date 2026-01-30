import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface NexusInsightCardProps {
  type: 'opportunity' | 'alert' | 'critical';
  icon: string;
  message: string;
  action: {
    label: string;
    href: string;
  };
  animationDelay?: number;
}

const typeStyles = {
  opportunity: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'bg-emerald-100 dark:bg-emerald-900/50',
    button: 'text-emerald-700 hover:text-emerald-800 dark:text-emerald-400',
  },
  alert: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'bg-amber-100 dark:bg-amber-900/50',
    button: 'text-amber-700 hover:text-amber-800 dark:text-amber-400',
  },
  critical: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    icon: 'bg-red-100 dark:bg-red-900/50',
    button: 'text-red-700 hover:text-red-800 dark:text-red-400',
  },
};

export function NexusInsightCard({
  type,
  icon,
  message,
  action,
  animationDelay = 0,
}: NexusInsightCardProps) {
  const styles = typeStyles[type];

  return (
    <Card
      className={cn(
        'p-4 flex items-start gap-3 border transition-all duration-300 hover:shadow-md',
        styles.bg,
        styles.border
      )}
      style={{
        animationDelay: `${animationDelay}ms`,
        animation: 'fadeInUp 0.5s ease-out forwards',
        opacity: 0,
      }}
    >
      {/* Icon */}
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0', styles.icon)}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-relaxed">{message}</p>
        <Button
          asChild
          variant="link"
          className={cn('h-auto p-0 mt-2 text-sm font-medium', styles.button)}
        >
          <Link to={action.href}>
            {action.label}
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
