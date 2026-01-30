import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Para quem é o TribuTalks?",
    answer:
      "TribuTalks é ideal para empresários, CFOs e gestores financeiros de empresas com faturamento acima de R$1 milhão por mês. Se você precisa tomar decisões tributárias com base em dados reais e não em achismos, o TribuTalks é para você.",
  },
  {
    question: "Preciso de cartão para começar?",
    answer:
      "Não. O plano FREE é completamente gratuito e não requer cartão de crédito. Você só precisa informar dados de pagamento se decidir fazer upgrade para um plano pago.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer:
      "Sim. Não existe fidelidade ou multa por cancelamento. Você pode cancelar sua assinatura a qualquer momento diretamente no painel, e continuará tendo acesso até o fim do período pago.",
  },
  {
    question: "As novas ferramentas serão cobradas à parte?",
    answer:
      "Para assinantes do plano Professional ou superior, não. Todas as novas ferramentas e funcionalidades que lançarmos estão inclusas na sua assinatura, sem custo adicional. Radar Legislativo, Score Tributário, Biblioteca de Perguntas — tudo incluído.",
  },
];

export function FAQSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Perguntas frequentes
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-4 md:px-6 data-[state=open]:bg-secondary"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-4 md:py-6 text-sm md:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 md:pb-6 text-sm md:text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
