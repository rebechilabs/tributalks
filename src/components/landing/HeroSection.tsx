import { Bot, Brain, Sparkles, Shield } from "lucide-react";
import logoHero from "@/assets/logo-tributalks-hero.jpg";
import claraAiHero from "@/assets/clara-ai-hero.png";

export function HeroSection() {

  return (
    <section className="relative min-h-screen flex items-center pt-16 md:pt-20 bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F59E0B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 relative">
        <div className="flex flex-col items-center max-w-2xl mx-auto">
          
          {/* Logo */}
          <div className="flex justify-center mb-4 md:mb-6 animate-fade-in-up">
            <img 
              src={logoHero} 
              alt="TribuTalks" 
              className="h-16 md:h-24 w-auto"
            />
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in-up leading-tight text-center">
            Transforme a Reforma Tributária em{" "}
            <span className="text-primary">vantagem competitiva</span>
          </h1>

          {/* Tagline */}
          <div className="mb-8 animate-fade-in-up text-center">
            <p className="text-xl md:text-2xl font-extrabold text-primary tracking-tight leading-tight">
              PLATAFORMA DE INTELIGÊNCIA TRIBUTÁRIA
              <br />
              A 1ª AI-FIRST DO BRASIL
            </p>
          </div>

          {/* Clara AI-First Explainer */}
          <div className="w-full bg-card/80 backdrop-blur-sm rounded-2xl border border-border overflow-hidden shadow-xl mb-8 animate-fade-in-up animation-delay-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    Conheça a Clara
                    <Sparkles className="w-4 h-4 text-primary" />
                  </h3>
                  <p className="text-sm text-muted-foreground">Sua copiloto de inteligência tributária</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                {/* Left - Image */}
                <div className="relative">
                  <img 
                    src={claraAiHero} 
                    alt="Clara AI - Inteligência Tributária" 
                    className="rounded-lg border border-border shadow-lg w-full"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    AI-First
                  </div>
                </div>
                
                {/* Right - Features */}
                <div className="space-y-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/20 text-primary rounded-full p-2 flex-shrink-0">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-foreground text-sm">Inteligência Contextual</strong>
                      <p className="text-xs text-muted-foreground">Clara entende seu negócio e aprende com cada interação</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/20 text-primary rounded-full p-2 flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-foreground text-sm">Ações Autônomas</strong>
                      <p className="text-xs text-muted-foreground">Identifica oportunidades e age proativamente</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/20 text-primary rounded-full p-2 flex-shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-foreground text-sm">Memória Evolutiva</strong>
                      <p className="text-xs text-muted-foreground">Lembra decisões passadas para recomendações precisas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 md:h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
