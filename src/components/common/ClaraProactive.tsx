import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, X, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface OnboardingTip {
  route: string;
  title: string;
  message: string;
  ctaLabel: string;
  ctaQuestion: string;
  showOnce?: boolean;
  delayMs?: number;
}

// Dicas de onboarding inteligente por rota - Clara guia o usuário na primeira vez
const ONBOARDING_TIPS: OnboardingTip[] = [
  {
    route: '/dashboard',
    title: 'Bem-vindo ao TribuTalks!',
    message: 'Sou a Clara, sua consultora de IA. Clique em "Por onde eu começo?" para um tour personalizado.',
    ctaLabel: 'Começar tour',
    ctaQuestion: 'Por onde eu começo a usar o TribuTalks? Me guia pelas principais ferramentas.',
    showOnce: true,
    delayMs: 2000
  },
  {
    route: '/dashboard/score-tributario',
    title: 'Score Tributário',
    message: 'Responda as perguntas para descobrir o nível de risco tributário da sua empresa. Cada resposta impacta seu Score.',
    ctaLabel: 'Como funciona?',
    ctaQuestion: 'Me explica como o Score Tributário é calculado e o que cada dimensão significa.',
    showOnce: true,
    delayMs: 1500
  },
  {
    route: '/calculadora/rtc',
    title: 'Calculadora com API Oficial',
    message: 'Esta calculadora usa dados oficiais da Receita Federal. Insira seu NCM para ver a tributação pós-reforma.',
    ctaLabel: 'Me ajuda',
    ctaQuestion: 'Me explica como usar a calculadora RTC e o que significam CBS, IBS e IS.',
    showOnce: true,
    delayMs: 1500
  },
  {
    route: '/calculadora/split-payment',
    title: 'Impacto no Fluxo de Caixa',
    message: 'O Split Payment retém impostos na hora da venda. Simule quanto do seu faturamento será retido.',
    ctaLabel: 'Entender Split',
    ctaQuestion: 'O que é o Split Payment e como ele vai impactar meu fluxo de caixa na prática?',
    showOnce: true,
    delayMs: 1500
  },
  {
    route: '/dashboard/analise-notas',
    title: 'Radar de Créditos',
    message: 'Faça upload dos seus XMLs para identificar créditos tributários que você pode estar deixando de aproveitar.',
    ctaLabel: 'Como recuperar?',
    ctaQuestion: 'Que tipos de créditos tributários podem ser recuperados através da análise de XMLs?',
    showOnce: true,
    delayMs: 1500
  },
  {
    route: '/dashboard/oportunidades',
    title: '37+ Oportunidades Fiscais',
    message: 'Mapeamos dezenas de benefícios fiscais. Preencha seu perfil para ver quais se aplicam a você.',
    ctaLabel: 'Ver melhores',
    ctaQuestion: 'Quais são as oportunidades fiscais mais comuns que empresas deixam de aproveitar?',
    showOnce: true,
    delayMs: 1500
  },
  {
    route: '/dashboard/dre',
    title: 'DRE Inteligente',
    message: 'Preencha seu DRE para projetar o impacto da Reforma Tributária no seu lucro.',
    ctaLabel: 'Como preencher?',
    ctaQuestion: 'Me ajuda a preencher o DRE Inteligente: quais informações eu preciso ter em mãos?',
    showOnce: true,
    delayMs: 1500
  },
  {
    route: '/dashboard/timeline-reforma',
    title: 'Linha do Tempo da Reforma',
    message: 'Visualize os prazos de 2026 a 2033. Cada etapa tem implicações para sua empresa.',
    ctaLabel: 'Prazos importantes',
    ctaQuestion: 'Quais são os prazos mais críticos da Reforma Tributária que eu preciso me preparar?',
    showOnce: true,
    delayMs: 1500
  },
  {
    route: '/dashboard/nexus',
    title: 'Central de Comando',
    message: 'O NEXUS consolida todos os seus KPIs tributários em um único painel. Volte aqui para ter a visão geral.',
    ctaLabel: 'Entender KPIs',
    ctaQuestion: 'Me explica os KPIs do NEXUS e o que cada número significa para minha empresa.',
    showOnce: true,
    delayMs: 1500
  },
];

// Notificações proativas baseadas em contexto e dados do usuário
interface ProactiveNotification {
  id: string;
  type: 'insight' | 'action' | 'reminder';
  title: string;
  message: string;
  ctaLabel: string;
  ctaQuestion: string;
  priority: number;
}

export function useClaraProactive() {
  const location = useLocation();
  const { user, profile } = useAuth();
  const [currentTip, setCurrentTip] = useState<OnboardingTip | null>(null);
  const [notifications, setNotifications] = useState<ProactiveNotification[]>([]);
  const [viewedTips, setViewedTips] = useState<Set<string>>(new Set());

  // Load viewed tips from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('clara_viewed_tips');
    if (stored) {
      try {
        setViewedTips(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error('Error loading viewed tips:', e);
      }
    }
  }, []);

  // Save viewed tips to localStorage
  const markTipViewed = useCallback((route: string) => {
    setViewedTips(prev => {
      const next = new Set(prev);
      next.add(route);
      localStorage.setItem('clara_viewed_tips', JSON.stringify([...next]));
      return next;
    });
    setCurrentTip(null);
  }, []);

  // Check for onboarding tip on route change
  useEffect(() => {
    const tip = ONBOARDING_TIPS.find(t => t.route === location.pathname);
    
    if (tip && (!tip.showOnce || !viewedTips.has(tip.route))) {
      const timer = setTimeout(() => {
        setCurrentTip(tip);
      }, tip.delayMs || 1000);
      
      return () => clearTimeout(timer);
    } else {
      setCurrentTip(null);
    }
  }, [location.pathname, viewedTips]);

  // Generate proactive notifications based on user data
  useEffect(() => {
    if (!user) return;

    const newNotifications: ProactiveNotification[] = [];

    // Check profile completeness - use nome as proxy for incomplete profile
    if (profile && !profile.nome) {
      newNotifications.push({
        id: 'complete_profile',
        type: 'action',
        title: 'Complete seu perfil',
        message: 'Adicione seus dados para recomendações personalizadas.',
        ctaLabel: 'Completar',
        ctaQuestion: 'Quais informações do perfil são mais importantes para você me dar recomendações melhores?',
        priority: 1
      });
    }

    // Suggest Score if not done
    // Note: In real implementation, check tax_score table
    
    setNotifications(newNotifications.sort((a, b) => a.priority - b.priority));
  }, [user, profile]);

  const dismissTip = useCallback(() => {
    if (currentTip) {
      markTipViewed(currentTip.route);
    }
  }, [currentTip, markTipViewed]);

  const handleTipCta = useCallback(() => {
    if (currentTip) {
      window.dispatchEvent(
        new CustomEvent("openClaraWithQuestion", {
          detail: { question: currentTip.ctaQuestion },
        })
      );
      markTipViewed(currentTip.route);
    }
  }, [currentTip, markTipViewed]);

  return {
    currentTip,
    notifications,
    dismissTip,
    handleTipCta,
    markTipViewed
  };
}

// Componente de tooltip de onboarding que aparece na primeira visita
interface ClaraOnboardingTooltipProps {
  className?: string;
}

export function ClaraOnboardingTooltip({ className }: ClaraOnboardingTooltipProps) {
  const { currentTip, dismissTip, handleTipCta } = useClaraProactive();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (currentTip) {
      // Animate in
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [currentTip]);

  if (!currentTip) return null;

  return (
    <div
      className={cn(
        "fixed bottom-24 right-6 z-40 max-w-sm transition-all duration-500 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        className
      )}
    >
      <div className="relative bg-card/95 backdrop-blur-sm border border-primary/30 rounded-2xl p-4 shadow-xl shadow-primary/10">
        {/* Close button */}
        <button
          onClick={dismissTip}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-primary">Clara AI</span>
              <Badge variant="secondary" className="text-[10px] px-1.5">
                Dica
              </Badge>
            </div>
            <h3 className="font-medium text-foreground text-sm">{currentTip.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{currentTip.message}</p>
            
            <div className="flex gap-2 mt-3">
              <Button onClick={handleTipCta} size="sm" className="text-xs gap-1">
                {currentTip.ctaLabel}
                <ArrowRight className="w-3 h-3" />
              </Button>
              <Button onClick={dismissTip} size="sm" variant="ghost" className="text-xs">
                Entendi
              </Button>
            </div>
          </div>
        </div>

        {/* Arrow pointing to FAB */}
        <div className="absolute -bottom-2 right-8 w-4 h-4 bg-card/95 border-r border-b border-primary/30 rotate-45 transform origin-center" />
      </div>
    </div>
  );
}

// Componente de notificação proativa de insight
interface ClaraInsightBannerProps {
  className?: string;
}

export function ClaraInsightBanner({ className }: ClaraInsightBannerProps) {
  const [insight, setInsight] = useState<{ title: string; message: string; question: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Generate contextual insights based on time of day, day of week, etc.
  useEffect(() => {
    const hour = new Date().getHours();
    const day = new Date().getDay();

    // Friday afternoon reminder
    if (day === 5 && hour >= 14) {
      setInsight({
        title: 'Revisão semanal',
        message: 'Que tal revisar o progresso desta semana? Posso resumir o que foi feito.',
        question: 'Me dá um resumo do que eu preciso acompanhar sobre a Reforma Tributária esta semana.'
      });
    }
    // Monday morning motivation
    else if (day === 1 && hour < 12) {
      setInsight({
        title: 'Nova semana, novos objetivos',
        message: 'Qual é sua prioridade tributária esta semana?',
        question: 'Quais são as principais ações tributárias que devo priorizar esta semana?'
      });
    }
  }, []);

  if (!insight || dismissed) return null;

  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent("openClaraWithQuestion", {
        detail: { question: insight.question },
      })
    );
    setDismissed(true);
  };

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20",
      className
    )}>
      <Lightbulb className="w-5 h-5 text-warning shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{insight.title}</p>
        <p className="text-xs text-muted-foreground">{insight.message}</p>
      </div>
      <Button onClick={handleClick} size="sm" variant="ghost" className="text-warning hover:text-warning/80 shrink-0">
        Perguntar
      </Button>
      <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
