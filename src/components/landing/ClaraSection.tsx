 import { motion } from "framer-motion";
 import { 
   BarChart3, 
   Calculator, 
   FileSearch, 
   Target,
   Sparkles,
   MessageCircle
 } from "lucide-react";
 
 const modules = [
   { icon: BarChart3, label: "Score" },
   { icon: Calculator, label: "DRE" },
   { icon: FileSearch, label: "Radar" },
   { icon: Target, label: "NEXUS" },
 ];
 
 export function ClaraSection() {
   return (
     <section className="py-20 md:py-32 bg-[#0A0A0A] overflow-hidden">
       <div className="container mx-auto px-4 md:px-8">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
           {/* Left: Content */}
           <motion.div
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
           >
             <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
               <Sparkles className="w-4 h-4" />
               AI-First Technology
             </div>
             
             <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
               Sua Copilota Tributária Pessoal.
             </h2>
             
             <p className="text-lg text-white/70 mb-8 leading-relaxed">
               <span className="text-primary font-semibold">Clara AI</span> não é apenas um chatbot. 
               Ela é o cérebro do TribuTalks. Integrada a todas as ferramentas, ela acompanha você em cada passo, 
               interpretando gráficos, explicando os cálculos do Radar de Créditos e traduzindo o "juridiquês" 
               da Reforma Tributária para o português que seu negócio entende.
             </p>
             
             <p className="text-lg text-white/70 leading-relaxed">
               É como ter um <span className="text-primary font-semibold">consultor tributário sênior</span> ao seu lado, 
               24 horas por dia.
             </p>
           </motion.div>
 
           {/* Right: Visual */}
           <motion.div
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6, delay: 0.2 }}
             className="relative"
           >
             {/* Central Clara orb */}
             <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
               {/* Glow effect */}
               <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-pulse" />
               
               {/* Main orb */}
               <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/30">
                 <MessageCircle className="w-16 h-16 md:w-20 md:h-20 text-primary-foreground" />
               </div>
 
               {/* Orbiting modules */}
               {modules.map((module, index) => {
                 const angle = (index * 90) - 45;
                 const radius = 140;
                 const x = Math.cos((angle * Math.PI) / 180) * radius;
                 const y = Math.sin((angle * Math.PI) / 180) * radius;
                 
                 return (
                   <motion.div
                     key={module.label}
                     className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                     style={{ x, y }}
                     animate={{ 
                       rotate: [0, 360],
                     }}
                     transition={{
                       duration: 20,
                       repeat: Infinity,
                       ease: "linear",
                     }}
                   >
                     <motion.div
                       animate={{ rotate: [0, -360] }}
                       transition={{
                         duration: 20,
                         repeat: Infinity,
                         ease: "linear",
                       }}
                       className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#111111] border border-white/10 flex items-center justify-center shadow-lg"
                     >
                       <module.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                     </motion.div>
                   </motion.div>
                 );
               })}
 
               {/* Connection lines */}
               <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
                 <circle
                   cx="160"
                   cy="160"
                   r="100"
                   fill="none"
                   stroke="hsl(38 92% 50% / 0.2)"
                   strokeWidth="1"
                   strokeDasharray="8 8"
                 />
               </svg>
             </div>
           </motion.div>
         </div>
       </div>
     </section>
   );
 }