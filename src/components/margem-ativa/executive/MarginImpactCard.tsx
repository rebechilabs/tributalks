import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp, ArrowRight } from "lucide-react";

interface MarginImpactCardProps {
  impactoMin: number;
  impactoMax: number;
  loading: boolean;
}

export function MarginImpactCard({ impactoMin, impactoMax, loading }: MarginImpactCardProps) {
  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(absValue);
    return value < 0 ? `-${formatted}` : `+${formatted}`;
  };

  const delta = impactoMax - impactoMin;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Impacto Líquido no EBITDA 2026</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pessimista */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-3">
              <TrendingDown className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Cenário Pessimista</p>
            <p className="text-xs text-muted-foreground mb-2">(sem ações)</p>
            {loading ? (
              <Skeleton className="h-8 w-32 mx-auto" />
            ) : (
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(impactoMin)}
              </p>
            )}
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center">
            <ArrowRight className="w-8 h-8 text-muted-foreground" />
          </div>

          {/* Otimista */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-3">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Cenário Otimista</p>
            <p className="text-xs text-muted-foreground mb-2">(ações implementadas)</p>
            {loading ? (
              <Skeleton className="h-8 w-32 mx-auto" />
            ) : (
              <p className="text-2xl font-bold text-success">
                {formatCurrency(impactoMax)}
              </p>
            )}
          </div>
        </div>

        {/* Delta */}
        <div className="pt-4 border-t border-primary/20">
          <div className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground">Valor Capturável:</span>
            {loading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <span className="text-xl font-bold text-primary">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 0,
                }).format(delta)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
