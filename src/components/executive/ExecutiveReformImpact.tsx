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
            Como a Reforma impacta seu caixa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Calculator className="w-8 h-8 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Simule na Calculadora da Reforma para ver o impacto real no seu caixa.
            </p>
            <Button asChild size="sm" className="gap-2">
              <Link to="/calculadora/rtc">
                Ir para Calculadora da Reforma
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
          Como a Reforma impacta seu caixa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main message */}
        <p className="text-sm text-muted-foreground">
          Se a Reforma valesse hoje, sua carga sairia de{" "}
          <span className="font-semibold text-foreground">{formatCurrency(data.impostosAtuais)}</span> para{" "}
          <span className="font-semibold text-foreground">{formatCurrency(data.impostosNovos)}</span>{" "}
          <span className={cn("font-semibold", impactColor)}>
            ({formatPercent(data.impactoPercentual)})
          </span>
        </p>

        {/* Profit impact */}
        {data.impactoLucroAnual > 0 && (
          <p className="text-sm text-muted-foreground">
            Impacto estimado no seu lucro anual:{" "}
            <span className={cn("font-semibold", impactColor)}>
              {isPositive ? '+' : '-'}{formatCurrency(data.impactoLucroAnual)}
            </span>
          </p>
        )}

        {/* CTA */}
        <Button asChild variant="outline" size="sm" className="w-full gap-2">
          <Link to="/calculadora/rtc">
            Ver simulação completa
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
