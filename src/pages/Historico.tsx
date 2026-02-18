import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calculator, Clock, Search, Filter, ArrowRight, Trash2, Eye, FileText, Scale, DollarSign, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";
import { formatBrasilia, formatDistanceBrasilia } from "@/lib/dateUtils";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "@/hooks/use-toast";
import { useCompany } from "@/contexts/CompanyContext";

interface Simulation {
  id: string;
  calculator_slug: string;
  inputs: any;
  outputs: any;
  created_at: string;
}

const PLAN_CAN_PDF = ['PROFISSIONAL', 'PREMIUM'];

const Historico = () => {
  const { user, profile } = useAuth();
  const { currentCompany } = useCompany();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCalculator, setFilterCalculator] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("30d");
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const canGeneratePDF = PLAN_CAN_PDF.includes(profile?.plano || 'STARTER');

  useEffect(() => {
    const fetchSimulations = async () => {
      if (!user) return;

      let query = supabase
        .from('simulations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Filter by company if one is selected
      if (currentCompany?.id) {
        // Show simulations for current company OR legacy ones (null company_id)
        query = query.or(`company_id.eq.${currentCompany.id},company_id.is.null`);
      }

      // Apply period filter
      if (filterPeriod !== 'all') {
        const days = { '7d': 7, '30d': 30, '90d': 90 }[filterPeriod] || 30;
        const since = subDays(new Date(), days);
        query = query.gte('created_at', since.toISOString());
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching simulations:', error);
      } else {
        setSimulations(data || []);
      }
      
      setLoading(false);
    };

    fetchSimulations();
  }, [user, filterPeriod, currentCompany?.id]);

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

  const handleViewDetails = (sim: Simulation) => {
    setSelectedSimulation(sim);
    setIsDetailDialogOpen(true);
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

  const getCalculatorIcon = (slug: string) => {
    if (slug === 'split-payment') return <DollarSign className="w-5 h-5 text-success" />;
    return <Scale className="w-5 h-5 text-primary" />;
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

  const getInputSummary = (sim: Simulation) => {
    const inputs = sim.inputs || {};
    const faturamento = inputs.faturamento_mensal || inputs.faturamento;
    const setor = inputs.setor;
    const percentualPJ = inputs.percentual_vendas_pj;

    const parts = [];
    if (faturamento) parts.push(`Faturamento: ${formatCurrency(faturamento)}/mês`);
    if (setor) parts.push(`Setor: ${setor.charAt(0).toUpperCase() + setor.slice(1)}`);
    if (percentualPJ) parts.push(`${Math.round(percentualPJ * 100)}% vendas PJ`);

    return parts.join(' · ') || 'Sem dados';
  };

  const filteredSimulations = simulations.filter((sim) => {
    const matchesSearch = getCalculatorLabel(sim.calculator_slug)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filterCalculator === 'all' || sim.calculator_slug === filterCalculator;
    return matchesSearch && matchesFilter;
  });

  const uniqueCalculators = [...new Set(simulations.map((sim) => sim.calculator_slug))];

  const handleDownloadPDF = (sim: Simulation) => {
    if (!canGeneratePDF) {
      toast({
        title: "Recurso Premium",
        description: "Faça upgrade para o plano Profissional ou Premium para baixar PDFs.",
        variant: "destructive",
      });
      return;
    }
    // TODO: Implement PDF generation
    toast({
      title: "Em breve!",
      description: "A geração de PDF estará disponível em breve.",
    });
  };

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
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
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
                  <SelectValue placeholder="Calculadora" />
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
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

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
          <div className="space-y-4">
            {filteredSimulations.map((sim) => (
              <Card key={sim.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {getCalculatorIcon(sim.calculator_slug)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {getCalculatorLabel(sim.calculator_slug)}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatBrasilia(sim.created_at, "dd/MM/yyyy 'às' HH:mm")}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceBrasilia(sim.created_at)}
                        </p>
                      </div>
                      
                      <div className="mt-3 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {getInputSummary(sim)}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {getSimulationSummary(sim)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewDetails(sim)}
                          className="gap-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          Ver detalhes
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownloadPDF(sim)}
                          className={`gap-1.5 ${!canGeneratePDF ? 'opacity-50' : ''}`}
                          disabled={!canGeneratePDF}
                        >
                          <FileText className="w-4 h-4" />
                          PDF
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(sim.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {simulations.length > 0 && (
          <p className="text-sm text-muted-foreground text-center mt-6">
            Mostrando {filteredSimulations.length} de {simulations.length} simulações
          </p>
        )}

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedSimulation && getCalculatorIcon(selectedSimulation.calculator_slug)}
                {selectedSimulation && getCalculatorLabel(selectedSimulation.calculator_slug)}
              </DialogTitle>
              <DialogDescription>
                {selectedSimulation && formatBrasilia(selectedSimulation.created_at, "dd 'de' MMMM 'de' yyyy 'às' HH:mm")}
              </DialogDescription>
            </DialogHeader>
            
            {selectedSimulation && (
              <div className="space-y-6">
                {/* Inputs */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Dados da Simulação</h4>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    {Object.entries(selectedSimulation.inputs || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-foreground font-medium">
                          {typeof value === 'number' 
                            ? key.includes('percentual') 
                              ? `${Math.round((value as number) * 100)}%`
                              : formatCurrency(value as number)
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outputs */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Resultado</h4>
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
                    {Object.entries(selectedSimulation.outputs || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-foreground font-medium">
                          {typeof value === 'number' 
                            ? key.includes('percentual') 
                              ? `${value.toFixed(1)}%`
                              : formatCurrency(value as number)
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => handleDownloadPDF(selectedSimulation!)}
                disabled={!canGeneratePDF}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Baixar PDF
              </Button>
              <Button asChild className="gap-2">
                <Link to={`/calculadora/${selectedSimulation?.calculator_slug}`}>
                  <RefreshCw className="w-4 h-4" />
                  Refazer simulação
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Historico;
