import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DREHistoryItem {
  id: string;
  period_month: number;
  period_year: number;
  calc_receita_liquida: number;
  calc_lucro_bruto: number;
  calc_lucro_liquido: number;
  calc_margem_bruta: number;
  calc_margem_liquida: number;
  calc_ebitda: number;
  created_at: string;
}

export function DREHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<DREHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('company_dre')
        .select('*')
        .order('period_year', { ascending: true })
        .order('period_month', { ascending: true })
        .limit(12);

      if (error) throw error;

      setHistory(data || []);
      generateInsights(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (data: DREHistoryItem[]) => {
    if (data.length < 2) {
      setInsights(['Adicione mais meses para ver tendências e insights']);
      return;
    }

    const newInsights: string[] = [];
    const last3 = data.slice(-3);
    const last = data[data.length - 1];
    const previous = data[data.length - 2];

    // Tendência de receita
    if (last3.length >= 3) {
      const receitaGrowth = ((last3[2].calc_receita_liquida - last3[0].calc_receita_liquida) / last3[0].calc_receita_liquida) * 100;
      if (receitaGrowth > 10) {
        newInsights.push(`📈 Receita cresceu ${receitaGrowth.toFixed(0)}% nos últimos 3 meses`);
      } else if (receitaGrowth < -10) {
        newInsights.push(`📉 Receita caiu ${Math.abs(receitaGrowth).toFixed(0)}% nos últimos 3 meses - atenção!`);
      }
    }

    // Variação mês a mês
    const varReceita = ((last.calc_receita_liquida - previous.calc_receita_liquida) / previous.calc_receita_liquida) * 100;
    const varLucro = previous.calc_lucro_liquido !== 0 
      ? ((last.calc_lucro_liquido - previous.calc_lucro_liquido) / Math.abs(previous.calc_lucro_liquido)) * 100
      : 0;

    if (varReceita > 0 && varLucro > varReceita) {
      newInsights.push(`✅ Lucro cresceu mais que a receita (${varLucro.toFixed(1)}% vs ${varReceita.toFixed(1)}%) - eficiência melhorando`);
    } else if (varReceita > 0 && varLucro < 0) {
      newInsights.push(`⚠️ Receita subiu mas lucro caiu - verifique custos e despesas`);
    }

    // Margem bruta estável
    const margemMedia = data.reduce((sum, d) => sum + d.calc_margem_bruta, 0) / data.length;
    const margemVariacao = Math.abs(last.calc_margem_bruta - margemMedia);
    if (margemVariacao < 2) {
      newInsights.push(`📊 Margem bruta estável em ${margemMedia.toFixed(1)}%`);
    }

    // Projeção
    if (data.length >= 3 && last.calc_lucro_liquido > 0) {
      const avgGrowth = last3.reduce((sum, d, i) => {
        if (i === 0) return 0;
        return sum + (d.calc_lucro_liquido - last3[i-1].calc_lucro_liquido);
      }, 0) / 2;
      
      if (avgGrowth > 0) {
        const monthsToDouble = last.calc_lucro_liquido / avgGrowth;
        if (monthsToDouble > 0 && monthsToDouble < 24) {
          newInsights.push(`🚀 Se manter ritmo, lucro dobra em ${Math.round(monthsToDouble)} meses`);
        }
      }
    }

    setInsights(newInsights.length > 0 ? newInsights : ['Continue registrando para gerar mais insights']);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatShortCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toFixed(0);
  };

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months[month - 1] || '';
  };

  const getVariation = (current: number, previous: number) => {
    if (!previous || previous === 0) return null;
    const variation = ((current - previous) / Math.abs(previous)) * 100;
    return variation;
  };

  const VariationBadge = ({ value }: { value: number | null }) => {
    if (value === null) return <span className="text-muted-foreground">-</span>;
    
    const isPositive = value > 0;
    const isNeutral = Math.abs(value) < 1;

    if (isNeutral) {
      return (
        <Badge variant="outline" className="gap-1">
          <Minus className="h-3 w-3" />
          {value.toFixed(1)}%
        </Badge>
      );
    }

    return (
      <Badge 
        variant="outline" 
        className={`gap-1 ${isPositive ? 'text-emerald-600 border-emerald-300' : 'text-red-600 border-red-300'}`}
      >
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {isPositive ? '+' : ''}{value.toFixed(1)}%
      </Badge>
    );
  };

  // Preparar dados para o gráfico
  const chartData = history.map(item => ({
    name: `${getMonthName(item.period_month)}/${item.period_year.toString().slice(-2)}`,
    receita: item.calc_receita_liquida,
    lucroBruto: item.calc_lucro_bruto,
    lucroLiquido: item.calc_lucro_liquido,
    margemBruta: item.calc_margem_bruta,
    margemLiquida: item.calc_margem_liquida
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Nenhum histórico disponível. Cadastre DREs mensais para acompanhar a evolução.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Evolução */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução dos Últimos 12 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatShortCurrency(value)}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name.includes('Margem')) return [`${value.toFixed(1)}%`, name];
                    return [formatCurrency(value), name];
                  }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="receita" 
                  name="Receita" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="lucroBruto" 
                  name="Lucro Bruto" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="lucroLiquido" 
                  name="Lucro Líquido" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="margemBruta" 
                  name="Margem Bruta %" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Insights Automáticos */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Lightbulb className="h-5 w-5" />
            Insights Automáticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {insights.map((insight, idx) => (
              <li key={idx} className="text-sm">{insight}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Tabela Comparativa */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativo Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Métrica</TableHead>
                  {history.slice(-4).map((item) => (
                    <TableHead key={item.id} className="text-center">
                      {getMonthName(item.period_month)}/{item.period_year.toString().slice(-2)}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Var M/M</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Receita</TableCell>
                  {history.slice(-4).map((item) => (
                    <TableCell key={item.id} className="text-center font-mono">
                      {formatCurrency(item.calc_receita_liquida)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    {history.length >= 2 && (
                      <VariationBadge 
                        value={getVariation(
                          history[history.length - 1].calc_receita_liquida,
                          history[history.length - 2].calc_receita_liquida
                        )} 
                      />
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Margem Bruta</TableCell>
                  {history.slice(-4).map((item) => (
                    <TableCell key={item.id} className="text-center">
                      {item.calc_margem_bruta.toFixed(1)}%
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    {history.length >= 2 && (
                      <VariationBadge 
                        value={history[history.length - 1].calc_margem_bruta - history[history.length - 2].calc_margem_bruta} 
                      />
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Lucro Líquido</TableCell>
                  {history.slice(-4).map((item) => (
                    <TableCell 
                      key={item.id} 
                      className={`text-center font-mono ${item.calc_lucro_liquido < 0 ? 'text-red-500' : ''}`}
                    >
                      {formatCurrency(item.calc_lucro_liquido)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    {history.length >= 2 && (
                      <VariationBadge 
                        value={getVariation(
                          history[history.length - 1].calc_lucro_liquido,
                          history[history.length - 2].calc_lucro_liquido
                        )} 
                      />
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
