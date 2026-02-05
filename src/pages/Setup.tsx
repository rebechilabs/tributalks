import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Building2, User, ArrowRight, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/contexts/CompanyContext";
import { usePlanAccess, PLAN_LABELS, CNPJ_LIMITS } from "@/hooks/useFeatureAccess";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CompanySetupCard } from "@/components/setup/CompanySetupCard";
import { CompanySetupForm } from "@/components/setup/CompanySetupForm";
import logoTributalks from "@/assets/logo-tributalks.png";

export default function Setup() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { companies, maxCompanies, canAddMore, isLoading: companiesLoading, refetch } = useCompany();
  const { currentPlan } = usePlanAccess();
  
  const [userName, setUserName] = useState(profile?.nome || "");
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if setup already complete
  useEffect(() => {
    if (profile?.setup_complete) {
      navigate('/welcome', { replace: true });
    }
  }, [profile?.setup_complete, navigate]);

  // Pre-fill user data from profile
  useEffect(() => {
    if (profile) {
      setUserName(profile.nome || "");
    }
  }, [profile]);

  const canContinue = companies.length >= 1 && userName.trim().length > 2;

  const handleContinue = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: userName.trim(),
          setup_complete: true,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Configuração salva com sucesso!");
      navigate('/welcome');
    } catch (err: any) {
      console.error('Error saving setup:', err);
      toast.error("Erro ao salvar configuração");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompanyAdded = () => {
    setIsAddingCompany(false);
    refetch();
  };

  const limitText = maxCompanies === 999 ? "ilimitadas" : maxCompanies.toString();

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <img src={logoTributalks} alt="TribuTalks" className="h-8" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">Passo 1 de 2</span>
            <Progress value={50} className="w-20 h-2" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Configure seu ambiente
          </h1>
          <p className="text-muted-foreground">
            Preencha seus dados e cadastre suas empresas para começar
          </p>
        </div>

        {/* User Info Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Seus Dados
            </CardTitle>
            <CardDescription>
              Informações básicas para personalizar sua experiência
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Nome completo *</Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
          </CardContent>
        </Card>

        {/* Companies Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Suas Empresas
                </CardTitle>
                <CardDescription className="mt-1">
                  Cadastre pelo menos 1 CNPJ para continuar
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-primary">
                  {companies.length} de {limitText}
                </span>
                <p className="text-xs text-muted-foreground">
                  Plano {PLAN_LABELS[currentPlan]}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing companies */}
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
                        onRemove={companies.length > 1 ? () => {} : undefined}
                        onEdit={() => {}}
                      />
                    ))}
                  </div>
                )}

                {/* Add company form or button */}
                {isAddingCompany ? (
                  <CompanySetupForm
                    onSuccess={handleCompanyAdded}
                    onCancel={() => setIsAddingCompany(false)}
                  />
                ) : (
                  canAddMore && (
                    <Button
                      variant="outline"
                      className="w-full border-dashed border-2 h-16"
                      onClick={() => setIsAddingCompany(true)}
                    >
                      <Building2 className="h-5 w-5 mr-2" />
                      {companies.length === 0 ? "Adicionar sua primeira empresa" : "Adicionar outra empresa"}
                    </Button>
                  )
                )}

                {/* Limit reached message */}
                {!canAddMore && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Você atingiu o limite de {maxCompanies} empresa{maxCompanies > 1 ? 's' : ''} do plano {PLAN_LABELS[currentPlan]}.{' '}
                      <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/upgrade')}>
                        Faça upgrade
                      </Button>{' '}
                      para adicionar mais.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {/* Help text - More visible alert */}
            {companies.length > 0 && (
              <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>Quer adicionar mais empresas depois?</strong>
                  <br />
                  Você pode fazer isso a qualquer momento pelo{' '}
                  <strong>seletor no topo da tela</strong> ou em{' '}
                  <strong>Perfil → Minhas Empresas</strong>.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Continue button */}
        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            className="w-full sm:w-auto px-8"
            onClick={handleContinue}
            disabled={!canContinue || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                Continuar para Boas-vindas
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
          
          {!canContinue && (
            <p className="text-sm text-muted-foreground">
              {userName.trim().length < 3 && "Preencha seu nome"}
              {userName.trim().length >= 3 && companies.length === 0 && "Adicione pelo menos uma empresa"}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

