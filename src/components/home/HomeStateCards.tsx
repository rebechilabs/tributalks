import { Link } from "react-router-dom";
import { 
  BarChart3, Trophy, FileText, Plug, CheckCircle2, ArrowRight,
  Sparkles, TrendingUp, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

// State: NO_DRE - User needs to fill DRE first
export function NoDRECard({ hasERP }: { hasERP: boolean }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Bem-vindo ao TribuTalks!</h1>
        <p className="text-muted-foreground">
          Para começar, precisamos entender seu negócio.
        </p>
      </div>

      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>PASSO 1: Preencha seu DRE</CardTitle>
              <CardDescription>
                O DRE é a base para todas as análises. Leva apenas 3 minutos.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground font-medium">Próximos passos após o DRE:</p>
        <div className="grid gap-2">
          {[
            { icon: Trophy, label: 'Calcular seu Score Tributário' },
            { icon: FileText, label: 'Identificar créditos no Radar' },
            { icon: Sparkles, label: 'Ver oportunidades de economia' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-6 h-6 rounded-full border flex items-center justify-center">
                <step.icon className="w-3 h-3" />
              </div>
              {step.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// State: NO_SCORE - User has DRE but needs Score
export function NoScoreCard({ dreData }: { dreData: NonNullable<HomeStateData['dreData']> }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Ótimo progresso!</h1>
        <div className="flex items-center justify-center gap-2 text-green-500">
          <CheckCircle2 className="w-5 h-5" />
          <span>DRE preenchido</span>
        </div>
      </div>

      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>PRÓXIMO PASSO: Calcule seu Score Tributário</CardTitle>
              <CardDescription>
                Descubra a saúde tributária da sua empresa em uma escala de 0 a 1000.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/dashboard/entender/score" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Calcular Score
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground font-medium">Enquanto isso, você também pode:</p>
        <div className="grid gap-2">
          <Link 
            to="/dashboard/recuperar/radar" 
            className="flex items-center gap-3 text-sm text-primary hover:underline"
          >
            <ArrowRight className="w-4 h-4" />
            Fazer upload de XMLs no Radar de Créditos
          </Link>
          <Link 
            to="/dashboard/recuperar/oportunidades" 
            className="flex items-center gap-3 text-sm text-primary hover:underline"
          >
            <ArrowRight className="w-4 h-4" />
            Explorar as 61+ oportunidades fiscais
          </Link>
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
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Sua base está pronta!</h1>
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
      </div>

      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>PRÓXIMO PASSO: Identifique créditos tributários</CardTitle>
              <CardDescription>
                Faça upload dos seus XMLs e descubra quanto você pode recuperar.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
          <CardTitle className="text-sm font-medium text-muted-foreground">Resumo rápido</CardTitle>
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
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          Olá{userName ? `, ${userName}` : ''}! Aqui está seu resumo.
        </h1>
      </div>

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
