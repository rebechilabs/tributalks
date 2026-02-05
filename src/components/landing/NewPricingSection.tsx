 import { Button } from "@/components/ui/button";
 import { Check, Star, MessageCircle, Sparkles } from "lucide-react";
 import { useState } from "react";
 import { motion } from "framer-motion";
 import { CONFIG } from "@/config/site";
 import { EnterpriseModal } from "./EnterpriseModal";
 
 type BillingPeriod = "mensal" | "anual";
 
 interface Plan {
   name: string;
   subtitle: string;
   priceMonthly: number;
   priceAnnual: number;
   cnpjs: string;
   claraLimit: string;
   popular?: boolean;
   features: string[];
   linkMonthly: string;
   linkAnnual: string;
 }
 
 const plans: Plan[] = [
   {
     name: "STARTER",
     subtitle: "Para começar com segurança",
     priceMonthly: 297,
     priceAnnual: 3267,
     cnpjs: "1 CNPJ",
     claraLimit: "Assistente (30 msgs/dia)",
     features: [
       "DRE Inteligente",
       "Score Tributário 0-1000",
       "Calculadora CBS/IBS por NCM",
       "Comparativo de Regimes",
       "Timeline 2026-2033",
       "Newsletter TribuTalks News",
     ],
     linkMonthly: CONFIG.PAYMENT_LINKS.STARTER_MENSAL,
     linkAnnual: CONFIG.PAYMENT_LINKS.STARTER_ANUAL,
   },
   {
     name: "NAVIGATOR",
     subtitle: "Para recuperar créditos",
     priceMonthly: 697,
     priceAnnual: 7667,
     cnpjs: "2 CNPJs",
     claraLimit: "Copiloto (100 msgs/dia)",
     features: [
       "Tudo do Starter +",
       "Radar de Créditos (XML, SPED)",
       "Planejamento com 61+ oportunidades",
       "Calculadora NCM e NBS",
       "Analisador de Documentos IA",
       "Workflows Guiados",
       "Relatórios PDF Clara AI",
     ],
     linkMonthly: CONFIG.PAYMENT_LINKS.NAVIGATOR_MENSAL,
     linkAnnual: CONFIG.PAYMENT_LINKS.NAVIGATOR_ANUAL,
   },
   {
     name: "PROFESSIONAL",
     subtitle: "Para gestão estratégica completa",
     priceMonthly: 1997,
     priceAnnual: 21967,
     cnpjs: "4 CNPJs • 4 Usuários",
     claraLimit: "Ilimitada",
     popular: true,
     features: [
       "Tudo do Navigator +",
       "NEXUS (Centro de Comando)",
       "Margem Ativa por NCM",
       "Split Payment 2026",
       "PriceGuard",
       "OMC-AI (Fornecedores)",
       "Valuation (3 metodologias)",
       "Relatórios Executivos PDF",
       "Conectar ERP",
     ],
     linkMonthly: CONFIG.PAYMENT_LINKS.PROFESSIONAL_MENSAL,
     linkAnnual: CONFIG.PAYMENT_LINKS.PROFESSIONAL_ANUAL,
   },
 ];
 
 export function NewPricingSection() {
   const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("mensal");
   const [enterpriseModalOpen, setEnterpriseModalOpen] = useState(false);
 
   return (
     <section id="planos" className="py-20 md:py-32 bg-[#0A0A0A]">
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
 
         {/* Plans Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
           {plans.map((plan, index) => {
             const price = billingPeriod === "mensal" ? plan.priceMonthly : plan.priceAnnual;
             const monthlyEquivalent = billingPeriod === "anual" ? Math.round(price / 12) : price;
             const link = billingPeriod === "mensal" ? plan.linkMonthly : plan.linkAnnual;
 
             return (
               <motion.div
                 key={plan.name}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6, delay: index * 0.1 }}
                 className={`relative bg-[#111111] rounded-2xl p-6 md:p-8 border-2 transition-all duration-300 ${
                   plan.popular
                     ? "border-primary shadow-lg shadow-primary/20"
                     : "border-white/10 hover:border-white/20"
                 }`}
               >
                 {/* Popular Badge */}
                 {plan.popular && (
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                     <div className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold">
                       <Star className="w-3.5 h-3.5" fill="currentColor" />
                       MAIS POPULAR
                     </div>
                   </div>
                 )}
 
                 {/* Plan Header */}
                 <div className="text-center mb-6 pt-2">
                   <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                   <p className="text-sm text-white/50 mb-4">{plan.subtitle}</p>
                   
                   <div className="flex items-baseline justify-center gap-1">
                     <span className="text-4xl md:text-5xl font-extrabold text-white">
                       R${monthlyEquivalent.toLocaleString("pt-BR")}
                     </span>
                     <span className="text-white/50">/mês</span>
                   </div>
                   
                   {billingPeriod === "anual" && (
                     <p className="text-xs text-white/40 mt-1">
                       R${price.toLocaleString("pt-BR")} cobrado anualmente
                     </p>
                   )}
 
                   <div className="mt-4 space-y-1">
                     <p className="text-xs text-primary font-semibold">{plan.cnpjs}</p>
                     <p className="text-xs text-white/50">Clara AI: {plan.claraLimit}</p>
                   </div>
                 </div>
 
                 {/* Divider */}
                 <div className="border-t border-white/10 mb-6" />
 
                 {/* Features */}
                 <ul className="space-y-3 mb-8">
                   {plan.features.map((feature) => (
                     <li key={feature} className="flex items-start gap-3">
                       <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                       <span className="text-sm text-white/80">{feature}</span>
                     </li>
                   ))}
                 </ul>
 
                 {/* CTA */}
                 <a href={link} target="_blank" rel="noopener noreferrer" className="block">
                   <Button
                     className={`w-full py-6 font-bold text-base ${
                       plan.popular
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