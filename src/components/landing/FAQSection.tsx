import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { CONFIG } from "@/config/site";

const faqs = [
  {
    question: "Preciso substituir meu contador?",
    answer: `Não! TribuTalks complementa o trabalho do seu contador.

Seu contador cuida de compliance (apuração, DCTF, obrigações). TribuTalks cuida de inteligência estratégica (créditos, margens, planejamento).

Na prática, TribuTalks ajuda você a fazer perguntas melhores pro seu contador e validar se ele está aproveitando todas as oportunidades tributárias.`,
  },
  {
    question: "Quanto tempo leva para ver resultados?",
    answer: `• Score Tributário: 2 minutos após upload/integração
• Radar de Créditos: 48 horas (análise completa)
• Simulações de Margem: Imediato

Economia real: Clientes identificam em média R$ 47k nas primeiras 48 horas.`,
  },
  {
    question: "E se eu quiser cancelar?",
    answer: `Cancele quando quiser, sem burocracia.

7 dias de teste grátis. Após isso, cobrança mensal. Cancela pela plataforma em 2 cliques.

Seus dados ficam salvos por 90 dias após cancelamento caso queira reativar.`,
  },
  {
    question: "Como sei que os cálculos estão corretos?",
    answer: `Usamos as alíquotas oficiais da Receita Federal e legislação atualizada em tempo real.

Clara AI é treinada com:
• Base de conhecimento jurídico-tributário
• Leis, Instruções Normativas, Portarias
• Jurisprudência do CARF e tribunais superiores

Importante: TribuTalks é ferramenta de inteligência, não substitui parecer jurídico. Para decisões críticas, consulte advogado tributarista.`,
  },
  {
    question: "Meus dados estão seguros?",
    answer: `Sim. Segurança é prioridade máxima.

✅ Criptografia de ponta (SSL/TLS 256-bit)
✅ 100% Conforme LGPD (Lei 13.709/2018)
✅ Nuvem Segura (Infraestrutura AWS)
✅ Dados Protegidos (Backup diário)
✅ Pagamento Seguro (Powered by Stripe)

Nunca compartilhamos seus dados com terceiros.`,
  },
];

export function FAQSection() {
  return (
    <section className="py-16 md:py-24 bg-[#111111]">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-white/60">
            Tire suas dúvidas sobre o TribuTalks
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-[#222222] border border-white/10 rounded-xl px-4 md:px-6 data-[state=open]:bg-[#2A2A2A]"
              >
                <AccordionTrigger className="text-left text-white hover:text-primary hover:no-underline py-4 md:py-6 text-sm md:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/70 pb-4 md:pb-6 text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {faq.answer === "enterprise" ? (
                    <div className="space-y-4">
                      <p>
                        Conheça o Plano Enterprise com consultoria Rebechi & Silva integrada, 
                        white label e suporte prioritário.
                      </p>
                      <a 
                        href={CONFIG.PAYMENT_LINKS.ENTERPRISE}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Fale conosco
                        </Button>
                      </a>
                    </div>
                  ) : (
                    faq.answer
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Support CTA */}
          <div className="text-center mt-8">
            <p className="text-white/60">
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
