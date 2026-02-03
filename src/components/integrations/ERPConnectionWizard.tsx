import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Eye,
  EyeOff,
  ExternalLink
} from "lucide-react";

interface ERPInfo {
  name: string;
  description: string;
  logo: string;
  color: string;
  fields: { key: string; label: string; type: string; placeholder: string }[];
  useOAuth?: boolean;
}

interface ERPConnectionWizardProps {
  open: boolean;
  onClose: () => void;
  selectedERP: string | null;
  erpInfo: Record<string, ERPInfo>;
}

const SYNC_MODULES = [
  { key: "nfe", label: "Notas Fiscais (NF-e)", description: "Importar XMLs para análise de créditos" },
  { key: "produtos", label: "Produtos e NCMs", description: "Classificação tributária automática" },
  { key: "financeiro", label: "Financeiro", description: "Alimentar DRE e Score Tributário" },
  { key: "empresa", label: "Dados da Empresa", description: "Atualizar perfil e identificar oportunidades" },
];

// ERPs that use OAuth 2.0 flow
const OAUTH_ERPS = ['contaazul'];

export function ERPConnectionWizard({ 
  open, 
  onClose, 
  selectedERP: initialERP,
  erpInfo 
}: ERPConnectionWizardProps) {
  const [step, setStep] = useState(initialERP ? 2 : 1);
  const [selectedERP, setSelectedERP] = useState<string | null>(initialERP);
  const [connectionName, setConnectionName] = useState("");
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [selectedModules, setSelectedModules] = useState(["nfe", "produtos", "financeiro", "empresa"]);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isStartingOAuth, setIsStartingOAuth] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Standard credential-based connection
  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke("erp-connection", {
        method: "POST",
        body: {
          erp_type: selectedERP,
          connection_name: connectionName || erpInfo[selectedERP!]?.name || selectedERP,
          credentials,
          sync_config: {
            modules: selectedModules,
            frequency_hours: 24,
            auto_sync: true
          }
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["erp-connections"] });
      
      if (data.validation?.valid) {
        toast({
          title: "Conexão estabelecida!",
          description: `${erpInfo[selectedERP!]?.name} conectado com sucesso.`,
        });
      } else {
        toast({
          title: "Conexão criada com ressalvas",
          description: data.validation?.message || "Verifique as credenciais.",
          variant: "destructive",
        });
      }
      
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao conectar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // OAuth 2.0 flow for Conta Azul
  const startOAuthFlow = async () => {
    if (!selectedERP) return;

    setIsStartingOAuth(true);

    try {
      // Força URL de produção para corresponder ao cadastro no Portal do Desenvolvedor
      const redirectUri = 'https://tributechai.lovable.app/oauth/callback';
      
      // Get authorization URL from backend - usando fetch direto com action parameter
      const authResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contaazul-oauth?action=authorize&redirect_uri=${encodeURIComponent(redirectUri)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        throw new Error(errorData.error || 'Falha ao iniciar OAuth');
      }

      const data = await authResponse.json();

      if (!data.authorization_url || !data.state) {
        throw new Error('Resposta inválida do servidor');
      }

      // Store state and connection name in sessionStorage for CSRF validation
      sessionStorage.setItem('contaazul_oauth_state', data.state);
      sessionStorage.setItem('contaazul_connection_name', connectionName || 'Conta Azul');

      // Redirect to Conta Azul authorization page
      window.location.href = data.authorization_url;

    } catch (error) {
      console.error('OAuth error:', error);
      toast({
        title: "Erro ao iniciar conexão",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
      setIsStartingOAuth(false);
    }
  };

  const handleSelectERP = (erp: string) => {
    setSelectedERP(erp);
    setConnectionName(erpInfo[erp]?.name || erp);
    setCredentials({});
    setStep(2);
  };

  const handleCredentialChange = (key: string, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleModuleToggle = (moduleKey: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleKey) 
        ? prev.filter(m => m !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const canProceedStep2 = () => {
    if (!selectedERP) return false;
    
    // OAuth ERPs don't need credentials filled
    if (OAUTH_ERPS.includes(selectedERP)) {
      return true;
    }
    
    const fields = erpInfo[selectedERP]?.fields || [];
    return fields.every(field => credentials[field.key]?.trim());
  };

  const isOAuthERP = selectedERP && OAUTH_ERPS.includes(selectedERP);
  const currentERPInfo = selectedERP ? erpInfo[selectedERP] : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentERPInfo && (
              <span className={`w-8 h-8 rounded-lg ${currentERPInfo.color} flex items-center justify-center text-lg`}>
                {currentERPInfo.logo}
              </span>
            )}
            {step === 1 && "Escolher ERP"}
            {step === 2 && `Conectar ${currentERPInfo?.name || ""}`}
            {step === 3 && "Configurar Sincronização"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Selecione o ERP que deseja integrar com o TribuTalks"}
            {step === 2 && (isOAuthERP 
              ? "Você será redirecionado para autorizar o acesso de forma segura"
              : "Insira suas credenciais de API para estabelecer a conexão"
            )}
            {step === 3 && "Escolha quais dados deseja sincronizar automaticamente"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Select ERP */}
        {step === 1 && (
          <div className="grid gap-3 py-4 max-h-[400px] overflow-y-auto">
            {Object.entries(erpInfo).map(([key, info]) => (
              <Card 
                key={key} 
                className="cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => handleSelectERP(key)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`w-12 h-12 rounded-lg ${info.color} flex items-center justify-center text-2xl`}>
                    {info.logo}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium flex items-center gap-2">
                      {info.name}
                      {OAUTH_ERPS.includes(key) && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          OAuth 2.0
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">{info.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Step 2: Credentials or OAuth */}
        {step === 2 && currentERPInfo && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="connection_name">Nome da Conexão</Label>
              <Input
                id="connection_name"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                placeholder="Ex: Minha Empresa - Conta Azul"
              />
            </div>
            
            {isOAuthERP ? (
              // OAuth flow - show explanation and button
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Autorização Segura via OAuth 2.0
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Você será redirecionado para o {currentERPInfo.name} para autorizar o acesso. 
                    Este método é mais seguro pois não requer que você compartilhe suas credenciais.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ Suas credenciais permanecem seguras</li>
                    <li>✓ Renovação automática de tokens</li>
                    <li>✓ Você pode revogar o acesso a qualquer momento</li>
                  </ul>
                </div>
              </div>
            ) : (
              // Standard credential fields
              currentERPInfo.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <div className="relative">
                    <Input
                      id={field.key}
                      type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                      value={credentials[field.key] || ""}
                      onChange={(e) => handleCredentialChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={field.type === 'password' ? 'pr-10' : ''}
                    />
                    {field.type === 'password' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility(field.key)}
                      >
                        {showPasswords[field.key] ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              
              {isOAuthERP ? (
                <Button 
                  className="flex-1 gap-2" 
                  onClick={startOAuthFlow}
                  disabled={isStartingOAuth}
                >
                  {isStartingOAuth ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecionando...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      Conectar com {currentERPInfo.name}
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  className="flex-1 gap-2" 
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2()}
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Sync Config (only for non-OAuth ERPs) */}
        {step === 3 && !isOAuthERP && (
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {SYNC_MODULES.map((module) => (
                <div 
                  key={module.key}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedModules.includes(module.key) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/30'
                  }`}
                  onClick={() => handleModuleToggle(module.key)}
                >
                  <Checkbox 
                    checked={selectedModules.includes(module.key)}
                    onCheckedChange={() => handleModuleToggle(module.key)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{module.label}</p>
                    <p className="text-xs text-muted-foreground">{module.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button 
                className="flex-1 gap-2" 
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || selectedModules.length === 0}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Finalizar Conexão
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
