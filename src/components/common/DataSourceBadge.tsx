import { Badge } from '@/components/ui/badge';

interface DataSourceBadgeProps {
  origem: string | null | undefined;
  className?: string;
}

const BADGE_CONFIG: Record<string, { emoji: string; label: string }> = {
  dre: { emoji: '📊', label: 'Importado da DRE' },
  manual: { emoji: '👤', label: 'Do cadastro' },
  erp: { emoji: '🔗', label: 'Do ERP' },
};

export function DataSourceBadge({ origem, className }: DataSourceBadgeProps) {
  if (!origem) return null;
  const config = BADGE_CONFIG[origem];
  if (!config) return null;

  return (
    <Badge
      variant="outline"
      className={`text-yellow-500 border-yellow-500/50 bg-yellow-500/10 text-[10px] px-1.5 py-0 font-normal ${className ?? ''}`}
    >
      {config.emoji} {config.label}
    </Badge>
  );
}
