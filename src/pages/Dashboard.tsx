import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, Wallet, Scale, FileText, Bot, Users, Calendar, 
  Lock, ArrowRight, Clock, Sparkles, Upload, Target, BarChart3,
  Trophy, Lightbulb, Newspaper
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatBrasilia } from "@/lib/dateUtils";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ClaraCard } from "@/components/dashboard/ClaraCard";
interface CalcItem {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  icone: string;
  status: string;
  ordem: number;
}

interface Simulation {
  id: string;
  calculator_slug: string;
  inputs: any;
  outputs: any;
  created_at: string;
}

interface ToolItem {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
  requiredPlan?: 'NAVIGATOR' | 'PROFESSIONAL' | 'ENTERPRISE';
}

interface ToolGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ToolItem[];
}

const toolGroups: ToolGroup[] = [
  {
    title: 'GPS da Reforma',
    icon: Newspaper,
    items: [
      { 
        name: 'Notícias da Reforma', 
        description: 'Feed atualizado + pílula do dia',
        href: '/noticias', 
        icon: Newspaper,
        requiredPlan: 'NAVIGATOR'
      },
      { 
        name: 'Timeline 2026-2033', 
        description: 'O que fazer em cada etapa',
        href: '/dashboard/timeline-reforma', 
        icon: Lightbulb,
        requiredPlan: 'NAVIGATOR',
        badge: 'Novo'
      },
    ]
  },
  {
    title: 'Calculadoras',
    icon: Calculator,
    items: [
      { 
        name: 'Score Tributário', 
        description: 'Avalie sua saúde fiscal',
        href: '/dashboard/score-tributario', 
        icon: Trophy
      },
      { 
        name: 'Split Payment', 
        description: 'Simule o impacto do split payment',
        href: '/calculadora/split-payment', 
        icon: Wallet 
      },
      { 
        name: 'Comparativo de Regimes', 
        description: 'Compare Simples, Presumido e Real',
        href: '/calculadora/comparativo-regimes', 
        icon: Scale,
        requiredPlan: 'NAVIGATOR'
      },
      { 
        name: 'Calculadora RTC', 
        description: 'Calcule CBS/IBS/IS da Reforma',
        href: '/calculadora/rtc', 
        icon: Calculator,
        badge: 'API',
        requiredPlan: 'NAVIGATOR'
      },
    ]
  },
  {
    title: 'Diagnóstico',
    icon: Target,
    items: [
      { 
        name: 'Importar XMLs', 
        description: 'Importe notas fiscais para análise',
        href: '/dashboard/importar-xml', 
        icon: Upload,
        requiredPlan: 'PROFESSIONAL'
      },
      { 
        name: 'Radar de Créditos', 
        description: 'Identifique créditos recuperáveis',
        href: '/dashboard/radar-creditos', 
        icon: Target,
        requiredPlan: 'PROFESSIONAL'
      },
      { 
        name: 'DRE Inteligente', 
        description: 'Análise de resultado econômico',
        href: '/dashboard/dre', 
        icon: BarChart3,
        requiredPlan: 'PROFESSIONAL'
      },
      { 
        name: 'Oportunidades', 
        description: 'Descubra economia tributária',
        href: '/dashboard/oportunidades', 
        icon: Lightbulb,
        requiredPlan: 'PROFESSIONAL'
      },
    ]
  },
  {
    title: 'IA e Suporte',
    icon: Bot,
    items: [
      { 
        name: 'TribuBot', 
        description: 'Assistente de IA tributária',
        href: '/tribubot', 
        icon: Bot,
        badge: 'IA',
        requiredPlan: 'NAVIGATOR'
      },
      { 
        name: 'Comunidade', 
        description: 'Grupo exclusivo + webinars',
        href: '/comunidade', 
        icon: Users,
        requiredPlan: 'PROFESSIONAL'
      },
    ]
  },
];

// Mapeamento de planos legados para novos
const LEGACY_PLAN_MAP: Record<string, string> = {
  'FREE': 'FREE',
  'BASICO': 'NAVIGATOR',
  'PROFISSIONAL': 'PROFESSIONAL',
  'PREMIUM': 'ENTERPRISE',
  'NAVIGATOR': 'NAVIGATOR',
  'PROFESSIONAL': 'PROFESSIONAL',
  'ENTERPRISE': 'ENTERPRISE',
};

const PLAN_LIMITS: Record<string, { simulations: number; label: string }> = {
  FREE: { simulations: 1, label: 'Grátis' },
  NAVIGATOR: { simulations: -1, label: 'Navigator' },
  PROFESSIONAL: { simulations: -1, label: 'Professional' },
  ENTERPRISE: { simulations: -1, label: 'Enterprise' },
};

const PLAN_HIERARCHY: Record<string, number> = {
  'FREE': 0,
  'NAVIGATOR': 1,
  'PROFESSIONAL': 2,
  'ENTERPRISE': 3,
};

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [simulationsThisMonth, setSimulationsThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);

  const rawPlan = profile?.plano || 'FREE';
  const currentPlan = LEGACY_PLAN_MAP[rawPlan] || 'FREE';
  const planLimit = PLAN_LIMITS[currentPlan]?.simulations || 1;

  const hasAccess = (requiredPlan?: string) => {
    if (!requiredPlan) return true;
    const userLevel = PLAN_HIERARCHY[currentPlan] || 0;
    const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 0;
    return userLevel >= requiredLevel;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const { data: simsData } = await supabase
          .from('simulations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (simsData) {
          setSimulations(simsData);
        }

        // Count this month's simulations
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count } = await supabase
          .from('simulations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString());

        setSimulationsThisMonth(count || 0);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getRegimeLabel = (regime: string | null) => {
    const labels: Record<string, string> = {
      SIMPLES: 'Simples Nacional',
      PRESUMIDO: 'Lucro Presumido',
      REAL: 'Lucro Real',
    };
    return regime ? labels[regime] || regime : 'Não informado';
  };

  const getSimulationSummary = (sim: Simulation) => {
    if (sim.calculator_slug === 'split-payment') {
      const outputs = sim.outputs as { mensal_min?: number; mensal_max?: number };
      if (outputs.mensal_min && outputs.mensal_max) {
        return `Impacto: ${formatCurrency(outputs.mensal_min)} - ${formatCurrency(outputs.mensal_max)}/mês`;
      }
    }
    if (sim.calculator_slug === 'comparativo-regimes') {
      const outputs = sim.outputs as { melhor_opcao?: string; economia_anual?: number };
      if (outputs.melhor_opcao) {
        const economia = outputs.economia_anual ? ` · Economia: ${formatCurrency(outputs.economia_anual)}/ano` : '';
        return `Melhor: ${getRegimeLabel(outputs.melhor_opcao)}${economia}`;
      }
    }
    return 'Ver detalhes';
  };

  const progressPercent = planLimit === -1 ? 0 : Math.min((simulationsThisMonth / planLimit) * 100, 100);

  return (
    <DashboardLayout title="Dashboard">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Olá, {profile?.nome?.split(' ')[0] || 'Usuário'} 👋
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo ao seu painel de inteligência tributária.
          </p>
        </div>

        {/* Clara Card - Expert AI Assistant */}
        <div className="mb-4">
          <ClaraCard />
        </div>

        {/* Getting Started CTA - Opens Clara with personalized welcome */}
        <div className="mb-8">
          <Button 
            size="lg" 
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all group"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('openClaraWithWelcome', { 
                detail: { type: 'getting-started' } 
              }));
            }}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Por onde eu começo?
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Plan Status Card */}
        <Card className="mb-8 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">Seu plano:</span>
                  <span className="text-sm font-semibold text-primary">
                    {PLAN_LIMITS[currentPlan]?.label || 'Grátis'}
                  </span>
                </div>
                
                {planLimit !== -1 && (
                  <>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Simulações este mês:</span>
                      <span className="font-medium">{simulationsThisMonth} de {planLimit}</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </>
                )}

                {planLimit === -1 && (
                  <p className="text-sm text-muted-foreground">
                    Simulações ilimitadas ✓
                  </p>
                )}
              </div>

              {currentPlan === 'FREE' && (
                <Link to="/#planos">
                  <Button className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Fazer upgrade
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tool Groups */}
        <div className="space-y-10">
          {toolGroups.map((group, groupIndex) => {
            const GroupIcon = group.icon;
            return (
              <section key={group.title}>
                {groupIndex > 0 && <Separator className="mb-8" />}
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GroupIcon className="w-5 h-5 text-primary" />
                  {group.title}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((tool) => {
                    const Icon = tool.icon;
                    const canAccess = hasAccess(tool.requiredPlan);
                    const isDisabled = tool.disabled || !canAccess;

                    return (
                      <Card 
                        key={tool.href} 
                        className={`transition-all ${isDisabled ? 'opacity-60' : 'hover:shadow-md hover:border-primary/30'}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              isDisabled ? 'bg-muted' : 'bg-primary/10'
                            }`}>
                              {isDisabled ? (
                                <Lock className="w-6 h-6 text-muted-foreground" />
                              ) : (
                                <Icon className="w-6 h-6 text-primary" />
                              )}
                            </div>
                            {tool.badge && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                isDisabled 
                                  ? 'bg-muted text-muted-foreground' 
                                  : 'bg-primary/10 text-primary'
                              }`}>
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-lg mt-3">{tool.name}</CardTitle>
                          <CardDescription>{tool.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {isDisabled ? (
                            <Button variant="outline" disabled className="w-full">
                              <Lock className="w-4 h-4 mr-2" />
                              {tool.requiredPlan ? `Plano ${tool.requiredPlan}` : 'Em breve'}
                            </Button>
                          ) : (
                            <Button asChild className="w-full">
                              <Link to={tool.href}>
                                Acessar
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Link>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Recent Simulations */}
        <section className="mt-12">
          <Separator className="mb-8" />
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Suas Últimas Simulações
            </h2>
            {simulations.length > 0 && (
              <Link to="/historico" className="text-primary hover:underline text-sm">
                Ver histórico completo →
              </Link>
            )}
          </div>

          {simulations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calculator className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-foreground mb-2">
                  Você ainda não fez nenhuma simulação
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Que tal começar pelo Comparativo de Regimes?
                </p>
                <Button asChild>
                  <Link to="/calculadora/comparativo-regimes">
                    Fazer minha primeira simulação
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {simulations.map((sim) => (
                    <div 
                      key={sim.id} 
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {sim.calculator_slug}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getSimulationSummary(sim)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatBrasilia(sim.created_at, "dd/MM/yyyy")}
                        </span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/simulacao/${sim.id}`}>
                            Ver
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
