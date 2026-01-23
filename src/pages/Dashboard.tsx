import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calculator, Wallet, Scale, FileText, Building, Lock, ChevronDown, User, LogOut, Edit, Clock, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Calculator {
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
  Building: Building,
};

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [calculators, setCalculators] = useState<Calculator[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);

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
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

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

  const getSetorLabel = (setor: string | null) => {
    const labels: Record<string, string> = {
      industria: 'Indústria',
      comercio: 'Comércio',
      servicos: 'Serviços',
      tecnologia: 'Tecnologia',
      outro: 'Outro',
    };
    return setor ? labels[setor] || setor : 'Não informado';
  };

  const getSimulationSummary = (sim: Simulation) => {
    if (sim.calculator_slug === 'split-payment') {
      const outputs = sim.outputs as { mensal_min?: number; mensal_max?: number };
      if (outputs.mensal_min && outputs.mensal_max) {
        return `Impacto: ${formatCurrency(outputs.mensal_min)} - ${formatCurrency(outputs.mensal_max)}/mês`;
      }
    }
    if (sim.calculator_slug === 'comparativo-regimes') {
      const outputs = sim.outputs as { melhor_opcao?: string };
      if (outputs.melhor_opcao) {
        return `Melhor: ${getRegimeLabel(outputs.melhor_opcao)}`;
      }
    }
    return 'Ver detalhes';
  };

  const getCalculatorName = (slug: string) => {
    const calc = calculators.find(c => c.slug === slug);
    return calc?.nome || slug;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Calculator className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">TribuTech</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline">{profile?.nome || 'Usuário'}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/perfil" className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Olá, {profile?.nome?.split(' ')[0] || 'Usuário'} 👋
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
            <span>Seu perfil:</span>
            <span className="px-2 py-1 bg-muted rounded text-sm">{getSetorLabel(profile?.setor)}</span>
            <span>·</span>
            <span className="px-2 py-1 bg-muted rounded text-sm">{getRegimeLabel(profile?.regime)}</span>
            <span>·</span>
            <span className="px-2 py-1 bg-muted rounded text-sm">
              {profile?.faturamento_mensal ? formatCurrency(profile.faturamento_mensal) + '/mês' : 'Faturamento não informado'}
            </span>
            <Link to="/perfil" className="text-primary hover:underline text-sm ml-2">
              Editar perfil
            </Link>
          </div>
        </div>

        {/* Calculators Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Calculadoras Disponíveis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <CardContent className="py-8 text-center text-muted-foreground">
                <Calculator className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Você ainda não realizou nenhuma simulação.</p>
                <p className="text-sm mt-1">Comece usando uma das calculadoras acima!</p>
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
      </main>
    </div>
  );
};

export default Dashboard;
