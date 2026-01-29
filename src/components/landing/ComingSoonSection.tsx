import { LineChart, Globe, Smartphone, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const upcomingFeatures = [
  {
    icon: LineChart,
    label: "Dashboard Analytics",
    description: "KPIs e gráficos avançados",
  },
  {
    icon: Globe,
    label: "Multi-empresa",
    description: "Gerencie várias empresas",
  },
  {
    icon: Smartphone,
    label: "App Mobile",
    description: "iOS e Android nativo",
  },
  {
    icon: Users,
    label: "Comunidade Circle",
    description: "Networking exclusivo para CFOs",
  },
];

export function ComingSoonSection() {
  return (
    <section className="py-16 bg-secondary border-y border-border">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3">
            Roadmap 2026
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            E tem mais chegando...
          </h2>
          <p className="text-muted-foreground">
            Sua assinatura inclui todas as atualizações futuras:
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {upcomingFeatures.map((feature, index) => (
            <div
              key={feature.label}
              className="flex flex-col items-center gap-1 px-6 py-4 bg-card rounded-xl text-center border border-border animate-fade-in-up hover:border-primary/50 transition-colors min-w-[140px]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <feature.icon className="w-6 h-6 text-primary mb-1" />
              <span className="font-medium text-foreground text-sm">{feature.label}</span>
              <span className="text-xs text-muted-foreground">{feature.description}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
