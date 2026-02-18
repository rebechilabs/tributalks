import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarginDashboard } from "@/hooks/useMarginDashboard";

export function MargemAtivaHeader() {
  const { data, loading } = useMarginDashboard();

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

  const kpis = [
    {
      title: "Vazamento de Crédito",
      value: data?.gapCreditoTotal || 0,
      format: "currency",
      suffix: "/ano",
      icon: TrendingDown,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      description: "Gap identificado em fornecedores"
    },
    {
      title: "Variação de Preço",
      value: data?.variacaoMediaPreco || 0,
      format: "percent",
      suffix: " médio",
      icon: TrendingUp,
      color: "text-warning",
      bgColor: "bg-warning/10",
      description: "Ajuste necessário para manter margem"
    },
    {
      title: "Impacto no EBITDA",
      value: data?.impactoEbitdaAnualMax || 0,
      format: "currency",
      suffix: "/ano",
      icon: DollarSign,
      color: data?.impactoEbitdaAnualMax >= 0 ? "text-success" : "text-destructive",
      bgColor: data?.impactoEbitdaAnualMax >= 0 ? "bg-success/10" : "bg-destructive/10",
      description: "Potencial de ganho com ações"
    },
    {
      title: "Score de Prontidão",
      value: data?.scoreProntidao || 0,
      format: "score",
      suffix: "/100",
      icon: AlertTriangle,
      color: (data?.scoreProntidao || 0) >= 70 ? "text-success" : (data?.scoreProntidao || 0) >= 40 ? "text-warning" : "text-destructive",
      bgColor: (data?.scoreProntidao || 0) >= 70 ? "bg-success/10" : (data?.scoreProntidao || 0) >= 40 ? "bg-warning/10" : "bg-destructive/10",
      description: "Nível de preparação para 2026"
    }
  ];

  return (
    <div className="flex-1">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          🛡️ Suíte Margem Ativa 2026
        </h1>
        <p className="text-muted-foreground mt-1">
          Proteja sua margem na transição da Reforma Tributária
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Para analisar seus fornecedores e calcular o impacto da Reforma Tributária na sua margem, precisamos das suas notas fiscais de compra em formato XML. É simples: importe os XMLs uma vez e tudo aparece automaticamente aqui. 🎯
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          
          return (
            <Card key={kpi.title} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
                    {loading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-bold ${kpi.color}`}>
                          {kpi.format === "currency" && formatCurrency(kpi.value)}
                          {kpi.format === "percent" && formatPercent(kpi.value)}
                          {kpi.format === "score" && kpi.value}
                        </span>
                        <span className="text-sm text-muted-foreground">{kpi.suffix}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
