import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, Navigation, MapPin, Route } from "lucide-react";
import { Link } from "react-router-dom";
import logoHero from "@/assets/logo-tributalks-hero.jpg";

export function HeroSection() {
  const scrollToPlanos = () => {
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" });
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
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4 md:mb-6 animate-fade-in-up">
            <img 
              src={logoHero} 
              alt="TribuTalks" 
              className="h-20 md:h-32 lg:h-40 w-auto"
            />
          </div>

          {/* Announcement Badge */}
          <div className="flex justify-center mb-4 md:mb-6 animate-fade-in-up">
            <Badge variant="outline" className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm border-primary/50">
              <Navigation className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 text-primary" />
              Guia completo para a transição 2026-2033
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-4 md:mb-6 animate-fade-in-up leading-tight">
            O <span className="text-primary">GPS</span> da
            <br />
            <span className="text-primary">Reforma Tributária</span>
          </h1>

          {/* Subheading */}
          <p className="text-base md:text-xl text-muted-foreground mb-5 md:mb-6 max-w-2xl mx-auto animate-fade-in-up animation-delay-100 px-2">
            Simule cenários de impacto, acompanhe prazos, e receba orientações claras para cada fase.{" "}
            <span className="text-foreground font-medium">
              Diagnóstico automatizado + simuladores + conteúdo diário.
            </span>
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 mb-8 md:mb-10 animate-fade-in-up animation-delay-150 px-2">
            {[
              "Split Payment",
              "Timeline 2026-2033",
              "Comparativo",
              "Notícias",
              "Score",
            ].map((feature) => (
              <span 
                key={feature}
                className="px-2 md:px-3 py-1 bg-primary/10 text-primary text-xs md:text-sm rounded-full whitespace-nowrap"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8 animate-fade-in-up animation-delay-200 px-4">
            <Link to="/cadastro" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 md:px-8 py-5 md:py-6 text-base md:text-lg group"
              >
                Começar grátis
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToPlanos}
              className="w-full sm:w-auto border-foreground text-foreground hover:bg-foreground hover:text-background font-semibold px-6 md:px-8 py-5 md:py-6 text-base md:text-lg"
            >
              Ver planos ↓
            </Button>
          </div>

          {/* Value Props */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground animate-fade-in-up animation-delay-300">
            <div className="flex items-center gap-1.5 md:gap-2">
              <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
              <span>Onde você está</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <Route className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
              <span>Para onde vai</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
              <span>O que fazer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 md:h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
