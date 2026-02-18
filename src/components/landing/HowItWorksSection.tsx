import { Upload, Search, Gauge, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONFIG } from "@/config/site";

const steps = [
  {
    number: "1",
    icon: Upload,
    title: "Diagnóstico Rápido",
    description: "Faça upload de 3 XMLs ou conecte seu ERP. Em 2 minutos você vê o impacto real da Reforma na sua empresa com o Score Tributário.",
  },
  {
    number: "2",
    icon: Search,
    title: "Identifique Oportunidades",
    description: "Radar analisa automaticamente e encontra créditos tributários não aproveitados (média R$ 47k). 61+ oportunidades tributárias mapeadas.",
  },
  {
    number: "3",
    icon: Gauge,
    title: "Tome Decisões Informadas",
    description: "NEXUS consolida 8 KPIs executivos. Clara AI responde dúvidas 24/7. Você comanda, não reage.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Do Cadastro ao Resultado em 3 Passos
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Simples, rápido e com resultado imediato.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Connecting Line - Desktop Only */}
            <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-0.5 bg-border" />

            {steps.map((step, index) => (
              <div
                key={step.number}
                className="flex flex-col items-center text-center animate-fade-in-up relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Step Number Circle */}
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6 relative z-10">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {step.number}
                  </span>
                </div>

                {/* Step Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden text-primary text-2xl my-4">↓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a 
            href={CONFIG.PAYMENT_LINKS.STARTER_MENSAL} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-10 py-6 text-lg group"
            >
              Verificar a Saúde da Sua Empresa
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
