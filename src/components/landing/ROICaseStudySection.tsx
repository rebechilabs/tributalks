import { Star, TrendingUp } from "lucide-react";

export function ROICaseStudySection() {
  return (
    <section className="py-16 md:py-20 bg-muted/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10 animate-fade-in-up">
            <p className="text-xl md:text-2xl font-bold text-foreground">
              Você está pensando em retorno do investimento?{" "}
              <span className="text-primary">Veja isso!</span>
            </p>
          </div>

          {/* Case Study Card */}
          <div className="w-full bg-card rounded-2xl shadow-2xl p-6 md:p-8 border border-border animate-fade-in-up animation-delay-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <strong className="text-foreground">Empresa de Logística</strong>
                <p className="text-sm text-muted-foreground">Faturamento R$ 8M/ano</p>
              </div>
            </div>

            <blockquote className="text-lg text-foreground mb-4 leading-relaxed">
              "Em 48 horas identificamos <strong className="text-primary">R$ 127 mil em créditos</strong> que estavam sendo perdidos. O TribuTalks se pagou <strong className="text-primary">42 vezes</strong> no primeiro mês."
            </blockquote>

            <div className="flex items-center gap-1 text-primary mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary" />
              ))}
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">R$ 127k</div>
                  <div className="text-sm text-muted-foreground">Créditos identificados</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success">42x ROI</div>
                  <div className="text-sm text-muted-foreground">Retorno sobre investimento</div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground/70 text-center mt-4">
              *Caso ilustrativo baseado em resultados reais de clientes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
