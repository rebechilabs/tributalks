import { Button } from "@/components/ui/button";
import { Check, X, Star, MessageCircle, Diamond, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CONFIG } from "@/config/site";
import { TrustBadges } from "./TrustBadges";

type BillingPeriod = "mensal" | "anual";

interface PlanFeature {
  text: string;
  included: boolean | "limited";
  limitText?: string;
  isSubItem?: boolean;
}

interface Plan {
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  highlighted?: boolean;
  popular?: boolean;
  isEnterprise?: boolean;
  trialDays?: number;
  hasAnnual?: boolean;
  features: PlanFeature[];
  ctaText: string;
  linkMonthly: string;
  linkAnnual: string;
  cnpjLimit: string;
}

const plans: Plan[] = [
  {
    name: "STARTER",
    description: "Para começar com segurança",
    priceMonthly: 397,
    priceAnnual: 3970,
    trialDays: 7,
    hasAnnual: true,
    cnpjLimit: "1 CNPJ • 1 Usuário",
    features: [
      { text: "Clara AI (Assistente)", included: "limited", limitText: "30 msgs/dia" },
      { text: "Score Tributário", included: true, limitText: "Ilimitado" },
      { text: "Simulador Split Payment", included: true, limitText: "Ilimitado" },
      { text: "Comparativo de Regimes", included: true, limitText: "Ilimitado" },
      { text: "Calculadora RTC (CBS/IBS/IS)", included: true },
      { text: "Timeline 2026-2033", included: true },
      { text: "Newsletter Tributalks News", included: true },
      { text: "Compra de créditos Clara", included: true },
    ],
    ctaText: "Testar 7 dias grátis",
    linkMonthly: CONFIG.PAYMENT_LINKS.STARTER_MENSAL,
    linkAnnual: CONFIG.PAYMENT_LINKS.STARTER_ANUAL,
  },
  {
    name: "NAVIGATOR",
    description: "Para monitorar a reforma",
    priceMonthly: 1297,
    priceAnnual: 12970,
    cnpjLimit: "2 CNPJs • 2 Usuários",
    features: [
      { text: "Clara AI (Copiloto)", included: "limited", limitText: "100 msgs/dia" },
      { text: "Score Tributário", included: true, limitText: "Ilimitado" },
      { text: "Tudo do Starter +", included: true },
      { text: "Calculadora NBS (Serviços)", included: true },
      { text: "GPS da Reforma (Notícias)", included: true },
      { text: "Checklist de Prontidão", included: true },
      { text: "Analisador de Documentos IA", included: true },
      { text: "Workflows Guiados", included: true },
      { text: "Comunidade Circle Tributalks", included: true },
      { text: "Relatórios PDF Clara AI", included: true },
      { text: "Compra de créditos Clara", included: true },
    ],
    ctaText: "Assinar Navigator",
    linkMonthly: CONFIG.PAYMENT_LINKS.NAVIGATOR_MENSAL,
    linkAnnual: CONFIG.PAYMENT_LINKS.NAVIGATOR_ANUAL,
  },
  {
    name: "PROFESSIONAL",
    description: "Diagnóstico completo + NEXUS",
    priceMonthly: 2997,
    priceAnnual: 29970,
    highlighted: true,
    popular: true,
    cnpjLimit: "5 CNPJs • 4 Usuários",
    features: [
      { text: "Clara AI ilimitada", included: true },
      { text: "Score Tributário", included: true, limitText: "Ilimitado" },
      { text: "Tudo do Navigator +", included: true },
      { text: "Análise de Créditos (XMLs)", included: true },
      { text: "DRE Inteligente", included: true },
      { text: "Radar de Créditos Tributários", included: true },
      { text: "61+ Oportunidades Fiscais", included: true },
      { text: "Suíte Margem Ativa", included: true },
      { text: "NEXUS (Centro de Comando)", included: true },
      { text: "Conectar ERP", included: true },
      { text: "Relatórios PDF Profissionais", included: true },
    ],
    ctaText: "Assinar Professional",
    linkMonthly: CONFIG.PAYMENT_LINKS.PROFESSIONAL_MENSAL,
    linkAnnual: CONFIG.PAYMENT_LINKS.PROFESSIONAL_ANUAL,
  },
  {
    name: "ENTERPRISE",
    description: "Para grupos econômicos",
    priceMonthly: 0,
    priceAnnual: 0,
    isEnterprise: true,
    cnpjLimit: "Ilimitado • Usuários Ilimitados",
    features: [
      { text: "Clara AI ilimitada", included: true },
      { text: "Tudo do Professional +", included: true },
      { text: "Painel Executivo Multi-empresa", included: true },
      { text: "Consultoria com Rebechi & Silva Advogados", included: true },
      { text: "White Label", included: true, limitText: "(seu logo, cores, domínio)" },
      { text: "API de integração dedicada", included: true },
      { text: "SLA prioritário", included: true },
    ],
    ctaText: "Fale conosco",
    linkMonthly: CONFIG.PAYMENT_LINKS.ENTERPRISE,
    linkAnnual: CONFIG.PAYMENT_LINKS.ENTERPRISE,
  },
];

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("mensal");

  return (
    <section id="planos" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Escolha seu plano
          </h2>
          <p className="text-muted-foreground text-base md:text-lg px-4">
            Teste grátis por 7 dias. Cancele quando quiser.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 md:mb-12">
          <div className="inline-flex items-center bg-secondary rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod("mensal")}
              className={`px-4 md:px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === "mensal"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod("anual")}
              className={`px-4 md:px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === "anual"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Anual
            </button>
          </div>
          {billingPeriod === "anual" && (
            <span className="bg-primary/20 text-primary text-xs font-semibold px-3 py-1 rounded-full">
              2 meses grátis
            </span>
          )}
        </div>

        {/* Plans Grid - Horizontal scroll on mobile */}
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-4 md:pb-0 scrollbar-hide">
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto min-w-max md:min-w-0">
          {plans.map((plan, index) => {
            // Verificar se plano tem opção anual disponível
            const effectiveBillingPeriod = plan.hasAnnual ? billingPeriod : "mensal";
            const price =
              effectiveBillingPeriod === "mensal" ? plan.priceMonthly : plan.priceAnnual;
            const link =
              effectiveBillingPeriod === "mensal" 
                ? plan.linkMonthly 
                : (plan.linkAnnual || plan.linkMonthly);
            const isExternal = link.startsWith("http");

            return (
              <div
                key={plan.name}
                className={`relative bg-card rounded-xl p-5 md:p-6 border-2 transition-all duration-300 animate-fade-in-up w-[280px] md:w-auto flex-shrink-0 md:flex-shrink ${
                  plan.highlighted
                    ? "border-primary"
                    : "border-border hover:border-border-light"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] md:text-xs font-semibold whitespace-nowrap">
                      <Star className="w-3 h-3" />
                      MAIS POPULAR
                    </div>
                  </div>
                )}

                {/* Trial Badge for Starter */}
                {plan.trialDays && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full bg-success text-success-foreground text-[10px] md:text-xs font-semibold whitespace-nowrap">
                      <Sparkles className="w-3 h-3" />
                      {plan.trialDays} DIAS GRÁTIS
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className={`text-center mb-4 md:mb-6 ${plan.popular || plan.trialDays ? 'pt-4' : 'pt-2'}`}>
                  <h3 className="text-base md:text-lg font-bold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    {plan.isEnterprise ? (
                      <span className="text-xl md:text-2xl font-bold text-foreground">
                        Sob consulta
                      </span>
                    ) : (
                      <>
                        <span className="text-3xl md:text-4xl font-bold text-foreground">
                          R${effectiveBillingPeriod === "mensal" ? price.toLocaleString('pt-BR') : Math.round(price / 12).toLocaleString('pt-BR')}
                        </span>
                        <span className="text-muted-foreground text-sm">/mês</span>
                      </>
                    )}
                  </div>
                  {/* Mostrar "cobrado anualmente" apenas para planos com anual */}
                  {effectiveBillingPeriod === "anual" && price > 0 && !plan.isEnterprise && (
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                      R${price.toLocaleString('pt-BR')} cobrado anualmente
                    </p>
                  )}
                  {/* Indicador "somente mensal" quando toggle anual está ativo mas plano não tem anual */}
                  {billingPeriod === "anual" && !plan.hasAnnual && !plan.isEnterprise && (
                    <p className="text-[10px] md:text-xs text-muted-foreground/70 mt-1 italic">
                      (disponível apenas mensal)
                    </p>
                  )}
                  <p className="text-[10px] md:text-xs text-primary mt-2 font-medium">
                    {plan.cnpjLimit}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-border mb-4 md:mb-6" />

                {/* Features */}
                <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className={`flex items-start gap-2 ${feature.isSubItem ? "ml-4" : ""}`}>
                      {feature.isSubItem ? (
                        <span className="w-4 md:w-5 flex-shrink-0" />
                      ) : plan.isEnterprise && feature.included === true ? (
                        <Diamond className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-0.5" />
                      ) : feature.included === true ? (
                        <Check className="w-4 h-4 md:w-5 md:h-5 text-success flex-shrink-0 mt-0.5" />
                      ) : feature.included === "limited" ? (
                        <Check className="w-4 h-4 md:w-5 md:h-5 text-warning flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex flex-col">
                        <span
                          className={`text-sm md:text-base ${
                            feature.included
                              ? "text-foreground"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          {feature.text}
                        </span>
                        {feature.limitText && (
                          <span className={`text-[10px] md:text-xs mt-0.5 ${plan.isEnterprise ? "text-muted-foreground" : feature.included === "limited" ? "text-warning" : "text-success"}`}>
                            {plan.isEnterprise ? feature.limitText : `(${feature.limitText})`}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {isExternal ? (
                  <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : plan.isEnterprise
                          ? "bg-secondary text-foreground hover:bg-secondary/80"
                          : "bg-transparent border border-foreground text-foreground hover:bg-foreground hover:text-background"
                      }`}
                    >
                      {plan.isEnterprise && <MessageCircle className="w-4 h-4 mr-2" />}
                      {plan.ctaText}
                    </Button>
                  </a>
                ) : (
                  <Link to={link}>
                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : plan.trialDays
                          ? "bg-success text-success-foreground hover:bg-success/90"
                          : "bg-transparent border border-foreground text-foreground hover:bg-foreground hover:text-background"
                      }`}
                    >
                      {plan.trialDays && <Sparkles className="w-4 h-4 mr-2" />}
                      {plan.ctaText}
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
          </div>
        </div>

        {/* Scroll hint for mobile */}
        <p className="text-center text-xs text-muted-foreground mt-2 md:hidden">
          ← Deslize para ver todos os planos →
        </p>

        {/* Trust Badges */}
        <div className="mt-10 md:mt-16">
          <p className="text-center text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
            Sua segurança é nossa prioridade
          </p>
          <TrustBadges variant="full" className="max-w-4xl mx-auto" />
        </div>
      </div>
    </section>
  );
}
