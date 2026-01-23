import { BarChart3, BookOpen, TrendingUp, Bell, Activity } from "lucide-react";

const upcomingFeatures = [
  {
    icon: BarChart3,
    label: "Impacto da Reforma Tributária",
  },
  {
    icon: BookOpen,
    label: "Biblioteca de Perguntas",
  },
  {
    icon: TrendingUp,
    label: "Análise de Cenários",
  },
  {
    icon: Bell,
    label: "Radar Legislativo",
  },
  {
    icon: Activity,
    label: "Score de Saúde Tributária",
  },
];

export function ComingSoonSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            E tem mais chegando...
          </h2>
          <p className="text-muted-foreground">
            Sua assinatura inclui todas as atualizações futuras:
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {upcomingFeatures.map((feature, index) => (
            <div
              key={feature.label}
              className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm font-medium text-foreground animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <feature.icon className="w-4 h-4 text-primary" />
              {feature.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
