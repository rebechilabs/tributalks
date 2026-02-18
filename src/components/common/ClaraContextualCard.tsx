import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, ArrowRight, MessageCircle, Lightbulb, 
  HelpCircle, Target, Brain, Zap, X, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

// Tipos de interação da Clara
type ClaraIntent = 
  | 'explain' // Explica a ferramenta
  | 'guide' // Guia passo a passo
  | 'analyze' // Oferece análise
  | 'question' // Faz pergunta inteligente
  | 'suggest' // Sugere próximo passo
  | 'diagnose'; // Oferece diagnóstico

interface ClaraContextConfig {
  intent: ClaraIntent;
  headline: string;
  description: string;
  ctaLabel: string;
  ctaQuestion: string;
  secondaryCta?: {
    label: string;
    question: string;
  };
  proactiveQuestion?: string; // Pergunta que Clara faz ao usuário
  quickActions?: Array<{
    label: string;
    question: string;
  }>;
  badge?: string;
  variant?: 'default' | 'prominent' | 'minimal';
}

// Configuração contextual por rota - IA ativa em cada página
const ROUTE_CONTEXTS: Record<string, ClaraContextConfig> = {
  // Calculadoras - Clara guia o usuário
  '/calculadora/rtc': {
    intent: 'guide',
    headline: 'Vou te ajudar a calcular',
    description: 'Qual produto você quer simular? Posso explicar cada tributo enquanto você preenche.',
    ctaLabel: 'Explicar CBS/IBS/IS',
    ctaQuestion: 'Me explica de forma simples: o que é CBS, IBS e IS da Reforma Tributária? E como eles substituem os impostos atuais?',
    secondaryCta: {
      label: 'Analisar NCM',
      question: 'Tenho um produto com NCM específico. Pode me ajudar a entender como ele será tributado após a Reforma?'
    },
    proactiveQuestion: 'Qual é o principal produto que você vende? Me conta que eu simulo o impacto da Reforma.',
    quickActions: [
      { label: 'NCM mais comum?', question: 'Qual NCM devo usar para produtos de varejo comum?' },
      { label: 'Diferença CBS x IBS', question: 'Qual a diferença entre CBS e IBS na prática?' }
    ],
    variant: 'prominent'
  },
  '/calculadora/split-payment': {
    intent: 'analyze',
    headline: 'Seu fluxo de caixa vai mudar',
    description: 'O Split Payment retém impostos na hora da venda. Quer entender o impacto no seu negócio?',
    ctaLabel: 'Simular impacto',
    ctaQuestion: 'Me explica como o Split Payment vai funcionar e qual o impacto no meu fluxo de caixa com a Reforma Tributária?',
    proactiveQuestion: 'Qual o faturamento mensal médio da sua empresa? Assim calculo o impacto real no caixa.',
    quickActions: [
      { label: 'Quando começa?', question: 'Quando o Split Payment entra em vigor?' },
      { label: 'Como me preparar?', question: 'O que posso fazer agora para me preparar para o Split Payment?' }
    ],
    variant: 'prominent'
  },
  '/calculadora/comparativo-regimes': {
    intent: 'diagnose',
    headline: 'Qual regime é melhor para você?',
    description: 'Simples, Presumido ou Real - a resposta depende do seu perfil. Posso analisar.',
    ctaLabel: 'Analisar meu caso',
    ctaQuestion: 'Considerando a Reforma Tributária, qual regime tributário será mais vantajoso para uma empresa como a minha?',
    proactiveQuestion: 'Me conta: sua empresa é comércio, indústria ou serviços? E qual o faturamento aproximado?',
    variant: 'default'
  },
  '/calculadora/servicos': {
    intent: 'explain',
    headline: 'Serviços na Reforma Tributária',
    description: 'A tributação de serviços muda bastante. Posso explicar as alíquotas por tipo de serviço.',
    ctaLabel: 'Ver alíquotas',
    ctaQuestion: 'Como ficam as alíquotas de CBS e IBS para prestadores de serviços após a Reforma?',
    proactiveQuestion: 'Qual tipo de serviço sua empresa presta? Cada categoria tem tratamento diferente.',
    variant: 'default'
  },
  
  // Diagnóstico - Clara analisa dados
  '/dashboard/score-tributario': {
    intent: 'diagnose',
    headline: 'Posso interpretar seu Score',
    description: 'Cada dimensão do Score indica uma área de atenção. Quer entender o que melhorar?',
    ctaLabel: 'Interpretar resultado',
    ctaQuestion: 'Me ajuda a entender meu Score Tributário: o que cada dimensão significa e como posso melhorar minha nota?',
    secondaryCta: {
      label: 'Ações prioritárias',
      question: 'Quais são as 3 ações mais urgentes para melhorar meu Score Tributário?'
    },
    proactiveQuestion: 'Você já sabe sua nota no Receita Sintonia? É um indicador importante que afeta sua relação com a Receita Federal.',
    quickActions: [
      { label: 'O que é Score?', question: 'O que é o Score Tributário e por que devo me preocupar com ele?' },
      { label: 'Receita Sintonia', question: 'O que é o Receita Sintonia e como ele me afeta?' }
    ],
    variant: 'prominent'
  },
  '/dashboard/analise-notas': {
    intent: 'analyze',
    headline: 'Encontrei créditos nos seus XMLs',
    description: 'Posso explicar cada crédito identificado e como recuperar o que você pagou a mais.',
    ctaLabel: 'Explicar créditos',
    ctaQuestion: 'Me explica os tipos de créditos tributários que podem ser recuperados através da análise de XMLs.',
    proactiveQuestion: 'Você sabe se sua empresa aproveita todos os créditos de PIS/COFINS das compras?',
    variant: 'prominent'
  },
  '/dashboard/dre': {
    intent: 'analyze',
    headline: 'Analiso sua saúde financeira',
    description: 'O DRE revela oportunidades de economia tributária. Posso destacar os pontos críticos.',
    ctaLabel: 'Analisar indicadores',
    ctaQuestion: 'Analise meu DRE e me diga: quais indicadores financeiros merecem atenção e como posso otimizar minha carga tributária?',
    proactiveQuestion: 'Qual sua principal preocupação hoje: reduzir impostos ou melhorar margem de lucro?',
    variant: 'default'
  },
  '/dashboard/planejar/oportunidades': {
    intent: 'suggest',
    headline: 'Priorizei as oportunidades para você',
    description: 'Das 37+ oportunidades mapeadas, posso indicar as mais relevantes para seu perfil.',
    ctaLabel: 'Ver prioritárias',
    ctaQuestion: 'Considerando meu perfil de empresa, quais oportunidades tributárias eu deveria priorizar? Ordene por impacto e facilidade de implementação.',
    proactiveQuestion: 'Você já usa algum benefício fiscal hoje? Muitas empresas deixam dinheiro na mesa sem saber.',
    variant: 'prominent'
  },
  '/dashboard/oportunidades': {
    intent: 'suggest',
    headline: 'Priorizei as oportunidades para você',
    description: 'Das 37+ oportunidades mapeadas, posso indicar as mais relevantes para seu perfil.',
    ctaLabel: 'Ver prioritárias',
    ctaQuestion: 'Considerando meu perfil de empresa, quais oportunidades tributárias eu deveria priorizar? Ordene por impacto e facilidade de implementação.',
    proactiveQuestion: 'Você já usa algum benefício fiscal hoje? Muitas empresas deixam dinheiro na mesa sem saber.',
    variant: 'prominent'
  },
  '/dashboard/margem-ativa': {
    intent: 'analyze',
    headline: 'Proteja sua margem de lucro',
    description: 'A Reforma impacta diretamente sua precificação. Posso simular cenários.',
    ctaLabel: 'Simular preços',
    ctaQuestion: 'Como a Reforma Tributária vai impactar minha margem de lucro e o que posso fazer para protegê-la?',
    proactiveQuestion: 'Você já revisou seus preços considerando o Split Payment? Muitas empresas terão surpresas no caixa.',
    variant: 'default'
  },
  
  // PIT (Reforma) - Clara informa
  '/dashboard/timeline-reforma': {
    intent: 'explain',
    headline: 'Te guio pelos prazos importantes',
    description: 'Cada data na timeline tem implicações práticas. Quer saber o que fazer em cada etapa?',
    ctaLabel: 'Explicar prazos',
    ctaQuestion: 'Quais são os prazos mais importantes da Reforma Tributária que impactam minha empresa e o que devo fazer em cada um?',
    quickActions: [
      { label: '2026', question: 'O que muda em 2026 com a Reforma Tributária?' },
      { label: '2027', question: 'O que muda em 2027 com a Reforma Tributária?' },
      { label: '2033', question: 'Como será o cenário tributário em 2033 quando a transição terminar?' }
    ],
    variant: 'default'
  },
  '/noticias': {
    intent: 'explain',
    headline: 'Resumo personalizado das notícias',
    description: 'Posso filtrar as notícias mais relevantes para seu setor e regime tributário.',
    ctaLabel: 'Resumir para mim',
    ctaQuestion: 'Me dá um resumo das principais novidades da Reforma Tributária que impactam empresas como a minha.',
    proactiveQuestion: 'Quer que eu te alerte quando sair alguma regulamentação que afete diretamente seu setor?',
    variant: 'minimal'
  },
  '/dashboard/checklist-reforma': {
    intent: 'guide',
    headline: 'Verifico sua preparação',
    description: 'O checklist avalia se você está pronto. Posso explicar cada item e sua importância.',
    ctaLabel: 'Revisar checklist',
    ctaQuestion: 'Me explica o Checklist de Prontidão da Reforma: o que cada item significa e por que é importante estar em dia?',
    proactiveQuestion: 'Sua empresa já tem um plano de adaptação para a Reforma? Muitas estão deixando para a última hora.',
    variant: 'default'
  },
  
  // Workflows e Central
  '/dashboard/workflows': {
    intent: 'guide',
    headline: 'Qual objetivo você quer alcançar?',
    description: 'Cada workflow te leva a um resultado concreto. Posso recomendar por onde começar.',
    ctaLabel: 'Recomendar workflow',
    ctaQuestion: 'Quais workflows você recomenda para uma empresa que está começando a se preparar para a Reforma Tributária?',
    proactiveQuestion: 'Você quer entender os impactos gerais ou prefere um diagnóstico com seus dados reais?',
    variant: 'prominent'
  },
  '/dashboard/analisador-documentos': {
    intent: 'analyze',
    headline: 'Analiso seus documentos com IA',
    description: 'Posso identificar riscos e oportunidades em contratos, certidões e documentos fiscais.',
    ctaLabel: 'Começar análise',
    ctaQuestion: 'Que tipos de documentos você consegue analisar e quais insights você pode extrair deles?',
    variant: 'default'
  },
  
  // Perfil e Configurações
  '/perfil-empresa': {
    intent: 'question',
    headline: 'Completar perfil = recomendações melhores',
    description: 'Quanto mais eu souber sobre sua empresa, mais personalizadas serão minhas sugestões.',
    ctaLabel: 'Me ajude a completar',
    ctaQuestion: 'Quais informações do perfil da empresa são mais importantes para você dar recomendações personalizadas?',
    proactiveQuestion: 'Qual é o setor de atuação da sua empresa? Isso muda completamente o impacto da Reforma.',
    variant: 'default'
  },
  
  // Estudos de caso
  '/casos': {
    intent: 'explain',
    headline: 'Casos reais de economia tributária',
    description: 'Posso explicar como cada empresa conseguiu economizar e se isso se aplica ao seu caso.',
    ctaLabel: 'Analisar casos',
    ctaQuestion: 'Me conta sobre casos de sucesso de empresas que economizaram impostos com planejamento tributário.',
    variant: 'minimal'
  },

  // NEXUS
  '/dashboard/nexus': {
    intent: 'analyze',
    headline: 'Seu painel de comando tributário',
    description: 'O NEXUS consolida tudo. Posso explicar cada KPI e o que merece atenção imediata.',
    ctaLabel: 'Interpretar dashboard',
    ctaQuestion: 'Me ajuda a interpretar os KPIs do NEXUS: o que cada métrica significa e onde devo focar minha atenção?',
    variant: 'prominent'
  },
  
  // Consultorias
  '/dashboard/consultorias': {
    intent: 'guide',
    headline: 'Prepare-se para a consultoria',
    description: 'Posso te ajudar a organizar as perguntas e dados antes da reunião com o especialista.',
    ctaLabel: 'Preparar reunião',
    ctaQuestion: 'Me ajuda a preparar uma lista de perguntas e pontos importantes para discutir na minha consultoria tributária.',
    variant: 'default'
  },
};

// Default para rotas não mapeadas
const DEFAULT_CONTEXT: ClaraContextConfig = {
  intent: 'explain',
  headline: 'Posso ajudar?',
  description: 'Estou aqui para tirar dúvidas sobre a Reforma Tributária e suas ferramentas.',
  ctaLabel: 'Fazer uma pergunta',
  ctaQuestion: 'Me explica como usar essa ferramenta e o que posso fazer aqui.',
  variant: 'minimal'
};

interface ClaraContextualCardProps {
  className?: string;
  variant?: 'default' | 'prominent' | 'minimal' | 'inline';
  showProactiveQuestion?: boolean;
}

export function ClaraContextualCard({ 
  className, 
  variant: overrideVariant,
  showProactiveQuestion = true 
}: ClaraContextualCardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Get context for current route
  const config = ROUTE_CONTEXTS[location.pathname] || DEFAULT_CONTEXT;
  const variant = overrideVariant || config.variant || 'default';

  // Don't show if dismissed (per session)
  if (dismissed && variant === 'minimal') return null;

  const handleMainCta = () => {
    window.dispatchEvent(
      new CustomEvent("openClaraWithQuestion", {
        detail: { question: config.ctaQuestion },
      })
    );
  };

  const handleSecondaryCta = () => {
    if (config.secondaryCta) {
      window.dispatchEvent(
        new CustomEvent("openClaraWithQuestion", {
          detail: { question: config.secondaryCta.question },
        })
      );
    }
  };

  const handleQuickAction = (question: string) => {
    window.dispatchEvent(
      new CustomEvent("openClaraWithQuestion", {
        detail: { question },
      })
    );
  };

  const handleProactiveQuestion = () => {
    if (config.proactiveQuestion) {
      window.dispatchEvent(
        new CustomEvent("openClaraFreeChat")
      );
    }
  };

  const getIntentIcon = () => {
    switch (config.intent) {
      case 'analyze': return Brain;
      case 'guide': return Target;
      case 'diagnose': return Zap;
      case 'question': return HelpCircle;
      case 'suggest': return Lightbulb;
      default: return MessageCircle;
    }
  };

  const IntentIcon = getIntentIcon();

  // Minimal variant - just a subtle bar
  if (variant === 'minimal') {
    return (
      <div className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/5 border border-primary/10",
        className
      )}>
        <Sparkles className="w-4 h-4 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground flex-1">{config.description}</p>
        <Button 
          size="sm" 
          variant="ghost" 
          className="text-primary hover:text-primary shrink-0"
          onClick={handleMainCta}
        >
          {config.ctaLabel}
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
        <button 
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground p-1"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // Inline variant - compact for embedding
  if (variant === 'inline') {
    return (
      <div className={cn(
        "flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20",
        className
      )}>
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{config.headline}</p>
          <p className="text-xs text-muted-foreground truncate">{config.description}</p>
        </div>
        <Button 
          size="sm" 
          onClick={handleMainCta}
          className="shrink-0"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          Perguntar
        </Button>
      </div>
    );
  }

  // Prominent variant - full featured card
  if (variant === 'prominent') {
    return (
      <Card className={cn(
        "border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 overflow-hidden relative",
        className
      )}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <CardContent className="p-5 relative">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary uppercase tracking-wide">Clara AI</span>
                  {config.badge && (
                    <Badge variant="secondary" className="text-[10px] px-1.5">
                      {config.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-foreground">{config.headline}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{config.description}</p>
              </div>

              {/* Proactive Question */}
              {showProactiveQuestion && config.proactiveQuestion && (
                <button
                  onClick={handleProactiveQuestion}
                  className="w-full text-left p-3 rounded-lg bg-background/80 border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    <IntentIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground italic">
                      "{config.proactiveQuestion}"
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6 group-hover:text-primary transition-colors">
                    Clique para responder →
                  </p>
                </button>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleMainCta} size="sm" className="gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {config.ctaLabel}
                </Button>
                {config.secondaryCta && (
                  <Button onClick={handleSecondaryCta} size="sm" variant="outline" className="gap-1">
                    {config.secondaryCta.label}
                  </Button>
                )}
              </div>

              {/* Quick Actions */}
              {config.quickActions && config.quickActions.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowQuickActions(!showQuickActions)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showQuickActions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    Perguntas rápidas
                  </button>
                  {showQuickActions && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {config.quickActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickAction(action.question)}
                          className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn(
      "border-primary/20 bg-gradient-to-r from-primary/5 to-transparent",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wide mb-0.5">Clara AI</p>
              <h3 className="text-sm font-medium text-foreground">{config.headline}</h3>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>

            {/* Proactive Question - compact */}
            {showProactiveQuestion && config.proactiveQuestion && (
              <button
                onClick={handleProactiveQuestion}
                className="w-full text-left p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <p className="text-xs text-muted-foreground italic truncate">
                  💬 {config.proactiveQuestion}
                </p>
              </button>
            )}

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleMainCta} size="sm" variant="default" className="text-xs gap-1">
                {config.ctaLabel}
                <ArrowRight className="w-3 h-3" />
              </Button>
              {config.secondaryCta && (
                <Button onClick={handleSecondaryCta} size="sm" variant="ghost" className="text-xs">
                  {config.secondaryCta.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
