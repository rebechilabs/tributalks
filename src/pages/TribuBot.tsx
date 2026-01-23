import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Lock, Sparkles, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const TribuBot = () => {
  const { profile } = useAuth();
  const currentPlan = profile?.plano || 'FREE';
  const hasAccess = currentPlan !== 'FREE';

  if (!hasAccess) {
    return (
      <DashboardLayout title="TribuBot">
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                TribuBot — IA 24/7
              </h2>
              <p className="text-muted-foreground mb-6">
                Tire dúvidas tributárias em linguagem simples, a qualquer hora.
                Disponível a partir do plano Básico.
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
    <DashboardLayout title="TribuBot">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            TribuBot — IA 24/7
          </h1>
          <p className="text-muted-foreground">
            Tire dúvidas tributárias em linguagem simples.
          </p>
        </div>

        <Card className="min-h-[500px] flex flex-col">
          <CardContent className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium text-foreground mb-2">
                Chat em desenvolvimento
              </h3>
              <p className="text-sm text-muted-foreground">
                O TribuBot estará disponível em breve. Fique ligado!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TribuBot;
