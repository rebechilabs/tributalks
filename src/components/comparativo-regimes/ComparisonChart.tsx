import { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { ComparativoRegimesResult } from "@/types/comparativoRegimes";
import { formatarMoeda, NOMES_REGIMES } from "@/utils/comparativoRegimesCalculations";

interface ComparisonChartProps {
  result: ComparativoRegimesResult;
}

const NOMES_CURTOS: Record<string, string> = {
  'SIMPLES_NACIONAL': 'Simples',
  'LUCRO_PRESUMIDO': 'Presumido',
  'LUCRO_REAL': 'Real',
  'SIMPLES_2027_DENTRO': '2027 Dentro',
  'SIMPLES_2027_FORA': '2027 Fora',
};

export function ComparisonChart({ result }: ComparisonChartProps) {
  const { regimes, recomendado } = result;
  
  const chartData = useMemo(() => {
    return regimes
      .filter(r => r.is_elegivel)
      .map(regime => ({
        nome: NOMES_CURTOS[regime.tipo] || regime.nome,
        tipo: regime.tipo,
        imposto: regime.imposto_anual,
        isRecomendado: regime.tipo === recomendado,
      }))
      .sort((a, b) => a.imposto - b.imposto);
  }, [regimes, recomendado]);

  const getBarColor = (isRecomendado: boolean) => {
    return isRecomendado ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{NOMES_REGIMES[data.tipo as keyof typeof NOMES_REGIMES]}</p>
          <p className="text-sm text-muted-foreground">
            Imposto: <span className="font-mono">{formatarMoeda(data.imposto)}</span>
          </p>
          {data.isRecomendado && (
            <p className="text-xs text-primary mt-1">⭐ Recomendado</p>
          )}
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5" />
          Comparativo Visual
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 60, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
              <XAxis type="number" tickFormatter={formatYAxis} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="nome" width={75} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="imposto" radius={[0, 4, 4, 0]} maxBarSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.isRecomendado)} opacity={entry.isRecomendado ? 1 : 0.6} />
                ))}
                <LabelList dataKey="imposto" position="right" formatter={(value: number) => formatarMoeda(value)} style={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span>Recomendado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-muted-foreground/60" />
            <span>Outros regimes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
