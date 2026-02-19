import { useState, useEffect } from 'react';
import { Search, Database, Calculator, Scale, ListOrdered, CheckCircle2, Loader2 } from 'lucide-react';
import { ClaraMessage } from './ClaraMessage';
import { cn } from '@/lib/utils';

const STEPS = [
  { label: 'Analisando perfil tributário', icon: Search },
  { label: 'Consultando base de oportunidades', icon: Database },
  { label: 'Calculando economia estimada', icon: Calculator },
  { label: 'Verificando impacto da Reforma Tributária', icon: Scale },
  { label: 'Priorizando recomendações', icon: ListOrdered },
];

interface StepProcessingProps {
  onVisualComplete: () => void;
}

export function StepProcessing({ onVisualComplete }: StepProcessingProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setActiveStep(i + 1);
        if (i === STEPS.length - 1) {
          setTimeout(onVisualComplete, 800);
        }
      }, (i + 1) * 1500));
    });
    return () => timers.forEach(clearTimeout);
  }, [onVisualComplete]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <ClaraMessage message="Analisando as melhores oportunidades para a sua empresa..." typewriter={false} />

      <div className="bg-card border border-border rounded-xl p-5 space-y-1">
        {STEPS.map((step, i) => {
          const done = activeStep > i;
          const current = activeStep === i;
          const Icon = step.icon;
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-500",
                done && "opacity-100",
                current && "bg-primary/5",
                !done && !current && "opacity-30"
              )}
            >
              <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                {done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : current ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <Icon className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <span className={cn(
                "text-sm transition-colors",
                done ? "text-foreground" : current ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
