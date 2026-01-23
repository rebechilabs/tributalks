import { Scale, Wallet, Bot, FileText, Users } from "lucide-react";

const features = [
  {
    icon: Scale,
    title: "Comparativo de Regimes",
    description:
      "Simples vs Presumido vs Real — descubra qual regime gera mais economia para sua empresa.",
  },
  {
    icon: Wallet,
    title: "Impacto do Split Payment",
    description:
      "Saiba exatamente quanto vai ficar retido no seu caixa com a nova regra de 2026.",
  },
  {
    icon: Bot,
    title: "TribuBot — IA 24/7",
    description:
      "Tire dúvidas tributárias em linguagem simples, a qualquer hora, sem esperar.",
  },
  {
    icon: FileText,
    title: "Relatório para o Board",
    description:
      "Gere PDFs profissionais para apresentar nas reuniões com sócios e diretoria.",
  },
  {
    icon: Users,
    title: "Comunidade Exclusiva",
    description:
      "Networking com empresários e CFOs que faturam acima de R$1M/mês.",
  },
];

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tudo que você precisa para
            <br />
            decisões tributárias{" "}
            <span className="text-primary">inteligentes</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl mb-4">
                <feature.icon className="w-10 h-10 text-primary" />
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
