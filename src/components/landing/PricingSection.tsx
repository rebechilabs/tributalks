import { Button } from "@/components/ui/button";
import { Check, X, Star, Lightbulb } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CONFIG } from "@/config/site";

type BillingPeriod = "mensal" | "anual";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  highlighted?: boolean;
  popular?: boolean;
  features: PlanFeature[];
  ctaText: string;
  linkMonthly: string;
  linkAnnual: string;
  specialNote?: string;
}

const plans: Plan[] = [
  {
    name: "FREE",
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      { text: "1 simulação/mês", included: true },
      { text: "Só Comparativo de Regimes", included: true },
      { text: "TribuBot", included: false },
      { text: "Notícias Tributárias", included: false },
      { text: "Relatório PDF", included: false },
      { text: "Comunidade", included: false },
    ],
    ctaText: "Começar",
    linkMonthly: "/cadastro",
    linkAnnual: "/cadastro",
  },
  {
    name: "BÁSICO",
    priceMonthly: 99,
    priceAnnual: 990,
    features: [
      { text: "Simulações ilimitadas", included: true },
      { text: "Todas as calculadoras", included: true },
      { text: "TribuBot 10 msgs/dia", included: true },
      { text: "Notícias Tributárias", included: true },
      { text: "Relatório PDF", included: false },
      { text: "Comunidade", included: false },
    ],
    ctaText: "Assinar",
    linkMonthly: CONFIG.STRIPE_PAYMENT_LINKS.BASICO_MENSAL,
    linkAnnual: CONFIG.STRIPE_PAYMENT_LINKS.BASICO_ANUAL,
  },
  {
    name: "PROFISSIONAL",
    priceMonthly: 197,
    priceAnnual: 1970,
    highlighted: true,
    popular: true,
    features: [
      { text: "Simulações ilimitadas", included: true },
      { text: "Todas as calculadoras", included: true },
      { text: "TribuBot ilimitado", included: true },
      { text: "Notícias Tributárias", included: true },
      { text: "Relatório PDF", included: true },
      { text: "Comunidade", included: true },
    ],
    ctaText: "Assinar",
    linkMonthly: CONFIG.STRIPE_PAYMENT_LINKS.PROFISSIONAL_MENSAL,
    linkAnnual: CONFIG.STRIPE_PAYMENT_LINKS.PROFISSIONAL_ANUAL,
  },
  {
    name: "PREMIUM",
    priceMonthly: 500,
    priceAnnual: 5000,
    features: [
      { text: "Tudo do Profissional", included: true },
      { text: "Filtros e Alertas de Notícias", included: true },
      { text: "2 consultorias/mês com especialista", included: true },
      { text: "Prioridade em novos recursos", included: true },
    ],
    ctaText: "Assinar",
    linkMonthly: CONFIG.STRIPE_PAYMENT_LINKS.PREMIUM_MENSAL,
    linkAnnual: CONFIG.STRIPE_PAYMENT_LINKS.PREMIUM_ANUAL,
    specialNote: "2x 30min = 1h consultoria\nValor de mercado: ~R$1.000\nVocê paga: R$500 total",
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
            Comece grátis. Upgrade quando fizer sentido.
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
            const link =
              billingPeriod === "mensal" ? plan.linkMonthly : plan.linkAnnual;
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

                {/* Plan Header */}
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    {plan.priceMonthly === 0 ? (
                      <span className="text-4xl font-bold text-foreground">
                        R$0
                      </span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-foreground">
                          R${billingPeriod === "mensal" ? price : Math.round(price / 12)}
                        </span>
                        <span className="text-muted-foreground">/mês</span>
                      </>
                    )}
                  </div>
                  {billingPeriod === "anual" && plan.priceAnnual > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      R${plan.priceAnnual} cobrado anualmente
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-border mb-6" />

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-success flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      <span
                        className={
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground/50"
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Special Note for Premium */}
                {plan.specialNote && (
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground whitespace-pre-line">
                        {plan.specialNote}
                      </p>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                {isExternal ? (
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-transparent border border-foreground text-foreground hover:bg-foreground hover:text-background"
                      }`}
                    >
                      {plan.ctaText}
                    </Button>
                  </a>
                ) : (
                  <Link to={link}>
                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-transparent border border-foreground text-foreground hover:bg-foreground hover:text-background"
                      }`}
                    >
                      {plan.ctaText}
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
