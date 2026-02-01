import { TrendingUp, Users, Building, Scale, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  {
    icon: TrendingUp,
    value: "+R$380M",
    label: "economia gerada",
  },
  {
    icon: Users,
    value: "+270.000",
    label: "seguidores nas redes sociais",
  },
  {
    icon: Building,
    value: "+1.500",
    label: "empresas atendidas no Brasil",
  },
];

export function CredibilitySection() {
  return (
    <section className="py-16 md:py-24 bg-card border-y border-border">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Quem está por trás
          </h2>
          
          {/* Founder highlight */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <Scale className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Powered by Rebechi & Silva Advogados Associados
              </span>
            </div>
          </div>
          
          <p className="text-sm md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            TribuTalks é liderado por{" "}
            <span className="text-foreground font-semibold">
              Dr. Alexandre Silva
            </span>
            , Founder & CEO da{" "}
            <span className="text-primary font-medium">
              Rebechi & Silva Advogados Associados
            </span>
            , escritório especializado em planejamento tributário para o middle
            market brasileiro.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-xl sm:text-2xl md:text-4xl font-bold text-primary mb-1 md:mb-2">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* PDF Download CTA */}
        <div className="text-center mt-10 md:mt-12">
          <a 
            href="https://bit.ly/TribuTalks" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="gap-2">
              <FileText className="h-4 w-4" />
              Saiba mais sobre a TribuTalks — Baixe o PDF
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
