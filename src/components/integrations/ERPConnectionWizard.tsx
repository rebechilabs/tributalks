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
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";

interface ERPInfo {
  name: string;
  description: string;
  logo: string;
  color: string;
  fields: { key: string; label: string; type: string; placeholder: string }[];
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
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    const fields = erpInfo[selectedERP]?.fields || [];
    return fields.every(field => credentials[field.key]?.trim());
  };

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
            {step === 2 && "Insira suas credenciais de API para estabelecer a conexão"}
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
                    <h3 className="font-medium">{info.name}</h3>
                    <p className="text-sm text-muted-foreground">{info.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Step 2: Credentials */}
        {step === 2 && currentERPInfo && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="connection_name">Nome da Conexão</Label>
              <Input
                id="connection_name"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                placeholder="Ex: Minha Empresa - Omie"
              />
            </div>
            
            {currentERPInfo.fields.map((field) => (
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
            ))}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button 
                className="flex-1 gap-2" 
                onClick={() => setStep(3)}
                disabled={!canProceedStep2()}
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Sync Config */}
        {step === 3 && (
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
