import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAIHealthMetrics } from "@/hooks/useAIHealthMetrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  ThumbsUp, 
  ThumbsDown,
  Brain,
  Zap,
  Database,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Cpu,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

export default function AdminAIHealth() {
  const [period, setPeriod] = useState<number>(7);
  const { cost, quality, agents, memory, rag, loading, error, refetch, lastUpdated } = useAIHealthMetrics(period);

  const healthScore = Math.round(
    (quality.positiveRate * 0.4) + 
    (quality.cacheHitRate * 0.3) + 
    (memory.avgPatternConfidence * 0.15) +
    ((rag.embeddedDocuments / Math.max(rag.totalDocuments, 1)) * 100 * 0.15)
  );

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'Excelente', icon: CheckCircle, color: 'bg-green-500/10 text-green-500' };
    if (score >= 60) return { label: 'Bom', icon: AlertCircle, color: 'bg-amber-500/10 text-amber-500' };
    return { label: 'Precisa Atenção', icon: XCircle, color: 'bg-red-500/10 text-red-500' };
  };

  const healthStatus = getHealthStatus(healthScore);
  const HealthIcon = healthStatus.icon;

  if (loading && !lastUpdated) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Saúde da IA
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitore custos, qualidade e uso dos agentes Clara
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={period.toString()} onValueChange={(v) => setPeriod(parseInt(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="14">Últimos 14 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Health Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-1 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className={`text-5xl font-bold ${getHealthColor(healthScore)}`}>
                  {healthScore}%
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={healthStatus.color}>
                    <HealthIcon className="w-3 h-3 mr-1" />
                    {healthStatus.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Score de Saúde da IA
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Custo Total</p>
                  <p className="text-2xl font-bold">R$ {cost.totalCost.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    R$ {cost.costPerUser.toFixed(2)}/usuário
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Aprovação</p>
                  <p className="text-2xl font-bold text-green-500">{quality.positiveRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {quality.totalFeedback} feedbacks
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <ThumbsUp className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
                  <p className="text-2xl font-bold text-primary">{quality.cacheHitRate}%</p>
                  <p className="text-xs text-green-500 mt-1">
                    R$ {cost.cacheSavings.toFixed(2)} economizados
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics Tabs */}
        <Tabs defaultValue="costs" className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="costs" className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Custos</span>
            </TabsTrigger>
            <TabsTrigger value="quality" className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Qualidade</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-1">
              <Cpu className="w-4 h-4" />
              <span className="hidden sm:inline">Agentes</span>
            </TabsTrigger>
            <TabsTrigger value="memory" className="flex items-center gap-1">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Memória</span>
            </TabsTrigger>
            <TabsTrigger value="rag" className="flex items-center gap-1">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">RAG</span>
            </TabsTrigger>
          </TabsList>

          {/* COSTS TAB */}
          <TabsContent value="costs" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cost by Day */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Custo Diário
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cost.dailyCosts}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(v) => format(new Date(v), 'dd/MM')}
                          className="text-xs"
                        />
                        <YAxis 
                          tickFormatter={(v) => `R$${v}`}
                          className="text-xs"
                        />
                        <Tooltip 
                          formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Custo']}
                          labelFormatter={(label) => format(new Date(label), "dd 'de' MMMM", { locale: ptBR })}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="cost" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary) / 0.2)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Cost by Model */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Custo por Modelo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cost.costByModel.map((model, i) => (
                      <div key={model.model} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <div>
                            <p className="font-medium text-sm">{model.model}</p>
                            <p className="text-xs text-muted-foreground">{model.queries} queries</p>
                          </div>
                        </div>
                        <p className="font-semibold">R$ {model.cost.toFixed(2)}</p>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-green-500">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm">Economia via Cache</span>
                        </div>
                        <span className="font-bold">R$ {cost.cacheSavings.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(cost.tokensSaved / 1000).toFixed(0)}k tokens economizados
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* QUALITY TAB */}
          <TabsContent value="quality" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <ThumbsUp className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-500">{quality.positiveRate}%</p>
                      <p className="text-sm text-muted-foreground">Respostas Úteis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                      <ThumbsDown className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-500">{quality.negativeRate}%</p>
                      <p className="text-sm text-muted-foreground">Precisa Melhorar</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{quality.avgConfidence}%</p>
                      <p className="text-sm text-muted-foreground">Confiança Média</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tendência de Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quality.feedbackTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(v) => format(new Date(v), 'dd/MM')}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(label) => format(new Date(label), "dd 'de' MMMM", { locale: ptBR })}
                      />
                      <Legend />
                      <Bar dataKey="positive" name="Positivo" fill="hsl(var(--success))" />
                      <Bar dataKey="negative" name="Negativo" fill="hsl(var(--destructive))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AGENTS TAB */}
          <TabsContent value="agents" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">{agents.totalActions}</p>
                  <p className="text-sm text-muted-foreground">Total Ações</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-amber-500">{agents.pendingActions}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-green-500">{agents.executedActions}</p>
                  <p className="text-sm text-muted-foreground">Executadas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-red-500">{agents.rejectedActions}</p>
                  <p className="text-sm text-muted-foreground">Rejeitadas</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ações por Agente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agents.actionsByAgent.map((agent) => (
                      <div key={agent.agent} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{agent.agent}</span>
                          <span className="text-sm text-muted-foreground">
                            {agent.approved}/{agent.count} aprovadas
                          </span>
                        </div>
                        <Progress 
                          value={(agent.approved / Math.max(agent.count, 1)) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Triggers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agents.triggersByEvent.slice(0, 5).map((trigger, i) => (
                      <div key={trigger.event} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">#{i + 1}</span>
                          <code className="text-sm bg-muted px-2 py-1 rounded">{trigger.event}</code>
                        </div>
                        <Badge variant="secondary">{trigger.count}x</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* MEMORY TAB */}
          <TabsContent value="memory" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">{memory.totalPatterns}</p>
                  <p className="text-sm text-muted-foreground">Total Padrões</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-green-500">{memory.highConfidencePatterns}</p>
                  <p className="text-sm text-muted-foreground">Alta Confiança (&gt;70%)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">{memory.totalMemories}</p>
                  <p className="text-sm text-muted-foreground">Total Memórias</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-primary">{memory.activeMemories}</p>
                  <p className="text-sm text-muted-foreground">Memórias Ativas</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Padrões por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {memory.patternsByType.map((pattern) => (
                    <div key={pattern.type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{pattern.type}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{pattern.count} padrões</Badge>
                          <Badge className={pattern.avgConfidence > 70 ? 'bg-green-500' : pattern.avgConfidence > 50 ? 'bg-amber-500' : 'bg-red-500'}>
                            {pattern.avgConfidence}% conf.
                          </Badge>
                        </div>
                      </div>
                      <Progress value={pattern.avgConfidence} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RAG TAB */}
          <TabsContent value="rag" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">{rag.totalDocuments}</p>
                  <p className="text-sm text-muted-foreground">Total Documentos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-green-500">{rag.embeddedDocuments}</p>
                  <p className="text-sm text-muted-foreground">Com Embeddings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-amber-500">{rag.pendingEmbedding}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-primary">{rag.searchVolume}</p>
                  <p className="text-sm text-muted-foreground">Buscas Realizadas</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cobertura de Embeddings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Documentos indexados</span>
                      <span className="font-bold">
                        {Math.round((rag.embeddedDocuments / Math.max(rag.totalDocuments, 1)) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(rag.embeddedDocuments / Math.max(rag.totalDocuments, 1)) * 100} 
                      className="h-3"
                    />
                    <p className="text-xs text-muted-foreground">
                      {rag.embeddedDocuments} de {rag.totalDocuments} documentos processados
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Categorias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rag.topCategories.map((cat, i) => (
                      <div key={cat.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <span className="text-sm capitalize">{cat.category}</span>
                        </div>
                        <Badge variant="secondary">{cat.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Last Updated */}
        {lastUpdated && (
          <p className="text-xs text-muted-foreground text-center">
            Última atualização: {format(lastUpdated, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
