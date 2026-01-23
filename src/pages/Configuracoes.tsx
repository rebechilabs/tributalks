import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Shield, CreditCard, Palette, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Configuracoes = () => {
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
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-updates">Novidades por e-mail</Label>
                <Switch id="email-updates" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="simulation-alerts">Alertas de simulação</Label>
                <Switch id="simulation-alerts" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="legal-updates">Atualizações legislativas</Label>
                <Switch id="legal-updates" defaultChecked />
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
              <Button variant="outline" className="w-full justify-start">
                Alterar senha
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Sessões ativas
              </Button>
            </CardContent>
          </Card>

          {/* Billing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5 text-primary" />
                Assinatura
              </CardTitle>
              <CardDescription>
                Gerencie seu plano e pagamentos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Plano atual</p>
                  <p className="text-sm text-muted-foreground">Grátis</p>
                </div>
                <Button size="sm">Fazer upgrade</Button>
              </div>
              <Button variant="outline" className="w-full justify-start">
                Histórico de faturas
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
              <CardDescription>
                Ações irreversíveis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full">
                Excluir minha conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Configuracoes;
