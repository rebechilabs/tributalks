import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReferralProgressProps {
  successfulReferrals: number;
  currentDiscount: number;
  nextLevel: { referralsNeeded: number; discount: number } | null;
}

const DISCOUNT_LEVELS = [
  { referrals: 1, discount: 5 },
  { referrals: 3, discount: 10 },
  { referrals: 5, discount: 15 },
  { referrals: 10, discount: 20 },
];

export function ReferralProgress({ 
  successfulReferrals, 
  currentDiscount, 
  nextLevel 
}: ReferralProgressProps) {
  // Calcula progresso para o próximo nível
  const getProgressToNextLevel = () => {
    if (!nextLevel) return 100;
    
    const prevLevel = DISCOUNT_LEVELS.find(l => l.discount < nextLevel.discount);
    const prevReferrals = prevLevel?.referrals || 0;
    const range = nextLevel.referralsNeeded - prevReferrals;
    const progress = successfulReferrals - prevReferrals;
    
    return Math.min(100, (progress / range) * 100);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <CardTitle className="text-lg">Seus Benefícios</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Desconto atual */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5">
          <div>
            <p className="text-sm text-muted-foreground">Desconto atual</p>
            <p className="text-3xl font-bold text-primary">{currentDiscount}%</p>
          </div>
          <Star className="w-10 h-10 text-primary/30" />
        </div>

        {/* Progresso para próximo nível */}
        {nextLevel ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {successfulReferrals} de {nextLevel.referralsNeeded} indicações
              </span>
              <span className="font-medium text-primary flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Próximo: {nextLevel.discount}%
              </span>
            </div>
            <Progress value={getProgressToNextLevel()} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Faltam {nextLevel.referralsNeeded - successfulReferrals} indicações qualificadas para o próximo nível
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-700 font-medium flex items-center gap-2">
              <Star className="w-4 h-4" />
              Parabéns! Você atingiu o desconto máximo de 20%!
            </p>
          </div>
        )}

        {/* Níveis de desconto */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Níveis de desconto:</p>
          <div className="grid grid-cols-4 gap-2">
            {DISCOUNT_LEVELS.map((level) => {
              const isAchieved = successfulReferrals >= level.referrals;
              const isCurrent = currentDiscount === level.discount;
              
              return (
                <div
                  key={level.discount}
                  className={cn(
                    "text-center p-2 rounded-lg border transition-colors",
                    isAchieved 
                      ? "bg-primary/10 border-primary/30 text-primary" 
                      : "bg-muted/50 border-border text-muted-foreground",
                    isCurrent && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  <p className="text-lg font-bold">{level.discount}%</p>
                  <p className="text-xs">{level.referrals}+ ind.</p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
