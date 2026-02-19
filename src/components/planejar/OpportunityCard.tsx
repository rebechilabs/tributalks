import { Zap, TrendingUp, ArrowUpRight, ArrowRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface OpportunityData {
  id?: string;
  name: string;
  description?: string;
  economia_anual_min: number;
  economia_anual_max: number;
  economia_percentual_min?: number | null;
  economia_percentual_max?: number | null;
  impact_label?: 'alto' | 'medio' | 'baixo';
  impact_basis?: 'economia_percentual' | 'proxy';
  complexidade?: string;
  alto_impacto?: boolean;
  quick_win?: boolean;
  futuro_reforma?: string;
  descricao_reforma?: string;
  status_lc_224_2025?: string;
  descricao_lc_224_2025?: string;
  is_fallback?: boolean;
  // Extended fields for Dossiê Tributário
  match_reasons?: string[];
  match_score?: number;
  category?: string;
  subcategory?: string;
  base_legal?: string;
  base_legal_resumo?: string;
  tributos_afetados?: string[];
  tempo_implementacao?: string;
  tempo_retorno?: string;
  risco_fiscal?: string;
  risco_descricao?: string;
  requer_contador?: boolean;
  requer_advogado?: boolean;
  missing_criteria?: string[];
  urgency?: string;
}

const complexidadeConfig: Record<string, { label: string; className: string }> = {
  muito_baixa: { label: 'Muito Baixa', className: 'bg-emerald-500/20 text-emerald-400' },
  baixa: { label: 'Baixa', className: 'bg-emerald-500/20 text-emerald-400' },
  media: { label: 'Média', className: 'bg-amber-500/20 text-amber-400' },
  alta: { label: 'Alta', className: 'bg-red-500/20 text-red-400' },
  muito_alta: { label: 'Muito Alta', className: 'bg-red-500/20 text-red-400' },
};

const impactLabelConfig: Record<string, { label: string; className: string }> = {
  alto: { label: 'Impacto Alto', className: 'bg-emerald-500/20 text-emerald-400' },
  medio: { label: 'Impacto Médio', className: 'bg-amber-500/20 text-amber-400' },
  baixo: { label: 'Impacto Baixo', className: 'bg-muted text-muted-foreground' },
};

export function getImpactLine(opp: OpportunityData) {
  const hasPct =
    opp.economia_percentual_min != null &&
    opp.economia_percentual_max != null &&
    (opp.economia_percentual_min > 0 || opp.economia_percentual_max > 0);

  if (hasPct) {
    return {
      text: `${opp.economia_percentual_min}%–${opp.economia_percentual_max}% de economia`,
      badge: null,
      isPercentual: true,
    };
  }

  const label = opp.impact_label ?? (opp.alto_impacto ? 'alto' : 'medio');
  const config = impactLabelConfig[label] || impactLabelConfig.medio;
  return {
    text: config.label,
    badge: 'estimativa',
    isPercentual: false,
    badgeClassName: config.className,
  };
}

interface OpportunityCardProps {
  opp: OpportunityData;
  onClick?: () => void;
}

export function OpportunityCard({ opp, onClick }: OpportunityCardProps) {
  const comp = complexidadeConfig[opp.complexidade || 'media'] || complexidadeConfig.media;
  const hasReforma = !!(opp.futuro_reforma || opp.status_lc_224_2025);
  const reformaText = opp.descricao_reforma || opp.descricao_lc_224_2025;
  const impact = getImpactLine(opp);

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-5 space-y-3 hover:border-primary/30 transition-colors",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground text-sm leading-tight">{opp.name}</h3>
        <div className="flex gap-1.5 shrink-0">
          {opp.urgency === 'alta' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">
              <AlertTriangle className="w-3 h-3" /> URGENTE
            </span>
          )}
          {opp.alto_impacto && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/20 text-primary">
              <TrendingUp className="w-3 h-3" /> Alto
            </span>
          )}
          <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", comp.className)}>
            {comp.label}
          </span>
        </div>
      </div>

      {opp.description && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{opp.description}</p>
      )}

      <div className="flex items-center gap-1.5 text-sm">
        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
        <span className="font-semibold text-emerald-400">
          {impact.text}
        </span>
        {impact.isPercentual && (
          <span className="text-muted-foreground text-xs">/ano</span>
        )}
        {impact.badge && (
          <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full ml-1", impact.badgeClassName)}>
            {impact.badge}
          </span>
        )}
      </div>

      {hasReforma && (
        <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3 space-y-1">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-semibold text-violet-400">Reforma 2026</span>
          </div>
          {reformaText && (
            <p className="text-[11px] text-violet-300/80 leading-relaxed">{reformaText}</p>
          )}
        </div>
      )}

      {onClick && (
        <Button variant="ghost" size="sm" className="w-full text-xs text-primary hover:text-primary" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          Ver detalhes <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      )}
    </div>
  );
}
