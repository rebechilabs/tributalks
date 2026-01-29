import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ReferralCodeCard, ReferralProgress, ReferralList } from "@/components/referral";
import { useReferral } from "@/hooks/useReferral";
import { Gift, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    question: "Como funciona o programa de indicação?",
    answer: "Compartilhe seu código único com amigos e empresários. Quando eles se cadastrarem usando seu código e assinarem um plano pago por 30 dias, você ganha desconto na sua mensalidade!"
  },
  {
    question: "Quanto de desconto posso ganhar?",
    answer: "Os descontos são progressivos: 5% com 1 indicação, 10% com 3, 15% com 5 e até 20% com 10 ou mais indicações qualificadas."
  },
  {
    question: "O que é uma indicação qualificada?",
    answer: "Uma indicação é qualificada quando o indicado assina um plano pago (Navigator ou Professional) e permanece ativo por pelo menos 30 dias."
  },
  {
    question: "O desconto é permanente?",
    answer: "Sim! Uma vez atingido um nível de desconto, ele permanece ativo enquanto você mantiver sua assinatura."
  },
  {
    question: "Posso indicar quantas pessoas quiser?",
    answer: "Sim! Não há limite de indicações. Quanto mais você indica, maior seu desconto (até o máximo de 20%)."
  },
];

const Indicar = () => {
  const {
    referralCode,
    referralLink,
    referrals,
    isLoading,
    isCreatingCode,
    currentDiscount,
    nextLevel,
    pendingCount,
    qualifiedCount,
    rewardedCount,
  } = useReferral();

  return (
    <DashboardLayout title="Programa de Indicação">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Gift className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Indique e Ganhe</h1>
              <p className="text-muted-foreground">
                Convide empresários e ganhe até 20% de desconto na sua assinatura
              </p>
            </div>
          </div>
        </div>

        {/* Grid principal */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Coluna esquerda */}
          <div className="space-y-6">
            <ReferralCodeCard
              code={referralCode?.code || null}
              referralLink={referralLink}
              isLoading={isLoading || isCreatingCode}
            />

            <ReferralProgress
              successfulReferrals={referralCode?.successful_referrals || 0}
              currentDiscount={currentDiscount}
              nextLevel={nextLevel}
            />
          </div>

          {/* Coluna direita */}
          <div className="space-y-6">
            <ReferralList
              referrals={referrals}
              pendingCount={pendingCount}
              qualifiedCount={qualifiedCount}
              rewardedCount={rewardedCount}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Perguntas Frequentes</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Indicar;
