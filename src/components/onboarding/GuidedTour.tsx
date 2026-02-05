import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from "react-joyride";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { Sparkles, Calculator, Newspaper, Target, User, MessagesSquare } from "lucide-react";

const tourSteps: Step[] = [
  {
    target: '[data-tour="clara-card"]',
    content: (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-semibold">Conheça a Clara</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Sua assistente de IA tributária. Pergunte qualquer dúvida sobre impostos, 
          reforma tributária ou use comandos como <code className="bg-muted px-1 rounded">/resumo</code>.
        </p>
        <p className="text-xs text-muted-foreground">
          Dica: Use <kbd className="bg-muted px-1 rounded text-xs">Ctrl+K</kbd> para abrir rapidamente!
        </p>
      </div>
    ),
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tour="score-link"]',
    content: (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <span className="font-semibold">Score Tributário</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Descubra sua nota tributária de A+ a D. Compare com empresas do seu setor 
          e acompanhe a evolução mês a mês.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="calculators-group"]',
    content: (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <span className="font-semibold">Calculadoras</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Simule o impacto da reforma tributária no seu negócio. Compare regimes, 
          calcule o RTC e entenda o Split Payment.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="pit-group"]',
    content: (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          <span className="font-semibold">PIT</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Plataforma de Inteligência Tributária. Fique por dentro das notícias e prazos 
          importantes da reforma tributária. Receba alertas personalizados para o seu negócio.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="conexao-group"]',
    content: (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MessagesSquare className="h-5 w-5 text-primary" />
          <span className="font-semibold">Conexão & Comunicação</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Fique por dentro das últimas notícias tributárias, conecte-se com a 
          comunidade e ganhe descontos indicando amigos.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="user-menu"]',
    content: (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <span className="font-semibold">Seu Perfil</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete seu perfil empresarial para receber recomendações personalizadas, 
          ver conquistas e acompanhar seu progresso.
        </p>
      </div>
    ),
    placement: "bottom",
  },
];

export function GuidedTour() {
  const { shouldShowOnboarding, completeTour, initializeOnboarding, progress, isLoading } = useOnboardingProgress();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Initialize onboarding progress if it doesn't exist
    if (!isLoading && !progress) {
      initializeOnboarding();
    }
  }, [isLoading, progress, initializeOnboarding]);

  useEffect(() => {
    // Start tour after a small delay to ensure elements are rendered
    if (shouldShowOnboarding && !isLoading) {
      const timer = setTimeout(() => setRun(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldShowOnboarding, isLoading]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      completeTour();
    }

    // Handle step changes
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      setStepIndex(nextIndex);
    }
  };

  if (isLoading || !shouldShowOnboarding) {
    return null;
  }

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableOverlayClose
      callback={handleJoyrideCallback}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Concluir",
        next: "Próximo",
        skip: "Pular tour",
        open: "Abrir",
      }}
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          backgroundColor: "hsl(var(--card))",
          textColor: "hsl(var(--foreground))",
          arrowColor: "hsl(var(--card))",
          overlayColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 16,
        },
        tooltipContainer: {
          textAlign: "left",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 14,
          fontWeight: 500,
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
          marginRight: 8,
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
          fontSize: 13,
        },
        spotlight: {
          borderRadius: 12,
        },
      }}
      floaterProps={{
        styles: {
          floater: {
            filter: "drop-shadow(0 4px 20px rgba(0, 0, 0, 0.15))",
          },
        },
      }}
    />
  );
}
