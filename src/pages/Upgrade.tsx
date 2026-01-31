import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, ArrowRight, Star, Zap, Shield, Users, LayoutDashboard, FileText, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEATURE_HIGHLIGHTS, LEGACY_PLAN_MAP, PlanType } from "@/data/menuConfig";

const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 'R$ 397',
    period: '/mês',
    description: 'Para empresários que querem entender a Reforma',
    features: [
      'Score Tributário',
      'Calculadoras básicas (RTC, Split Payment)',
      'Timeline 2026-2033',
      'Clara AI (20 msgs/dia)',
    ],
    highlight: false,
  },
  {
    id: 'NAVIGATOR',
    name: 'Navigator',
    price: 'R$ 1.297',
    period: '/mês',
    description: 'Para quem quer monitorar e se preparar ativamente',
    features: [
      'Tudo do Starter +',
      'Notícias da Reforma (diárias)',
      'Checklist de Prontidão',
      'Calculadora NBS (Serviços)',
      'Analisador de Documentos',
      'Workflows Guiados',
      'TribuTalks Connect',
      'Clara AI (60 msgs/dia)',
    ],
    highlight: true,
    badge: 'Mais Popular',
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    price: 'R$ 2.997',
    period: '/mês',
    description: 'Para empresas que querem agir com dados e comando',
    features: [
      'Tudo do Navigator +',
      'NEXUS Command Center (8 KPIs)',
      'Radar de Créditos Tributários',
      'DRE Inteligente',
      'Oportunidades Fiscais (61+)',
      'Suíte Margem Ativa',
      'Integração ERP',
      'Clara AI ilimitada',
      'Relatórios Executivos',
    ],
    highlight: false,
    badge: 'Completo',
  },
];

export default function Upgrade() {
  const [searchParams] = useSearchParams();
  const feature = searchParams.get('feature');
  const { profile } = useAuth();
  
  const rawPlan = profile?.plano || 'STARTER';
  const currentPlan = (LEGACY_PLAN_MAP[rawPlan] || 'STARTER') as PlanType;
  
  const highlight = feature && FEATURE_HIGHLIGHTS[feature] ? FEATURE_HIGHLIGHTS[feature] : null;
  const HighlightIcon = highlight?.icon || LayoutDashboard;

  const getPlanIndex = (planId: string) => {
    const hierarchy: Record<string, number> = { STARTER: 0, NAVIGATOR: 1, PROFESSIONAL: 2 };
    return hierarchy[planId] || 0;
  };

  const currentPlanIndex = getPlanIndex(currentPlan);

  return (
    <DashboardLayout title="Upgrade de Plano">
      <div className="container max-w-6xl py-8 px-4">
        {/* Feature Highlight Banner */}
        {highlight && (
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <HighlightIcon className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    Desbloqueie
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {highlight.title}
                </h2>
                <p className="text-muted-foreground mb-2">{highlight.description}</p>
                <p className="text-sm text-primary font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {highlight.value}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Escolha o plano ideal para sua empresa
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Todos os planos incluem acesso à Clara AI, sua copiloto tributária com IA, 
            e atualizações constantes sobre a Reforma Tributária 2026-2033.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {PLANS.map((plan) => {
            const planIndex = getPlanIndex(plan.id);
            const isCurrent = plan.id === currentPlan;
            const isDowngrade = planIndex < currentPlanIndex;
            const isUpgrade = planIndex > currentPlanIndex;
            const isHighlighted = plan.highlight || (feature && plan.id === 'PROFESSIONAL');

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative transition-all",
                  isHighlighted && "ring-2 ring-primary shadow-lg scale-[1.02]",
                  isCurrent && "bg-muted/50"
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className={cn(
                      "px-3 py-1",
                      plan.badge === 'Mais Popular' ? "bg-primary" : "bg-muted-foreground"
                    )}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pt-8">
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {isCurrent && (
                      <Badge variant="outline" className="ml-2">Seu plano</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span className={cn(
                          feature.includes('Clara AI') && "font-medium text-primary"
                        )}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild={!isCurrent && !isDowngrade}
                    disabled={isCurrent || isDowngrade}
                    className={cn(
                      "w-full",
                      isHighlighted && !isCurrent && "bg-primary hover:bg-primary/90",
                      isCurrent && "bg-muted text-muted-foreground"
                    )}
                    variant={isCurrent ? "outline" : isUpgrade ? "default" : "secondary"}
                  >
                    {isCurrent ? (
                      <span>Plano Atual</span>
                    ) : isDowngrade ? (
                      <span>—</span>
                    ) : (
                      <Link to="/#planos" className="flex items-center gap-2">
                        Assinar {plan.name}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust Section */}
        <div className="text-center py-8 border-t border-border">
          <div className="flex items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm">Ativação imediata</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span className="text-sm">Suporte prioritário</span>
            </div>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-8 p-6 rounded-xl bg-muted/50 border border-border text-center">
          <h3 className="text-lg font-semibold mb-2">Precisa de mais?</h3>
          <p className="text-muted-foreground mb-4">
            O plano Enterprise inclui consultoria estratégica com advogados tributaristas, 
            multi-CNPJ ilimitado e SLA dedicado.
          </p>
          <Button asChild variant="outline">
            <Link to="/contato">
              <Users className="w-4 h-4 mr-2" />
              Falar com Especialista
            </Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
