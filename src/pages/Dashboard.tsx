import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, Wallet, Scale, FileText, Bot, Users, Calendar, 
  Lock, ArrowRight, Clock, Sparkles 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wallet: Wallet,
  Scale: Scale,
  FileText: FileText,
  Bot: Bot,
  Users: Users,
  Calendar: Calendar,
};

const PLAN_LIMITS = {
  FREE: { simulations: 1, label: 'Grátis' },
  BASICO: { simulations: -1, label: 'Básico' },
  PROFISSIONAL: { simulations: -1, label: 'Profissional' },
  PREMIUM: { simulations: -1, label: 'Premium' },
};

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [calculators, setCalculators] = useState<CalcItem[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [simulationsThisMonth, setSimulationsThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentPlan = (profile?.plano || 'FREE') as keyof typeof PLAN_LIMITS;
  const planLimit = PLAN_LIMITS[currentPlan]?.simulations || 1;

  useEffect(() => {
    const fetchData = async () => {
      // Fetch calculators
      const { data: calcsData } = await supabase
        .from('calculators')
        .select('*')
        .order('ordem');
      
      if (calcsData) {
        setCalculators(calcsData);
      }

      // Fetch recent simulations
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

  const getCalculatorName = (slug: string) => {
    const calc = calculators.find(c => c.slug === slug);
    return calc?.nome || slug;
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

        {/* Calculators Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Ferramentas Disponíveis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calculators.map((calc) => {
              const IconComponent = iconMap[calc.icone] || Calculator;
              const isDisabled = calc.status !== 'ATIVO';

              return (
                <Card 
                  key={calc.id} 
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
                          <IconComponent className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      {isDisabled && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          Em breve
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-3">{calc.nome}</CardTitle>
                    <CardDescription>{calc.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isDisabled ? (
                      <Button variant="outline" disabled className="w-full">
                        <Lock className="w-4 h-4 mr-2" />
                        Em breve
                      </Button>
                    ) : (
                      <Button asChild className="w-full">
                        <Link to={`/calculadora/${calc.slug}`}>
                          Simular agora
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

        {/* Recent Simulations */}
        <section>
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
                          {getCalculatorName(sim.calculator_slug)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getSimulationSummary(sim)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(new Date(sim.created_at), "dd/MM/yyyy", { locale: ptBR })}
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
