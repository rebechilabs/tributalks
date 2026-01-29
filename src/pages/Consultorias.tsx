import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Crown, 
  ArrowRight, 
  MessageSquare, 
  Users, 
  Calendar, 
  Shield,
  Sparkles,
  Phone,
  CheckCircle2
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/useFeatureAccess";

const WHATSAPP_ENTERPRISE = "https://wa.me/5511914523971?text=Olá!%20Tenho%20interesse%20no%20plano%20Enterprise%20da%20TribuTalks%20para%20consultorias%20com%20advogados%20tributaristas.";

export default function Consultorias() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { isEnterprise } = usePlanAccess();
  const [countdown, setCountdown] = useState(10);

  // Auto-redirect for non-enterprise users after countdown
  useEffect(() => {
    if (isEnterprise) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/#planos");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isEnterprise, navigate]);

  // Enterprise users see the consultancy scheduling interface
  if (isEnterprise) {
    return (
      <DashboardLayout title="Consultorias Enterprise">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Consultorias Ilimitadas</CardTitle>
                  <p className="text-muted-foreground">
                    Seu benefício exclusivo do plano Enterprise
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Advogados Tributaristas</p>
                    <p className="text-sm text-muted-foreground">
                      Acesso direto ao time da Rebechi & Silva
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Agenda Flexível</p>
                    <p className="text-sm text-muted-foreground">
                      Horários que se adaptam à sua rotina
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Sem Limites</p>
                    <p className="text-sm text-muted-foreground">
                      Quantas sessões precisar, quando precisar
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Sigilo Total</p>
                    <p className="text-sm text-muted-foreground">
                      Informações protegidas por sigilo profissional
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button asChild size="lg" className="w-full gap-2">
                  <a href={WHATSAPP_ENTERPRISE} target="_blank" rel="noopener noreferrer">
                    <Phone className="w-4 h-4" />
                    Agendar Consultoria via WhatsApp
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Atendimento prioritário • Resposta em até 2 horas úteis
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Dica da Clara
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Antes da sua consultoria, recomendo executar o <strong>Workflow de Diagnóstico</strong> e 
                importar seus <strong>XMLs fiscais</strong>. Assim, nossos especialistas terão uma visão 
                completa da sua situação tributária e poderão oferecer orientações mais precisas.
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/workflows')}>
                  Executar Workflows
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/importar-xml')}>
                  Importar XMLs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Non-enterprise users see upgrade prompt
  return (
    <DashboardLayout title="Consultorias">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className="border-2 border-primary/20 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b">
            <div className="flex items-center gap-2 text-primary">
              <Crown className="w-5 h-5" />
              <span className="font-semibold">Exclusivo Plano Enterprise</span>
            </div>
          </div>
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Consultorias com Advogados Tributaristas
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              No plano Enterprise, você tem acesso ilimitado a sessões de consultoria com 
              advogados especializados da Rebechi & Silva para orientação tributária estratégica.
            </p>

            <ul className="text-left text-sm space-y-3 mb-8 max-w-sm mx-auto">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Consultorias ilimitadas (sem limite mensal)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Advogados tributaristas especializados</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Reuniões estratégicas mensais</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Suporte prioritário em todas as demandas</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>White Label (logo e cores personalizadas)</span>
              </li>
            </ul>

            <div className="space-y-3">
              <Button asChild size="lg" className="w-full gap-2">
                <a href={WHATSAPP_ENTERPRISE} target="_blank" rel="noopener noreferrer">
                  <Phone className="w-4 h-4" />
                  Falar com Comercial via WhatsApp
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/#planos">
                  Ver todos os planos
                </Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Redirecionando para planos em {countdown} segundos...
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
