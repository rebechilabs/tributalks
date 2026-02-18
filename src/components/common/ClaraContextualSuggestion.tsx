import { Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mapeamento de rotas para sugestões contextuais da Clara
const ROUTE_SUGGESTIONS: Record<string, {
  question: string;
  shortText: string;
  icon?: string;
}> = {
  "/dashboard/score-tributario": {
    question: "Quer que eu explique o que significa cada critério do Score Tributário e como melhorar sua nota?",
    shortText: "Quer entender sua nota?",
  },
  "/dashboard/analise-notas": {
    question: "Posso te ajudar a interpretar os créditos identificados nos seus XMLs. Quer saber quais são os mais urgentes para recuperar?",
    shortText: "Ajudo a priorizar créditos?",
  },
  "/dashboard/radar-creditos": {
    question: "Esses créditos podem ser recuperados. Quer que eu explique o processo de recuperação e os prazos legais?",
    shortText: "Explico como recuperar?",
  },
  "/dashboard/dre": {
    question: "Posso analisar seus indicadores financeiros e sugerir otimizações tributárias baseadas no seu DRE. Quer começar?",
    shortText: "Analiso seus indicadores?",
  },
  "/dashboard/planejar/oportunidades": {
    question: "Encontrei oportunidades tributárias para sua empresa. Quer que eu explique cada uma e como implementar?",
    shortText: "Explico as oportunidades?",
  },
  "/dashboard/oportunidades": {
    question: "Encontrei oportunidades tributárias para sua empresa. Quer que eu explique cada uma e como implementar?",
    shortText: "Explico as oportunidades?",
  },
  "/calculadora/rtc": {
    question: "Posso te ajudar a entender como CBS, IBS e Imposto Seletivo vão impactar seu negócio na prática. Quer simular cenários?",
    shortText: "Simulo cenários?",
  },
  "/calculadora/split-payment": {
    question: "O Split Payment vai mudar seu fluxo de caixa. Quer que eu explique como se preparar e minimizar impactos?",
    shortText: "Explico o Split Payment?",
  },
  "/calculadora/comparativo-regimes": {
    question: "Cada regime tributário tem vantagens específicas. Quer que eu analise qual é o melhor para seu perfil?",
    shortText: "Qual regime é melhor?",
  },
  "/dashboard/noticias": {
    question: "Posso resumir as notícias mais importantes para o seu setor e regime tributário. O que te interessa saber?",
    shortText: "Resumo as notícias?",
  },
  "/dashboard/timeline": {
    question: "A Reforma tem vários prazos importantes. Quer que eu destaque os mais relevantes para sua empresa?",
    shortText: "Quais prazos me afetam?",
  },
  "/dashboard/painel-executivo": {
    question: "Posso gerar um resumo executivo com os principais KPIs e recomendações estratégicas. Quer que eu prepare?",
    shortText: "Gero resumo executivo?",
  },
  "/dashboard/workflows": {
    question: "Os workflows guiados te levam passo a passo pelas análises. Qual objetivo você quer alcançar hoje?",
    shortText: "Por onde começar?",
  },
  "/dashboard/perfil-empresa": {
    question: "Quanto mais completo seu perfil, melhores serão as recomendações. Quer que eu ajude a preencher?",
    shortText: "Ajudo a completar?",
  },
  "/dashboard/checklist-reforma": {
    question: "O checklist avalia sua preparação para a Reforma. Quer que eu explique cada item e sua importância?",
    shortText: "Explico o checklist?",
  },
};

interface ClaraContextualSuggestionProps {
  currentRoute: string;
  className?: string;
}

export function ClaraContextualSuggestion({ currentRoute, className = "" }: ClaraContextualSuggestionProps) {
  const suggestion = ROUTE_SUGGESTIONS[currentRoute];
  
  if (!suggestion) return null;

  const handleClick = () => {
    // Dispatch event to open Clara with this specific question
    window.dispatchEvent(
      new CustomEvent("openClaraWithQuestion", {
        detail: { question: suggestion.question },
      })
    );
  };

  return (
    <Card className={`bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 ${className}`}>
      <CardContent className="p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Clara pode ajudar</p>
          <p className="text-xs text-muted-foreground truncate">{suggestion.shortText}</p>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          className="shrink-0 text-primary hover:text-primary hover:bg-primary/10"
          onClick={handleClick}
        >
          <span className="hidden sm:inline mr-1">Perguntar</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
