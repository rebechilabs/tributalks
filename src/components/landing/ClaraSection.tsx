 import { motion } from "framer-motion";
import { 
  BarChart3, 
  Calculator, 
  FileSearch, 
  Target,
  LayoutDashboard,
  Sparkles,
  MessageCircle
} from "lucide-react";
 
const agents = [
  { icon: BarChart3, label: "Entender" },
  { icon: Calculator, label: "Precificar" },
  { icon: FileSearch, label: "Recuperar" },
  { icon: Target, label: "Planejar" },
  { icon: LayoutDashboard, label: "Comandar" },
];
 
 export function ClaraSection() {
   return (
     <section className="py-16 md:py-20 bg-[#1A1A1A] overflow-hidden">
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
               Sua Inteligência Tributária.
             </h2>
             
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                <span className="text-primary font-semibold">Clara AI</span> não é apenas um chatbot. 
                Ela é uma orquestradora de <span className="text-primary font-semibold">5 agentes especializados</span> que 
                trabalham juntos com seus dados reais: Entender, Precificar, Recuperar, Planejar e Comandar.
              </p>
              
              <p className="text-lg text-white/70 leading-relaxed">
                Cada agente domina uma área tributária. Clara roteia sua pergunta para o especialista certo, 
                <span className="text-primary font-semibold"> 24 horas por dia</span>.
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
 
                {/* Orbiting agents */}
                {agents.map((agent, index) => {
                  const angle = (index * 72) - 90;
                  const radius = 140;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  
                  return (
                    <motion.div
                      key={agent.label}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ x, y }}
                      animate={{ 
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <motion.div
                        animate={{ rotate: [0, -360] }}
                        transition={{
                          duration: 25,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#222222] border border-white/10 flex flex-col items-center justify-center shadow-lg gap-0.5"
                      >
                        <agent.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        <span className="text-[9px] text-white/60 font-medium">{agent.label}</span>
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