import { Calculator, Zap, History, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CONFIG } from "@/config/site";

const benefits = [
  {
    icon: Calculator,
    title: "Cálculo Preciso",
    description: "Alíquotas oficiais CBS, IBS e Imposto Seletivo direto da fonte.",
  },
  {
    icon: Zap,
    title: "Tempo Real",
    description: "Resultados instantâneos via API da Receita Federal.",
  },
  {
    icon: History,
    title: "Histórico Completo",
    description: "Todos os seus cálculos salvos e organizados.",
  },
  {
    icon: FileText,
    title: "Exportação PDF",
    description: "Relatórios profissionais para sua contabilidade.",
  },
];

export function RTCCalculatorSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-card/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-48 md:w-72 h-48 md:h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-64 md:w-96 h-64 md:h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 mb-3 md:mb-4">
            <Badge
              variant="outline"
              className="border-green-500/50 text-green-400 bg-green-500/10 text-xs md:text-sm"
            >
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 mr-1.5 md:mr-2 animate-pulse" />
              Integração Oficial
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4 px-2">
            Calculadora Oficial da{" "}
            <span className="text-primary">Reforma Tributária</span>
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Calcule CBS, IBS e Imposto Seletivo com precisão e confiança.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="group bg-card/80 backdrop-blur rounded-xl p-4 md:p-6 border border-border hover:border-primary/50 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <benefit.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="text-sm md:text-lg font-bold text-foreground mb-1 md:mb-2">
                {benefit.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 md:line-clamp-none">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-3 md:gap-4">
            <a href={CONFIG.PAYMENT_LINKS.PROFESSIONAL_MENSAL} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 md:px-8 py-5 md:py-6 text-sm md:text-base"
              >
                Experimente Grátis
              </Button>
            </a>
            <a
              href="https://www.gov.br/receitafederal/pt-br/assuntos/reforma-tributaria-regulamentacao"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <img
                src="https://www.gov.br/++theme++padrao_govbr/img/govbr-logo-large.png"
                alt="Gov.br"
                className="h-5 md:h-6 opacity-60"
              />
              <span className="text-xs md:text-sm">Powered by Receita Federal</span>
              <ExternalLink className="h-3 w-3 md:h-4 md:w-4" />
            </a>
          </div>

          <p className="mt-4 md:mt-6 text-xs md:text-sm text-muted-foreground">
            Dados oficiais • Cálculos instantâneos • 100% seguro
          </p>
        </div>
      </div>
    </section>
  );
}
