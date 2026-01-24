import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  AlertOctagon, Download, RefreshCw, ChevronRight, Target,
  Users, CreditCard, Home, Star, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DREData {
  id: string;
  period_month: number;
  period_year: number;
  calc_receita_bruta: number;
  calc_receita_liquida: number;
  calc_lucro_bruto: number;
  calc_margem_bruta: number;
  calc_resultado_operacional: number;
  calc_margem_operacional: number;
  calc_lucro_liquido: number;
  calc_margem_liquida: number;
  calc_ebitda: number;
  calc_ebitda_margin: number;
  calc_ponto_equilibrio: number;
  calc_deducoes_receita: number;
  calc_custo_produtos_vendidos: number;
  calc_despesas_operacionais_total: number;
  calc_resultado_financeiro: number;
  health_score: number;
  health_status: string;
  diagnostics: Diagnostic[];
  recommendations: Recommendation[];
  reforma_impostos_atuais: number;
  reforma_impostos_novos: number;
  reforma_impacto_lucro: number;
  reforma_impacto_percentual: number;
}

interface Diagnostic {
  area: string;
  status: 'excellent' | 'ok' | 'warning' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  icon?: string;
}

interface Recommendation {
  priority: number;
  action: string;
  impact: string;
  area: string;
}

interface DREDashboardProps {
  dreId?: string;
}

export function DREDashboard({ dreId }: DREDashboardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dre, setDre] = useState<DREData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLatestDRE();
    }
  }, [user, dreId]);

  const fetchLatestDRE = async () => {
    try {
      let query = supabase
        .from('company_dre')
        .select('*')
        .order('created_at', { ascending: false });

      if (dreId) {
        query = query.eq('id', dreId);
      }

      const { data, error } = await query.limit(1).single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setDre({
          ...data,
          diagnostics: (data.diagnostics as unknown as Diagnostic[]) || [],
          recommendations: (data.recommendations as unknown as Recommendation[]) || []
        });
      }
    } catch (error) {
      console.error('Error fetching DRE:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const getHealthColor = (status: string) => {
    const colors: Record<string, string> = {
      excellent: 'text-emerald-500',
      healthy: 'text-emerald-500',
      warning: 'text-amber-500',
      critical: 'text-red-500',
      pending: 'text-muted-foreground'
    };
    return colors[status] || colors.pending;
  };

  const getHealthBg = (status: string) => {
    const colors: Record<string, string> = {
      excellent: 'bg-emerald-500',
      healthy: 'bg-emerald-500',
      warning: 'bg-amber-500',
      critical: 'bg-red-500',
      pending: 'bg-muted'
    };
    return colors[status] || colors.pending;
  };

  const getHealthEmoji = (status: string) => {
    const emojis: Record<string, string> = {
      excellent: '🌟',
      healthy: '💚',
      warning: '⚠️',
      critical: '🚨',
      pending: '⏳'
    };
    return emojis[status] || emojis.pending;
  };

  const getHealthMessage = (status: string) => {
    const messages: Record<string, string> = {
      excellent: 'Sua empresa está excelente! Continue assim!',
      healthy: 'Sua empresa está bem, com alguns pontos de atenção',
      warning: 'Atenção: alguns indicadores precisam de melhorias',
      critical: 'Alerta: ações urgentes são necessárias',
      pending: 'Preencha o formulário para ver o diagnóstico'
    };
    return messages[status] || messages.pending;
  };

  const getDiagnosticIcon = (area: string, status: string) => {
    const icons: Record<string, React.ReactNode> = {
      rentabilidade: <TrendingUp className="h-5 w-5" />,
      custos: <Users className="h-5 w-5" />,
      financeiro: <CreditCard className="h-5 w-5" />,
      estrutura: <Home className="h-5 w-5" />,
      resultado: <Target className="h-5 w-5" />
    };

    const statusColors: Record<string, string> = {
      excellent: 'text-emerald-500',
      ok: 'text-blue-500',
      warning: 'text-amber-500',
      critical: 'text-red-500'
    };

    return (
      <div className={statusColors[status]}>
        {icons[area] || <BarChart3 className="h-5 w-5" />}
      </div>
    );
  };

  const getDiagnosticBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string; label: string }> = {
      excellent: { bg: 'bg-emerald-100 dark:bg-emerald-900', text: 'text-emerald-700 dark:text-emerald-300', label: '🟢 Excelente' },
      ok: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300', label: '🔵 OK' },
      warning: { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-700 dark:text-amber-300', label: '🟡 Atenção' },
      critical: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', label: '🔴 Crítico' }
    };

    const v = variants[status] || variants.ok;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${v.bg} ${v.text}`}>
        {v.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dre) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Nenhum DRE cadastrado</h3>
          <p className="text-muted-foreground mb-6">
            Preencha o formulário para gerar seu primeiro DRE e receber um diagnóstico completo.
          </p>
          <Button onClick={() => navigate('/dashboard/dre')}>
            Criar meu DRE
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Dados do waterfall
  const waterfallData = [
    { label: 'Receita Bruta', value: dre.calc_receita_bruta, percent: 100, color: 'bg-blue-500' },
    { label: '(-) Deduções', value: -dre.calc_deducoes_receita, percent: -(dre.calc_deducoes_receita / dre.calc_receita_bruta * 100), color: 'bg-red-400', isDeduction: true },
    { label: 'Receita Líquida', value: dre.calc_receita_liquida, percent: (dre.calc_receita_liquida / dre.calc_receita_bruta * 100), color: 'bg-blue-400' },
    { label: '(-) Custos', value: -dre.calc_custo_produtos_vendidos, percent: -(dre.calc_custo_produtos_vendidos / dre.calc_receita_bruta * 100), color: 'bg-red-400', isDeduction: true },
    { label: 'Lucro Bruto', value: dre.calc_lucro_bruto, percent: dre.calc_margem_bruta, color: 'bg-emerald-500' },
    { label: '(-) Despesas', value: -dre.calc_despesas_operacionais_total, percent: -(dre.calc_despesas_operacionais_total / dre.calc_receita_bruta * 100), color: 'bg-red-400', isDeduction: true },
    { label: 'EBITDA', value: dre.calc_ebitda, percent: dre.calc_ebitda_margin, color: 'bg-violet-500' },
    { label: 'Lucro Líquido', value: dre.calc_lucro_liquido, percent: dre.calc_margem_liquida, color: dre.calc_lucro_liquido >= 0 ? 'bg-emerald-600' : 'bg-red-600' },
  ];

  return (
    <div className="space-y-6">
      {/* SEÇÃO 1: HEALTH SCORE */}
      <Card className="overflow-hidden">
        <div className={`h-2 ${getHealthBg(dre.health_status)}`} />
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`text-5xl`}>{getHealthEmoji(dre.health_status)}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Heart className={`h-5 w-5 ${getHealthColor(dre.health_status)}`} />
                  <span className="font-semibold">SAÚDE FINANCEIRA</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-3xl font-bold ${getHealthColor(dre.health_status)}`}>
                    {dre.health_score}/100
                  </span>
                  <Progress value={dre.health_score} className="w-32 h-3" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {getHealthMessage(dre.health_status)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/dashboard/dre')}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar DRE
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 2: DRE VISUAL (Waterfall) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            DRE - Demonstração do Resultado
            <Badge variant="outline" className="ml-2">
              {dre.period_month}/{dre.period_year}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {waterfallData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium truncate">
                  {item.label}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`h-6 ${item.color} rounded transition-all`}
                      style={{ width: `${Math.abs(item.percent)}%`, minWidth: '4px' }}
                    />
                    {item.isDeduction && (
                      <span className="text-xs text-muted-foreground">
                        {item.percent.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className={`w-28 text-right font-mono text-sm ${item.value < 0 ? 'text-red-500' : ''}`}>
                  {formatCurrency(item.value)}
                </div>
                <div className="w-16 text-right text-xs text-muted-foreground">
                  {Math.abs(item.percent).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 3: CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Margem Bruta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dre.calc_margem_bruta.toFixed(1)}%</div>
            <p className={`text-xs ${dre.calc_margem_bruta >= 30 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {dre.calc_margem_bruta >= 30 ? '▲ Acima da média' : '▼ Abaixo da média'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Margem Líquida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dre.calc_margem_liquida >= 0 ? '' : 'text-red-500'}`}>
              {dre.calc_margem_liquida.toFixed(1)}%
            </div>
            <p className={`text-xs ${dre.calc_margem_liquida >= 8 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {dre.calc_margem_liquida >= 8 ? '▲ Saudável' : '▼ Atenção'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">EBITDA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dre.calc_ebitda)}</div>
            <p className="text-xs text-muted-foreground">
              {dre.calc_ebitda_margin.toFixed(1)}% margem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ponto de Equilíbrio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dre.calc_ponto_equilibrio)}</div>
            <p className={`text-xs ${dre.calc_receita_liquida >= dre.calc_ponto_equilibrio ? 'text-emerald-500' : 'text-red-500'}`}>
              {dre.calc_receita_liquida >= dre.calc_ponto_equilibrio 
                ? `Cobrindo ${((dre.calc_receita_liquida / dre.calc_ponto_equilibrio) * 100).toFixed(0)}%`
                : 'Abaixo do necessário'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* SEÇÃO 4: DIAGNÓSTICOS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Diagnósticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dre.diagnostics && dre.diagnostics.length > 0 ? (
              <div className="space-y-4">
                {dre.diagnostics.map((diag, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    {getDiagnosticIcon(diag.area, diag.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{diag.title}</span>
                        {getDiagnosticBadge(diag.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{diag.description}</p>
                      <p className="text-sm mt-1 flex items-center gap-1">
                        <ChevronRight className="h-4 w-4" />
                        {diag.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Nenhum diagnóstico disponível
              </p>
            )}
          </CardContent>
        </Card>

        {/* SEÇÃO 5: IMPACTO REFORMA */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Simulação Reforma 2027
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-background/80 rounded-lg">
                <span>Impostos Hoje:</span>
                <span className="font-bold">{formatCurrency(dre.reforma_impostos_atuais)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background/80 rounded-lg">
                <span>Impostos Reforma:</span>
                <span className="font-bold">{formatCurrency(dre.reforma_impostos_novos)}</span>
              </div>
              <div className={`flex justify-between items-center p-4 rounded-lg ${
                dre.reforma_impacto_lucro > 0 
                  ? 'bg-emerald-100 dark:bg-emerald-900/50' 
                  : 'bg-red-100 dark:bg-red-900/50'
              }`}>
                <span className="font-semibold">
                  {dre.reforma_impacto_lucro > 0 ? 'ECONOMIA:' : 'AUMENTO:'}
                </span>
                <div className="text-right">
                  <span className={`text-xl font-bold ${
                    dre.reforma_impacto_lucro > 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(dre.reforma_impacto_lucro))}/mês
                  </span>
                  <span className={`text-sm ml-2 ${
                    dre.reforma_impacto_lucro > 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {dre.reforma_impacto_lucro > 0 ? '💚' : '📈'} ({dre.reforma_impacto_percentual.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/calculadora/rtc')}
              >
                Ver Simulação Detalhada
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
