 import { motion } from "framer-motion";
 import { Shield, Lock, Cloud, CreditCard } from "lucide-react";
 
 const securityFeatures = [
   { icon: Lock, label: "Criptografia SSL/TLS 256-bit" },
   { icon: Shield, label: "100% LGPD Compliant" },
   { icon: Cloud, label: "Infraestrutura AWS" },
   { icon: CreditCard, label: "Pagamento Seguro via Stripe" },
 ];
 
 const erpLogos = [
   { name: "Omie", logo: "https://www.omie.com.br/blog/wp-content/uploads/2020/03/omie-logo.png" },
   { name: "Bling", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Bling_Logo.svg/512px-Bling_Logo.svg.png" },
   { name: "Conta Azul", logo: "https://cdn.worldvectorlogo.com/logos/contaazul.svg" },
   { name: "Tiny", logo: "https://www.tiny.com.br/wp-content/themes/theme-starter/img/logo.svg" },
   { name: "Sankhya", logo: "https://www.sankhya.com.br/wp-content/uploads/2023/06/logo-sankhya.svg" },
   { name: "TOTVS", logo: "https://cdn.worldvectorlogo.com/logos/totvs-2.svg" },
 ];
 
 export function SecuritySection() {
   return (
     <section className="py-16 md:py-20 bg-[#1A1A1A]">
       <div className="container mx-auto px-4 md:px-8">
         {/* Section Header */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="text-center mb-16"
         >
           <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
             Segurança Nível Enterprise. Integração Simples.
           </h2>
         </motion.div>
 
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
           {/* Security */}
           <motion.div
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
              className="bg-[#222222] rounded-2xl p-8 border border-white/10"
           >
             <h3 className="text-xl font-bold text-white mb-6">Segurança</h3>
             <div className="grid grid-cols-2 gap-4">
               {securityFeatures.map((feature) => (
                 <div key={feature.label} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                   <feature.icon className="w-5 h-5 text-primary flex-shrink-0" />
                   <span className="text-sm text-white/80">{feature.label}</span>
                 </div>
               ))}
             </div>
           </motion.div>
 
           {/* Integrations */}
           <motion.div
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6, delay: 0.1 }}
             className="bg-[#222222] rounded-2xl p-8 border border-white/10"
           >
             <h3 className="text-xl font-bold text-white mb-6">Integrações ERP</h3>
             <div className="grid grid-cols-3 gap-4">
               {erpLogos.map((erp) => (
                 <div 
                   key={erp.name}
                   className="aspect-[3/2] bg-white/10 rounded-lg flex items-center justify-center p-3 hover:bg-white/15 transition-colors"
                 >
                   <span className="text-white/60 text-xs font-semibold text-center">{erp.name}</span>
                 </div>
               ))}
             </div>
           </motion.div>
         </div>
       </div>
     </section>
   );
 }