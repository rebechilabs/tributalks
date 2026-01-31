import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Gift, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ShareButtons, getShareMessage } from "./ShareButtons";

interface ReferralCodeCardProps {
  code: string | null;
  referralLink: string | null;
  isLoading: boolean;
}

export function ReferralCodeCard({ code, referralLink, isLoading }: ReferralCodeCardProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!code) return;
    
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "Compartilhe com seus contatos.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Tente selecionar e copiar manualmente.",
        variant: "destructive",
      });
    }
  };

  // Copia o link COM a mensagem de convite completa
  const handleCopyLink = async () => {
    if (!referralLink || !code) return;
    
    try {
      const fullMessage = getShareMessage(code, referralLink);
      await navigator.clipboard.writeText(fullMessage);
      setLinkCopied(true);
      toast({
        title: "Convite copiado!",
        description: "Texto completo pronto para compartilhar.",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast({
        title: "Erro ao copiar",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>Gerando seu código...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Gift className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-lg">Seu Código de Indicação</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Código destacado */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-secondary rounded-lg px-4 py-3 text-center">
            <span className="text-2xl font-mono font-bold tracking-wider text-foreground">
              {code || "---"}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyCode}
            disabled={!code}
            className="shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Link completo com convite */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Copiar convite completo:</p>
          </div>
          <Button 
            variant="secondary" 
            className="w-full gap-2" 
            onClick={handleCopyLink} 
            disabled={!referralLink}
          >
            {linkCopied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                Convite copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar texto + link de indicação
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Inclui mensagem explicativa sobre o TribuTalks
          </p>
        </div>

        {/* Botões de compartilhamento */}
        {referralLink && <ShareButtons referralLink={referralLink} code={code || ""} />}
      </CardContent>
    </Card>
  );
}
