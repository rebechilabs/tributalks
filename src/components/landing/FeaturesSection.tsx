import { 
  Scale, Wallet, Sparkles, FileText, Users, 
  Calculator, Upload, Target, BarChart3, Trophy, Newspaper, Clock, Navigation, MapPin, TrendingUp, Shield
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Shield,
    title: "Suíte Margem Ativa 2026",
    description:
      "Simule preços pós-reforma com alíquotas reais da Receita Federal. Proteja sua margem antes que seja tarde.",
    badge: "NOVO",
    badgeVariant: "default" as const,
  },
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
    title: "Radar Tributário + XMLs",
    description:
      "Importe suas notas fiscais e identifique automaticamente créditos recuperáveis com IA preditiva.",
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
      "61+ benefícios fiscais por setor com match inteligente ao seu perfil de empresa.",
    badge: "Professional",
    badgeVariant: "outline" as const,
  },
  {
    icon: Sparkles,
    title: "Clara AI — Copiloto Tributário",
    description:
      "Tire dúvidas tributárias em linguagem simples, a qualquer hora, sem esperar.",
    badge: "AI",
    badgeVariant: "secondary" as const,
  },
  {
    icon: FileText,
    title: "Relatórios PDF",
    description:
      "Gere PDFs profissionais para apresentar nas reuniões com sócios e diretoria.",
  },
  {
    icon: TrendingUp,
    title: "Impacto no Valuation",
    description:
      "Veja como seu compliance tributário afeta o valor da sua empresa em cenários de M&A.",
    badge: "EXCLUSIVO",
    badgeVariant: "default" as const,
  },
];

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <Badge variant="outline" className="mb-3 md:mb-4 text-primary border-primary text-xs md:text-sm">
            TribuTalks Inteligência Tributária
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 px-2">
            Tudo que você precisa para
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>navegar pela <span className="text-primary">reforma</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            De simuladores a diagnósticos completos — ferramentas que transformam
            a complexidade da reforma em ações claras.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-xl p-3 md:p-5 border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
                  <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                {feature.badge && (
                  <Badge variant={feature.badgeVariant} className="text-[10px] md:text-xs px-1.5 md:px-2">
                    {feature.badge}
                  </Badge>
                )}
              </div>
              <h3 className="text-sm md:text-lg font-bold text-foreground mb-1 md:mb-2 leading-tight">
                {feature.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-3 md:line-clamp-none">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
