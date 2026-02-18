 import { motion } from "framer-motion";
 import { Quote } from "lucide-react";
 
 const testimonials = [
   {
     sector: "Empresa de Logística",
     revenue: "R$ 8M/ano",
     result: "R$ 127k créditos ICMS-ST",
     quote: "Em 48 horas o Radar encontrou créditos perdidos há 2 anos. Se pagou 42x no primeiro mês.",
   },
   {
     sector: "Empresa de Tecnologia",
     revenue: "R$ 15M/ano",
     result: "4,2pp margem protegida",
     quote: "O DRE Inteligente mostrou 3 produtos em NCM errado. Salvamos 4,2 pontos de margem.",
   },
   {
     sector: "Indústria",
     revenue: "R$ 42M/ano",
     result: "R$ 340k economia",
     quote: "Simulamos mudança de regime no NEXUS. Economizamos R$340k/ano. Se pagou 11x.",
   },
 ];
 
 export function TestimonialsSection() {
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
             Resultados Reais de Empresas Reais.
           </h2>
         </motion.div>
 
         {/* Testimonials Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
           {testimonials.map((testimonial, index) => (
             <motion.div
               key={testimonial.sector}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6, delay: index * 0.1 }}
               className="bg-[#222222] rounded-2xl p-6 md:p-8 border border-white/10"
             >
               {/* Quote icon */}
               <Quote className="w-10 h-10 text-primary/30 mb-4" />
 
               {/* Quote text */}
               <p className="text-white/80 text-lg mb-6 leading-relaxed italic">
                 "{testimonial.quote}"
               </p>
 
               {/* Divider */}
               <div className="border-t border-white/10 pt-4 mt-auto">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-white font-semibold">{testimonial.sector}</p>
                     <p className="text-white/50 text-sm">{testimonial.revenue}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-primary font-bold">{testimonial.result}</p>
                   </div>
                 </div>
               </div>
             </motion.div>
           ))}
         </div>
 
         {/* Legal Disclaimer */}
         <p className="text-center text-white/40 text-xs mt-8 max-w-2xl mx-auto">
           *Casos ilustrativos baseados em resultados reais de clientes. Valores podem variar conforme perfil da empresa.
         </p>
       </div>
     </section>
   );
 }