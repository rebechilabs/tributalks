import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Check } from "lucide-react";
import logoHero from "@/assets/logo-tributalks-hero.jpg";
import { CONFIG } from "@/config/site";

const benefits = [
  {
    title: "Identifique créditos ocultos",
    description: "Média de R$ 47k recuperados por empresa",
  },
  {
    title: "Proteja sua margem",
    description: "Veja impacto exato de CBS/IBS no seu lucro",
  },
  {
    title: "Decisões com Clara AI",
    description: "Sua copilota tributária 24/7",
  },
];

export function HeroSection() {
  const scrollToHowItWorks = () => {
    const element = document.getElementById("como-funciona");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

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
        <div className="flex flex-col items-center max-w-3xl mx-auto text-center">
          
          {/* Logo */}
          <div className="flex justify-center mb-4 md:mb-6 animate-fade-in-up">
            <img 
              src={logoHero} 
              alt="TribuTalks" 
              className="h-16 md:h-24 w-auto"
            />
          </div>

          {/* Tagline */}
          <div className="mb-6 animate-fade-in-up">
            <p className="text-xl md:text-2xl font-extrabold text-primary tracking-tight leading-tight">
              PLATAFORMA DE INTELIGÊNCIA TRIBUTÁRIA
              <br />
              A 1ª AI-FIRST DO BRASIL
            </p>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in-up leading-tight">
            Transforme a Reforma Tributária em{" "}
            <span className="text-primary">vantagem competitiva</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-6 animate-fade-in-up animation-delay-100 max-w-2xl">
            Software de diagnóstico tributário com IA que identifica créditos ocultos, 
            protege margens e automatiza decisões fiscais em minutos.
          </p>

          {/* Urgency Line */}
          <p className="text-base md:text-lg text-foreground/80 mb-8 animate-fade-in-up animation-delay-200 font-medium">
            Enquanto seus concorrentes vão descobrir o impacto tarde demais, 
            <br className="hidden sm:block" />
            <span className="text-primary font-bold"> você já estará 3 passos à frente.</span>
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full animate-fade-in-up animation-delay-300">
            {benefits.map((benefit) => (
              <div 
                key={benefit.title} 
                className="flex items-start gap-3 text-left p-4 bg-card/50 rounded-lg border border-border"
              >
                <div className="bg-primary/20 rounded-full p-1 flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <strong className="text-foreground text-sm block">{benefit.title}</strong>
                  <span className="text-muted-foreground text-xs">{benefit.description}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in-up animation-delay-400">
            <a 
              href={CONFIG.PAYMENT_LINKS.STARTER_MENSAL} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-6 text-lg group"
              >
                Testar Grátis por 7 Dias
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <Button 
              size="lg" 
              variant="outline"
              onClick={scrollToHowItWorks}
              className="font-semibold px-8 py-6 text-lg group"
            >
              Ver Como Funciona
              <ChevronDown className="w-5 h-5 ml-2 group-hover:translate-y-1 transition-transform" />
            </Button>
          </div>

          {/* Trust Text */}
          <p className="text-sm text-muted-foreground animate-fade-in-up animation-delay-500">
            Teste grátis. Cancele quando quiser.
          </p>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 md:h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
