import { motion } from "framer-motion";
import { Video, MapPin, Shield } from "lucide-react";

const pillars = [
  {
    icon: Video,
    title: "Reuniões de Célula",
    subtitle: "Online, a cada 15 dias",
    description:
      "Encontros quinzenais focados em resultados, onde cada membro apresenta desafios e gera referências de negócios qualificadas para os outros.",
  },
  {
    icon: MapPin,
    title: "Imersões Presenciais",
    subtitle: "2x por ano, em São Paulo",
    description:
      "Imersões de um dia inteiro com conteúdo de alto nível e jantares estratégicos para conectar-se com todo o ecossistema.",
  },
  {
    icon: Shield,
    title: "Plataforma Digital",
    subtitle: "Acesso 24/7 via Circle",
    description:
      "O hub online da comunidade para continuar conversas, acessar conteúdo exclusivo e interagir com membros de outras células em um ambiente seguro.",
  },
];

export function ConnectPillarsSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-black to-card/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-primary/50 text-primary text-sm font-medium mb-4">
            Como Funciona
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Inteligência, Negócios e{" "}
            <span className="text-primary">Conexão.</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              className="group bg-card border border-border rounded-xl p-6 md:p-8 hover:border-primary/50 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Icon Container - Frosted Glass Style */}
              <div className="w-14 h-14 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <pillar.icon className="h-7 w-7 text-primary" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-1">
                {pillar.title}
              </h3>

              <p className="text-primary text-sm font-medium mb-3">
                {pillar.subtitle}
              </p>

              <p className="text-muted-foreground text-sm leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
