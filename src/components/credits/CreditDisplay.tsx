import { Coins, Sparkles, ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useUserCredits, getCreditPackages } from "@/hooks/useUserCredits";
import { Link } from "react-router-dom";

const creditPackages = getCreditPackages();

interface CreditDisplayProps {
  variant?: "compact" | "full";
  className?: string;
}

export function CreditDisplay({ variant = "compact", className = "" }: CreditDisplayProps) {
  const { credits, loading, shouldShowUpsell } = useUserCredits();
  const balance = credits?.balance ?? 0;
  const purchaseCount = credits?.purchaseCount ?? 0;

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Coins className="w-4 h-4 animate-pulse" />
        <span className="text-sm">Carregando...</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className={`flex items-center gap-2 text-sm hover:text-primary transition-colors ${className}`}>
            <Coins className="w-4 h-4 text-primary" />
            <span>{balance} crédito{balance !== 1 ? "s" : ""}</span>
          </button>
        </DialogTrigger>
        <CreditPurchaseDialog 
          balance={balance} 
          purchaseCount={purchaseCount} 
          shouldShowUpsell={!!shouldShowUpsell} 
        />
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className={`cursor-pointer hover:border-primary/50 transition-colors ${className}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {balance} crédito{balance !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Clique para comprar mais
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </DialogTrigger>
      <CreditPurchaseDialog 
        balance={balance} 
        purchaseCount={purchaseCount} 
        shouldShowUpsell={!!shouldShowUpsell} 
      />
    </Dialog>
  );
}

function CreditPurchaseDialog({ 
  balance, 
  purchaseCount, 
  shouldShowUpsell 
}: { 
  balance: number; 
  purchaseCount: number;
  shouldShowUpsell: boolean;
}) {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          Comprar Créditos
        </DialogTitle>
        <DialogDescription>
          Cada crédito = 1 pergunta para a Clara. Saldo atual: <strong>{balance}</strong>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 py-4">
        {creditPackages.map((pkg) => {
          const isPopular = pkg.id === "credits_20";
          return (
            <a
              key={pkg.id}
              href={pkg.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`block rounded-lg border p-4 hover:border-primary/50 transition-all ${
                isPopular ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isPopular ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <span className="font-bold text-sm">{pkg.credits}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      {pkg.credits} créditos
                      {isPopular && (
                        <Badge variant="secondary" className="text-xs">
                          Mais popular
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(pkg.price / pkg.credits).toFixed(2).replace(".", ",")} por pergunta
                    </p>
                  </div>
                </div>
                <span className="font-bold text-primary">{pkg.priceFormatted}</span>
              </div>
            </a>
          );
        })}
      </div>

      {/* Upsell to Professional after 3 purchases */}
      {shouldShowUpsell && (
        <div className="border-t border-border pt-4">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Upgrade para Professional
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Você já comprou {purchaseCount}x créditos. No plano Professional, 
                  a Clara é <strong>ilimitada</strong> + análise de XMLs, DRE e muito mais!
                </p>
                <Link to="/#planos">
                  <Button size="sm" className="mt-3 gap-2">
                    <Sparkles className="w-4 h-4" />
                    Ver plano Professional
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Pagamento seguro via Stripe. Créditos não expiram.
      </p>
    </DialogContent>
  );
}
