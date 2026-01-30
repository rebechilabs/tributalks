import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Target, Calculator, FileSearch, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { Link } from "react-router-dom";

interface Mission {
  id: string;
  title: string;
  description: string;
  steps: { label: string; link: string }[];
  icon: React.ElementType;
}

const MISSIONS: Record<string, Mission> = {
  SIMPLES: {
    id: "simples",
    title: "Missão: Prepare-se para o Split Payment",
    description: "Empresas do Simples Nacional terão um novo modelo de pagamento. Descubra como isso afeta seu negócio.",
    steps: [
      { label: "1. Calcule seu Score Tributário", link: "/dashboard/score-tributario" },
      { label: "2. Simule o Split Payment", link: "/dashboard/split-payment" },
    ],
    icon: Calculator,
  },
  PRESUMIDO: {
    id: "presumido",
    title: "Missão: Compare os Regimes",
    description: "O Lucro Presumido pode deixar de ser vantajoso. Descubra a melhor opção para sua empresa.",
    steps: [
      { label: "1. Calcule seu Score Tributário", link: "/dashboard/score-tributario" },
      { label: "2. Compare os Regimes", link: "/dashboard/comparativo-regimes" },
    ],
    icon: Target,
  },
  REAL: {
    id: "real",
    title: "Missão: Descubra Créditos Ocultos",
    description: "Empresas do Lucro Real podem estar deixando dinheiro na mesa. Vamos descobrir!",
    steps: [
      { label: "1. Importe seus XMLs", link: "/dashboard/analise-notas" },
      { label: "2. Veja o Radar de Créditos", link: "/dashboard/radar-creditos" },
    ],
    icon: FileSearch,
  },
};

export function FirstMission() {
  const { profile } = useAuth();
  const { progress, completeFirstMission } = useOnboardingProgress();

  // Don't show if already completed
  if (progress?.first_mission_completed) {
    return null;
  }

  // Get mission based on tax regime
  const regime = profile?.regime || "PRESUMIDO";
  const mission = MISSIONS[regime] || MISSIONS.PRESUMIDO;
  const Icon = mission.icon;

  return (
    <Card className="border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">Sua Primeira Missão</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{mission.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {mission.description}
          </p>
        </div>

        <div className="space-y-2">
          {mission.steps.map((step, index) => (
            <Link
              key={index}
              to={step.link}
              className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border hover:bg-accent/50 transition-colors group"
            >
              <span className="text-sm font-medium">{step.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={completeFirstMission}
            className="text-muted-foreground hover:text-foreground"
          >
            Já fiz isso, pular
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
