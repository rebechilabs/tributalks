import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Clock, 
  Shield, 
  AlertTriangle,
  ChevronRight,
  Pill,
  Sparkles,
  Fuel,
  Wine,
  Car,
  Laptop,
  ArrowRightLeft,
  Building2,
  FileText,
  Gift,
  Microscope,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OpportunityDetailCardProps {
  opportunity: {
    id: string;
    code: string;
    name: string;
    name_simples?: string;
    description?: string;
    description_ceo?: string;
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
    status_lc_224_2025?: string;
    futuro_reforma?: string;
  };
  onViewDetails?: (id: string) => void;
  onImplement?: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  monofasico: <Pill className="h-5 w-5" />,
  combustiveis: <Fuel className="h-5 w-5" />,
  bebidas: <Wine className="h-5 w-5" />,
  cosmeticos: <Sparkles className="h-5 w-5" />,
  autopecas: <Car className="h-5 w-5" />,
  eletronicos: <Laptop className="h-5 w-5" />,
  segregacao: <ArrowRightLeft className="h-5 w-5" />,
  planejamento: <Building2 className="h-5 w-5" />,
  regime_especial: <FileText className="h-5 w-5" />,
  incentivo: <Gift className="h-5 w-5" />,
  pd: <Microscope className="h-5 w-5" />,
  exportacao: <Globe className="h-5 w-5" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  monofasico: 'PIS/COFINS Monofásico',
  segregacao: 'Segregação de Receitas',
  regime_especial: 'Regime Especial',
  planejamento: 'Planejamento Intercompany',
  incentivo: 'Incentivo Fiscal',
  isencao: 'Isenção',
  credito: 'Crédito Tributário',
  exportacao: 'Exportação',
  pd: 'P&D / Inovação',
};

const REFORMA_STATUS: Record<string, { icon: string; label: string; color: string }> = {
  mantido: { icon: '✅', label: 'Mantido', color: 'text-green-600' },
  extinto: { icon: '🔴', label: 'Extinto Gradualmente', color: 'text-red-500' },
  substituido: { icon: '🔄', label: 'Substituído', color: 'text-yellow-600' },
  em_adaptacao: { icon: '⚠️', label: 'Em Adaptação', color: 'text-orange-500' },
  em_analise: { icon: '🔍', label: 'Em Análise', color: 'text-muted-foreground' },
};

const LC_STATUS: Record<string, { icon: string; label: string; color: string }> = {
  protegido: { icon: '🛡️', label: 'Protegido', color: 'text-green-600' },
  afetado: { icon: '⚠️', label: 'Afetado LC 224/2025', color: 'text-yellow-600' },
  critico: { icon: '🚨', label: 'Crítico - Ação Urgente', color: 'text-red-500' },
  neutro: { icon: '➖', label: 'Sem Alteração', color: 'text-muted-foreground' },
};

export function OpportunityDetailCard({ 
  opportunity, 
  onViewDetails, 
  onImplement 
}: OpportunityDetailCardProps) {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCategoryIcon = () => {
    // Check for specific product categories first
    if (opportunity.code?.includes('FARMA') || opportunity.name?.toLowerCase().includes('medicamento')) {
      return <Pill className="h-5 w-5" />;
    }
    if (opportunity.code?.includes('COSM') || opportunity.name?.toLowerCase().includes('cosmético')) {
      return <Sparkles className="h-5 w-5" />;
    }
    if (opportunity.code?.includes('COMB') || opportunity.name?.toLowerCase().includes('combustível')) {
      return <Fuel className="h-5 w-5" />;
    }
    if (opportunity.code?.includes('BEB') || opportunity.name?.toLowerCase().includes('bebida')) {
      return <Wine className="h-5 w-5" />;
    }
    return CATEGORY_ICONS[opportunity.category] || <FileText className="h-5 w-5" />;
  };

  const getRiskInfo = () => {
    switch (opportunity.risco_fiscal) {
      case 'nenhum':
        return { label: 'Nenhum (é seu direito)', color: 'text-green-600', icon: <Shield className="h-4 w-4" /> };
      case 'baixo':
        return { label: 'Baixo', color: 'text-green-500', icon: <Shield className="h-4 w-4" /> };
      case 'medio':
        return { label: 'Moderado', color: 'text-yellow-600', icon: <AlertTriangle className="h-4 w-4" /> };
      case 'alto':
        return { label: 'Alto (requer cuidado)', color: 'text-red-500', icon: <AlertTriangle className="h-4 w-4" /> };
      default:
        return { label: 'Baixo', color: 'text-green-500', icon: <Shield className="h-4 w-4" /> };
    }
  };

  const riskInfo = getRiskInfo();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Header com ícone e valor */}
        <div className="p-5 border-b bg-card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0">
                {getCategoryIcon()}
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-base leading-tight">
                  {opportunity.name_simples || opportunity.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {CATEGORY_LABELS[opportunity.category] || opportunity.category}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-primary">
                {opportunity.economia_anual_min === opportunity.economia_anual_max 
                  ? formatCurrency(opportunity.economia_anual_max)
                  : `${formatCurrency(opportunity.economia_anual_min)} - ${formatCurrency(opportunity.economia_anual_max)}`
                }
              </p>
              <p className="text-xs text-muted-foreground">/ano</p>
            </div>
          </div>
        </div>

        {/* Descrição CEO */}
        <div className="p-5 border-b">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {opportunity.description_ceo || opportunity.description || 
              "Esta oportunidade pode gerar economia significativa para sua empresa."}
          </p>
        </div>

        {/* Match reasons */}
        <div className="p-5 border-b bg-accent/50">
          <p className="text-xs font-medium text-accent-foreground mb-2 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Por que você é elegível:
          </p>
          <ul className="space-y-1">
            {opportunity.match_reasons.slice(0, 3).map((reason, idx) => (
              <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Meta info */}
        <div className="p-5 border-b">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Implementação: <span className="text-foreground font-medium">{opportunity.tempo_implementacao || '2-4 semanas'}</span></span>
            </div>
            <div className={cn("flex items-center gap-1.5", riskInfo.color)}>
              {riskInfo.icon}
              <span className="text-muted-foreground">Risco:</span>
              <span className="font-medium">{riskInfo.label}</span>
            </div>
          </div>
        </div>

        {/* Status 2026 e Reforma */}
        {(opportunity.futuro_reforma || opportunity.status_lc_224_2025) && (
          <div className="p-4 border-b bg-muted/30">
            <div className="flex flex-wrap gap-3 text-xs">
              {opportunity.futuro_reforma && REFORMA_STATUS[opportunity.futuro_reforma] && (
                <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full bg-background border", REFORMA_STATUS[opportunity.futuro_reforma].color)}>
                  <span>{REFORMA_STATUS[opportunity.futuro_reforma].icon}</span>
                  <span>Reforma: {REFORMA_STATUS[opportunity.futuro_reforma].label}</span>
                </div>
              )}
              {opportunity.status_lc_224_2025 && opportunity.status_lc_224_2025 !== 'neutro' && LC_STATUS[opportunity.status_lc_224_2025] && (
                <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full bg-background border", LC_STATUS[opportunity.status_lc_224_2025].color)}>
                  <span>{LC_STATUS[opportunity.status_lc_224_2025].icon}</span>
                  <span>{LC_STATUS[opportunity.status_lc_224_2025].label}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 flex items-center justify-between gap-3 bg-muted/30">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onViewDetails?.(opportunity.id)}
          >
            Ver detalhes
          </Button>
          <Button 
            size="sm"
            className="gap-1.5"
            onClick={() => onImplement?.(opportunity.id)}
          >
            Quero implementar
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
