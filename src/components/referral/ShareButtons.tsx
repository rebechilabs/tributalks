import { Button } from "@/components/ui/button";
import { MessageCircle, Linkedin, Mail } from "lucide-react";

interface ShareButtonsProps {
  referralLink: string;
  code: string;
}

export function ShareButtons({ referralLink, code }: ShareButtonsProps) {
  const shareMessage = `Conheça o TribuTalks! Use meu código ${code} e prepare sua empresa para a Reforma Tributária: ${referralLink}`;
  
  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('Convite para o TribuTalks - Reforma Tributária');
    const body = encodeURIComponent(
      `Olá!\n\nQuero te convidar para conhecer o TribuTalks, a plataforma que está me ajudando a preparar minha empresa para a Reforma Tributária.\n\nUse meu código de indicação: ${code}\n\nAcesse: ${referralLink}\n\nAbraços!`
    );
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
