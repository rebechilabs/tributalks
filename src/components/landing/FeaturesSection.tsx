import { 
  Scale, Wallet, Bot, FileText, Users, 
  Calculator, Upload, Target, BarChart3, Trophy, Newspaper, Lightbulb 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Calculator,
    title: "Calculadora RTC",
    description:
      "Calcule CBS, IBS e IS com a API oficial da Receita Federal. Alíquotas reais por NCM.",
    badge: "API Oficial",
    badgeVariant: "default" as const,
  },
  {
    icon: Lightbulb,
    title: "Oportunidades Fiscais",
    description:
      "Identifique automaticamente oportunidades de economia com match inteligente ao seu perfil.",
    badge: "Novo",
    badgeVariant: "secondary" as const,
  },
  {
    icon: Scale,
    title: "Comparativo de Regimes",
    description:
      "Simples vs Presumido vs Real — descubra qual regime gera mais economia para sua empresa.",
  },
  {
    icon: Wallet,
    title: "Simulador Split Payment",
    description:
      "Saiba exatamente quanto vai ficar retido no seu caixa com a nova regra de 2026.",
  },
  {
    icon: Upload,
    title: "Importar XMLs",
    description:
      "Faça upload das suas notas fiscais e analise automaticamente oportunidades de crédito.",
  },
  {
    icon: Target,
    title: "Radar de Créditos",
    description:
      "Identifique créditos tributários não aproveitados de ICMS, PIS/COFINS e IPI.",
    badge: "Novo",
    badgeVariant: "secondary" as const,
  },
  {
    icon: BarChart3,
    title: "DRE Inteligente",
    description:
      "Preencha seu DRE e receba diagnóstico com score de saúde financeira e recomendações.",
    badge: "Novo",
    badgeVariant: "secondary" as const,
  },
  {
    icon: Trophy,
    title: "Score Tributário",
    description:
      "Avalie a saúde fiscal da sua empresa em 5 dimensões com ações recomendadas.",
    badge: "Novo",
    badgeVariant: "secondary" as const,
  },
  {
    icon: Bot,
    title: "TribuBot — IA 24/7",
    description:
      "Tire dúvidas tributárias em linguagem simples, a qualquer hora, sem esperar.",
    badge: "IA",
    badgeVariant: "outline" as const,
  },
  {
    icon: Newspaper,
    title: "Notícias Tributárias",
    description:
      "Fique por dentro das mudanças na legislação com resumos executivos e alertas.",
  },
  {
    icon: FileText,
    title: "Relatórios PDF",
    description:
      "Gere PDFs profissionais para apresentar nas reuniões com sócios e diretoria.",
  },
  {
    icon: Users,
    title: "Comunidade Exclusiva",
    description:
      "Networking com empresários e CFOs que faturam acima de R$1M/mês.",
  },
];

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            12 ferramentas disponíveis
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tudo que você precisa para
            <br />
            decisões tributárias{" "}
            <span className="text-primary">inteligentes</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Da análise de regime ao score tributário completo — ferramentas que transformam
            complexidade fiscal em ações claras.
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
