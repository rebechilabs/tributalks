import { Badge } from '@/components/ui/badge';
import { BarChart3, User, Link, type LucideIcon } from 'lucide-react';

interface DataSourceBadgeProps {
  origem: string | null | undefined;
  className?: string;
}

const BADGE_CONFIG: Record<string, { icon: LucideIcon; label: string }> = {
  dre: { icon: BarChart3, label: 'Importado da DRE' },
  manual: { icon: User, label: 'Do cadastro' },
  erp: { icon: Link, label: 'Do ERP' },
};

export function DataSourceBadge({ origem, className }: DataSourceBadgeProps) {
  if (!origem) return null;
  const config = BADGE_CONFIG[origem];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`text-yellow-500 border-yellow-500/50 bg-yellow-500/10 text-[10px] px-1.5 py-0 font-normal ${className ?? ''}`}
    >
      <Icon className="w-3 h-3 mr-0.5" />
      {config.label}
    </Badge>
  );
}
