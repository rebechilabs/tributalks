import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Lock, Sparkles, Video } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const Consultorias = () => {
  const { profile } = useAuth();
  const currentPlan = profile?.plano || 'FREE';
  const hasAccess = currentPlan === 'PREMIUM';

  if (!hasAccess) {
    return (
      <DashboardLayout title="Consultorias">
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Consultorias com Especialistas
              </h2>
              <p className="text-muted-foreground mb-4">
                2 sessões de 30 minutos por mês com advogados tributaristas especializados.
              </p>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-muted-foreground">
                  💡 <strong className="text-foreground">O plano se paga:</strong><br />
                  2x 30min = 1h de consultoria<br />
                  Valor de mercado: ~R$1.000<br />
                  Você paga: R$500/mês total
                </p>
              </div>
              <Link to="/#planos">
                <Button className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Assinar Premium
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Consultorias">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Consultorias com Especialistas
          </h1>
          <p className="text-muted-foreground">
            Agende suas sessões mensais com advogados tributaristas.
          </p>
        </div>

        {/* Usage Info */}
        <Card className="mb-6 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sessões disponíveis este mês:</p>
                <p className="text-2xl font-bold text-foreground">2 de 2</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Próxima renovação:</p>
                <p className="text-sm font-medium text-foreground">01/02/2026</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[300px] flex flex-col">
          <CardContent className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium text-foreground mb-2">
                Agendamento em breve
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                O sistema de agendamento está sendo implementado.
              </p>
              <Button variant="outline" disabled>
                Agendar sessão
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Consultorias;
