import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Lock, Sparkles, Video, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Link } from "react-router-dom";

const CALENDLY_URL = "https://calendly.com/tributech"; // Substituir pelo link real

const Consultorias = () => {
  const { profile } = useAuth();
  const currentPlan = profile?.plano || "FREE";
  const hasAccess = currentPlan === "PREMIUM";

  // Placeholder values - would come from database
  const sessionsUsed = 0;
  const sessionsTotal = 2;
  const nextRenewal = "01/02/2026";

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
                <p className="text-sm text-muted-foreground mb-2">
                  💡 <strong className="text-foreground">O plano se paga:</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 2x 30min = 1h de consultoria</li>
                  <li>• Valor de mercado: ~R$1.000</li>
                  <li>• Você paga: <strong className="text-primary">R$500/mês</strong> total</li>
                </ul>
              </div>

              <div className="space-y-3 mb-6 text-left">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Advogados tributaristas experientes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Sessões por videoconferência</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Agendamento flexível</span>
                </div>
              </div>

              <Link to="/#planos">
                <Button className="gap-2 w-full">
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Consultorias com Especialistas</h1>
              <p className="text-muted-foreground">Agende suas sessões mensais</p>
            </div>
          </div>
        </div>

        {/* Usage Card */}
        <Card className="mb-6 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sessões disponíveis este mês:</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-foreground">{sessionsTotal - sessionsUsed}</p>
                  <span className="text-muted-foreground">de {sessionsTotal}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Próxima renovação:</p>
                <p className="text-sm font-medium text-foreground">{nextRenewal}</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all" 
                style={{ width: `${((sessionsTotal - sessionsUsed) / sessionsTotal) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Scheduling Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Agendar Consultoria</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Escolha o melhor horário para conversar com um de nossos especialistas tributaristas.
                  Cada sessão tem duração de 30 minutos.
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>30 minutos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    <span>Google Meet / Zoom</span>
                  </div>
                </div>

                <Button asChild className="gap-2">
                  <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                    <Calendar className="w-4 h-4" />
                    Agendar sessão
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-6 bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-2">💡 Dica para aproveitar melhor</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Prepare suas dúvidas com antecedência</li>
            <li>• Tenha em mãos documentos relevantes (balanço, DRE, etc)</li>
            <li>• Use o TribuBot para dúvidas rápidas e reserve a consultoria para decisões estratégicas</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Consultorias;
