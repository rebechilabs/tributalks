import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trophy, FileText, BarChart3, Lightbulb, Workflow, 
  ArrowRight, Sparkles, CheckCircle2 
} from "lucide-react";
import type { UserProgressData } from "@/hooks/useDashboardData";

interface NextStepRecommendationProps {
  progress: UserProgressData;
}

interface StepRecommendation {
  key: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  benefit: string;
}

const STEP_RECOMMENDATIONS: StepRecommendation[] = [
  {
    key: 'score',
    title: 'Calcule seu Score Tributário',
    description: 'Descubra sua saúde fiscal em minutos e receba recomendações personalizadas.',
    cta: 'Iniciar Diagnóstico',
    href: '/dashboard/score-tributario',
    icon: Trophy,
    benefit: 'Entenda seus riscos e oportunidades',
  },
  {
    key: 'xml',
    title: 'Importe suas Notas Fiscais',
    description: 'Analise XMLs de NF-e para identificar créditos tributários não aproveitados.',
    cta: 'Importar XMLs',
    href: '/dashboard/analise-notas',
    icon: FileText,
    benefit: 'Encontre até R$ 50k em créditos',
  },
  {
    key: 'dre',
    title: 'Preencha seu DRE',
    description: 'Analise sua demonstração de resultado e simule o impacto da Reforma Tributária.',
    cta: 'Começar DRE',
    href: '/dashboard/dre',
    icon: BarChart3,
    benefit: 'Veja impacto no seu lucro',
  },
  {
    key: 'opportunities',
    title: 'Descubra Oportunidades',
    description: 'Com base no seu perfil, encontre benefícios fiscais aplicáveis ao seu negócio.',
    cta: 'Ver Oportunidades',
    href: '/dashboard/planejar/oportunidades',
    icon: Lightbulb,
    benefit: 'Economia personalizada',
  },
  {
    key: 'workflow',
    title: 'Complete um Workflow',
    description: 'Siga um passo a passo guiado para preparar sua empresa para a Reforma.',
    cta: 'Ver Workflows',
    href: '/dashboard/workflows',
    icon: Workflow,
    benefit: 'Preparação estruturada',
  },
];

export function NextStepRecommendation({ progress }: NextStepRecommendationProps) {

  // Check if all steps are completed
  const completionStatus = {
    score: progress.hasScore,
    xml: progress.hasXmls,
    dre: progress.hasDre,
    opportunities: progress.hasOpportunities,
    workflow: progress.hasWorkflow,
  };

  const allCompleted = Object.values(completionStatus).every(Boolean);

  if (allCompleted) {
    return (
      <Card className="mb-6 border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">
                🎉 Parabéns!
              </p>
              <h3 className="text-lg font-bold text-foreground mb-1">
                Jornada tributária completa
              </h3>
              <p className="text-sm text-muted-foreground">
                Você completou todas as etapas. Continue usando as ferramentas para manter sua empresa otimizada.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/dashboard/executivo">
                Ver Painel Executivo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find the first incomplete step
  const nextStep = STEP_RECOMMENDATIONS.find(
    step => !completionStatus[step.key as keyof typeof completionStatus]
  );

  if (!nextStep) return null;

  const Icon = nextStep.icon;

  return (
    <Card className="mb-6 border-2 border-dashed border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-semibold uppercase tracking-wide">
                Próximo Passo Recomendado
              </span>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              {nextStep.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {nextStep.description}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button asChild>
                <Link to={nextStep.href}>
                  {nextStep.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                💡 {nextStep.benefit}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
