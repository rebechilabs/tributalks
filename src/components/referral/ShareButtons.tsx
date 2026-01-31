import { Button } from "@/components/ui/button";
import { MessageCircle, Linkedin, Mail } from "lucide-react";

interface ShareButtonsProps {
  referralLink: string;
  code: string;
}

// Mensagem padrão para compartilhamento
export const getShareMessage = (code: string, referralLink: string) => {
  return `🎯 Reforma Tributária chegando: sua empresa está preparada?

Estou usando o TribuTalks para identificar créditos tributários e proteger minha margem. Em poucos minutos, descobri oportunidades que meu contador não tinha visto.

✅ Diagnóstico gratuito em 2 minutos
✅ IA especialista disponível 24/7
✅ Créditos identificados automaticamente

Use meu código ${code} e comece grátis:
${referralLink}`;
};

// Mensagem para LinkedIn (mais curta e profissional)
export const getLinkedInMessage = (code: string, referralLink: string) => {
  return `A Reforma Tributária vai impactar seu fluxo de caixa em 2027. Estou me preparando com o TribuTalks — uma plataforma que identifica créditos tributários e simula cenários.

Use meu código ${code}: ${referralLink}`;
};

// Mensagem para e-mail (mais detalhada)
export const getEmailMessage = (code: string, referralLink: string) => {
  return `Olá!

Quero compartilhar uma ferramenta que está me ajudando muito na preparação para a Reforma Tributária.

O TribuTalks é uma plataforma de inteligência tributária que:
• Identifica créditos fiscais não aproveitados (média de R$ 47k por empresa)
• Simula o impacto real de CBS, IBS e IS no seu negócio
• Tem uma IA especialista (Clara) disponível 24/7

O diagnóstico inicial é gratuito e leva só 2 minutos. Vale muito a pena conferir.

Use meu código de indicação: ${code}
Acesse: ${referralLink}

Abraços!`;
};

export function ShareButtons({ referralLink, code }: ShareButtonsProps) {
  const shareMessage = getShareMessage(code, referralLink);
  
  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedIn = () => {
    // LinkedIn não aceita texto customizado no share, mas podemos usar o post composer
    const linkedInMessage = getLinkedInMessage(code, referralLink);
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(linkedInMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('Preparação para Reforma Tributária - Indicação TribuTalks');
    const body = encodeURIComponent(getEmailMessage(code, referralLink));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Compartilhar via:</p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleWhatsApp}
          className="flex-1 gap-2 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLinkedIn}
          className="flex-1 gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
        >
          <Linkedin className="w-4 h-4" />
          LinkedIn
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEmail}
          className="flex-1 gap-2"
        >
          <Mail className="w-4 h-4" />
          E-mail
        </Button>
      </div>
    </div>
  );
}
