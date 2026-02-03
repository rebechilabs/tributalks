import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Star, TrendingUp, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import logoHero from "@/assets/logo-tributalks-hero.jpg";
import { CONFIG } from "@/config/site";

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
        <div className="flex flex-col items-center max-w-4xl mx-auto">
          
          {/* Main Content */}
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-4 md:mb-6 animate-fade-in-up">
              <img 
                src={logoHero} 
                alt="TribuTalks" 
                className="h-16 md:h-24 w-auto"
              />
            </div>

            {/* Header */}
            <div className="mb-6 animate-fade-in-up">
              <h1 className="text-xl md:text-2xl font-extrabold text-primary tracking-tight leading-tight">
                PLATAFORMA DE INTELIGÊNCIA TRIBUTÁRIA
                <br />
                A 1ª AI-FIRST DO BRASIL
              </h1>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in-up leading-tight">
              Transforme a Reforma Tributária em{" "}
              <span className="text-primary">vantagem competitiva</span>
            </h2>

            {/* Subheading */}
            <p className="text-base md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto animate-fade-in-up animation-delay-100">
              Enquanto seus concorrentes vão descobrir o impacto tarde demais, 
              você já estará 3 passos à frente.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8 animate-fade-in-up animation-delay-150 max-w-md mx-auto">
              {[
                { icon: TrendingUp, text: "Identifique créditos ocultos", sub: "Média de R$ 47k recuperados por empresa" },
                { icon: Shield, text: "Proteja sua margem", sub: "Veja impacto exato de CBS/IBS no lucro" },
                { icon: Zap, text: "Decisões com Clara AI", sub: "Sua copiloto tributária 24/7" },
              ].map((benefit) => (
                <div key={benefit.text} className="flex items-start gap-3 text-left">
                  <div className="bg-success/20 text-success rounded-full p-2 flex-shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-foreground">{benefit.text}</strong>
                    <p className="text-sm text-muted-foreground">{benefit.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-200">
              <a href={CONFIG.PAYMENT_LINKS.NAVIGATOR_MENSAL} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-6 text-lg group"
                >
                  Testar Grátis por 7 Dias
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToPlanos}
                className="w-full sm:w-auto border-foreground text-foreground hover:bg-foreground hover:text-background font-semibold px-8 py-6 text-lg"
              >
                Ver Como Funciona ↓
              </Button>
            </div>
          </div>

          {/* Case Study Card */}
          <div className="w-full max-w-2xl mt-12 bg-card rounded-2xl shadow-2xl p-6 md:p-8 border border-border animate-fade-in-up animation-delay-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <strong className="text-foreground">Empresa de Logística</strong>
                <p className="text-sm text-muted-foreground">Faturamento R$ 8M/ano</p>
              </div>
            </div>

            <blockquote className="text-lg text-foreground mb-4 leading-relaxed">
              "Em 48 horas identificamos <strong className="text-primary">R$ 127 mil em créditos</strong> que estavam sendo perdidos. O TribuTalks se pagou <strong className="text-primary">42 vezes</strong> no primeiro mês."
            </blockquote>

            <div className="flex items-center gap-1 text-primary mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary" />
              ))}
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">R$ 127k</div>
                  <div className="text-sm text-muted-foreground">Créditos identificados</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success">42x ROI</div>
                  <div className="text-sm text-muted-foreground">Retorno sobre investimento</div>
                </div>
              </div>
            </div>


            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground/70 text-center mt-4">
              *Caso ilustrativo baseado em resultados reais de clientes.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 md:h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
