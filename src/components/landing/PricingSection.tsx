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
    priceMonthly: 297,
    priceAnnual: 2970,
    trialDays: 7,
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
    priceMonthly: 1997,
    priceAnnual: 19970,
    highlighted: true,
    popular: true,
    cnpjLimit: "5 CNPJs • 5 Usuários",
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
    <section id="planos" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Escolha seu plano
          </h2>
          <p className="text-muted-foreground text-lg">
            Teste grátis por 7 dias com cartão. Cancele quando quiser.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="inline-flex items-center bg-secondary rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod("mensal")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === "mensal"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod("anual")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
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

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const price =
              billingPeriod === "mensal" ? plan.priceMonthly : plan.priceAnnual;
            // Fallback: se link anual estiver vazio, usa link mensal
            const link =
              billingPeriod === "mensal" 
                ? plan.linkMonthly 
                : (plan.linkAnnual || plan.linkMonthly);
            const isExternal = link.startsWith("http");

            return (
              <div
                key={plan.name}
                className={`relative bg-card rounded-xl p-6 border-2 transition-all duration-300 animate-fade-in-up ${
                  plan.highlighted
                    ? "border-primary"
                    : "border-border hover:border-border-light"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      <Star className="w-3 h-3" />
                      MAIS POPULAR
                    </div>
                  </div>
                )}

                {/* Trial Badge for Starter */}
                {plan.trialDays && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success text-success-foreground text-xs font-semibold">
                      <Sparkles className="w-3 h-3" />
                      {plan.trialDays} DIAS GRÁTIS
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    {plan.isEnterprise ? (
                      <span className="text-2xl font-bold text-foreground">
                        Sob consulta
                      </span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-foreground">
                          R${billingPeriod === "mensal" ? price.toLocaleString('pt-BR') : Math.round(price / 12).toLocaleString('pt-BR')}
                        </span>
                        <span className="text-muted-foreground">/mês</span>
                      </>
                    )}
                  </div>
                  {billingPeriod === "anual" && price > 0 && !plan.isEnterprise && (
                    <p className="text-xs text-muted-foreground mt-1">
                      R${price.toLocaleString('pt-BR')} cobrado anualmente
                    </p>
                  )}
                  <p className="text-xs text-primary mt-2 font-medium">
                    {plan.cnpjLimit}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-border mb-6" />

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className={`flex items-start gap-2 ${feature.isSubItem ? "ml-4" : ""}`}>
                      {feature.isSubItem ? (
                        <span className="w-5 flex-shrink-0" />
                      ) : plan.isEnterprise && feature.included === true ? (
                        <Diamond className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : feature.included === true ? (
                        <Check className="w-5 h-5 text-success flex-shrink-0" />
                      ) : feature.included === "limited" ? (
                        <Check className="w-5 h-5 text-warning flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      <div className="flex flex-col">
                        <span
                          className={
                            feature.included
                              ? "text-foreground"
                              : "text-muted-foreground/50"
                          }
                        >
                          {feature.text}
                        </span>
                        {feature.limitText && (
                          <span className={`text-xs mt-0.5 ${plan.isEnterprise ? "text-muted-foreground" : feature.included === "limited" ? "text-warning" : "text-success"}`}>
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

        {/* Trust Badges */}
        <div className="mt-16">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Sua segurança é nossa prioridade
          </p>
          <TrustBadges variant="full" className="max-w-4xl mx-auto" />
        </div>
      </div>
    </section>
  );
}
