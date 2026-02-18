import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, Trophy, FileText, BarChart3, Lightbulb, 
  Calculator, Coins, Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

type ToolType = 'score' | 'xml' | 'radar' | 'dre' | 'rtc' | 'opportunities';

interface NextStepCtaProps {
  currentTool: ToolType;
  hasData?: boolean;
  className?: string;
}

interface NextStep {
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NEXT_STEPS: Record<ToolType, NextStep> = {
  score: {
    title: 'Ver impacto da Reforma',
    description: 'Agora que você sabe sua nota, simule como a Reforma afeta sua empresa.',
    cta: 'Simular no RTC',
    href: '/calculadora/rtc',
    icon: Calculator,
  },
  xml: {
    title: 'Ver créditos identificados',
    description: 'Encontramos potenciais créditos tributários nas suas notas fiscais.',
    cta: 'Ver Radar de Créditos',
    href: '/dashboard/analise-notas',
    icon: Coins,
  },
  radar: {
    title: 'Simular impacto no resultado',
    description: 'Veja como os créditos identificados impactam seu DRE.',
    cta: 'Analisar DRE',
    href: '/dashboard/dre',
    icon: BarChart3,
  },
  dre: {
    title: 'Descobrir oportunidades',
    description: 'Com base nos seus dados financeiros, identifique benefícios fiscais.',
    cta: 'Ver Oportunidades',
    href: '/dashboard/planejar/oportunidades',
    icon: Lightbulb,
  },
  rtc: {
    title: 'Simular impacto no lucro',
    description: 'Veja como os novos impostos afetam sua margem de lucro.',
    cta: 'Analisar DRE',
    href: '/dashboard/dre',
    icon: BarChart3,
  },
  opportunities: {
    title: 'Calcular seu Score',
    description: 'Acompanhe sua evolução tributária com o Score periódico.',
    cta: 'Ver Score',
    href: '/dashboard/score-tributario',
    icon: Trophy,
  },
};

export function NextStepCta({ currentTool, hasData = true, className }: NextStepCtaProps) {
  const nextStep = NEXT_STEPS[currentTool];

  if (!nextStep || !hasData) return null;

  const Icon = nextStep.icon;

  return (
    <Card className={cn(
      "border-2 border-dashed border-primary/30 bg-gradient-to-r from-primary/5 to-transparent",
      className
    )}>
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-semibold uppercase tracking-wide">
                Próximo Passo
              </span>
            </div>
            <h4 className="font-semibold text-foreground mb-0.5">{nextStep.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-1">{nextStep.description}</p>
          </div>
          <Button asChild className="flex-shrink-0">
            <Link to={nextStep.href}>
              {nextStep.cta}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
