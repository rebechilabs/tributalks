import { Gauge, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ThermometerData } from "@/hooks/useExecutiveData";

interface ExecutiveThermometerProps {
  data: ThermometerData | null;
  loading?: boolean;
}

const gradeColors: Record<string, { bg: string; text: string; border: string }> = {
  'A+': { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30' },
  'A': { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30' },
  'B': { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/30' },
  'C': { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/30' },
  'D': { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/30' },
  'E': { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/30' },
};

const riscoLabels: Record<string, { label: string; color: string }> = {
  'baixo': { label: 'Baixo', color: 'text-emerald-600' },
  'medio': { label: 'Médio', color: 'text-yellow-600' },
  'alto': { label: 'Alto', color: 'text-red-600' },
};

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return `R$ ${value.toFixed(0)}`;
}

export function ExecutiveThermometer({ data, loading }: ExecutiveThermometerProps) {
  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/30">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Gauge className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">Dados insuficientes</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Complete o Score Tributário para ver seu termômetro
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const gradeStyle = gradeColors[data.scoreGrade] || gradeColors['E'];
  const riscoInfo = riscoLabels[data.riscoNivel] || riscoLabels['medio'];

  return (
    <Card className={cn("border-2", gradeStyle.border)}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Greeting and Grade */}
          <div className="flex items-start gap-4">
            <div className={cn(
              "flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold",
              gradeStyle.bg,
              gradeStyle.text
            )}>
              {data.scoreGrade}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Olá, {data.userName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sua nota tributária geral é <span className={cn("font-semibold", gradeStyle.text)}>{data.scoreGrade}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Score: {data.scoreTotal} / 1000 pontos
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 lg:border-l lg:pl-6 border-border">
            {/* Carga Efetiva */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Carga Efetiva</p>
                <p className="text-lg font-semibold text-foreground">
                  {data.cargaEfetivaPercent > 0 ? `${data.cargaEfetivaPercent}%` : '—'}
                </p>
                <p className="text-xs text-muted-foreground">da receita</p>
              </div>
            </div>

            {/* Caixa Potencial */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Caixa Potencial</p>
                <p className="text-lg font-semibold text-foreground">
                  {data.caixaPotencialMax > 0 
                    ? `${formatCurrency(data.caixaPotencialMin)} – ${formatCurrency(data.caixaPotencialMax)}`
                    : '—'
                  }
                </p>
                <p className="text-xs text-muted-foreground">em 12 meses</p>
              </div>
            </div>

            {/* Risco */}
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                data.riscoNivel === 'alto' ? 'bg-red-500/10' : 
                data.riscoNivel === 'medio' ? 'bg-yellow-500/10' : 'bg-emerald-500/10'
              )}>
                <AlertTriangle className={cn(
                  "w-5 h-5",
                  data.riscoNivel === 'alto' ? 'text-red-600' : 
                  data.riscoNivel === 'medio' ? 'text-yellow-600' : 'text-emerald-600'
                )} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Risco Atual</p>
                <p className={cn("text-lg font-semibold", riscoInfo.color)}>
                  {riscoInfo.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.alertasCount} {data.alertasCount === 1 ? 'alerta' : 'alertas'} este mês
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
