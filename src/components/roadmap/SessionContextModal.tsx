import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  Rocket, 
  Compass,
  Clock,
  Sparkles,
  ArrowRight,
  Bot,
} from "lucide-react";
import { 
  SessionContext, 
  UserPriority, 
  TimeAvailable 
} from "@/hooks/useAdaptiveRoadmap";
import { cn } from "@/lib/utils";

interface SessionContextModalProps {
  open: boolean;
  onSubmit: (context: SessionContext) => void;
  onSkip: () => void;
  isLoading?: boolean;
  userName?: string;
}

const PRIORITIES = [
  { 
    value: 'caixa' as UserPriority, 
    label: 'Fluxo de Caixa', 
    description: 'Proteger caixa e liquidez',
    icon: Wallet,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30',
  },
  { 
    value: 'margem' as UserPriority, 
    label: 'Margem de Lucro', 
    description: 'Otimizar rentabilidade',
    icon: TrendingUp,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30',
  },
  { 
    value: 'compliance' as UserPriority, 
    label: 'Conformidade Fiscal', 
    description: 'Evitar multas e riscos',
    icon: ShieldCheck,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30',
  },
  { 
    value: 'crescimento' as UserPriority, 
    label: 'Crescimento', 
    description: 'Planejar expansão',
    icon: Rocket,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30',
  },
  { 
    value: 'explorar' as UserPriority, 
    label: 'Explorar', 
    description: 'Descobrir oportunidades',
    icon: Compass,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/30',
  },
];

const TIME_OPTIONS = [
  { value: '5min' as TimeAvailable, label: '5 min', description: 'Só o essencial' },
  { value: '15min' as TimeAvailable, label: '15 min', description: 'Revisão rápida' },
  { value: '30min' as TimeAvailable, label: '30 min', description: 'Análise completa' },
  { value: '1h+' as TimeAvailable, label: '1h+', description: 'Mergulho profundo' },
];

export function SessionContextModal({ 
  open, 
  onSubmit, 
  onSkip, 
  isLoading,
  userName,
}: SessionContextModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [priority, setPriority] = useState<UserPriority | null>(null);
  const [time, setTime] = useState<TimeAvailable>('15min');
  const [urgentConcern, setUrgentConcern] = useState('');

  const handleSubmit = () => {
    if (!priority) return;
    
    onSubmit({
      todayPriority: priority,
      timeAvailable: time,
      urgentConcern: urgentConcern.trim() || undefined,
    });
  };

  const handlePrioritySelect = (value: UserPriority) => {
    setPriority(value);
    setStep(2);
  };

  const firstName = userName?.split(' ')[0] || 'Doc';

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-lg p-0 gap-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              {/* Header com Clara */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    Oi {firstName}, bem-vindo de volta!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Qual seu foco principal hoje?
                  </p>
                </div>
              </div>

              {/* Priority Options */}
              <div className="space-y-2">
                {PRIORITIES.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handlePrioritySelect(option.value)}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 transition-all duration-200",
                        "flex items-center gap-4 text-left",
                        option.bgColor,
                        priority === option.value && "ring-2 ring-primary"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        option.color.replace('text-', 'bg-').replace('500', '500/20')
                      )}>
                        <Icon className={cn("w-5 h-5", option.color)} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>

              {/* Skip Button */}
              <div className="mt-6 text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onSkip}
                  className="text-muted-foreground"
                >
                  Pular por hoje
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    Quanto tempo você tem agora?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Vou priorizar as ações para caber no seu tempo
                  </p>
                </div>
              </div>

              {/* Time Options */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {TIME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTime(option.value)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-200",
                      "flex flex-col items-center gap-1 text-center",
                      time === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <span className="text-lg font-bold">{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>

              {/* Urgent Concern */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium">
                  Alguma preocupação urgente? (opcional)
                </label>
                <Textarea
                  placeholder="Ex: Recebi uma notificação fiscal ontem..."
                  value={urgentConcern}
                  onChange={(e) => setUrgentConcern(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Criar Meu Roadmap
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Indicator */}
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            <div className={cn(
              "flex-1 h-1 rounded-full transition-colors",
              step >= 1 ? "bg-primary" : "bg-muted"
            )} />
            <div className={cn(
              "flex-1 h-1 rounded-full transition-colors",
              step >= 2 ? "bg-primary" : "bg-muted"
            )} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
