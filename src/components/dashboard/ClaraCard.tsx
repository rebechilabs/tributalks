import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, ArrowRight } from "lucide-react";

interface ClaraCardProps {
  onOpenChat?: () => void;
}

const QUICK_QUESTIONS = [
  { id: "basico", label: "O que é a Reforma?", question: "O que é essa Reforma Tributária que todo mundo está falando?" },
  { id: "impacto", label: "Impacto na empresa", question: "Como a Reforma Tributária vai afetar minha empresa na prática?" },
  { id: "impostos", label: "Impostos que mudam", question: "Quais impostos vão mudar e quando isso começa a valer?" },
  { id: "financeiro", label: "Pago mais ou menos?", question: "Vou pagar mais ou menos impostos depois da Reforma?" },
  { id: "acao", label: "O que fazer agora", question: "O que preciso fazer agora para não ser pego de surpresa pela Reforma Tributária?" },
];

export function ClaraCard({ onOpenChat }: ClaraCardProps) {
  const [hoveredQuestion, setHoveredQuestion] = useState<string | null>(null);

  const handleQuestionClick = (question: string) => {
    // Dispatch custom event to open Clara with a specific question
    window.dispatchEvent(new CustomEvent('openClaraWithQuestion', { 
      detail: { question } 
    }));
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden relative">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              Clara
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                IA
              </span>
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Sua consultora especializada em Reforma Tributária. Tire qualquer dúvida!
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick questions */}
        <div>
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
            Perguntas frequentes
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q.id}
                onClick={() => handleQuestionClick(q.question)}
                onMouseEnter={() => setHoveredQuestion(q.id)}
                onMouseLeave={() => setHoveredQuestion(null)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                  hoveredQuestion === q.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary/50"
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={onOpenChat} 
          className="w-full gap-2 mt-2"
          size="lg"
        >
          <MessageCircle className="w-4 h-4" />
          Conversar com a Clara
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>
      </CardContent>
    </Card>
  );
}
