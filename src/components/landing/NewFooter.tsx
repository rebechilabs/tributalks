 import { Button } from "@/components/ui/button";
import { ArrowRight, Linkedin, Instagram, Youtube, Scale, Shield, Cloud } from "lucide-react";
 import { Link } from "react-router-dom";
 import { CONFIG } from "@/config/site";
 import logoTributalks from "@/assets/logo-tributalks.png";
 import logoRebechiSilva from "@/assets/logo-rebechi-silva.png";
 
 export function NewFooter() {
   const scrollToPlans = () => {
     const element = document.getElementById("planos");
     if (element) {
       element.scrollIntoView({ behavior: "smooth" });
     }
   };
 
   return (
     <footer className="bg-[#0A0A0A] border-t border-white/10">
       {/* Final CTA */}
       <div className="py-16 md:py-24 border-b border-white/10">
         <div className="container mx-auto px-4 md:px-8 text-center">
           <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-6 max-w-3xl mx-auto">
             Transforme a Reforma Tributária em sua maior{" "}
             <span className="text-primary">vantagem competitiva</span>.
           </h2>
           <Button
             onClick={scrollToPlans}
             size="lg"
             className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-10 py-7 rounded-lg shadow-lg shadow-primary/30 group"
           >
             Comece seus 7 dias grátis
             <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
           </Button>
         </div>
       </div>
 
       {/* Footer Content */}
       <div className="py-12 md:py-16">
         <div className="container mx-auto px-4 md:px-8">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-10">
             {/* Brand Column */}
             <div className="md:col-span-1">
               <img src={logoTributalks} alt="TribuTalks" className="h-10 w-auto mb-4" />
               <p className="text-sm text-white/50 mb-4">
                 Plataforma de Inteligência Tributária
                 <br />
                  <span className="text-primary font-semibold">A 1ª AI-First do Brasil</span>
               </p>
             </div>
 
             {/* Links */}
             <div>
               <h4 className="font-semibold text-white mb-4 text-sm">PRODUTO</h4>
               <ul className="space-y-3">
                 <li><Link to="/score-tributario" className="text-sm text-white/50 hover:text-primary transition-colors">Score Tributário</Link></li>
                 <li><Link to="/analise-notas" className="text-sm text-white/50 hover:text-primary transition-colors">Radar de Créditos</Link></li>
                 <li><Link to="/dre" className="text-sm text-white/50 hover:text-primary transition-colors">DRE Inteligente</Link></li>
                 <li><Link to="/nexus" className="text-sm text-white/50 hover:text-primary transition-colors">NEXUS</Link></li>
                 <li><Link to="/clara-ai" className="text-sm text-white/50 hover:text-primary transition-colors">Clara AI</Link></li>
               </ul>
             </div>
 
             <div>
               <h4 className="font-semibold text-white mb-4 text-sm">EMPRESA</h4>
               <ul className="space-y-3">
                 <li><Link to="/contato" className="text-sm text-white/50 hover:text-primary transition-colors">Sobre nós</Link></li>
                 <li><Link to="/contato" className="text-sm text-white/50 hover:text-primary transition-colors">Contato</Link></li>
                 <li><a href={CONFIG.CIRCLE_COMMUNITY} target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-primary transition-colors">Comunidade</a></li>
               </ul>
             </div>
 
             <div>
               <h4 className="font-semibold text-white mb-4 text-sm">LEGAL</h4>
               <ul className="space-y-3">
                 <li><Link to="/termos" className="text-sm text-white/50 hover:text-primary transition-colors">Termos de Uso</Link></li>
                 <li><Link to="/privacidade" className="text-sm text-white/50 hover:text-primary transition-colors">Política de Privacidade</Link></li>
               </ul>
             </div>
           </div>
 
           {/* Powered by & Social */}
           <div className="border-t border-white/10 pt-8">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6">
               {/* Powered by Rebechi & Silva */}
               <div className="flex items-center gap-3">
                 <Scale className="w-5 h-5 text-white/40" />
                 <span className="text-sm text-white/40">Powered by</span>
                 <img src={logoRebechiSilva} alt="Rebechi & Silva" className="h-8 w-auto opacity-70" />
               </div>

                {/* Security Badges */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-xs text-white/60 font-medium">LGPD Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <Cloud className="w-4 h-4 text-primary" />
                    <span className="text-xs text-white/60 font-medium">Infraestrutura AWS</span>
                  </div>
                </div>
 
               {/* Copyright */}
               <div className="text-center">
                 <p className="text-sm text-white/40">
                   © 2026 TribuTalks. Todos os direitos reservados.
                 </p>
                 <p className="text-xs text-white/30 mt-1">
                   CNPJ: 47.706.144/0001-21 • {CONFIG.CONTACT_EMAIL}
                 </p>
               </div>
 
               {/* Social Links */}
               <div className="flex items-center gap-4">
                 <a
                   href={CONFIG.LINKEDIN}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-white/40 hover:text-primary transition-colors"
                   aria-label="LinkedIn"
                 >
                   <Linkedin className="w-5 h-5" />
                 </a>
                 <a
                   href={CONFIG.INSTAGRAM}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-white/40 hover:text-primary transition-colors"
                   aria-label="Instagram"
                 >
                   <Instagram className="w-5 h-5" />
                 </a>
                 <a
                   href={CONFIG.YOUTUBE}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-white/40 hover:text-primary transition-colors"
                   aria-label="YouTube"
                 >
                   <Youtube className="w-5 h-5" />
                 </a>
               </div>
             </div>
 
             {/* Legal Disclaimer */}
             <p className="text-white/30 text-xs max-w-3xl mx-auto text-center mt-8 leading-relaxed">
               As simulações e informações desta plataforma têm caráter exclusivamente educativo e
               informativo, não constituindo parecer jurídico, contábil ou recomendação de decisão.
               Consulte um profissional habilitado antes de tomar qualquer decisão tributária.
             </p>
           </div>
         </div>
       </div>
     </footer>
   );
 }