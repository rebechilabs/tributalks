import { Button } from "@/components/ui/button";
import { ArrowRight, Check, TrendingUp, Shield, Zap } from "lucide-react";
import { CONFIG } from "@/config/site";

export function BenefitsCtaSection() {
  const scrollToPlanos = () => {
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <p className="text-lg md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up leading-relaxed">
            Enquanto seus concorrentes vão descobrir o impacto tarde demais,{" "}
            <strong className="text-foreground">você já estará 3 passos à frente.</strong>
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in-up animation-delay-100 max-w-3xl mx-auto">
            {[
              { 
                icon: TrendingUp, 
                title: "Identifique créditos ocultos", 
                description: "Média de R$ 47k recuperados por empresa",
                color: "text-success"
              },
              { 
                icon: Shield, 
                title: "Proteja sua margem", 
                description: "Veja impacto exato de CBS/IBS no lucro",
                color: "text-primary"
              },
              { 
                icon: Zap, 
                title: "Decisões com Clara AI", 
                description: "Sua copiloto tributária 24/7",
                color: "text-primary"
              },
            ].map((benefit) => (
              <div 
                key={benefit.title} 
                className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className={`w-7 h-7 ${benefit.color}`} />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
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

          {/* Trust note */}
          <p className="text-xs text-muted-foreground mt-6 animate-fade-in-up animation-delay-300">
            ✓ 7 dias grátis • ✓ Cancele quando quiser • ✓ Sem compromisso
          </p>
        </div>
      </div>
    </section>
  );
}
