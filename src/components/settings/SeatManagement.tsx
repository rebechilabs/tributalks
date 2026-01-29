import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Crown, 
  Loader2, 
  Trash2, 
  Mail, 
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/useFeatureAccess";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CONFIG } from "@/config/site";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Seat {
  id: string;
  member_email: string;
  member_user_id: string | null;
  role: string;
  status: string;
  invited_at: string;
  accepted_at: string | null;
}

// Seat configuration per plan
const SEAT_CONFIG: Record<string, { included: number; canBuyExtra: boolean; extraPrice?: number }> = {
  FREE: { included: 1, canBuyExtra: false },
  NAVIGATOR: { included: 1, canBuyExtra: false },
  PROFESSIONAL: { included: 3, canBuyExtra: true, extraPrice: 250 },
  ENTERPRISE: { included: 10, canBuyExtra: true, extraPrice: 200 },
};

export function SeatManagement() {
  const { user, profile } = useAuth();
  const { currentPlan, isProfessional } = usePlanAccess();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const planConfig = SEAT_CONFIG[currentPlan] || SEAT_CONFIG.FREE;
  const extraSeats = (profile as any)?.extra_seats_purchased || 0;
  const maxSeats = planConfig.included + extraSeats;
  const activeSeats = seats.filter(s => s.status !== 'revoked').length;
  const availableSeats = maxSeats - activeSeats - 1; // -1 for owner

  useEffect(() => {
    if (user) {
      fetchSeats();
    }
  }, [user]);

  const fetchSeats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('organization_seats')
        .select('*')
        .eq('owner_id', user.id)
        .neq('status', 'revoked')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSeats((data as Seat[]) || []);
    } catch (error: any) {
      console.error('Error fetching seats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!user || !inviteEmail.trim()) return;
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, insira um e-mail válido.",
        variant: "destructive",
      });
      return;
    }

    // Check if seat is available
    if (availableSeats <= 0) {
      toast({
        title: "Limite atingido",
        description: "Você atingiu o limite de assentos. Compre assentos extras para convidar mais membros.",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    try {
      const { error } = await supabase
        .from('organization_seats')
        .insert({
          owner_id: user.id,
          member_email: inviteEmail.toLowerCase().trim(),
          role: 'member',
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este e-mail já foi convidado.');
        }
        throw error;
      }

      toast({
        title: "Convite enviado!",
        description: `${inviteEmail} foi convidado para sua equipe.`,
      });

      setInviteEmail("");
      setIsDialogOpen(false);
      fetchSeats();
    } catch (error: any) {
      toast({
        title: "Erro ao convidar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevoke = async (seatId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('organization_seats')
        .update({ status: 'revoked' })
        .eq('id', seatId);

      if (error) throw error;

      toast({
        title: "Acesso revogado",
        description: `O acesso de ${email} foi removido.`,
      });

      fetchSeats();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="gap-1"><CheckCircle className="w-3 h-3" /> Ativo</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> Pendente</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><XCircle className="w-3 h-3" /> {status}</Badge>;
    }
  };

  // Only show for Professional+ plans
  if (!isProfessional) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-primary" />
            Equipe e Assentos
          </CardTitle>
          <CardDescription>
            Convide sua equipe para acessar a plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Acesso Multi-Usuário</h4>
              <p className="text-sm text-muted-foreground mt-1">
                No plano Professional, você pode convidar até <strong>3 membros</strong> da sua equipe (CEO, CFO, Contador) para acessar os mesmos dados da empresa.
              </p>
            </div>
            <Button asChild>
              <a href="/#planos">
                Ver planos <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-primary" />
          Equipe e Assentos
        </CardTitle>
        <CardDescription>
          Gerencie quem pode acessar seus dados na plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seat Counter */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <div className="text-sm text-muted-foreground">Assentos utilizados</div>
            <div className="text-2xl font-bold">
              {activeSeats + 1} <span className="text-lg font-normal text-muted-foreground">/ {maxSeats}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {planConfig.included} inclusos no plano{extraSeats > 0 && ` + ${extraSeats} extras`}
            </div>
          </div>
          
          {planConfig.canBuyExtra && (
            <Button variant="outline" size="sm" asChild>
              <a 
                href={currentPlan === 'ENTERPRISE' 
                  ? `${CONFIG.STRIPE_PAYMENT_LINKS.SEAT_ENTERPRISE}?prefilled_email=${encodeURIComponent(user?.email || '')}`
                  : `${CONFIG.STRIPE_PAYMENT_LINKS.SEAT_PROFESSIONAL}?prefilled_email=${encodeURIComponent(user?.email || '')}`
                } 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                + Assento (R$ {planConfig.extraPrice}/mês)
              </a>
            </Button>
          )}
        </div>

        {/* Owner */}
        <div className="space-y-3">
          <Label className="text-xs uppercase text-muted-foreground tracking-wider">Proprietário</Label>
          <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">{profile?.nome || 'Você'}</div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
              </div>
            </div>
            <Badge>Proprietário</Badge>
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase text-muted-foreground tracking-wider">Membros da Equipe</Label>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={availableSeats <= 0}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Convidar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Convidar membro da equipe</DialogTitle>
                  <DialogDescription>
                    O convidado receberá acesso aos mesmos dados da empresa (DRE, Score, Oportunidades, etc).
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail do convidado</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="cfo@empresa.com.br"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O convidado precisará criar uma conta com este e-mail para acessar.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleInvite} disabled={isInviting || !inviteEmail.trim()}>
                    {isInviting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Convidando...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar convite
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : seats.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum membro convidado ainda.</p>
              <p className="text-xs mt-1">Você tem {availableSeats} assento(s) disponível(is).</p>
            </div>
          ) : (
            <div className="space-y-2">
              {seats.map((seat) => (
                <div 
                  key={seat.id} 
                  className="flex items-center justify-between p-3 border rounded-lg bg-background"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{seat.member_email}</div>
                      <div className="text-xs text-muted-foreground">
                        Convidado em {new Date(seat.invited_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(seat.status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRevoke(seat.id, seat.member_email)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          💡 <strong>Dica:</strong> Membros convidados podem visualizar e editar os dados da empresa, mas não podem gerenciar a assinatura ou convidar novos membros.
        </p>
      </CardContent>
    </Card>
  );
}