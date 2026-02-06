import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const comparisons = [
  {
    traditional: "Múltiplos concorrentes na mesma sala",
    connect: "Zero concorrência interna",
  },
  {
    traditional: "Foco em volume de contatos",
    connect: "Foco em qualidade e confiança",
  },
  {
    traditional: "Conversas superficiais",
    connect: "Reuniões de negócio estruturadas",
  },
  {
    traditional: "ROI incerto e difícil de medir",
    connect: "ROI direto através de referências qualificadas",
  },
];

export function ConnectSolutionSection() {
  return (
    <section className="py-16 md:py-24 bg-black">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-primary/50 text-primary text-sm font-medium mb-4">
              Modelo Exclusivo
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
              O Poder da{" "}
              <span className="text-primary">Cadeira Única</span>
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed">
              No TribuTalks·Connect, operamos em um modelo de células de 35
              membros. Em cada célula, existe apenas uma cadeira por
              especialidade. Um advogado tributarista. Um especialista em
              logística. Um desenvolvedor de software.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mt-4">
              Isso significa que, dentro da sua célula, você é a única
              referência na sua área. Os outros 34 membros não são seus
              concorrentes. São seus parceiros, seus conselheiros e,
              principalmente, sua força de vendas de elite.
            </p>
          </motion.div>

          {/* Tabela Comparativa */}
          <motion.div
            className="bg-card border border-border rounded-2xl p-6 md:p-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Cabeçalho */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border mb-4">
              <div className="text-muted-foreground font-medium text-sm md:text-base">
                Networking Tradicional
              </div>
              <div className="text-primary font-bold text-sm md:text-base">
                TribuTalks·Connect
              </div>
            </div>

            {/* Linhas */}
            <div className="space-y-4">
              {comparisons.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 gap-4 py-3 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-start gap-2 text-muted-foreground text-sm md:text-base">
                    <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <span>{item.traditional}</span>
                  </div>
                  <div className="flex items-start gap-2 text-foreground text-sm md:text-base">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{item.connect}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
