import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, CheckCircle2, Gift, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Referral {
  id: string;
  status: 'pending' | 'qualified' | 'rewarded' | 'expired' | 'cancelled';
  referred_at: string;
  subscription_started_at: string | null;
  qualified_at: string | null;
  discount_percentage: number;
}

interface ReferralListProps {
  referrals: Referral[];
  pendingCount: number;
  qualifiedCount: number;
  rewardedCount: number;
  isLoading: boolean;
}

const STATUS_CONFIG = {
  pending: {
    label: 'Aguardando',
    icon: Clock,
    variant: 'secondary' as const,
    description: 'Aguardando assinatura de plano pago',
  },
  qualified: {
    label: 'Qualificado',
    icon: CheckCircle2,
    variant: 'default' as const,
    description: 'Contando 30 dias para recompensa',
  },
  rewarded: {
    label: 'Recompensado',
    icon: Gift,
    variant: 'default' as const,
    description: 'Desconto aplicado!',
  },
  expired: {
    label: 'Expirado',
    icon: XCircle,
    variant: 'outline' as const,
    description: 'Indicação não concluída',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    variant: 'outline' as const,
    description: 'Assinatura cancelada',
  },
};

export function ReferralList({ 
  referrals, 
  pendingCount, 
  qualifiedCount, 
  rewardedCount,
  isLoading 
}: ReferralListProps) {
  const totalReferrals = referrals.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">Minhas Indicações</CardTitle>
          </div>
          <Badge variant="outline" className="text-sm">
            {totalReferrals} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-amber-500/10">
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-500/10">
            <p className="text-2xl font-bold text-blue-600">{qualifiedCount}</p>
            <p className="text-xs text-muted-foreground">Qualificados</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-500/10">
            <p className="text-2xl font-bold text-green-600">{rewardedCount}</p>
            <p className="text-xs text-muted-foreground">Recompensados</p>
          </div>
        </div>

        {/* Lista de indicações */}
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Carregando indicações...
          </div>
        ) : referrals.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">
              Você ainda não tem indicações.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Compartilhe seu código para começar!
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {referrals.map((referral) => {
              const config = STATUS_CONFIG[referral.status];
              const Icon = config.icon;

              return (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Indicação #{referral.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(referral.referred_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={config.variant}>
                    {config.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
