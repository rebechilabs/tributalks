import { Scale, Wallet, User, FolderArchive, Mail, Rocket } from "lucide-react";

const features = [
  {
    icon: Scale,
    title: "Comparativo de Regimes",
    description: "Simples vs Presumido vs Real — descubra qual é o melhor para sua empresa.",
  },
  {
    icon: Wallet,
    title: "Impacto do Split Payment",
    description: "Saiba quanto vai ficar retido no seu caixa com a nova regra.",
  },
  {
    icon: User,
    title: "Perfil Personalizado",
    description: "Todas as ferramentas já vêm preenchidas com os dados da sua empresa.",
  },
  {
    icon: FolderArchive,
    title: "Histórico de Simulações",
    description: "Tudo salvo, comparável e exportável em PDF.",
  },
  {
    icon: Mail,
    title: "Newsletter Premium",
    description: "Análises mais profundas + acesso antecipado às edições.",
  },
  {
    icon: Rocket,
    title: "Novas Ferramentas",
    description: "Créditos PIS/COFINS, Holding Familiar, Radar Fiscal — incluso na assinatura.",
  },
];

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O Que Está Incluso
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas práticas para decisões tributárias inteligentes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
