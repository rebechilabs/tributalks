import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CONFIG } from "@/config/site";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FBBF24' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container mx-auto px-4 py-20 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in-up">
            Inteligência Tributária para Empresas{" "}
            <span className="text-primary">acima de R$1M/mês</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            Calculadoras e IA que mostram o impacto real das decisões tributárias no seu caixa.{" "}
            <span className="text-foreground font-medium">Em minutos, não em semanas.</span>
          </p>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4 mb-6 animate-fade-in-up animation-delay-200">
            <a href={CONFIG.STRIPE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
              <Button size="xl" className="bg-primary text-primary-foreground hover:bg-primary/90 group">
                Assinar por R$197/mês
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </div>

          {/* Guarantee Text */}
          <p className="text-sm text-muted-foreground animate-fade-in-up animation-delay-300">
            Cancele quando quiser. Sem fidelidade.
          </p>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
