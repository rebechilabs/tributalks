import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calculator, Wallet, Scale, FileText, Users, Calendar, 
  Lock, ArrowRight, Clock, Sparkles, Upload, Target, BarChart3,
  Trophy, Lightbulb, Newspaper, Building2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatBrasilia } from "@/lib/dateUtils";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ClaraCard } from "@/components/dashboard/ClaraCard";
import { ExecutiveSummaryCard } from "@/components/dashboard/ExecutiveSummaryCard";
import { ExpiringBenefitsAlert } from "@/components/dashboard/ExpiringBenefitsAlert";
import { ProgressSummary } from "@/components/dashboard/ProgressSummary";
import { DataSummaryCards } from "@/components/dashboard/DataSummaryCards";
import { NextStepRecommendation } from "@/components/dashboard/NextStepRecommendation";
import { LastActivityCard } from "@/components/dashboard/LastActivityCard";
import { InProgressWorkflows } from "@/components/dashboard/InProgressWorkflows";
import { NextRelevantDeadline } from "@/components/dashboard/NextRelevantDeadline";
import { ClaraContextualSuggestion } from "@/components/common/ClaraContextualSuggestion";
import { OnboardingChecklist, FirstMission, GuidedTour, QuickDiagnosticModal } from "@/components/onboarding";
import { StreakDisplay } from "@/components/achievements";
import { SwitchCompanyCard } from "@/components/profile/SwitchCompanyCard";
import { QuickAddCnpj } from "@/components/profile/QuickAddCnpj";
import { ClaraInsightsPanel, ClaraAutonomousPanel } from "@/components/clara";
import { SessionContextModal, MissionDashboard } from "@/components/roadmap";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAchievements } from "@/hooks/useAchievements";
import { useAdaptiveRoadmap, SessionContext } from "@/hooks/useAdaptiveRoadmap";
import { useQueryClient } from "@tanstack/react-query";
import { useGenerateInsights } from "@/hooks/useGenerateInsights";

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

// TribuTalks Inteligência Tributária - primeira seção após Clara
const gpsReformaItems: ToolItem[] = [
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
    icon: Calendar,
    requiredPlan: 'NAVIGATOR',
    badge: 'Novo'
  },
];

const toolGroups: ToolGroup[] = [
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
        icon: Scale
      },
      { 
        name: 'Calculadora RTC', 
        description: 'Calcule CBS/IBS/IS da Reforma',
        href: '/calculadora/rtc', 
        icon: Calculator,
        badge: 'API'
      },
    ]
  },
  {
    title: 'Diagnóstico',
    icon: Target,
    items: [
      { 
        name: 'Análise de Créditos Tributários', 
        description: 'XMLs + Créditos + Exposição',
        href: '/dashboard/analise-notas', 
        icon: FileText,
        requiredPlan: 'PROFESSIONAL',
        badge: 'Novo'
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
    icon: Sparkles,
    items: [
      { 
        name: 'Clara AI', 
        description: 'Copiloto de decisão tributária',
        href: '/clara-ai', 
        icon: Sparkles,
        badge: 'IA',
        requiredPlan: 'NAVIGATOR'
      },
      { 
        name: 'Comunidade', 
        description: 'Network com empresários',
        href: '/comunidade', 
        icon: Users,
        requiredPlan: 'PROFESSIONAL'
      },
    ]
  },
];

// Mapeamento de planos legados para novos
const LEGACY_PLAN_MAP: Record<string, string> = {
  'BASICO': 'NAVIGATOR',
  'PROFISSIONAL': 'PROFESSIONAL',
  'PREMIUM': 'ENTERPRISE',
  'STARTER': 'STARTER',
  'NAVIGATOR': 'NAVIGATOR',
  'PROFESSIONAL': 'PROFESSIONAL',
  'ENTERPRISE': 'ENTERPRISE',
};

const PLAN_LIMITS: Record<string, { simulations: number; label: string }> = {
  STARTER: { simulations: -1, label: 'Starter' },
  NAVIGATOR: { simulations: -1, label: 'Navigator' },
  PROFESSIONAL: { simulations: -1, label: 'Professional' },
  ENTERPRISE: { simulations: -1, label: 'Enterprise' },
};

const PLAN_HIERARCHY: Record<string, number> = {
  'STARTER': 0,
  'NAVIGATOR': 1,
  'PROFESSIONAL': 2,
  'ENTERPRISE': 3,
};

// Dashboard Skeleton for loading state
function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
      <Skeleton className="h-32 w-full mb-6 rounded-lg" />
      <Skeleton className="h-24 w-full mb-6 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </div>
  );
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [simulationsThisMonth, setSimulationsThisMonth] = useState(0);
  const [simulationsLoading, setSimulationsLoading] = useState(true);
  const [showQuickDiagnostic, setShowQuickDiagnostic] = useState(false);
  
  // Company profile data for CNPJ management
  const [companyProfile, setCompanyProfile] = useState<{ cnpj_principal: string | null; cnpjs_grupo: string[] } | null>(null);
  
  // Consolidated dashboard data hook - single batch request
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData();
  
  // Adaptive Roadmap - Jornada personalizada
  const { 
    roadmap, 
    preferences,
    shouldShowWelcome,
    isGenerating,
    generateRoadmap,
    completeStep,
    skipStep,
    submitFeedback,
    dismissWelcomeModal,
  } = useAdaptiveRoadmap();
  
  const [showSessionModal, setShowSessionModal] = useState(false);
  
  // Mostrar modal de contexto quando necessário
  useEffect(() => {
    if (shouldShowWelcome && !roadmap && !dashboardLoading) {
      // Delay para não aparecer imediatamente
      const timer = setTimeout(() => {
        setShowSessionModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowWelcome, roadmap, dashboardLoading]);
  
  const handleSessionSubmit = (context: SessionContext) => {
    generateRoadmap(context);
    setShowSessionModal(false);
  };
  
  const handleSessionSkip = () => {
    dismissWelcomeModal();
    setShowSessionModal(false);
  };
  
  const handleRefreshRoadmap = () => {
    setShowSessionModal(true);
  };
  
  // Gera insights proativos da Clara ao carregar (uma vez por sessão)
  useGenerateInsights();

  
  // Fetch company profile for CNPJ management
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('company_profile')
        .select('cnpj_principal, cnpjs_grupo')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setCompanyProfile({
          cnpj_principal: data.cnpj_principal,
          cnpjs_grupo: data.cnpjs_grupo || []
        });
      }
    };
    fetchCompanyProfile();
  }, [user?.id]);
  
  // Lazy achievement check (only once per session)
  const { checkAchievements } = useAchievements();
  const achievementChecked = useRef(false);
  
  useEffect(() => {
    if (user?.id && !achievementChecked.current && !dashboardLoading) {
      achievementChecked.current = true;
      // Delay achievement check to not block initial render
      setTimeout(() => {
        checkAchievements();
      }, 2000);
    }
  }, [user?.id, dashboardLoading]);

  // Check for quick diagnostic flag
  useEffect(() => {
    const needsDiagnostic = localStorage.getItem('needs_quick_diagnostic');
    if (needsDiagnostic === 'true') {
      setShowQuickDiagnostic(true);
    }
  }, []);

  const rawPlan = profile?.plano || 'STARTER';
  const currentPlan = LEGACY_PLAN_MAP[rawPlan] || 'STARTER';
  const planLimit = PLAN_LIMITS[currentPlan]?.simulations || 1;

  const hasAccess = (requiredPlan?: string) => {
    if (!requiredPlan) return true;
    const userLevel = PLAN_HIERARCHY[currentPlan] || 0;
    const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 0;
    return userLevel >= requiredLevel;
  };

  // Fetch simulations separately (less critical, can load after)
  useEffect(() => {
    const fetchSimulations = async () => {
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

      setSimulationsLoading(false);
    };

    fetchSimulations();
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

  // Show skeleton while loading critical data
  if (dashboardLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  // Extract data from consolidated hook
  const userProgress = dashboardData?.userProgress || {
    hasScore: false,
    hasXmls: false,
    hasDre: false,
    hasOpportunities: false,
    hasWorkflow: false,
    companyName: null,
    cnpj: null,
    scoreGrade: null,
    scoreTotal: null,
    scoreDate: null,
    xmlCount: 0,
    creditsTotal: 0,
    dreDate: null,
    opportunitiesCount: 0,
    workflowsCompleted: 0,
    workflowsInProgress: 0,
    lastActivity: { type: null, date: null, description: null, link: null },
    progressPercent: 0,
  };

  const handleDiagnosticComplete = () => {
    setShowQuickDiagnostic(false);
    // Optionally refresh data
  };

  const handleDiagnosticSkip = () => {
    setShowQuickDiagnostic(false);
  };

  return (
    <DashboardLayout title="Dashboard">
      {/* Session Context Modal - Adaptive Roadmap */}
      <SessionContextModal
        open={showSessionModal}
        onSubmit={handleSessionSubmit}
        onSkip={handleSessionSkip}
        isLoading={isGenerating}
        userName={profile?.nome}
      />
      
      {/* Quick Diagnostic Modal */}
      <QuickDiagnosticModal
        open={showQuickDiagnostic}
        onComplete={handleDiagnosticComplete}
        onSkip={handleDiagnosticSkip}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Olá, {profile?.nome?.split(' ')[0] || 'Usuário'} 👋
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo ao seu painel de inteligência tributária.
            </p>
          </div>
          <StreakDisplay streakData={dashboardData?.streakData} showLongest />
        </div>
        
        {/* 🎯 Adaptive Roadmap - Mission Dashboard */}
        {roadmap && preferences?.roadmapEnabled && (
          <div className="mb-6">
            <MissionDashboard
              roadmap={roadmap}
              onCompleteStep={completeStep}
              onSkipStep={skipStep}
              onFeedback={(feedback) => submitFeedback({ feedback })}
              onRefresh={handleRefreshRoadmap}
              isRefreshing={isGenerating}
            />
          </div>
        )}
        
        {/* Onboarding - First Mission (appears for new users) */}
        <div className="mb-6">
          <FirstMission />
        </div>
        
        {/* Onboarding Checklist (7 days) */}
        <div className="mb-6">
          <OnboardingChecklist />
        </div>

        {/* Alerta de Benefícios em Extinção */}
        <ExpiringBenefitsAlert benefits={dashboardData?.expiringBenefits || []} />

        {/* TribuChat - Clara Card (integra o CTA "Por onde começo") */}
        <div className="mb-6" data-tour="clara-card">
          <ClaraCard />
        </div>

        {/* Clara Insights - Alertas e recomendações proativos */}
        <div className="mb-6">
          <ClaraInsightsPanel maxInsights={3} />
        </div>

        {/* Clara Ações Autônomas - Aprovação/Rejeição */}
        <div className="mb-6">
          <ClaraAutonomousPanel maxHeight="300px" />
        </div>

        {/* Guided Tour */}
        <GuidedTour />

        {/* Progresso do Usuário - Nova seção */}
        <ProgressSummary progress={userProgress} />
        
        {/* Cards de Resumo de Dados */}
        <DataSummaryCards progress={userProgress} />
        
        {/* Próximo Passo Recomendado */}
        <NextStepRecommendation progress={userProgress} />
        
        {/* Workflows em Andamento */}
        <InProgressWorkflows workflows={dashboardData?.inProgressWorkflows || []} />
        
        {/* Última Atividade */}
        <LastActivityCard progress={userProgress} />
        
        {/* Próximo Prazo Relevante */}
        <NextRelevantDeadline prazo={dashboardData?.nextDeadline || null} />

        {/* Sugestão Contextual da Clara */}
        <ClaraContextualSuggestion currentRoute={location.pathname} className="mb-6" />

        {/* Gerenciamento de CNPJs - Card dedicado e visível */}
        {user?.id && companyProfile && (currentPlan === 'NAVIGATOR' || currentPlan === 'PROFESSIONAL' || currentPlan === 'ENTERPRISE') && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Gerenciar CNPJs do Grupo</h3>
                    <p className="text-sm text-muted-foreground">
                      Adicione outras empresas para análise consolidada
                    </p>
                  </div>
                </div>
                <QuickAddCnpj
                  userId={user.id}
                  userPlan={currentPlan}
                  cnpjPrincipal={companyProfile.cnpj_principal}
                  cnpjsGrupo={companyProfile.cnpjs_grupo}
                  onUpdate={() => {
                    queryClient.invalidateQueries({ queryKey: ['company-profile'] });
                    supabase
                      .from('company_profile')
                      .select('cnpj_principal, cnpjs_grupo')
                      .eq('user_id', user.id)
                      .maybeSingle()
                      .then(({ data }) => {
                        if (data) {
                          setCompanyProfile({
                            cnpj_principal: data.cnpj_principal,
                            cnpjs_grupo: data.cnpjs_grupo || []
                          });
                        }
                      });
                  }}
                  compact
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumo Executivo - Semáforo do CEO/CFO */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Diagnóstico Empresarial
            </h2>
          </div>
          <ExecutiveSummaryCard 
            thermometerData={dashboardData?.thermometerData || null} 
            scoreActions={dashboardData?.scoreActions || []}
            loading={false} 
            userPlan={currentPlan} 
          />
        </div>

        {/* TribuTalks Inteligência Tributária - Section right after Clara */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            TribuTalks
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gpsReformaItems.map((tool) => {
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

        {/* Plan Status + Switch Company */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="md:col-span-2 border-primary/20">
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

              {currentPlan === 'STARTER' && (
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
        
          {/* Switch Company Card */}
          <SwitchCompanyCard 
            companyName={userProgress?.companyName}
            cnpj={userProgress?.cnpj}
          />
        </div>

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
