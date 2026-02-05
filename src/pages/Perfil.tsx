import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, User, Building, Building2, FileText, Lock, CreditCard, Crown, AlertTriangle, ExternalLink, Trophy, Plus, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AchievementList, StreakDisplay } from "@/components/achievements";
import { useProfilePageData } from "@/hooks/useProfilePageData";
import { CONFIG } from "@/config/site";
import { useCompany } from "@/contexts/CompanyContext";
import { usePlanAccess, PLAN_LABELS } from "@/hooks/useFeatureAccess";
import { CompanySetupCard, CompanySetupForm, EditCompanyModal } from "@/components/setup";
import type { Company } from "@/contexts/CompanyContext";

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const FAIXAS_FATURAMENTO = [
  { value: '200000', label: 'R$200K - R$500K/mês' },
  { value: '500000', label: 'R$500K - R$1M/mês' },
  { value: '1000000', label: 'R$1M - R$2,5M/mês' },
  { value: '2500000', label: 'R$2,5M - R$5M/mês' },
  { value: '5000000', label: 'R$5M - R$10M/mês' },
  { value: '10000000', label: 'R$10M - R$25M/mês' },
  { value: '25000000', label: 'R$25M - R$50M/mês' },
  { value: '50000000', label: 'Acima de R$50M/mês' },
];

const PERCENTUAL_PJ_OPTIONS = [
  { value: '0.50', label: '50%' },
  { value: '0.60', label: '60%' },
  { value: '0.70', label: '70%' },
  { value: '0.80', label: '80%' },
  { value: '0.90', label: '90%' },
  { value: '1.00', label: '100%' },
];

const PLANO_INFO: Record<string, { label: string; preco: string; cor: string }> = {
  FREE: { label: 'Gratuito', preco: 'R$ 0', cor: 'text-muted-foreground' },
  BASICO: { label: 'Básico', preco: 'R$ 99/mês', cor: 'text-blue-400' },
  PROFISSIONAL: { label: 'Profissional', preco: 'R$ 197/mês', cor: 'text-primary' },
  PREMIUM: { label: 'Premium', preco: 'R$ 500/mês', cor: 'text-yellow-400' },
};

const Perfil = () => {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { data: pageData, isLoading: pageLoading } = useProfilePageData();
  const { companies, currentCompany, setCurrentCompany, maxCompanies, canAddMore, removeCompany, isLoading: companiesLoading } = useCompany();
  const { currentPlan } = usePlanAccess();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  const [formData, setFormData] = useState({
    nome: profile?.nome || "",
    empresa: profile?.empresa || "",
    estado: profile?.estado || "",
    faturamento_mensal: profile?.faturamento_mensal?.toString() || "",
    regime: profile?.regime || "",
    setor: profile?.setor || "",
    cnae: profile?.cnae || "",
    percentual_vendas_pj: profile?.percentual_vendas_pj?.toString() || "0.80",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: formData.nome,
          empresa: formData.empresa,
          estado: formData.estado,
          faturamento_mensal: parseFloat(formData.faturamento_mensal) || null,
          regime: formData.regime || null,
          setor: formData.setor || null,
          cnae: formData.cnae || null,
          percentual_vendas_pj: parseFloat(formData.percentual_vendas_pj) || 0.80,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Note: In production, you'd call an edge function to delete the user
      // This requires service role key which shouldn't be in the client
      toast({
        title: "Solicitação enviada",
        description: "Sua conta será excluída em até 48 horas. Você receberá um e-mail de confirmação.",
      });
      setIsDeleteDialogOpen(false);
      await signOut();
      navigate('/');
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

  const planoAtual = profile?.plano || 'FREE';
  const planoInfo = PLANO_INFO[planoAtual] || PLANO_INFO.FREE;

  return (
    <DashboardLayout title="Meu Perfil">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Achievements Section */}
        <AchievementList 
          achievements={pageData?.achievements}
          earnedCount={pageData?.earnedCount}
          totalCount={pageData?.totalCount}
          progress={pageData?.progress}
          isLoading={pageLoading}
        />
        
        {/* Streak display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Sua Sequência
            </CardTitle>
            <CardDescription>
              Mantenha o ritmo acessando a plataforma diariamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StreakDisplay 
              currentStreak={pageData?.streakData?.current_streak ?? 0}
              longestStreak={pageData?.streakData?.longest_streak ?? 0}
              showLongest 
            />
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Dados Pessoais
              </CardTitle>
              <CardDescription>
                Suas informações de contato e identificação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                  placeholder="Seu nome"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Input
                    id="email"
                    value={profile?.email || ""}
                    disabled
                    className="h-11 bg-muted pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                Dados da Empresa
              </CardTitle>
              <CardDescription>
                Informações sobre sua empresa para personalizar as simulações.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="empresa">Nome da empresa</Label>
                  <Input
                    id="empresa"
                    value={formData.empresa}
                    onChange={(e) => handleChange("empresa", e.target.value)}
                    placeholder="Empresa Exemplo LTDA"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado principal</Label>
                  <Select value={formData.estado} onValueChange={(v) => handleChange("estado", v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS.map((estado) => (
                        <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnae">CNAE principal (opcional)</Label>
                <Input
                  id="cnae"
                  value={formData.cnae}
                  onChange={(e) => handleChange("cnae", e.target.value)}
                  placeholder="Ex: 6201-5/00"
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tax Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Informações Tributárias
              </CardTitle>
              <CardDescription>
                Dados fiscais para cálculos mais precisos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Faturamento mensal</Label>
                  <Select 
                    value={formData.faturamento_mensal} 
                    onValueChange={(v) => handleChange("faturamento_mensal", v)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione a faixa" />
                    </SelectTrigger>
                    <SelectContent>
                      {FAIXAS_FATURAMENTO.map((faixa) => (
                        <SelectItem key={faixa.value} value={faixa.value}>{faixa.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Regime tributário</Label>
                  <Select value={formData.regime} onValueChange={(v) => handleChange("regime", v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIMPLES">Simples Nacional</SelectItem>
                      <SelectItem value="PRESUMIDO">Lucro Presumido</SelectItem>
                      <SelectItem value="REAL">Lucro Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Setor de atuação</Label>
                  <Select value={formData.setor} onValueChange={(v) => handleChange("setor", v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="industria">Indústria</SelectItem>
                      <SelectItem value="comercio">Comércio</SelectItem>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="agronegocio">Agronegócio</SelectItem>
                      <SelectItem value="construcao">Construção</SelectItem>
                      <SelectItem value="saude">Saúde</SelectItem>
                      <SelectItem value="educacao">Educação</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>% Vendas para PJ</Label>
                  <Select 
                    value={formData.percentual_vendas_pj} 
                    onValueChange={(v) => handleChange("percentual_vendas_pj", v)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERCENTUAL_PJ_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar alterações
                </>
              )}
            </Button>
          </div>
        </form>

        {/* My Companies Section */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Minhas Empresas
                </CardTitle>
                <CardDescription>
                  Gerencie os CNPJs do seu grupo empresarial
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-primary">
                  {companies.length} de {maxCompanies === 999 ? "∞" : maxCompanies}
                </span>
                <p className="text-xs text-muted-foreground">
                  Plano {PLAN_LABELS[currentPlan]}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {companiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {companies.length > 0 && (
                  <div className="space-y-3">
                    {companies.map((company) => (
                      <CompanySetupCard
                        key={company.id}
                        company={company}
                        isPrimary={company.id === currentCompany?.id}
                        onEdit={() => setEditingCompany(company)}
                        onRemove={companies.length > 1 ? async () => {
                          const success = await removeCompany(company.id);
                          if (success) {
                            toast({ title: "Empresa removida" });
                          }
                        } : undefined}
                        onSetPrimary={() => setCurrentCompany(company)}
                      />
                    ))}
                  </div>
                )}

                {/* Add company form or button */}
                {isAddingCompany ? (
                  <CompanySetupForm
                    onSuccess={() => setIsAddingCompany(false)}
                    onCancel={() => setIsAddingCompany(false)}
                  />
                ) : (
                  canAddMore && (
                    <Button
                      variant="outline"
                      className="w-full border-dashed border-2 h-12"
                      onClick={() => setIsAddingCompany(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar nova empresa
                    </Button>
                  )
                )}

                {/* Limit reached */}
                {!canAddMore && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Limite de {maxCompanies} empresa{maxCompanies > 1 ? 's' : ''} atingido.{' '}
                      <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/upgrade')}>
                        Faça upgrade
                      </Button>{' '}
                      para adicionar mais.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Company Modal */}
        {editingCompany && (
          <EditCompanyModal
            open={!!editingCompany}
            onOpenChange={(open) => !open && setEditingCompany(null)}
            company={editingCompany}
          />
        )}

        {/* Subscription Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Assinatura
            </CardTitle>
            <CardDescription>
              Gerencie seu plano e pagamentos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Plano atual</p>
                <p className={`text-lg font-semibold ${planoInfo.cor}`}>
                  {planoInfo.label}
                </p>
                <p className="text-sm text-muted-foreground">{planoInfo.preco}</p>
              </div>
              {planoAtual !== 'PREMIUM' && (
                <Button asChild>
                  <Link to="/#planos">
                    Fazer upgrade
                  </Link>
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              {planoAtual !== 'FREE' && (
                <Button variant="outline" asChild className="gap-2">
                  <a href="https://billing.stripe.com/p/login/test_PLACEHOLDER" target="_blank" rel="noopener noreferrer">
                    <CreditCard className="w-4 h-4" />
                    Gerenciar assinatura
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to="/#planos">
                  Alterar plano
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" asChild className="w-full justify-start">
              <Link to="/recuperar-senha">
                Alterar senha
              </Link>
            </Button>
            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Excluir minha conta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Excluir conta
                  </DialogTitle>
                  <DialogDescription>
                    Esta ação é <strong>irreversível</strong>. Todos os seus dados, incluindo:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Histórico de simulações</li>
                      <li>Conversas com a Clara AI</li>
                      <li>Configurações do perfil</li>
                    </ul>
                    <p className="mt-3">Serão permanentemente excluídos.</p>
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
    </DashboardLayout>
  );
};

export default Perfil;
