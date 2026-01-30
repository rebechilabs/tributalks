import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  useFiscalCrossAnalysis, 
  useRunCrossAnalysis, 
  useFiscalGapsSummary 
} from "@/hooks/useFiscalCrossAnalysis";
import { 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw, 
  Loader2, 
  FileSearch,
  DollarSign,
  AlertCircle,
  CheckCircle,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const RISK_COLORS = {
  critico: "hsl(var(--destructive))",
  alto: "hsl(25, 95%, 53%)",
  medio: "hsl(48, 96%, 53%)",
  baixo: "hsl(142, 71%, 45%)",
};

const RISK_LABELS = {
  critico: "Crítico",
  alto: "Alto",
  medio: "Médio",
  baixo: "Baixo",
};

export function FiscalGapsDashboard() {
  const { data: analysis, isLoading } = useFiscalCrossAnalysis();
  const summary = useFiscalGapsSummary();
  const runAnalysis = useRunCrossAnalysis();
  const [isRunning, setIsRunning] = useState(false);

  const handleRunAnalysis = async () => {
    setIsRunning(true);
    try {
      const result = await runAnalysis.mutateAsync();
      toast.success(
        `Análise concluída! ${result.summary?.periodosComDivergencia || 0} divergências encontradas.`
      );
    } catch (error) {
      toast.error("Erro ao executar análise cruzada");
    } finally {
      setIsRunning(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const riskDistribution = [
    { name: "Crítico", value: summary.riscoCritico, fill: RISK_COLORS.critico },
    { name: "Alto", value: summary.riscoAlto, fill: RISK_COLORS.alto },
    { name: "Médio", value: summary.riscoMedio, fill: RISK_COLORS.medio },
    { name: "Baixo", value: summary.riscoBaixo, fill: RISK_COLORS.baixo },
  ].filter(item => item.value > 0);

  const getRiskBadge = (risco: string) => {
    const variant = risco === "critico" || risco === "alto" ? "destructive" : 
                   risco === "medio" ? "secondary" : "default";
    return (
      <Badge variant={variant} className="capitalize">
        {RISK_LABELS[risco as keyof typeof RISK_LABELS] || risco}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-primary" />
            Cruzamento SPED × DCTF
          </h2>
          <p className="text-sm text-muted-foreground">
            Identifique divergências entre débitos apurados e declarados
          </p>
        </div>
        <Button onClick={handleRunAnalysis} disabled={isRunning}>
          {isRunning ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Executar Análise
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Divergência Total</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(summary.totalDivergencia)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Períodos Analisados</p>
                <p className="text-2xl font-bold">{summary.periodosAnalisados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <DollarSign className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gap PIS</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.divergenciaPis)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-500/10">
                <DollarSign className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gap COFINS</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.divergenciaCofins)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      {summary.evolucaoMensal.length > 0 && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Evolution Chart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Evolução das Divergências</CardTitle>
              <CardDescription>Variação mensal dos gaps identificados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.evolucaoMensal}>
                    <defs>
                      <linearGradient id="colorDivergencia" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="periodo" 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                      className="text-muted-foreground"
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), "Divergência"]}
                      labelFormatter={(label) => `Período: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="valor"
                      stroke="hsl(var(--destructive))"
                      fillOpacity={1}
                      fill="url(#colorDivergencia)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribuição de Risco</CardTitle>
              <CardDescription>Por nível de criticidade</CardDescription>
            </CardHeader>
            <CardContent>
              {riskDistribution.length > 0 ? (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mr-2" />
                  <span>Sem divergências</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {riskDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-1 text-xs">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.fill }}
                    />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Divergências por Período</CardTitle>
          <CardDescription>
            Detalhamento das diferenças entre SPED e DCTF
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysis && analysis.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">PIS (SPED)</TableHead>
                  <TableHead className="text-right">PIS (DCTF)</TableHead>
                  <TableHead className="text-right">Gap PIS</TableHead>
                  <TableHead className="text-right">Gap COFINS</TableHead>
                  <TableHead className="text-right">Gap Total</TableHead>
                  <TableHead>Risco</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.map((item) => {
                  const spedPisApurado = (item.sped_pis_debito || 0) - (item.sped_pis_credito || 0);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.periodo_referencia}</TableCell>
                      <TableCell className="text-right">{formatCurrency(spedPisApurado)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.dctf_pis_declarado || 0)}</TableCell>
                      <TableCell className="text-right text-destructive">
                        {formatCurrency(item.divergencia_pis || 0)}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        {formatCurrency(item.divergencia_cofins || 0)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-destructive">
                        {formatCurrency(item.divergencia_total || 0)}
                      </TableCell>
                      <TableCell>{getRiskBadge(item.nivel_risco || "baixo")}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhuma análise disponível</p>
              <p className="text-sm">
                Importe arquivos SPED e DCTF, depois clique em "Executar Análise"
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
