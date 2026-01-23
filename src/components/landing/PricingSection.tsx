import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  "Todas as calculadoras",
  "Simulações ilimitadas",
  "Histórico completo",
  "Newsletter Premium",
  "Novas ferramentas inclusas",
  "Suporte prioritário",
];

export function PricingSection() {
  return (
    <section id="preco" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Investimento
          </h2>
          <p className="text-lg text-muted-foreground">
            Menos que 1 hora de consultoria tributária
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          {/* Pricing Card */}
          <div className="relative bg-card rounded-3xl p-8 md:p-10 border-2 border-primary shadow-xl animate-pulse-glow">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-semibold shadow-md">
                <Sparkles className="w-4 h-4" />
                Mais Popular
              </div>
            </div>

            {/* Plan Name */}
            <div className="text-center mb-8 pt-4">
              <h3 className="text-2xl font-bold text-primary mb-2">
                TRIBUTECH PRO
              </h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-foreground">R$197</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                ou R$1.970/ano <span className="text-success font-medium">(2 meses grátis)</span>
              </p>
            </div>

            {/* Benefits List */}
            <ul className="space-y-4 mb-8">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Link to="/cadastro" className="block">
              <Button variant="heroPrimary" size="xl" className="w-full group">
                Assinar Agora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Value Proposition */}
          <p className="text-center text-muted-foreground mt-8 max-w-md mx-auto">
            Se encontrar <span className="text-foreground font-medium">UMA oportunidade de R$10k</span>, já pagou 4 anos de assinatura.
          </p>
        </div>
      </div>
    </section>
  );
}
