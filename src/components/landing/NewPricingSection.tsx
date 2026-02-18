import { Button } from "@/components/ui/button";
import { Check, Star, MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { CONFIG } from "@/config/site";
import { EnterpriseModal } from "./EnterpriseModal";
import { Badge } from "@/components/ui/badge";

type BillingPeriod = "mensal" | "anual";

interface PlanCard {
  name: string;
  subtitle: string;
  priceMonthly: number;
  priceAnnual: number;
  linkMonthly: string;
  linkAnnual: string;
  highlight: string;
  claraInfo: string;
  features: string[];
  recommended: boolean;
}

const plans: PlanCard[] = [
  {
    name: "STARTER",
    subtitle: "Para começar com segurança",
    priceMonthly: 297,
    priceAnnual: 3267,
    linkMonthly: CONFIG.PAYMENT_LINKS.STARTER_MENSAL,
    linkAnnual: CONFIG.PAYMENT_LINKS.STARTER_ANUAL,
    highlight: "1 CNPJ",
    claraInfo: "Clara AI: Assistente (30 msgs/dia)",
    features: [
      "@ENTENDER",
      "DRE Inteligente",
      "Score Tributário 0-1000",
      "Calculadora CBS/IBS por NCM",
      "Comparativo de Regimes",
      "Timeline 2026-2033",
      "Newsletter TribuTalks News",
    ],
    recommended: false,
  },
  {
    name: "NAVIGATOR",
    subtitle: "Para recuperar créditos",
    priceMonthly: 697,
    priceAnnual: 7667,
    linkMonthly: CONFIG.PAYMENT_LINKS.NAVIGATOR_MENSAL,
    linkAnnual: CONFIG.PAYMENT_LINKS.NAVIGATOR_ANUAL,
    highlight: "2 CNPJs",
    claraInfo: "Clara AI: Copiloto (100 msgs/dia)",
    features: [
      "Tudo do Starter +",
      "@RECUPERAR",
      "Radar de Créditos (XML, SPED)",
      "@PLANEJAR",
      "Planejamento com 61+ oportunidades",
      "Calculadora NCM e NBS",
      "Analisador de Documentos IA",
      "Workflows Guiados",
      "Relatórios PDF Clara AI",
    ],
    recommended: false,
  },
  {
    name: "PROFESSIONAL",
    subtitle: "Para gestão estratégica completa",
    priceMonthly: 1997,
    priceAnnual: 21967,
    linkMonthly: CONFIG.PAYMENT_LINKS.PROFESSIONAL_MENSAL,
    linkAnnual: CONFIG.PAYMENT_LINKS.PROFESSIONAL_ANUAL,
    highlight: "4 CNPJs • 4 Usuários",
    claraInfo: "Clara AI: Ilimitada",
    features: [
      "Tudo do Navigator +",
      "@PRECIFICAR",
      "Margem Ativa por NCM",
      "Split Payment 2026",
      "PriceGuard",
      "@COMANDAR",
      "NEXUS (Centro de Comando)",
      "OMC-AI (Fornecedores)",
      "Valuation (3 metodologias)",
      "Relatórios Executivos PDF",
      "Conectar ERP",
    ],
    recommended: true,
  },
];

export function NewPricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("mensal");
  const [enterpriseModalOpen, setEnterpriseModalOpen] = useState(false);

  return (
    <section id="planos" className="py-16 md:py-20 bg-[#1A1A1A]">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Escolha seu plano e comece seu teste grátis de 7 dias.
          </h2>
          <p className="text-lg text-white/60">
            Cancele a qualquer momento. Sem burocracia.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="inline-flex items-center bg-[#1A1A1A] rounded-full p-1 border border-white/10">
            <button
              onClick={() => setBillingPeriod("mensal")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                billingPeriod === "mensal"
                  ? "bg-primary text-primary-foreground"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod("anual")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                billingPeriod === "anual"
                  ? "bg-primary text-primary-foreground"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Anual
            </button>
          </div>
          {billingPeriod === "anual" && (
            <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full">
              Economize ~8%
            </span>
          )}
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
          {plans.map((plan, index) => {
            const price = billingPeriod === "mensal" ? plan.priceMonthly : plan.priceAnnual;
            const monthly = billingPeriod === "anual" ? Math.round(price / 12) : price;
            const link = billingPeriod === "mensal" ? plan.linkMonthly : plan.linkAnnual;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border-2 ${
                  plan.recommended
                    ? "border-primary shadow-lg shadow-primary/20"
                    : "border-white/10"
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1">
                      <Star className="w-3 h-3 mr-1" fill="currentColor" />
                      MAIS POPULAR
                    </Badge>
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-white/50 mt-1">{plan.subtitle}</p>

                  <div className="flex items-baseline justify-center gap-1 mt-4">
                    <span className="text-4xl font-extrabold text-white">
                      R${monthly.toLocaleString("pt-BR")}
                    </span>
                    <span className="text-white/50 text-sm">/mês</span>
                  </div>
                  {billingPeriod === "anual" && (
                    <p className="text-[10px] text-white/40 mt-1">
                      R${price.toLocaleString("pt-BR")}/ano
                    </p>
                  )}

                  <p className="text-primary font-bold text-sm mt-3">{plan.highlight}</p>
                  <p className="text-white/50 text-xs mt-1">{plan.claraInfo}</p>
                </div>

                <div className="border-t border-white/10 my-2" />

                {/* Features */}
                <div className="flex-1 space-y-3 my-4">
                  {plan.features.map((feature) => {
                    if (feature.startsWith("@")) {
                      return (
                        <p key={feature} className="text-xs font-bold text-primary uppercase tracking-wider mt-3 mb-1">
                          {feature.slice(1)}
                        </p>
                      );
                    }
                    return (
                      <div key={feature} className="flex items-start gap-2.5">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-white/80">{feature}</span>
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <a href={link} target="_blank" rel="noopener noreferrer" className="block mt-auto">
                  <Button
                    className={`w-full py-5 font-bold text-sm ${
                      plan.recommended
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Testar 7 dias grátis
                  </Button>
                </a>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-sm text-white/40 mb-10">
          Todos os planos incluem 7 dias grátis. Cancele quando quiser.
        </p>

        {/* Enterprise Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-white/10 text-center">
            <h3 className="text-xl font-bold text-white mb-2">ENTERPRISE</h3>
            <p className="text-white/60 mb-6">
              Para grupos econômicos e soluções White Label.
            </p>
            <Button
              onClick={() => setEnterpriseModalOpen(true)}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold px-8 py-6"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Fale Conosco
            </Button>
          </div>
        </motion.div>
      </div>

      <EnterpriseModal open={enterpriseModalOpen} onOpenChange={setEnterpriseModalOpen} />
    </section>
  );
}
