import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, TrendingDown, TrendingUp, Target, ArrowRight } from "lucide-react";
import { MarginImpactCard } from "./MarginImpactCard";
import { ActionPriorityList } from "./ActionPriorityList";
import { useMarginDashboard } from "@/hooks/useMarginDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export function MarginExecutiveTab() {
  const { data, loading, refetch } = useMarginDashboard();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Impacto Consolidado no EBITDA</h2>
          <p className="text-sm text-muted-foreground">
            Visão executiva do impacto da Reforma na margem
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Download className="w-4 h-4 mr-2" />
            PDF Executivo
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OMC-AI Summary */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-base">Vazamento de Margem</CardTitle>
                <CardDescription>OMC-AI - Compras</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Gap de Crédito Total</span>
                {loading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <span className="text-lg font-bold text-destructive">
                    {formatCurrency(data?.gapCreditoTotal || 0)}/ano
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Fornecedores Críticos</span>
                {loading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <span className="font-semibold">{data?.fornecedoresCriticos || 0}</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Economia Potencial</span>
                {loading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <span className="font-semibold text-success">
                    {formatCurrency(data?.economiaPotencialRenegociacao || 0)}/ano
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PriceGuard Summary */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-warning" />
              </div>
              <div>
                <CardTitle className="text-base">Proteção de Margem</CardTitle>
                <CardDescription>PriceGuard - Vendas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Variação Média de Preço</span>
                {loading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <span className="text-lg font-bold text-warning">
                    {formatPercent(data?.variacaoMediaPreco || 0)}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">SKUs em Risco Competitivo</span>
                {loading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <span className="font-semibold">{data?.skusEmRisco || 0}</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Risco de Perda de Margem</span>
                {loading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <span className="font-semibold text-destructive">
                    {formatCurrency(data?.riscoPerdaMargem || 0)}/ano
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* EBITDA Impact Card */}
      <MarginImpactCard 
        impactoMin={data?.impactoEbitdaAnualMin || 0}
        impactoMax={data?.impactoEbitdaAnualMax || 0}
        loading={loading}
      />

      {/* Action Priority List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Ações Priorizadas</CardTitle>
          </div>
          <CardDescription>
            Próximos passos para proteger sua margem na transição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActionPriorityList />
        </CardContent>
      </Card>
    </div>
  );
}
