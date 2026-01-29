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
    question: "Como funcionam as consultorias do Premium?",
    answer:
      "No plano Premium, você tem direito a 2 sessões de 30 minutos por mês com um especialista tributário da Rebechi & Silva Advogados. As sessões são agendadas via Calendly e podem ser usadas para tirar dúvidas específicas sobre sua operação.",
  },
  {
    question: "As novas ferramentas serão cobradas à parte?",
    answer:
      "Não. Todas as novas ferramentas e funcionalidades que lançarmos estão inclusas na sua assinatura, sem custo adicional. Radar Legislativo, Score Tributário, Biblioteca de Perguntas — tudo incluído.",
  },
];

export function FAQSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Perguntas frequentes
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:bg-secondary"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
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
