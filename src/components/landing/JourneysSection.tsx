import { Target, BarChart3, Gauge, Lock, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const journeys = [
  {
    id: "starter",
    icon: Target,
    emoji: "🎯",
    title: "Preciso Entender",
    description: '"A Reforma parece complexa. Quero entender o impacto antes de agir."',
    features: [
      { text: "Clara AI (Assistente)", included: true, limit: "30 msgs/dia" },
      { text: "Score da sua saúde fiscal", included: true },
      { text: "Calculadoras oficiais (CBS/IBS/IS)", included: true },
      { text: "Simulador Split Payment", included: true },
      { text: "Timeline 2026-2033 detalhada", included: true },
    ],
    price: 397,
    priceText: "/mês",
    ctaText: "Plano Starter →",
    link: "/cadastro?plan=starter",
    highlighted: false,
  },
  {
    id: "navigator",
    icon: BarChart3,
    emoji: "📊",
    title: "Preciso Monitorar",
    description: '"Quero acompanhar mudanças e me preparar gradualmente."',
    features: [
      { text: "Clara AI (Copiloto)", included: true, limit: "100 msgs/dia" },
      { text: "Tudo do Starter +", included: true },
      { text: "Notícias diárias da Reforma", included: true },
      { text: "Comunidade exclusiva (Circle)", included: true },
      { text: "Checklist de Prontidão", included: true },
      { text: "NEXUS, Radar, DRE", included: false, locked: true },
    ],
    price: 1297,
    priceText: "/mês",
    ctaText: "Plano Navigator →",
    link: "/cadastro?plan=navigator",
    highlighted: false,
  },
  {
    id: "professional",
    icon: Gauge,
    emoji: "🎛️",
    title: "Preciso Decidir",
    description: '"Preciso tomar decisões informadas e proteger meu caixa AGORA."',
    features: [
      { text: "Clara AI ilimitada", included: true, highlight: true },
      { text: "Tudo do Navigator +", included: true },
      { text: "NEXUS (8 KPIs executivos)", included: true, highlight: true },
      { text: "Radar de Créditos (XMLs)", included: true, highlight: true },
      { text: "DRE Inteligente (margem)", included: true, highlight: true },
      { text: "Integração ERP automática", included: true },
    ],
    price: 2997,
    priceText: "/mês",
    ctaText: "Plano Professional →",
    link: "/cadastro?plan=professional",
    highlighted: true,
    badge: "⭐ MAIS POPULAR",
    roi: "ROI médio: 10x nos primeiros 90 dias",
  },
];

export function JourneysSection() {
  return (
    <section id="jornadas" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Escolha Sua Jornada
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cada plano resolve um job específico. Qual é o seu?
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {journeys.map((journey) => (
            <div
              key={journey.id}
              className={`relative bg-card rounded-xl p-6 md:p-8 border-2 transition-all duration-300 ${
                journey.highlighted
                  ? "border-primary bg-gradient-to-b from-primary/5 to-card"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {/* Badge */}
              {journey.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold whitespace-nowrap">
                    {journey.badge}
                  </div>
                </div>
              )}

              {/* Header */}
              <div className={`${journey.badge ? "pt-4" : ""}`}>
                <div className="text-4xl mb-4">{journey.emoji}</div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {journey.title}
                </h3>
                <p className="text-muted-foreground mb-6 italic">
                  {journey.description}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {journey.features.map((feature) => (
                  <div key={feature.text} className="flex items-center gap-2 text-sm">
                    {feature.locked ? (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Check className={`w-4 h-4 ${feature.highlight ? "text-primary" : "text-success"}`} />
                    )}
                    <span className={`${feature.locked ? "text-muted-foreground" : feature.highlight ? "font-semibold text-foreground" : "text-foreground"}`}>
                      {feature.text}
                    </span>
                    {feature.limit && (
                      <span className="text-xs text-warning">({feature.limit})</span>
                    )}
                    {feature.locked && (
                      <span className="text-xs text-muted-foreground">(Pro)</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="border-t border-border pt-4">
                <div className="text-3xl font-bold text-foreground mb-2">
                  R$ {journey.price.toLocaleString("pt-BR")}
                  <span className="text-lg font-normal text-muted-foreground">
                    {journey.priceText}
                  </span>
                </div>
                
                <Link to={journey.link}>
                  <Button
                    className={`w-full ${
                      journey.highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {journey.ctaText}
                  </Button>
                </Link>

                {journey.roi && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    💡 {journey.roi}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Note */}
        <div className="text-center mt-12 p-6 bg-card rounded-lg border border-border max-w-2xl mx-auto">
          <p className="text-muted-foreground">
            <strong className="text-foreground">Grupos econômicos ou faturamento R$ 100M+?</strong>{" "}
            Conheça o{" "}
            <Link to="/contato" className="text-primary font-semibold hover:underline">
              Plano Enterprise
            </Link>{" "}
            com consultoria Rebechi & Silva integrada.
          </p>
        </div>
      </div>
    </section>
  );
}
