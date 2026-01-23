import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Clock, Search, Filter, ArrowRight, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "@/hooks/use-toast";

interface Simulation {
  id: string;
  calculator_slug: string;
  inputs: any;
  outputs: any;
  created_at: string;
}

const Historico = () => {
  const { user } = useAuth();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCalculator, setFilterCalculator] = useState("all");

  useEffect(() => {
    const fetchSimulations = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('simulations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching simulations:', error);
      } else {
        setSimulations(data || []);
      }
      
      setLoading(false);
    };

    fetchSimulations();
  }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('simulations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSimulations((prev) => prev.filter((sim) => sim.id !== id));
      toast({
        title: "Simulação excluída",
        description: "A simulação foi removida do histórico.",
      });
    }
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

  const getCalculatorLabel = (slug: string) => {
    const labels: Record<string, string> = {
      'comparativo-regimes': 'Comparativo de Regimes',
      'split-payment': 'Impacto Split Payment',
    };
    return labels[slug] || slug;
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

  const filteredSimulations = simulations.filter((sim) => {
    const matchesSearch = getCalculatorLabel(sim.calculator_slug)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filterCalculator === 'all' || sim.calculator_slug === filterCalculator;
    return matchesSearch && matchesFilter;
  });

  const uniqueCalculators = [...new Set(simulations.map((sim) => sim.calculator_slug))];

  return (
    <DashboardLayout title="Histórico de Simulações">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            Histórico de Simulações
          </h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as suas simulações anteriores.
          </p>
        </div>

        {/* Filters */}
        {simulations.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar simulações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCalculator} onValueChange={setFilterCalculator}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {uniqueCalculators.map((slug) => (
                  <SelectItem key={slug} value={slug}>
                    {getCalculatorLabel(slug)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando simulações...</p>
            </CardContent>
          </Card>
        ) : filteredSimulations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calculator className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              {simulations.length === 0 ? (
                <>
                  <h3 className="font-medium text-foreground mb-2">
                    Nenhuma simulação encontrada
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Você ainda não realizou nenhuma simulação.
                  </p>
                  <Button asChild>
                    <Link to="/calculadora/comparativo-regimes">
                      Fazer minha primeira simulação
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="font-medium text-foreground mb-2">
                    Nenhum resultado
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tente ajustar os filtros de busca.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredSimulations.map((sim) => (
                  <div 
                    key={sim.id} 
                    className="flex items-start sm:items-center justify-between p-4 hover:bg-muted/50 transition-colors gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {getCalculatorLabel(sim.calculator_slug)}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {getSimulationSummary(sim)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(sim.created_at), { addSuffix: true, locale: ptBR })} · {format(new Date(sim.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/simulacao/${sim.id}`}>
                          Ver
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(sim.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {simulations.length > 0 && (
          <p className="text-sm text-muted-foreground text-center mt-6">
            {filteredSimulations.length} de {simulations.length} simulações
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Historico;
