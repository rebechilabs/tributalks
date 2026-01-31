import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "Para quem é o TribuTalks?",
    answer:
      "TribuTalks é ideal para empresários, CFOs e gestores financeiros de empresas com faturamento acima de R$1 milhão por mês. Se você precisa tomar decisões tributárias com base em dados reais e não em achismos, o TribuTalks é para você.",
  },
  {
    question: "Meu contador já cuida disso. Por que preciso do TribuTalks?",
    answer:
      "Seu contador é essencial para obrigações legais. TribuTalks complementa com: monitoramento 24/7 de mudanças, identificação automática de créditos em XMLs, simulações de cenários em tempo real, e Clara AI para dúvidas fora do horário. Pense assim: seu contador é o médico, TribuTalks é o check-up contínuo + exames automatizados.",
  },
  {
    question: "Como sei que os cálculos estão corretos?",
    answer:
      "TribuTalks usa a API oficial da Receita Federal. As alíquotas de CBS, IBS e IS vêm direto da fonte, garantindo precisão nos cálculos. Além disso, todas as simulações são baseadas na legislação vigente e atualizadas automaticamente.",
  },
  {
    question: "E se eu quiser testar antes de pagar?",
    answer:
      "Oferecemos 7 dias grátis no plano Starter. Você vê resultado real com seus dados antes de decidir. Cancele quando quiser durante o trial — sem burocracia.",
  },
  {
    question: "Preciso de cartão para começar o teste?",
    answer:
      "Sim. Para ativar o período de teste gratuito de 7 dias do plano Starter, é necessário cadastrar um cartão de crédito. Você pode cancelar a qualquer momento durante o trial sem ser cobrado.",
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
  {
    question: "Quanto tempo leva para ver resultados?",
    answer:
      "O diagnóstico inicial leva menos de 10 minutos. Muitos clientes identificam oportunidades de economia já na primeira semana. O Radar de Créditos encontra valores recuperáveis automaticamente ao processar seus XMLs.",
  },
];

export function FAQSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-muted-foreground">
            Tire suas dúvidas sobre o TribuTalks
          </p>
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
                <AccordionContent className="text-muted-foreground pb-4 md:pb-6 text-sm md:text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Support CTA */}
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Ainda tem dúvidas?{" "}
              <Link to="/contato" className="text-primary font-medium hover:underline">
                Fale conosco
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
