import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceComparisonProps {
  precoAtual: number;
  preco2027: number;
  regimeAtual: {
    pisCofins: number;
    icms: number;
  };
  regime2027: {
    cbs: number;
    ibsUf: number;
    ibsMun: number;
    is: number;
  };
  margem: number;
  fonte: 'api_rtc' | 'manual' | 'estimativa';
  ncm?: string;
}

export function PriceComparisonCard({
  precoAtual,
  preco2027,
  regimeAtual,
  regime2027,
  margem,
  fonte,
  ncm
}: PriceComparisonProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  const variacaoPreco = ((preco2027 - precoAtual) / precoAtual) * 100;
  const cargaAtual = regimeAtual.pisCofins + regimeAtual.icms;
  const carga2027 = regime2027.cbs + regime2027.ibsUf + regime2027.ibsMun + regime2027.is;

  const getFonteBadge = () => {
    switch (fonte) {
      case 'api_rtc':
        return (
          <Badge variant="default" className="bg-success text-success-foreground gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Alíquotas Oficiais
          </Badge>
        );
      case 'manual':
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            Alíquotas Manuais
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            Alíquotas Estimadas
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with source badge */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Comparativo: Regime Atual vs 2027+
        </h4>
        {getFonteBadge()}
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Regime Atual */}
        <Card className="border-border bg-muted/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-semibold text-foreground">Regime Atual</h5>
              <Badge variant="outline" className="text-xs">PIS/COFINS + ICMS</Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preço de Venda</span>
                <span className="font-medium">{formatCurrency(precoAtual)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PIS/COFINS</span>
                <span className="font-medium">{formatPercent(regimeAtual.pisCofins)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ICMS</span>
                <span className="font-medium">{formatPercent(regimeAtual.icms)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Carga Tributária</span>
                <span>~{formatPercent(cargaAtual)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Margem</span>
                <span className="font-medium">{formatPercent(margem)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2027+ CBS/IBS */}
        <Card className={cn(
          "border-primary/50",
          fonte === 'api_rtc' ? "bg-primary/5" : "bg-card"
        )}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-semibold text-primary">2027+ (CBS/IBS Pleno)</h5>
              <Badge variant="default" className="text-xs">Reforma</Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preço Necessário</span>
                <span className="font-bold text-primary text-base">{formatCurrency(preco2027)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CBS</span>
                <span className="font-medium">{formatPercent(regime2027.cbs)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IBS (UF + Mun)</span>
                <span className="font-medium">{formatPercent(regime2027.ibsUf + regime2027.ibsMun)}</span>
              </div>
              {regime2027.is > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IS</span>
                  <span className="font-medium">{formatPercent(regime2027.is)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Carga Tributária</span>
                <span className="text-primary">{formatPercent(carga2027)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Margem</span>
                <span className="font-medium text-success flex items-center gap-1">
                  {formatPercent(margem)}
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-xs">protegida</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Variation Summary */}
      <div className={cn(
        "p-4 rounded-lg border flex items-center justify-between flex-wrap gap-3",
        variacaoPreco > 10 ? "bg-warning/10 border-warning/30" : 
        variacaoPreco > 0 ? "bg-primary/5 border-primary/20" : 
        "bg-success/10 border-success/30"
      )}>
        <div className="flex items-center gap-3">
          <ArrowRight className={cn(
            "w-5 h-5",
            variacaoPreco > 10 ? "text-warning" : 
            variacaoPreco > 0 ? "text-primary" : 
            "text-success"
          )} />
          <div>
            <p className="text-sm text-muted-foreground">Variação de Preço Necessária</p>
            <p className={cn(
              "text-xl font-bold",
              variacaoPreco > 10 ? "text-warning" : 
              variacaoPreco > 0 ? "text-primary" : 
              "text-success"
            )}>
              {variacaoPreco >= 0 ? '+' : ''}{variacaoPreco.toFixed(1)}%
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Para manter margem de</p>
          <p className="text-lg font-semibold text-foreground">{formatPercent(margem)}</p>
        </div>
      </div>

      {/* Source Info */}
      {fonte === 'api_rtc' && ncm && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-success/5 border border-success/20 text-sm">
          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
          <p className="text-muted-foreground">
            Alíquotas da <strong>Receita Federal</strong> para NCM {ncm}
            <a 
              href="https://piloto-cbs.tributos.gov.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 ml-2 text-primary hover:underline"
            >
              piloto-cbs.tributos.gov.br
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
