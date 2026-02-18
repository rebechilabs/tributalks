import { Button } from "@/components/ui/button";
import { Check, Minus, Star, MessageCircle, Sparkles, BarChart3, Calculator, FileSearch, Target, LayoutDashboard, Building2, Gift } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { CONFIG } from "@/config/site";
import { EnterpriseModal } from "./EnterpriseModal";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import type { LucideIcon } from "lucide-react";

type BillingPeriod = "mensal" | "anual";

interface FeatureRow {
  name: string;
  starter: boolean | string;
  navigator: boolean | string;
  professional: boolean | string;
}

interface FeatureGroup {
  name: string;
  icon: LucideIcon;
  features: FeatureRow[];
}

const featureGroups: FeatureGroup[] = [
  {
    name: "ENTENDER",
    icon: BarChart3,
    features: [
      { name: "DRE Inteligente", starter: true, navigator: true, professional: true },
      { name: "Score Tributário", starter: true, navigator: true, professional: true },
      { name: "Comparativo de Regimes Tributários", starter: true, navigator: true, professional: true },
    ],
  },
  {
    name: "PRECIFICAR",
    icon: Calculator,
    features: [
      { name: "Margem Ativa", starter: false, navigator: true, professional: true },
    ],
  },
  {
    name: "RECUPERAR",
    icon: FileSearch,
    features: [
      { name: "Radar de Créditos", starter: false, navigator: true, professional: true },
    ],
  },
  {
    name: "PLANEJAR",
    icon: Target,
    features: [
      { name: "Oportunidades Tributárias", starter: false, navigator: true, professional: true },
      { name: "Planejamento Tributário", starter: false, navigator: false, professional: true },
    ],
  },
  {
    name: "COMANDAR",
    icon: LayoutDashboard,
    features: [
      { name: "Painel Executivo", starter: false, navigator: false, professional: true },
      { name: "Relatórios PDF", starter: false, navigator: true, professional: true },
    ],
  },
  {
    name: "CLARA AI",
    icon: Sparkles,
    features: [
      { name: "Mensagens/dia", starter: "30", navigator: "100", professional: "Ilimitado" },
      { name: "Agentes disponíveis", starter: "Entender", navigator: "Entender, Precificar, Recuperar", professional: "Todos" },
    ],
  },
  {
    name: "EMPRESA",
    icon: Building2,
    features: [
      { name: "CNPJs", starter: "1", navigator: "2", professional: "4" },
      { name: "Conexão ERP", starter: false, navigator: false, professional: true },
    ],
  },
  {
    name: "EXTRAS",
    icon: Gift,
    features: [
      { name: "Notícias da Reforma", starter: "No dashboard", navigator: "No dashboard", professional: "Dashboard + Email" },
      { name: "Comunidade", starter: false, navigator: true, professional: true },
      { name: "Analisador de Docs", starter: false, navigator: true, professional: true },
    ],
  },
];

const plansMeta = [
  {
    name: "STARTER",
    subtitle: "Entenda sua situação tributária",
    priceMonthly: 297,
    priceAnnual: 3267,
    linkMonthly: CONFIG.PAYMENT_LINKS.STARTER_MENSAL,
    linkAnnual: CONFIG.PAYMENT_LINKS.STARTER_ANUAL,
    recommended: false,
  },
  {
    name: "NAVIGATOR",
    subtitle: "Precifique certo e recupere créditos",
    priceMonthly: 697,
    priceAnnual: 7667,
    linkMonthly: CONFIG.PAYMENT_LINKS.NAVIGATOR_MENSAL,
    linkAnnual: CONFIG.PAYMENT_LINKS.NAVIGATOR_ANUAL,
    recommended: true,
  },
  {
    name: "PROFESSIONAL",
    subtitle: "Planejamento estratégico com IA ilimitada",
    priceMonthly: 1997,
    priceAnnual: 21967,
    linkMonthly: CONFIG.PAYMENT_LINKS.PROFESSIONAL_MENSAL,
    linkAnnual: CONFIG.PAYMENT_LINKS.PROFESSIONAL_ANUAL,
    recommended: false,
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-5 h-5 text-primary mx-auto" />;
  if (value === false) return <Minus className="w-5 h-5 text-white/20 mx-auto" />;
  return <span className="text-sm text-white/80">{value}</span>;
}

function MobileCellValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4 text-primary flex-shrink-0" />;
  if (value === false) return <Minus className="w-4 h-4 text-white/20 flex-shrink-0" />;
  return <span className="text-xs text-white/70">{String(value)}</span>;
}

export function NewPricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("mensal");
  const [enterpriseModalOpen, setEnterpriseModalOpen] = useState(false);

  // Mobile card order: Navigator first (recommended), then Starter, Professional
  const mobileOrder = [plansMeta[1], plansMeta[0], plansMeta[2]];

  const getPlanKey = (name: string): "starter" | "navigator" | "professional" => {
    return name.toLowerCase() as "starter" | "navigator" | "professional";
  };

  return (
    <section id="planos" className="py-16 md:py-20 bg-[#0A0A0A]">
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
          <div className="inline-flex items-center bg-[#111111] rounded-full p-1 border border-white/10">
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

        {/* ═══ DESKTOP TABLE ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="hidden md:block max-w-5xl mx-auto mb-8"
        >
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#111111]">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/10 hover:bg-transparent">
                  <TableHead className="w-[240px] bg-[#111111]" />
                  {plansMeta.map((plan) => {
                    const price = billingPeriod === "mensal" ? plan.priceMonthly : plan.priceAnnual;
                    const monthly = billingPeriod === "anual" ? Math.round(price / 12) : price;
                    const link = billingPeriod === "mensal" ? plan.linkMonthly : plan.linkAnnual;

                    return (
                      <TableHead
                        key={plan.name}
                        className={`text-center align-top p-6 bg-[#111111] ${
                          plan.recommended ? "border-x-2 border-t-2 border-primary" : ""
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          {plan.recommended && (
                            <Badge className="bg-primary text-primary-foreground text-[10px] font-bold">
                              <Star className="w-3 h-3 mr-1" fill="currentColor" />
                              MAIS POPULAR
                            </Badge>
                          )}
                          <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                          <p className="text-xs text-white/50">{plan.subtitle}</p>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl font-extrabold text-white">
                              R${monthly.toLocaleString("pt-BR")}
                            </span>
                            <span className="text-white/50 text-sm">/mês</span>
                          </div>
                          {billingPeriod === "anual" && (
                            <p className="text-[10px] text-white/40">
                              R${price.toLocaleString("pt-BR")}/ano
                            </p>
                          )}
                          <a href={link} target="_blank" rel="noopener noreferrer" className="mt-3 w-full">
                            <Button
                              size="sm"
                              className={`w-full text-xs font-bold ${
                                plan.recommended
                                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                              }`}
                            >
                              Comece seus 7 dias grátis →
                            </Button>
                          </a>
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureGroups.map((group) => {
                  const Icon = group.icon;
                  return (
                    <> 
                      {/* Module header row */}
                      <TableRow key={`group-${group.name}`} className="hover:bg-transparent border-b border-white/5">
                        <TableCell colSpan={4} className="bg-white/5 py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold text-primary tracking-wide">{group.name}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      {/* Feature rows */}
                      {group.features.map((feature) => (
                        <TableRow key={feature.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <TableCell className="text-sm text-white/70 py-3 px-4">{feature.name}</TableCell>
                          <TableCell className="text-center py-3">
                            <CellValue value={feature.starter} />
                          </TableCell>
                          <TableCell className={`text-center py-3 ${plansMeta[1].recommended ? "border-x-2 border-primary/30" : ""}`}>
                            <CellValue value={feature.navigator} />
                          </TableCell>
                          <TableCell className="text-center py-3">
                            <CellValue value={feature.professional} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Footer text */}
          <p className="text-center text-sm text-white/40 mt-6">
            Todos os planos incluem 7 dias grátis. Cancele quando quiser.
          </p>
        </motion.div>

        {/* ═══ MOBILE CARDS ═══ */}
        <div className="md:hidden space-y-6 mb-8">
          {mobileOrder.map((plan, index) => {
            const price = billingPeriod === "mensal" ? plan.priceMonthly : plan.priceAnnual;
            const monthly = billingPeriod === "anual" ? Math.round(price / 12) : price;
            const link = billingPeriod === "mensal" ? plan.linkMonthly : plan.linkAnnual;
            const key = getPlanKey(plan.name);

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative bg-[#111111] rounded-2xl p-6 border-2 ${
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

                {/* Plan header */}
                <div className="text-center mb-5 pt-2">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-white/50 mb-3">{plan.subtitle}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-extrabold text-white">
                      R${monthly.toLocaleString("pt-BR")}
                    </span>
                    <span className="text-white/50 text-sm">/mês</span>
                  </div>
                  {billingPeriod === "anual" && (
                    <p className="text-[10px] text-white/40 mt-1">
                      R${price.toLocaleString("pt-BR")}/ano
                    </p>
                  )}
                </div>

                {/* Features grouped by module */}
                <div className="space-y-4 mb-6">
                  {featureGroups.map((group) => {
                    const Icon = group.icon;
                    return (
                      <div key={group.name}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Icon className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-bold text-primary tracking-wide">{group.name}</span>
                        </div>
                        <div className="space-y-1.5 pl-5">
                          {group.features.map((feature) => {
                            const val = feature[key];
                            return (
                              <div key={feature.name} className="flex items-center gap-2">
                                <MobileCellValue value={val} />
                                <span className={`text-xs ${val === false ? "text-white/30" : "text-white/70"}`}>
                                  {feature.name}
                                  {typeof val === "string" ? `: ${val}` : ""}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <a href={link} target="_blank" rel="noopener noreferrer" className="block">
                  <Button
                    className={`w-full py-5 font-bold text-sm ${
                      plan.recommended
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    }`}
                  >
                    Comece seus 7 dias grátis →
                  </Button>
                </a>
              </motion.div>
            );
          })}

          <p className="text-center text-xs text-white/40 mt-4">
            Todos os planos incluem 7 dias grátis. Cancele quando quiser.
          </p>
        </div>

        {/* Enterprise Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-[#111111] rounded-2xl p-6 md:p-8 border border-white/10 text-center">
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
