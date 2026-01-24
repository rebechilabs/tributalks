import { Calculator, Zap, History, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-b from-background to-card/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Badge
              variant="outline"
              className="border-green-500/50 text-green-400 bg-green-500/10"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              Integração Oficial
            </Badge>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Calculadora Oficial da{" "}
            <span className="text-primary">Reforma Tributária</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Calcule CBS, IBS
            e Imposto Seletivo com precisão e confiança.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="group bg-card/80 backdrop-blur rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
              onClick={() => navigate("/cadastro")}
            >
              Experimente Grátis
            </Button>
            <a
              href="https://www.gov.br/receitafederal/pt-br/assuntos/reforma-tributaria-regulamentacao"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <img
                src="https://www.gov.br/++theme++padrao_govbr/img/govbr-logo-large.png"
                alt="Gov.br"
                className="h-6 opacity-60"
              />
              <span className="text-sm">Powered by Receita Federal</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Dados oficiais • Cálculos instantâneos • 100% seguro
          </p>
        </div>
      </div>
    </section>
  );
}
