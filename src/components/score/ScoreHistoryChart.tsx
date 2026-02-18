import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, TrendingDown, Minus, History } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScoreHistoryEntry {
  id: string;
  score_total: number;
  score_grade: string;
  calculated_at: string;
}

interface ScoreHistoryChartProps {
  currentScore?: number;
}

export function ScoreHistoryChart({ currentScore }: ScoreHistoryChartProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<ScoreHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('tax_score_history')
          .select('id, score_total, score_grade, calculated_at')
          .eq('user_id', user.id)
          .order('calculated_at', { ascending: true })
          .limit(12); // Last 12 entries

        if (error) throw error;
        setHistory(data || []);
      } catch (error) {
        console.error('Error fetching score history:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user]);

  // Deduplicate: keep only latest entry per day
  const deduplicatedHistory = (() => {
    const dayMap = new Map<string, ScoreHistoryEntry>();
    for (const entry of history) {
      const dayKey = format(new Date(entry.calculated_at), 'yyyy-MM-dd');
      const existing = dayMap.get(dayKey);
      if (!existing || new Date(entry.calculated_at) > new Date(existing.calculated_at)) {
        dayMap.set(dayKey, entry);
      }
    }
    return Array.from(dayMap.values()).sort(
      (a, b) => new Date(a.calculated_at).getTime() - new Date(b.calculated_at).getTime()
    );
  })();

  // Calculate trend (uses original history for accuracy)
  const getTrend = () => {
    if (history.length < 2) return null;
    const lastScore = history[history.length - 1]?.score_total || 0;
    const previousScore = history[history.length - 2]?.score_total || 0;
    const diff = lastScore - previousScore;
    
    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
      value: Math.abs(diff),
    };
  };

  const trend = getTrend();

  // Adaptive date format based on time span
  const getDateFormat = () => {
    if (deduplicatedHistory.length < 2) return "dd/MM";
    const first = new Date(deduplicatedHistory[0].calculated_at);
    const last = new Date(deduplicatedHistory[deduplicatedHistory.length - 1].calculated_at);
    const daySpan = differenceInDays(last, first);
    if (daySpan < 7) return "dd/MM HH:mm";
    if (daySpan > 30) return "dd MMM";
    return "dd/MM";
  };

  const dateFormat = getDateFormat();

  // Format data for chart
  const chartData = deduplicatedHistory.map((entry) => ({
    date: format(new Date(entry.calculated_at), dateFormat, { locale: ptBR }),
    fullDate: format(new Date(entry.calculated_at), "dd 'de' MMM 'de' yyyy", { locale: ptBR }),
    score: entry.score_total,
    grade: entry.score_grade,
  }));

  // Ensure consecutive labels are unique
  for (let i = 1; i < chartData.length; i++) {
    if (chartData[i].date === chartData[i - 1].date) {
      chartData[i].date = format(new Date(deduplicatedHistory[i].calculated_at), "dd/MM HH:mm", { locale: ptBR });
      if (chartData[i - 1].date === chartData[i - 2]?.date || !chartData[i - 1].date.includes(':')) {
        chartData[i - 1].date = format(new Date(deduplicatedHistory[i - 1].calculated_at), "dd/MM HH:mm", { locale: ptBR });
      }
    }
  }

  // Get grade color
  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': 'hsl(var(--chart-1))',
      'A': 'hsl(var(--chart-1))',
      'B': 'hsl(var(--chart-2))',
      'C': 'hsl(var(--chart-3))',
      'D': 'hsl(var(--chart-4))',
      'E': 'hsl(var(--chart-5))',
    };
    return colors[grade] || 'hsl(var(--muted-foreground))';
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{data.fullDate}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold">{data.score}</span>
            <Badge 
              variant="outline" 
              style={{ borderColor: getGradeColor(data.grade), color: getGradeColor(data.grade) }}
            >
              {data.grade}
            </Badge>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // If no history, show placeholder
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Evolução
          </CardTitle>
          <CardDescription>
            Acompanhe a evolução do seu score ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
            <History className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">Nenhum histórico ainda</p>
            <p className="text-sm">Complete o diagnóstico para iniciar o acompanhamento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Evolução
            </CardTitle>
            <CardDescription>
              {history.length} {history.length === 1 ? 'avaliação registrada' : 'avaliações registradas'}
            </CardDescription>
          </div>
          {trend && (
            <div className="flex items-center gap-2">
              {trend.direction === 'up' && (
                <Badge variant="outline" className="text-emerald-600 border-emerald-600 gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{trend.value} pts
                </Badge>
              )}
              {trend.direction === 'down' && (
                <Badge variant="outline" className="text-red-600 border-red-600 gap-1">
                  <TrendingDown className="h-3 w-3" />
                  -{trend.value} pts
                </Badge>
              )}
              {trend.direction === 'stable' && (
                <Badge variant="outline" className="text-muted-foreground gap-1">
                  <Minus className="h-3 w-3" />
                  Estável
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                className="text-muted-foreground"
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Reference lines for grade thresholds */}
              <ReferenceLine y={90} stroke="hsl(var(--chart-1))" strokeDasharray="3 3" opacity={0.3} />
              <ReferenceLine y={70} stroke="hsl(var(--chart-2))" strokeDasharray="3 3" opacity={0.3} />
              <ReferenceLine y={50} stroke="hsl(var(--chart-4))" strokeDasharray="3 3" opacity={0.3} />
              
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Grade Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-chart-1 rounded" /> 90+ = A+
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-chart-2 rounded" /> 70+ = B
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-chart-4 rounded" /> 50+ = C
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
