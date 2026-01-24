import { Scale, TrendingUp, TrendingDown, ArrowRight, Info, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReformImpactData } from "@/hooks/useExecutiveData";

interface ExecutiveReformImpactProps {
  data: ReformImpactData | null;
  loading?: boolean;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return `R$ ${value.toFixed(0)}`;
}

function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function ExecutiveReformImpact({ data, loading }: ExecutiveReformImpactProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
    );
  }

  // No data or reform not calculated yet
  if (!data || !data.hasData) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Impacto da Reforma Tributária
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Calculator className="w-8 h-8 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              Simule o impacto da Reforma na sua empresa
            </p>
            <p className="text-xs text-muted-foreground/70 mb-4">
              Faça uma simulação na Calculadora RTC para ver como CBS/IBS afetarão seus produtos e serviços.
            </p>
            <Button asChild size="sm" className="gap-2">
              <Link to="/calculadora/rtc">
                Simular Reforma
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = data.impactoPercentual < 0; // Negative impact = less taxes = positive for company
  const TrendIcon = isPositive ? TrendingDown : TrendingUp;
  const impactColor = isPositive ? 'text-emerald-600' : 'text-red-600';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          Impacto da Reforma Tributária
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tax variation */}
        <div className="flex items-center gap-2 text-sm">
          <TrendIcon className={cn("w-4 h-4", impactColor)} />
          <span className="text-muted-foreground">Variação da carga:</span>
          <span className={cn("font-semibold", impactColor)}>
            {formatPercent(data.impactoPercentual)}
          </span>
        </div>

        {/* Values comparison */}
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Hoje</p>
            <p className="text-lg font-semibold mt-1">
              {formatCurrency(data.impostosAtuais)}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Com Reforma</p>
            <p className="text-lg font-semibold mt-1">
              {formatCurrency(data.impostosNovos)}
            </p>
          </div>
        </div>

        {/* Profit impact */}
        {data.impactoLucroAnual > 0 && (
          <p className="text-sm text-muted-foreground">
            Impacto estimado no lucro anual:{" "}
            <span className={cn("font-semibold", impactColor)}>
              {isPositive ? '+' : '-'}{formatCurrency(data.impactoLucroAnual)}
            </span>
          </p>
        )}

        {/* CTA */}
        <Button asChild variant="outline" size="sm" className="w-full gap-2">
          <Link to="/calculadora/rtc">
            Ver detalhes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
