import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/useFeatureAccess";
import { FeatureGate } from "@/components/FeatureGate";
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface Prazo {
  id: string;
  titulo: string;
  descricao: string | null;
  data_prazo: string;
  tipo: string;
  afeta_regimes: string[];
  afeta_setores: string[];
}

interface TimelineYear {
  year: number;
  title: string;
  description: string;
  prazos: Prazo[];
  actions: string[];
}

const TIMELINE_DATA: Omit<TimelineYear, 'prazos'>[] = [
  {
    year: 2026,
    title: "Fase de Testes",
    description: "Período de adaptação com alíquotas de teste (CBS 0,9% + IBS 0,1%). ERPs precisam ser atualizados.",
    actions: [
      "Atualizar sistema ERP para novos campos fiscais",
      "Treinar equipe sobre novas regras",
      "Mapear produtos e NCMs afetados",
      "Revisar contratos com fornecedores"
    ]
  },
  {
    year: 2027,
    title: "CBS Entra em Vigor",
    description: "CBS substitui PIS/COFINS com alíquota de 8,8%. Split Payment obrigatório para B2B a partir de julho.",
    actions: [
      "Implementar Split Payment no fluxo de pagamentos",
      "Adequar precificação aos novos tributos",
      "Validar créditos tributários do período anterior",
      "Atualizar documentação fiscal"
    ]
  },
  {
    year: 2028,
    title: "Consolidação do CBS",
    description: "Segundo ano do CBS em vigor. Empresas devem estar plenamente adaptadas ao novo sistema federal.",
    actions: [
      "Auditar processos de apuração do CBS",
      "Otimizar aproveitamento de créditos federais",
      "Preparar sistemas para entrada do IBS",
      "Revisar margens considerando novo cenário"
    ]
  },
  {
    year: 2029,
    title: "Início da Transição ICMS/ISS",
    description: "Começa a redução gradual de ICMS e ISS com entrada proporcional do IBS estadual e municipal.",
    actions: [
      "Monitorar alíquotas estaduais em redução",
      "Ajustar planejamento tributário",
      "Revisar benefícios fiscais estaduais",
      "Atualizar cálculos de margem"
    ]
  },
  {
    year: 2030,
    title: "Transição em Andamento",
    description: "ICMS e ISS reduzidos em 10%. IBS ganha participação crescente na tributação sobre consumo.",
    actions: [
      "Acompanhar reduções progressivas de ICMS/ISS",
      "Validar cálculos híbridos (antigo + novo)",
      "Treinar equipe em apuração dual",
      "Revisar contratos de longo prazo"
    ]
  },
  {
    year: 2031,
    title: "Aceleração da Transição",
    description: "ICMS e ISS com reduções mais significativas. IBS assume papel cada vez maior.",
    actions: [
      "Intensificar preparação para fim do regime antigo",
      "Migrar processos remanescentes",
      "Atualizar sistemas para cenário majoritário IBS",
      "Planejar extinção de rotinas ICMS/ISS"
    ]
  },
  {
    year: 2032,
    title: "Transição Avançada",
    description: "ICMS e ISS em níveis mínimos. IBS assume maior parte da tributação sobre consumo.",
    actions: [
      "Finalizar migração de sistemas legados",
      "Consolidar processos do novo regime",
      "Treinar novos colaboradores no sistema unificado",
      "Revisar estratégia de precificação final"
    ]
  },
  {
    year: 2033,
    title: "Sistema Novo Completo",
    description: "ICMS e ISS extintos. CBS + IBS (federal + estadual + municipal) formam o IVA brasileiro unificado.",
    actions: [
      "Desativar processos do regime antigo",
      "Otimizar aproveitamento de créditos unificados",
      "Revisar estratégia tributária de longo prazo",
      "Celebrar a conclusão da transição! 🎉"
    ]
  },
];

const REGIMES = [
  { value: 'simples', label: 'Simples Nacional' },
  { value: 'presumido', label: 'Lucro Presumido' },
  { value: 'real', label: 'Lucro Real' },
];

const SETORES = [
  { value: 'comercio', label: 'Comércio' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'industria', label: 'Indústria' },
];

export default function TimelineReforma() {
  const { profile } = useAuth();
  const { isNavigator } = usePlanAccess();
  const [prazos, setPrazos] = useState<Prazo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedYears, setExpandedYears] = useState<number[]>([2026]); // Only 2026 expanded by default
  const [selectedRegime, setSelectedRegime] = useState<string>(profile?.regime?.toLowerCase() || 'presumido');
  const [selectedSetor, setSelectedSetor] = useState<string>(profile?.setor?.toLowerCase() || 'comercio');

  useEffect(() => {
    fetchPrazos();
  }, []);

  const fetchPrazos = async () => {
    const { data, error } = await supabase
      .from('prazos_reforma')
      .select('*')
      .eq('ativo', true)
      .order('data_prazo', { ascending: true });

    if (!error && data) {
      setPrazos(data);
    }
    setLoading(false);
  };

  // Filtra prazos por regime e setor selecionados
  const filterPrazos = (prazosList: Prazo[]) => {
    return prazosList.filter(p => {
      const matchRegime = !p.afeta_regimes?.length || p.afeta_regimes.includes(selectedRegime);
      const matchSetor = !p.afeta_setores?.length || p.afeta_setores.includes(selectedSetor);
      return matchRegime && matchSetor;
    });
  };

  // Agrupa prazos por ano
  const getTimelineWithPrazos = (): TimelineYear[] => {
    const filteredPrazos = filterPrazos(prazos);
    
    return TIMELINE_DATA.map(yearData => {
      const yearPrazos = filteredPrazos.filter(p => {
        const prazoYear = new Date(p.data_prazo).getFullYear();
        return prazoYear === yearData.year;
      });
      
      return {
        ...yearData,
        prazos: yearPrazos,
      };
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getCurrentYear = () => new Date().getFullYear();

  const toggleYear = (year: number) => {
    setExpandedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year)
        : [...prev, year]
    );
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'inicio':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'obrigacao':
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case 'extincao':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
    }
  };

  const timeline = getTimelineWithPrazos();

  return (
    <DashboardLayout title="Timeline da Reforma 2026-2033">
      <FeatureGate feature="timeline_reforma">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Timeline de Ação 2026-2033
            </h1>
            <p className="text-muted-foreground">
              O que você precisa fazer em cada etapa da reforma tributária, personalizado para seu negócio.
            </p>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Seu Regime Tributário</label>
                  <Select value={selectedRegime} onValueChange={setSelectedRegime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIMES.map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Seu Setor</label>
                  <Select value={selectedSetor} onValueChange={setSelectedSetor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SETORES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="relative">
              {/* Linha vertical */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-4">
                {timeline.map((yearData, index) => {
                  const isCurrentOrPast = yearData.year <= getCurrentYear();
                  const isCurrent = yearData.year === getCurrentYear();
                  const isExpanded = expandedYears.includes(yearData.year);
                  
                  return (
                    <div key={yearData.year} className="relative pl-12">
                      {/* Marker */}
                      <div className={`absolute left-4 w-5 h-5 rounded-full border-2 z-10 ${
                        isCurrent 
                          ? 'bg-primary border-primary animate-pulse' 
                          : isCurrentOrPast 
                            ? 'bg-success border-success' 
                            : 'bg-muted border-border'
                      }`} />
                      
                      {/* Connector line */}
                      {index < timeline.length - 1 && (
                        <div className="absolute left-[22px] top-5 w-0.5 h-full bg-border" />
                      )}

                      <Collapsible open={isExpanded} onOpenChange={() => toggleYear(yearData.year)}>
                        {/* Year Header - Always visible */}
                        <CollapsibleTrigger asChild>
                          <button className={`w-full text-left rounded-lg border transition-all ${
                            isCurrent 
                              ? 'border-primary/50 bg-primary/5 hover:bg-primary/10' 
                              : 'border-border hover:bg-accent'
                          }`}>
                            <div className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {isExpanded ? (
                                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                )}
                                <span className={`text-2xl font-bold ${
                                  isCurrent ? 'text-primary' : 'text-foreground'
                                }`}>
                                  {yearData.year}
                                </span>
                                <span className="text-lg font-medium text-muted-foreground hidden sm:inline">
                                  {yearData.title}
                                </span>
                                {isCurrent && (
                                  <Badge className="bg-primary/20 text-primary">
                                    Ano Atual
                                  </Badge>
                                )}
                                {isCurrentOrPast && !isCurrent && (
                                  <Badge variant="secondary">Concluído</Badge>
                                )}
                              </div>
                              
                              {/* Preview badges when collapsed */}
                              {!isExpanded && (
                                <div className="flex items-center gap-2">
                                  {yearData.prazos.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {yearData.prazos.length} prazo{yearData.prazos.length !== 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {yearData.actions.length} ações
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </button>
                        </CollapsibleTrigger>

                        {/* Expanded Content */}
                        <CollapsibleContent className="mt-2">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardDescription>{yearData.description}</CardDescription>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                              {/* Prazos específicos */}
                              {yearData.prazos.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    Prazos Importantes
                                  </h4>
                                  <div className="space-y-2">
                                    {yearData.prazos.map(prazo => {
                                      const daysUntil = getDaysUntil(prazo.data_prazo);
                                      const isPast = daysUntil < 0;
                                      
                                      return (
                                        <div 
                                          key={prazo.id}
                                          className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                                        >
                                          {getTipoIcon(prazo.tipo)}
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm">{prazo.titulo}</p>
                                            {prazo.descricao && (
                                              <p className="text-xs text-muted-foreground mt-0.5">
                                                {prazo.descricao}
                                              </p>
                                            )}
                                          </div>
                                          <div className="text-right">
                                            <p className="text-xs text-muted-foreground">
                                              {new Date(prazo.data_prazo).toLocaleDateString('pt-BR')}
                                            </p>
                                            {!isPast && (
                                              <p className="text-xs text-primary font-medium">
                                                {daysUntil} dias
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Ações recomendadas */}
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                                  <Briefcase className="w-4 h-4 text-primary" />
                                  O que fazer
                                </h4>
                                <ul className="space-y-1">
                                  {yearData.actions.map((action, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                      <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                      {action}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </CardContent>
                          </Card>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Quer simular o impacto da reforma no seu negócio?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Use nossas calculadoras para projetar cenários.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link to="/calculadora/split-payment">Split Payment</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/calculadora/comparativo-regimes">
                      Comparar Regimes
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
