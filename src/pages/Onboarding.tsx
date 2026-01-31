import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Calculator, ArrowLeft, ArrowRight, Building, DollarSign, FileText, Briefcase, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CnpjInput } from "@/components/common/CnpjInput";
import { CnpjData } from "@/hooks/useCnpjLookup";

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const FAIXAS_FATURAMENTO = [
  { value: '200000', label: 'R$200k - R$500k' },
  { value: '500000', label: 'R$500k - R$1M' },
  { value: '1000000', label: 'R$1M - R$2,5M' },
  { value: '2500000', label: 'R$2,5M - R$5M' },
  { value: '5000000', label: 'R$5M - R$10M' },
  { value: '10000000', label: 'R$10M - R$25M' },
  { value: '25000000', label: 'R$25M - R$50M' },
  { value: '50000000', label: 'Acima de R$50M' },
];

// Valores válidos que correspondem aos CHECK constraints do banco
const REGIMES_VALIDOS = ['SIMPLES', 'PRESUMIDO', 'REAL'] as const;
const SETORES_VALIDOS = ['industria', 'comercio', 'servicos', 'tecnologia', 'outro'] as const;

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  // Initialize form with existing profile data
  const [formData, setFormData] = useState({
    cnpj: "",
    empresa: "",
    estado: "",
    faturamento_mensal: "",
    regime: "",
    setor: "",
    cnae: "",
  });

  // Track component mount status
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Pre-populate form when profile loads, and redirect if already complete
  useEffect(() => {
    if (profile) {
      // If onboarding is already complete, redirect to dashboard via React Router
      if (profile.onboarding_complete) {
        navigate('/dashboard', { replace: true });
        return;
      }
      
      setFormData({
        cnpj: "",
        empresa: profile.empresa || "",
        estado: profile.estado || "",
        faturamento_mensal: profile.faturamento_mensal?.toString() || "",
        regime: profile.regime || "",
        setor: profile.setor || "",
        cnae: profile.cnae || "",
      });
    }
  }, [profile, navigate]);

  // Navigate after successful save via React Router (sem reload de página)
  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isSaved, navigate]);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle CNPJ data loaded from API
  const handleCnpjDataLoaded = (data: CnpjData) => {
    setFormData((prev) => ({
      ...prev,
      empresa: data.razao_social || prev.empresa,
      estado: data.uf || prev.estado,
      cnae: data.cnae_fiscal ? data.cnae_fiscal.toString() : prev.cnae,
    }));
    
    toast({
      title: "Dados carregados!",
      description: `Empresa ${data.razao_social} encontrada.`,
    });
  };
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user || isLoading || isSaved) return;
    
    // Validação de segurança antes de enviar
    if (!REGIMES_VALIDOS.includes(formData.regime as typeof REGIMES_VALIDOS[number])) {
      toast({
        title: "Regime inválido",
        description: "Por favor, selecione um regime tributário válido.",
        variant: "destructive",
      });
      setStep(3);
      return;
    }
    
    if (!SETORES_VALIDOS.includes(formData.setor as typeof SETORES_VALIDOS[number])) {
      toast({
        title: "Setor inválido", 
        description: "Por favor, selecione um setor válido.",
        variant: "destructive",
      });
      setStep(4);
      return;
    }
    
    setIsLoading(true);
    
    const updateData = {
      empresa: formData.empresa.trim(),
      estado: formData.estado,
      faturamento_mensal: parseFloat(formData.faturamento_mensal) || null,
      regime: formData.regime as 'SIMPLES' | 'PRESUMIDO' | 'REAL',
      setor: formData.setor as 'industria' | 'comercio' | 'servicos' | 'tecnologia' | 'outro',
      cnae: formData.cnae?.trim() || null,
      onboarding_complete: true,
    };

    try {
      // Usar fetch direto para ter controle total sobre a requisição
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?user_id=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(updateData)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao salvar perfil');
      }

      // Só atualiza estado se o componente ainda estiver montado
      if (isMounted.current) {
        toast({
          title: "Perfil configurado!",
          description: "Você está pronto para usar as calculadoras.",
        });
        
        // Set flag for quick diagnostic modal
        localStorage.setItem('needs_quick_diagnostic', 'true');
        
        setIsSaved(true);
      }
      
    } catch (error: any) {
      console.error('Onboarding save error:', error);
      if (isMounted.current) {
        // Ignora AbortError pois pode significar que deu certo mas o componente desmontou
        if (error?.name === 'AbortError') {
          setIsSaved(true);
          return;
        }
        
        toast({
          title: "Erro ao salvar",
          description: error?.message || "Tente novamente em alguns segundos.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.empresa.trim() !== '' && formData.estado !== '';
      case 2:
        return formData.faturamento_mensal !== '';
      case 3:
        // Garante que regime é um dos valores válidos do banco
        return REGIMES_VALIDOS.includes(formData.regime as typeof REGIMES_VALIDOS[number]);
      case 4:
        // Garante que setor é um dos valores válidos do banco
        return SETORES_VALIDOS.includes(formData.setor as typeof SETORES_VALIDOS[number]);
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">TribuTech</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Passo {step} de {totalSteps}</span>
              <span>{Math.round(progress)}% concluído</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Complete Seu Perfil Tributário
          </h1>
          <p className="text-muted-foreground mb-8">
            Para personalizar suas simulações, precisamos de algumas informações. Leva menos de 2 minutos.
          </p>

          {/* Step Content */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-primary mb-4">
                  <Building className="w-5 h-5" />
                  <span className="font-semibold">Sua Empresa</span>
                </div>

                <CnpjInput
                  value={formData.cnpj}
                  onChange={(cnpj) => handleChange("cnpj", cnpj)}
                  onDataLoaded={handleCnpjDataLoaded}
                  label="CNPJ (opcional - preenche dados automaticamente)"
                  placeholder="00.000.000/0000-00"
                />

                <div className="space-y-2">
                  <Label htmlFor="empresa">Nome da empresa</Label>
                  <Input
                    id="empresa"
                    placeholder="Empresa Exemplo LTDA"
                    value={formData.empresa}
                    onChange={(e) => handleChange("empresa", e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado principal</Label>
                  <Select value={formData.estado} onValueChange={(v) => handleChange("estado", v)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-primary mb-4">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-semibold">Faturamento</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faturamento">Faixa de faturamento mensal</Label>
                  <Select value={formData.faturamento_mensal} onValueChange={(v) => handleChange("faturamento_mensal", v)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecione a faixa" />
                    </SelectTrigger>
                    <SelectContent>
                      {FAIXAS_FATURAMENTO.map((faixa) => (
                        <SelectItem key={faixa.value} value={faixa.value}>
                          {faixa.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-primary mb-4">
                  <FileText className="w-5 h-5" />
                  <span className="font-semibold">Regime Tributário</span>
                </div>

                <div className="space-y-2">
                  <Label>Regime atual</Label>
                  <div className="grid gap-3">
                    {[
                      { value: 'SIMPLES', label: 'Simples Nacional' },
                      { value: 'PRESUMIDO', label: 'Lucro Presumido' },
                      { value: 'REAL', label: 'Lucro Real' },
                    ].map((regime) => (
                      <button
                        key={regime.value}
                        type="button"
                        onClick={() => handleChange("regime", regime.value)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          formData.regime === regime.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="font-medium">{regime.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-primary mb-4">
                  <Briefcase className="w-5 h-5" />
                  <span className="font-semibold">Setor</span>
                </div>

                <div className="space-y-2">
                  <Label>Setor principal</Label>
                  <div className="grid gap-3">
                    {[
                      { value: 'industria', label: 'Indústria' },
                      { value: 'comercio', label: 'Comércio' },
                      { value: 'servicos', label: 'Serviços' },
                      { value: 'tecnologia', label: 'Tecnologia' },
                      { value: 'outro', label: 'Outro' },
                    ].map((setor) => (
                      <button
                        key={setor.value}
                        type="button"
                        onClick={() => handleChange("setor", setor.value)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          formData.setor === setor.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="font-medium">{setor.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnae">CNAE principal (opcional)</Label>
                  <Input
                    id="cnae"
                    placeholder="Ex: 6201-5/00"
                    value={formData.cnae}
                    onChange={(e) => handleChange("cnae", e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isLoading || isSaved}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
            
            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1"
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading || isSaved}
                className="flex-1"
              >
                {isLoading || isSaved ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isSaved ? 'Redirecionando...' : 'Salvando...'}
                  </>
                ) : (
                  <>
                    Concluir e Acessar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
