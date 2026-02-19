import { Zap, TrendingUp, ArrowUpRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OpportunityData {
  id?: string;
  name: string;
  description?: string;
  economia_anual_min: number;
  economia_anual_max: number;
  complexidade?: string;
  alto_impacto?: boolean;
  quick_win?: boolean;
  futuro_reforma?: string;
  descricao_reforma?: string;
  status_lc_224_2025?: string;
  descricao_lc_224_2025?: string;
  is_fallback?: boolean;
}

const complexidadeConfig: Record<string, { label: string; className: string }> = {
  muito_baixa: { label: 'Muito Baixa', className: 'bg-emerald-500/20 text-emerald-400' },
  baixa: { label: 'Baixa', className: 'bg-emerald-500/20 text-emerald-400' },
  media: { label: 'Média', className: 'bg-amber-500/20 text-amber-400' },
  alta: { label: 'Alta', className: 'bg-red-500/20 text-red-400' },
  muito_alta: { label: 'Muito Alta', className: 'bg-red-500/20 text-red-400' },
};

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

export function OpportunityCard({ opp }: { opp: OpportunityData }) {
  const comp = complexidadeConfig[opp.complexidade || 'media'] || complexidadeConfig.media;
  const hasReforma = !!(opp.futuro_reforma || opp.status_lc_224_2025);
  const reformaText = opp.descricao_reforma || opp.descricao_lc_224_2025;

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground text-sm leading-tight">{opp.name}</h3>
        <div className="flex gap-1.5 shrink-0">
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
          {formatCurrency(opp.economia_anual_min)} — {formatCurrency(opp.economia_anual_max)}
        </span>
        <span className="text-muted-foreground text-xs">/ano</span>
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

    </div>
  );
}
