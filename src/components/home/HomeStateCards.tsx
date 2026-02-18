import { Link } from "react-router-dom";
import { 
  BarChart3, Trophy, FileText, Plug, CheckCircle2, ArrowRight,
  Sparkles, TrendingUp, AlertCircle, Target, Coins, Gift, Scale, DollarSign
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HomeStateData } from "@/hooks/useHomeState";

interface HomeStateCardsProps {
  stateData: HomeStateData;
  userName?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

// Module Header Component
function ModuleHeader({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) {
  return (
    <div className="text-center space-y-3 mb-6">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
        <Icon className="w-5 h-5" />
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <p className="text-muted-foreground max-w-md mx-auto">
        {description}
      </p>
    </div>
  );
}

// Upcoming Step Card
function UpcomingStepCard({ 
  step, 
  icon: Icon, 
  title, 
  description 
}: { 
  step: number;
  icon: React.ElementType; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-muted-foreground">{step}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-medium">{title}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// State: NO_DRE - User needs to fill DRE first
export function NoDRECard({ hasERP }: { hasERP: boolean }) {
  return (
    <div className="space-y-6">
      <ModuleHeader 
        icon={BarChart3}
        title="MÓDULO: ENTENDER MEU NEGÓCIO"
        description="Aqui você terá a oportunidade de entender a saúde tributária da sua empresa através de diagnósticos inteligentes."
      />

      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">PASSO 1</Badge>
              </div>
              <CardTitle className="mt-1">Preencha seu DRE</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A <strong>Demonstração do Resultado do Exercício</strong> apresentará como resultado final 
            o lucro líquido ou prejuízo líquido do período da sua empresa.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link to="/dashboard/integracoes" className="flex items-center gap-2">
                <Plug className="w-4 h-4" />
                Conectar ERP
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/dashboard/entender/dre" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Preencher Manualmente
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Próximos passos após o DRE:</p>
        <div className="grid gap-2">
          <UpcomingStepCard 
            step={2}
            icon={Trophy}
            title="Score Tributário"
            description="Um panorama da situação tributária atual da empresa em uma escala de 0 a 1000 pontos."
          />
          <UpcomingStepCard 
            step={3}
            icon={Scale}
            title="Comparativo de Regimes"
            description="Compare os regimes tributários e descubra qual é o mais vantajoso para sua empresa."
          />
          <UpcomingStepCard 
            step={4}
            icon={DollarSign}
            title="Margem Ativa"
            description="Precifique seus produtos e serviços com inteligência tributária embutida."
          />
          <UpcomingStepCard 
            step={5}
            icon={Coins}
            title="Radar de Créditos"
            description="Identifica tributos pagos indevidamente nos últimos 5 anos que podem ser recuperados."
          />
          <UpcomingStepCard 
            step={6}
            icon={Gift}
            title="Oportunidades"
            description="Benefícios fiscais e incentivos aplicáveis ao perfil do seu negócio."
          />
        </div>
      </div>
    </div>
  );
}

// State: NO_SCORE - User has DRE but needs Score
export function NoScoreCard({ dreData }: { dreData: NonNullable<HomeStateData['dreData']> }) {
  return (
    <div className="space-y-6">
      <ModuleHeader 
        icon={BarChart3}
        title="MÓDULO: ENTENDER MEU NEGÓCIO"
        description="Seu DRE está preenchido! Agora vamos descobrir sua nota tributária."
      />

      <div className="flex items-center justify-center gap-2 text-green-500">
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-sm font-medium">DRE preenchido com sucesso</span>
      </div>

      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">PRÓXIMO PASSO</Badge>
              </div>
              <CardTitle className="mt-1">Calcule seu Score Tributário</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            O <strong>Score Tributário</strong> apresenta um panorama completo da situação tributária 
            atual da sua empresa em uma escala de <strong>0 a 1000 pontos</strong>, indicando riscos 
            e oportunidades de melhoria.
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/dashboard/entender/score" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Calcular Score
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Próximos passos:</p>
        <div className="grid gap-2">
          <UpcomingStepCard 
            step={3}
            icon={Scale}
            title="Comparativo de Regimes"
            description="Compare os regimes tributários e descubra qual é o mais vantajoso para sua empresa."
          />
          <UpcomingStepCard 
            step={4}
            icon={DollarSign}
            title="Margem Ativa"
            description="Precifique seus produtos e serviços com inteligência tributária embutida."
          />
          <UpcomingStepCard 
            step={5}
            icon={Coins}
            title="Radar de Créditos"
            description="Identifica tributos pagos indevidamente nos últimos 5 anos que podem ser recuperados."
          />
          <UpcomingStepCard 
            step={6}
            icon={Gift}
            title="Oportunidades"
            description="Benefícios fiscais e incentivos aplicáveis ao perfil do seu negócio."
          />
        </div>
      </div>
    </div>
  );
}

// State: NO_CREDITS - User has DRE and Score but no credits analysis
export function NoCreditsCard({ 
  dreData, 
  scoreData 
}: { 
  dreData: NonNullable<HomeStateData['dreData']>;
  scoreData: NonNullable<HomeStateData['scoreData']>;
}) {
  return (
    <div className="space-y-6">
      <ModuleHeader 
        icon={Coins}
        title="MÓDULO: RECUPERAR MEU DINHEIRO"
        description="Hora de identificar valores que sua empresa pode ter pago a mais em tributos."
      />

      <div className="flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-green-500">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm">DRE preenchido</span>
        </div>
        <div className="flex items-center gap-2 text-green-500">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm">Score: {scoreData.score} pontos</span>
        </div>
      </div>

      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">PRÓXIMO PASSO</Badge>
              </div>
              <CardTitle className="mt-1">Identifique Créditos Tributários</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            O <strong>Radar de Créditos</strong> analisa seus XMLs de notas fiscais para encontrar 
            tributos pagos indevidamente <strong>nos últimos 5 anos</strong> que podem ser recuperados.
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/dashboard/recuperar/radar" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Ir para Radar de Créditos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Quick Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Resumo do seu negócio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold">{formatCurrency(dreData.receitaBruta)}</p>
              <p className="text-xs text-muted-foreground">Receita Mensal</p>
            </div>
            <div>
              <p className="text-lg font-bold">{formatPercentage(dreData.margemLiquida)}</p>
              <p className="text-xs text-muted-foreground">Margem Líquida</p>
            </div>
            <div>
              <p className="text-lg font-bold">{scoreData.score}</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// State: COMPLETE - User has everything filled
export function CompleteCard({ 
  dreData, 
  scoreData, 
  creditsData,
  userName,
}: { 
  dreData: NonNullable<HomeStateData['dreData']>;
  scoreData: NonNullable<HomeStateData['scoreData']>;
  creditsData: NonNullable<HomeStateData['creditsData']>;
  userName?: string;
}) {
  const getScoreLevel = (score: number) => {
    if (score >= 800) return { label: 'Nível A', color: 'text-green-500' };
    if (score >= 600) return { label: 'Nível B', color: 'text-blue-500' };
    if (score >= 400) return { label: 'Nível C', color: 'text-amber-500' };
    return { label: 'Nível D', color: 'text-red-500' };
  };

  const scoreLevel = getScoreLevel(scoreData.score);

  return (
    <div className="space-y-6">
      <ModuleHeader 
        icon={Target}
        title="VISÃO GERAL DO SEU NEGÓCIO"
        description={`Parabéns${userName ? `, ${userName}` : ''}! Você completou a jornada inicial. Aqui está um resumo da saúde tributária da sua empresa.`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-2xl font-bold">{formatCurrency(dreData.receitaBruta)}</p>
              <p className="text-xs text-muted-foreground">Receita</p>
              <div className="flex items-center gap-1 text-green-500 text-xs">
                <TrendingUp className="w-3 h-3" />
                <span>+5%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-2xl font-bold">{formatPercentage(dreData.margemLiquida)}</p>
              <p className="text-xs text-muted-foreground">Margem</p>
              <p className="text-xs text-muted-foreground">estável</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-2xl font-bold">{scoreData.score}</p>
              <p className="text-xs text-muted-foreground">Score</p>
              <p className={cn("text-xs", scoreLevel.color)}>{scoreLevel.label}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-2xl font-bold">{formatCurrency(creditsData.totalCreditos)}</p>
              <p className="text-xs text-muted-foreground">Créditos</p>
              {creditsData.novosCreditos > 0 && (
                <Badge variant="default" className="text-xs">
                  {creditsData.novosCreditos} novos
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggested Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            Ações sugeridas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {creditsData.novosCreditos > 0 && (
            <Link 
              to="/dashboard/recuperar/radar" 
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <FileText className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">{creditsData.novosCreditos} novos créditos identificados no Radar</p>
                <p className="text-xs text-muted-foreground">Clique para ver detalhes</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          )}
          
          <Link 
            to="/dashboard/precificacao/split" 
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Simule o impacto do Split Payment na sua margem</p>
              <p className="text-xs text-muted-foreground">Prepare-se para 2026</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1">
          <Link to="/dashboard/comandar/nexus" className="flex items-center gap-2">
            Ver NEXUS Completo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link to="/clara-ai" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Falar com Clara
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function HomeStateCards({ stateData, userName }: HomeStateCardsProps) {
  switch (stateData.state) {
    case 'NO_DRE':
      return <NoDRECard hasERP={stateData.hasERP} />;
    case 'NO_SCORE':
      return <NoScoreCard dreData={stateData.dreData!} />;
    case 'NO_CREDITS':
      return <NoCreditsCard dreData={stateData.dreData!} scoreData={stateData.scoreData!} />;
    case 'COMPLETE':
      return (
        <CompleteCard 
          dreData={stateData.dreData!} 
          scoreData={stateData.scoreData!} 
          creditsData={stateData.creditsData!}
          userName={userName}
        />
      );
    default:
      return null;
  }
}
