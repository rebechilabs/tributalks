 import { Button } from "@/components/ui/button";
 import { ArrowRight } from "lucide-react";
 import { motion } from "framer-motion";
 import heroBg from "@/assets/hero-bg-cinematic.jpg";
 import logoHero from "@/assets/logo-tributalks-hero.jpg";
 
 export function NewHeroSection() {
   const scrollToPlans = () => {
     const element = document.getElementById("planos");
     if (element) {
       element.scrollIntoView({ behavior: "smooth" });
     }
   };
 
   return (
     <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
       {/* Background Image */}
       <div 
         className="absolute inset-0 bg-cover bg-center bg-no-repeat"
         style={{ backgroundImage: `url(${heroBg})` }}
       >
         {/* Dark overlay */}
         <div className="absolute inset-0 bg-[#0A0A0A]/80" />
         {/* Gradient overlay */}
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0A]" />
       </div>
 
       {/* Content */}
       <div className="relative z-10 container mx-auto px-4 md:px-8 pt-24 pb-16 md:pt-32 md:pb-24">
         <div className="max-w-4xl mx-auto text-center">
           {/* Logo */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             className="mb-8"
           >
             <img 
               src={logoHero} 
               alt="TribuTalks" 
               className="h-16 md:h-20 w-auto mx-auto"
             />
           </motion.div>
 
           {/* Main Headline */}
           <motion.h1
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.1 }}
             className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight"
           >
             Domine a <span className="text-primary">Reforma Tributária</span>
             <br />
             com a 1ª IA-First do Brasil.
           </motion.h1>
 
           {/* Subheadline */}
           <motion.p
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.2 }}
             className="text-lg md:text-xl lg:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed"
           >
             Transforme a maior mudança fiscal do século em vantagem competitiva. 
             O TribuTalks analisa, simula e guia suas decisões para{" "}
             <span className="text-primary font-semibold">proteger sua margem</span> e{" "}
             <span className="text-primary font-semibold">revelar créditos ocultos</span>.
           </motion.p>
 
           {/* CTA Button */}
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.3 }}
             className="mb-8"
           >
             <Button
               size="lg"
               onClick={scrollToPlans}
               className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-10 py-7 rounded-lg shadow-lg shadow-primary/30 group transition-all duration-300 hover:shadow-xl hover:shadow-primary/40"
             >
               Comece seus 7 dias grátis
               <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
             </Button>
           </motion.div>
 
           {/* Social Proof */}
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.6, delay: 0.5 }}
             className="flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm"
           >
             <div className="flex items-center gap-2">
               <div className="flex -space-x-2">
                 {[1, 2, 3, 4].map((i) => (
                   <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-[#0A0A0A] flex items-center justify-center text-xs font-bold text-primary">
                     {String.fromCharCode(64 + i)}
                   </div>
                 ))}
               </div>
               <span>+200 empresas confiam</span>
             </div>
             <div className="hidden md:block w-px h-4 bg-white/20" />
             <span>R$ 12M+ em créditos identificados</span>
             <div className="hidden md:block w-px h-4 bg-white/20" />
             <span>ROI médio de 5x no 1º ano</span>
           </motion.div>
         </div>
       </div>
 
       {/* Bottom fade */}
       <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
     </section>
   );
 }