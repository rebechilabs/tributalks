 import { TrendingUp, ShieldCheck, Bot } from "lucide-react";
 import { motion } from "framer-motion";
 
 const benefits = [
   {
     icon: TrendingUp,
     title: "Identifique Créditos Ocultos",
     description: "Nossa IA encontra uma média de R$47 mil em créditos que seu caixa nem sabia que existiam.",
   },
   {
     icon: ShieldCheck,
     title: "Proteja Sua Margem de Lucro",
     description: "Simule o impacto exato da CBS/IBS em cada produto e saiba exatamente quando e quanto reajustar.",
   },
   {
     icon: Bot,
     title: "Decida com Clara AI",
     description: "Sua copilota tributária 24/7 que ensina, interpreta e responde qualquer dúvida sobre a Reforma.",
   },
 ];
 
 export function ProblemSection() {
   return (
    <section className="bg-[#1A1A1A]">
      <div className="container mx-auto px-4 md:px-8 pt-10 pb-16 md:pb-20">
         {/* Section Header */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="text-center mb-16"
         >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight max-w-4xl mx-auto">
              A Reforma Tributária vai custar <span className="text-primary">R$100 bilhões por ano</span> em erros de compliance.
              <br className="hidden md:block" /><br className="hidden md:block" />
              O TribuTalks transforma esse risco em oportunidade.
            </h2>
         </motion.div>
 
         {/* Benefits Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
           {benefits.map((benefit, index) => (
             <motion.div
               key={benefit.title}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6, delay: index * 0.1 }}
               className="bg-[#222222] border border-white/10 rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 group"
             >
               <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                 <benefit.icon className="w-7 h-7 text-primary" />
               </div>
               <h3 className="text-xl font-bold text-white mb-3">
                 {benefit.title}
               </h3>
               <p className="text-white/60 leading-relaxed">
                 {benefit.description}
               </p>
             </motion.div>
           ))}
         </div>
       </div>
     </section>
   );
 }