import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Pill, 
  ArrowRightLeft, 
  Building2, 
  FileText, 
  Gift,
  BarChart3
} from "lucide-react";

interface CategorySummary {
  count: number;
  economia_min: number;
  economia_max: number;
}

interface TributoSummary {
  count: number;
  economia_min: number;
  economia_max: number;
}

interface OpportunitySummaryProps {
  byCategory: Record<string, CategorySummary>;
  byTributo: Record<string, TributoSummary>;
  totalMax: number;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  monofasico: { label: 'Produtos Monofásicos', icon: <Pill className="h-4 w-4" /> },
  segregacao: { label: 'Segregação', icon: <ArrowRightLeft className="h-4 w-4" /> },
  planejamento: { label: 'Planejamento Grupo', icon: <Building2 className="h-4 w-4" /> },
  regime_especial: { label: 'Regimes Especiais', icon: <FileText className="h-4 w-4" /> },
  incentivo: { label: 'Incentivos', icon: <Gift className="h-4 w-4" /> },
  credito: { label: 'Créditos', icon: <BarChart3 className="h-4 w-4" /> },
};

const TRIBUTO_COLORS: Record<string, string> = {
  'PIS': 'bg-primary',
  'COFINS': 'bg-primary/80',
  'PIS/COFINS': 'bg-primary',
  'ICMS': 'bg-secondary-foreground',
  'IRPJ': 'bg-accent-foreground',
  'CSLL': 'bg-accent-foreground/80',
  'IRPJ/CSLL': 'bg-accent-foreground',
  'ISS': 'bg-muted-foreground',
  'IPI': 'bg-destructive',
};

export function OpportunitySummary({ byCategory, byTributo, totalMax }: OpportunitySummaryProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };

  // Sort categories by economia_max
  const sortedCategories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b.economia_max - a.economia_max)
    .slice(0, 5);

  // Sort tributos by economia_max
  const sortedTributos = Object.entries(byTributo)
    .sort(([, a], [, b]) => b.economia_max - a.economia_max)
    .slice(0, 5);

  // Find max for percentage calculation
  const maxTributoValue = sortedTributos.length > 0 
    ? Math.max(...sortedTributos.map(([, t]) => t.economia_max))
    : 1;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Resumo das Oportunidades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Por tipo */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Por tipo:</h4>
          <div className="space-y-2.5">
            {sortedCategories.map(([category, data]) => {
              const config = CATEGORY_CONFIG[category] || { 
                label: category.charAt(0).toUpperCase() + category.slice(1), 
                icon: <FileText className="h-4 w-4" /> 
              };
              return (
                <div key={category} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    <span className="text-muted-foreground shrink-0">{config.icon}</span>
                    <span className="truncate">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-medium text-sm">
                      {formatCurrency(data.economia_max)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({data.count} {data.count === 1 ? 'item' : 'itens'})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Por tributo */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Por tributo:</h4>
          <div className="space-y-3">
            {sortedTributos.map(([tributo, data]) => {
              const percentage = (data.economia_max / maxTributoValue) * 100;
              const colorClass = TRIBUTO_COLORS[tributo] || 'bg-primary';
              
              return (
                <div key={tributo} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{tributo}</span>
                    <span className="text-muted-foreground">{formatCurrency(data.economia_max)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${colorClass}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
