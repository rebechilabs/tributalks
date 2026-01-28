import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { OpportunityDetailCard } from "@/components/opportunities/OpportunityDetailCard";
import { OpportunitySummary } from "@/components/opportunities/OpportunitySummary";
import { OpportunityDetailModal } from "@/components/opportunities/OpportunityDetailModal";
import { 
  Loader2, 
  Target,
  Sparkles,
  Zap,
  TrendingUp,
  RefreshCw,
  UserCog,
  AlertCircle,
  Download,
  Mail,
  Phone,
  Pencil
} from "lucide-react";

interface Opportunity {
  id: string;
  code: string;
  name: string;
  name_simples?: string;
  description?: string;
  description_ceo?: string;
  category: string;
  match_score: number;
  match_reasons: string[];
  economia_anual_min: number;
  economia_anual_max: number;
  economia_mensal_min?: number;
  economia_mensal_max?: number;
  complexidade: string;
  tempo_implementacao?: string;
  risco_fiscal?: string;
  risco_descricao?: string;
  quick_win: boolean;
  alto_impacto: boolean;
  prioridade: number;
  tributos_afetados: string[];
  base_legal?: string;
  base_legal_resumo?: string;
  link_legislacao?: string;
  exemplo_pratico?: string;
  faq?: Array<{ pergunta: string; resposta: string }>;
  passos_implementacao?: string[];
  requer_contador?: boolean;
  requer_advogado?: boolean;
  status_lc_224_2025?: string;
  descricao_lc_224_2025?: string;
  futuro_reforma?: string;
  descricao_reforma?: string;
}

interface CategorySummary {
  count: number;
  economia_min: number;
  economia_max: number;
}

interface MatchResult {
  success: boolean;
  total_opportunities: number;
  quick_wins: number;
  high_impact: number;
  economia_anual_min: number;
  economia_anual_max: number;
  opportunities: Opportunity[];
  por_categoria?: Record<string, CategorySummary>;
  por_tributo?: Record<string, CategorySummary>;
  profile_summary?: {
    setor?: string;
    porte?: string;
    regime?: string;
    qtd_cnpjs?: number;
    faturamento_mensal?: number;
    percentual_produtos?: number;
  };
}

const SETOR_LABELS: Record<string, string> = {
  comercio: 'Comércio',
  industria: 'Indústria',
  servicos: 'Serviços',
  tecnologia: 'Tecnologia',
  saude: 'Saúde',
  educacao: 'Educação',
  agronegocio: 'Agronegócio',
  construcao: 'Construção',
};

const PORTE_LABELS: Record<string, string> = {
  mei: 'MEI',
  micro: 'Microempresa',
  pequena: 'Pequena empresa',
  media: 'Média empresa',
  grande: 'Grande empresa',
};

const REGIME_LABELS: Record<string, string> = {
  simples: 'Simples Nacional',
  presumido: 'Lucro Presumido',
  real: 'Lucro Real',
};

export default function Oportunidades() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadOpportunities = async (refresh = false) => {
    if (!user?.id) return;
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const { data: profile } = await supabase
        .from('company_profile')
        .select('perfil_completo')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile?.perfil_completo) {
        setHasProfile(false);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      setHasProfile(true);

      const { data, error } = await supabase.functions.invoke('match-opportunities', {
        body: { user_id: user.id }
      });

      if (error) throw error;

      setResult(data as MatchResult);

    } catch (error) {
      console.error('Error loading opportunities:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as oportunidades.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [user?.id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const quickWins = result?.opportunities?.filter(o => o.quick_win) || [];
  const altoImpacto = result?.opportunities?.filter(o => o.alto_impacto && !o.quick_win) || [];
  const outras = result?.opportunities?.filter(o => !o.quick_win && !o.alto_impacto) || [];

  const handleViewDetails = (id: string) => {
    const opp = result?.opportunities?.find(o => o.id === id);
    if (opp) {
      setSelectedOpportunity(opp);
      setIsModalOpen(true);
    }
  };

  const handleImplement = (id: string) => {
    const opp = result?.opportunities?.find(o => o.id === id);
    if (opp) {
      setSelectedOpportunity(opp);
      setIsModalOpen(true);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    if (!user?.id) return;
    
    try {
      await supabase
        .from('company_opportunities')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('opportunity_id', id)
        .eq('user_id', user.id);
      
      // Refresh the list
      loadOpportunities(true);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getProfileSummary = () => {
    if (!result?.profile_summary) return '';
    const { setor, porte, qtd_cnpjs, regime } = result.profile_summary;
    const parts = [];
    if (setor) parts.push(SETOR_LABELS[setor] || setor);
    if (porte) parts.push(PORTE_LABELS[porte] || porte);
    if (qtd_cnpjs && qtd_cnpjs > 1) parts.push(`${qtd_cnpjs} CNPJs`);
    if (regime) parts.push(REGIME_LABELS[regime] || regime);
    return parts.join(' • ');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!hasProfile) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card className="border-2 border-dashed border-muted-foreground/25">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                Descubra Suas Oportunidades Tributárias
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Para identificar oportunidades de economia específicas para sua empresa, 
                precisamos conhecer melhor seu negócio.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Análise personalizada</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>5 minutos</span>
                </div>
              </div>
              <Button 
                size="lg" 
                className="gap-2"
                onClick={() => navigate('/dashboard/perfil-empresa')}
              >
                Completar Perfil da Empresa
                <Target className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!result?.opportunities?.length) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle>Nenhuma Oportunidade Encontrada</CardTitle>
              <CardDescription>
                Com base no seu perfil atual, não identificamos oportunidades tributárias aplicáveis.
                Isso pode mudar conforme sua empresa evolui.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => navigate('/dashboard/perfil-empresa')}
              >
                <UserCog className="h-4 w-4" />
                Atualizar Perfil
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ============ HEADER COM IMPACTO TOTAL ============ */}
        <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6 md:p-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Sparkles className="h-6 w-6" />
                <h1 className="text-2xl md:text-3xl font-bold">Oportunidades Tributárias</h1>
              </div>
              
              <p className="text-muted-foreground">
                Identificamos oportunidades de economia para sua empresa:
              </p>

              {/* Big number card */}
              <div className="max-w-xl mx-auto bg-card border-2 border-primary/30 rounded-xl p-6 shadow-lg">
                <p className="text-sm text-muted-foreground mb-1">ECONOMIA POTENCIAL:</p>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  {formatCurrency(result.economia_anual_min)} a {formatCurrency(result.economia_anual_max)}
                  <span className="text-lg font-normal text-muted-foreground">/ano</span>
                </p>
                <p className="text-muted-foreground mt-2">
                  {result.total_opportunities} oportunidades encontradas
                </p>
              </div>

              {/* Profile summary */}
              {getProfileSummary() && (
                <p className="text-sm text-muted-foreground">
                  Seu perfil: <span className="font-medium text-foreground">{getProfileSummary()}</span>
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                  onClick={() => navigate('/dashboard/perfil-empresa')}
                >
                  <Pencil className="h-4 w-4" />
                  Atualizar Perfil
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                  onClick={() => toast({ title: "Em breve", description: "Exportação de relatório em desenvolvimento." })}
                >
                  <Download className="h-4 w-4" />
                  Exportar Relatório
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => loadOpportunities(true)}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ============ QUICK WINS ============ */}
        {quickWins.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent rounded-lg">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Quick Wins - Implementação Rápida</h2>
                <p className="text-sm text-muted-foreground">
                  Comece por estas: fáceis de implementar, retorno imediato
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                {quickWins.length} {quickWins.length === 1 ? 'oportunidade' : 'oportunidades'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {quickWins.map((opp) => (
                <OpportunityDetailCard
                  key={opp.id}
                  opportunity={opp}
                  onViewDetails={handleViewDetails}
                  onImplement={handleImplement}
                />
              ))}
            </div>
          </section>
        )}

        {/* ============ ALTO IMPACTO ============ */}
        {altoImpacto.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg">
                <TrendingUp className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Alto Impacto - Maior Economia</h2>
                <p className="text-sm text-muted-foreground">
                  Exigem mais trabalho, mas o retorno compensa
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                {altoImpacto.length} {altoImpacto.length === 1 ? 'oportunidade' : 'oportunidades'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {altoImpacto.map((opp) => (
                <OpportunityDetailCard
                  key={opp.id}
                  opportunity={opp}
                  onViewDetails={handleViewDetails}
                  onImplement={handleImplement}
                />
              ))}
            </div>
          </section>
        )}

        {/* ============ OUTRAS OPORTUNIDADES ============ */}
        {outras.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Outras Oportunidades</h2>
                <p className="text-sm text-muted-foreground">
                  Mais opções para análise
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                {outras.length} {outras.length === 1 ? 'oportunidade' : 'oportunidades'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {outras.map((opp) => (
                <OpportunityDetailCard
                  key={opp.id}
                  opportunity={opp}
                  onViewDetails={handleViewDetails}
                  onImplement={handleImplement}
                />
              ))}
            </div>
          </section>
        )}

        {/* ============ RESUMO POR CATEGORIA ============ */}
        {(result.por_categoria || result.por_tributo) && (
          <OpportunitySummary
            byCategory={result.por_categoria || {}}
            byTributo={result.por_tributo || {}}
            totalMax={result.economia_anual_max}
          />
        )}

        {/* ============ FOOTER CTA ============ */}
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex flex-wrap justify-center gap-3">
                <Button 
                  variant="outline"
                  className="gap-2"
                  onClick={() => toast({ title: "Em breve", description: "Download do relatório em desenvolvimento." })}
                >
                  <Download className="h-4 w-4" />
                  Baixar Relatório Completo
                </Button>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                <Button 
                  variant="ghost"
                  className="gap-2"
                  onClick={() => toast({ title: "Em breve", description: "Funcionalidade em desenvolvimento." })}
                >
                  <Mail className="h-4 w-4" />
                  Enviar para meu Contador
                </Button>
                <Button 
                  className="gap-2"
                  onClick={() => navigate('/consultorias')}
                >
                  <Phone className="h-4 w-4" />
                  Falar com Especialista
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Detalhes */}
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          profileData={{
            faturamento_mensal: result?.profile_summary?.faturamento_mensal,
            percentual_produtos: result?.profile_summary?.percentual_produtos,
          }}
          onStatusChange={handleStatusChange}
        />
      </div>
    </DashboardLayout>
  );
}
