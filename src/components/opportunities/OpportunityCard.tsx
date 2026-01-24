import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  Shield, 
  ChevronRight,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OpportunityCardProps {
  opportunity: {
    id: string;
    code: string;
    name: string;
    description?: string;
    category: string;
    match_score: number;
    match_reasons: string[];
    economia_anual_min: number;
    economia_anual_max: number;
    complexidade: string;
    tempo_implementacao?: string;
    risco_fiscal?: string;
    quick_win: boolean;
    alto_impacto: boolean;
    tributos_afetados: string[];
  };
  onSelect?: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  monofasico: { label: 'Monofásico', color: 'bg-blue-100 text-blue-800' },
  segregacao: { label: 'Segregação', color: 'bg-purple-100 text-purple-800' },
  regime_especial: { label: 'Regime Especial', color: 'bg-green-100 text-green-800' },
  planejamento: { label: 'Planejamento', color: 'bg-orange-100 text-orange-800' },
  incentivo: { label: 'Incentivo Fiscal', color: 'bg-yellow-100 text-yellow-800' },
  isencao: { label: 'Isenção', color: 'bg-teal-100 text-teal-800' },
  credito: { label: 'Crédito Tributário', color: 'bg-indigo-100 text-indigo-800' },
};

const COMPLEXIDADE_LABELS: Record<string, { label: string; color: string }> = {
  muito_baixa: { label: 'Muito Fácil', color: 'text-green-600' },
  baixa: { label: 'Fácil', color: 'text-green-500' },
  media: { label: 'Moderada', color: 'text-yellow-600' },
  alta: { label: 'Complexa', color: 'text-orange-500' },
  muito_alta: { label: 'Muito Complexa', color: 'text-red-500' },
};

export function OpportunityCard({ opportunity, onSelect }: OpportunityCardProps) {
  const category = CATEGORY_LABELS[opportunity.category] || { label: opportunity.category, color: 'bg-gray-100 text-gray-800' };
  const complexidade = COMPLEXIDADE_LABELS[opportunity.complexidade] || { label: opportunity.complexidade, color: 'text-gray-600' };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-lg cursor-pointer border-2",
      opportunity.quick_win && "border-green-200 bg-green-50/30",
      opportunity.alto_impacto && !opportunity.quick_win && "border-amber-200 bg-amber-50/30",
      !opportunity.quick_win && !opportunity.alto_impacto && "border-border hover:border-primary/30"
    )}>
      {/* Badges de destaque */}
      <div className="absolute top-3 right-3 flex gap-1">
        {opportunity.quick_win && (
          <Badge className="bg-green-500 text-white gap-1">
            <Zap className="h-3 w-3" />
            Quick Win
          </Badge>
        )}
        {opportunity.alto_impacto && (
          <Badge className="bg-amber-500 text-white gap-1">
            <TrendingUp className="h-3 w-3" />
            Alto Impacto
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start gap-2 mb-2">
          <Badge className={cn("text-xs", category.color)}>
            {category.label}
          </Badge>
        </div>
        <CardTitle className="text-lg leading-tight pr-24">
          {opportunity.name}
        </CardTitle>
        {opportunity.description && (
          <CardDescription className="line-clamp-2">
            {opportunity.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Economia estimada */}
        <div className="bg-primary/5 rounded-lg p-3">
          <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-primary" />
            Economia Anual Estimada
          </div>
          <div className="text-xl font-bold text-primary">
            {opportunity.economia_anual_min === opportunity.economia_anual_max ? (
              formatCurrency(opportunity.economia_anual_max)
            ) : (
              <>
                {formatCurrency(opportunity.economia_anual_min)} - {formatCurrency(opportunity.economia_anual_max)}
              </>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Complexidade</span>
            <span className={cn("font-medium", complexidade.color)}>
              {complexidade.label}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Tempo</span>
            <span className="font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {opportunity.tempo_implementacao || 'Variável'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Risco</span>
            <span className={cn(
              "font-medium flex items-center gap-1",
              opportunity.risco_fiscal === 'nenhum' && "text-green-600",
              opportunity.risco_fiscal === 'baixo' && "text-green-500",
              opportunity.risco_fiscal === 'medio' && "text-yellow-600",
              opportunity.risco_fiscal === 'alto' && "text-red-500"
            )}>
              {opportunity.risco_fiscal === 'nenhum' && <Shield className="h-3 w-3" />}
              {opportunity.risco_fiscal === 'alto' && <AlertTriangle className="h-3 w-3" />}
              {opportunity.risco_fiscal === 'nenhum' ? 'Nenhum' : 
               opportunity.risco_fiscal?.charAt(0).toUpperCase() + opportunity.risco_fiscal?.slice(1)}
            </span>
          </div>
        </div>

        {/* Tributos afetados */}
        <div className="flex flex-wrap gap-1">
          {opportunity.tributos_afetados?.map((tributo) => (
            <Badge key={tributo} variant="outline" className="text-xs">
              {tributo}
            </Badge>
          ))}
        </div>

        {/* Match score indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${opportunity.match_score}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {opportunity.match_score}% match
            </span>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="gap-1"
            onClick={() => onSelect?.(opportunity.id)}
          >
            Ver mais
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
