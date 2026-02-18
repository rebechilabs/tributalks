 import { Button } from "@/components/ui/button";
 import { ArrowRight } from "lucide-react";
 import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg-cinematic.jpg";
 
 export function NewHeroSection() {
   const scrollToPlans = () => {
     const element = document.getElementById("planos");
     if (element) {
       element.scrollIntoView({ behavior: "smooth" });
     }
   };
 
   return (
    <section className="relative bg-[#111111]">
      <div className="container mx-auto px-4 md:px-8 pt-32 md:pt-40">
         <div className="max-w-4xl mx-auto text-center">
           {/* Main Headline */}
           <motion.h1
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight"
           >
             Domine a <span className="text-primary">Reforma Tributária</span>
             <br />
              com a 1ª AI-First do Brasil.
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
         </div>
       </div>
      
       {/* Cinematic background image with blur edges */}
       <div className="relative mt-10">
         <div 
           className="h-[50vh] md:h-[60vh] bg-cover bg-no-repeat"
           style={{ 
             backgroundImage: `url(${heroBg})`, 
             backgroundPosition: 'center bottom' 
           }}
         />
         {/* Top blur fade */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#111111] to-transparent backdrop-blur-sm" style={{ maskImage: 'linear-gradient(to bottom, black 30%, transparent)' }} />
          {/* Bottom blur fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#111111] to-transparent backdrop-blur-sm" style={{ maskImage: 'linear-gradient(to top, black 30%, transparent)' }} />
          {/* Side blur fades */}
          <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-[#111111] to-transparent" />
          <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-[#111111] to-transparent" />
       </div>
     </section>
   );
 }