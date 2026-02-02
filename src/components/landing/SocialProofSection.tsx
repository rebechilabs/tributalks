import { Star } from "lucide-react";

const testimonials = [
  {
    sector: "Empresa de Logística",
    revenue: "R$ 8M/ano",
    icon: "📦",
    metric: "R$ 127k",
    metricLabel: "Créditos ICMS-ST identificados",
    metricColor: "text-success",
    quote: "Em 48 horas o Radar encontrou créditos que estavam sendo perdidos há 2 anos. ROI de 42x no primeiro mês.",
  },
  {
    sector: "Empresa de Tecnologia",
    revenue: "R$ 15M/ano",
    icon: "💻",
    metric: "4,2pp",
    metricLabel: "Margem protegida com reclassificação",
    metricColor: "text-primary",
    quote: "O DRE Inteligente mostrou que 3 produtos estavam em NCM errado. Corrigimos e salvamos 4,2 pontos de margem.",
  },
  {
    sector: "Indústria",
    revenue: "R$ 42M/ano",
    icon: "🏭",
    metric: "R$ 340k",
    metricLabel: "Economia anual identificada",
    metricColor: "text-success",
    quote: "Simulamos mudança de regime tributário no NEXUS. Economizamos R$ 340k/ano. Se pagou 11x.",
  },
];

export function SocialProofSection() {
  return (
    <section className="py-16 md:py-24 bg-primary/5">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Resultados Reais de Empresas Reais
          </h2>
          <p className="text-lg text-muted-foreground">
            Não é teoria. É dinheiro identificado e economizado.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.sector}
              className="bg-card rounded-xl p-6 shadow-lg border border-border hover:border-primary/50 transition-all"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl">{testimonial.icon}</span>
                </div>
                <div>
                  <strong className="text-foreground">{testimonial.sector}</strong>
                  <p className="text-sm text-muted-foreground">Faturamento: {testimonial.revenue}</p>
                </div>
              </div>

              {/* Metric */}
              <div className="mb-4">
                <div className={`text-3xl font-bold ${testimonial.metricColor} mb-1`}>
                  {testimonial.metric}
                </div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.metricLabel}
                </div>
              </div>

              {/* Quote */}
              <blockquote className="text-foreground/90 text-sm italic leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Stars */}
              <div className="flex items-center gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground/70 text-center mt-8">
          *Casos ilustrativos baseados em resultados reais. Valores podem variar conforme perfil da empresa.
        </p>

      </div>
    </section>
  );
}
