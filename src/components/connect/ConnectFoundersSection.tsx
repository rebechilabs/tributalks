import { motion } from "framer-motion";
import { User } from "lucide-react";

const founders = [
  {
    name: "Nome do Fundador 1",
    role: "CEO, Empresa de Tecnologia",
    revenue: "Faturamento: R$ 200M/ano",
  },
  {
    name: "Nome da Fundadora 2",
    role: "Sócia, Fundo de Private Equity",
    revenue: "Faturamento: R$ 150M/ano",
  },
  {
    name: "Nome do Fundador 3",
    role: "Presidente, Indústria de Bens de Consumo",
    revenue: "Faturamento: R$ 300M/ano",
  },
];

export function ConnectFoundersSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-card/30 to-black">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            O Conselho <span className="text-primary">Fundador</span>
          </h2>

          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            O TribuTalks·Connect está sendo construído sobre uma base de líderes
            de mercado. Convidamos um seleto grupo para compor nosso Conselho
            Fundador — membros com cadeira cativa que têm o compromisso de guiar
            e catalisar a geração de negócios.
          </p>
        </motion.div>

        {/* Founders Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
          {founders.map((founder, index) => (
            <motion.div
              key={founder.name}
              className="bg-card border border-border rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Photo Placeholder */}
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted border-2 border-primary flex items-center justify-center">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>

              <h3 className="text-lg font-bold text-foreground mb-1">
                {founder.name}
              </h3>

              <p className="text-muted-foreground text-sm mb-2">
                {founder.role}
              </p>

              <p className="text-primary text-xs font-medium">
                {founder.revenue}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
