import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Lock, Sparkles, ExternalLink, MessageCircle, Calendar, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Link } from "react-router-dom";

const COMMUNITY_URL = "https://chat.whatsapp.com/BbdIWJqap2FHmj90zfz5l3";

const Comunidade = () => {
  const { profile } = useAuth();
  const currentPlan = profile?.plano || "FREE";
  const hasAccess = ["PROFESSIONAL", "PROFISSIONAL", "PREMIUM", "ENTERPRISE"].includes(currentPlan.toUpperCase());

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
              <p className="text-muted-foreground mb-4">
                Networking com empresários e CFOs que faturam acima de R$1M/mês.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span>Grupo exclusivo no WhatsApp</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Webinars mensais com especialistas</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Conteúdos exclusivos sobre tributação</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Disponível a partir do plano <strong>Profissional</strong>.
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Comunidade Exclusiva</h1>
              <p className="text-muted-foreground">Networking com empresários e CFOs</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* WhatsApp Group */}
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Grupo WhatsApp</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Conecte-se com outros empresários do middle market. Compartilhe experiências, 
                    tire dúvidas e faça networking.
                  </p>
                  <Button asChild className="gap-2">
                    <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer">
                      Entrar no grupo
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Webinars */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Webinars Mensais</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Participe de sessões ao vivo com especialistas em tributação.
                    Próximos temas incluem Split Payment, Reforma Tributária e mais.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-foreground font-medium">Próximo webinar:</p>
                    <p className="text-sm text-muted-foreground">
                      "Preparando seu caixa para o Split Payment" — Em breve
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Library */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Biblioteca de Conteúdos</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Acesse materiais exclusivos: guias, planilhas, checklists e mais.
                  </p>
                  <Button variant="outline" disabled className="gap-2">
                    Em breve
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Comunidade;
