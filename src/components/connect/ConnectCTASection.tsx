import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Qual o tamanho de cada célula?",
    answer:
      "Cada célula é limitada a 35 membros, garantindo proximidade e confiança entre todos.",
  },
  {
    question: "Posso participar se já houver alguém da minha especialidade?",
    answer:
      "Não. Se a cadeira para a sua especialidade já estiver ocupada, você pode entrar em uma lista de espera ou aplicar para uma nova célula em formação.",
  },
  {
    question: "As conversas são confidenciais?",
    answer:
      "Sim. Operamos sob a Regra de Chatham House, um padrão global para fóruns executivos. Isso significa que os participantes são livres para usar as informações recebidas, mas não podem revelar a identidade ou a afiliação de quem disse o quê. É a base da nossa confiança.",
  },
  {
    question: "Os encontros são gravados?",
    answer:
      "Não, para garantir a confidencialidade e a troca aberta de informações. Apenas conteúdo das imersões presenciais pode ser disponibilizado.",
  },
  {
    question: "Qual o compromisso de tempo esperado?",
    answer:
      "Cerca de 2 horas a cada 15 dias para as reuniões de célula, além da participação nos dois encontros presenciais anuais.",
  },
  {
    question: "Qual o investimento?",
    answer:
      "A anuidade é de R$ 15.000. Um único negócio fechado dentro da célula já paga o investimento do ano inteiro.",
  },
];

interface ConnectCTASectionProps {
  onScrollToForm: () => void;
}

export function ConnectCTASection({ onScrollToForm }: ConnectCTASectionProps) {
  return (
    <section className="py-16 md:py-24 bg-black">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* CTA Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
              Perguntas Frequentes sobre a{" "}
              <span className="text-primary">Aplicação</span>
            </h2>

            <p className="text-muted-foreground text-lg mb-6">
              Buscamos líderes de empresas com faturamento anual superior a R$
              12 milhões, que sejam referência em suas áreas e entendam que o
              crescimento mais rápido é feito em conjunto.
            </p>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <p className="text-2xl font-bold text-foreground mb-2">
                Anuidade: R$ 15.000
              </p>
              <p className="text-muted-foreground text-sm">
                Um único negócio fechado na célula paga o investimento.
              </p>
            </div>

            <Button
              size="lg"
              onClick={onScrollToForm}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-base group"
            >
              Aplicar para minha Cadeira
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* FAQ Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-5 data-[state=open]:border-primary/50"
                >
                  <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-5 text-sm md:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 text-sm leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
