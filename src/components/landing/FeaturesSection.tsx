import { Scale, Wallet, Bot, FileText } from "lucide-react";

const features = [
  {
    icon: Scale,
    title: "Comparativo de Regimes",
    description: "Simples vs Presumido vs Real — descubra qual regime é mais vantajoso para sua empresa.",
  },
  {
    icon: Wallet,
    title: "Impacto do Split Payment",
    description: "Saiba exatamente quanto vai ficar retido no seu caixa com a nova regra de 2026.",
  },
  {
    icon: Bot,
    title: "TribuBot — Consultor IA 24/7",
    description: "Tire dúvidas tributárias em linguagem simples, a qualquer hora, sem esperar.",
  },
  {
    icon: FileText,
    title: "Relatório PDF para o Board",
    description: "Gere relatórios profissionais para apresentar nas reuniões com sócios e diretoria.",
  },
];

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tudo que você precisa para decisões tributárias inteligentes
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-xl p-6 border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
