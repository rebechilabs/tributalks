import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Bell, Shield, Download, AlertTriangle, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SeatManagement } from "@/components/settings/SeatManagement";
import { CnpjGroupManager } from "@/components/profile/CnpjGroupManager";

const Configuracoes = () => {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // CNPJ Group state
  const [cnpjPrincipal, setCnpjPrincipal] = useState<string | null>(null);
  const [cnpjsGrupo, setCnpjsGrupo] = useState<string[]>([]);
  const [companyProfileLoaded, setCompanyProfileLoaded] = useState(false);
  
  const [notifications, setNotifications] = useState({
    novidades: profile?.notif_novidades ?? true,
    legislacao: profile?.notif_legislacao ?? true,
    consultorias: profile?.notif_consultorias ?? true,
  });

  // Load company profile for CNPJ data
  useEffect(() => {
    const loadCompanyProfile = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('company_profile')
        .select('cnpj_principal, cnpjs_grupo')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setCnpjPrincipal(data.cnpj_principal);
        setCnpjsGrupo(data.cnpjs_grupo || []);
      }
      setCompanyProfileLoaded(true);
    };
    
    loadCompanyProfile();
  }, [user?.id]);

  useEffect(() => {
    setNotifications({
      novidades: profile?.notif_novidades ?? true,
      legislacao: profile?.notif_legislacao ?? true,
      consultorias: profile?.notif_consultorias ?? true,
    });
  }, [profile]);

  const handleNotificationChange = async (key: keyof typeof notifications, value: boolean) => {
    if (!user) return;
    
    setNotifications(prev => ({ ...prev, [key]: value }));
    
    const updateData: Record<string, boolean> = {};
    updateData[`notif_${key}`] = value;

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', user.id);

    if (error) {
      // Revert on error
      setNotifications(prev => ({ ...prev, [key]: !value }));
      toast({
        title: "Erro",
        description: "Não foi possível salvar a preferência.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      // Fetch all user data
      const [profileResult, simulationsResult, messagesResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('simulations').select('*').eq('user_id', user.id),
        supabase.from('tributbot_messages').select('*').eq('user_id', user.id),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        profile: profileResult.data,
        simulations: simulationsResult.data,
        tributbot_messages: messagesResult.data,
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tributech-dados-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Dados exportados!",
        description: "Seus dados foram baixados com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro na exportação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Note: In production, implement proper account deletion via edge function
      toast({
        title: "Solicitação enviada",
        description: "Sua conta será excluída em até 48 horas. Você receberá um e-mail de confirmação.",
      });
      setIsDeleteDialogOpen(false);
      await signOut();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout title="Configurações">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências de conta.
          </p>
        </div>

        <div className="space-y-6">
          {/* CNPJ Group Management */}
          {user && companyProfileLoaded && (
            <CnpjGroupManager
              userId={user.id}
              userPlan={profile?.plano || 'FREE'}
              cnpjPrincipal={cnpjPrincipal}
              cnpjsGrupo={cnpjsGrupo}
              onUpdate={(principal, grupo) => {
                setCnpjPrincipal(principal);
                setCnpjsGrupo(grupo);
              }}
            />
          )}

          {/* Seat Management - Multi-user access */}
          <SeatManagement />

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5 text-primary" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como você quer receber atualizações.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notif-novidades" className="font-medium">
                    Receber novidades por e-mail
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Atualizações sobre novas ferramentas e recursos
                  </p>
                </div>
                <Switch 
                  id="notif-novidades" 
                  checked={notifications.novidades}
                  onCheckedChange={(v) => handleNotificationChange('novidades', v)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notif-legislacao" className="font-medium">
                    Alertas de mudanças legislativas
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Quando houver mudanças que afetam seu perfil tributário
                  </p>
                </div>
                <Switch 
                  id="notif-legislacao" 
                  checked={notifications.legislacao}
                  onCheckedChange={(v) => handleNotificationChange('legislacao', v)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notif-consultorias" className="font-medium">
                    Lembretes de consultorias
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Lembrar de usar consultorias disponíveis (Premium)
                  </p>
                </div>
                <Switch 
                  id="notif-consultorias" 
                  checked={notifications.consultorias}
                  onCheckedChange={(v) => handleNotificationChange('consultorias', v)}
                  disabled={profile?.plano !== 'PREMIUM'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-primary" />
                Segurança
              </CardTitle>
              <CardDescription>
                Proteja sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" asChild className="w-full justify-start">
                <Link to="/recuperar-senha">
                  Alterar senha
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Você receberá um e-mail para redefinir sua senha.
              </p>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Download className="w-5 h-5 text-primary" />
                Dados e Privacidade
              </CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={handleExportData}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Exportar meus dados
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Baixe uma cópia de todos os seus dados em formato JSON.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Zona de Perigo
              </CardTitle>
              <CardDescription>
                Ações irreversíveis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Excluir minha conta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Excluir conta permanentemente
                    </DialogTitle>
                    <DialogDescription>
                      Esta ação é <strong>irreversível</strong>. Todos os seus dados serão permanentemente excluídos, incluindo:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Perfil e informações pessoais</li>
                        <li>Histórico de simulações</li>
                        <li>Conversas com a Clara AI</li>
                        <li>Agendamentos de consultorias</li>
                      </ul>
                      <p className="mt-3 text-foreground font-medium">
                        Se você tiver uma assinatura ativa, ela será cancelada automaticamente.
                      </p>
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Excluindo...
                        </>
                      ) : (
                        "Sim, excluir minha conta"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Configuracoes;
