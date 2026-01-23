import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const Comunidade = () => {
  const { profile } = useAuth();
  const currentPlan = profile?.plano || 'FREE';
  const hasAccess = ['PROFISSIONAL', 'PREMIUM'].includes(currentPlan);

  if (!hasAccess) {
    return (
      <DashboardLayout title="Comunidade">
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Comunidade Exclusiva
              </h2>
              <p className="text-muted-foreground mb-6">
                Networking com empresários e CFOs que faturam acima de R$1M/mês.
                Disponível a partir do plano Profissional.
              </p>
              <Link to="/#planos">
                <Button className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Fazer upgrade
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Comunidade">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Comunidade Exclusiva
          </h1>
          <p className="text-muted-foreground">
            Networking com empresários e CFOs.
          </p>
        </div>

        <Card className="min-h-[400px] flex flex-col">
          <CardContent className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium text-foreground mb-2">
                Em breve
              </h3>
              <p className="text-sm text-muted-foreground">
                A comunidade está sendo preparada. Você será notificado quando estiver pronta!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Comunidade;
