import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { CaseStudyCard } from "@/components/cases/CaseStudyCard";
import { caseStudies } from "@/data/caseStudies";
import { TrendingUp, Users, Building2 } from "lucide-react";

export default function EstudosCaso() {
  const stats = [
    { icon: TrendingUp, value: "R$ 2.3M+", label: "Em economia gerada" },
    { icon: Users, value: "150+", label: "Empresas atendidas" },
    { icon: Building2, value: "12", label: "Setores diferentes" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 md:px-6 lg:px-8 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Resultados Reais
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Estudos de Caso
            </h1>
            <p className="text-lg text-muted-foreground">
              Conheça histórias reais de empresas que transformaram sua gestão tributária 
              com o TribuTalks e alcançaram resultados mensuráveis.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="container mx-auto px-4 md:px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div 
                key={stat.label} 
                className="flex flex-col items-center p-6 rounded-xl bg-card border border-border"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-2xl md:text-3xl font-bold text-foreground">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Case Studies Grid */}
        <section className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {caseStudies.map((caseStudy, index) => (
              <CaseStudyCard 
                key={caseStudy.id} 
                caseStudy={caseStudy}
                index={index}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
