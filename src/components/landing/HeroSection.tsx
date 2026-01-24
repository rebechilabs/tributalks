import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  const scrollToPlanos = () => {
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F59E0B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-20 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Announcement Badge */}
          <div className="flex justify-center mb-6 animate-fade-in-up">
            <Badge variant="outline" className="px-4 py-2 text-sm border-primary/50">
              <Zap className="w-4 h-4 mr-2 text-primary" />
              Novo: Score Tributário + DRE Inteligente + Radar de Créditos
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-in-up leading-tight">
            Inteligência Tributária para
            <br />
            Empresas acima de{" "}
            <span className="text-primary">R$1M/mês</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            11 ferramentas que mostram o impacto real das decisões
            tributárias no seu caixa.{" "}
            <span className="text-foreground font-medium">Em minutos, não em semanas.</span>
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 animate-fade-in-up animation-delay-150">
            {[
              "Calculadora RTC com API Oficial",
              "Comparativo de Regimes",
              "Radar de Créditos",
              "Score Tributário",
            ].map((feature) => (
              <span 
                key={feature}
                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-fade-in-up animation-delay-200">
            <Link to="/cadastro">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-6 text-lg group"
              >
                Começar grátis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToPlanos}
              className="border-foreground text-foreground hover:bg-foreground hover:text-background font-semibold px-8 py-6 text-lg"
            >
              Ver planos ↓
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in-up animation-delay-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Sem cartão</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>API oficial da Receita</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
