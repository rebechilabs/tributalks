import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFeatureAccess, FeatureKey, PLAN_LABELS, PLAN_PRICES } from "@/hooks/useFeatureAccess";
import { cn } from "@/lib/utils";

interface FeatureGateProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
  showBlur?: boolean;
  className?: string;
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  showBlur = true,
  className 
}: FeatureGateProps) {
  const { hasAccess, minPlan, upgradeMessage } = useFeatureAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Fallback customizado
  if (fallback) {
    return <>{fallback}</>;
  }

  // UI padrão de bloqueio
  return (
    <div className={cn("relative", className)}>
      {/* Preview borrado */}
      {showBlur && (
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute inset-0 backdrop-blur-sm bg-background/80 z-10" />
          <div className="opacity-30 pointer-events-none">
            {children}
          </div>
        </div>
      )}
      
      {/* Overlay de upgrade */}
      <Card className={cn(
        "border-primary/30 bg-card/95 backdrop-blur-sm",
        showBlur ? "relative z-20" : ""
      )}>
        <CardContent className="py-8 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Funcionalidade Premium
          </h3>
          
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            {upgradeMessage}
          </p>
          
          <Link to="/#planos">
            <Button className="gap-2">
              <Sparkles className="w-4 h-4" />
              Upgrade para {PLAN_LABELS[minPlan]}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para inline gates (badges, botões)
interface FeatureGateInlineProps {
  feature: FeatureKey;
  children: ReactNode;
  lockedContent?: ReactNode;
}

export function FeatureGateInline({ 
  feature, 
  children, 
  lockedContent 
}: FeatureGateInlineProps) {
  const { hasAccess, minPlan } = useFeatureAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (lockedContent) {
    return <>{lockedContent}</>;
  }

  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground cursor-not-allowed">
      <Lock className="w-3.5 h-3.5" />
      <span className="text-xs">{PLAN_LABELS[minPlan]}</span>
    </span>
  );
}

// Componente para limite de uso (ex: 1x grátis)
interface FeatureGateLimitProps {
  feature: FeatureKey;
  children: ReactNode;
  usageCount: number;
}

export function FeatureGateLimit({ 
  feature, 
  children, 
  usageCount 
}: FeatureGateLimitProps) {
  const { hasAccess, limit, minPlan } = useFeatureAccess(feature);

  // Se não tem acesso ao plano mínimo
  if (!hasAccess) {
    return (
      <FeatureGate feature={feature}>
        {children}
      </FeatureGate>
    );
  }

  // Se tem limite e já usou
  if (typeof limit === 'number' && usageCount >= limit) {
    return (
      <Card className="border-primary/30">
        <CardContent className="py-8 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-muted-foreground" />
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Limite atingido
          </h3>
          
          <p className="text-muted-foreground text-sm mb-6">
            Você já usou sua {limit === 1 ? 'simulação gratuita' : `${limit} simulações`} este mês.
            <br />
            Faça upgrade para uso ilimitado.
          </p>
          
          <Link to="/#planos">
            <Button className="gap-2">
              <Sparkles className="w-4 h-4" />
              Desbloquear uso ilimitado
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
