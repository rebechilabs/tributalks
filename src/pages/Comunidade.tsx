import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Lock, Sparkles, ExternalLink, MessageCircle, Calendar, BookOpen, Shield } from "lucide-react";
import { ContentLibrary } from "@/components/community/ContentLibrary";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Link } from "react-router-dom";
import { usePlanAccess, PLAN_LABELS } from "@/hooks/useFeatureAccess";
import { CONFIG } from "@/config/site";

const COMMUNITY_URL = "https://chat.whatsapp.com/BbdIWJqap2FHmj90zfz5l3";

const Comunidade = () => {
  const { isNavigator, isProfessional } = usePlanAccess();

  return (
    <DashboardLayout title="Comunidade">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Comunidade</h1>
              <p className="text-muted-foreground">Networking com empresários e CFOs</p>
            </div>
          </div>
        </div>

        {/* Chatham House Rule Banner */}
        <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Chatham House Rule
              </p>
              <p className="text-sm text-muted-foreground">
                "O que é compartilhado aqui, fica aqui." Informações podem ser 
                usadas livremente, mas a identidade de quem compartilhou deve 
                ser preservada.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* WhatsApp Group - Apenas para NAVIGATOR (não PROFESSIONAL+) */}
          {isNavigator && !isProfessional ? (
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">Grupo WhatsApp</h3>
                      <Badge variant="secondary" className="text-xs">{PLAN_LABELS.NAVIGATOR}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Conecte-se com outros empresários do middle market. Compartilhe experiências, 
                      tire dúvidas e faça networking com a comunidade.
                    </p>
                    <Button asChild className="gap-2 bg-green-600 hover:bg-green-700">
                      <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer">
                        Entrar no grupo
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : !isNavigator ? (
            <LockedFeatureCard
              icon={<MessageCircle className="w-6 h-6 text-muted-foreground" />}
              title="Grupo WhatsApp"
              description="Conecte-se com outros empresários do middle market. Compartilhe experiências, tire dúvidas e faça networking com a comunidade."
              minPlan="NAVIGATOR"
            />
          ) : null}

          {/* Circle Community - PROFESSIONAL+ */}
          {isProfessional ? (
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">Comunidade Circle</h3>
                      <Badge variant="secondary" className="text-xs">{PLAN_LABELS.PROFESSIONAL}+</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Networking exclusivo para CFOs e gestores financeiros. 
                      Discussões aprofundadas e conexões estratégicas.
                    </p>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border mb-4">
                      <p className="text-xs text-muted-foreground">
                        <strong>Primeiro acesso?</strong> Use o mesmo email da sua conta TribuTalks 
                        para criar sua conta no Circle — a aprovação é automática para assinantes.
                      </p>
                    </div>
                    <Button asChild className="gap-2">
                      <a href={CONFIG.CIRCLE_COMMUNITY} target="_blank" rel="noopener noreferrer">
                        Acessar comunidade
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <LockedFeatureCard
              icon={<Users className="w-6 h-6 text-muted-foreground" />}
              title="Comunidade Circle"
              description="Networking exclusivo para CFOs e gestores financeiros. Discussões aprofundadas e conexões estratégicas."
              minPlan="PROFESSIONAL"
            />
          )}

          {/* Webinars - NAVIGATOR+ */}
          {isNavigator ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">Webinars Mensais</h3>
                      <Badge variant="secondary" className="text-xs">{PLAN_LABELS.NAVIGATOR}+</Badge>
                    </div>
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
          ) : (
            <LockedFeatureCard
              icon={<Calendar className="w-6 h-6 text-muted-foreground" />}
              title="Webinars Mensais"
              description="Sessões ao vivo exclusivas com especialistas em tributação. Temas como Split Payment, Reforma Tributária e estratégias de planejamento."
              minPlan="NAVIGATOR"
            />
          )}

          {/* Content Library - NAVIGATOR+ */}
          {isNavigator ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">Biblioteca de Conteúdos</h3>
                      <Badge variant="secondary" className="text-xs">{PLAN_LABELS.NAVIGATOR}+</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Materiais exclusivos para membros: guias, templates, checklists e webinars gravados.
                    </p>
                  </div>
                </div>
                <ContentLibrary isProfessional={isProfessional} />
              </CardContent>
            </Card>
          ) : (
            <LockedFeatureCard
              icon={<BookOpen className="w-6 h-6 text-muted-foreground" />}
              title="Biblioteca de Conteúdos"
              description="Materiais premium: guias práticos, templates de planilhas, checklists de compliance e gravações de webinars anteriores."
              minPlan="NAVIGATOR"
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

// Componente para cards bloqueados
interface LockedFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  minPlan: 'NAVIGATOR' | 'PROFESSIONAL' | 'ENTERPRISE';
  comingSoon?: boolean;
}

const LockedFeatureCard = ({ icon, title, description, minPlan, comingSoon }: LockedFeatureCardProps) => (
  <Card className="border-muted bg-muted/30">
    <CardContent className="pt-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-muted-foreground">{title}</h3>
            <Lock className="w-4 h-4 text-muted-foreground" />
            {comingSoon && (
              <Badge variant="outline">Em breve</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground/80 mb-4">
            {description}
          </p>
          <div className="flex items-center gap-3">
            <Link to="/#planos">
              <Button size="sm" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Upgrade para {PLAN_LABELS[minPlan]}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Comunidade;
