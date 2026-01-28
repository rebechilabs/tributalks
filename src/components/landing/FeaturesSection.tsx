import { 
  Scale, Wallet, Sparkles, FileText, Users, 
  Calculator, Upload, Target, BarChart3, Trophy, Newspaper, Clock, Navigation, MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Wallet,
    title: "Simulador Split Payment",
    description:
      "Saiba exatamente quanto vai ficar retido no seu caixa com a nova regra de 2026.",
    badge: "Destaque",
    badgeVariant: "default" as const,
  },
  {
    icon: Clock,
    title: "Timeline 2026-2033",
    description:
      "Acompanhe o que muda em cada ano da transição e o que você precisa fazer.",
    badge: "Novo",
    badgeVariant: "secondary" as const,
  },
  {
    icon: Scale,
    title: "Comparativo de Regimes",
    description:
      "Sistema atual vs reforma — compare cenários e estime o impacto de cada um.",
  },
  {
    icon: Newspaper,
    title: "Notícias da Reforma",
    description:
      "Feed diário com pílulas, prazos e análises sobre a reforma tributária.",
    badge: "Diário",
    badgeVariant: "outline" as const,
  },
  {
    icon: Trophy,
    title: "Score Tributário",
    description:
      "Avalie a saúde fiscal da sua empresa em 5 dimensões com ações recomendadas.",
  },
  {
    icon: Calculator,
    title: "Calculadora RTC",
    description:
      "Calcule CBS, IBS e IS com a API oficial da Receita Federal. Alíquotas reais por NCM.",
    badge: "API Oficial",
    badgeVariant: "default" as const,
  },
  {
    icon: Upload,
    title: "Importar XMLs",
    description:
      "Faça upload das suas notas fiscais e analise automaticamente oportunidades de crédito.",
    badge: "Professional",
    badgeVariant: "outline" as const,
  },
  {
    icon: Target,
    title: "Radar de Créditos",
    description:
      "Identifique créditos tributários não aproveitados de ICMS, PIS/COFINS e IPI.",
    badge: "Professional",
    badgeVariant: "outline" as const,
  },
  {
    icon: BarChart3,
    title: "DRE Inteligente",
    description:
      "Preencha seu DRE e receba diagnóstico com score de saúde financeira e recomendações.",
    badge: "Professional",
    badgeVariant: "outline" as const,
  },
  {
    icon: Navigation,
    title: "Oportunidades Fiscais",
    description:
      "37+ benefícios fiscais por setor com match inteligente ao seu perfil de empresa.",
    badge: "Professional",
    badgeVariant: "outline" as const,
  },
  {
    icon: Sparkles,
    title: "Clara AI — Copiloto Tributário",
    description:
      "Tire dúvidas tributárias em linguagem simples, a qualquer hora, sem esperar.",
    badge: "IA",
    badgeVariant: "secondary" as const,
  },
  {
    icon: FileText,
    title: "Relatórios PDF",
    description:
      "Gere PDFs profissionais para apresentar nas reuniões com sócios e diretoria.",
  },
];

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Ferramentas do GPS Tributário
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tudo que você precisa para
            <br />
            navegar pela <span className="text-primary">reforma</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            De simuladores a diagnósticos completos — ferramentas que transformam
            a complexidade da reforma em ações claras para o seu negócio.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                {feature.badge && (
                  <Badge variant={feature.badgeVariant} className="text-xs">
                    {feature.badge}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
