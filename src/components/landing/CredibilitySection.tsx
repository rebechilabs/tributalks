import { TrendingUp, BookOpen, Users, Building } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "+R$380M",
    label: "economia gerada",
  },
  {
    icon: BookOpen,
    value: "Best-seller",
    label: '"Faça Direito, Faça Dinheiro"',
  },
  {
    icon: Users,
    value: "+270.000",
    label: "seguidores",
  },
  {
    icon: Building,
    value: "+30 empresas",
    label: "em 14 estados",
  },
];

export function CredibilitySection() {
  return (
    <section className="py-24 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Quem está por trás
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            TribuTech é uma iniciativa da <span className="text-primary font-medium">Rebechi & Silva Advogados</span>, escritório especializado em planejamento tributário para empresas do middle market brasileiro.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
