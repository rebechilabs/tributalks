import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { 
  Loader2, 
  Target,
  Sparkles,
  Zap,
  TrendingUp,
  RefreshCw,
  Filter,
  UserCog,
  AlertCircle
} from "lucide-react";

interface Opportunity {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  match_score: number;
  match_reasons: string[];
  economia_anual_min: number;
  economia_anual_max: number;
  complexidade: string;
  tempo_implementacao?: string;
  risco_fiscal?: string;
  quick_win: boolean;
  alto_impacto: boolean;
  prioridade: number;
  tributos_afetados: string[];
}

interface MatchResult {
  success: boolean;
  total_opportunities: number;
  quick_wins: number;
  high_impact: number;
  economia_anual_min: number;
  economia_anual_max: number;
  opportunities: Opportunity[];
}

export default function Oportunidades() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [activeTab, setActiveTab] = useState("todas");

  const loadOpportunities = async (refresh = false) => {
    if (!user?.id) return;
    
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Check if profile exists
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

      // Call match function
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
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };

  const filteredOpportunities = () => {
    if (!result?.opportunities) return [];
    
    switch (activeTab) {
      case "quick":
        return result.opportunities.filter(o => o.quick_win);
      case "impacto":
        return result.opportunities.filter(o => o.alto_impacto);
      case "todas":
      default:
        return result.opportunities;
    }
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

  // No profile - show CTA to complete profile
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

  // No opportunities found
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Oportunidades Tributárias
            </h1>
            <p className="text-muted-foreground">
              Identificamos {result.total_opportunities} oportunidades para sua empresa
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard/perfil-empresa')}
            >
              <UserCog className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => loadOpportunities(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Economia Potencial</p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(result.economia_anual_min)} - {formatCurrency(result.economia_anual_max)}
                    <span className="text-sm font-normal">/ano</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Target className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Identificadas</p>
                  <p className="text-lg font-bold">{result.total_opportunities}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quick Wins</p>
                  <p className="text-lg font-bold text-green-700">{result.quick_wins}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alto Impacto</p>
                  <p className="text-lg font-bold text-amber-700">{result.high_impact}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Grid */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="todas" className="gap-2">
              <Filter className="h-4 w-4" />
              Todas ({result.total_opportunities})
            </TabsTrigger>
            <TabsTrigger value="quick" className="gap-2">
              <Zap className="h-4 w-4" />
              Quick Wins ({result.quick_wins})
            </TabsTrigger>
            <TabsTrigger value="impacto" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Alto Impacto ({result.high_impact})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOpportunities().map((opportunity) => (
                <OpportunityCard 
                  key={opportunity.id} 
                  opportunity={opportunity}
                  onSelect={(id) => {
                    toast({
                      title: "Em breve!",
                      description: "Detalhes da oportunidade em desenvolvimento.",
                    });
                  }}
                />
              ))}
            </div>

            {filteredOpportunities().length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhuma oportunidade nesta categoria.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Precisa de ajuda para implementar?</h3>
              <p className="text-muted-foreground">
                Nossos especialistas podem auxiliar na implementação das oportunidades identificadas.
              </p>
            </div>
            <Button onClick={() => navigate('/consultorias')}>
              Agendar Consultoria
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
