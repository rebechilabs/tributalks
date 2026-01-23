import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { CONFIG } from "@/config/site";

const benefits = [
  "Todas as calculadoras",
  "TribuBot ilimitado",
  "Simulações ilimitadas",
  "Histórico completo",
  "Relatórios em PDF",
  "Novas ferramentas inclusas",
];

export function PricingSection() {
  return (
    <section id="preco" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Investimento
          </h2>
        </div>

        <div className="max-w-lg mx-auto">
          {/* Pricing Card */}
          <div className="relative bg-card rounded-xl p-8 md:p-10 border-2 border-primary shadow-xl">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-semibold shadow-md">
                <Sparkles className="w-4 h-4" />
                Mais Popular
              </div>
            </div>

            {/* Plan Name */}
            <div className="text-center mb-8 pt-4">
              <h3 className="text-2xl font-bold text-primary mb-4">
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

            {/* Divider */}
            <div className="border-t border-border mb-8" />

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
            <a href={CONFIG.STRIPE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="heroPrimary" size="xl" className="w-full group">
                Assinar Agora — R$197/mês
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>

            {/* Guarantee */}
            <p className="text-center text-sm text-muted-foreground mt-4">
              Cancele quando quiser. Sem fidelidade.
            </p>
          </div>

          {/* Value Proposition */}
          <div className="text-center mt-8 space-y-2">
            <p className="text-muted-foreground">
              Menos que 1 hora de consultoria tributária.
            </p>
            <p className="text-muted-foreground">
              Se encontrar <span className="text-foreground font-medium">UMA oportunidade de R$10k</span>, já pagou 4 anos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
