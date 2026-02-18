 import { Button } from "@/components/ui/button";
 import { Play } from "lucide-react";
 import { motion } from "framer-motion";
 
 interface DemoSectionProps {
   onOpenDemo: () => void;
 }
 
 export function DemoSection({ onOpenDemo }: DemoSectionProps) {
   return (
     <section className="py-16 md:py-20 bg-[#1A1A1A]">
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
             Veja a <span className="text-primary">Clara AI</span> em Ação
           </h2>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
              Veja como 5 agentes especializados trabalham com seus dados em menos de 2 minutos.
            </p>
         </motion.div>
 
         {/* Demo Preview */}
         <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6, delay: 0.1 }}
           className="max-w-4xl mx-auto"
         >
           <div 
             className="relative aspect-video bg-[#222222] rounded-2xl border border-white/10 overflow-hidden cursor-pointer group"
             onClick={onOpenDemo}
           >
             {/* Placeholder gradient background */}
             <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
             
             {/* Dashboard mockup elements */}
             <div className="absolute inset-6 flex flex-col gap-4">
               <div className="flex gap-4 flex-1">
                 <div className="flex-1 bg-white/5 rounded-lg animate-pulse" />
                 <div className="w-1/3 bg-white/5 rounded-lg animate-pulse" />
               </div>
               <div className="flex gap-4 h-1/3">
                 <div className="flex-1 bg-white/5 rounded-lg animate-pulse" />
                 <div className="flex-1 bg-white/5 rounded-lg animate-pulse" />
                 <div className="flex-1 bg-white/5 rounded-lg animate-pulse" />
               </div>
             </div>
 
             {/* Play button overlay */}
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
               <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                 <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground ml-1" fill="currentColor" />
               </div>
             </div>
 
             {/* Duration badge */}
             <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white/80 text-sm font-medium">
               1:30
             </div>
           </div>
 
           {/* CTA below demo */}
           <div className="text-center mt-8">
             <Button
               onClick={onOpenDemo}
               size="lg"
               className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6"
             >
               <Play className="w-5 h-5 mr-2" />
               Iniciar Demo Interativa
             </Button>
           </div>
         </motion.div>
       </div>
     </section>
   );
 }