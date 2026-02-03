import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Calculator, BookOpen } from "lucide-react";

const QUICK_ACTIONS = [
  { 
    id: "cbs-ibs", 
    label: "Explicar CBS/IBS/IS", 
    icon: BookOpen,
    question: "Me explique de forma simples o que são CBS, IBS e Imposto Seletivo na Reforma Tributária" 
  },
  { 
    id: "ncm", 
    label: "Analisar NCM", 
    icon: Calculator,
    question: "Quero analisar o impacto tributário de um NCM específico na Reforma" 
  },
];

export function NexusClaraCard() {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const handleQuestionClick = (question: string) => {
    window.dispatchEvent(new CustomEvent('openClaraWithQuestion', { 
      detail: { question } 
    }));
  };

  const handleMainCTA = () => {
    window.dispatchEvent(new CustomEvent('openClaraWithQuestion', { 
      detail: { question: "Quero te contar sobre um desafio que estou enfrentando na minha empresa em relação à Reforma Tributária" } 
    }));
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden relative">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
      
      <CardContent className="p-5 relative">
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Clara AI
            </p>
            <h3 className="font-semibold text-foreground">
              Posso te ajudar?
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3">
          O que você quer calcular ou entender melhor sobre a Reforma Tributária?
        </p>

        {/* Quote box */}
        <div className="bg-muted/50 border border-border/50 rounded-lg p-3 mb-4">
          <p className="text-sm text-foreground italic">
            "Me conta um pouco sobre o desafio que você está enfrentando no momento. Posso te orientar!"
          </p>
        </div>

        {/* Main CTA */}
        <Button 
          onClick={handleMainCTA} 
          className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all group mb-4"
          size="default"
        >
          Clique para conversar
          <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Quick actions */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">
            Perguntas rápidas
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuestionClick(action.question)}
                onMouseEnter={() => setHoveredAction(action.id)}
                onMouseLeave={() => setHoveredAction(null)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                  hoveredAction === action.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary/50"
                }`}
              >
                <action.icon className="w-3 h-3" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
