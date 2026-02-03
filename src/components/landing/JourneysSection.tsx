import { Target, BarChart3, Gauge, Check, Star, Lightbulb, TrendingUp, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CONFIG } from "@/config/site";

const journeys = [
  {
    id: "starter",
    icon: Target,
    title: "Preciso Entender",
    description: '"A Reforma parece complexa. Quero entender o impacto antes de agir."',
    benefitBlocks: [
      "O ponto de partida ideal para quem quer se preparar para a Reforma Tributária.",
      "Faça um diagnóstico completo da saúde fiscal da sua empresa com o Score Tributário.",
      "Simule diferentes cenários com as calculadoras de Split Payment e comparativo de regimes.",
      "Acompanhe todos os prazos importantes na Timeline 2026-2033.",
      "Conte com a Clara AI para tirar dúvidas e a newsletter Tributalks News para se manter atualizado."
    ],
    price: 397,
    priceText: "/mês",
    ctaText: "Testar 7 dias grátis",
    link: CONFIG.PAYMENT_LINKS.STARTER_MENSAL,
    highlighted: false,
    trialBadge: "7 DIAS GRÁTIS",
  },
  {
    id: "navigator",
    icon: BarChart3,
    title: "Preciso Monitorar",
    description: '"Quero acompanhar mudanças e me preparar gradualmente."',
    benefitBlocks: [
      "Tudo do Starter, com mais poder de análise e acompanhamento contínuo.",
      "Clara AI com 100 mensagens/dia para te guiar nas decisões do dia a dia.",
      "Receba notícias da Reforma em tempo real e avalie o quanto sua empresa está preparada com o Checklist de Prontidão.",
      "Analise documentos fiscais com IA e siga Workflows Guiados para organizar suas tarefas.",
      "Acesse a comunidade TribuTalks Connect no Circle e exporte relatórios em PDF."
    ],
    price: 1297,
    priceText: "/mês",
    ctaText: "Testar 7 dias grátis",
    link: CONFIG.PAYMENT_LINKS.NAVIGATOR_MENSAL,
    highlighted: false,
    trialBadge: "7 DIAS GRÁTIS",
  },
  {
    id: "professional",
    icon: Gauge,
    title: "Preciso Decidir",
    description: '"Preciso tomar decisões informadas e proteger meu caixa AGORA."',
    benefitBlocks: [
      "Tudo do Navigator, com Clara AI ilimitada e poder total de decisão.",
      "Identifique créditos tributários com análise de XMLs, Radar de Créditos e 61+ oportunidades fiscais mapeadas.",
      "Projete seu lucro com o DRE Inteligente e proteja sua margem com a Suíte Margem Ativa 2026: analise fornecedores (OMC-AI), simule preços (PriceGuard) e monitore tudo no Dashboard Executivo.",
      "Monitore tudo em tempo real no NEXUS, seu centro de comando com 8 KPIs executivos.",
      "Conecte seu ERP e exporte relatórios PDF profissionais prontos para apresentar."
    ],
    price: 2997,
    priceText: "/mês",
    ctaText: "Plano Professional →",
    link: CONFIG.PAYMENT_LINKS.PROFESSIONAL_MENSAL,
    highlighted: true,
    badge: "MAIS POPULAR",
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

        {/* Case Study Card */}
        <div className="max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Empresa de Logística</p>
                <p className="text-sm text-muted-foreground">Faturamento R$ 8M/ano</p>
              </div>
            </div>
            
            <blockquote className="text-foreground italic mb-6 border-l-4 border-primary pl-4">
              "Em 48 horas identificamos R$ 127 mil em créditos que estavam sendo perdidos. O TribuTalks se pagou 42 vezes no primeiro mês."
            </blockquote>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <p className="text-2xl md:text-3xl font-bold text-success">R$ 127k</p>
                <p className="text-sm text-muted-foreground">Créditos identificados</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-center gap-1">
                  <p className="text-2xl md:text-3xl font-bold text-primary">42x</p>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Retorno sobre investimento</p>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground text-center mt-4">
              *Caso ilustrativo baseado em resultados reais de clientes.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {journeys.map((journey) => (
            <a
              key={journey.id}
              href={journey.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative bg-card rounded-xl p-6 md:p-8 border-2 transition-all duration-300 block cursor-pointer hover:shadow-lg ${
                journey.highlighted
                  ? "border-primary bg-gradient-to-b from-primary/5 to-card"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {/* Badge */}
              {(journey.badge || journey.trialBadge) && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap ${
                    journey.trialBadge 
                      ? "bg-success text-success-foreground" 
                      : "bg-primary text-primary-foreground"
                  }`}>
                    <Star className="w-4 h-4 fill-current" />
                    {journey.badge || journey.trialBadge}
                  </div>
                </div>
              )}

              {/* Header */}
              <div className={`${journey.badge ? "pt-4" : ""}`}>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <journey.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {journey.title}
                </h3>
                <p className="text-muted-foreground mb-6 italic">
                  {journey.description}
                </p>
              </div>

              {/* Benefit Blocks */}
              <div className="mb-6">
                <div className="space-y-3">
                  {journey.benefitBlocks.map((block, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                      <span className="text-foreground">{block}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-border pt-4">
                <div className="text-3xl font-bold text-foreground mb-2">
                  R$ {journey.price.toLocaleString("pt-BR")}
                  <span className="text-lg font-normal text-muted-foreground">
                    {journey.priceText}
                  </span>
                </div>
                
              <a 
                href={journey.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button
                  className={`w-full ${
                    journey.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {journey.ctaText}
                </Button>
              </a>

                {journey.roi && (
                  <p className="text-xs text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    {journey.roi}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>

        {/* Enterprise Note */}
        <div className="text-center mt-12 p-6 bg-card rounded-lg border border-border max-w-2xl mx-auto">
          <p className="text-muted-foreground">
            <strong className="text-foreground">Grupos econômicos ou faturamento R$ 10M+?</strong>{" "}
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
