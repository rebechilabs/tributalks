import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  TrendingUp, 
  AlertCircle,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { ComparativoRegimesFormData, PerfilClientes, ComparativoRegimesInput } from "@/types/comparativoRegimes";
import { DespesasOperacionaisSelector } from "./DespesasOperacionaisSelector";
import { useSharedCompanyData } from "@/hooks/useSharedCompanyData";
import { DataSourceBadge } from "@/components/common/DataSourceBadge";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/integrations/supabase/client";

interface ComparativoRegimesWizardProps {
  onSubmit: (data: ComparativoRegimesInput) => void;
  isLoading?: boolean;
}

const initialFormData: ComparativoRegimesFormData = {
  faturamento_anual: '',
  folha_pagamento: '',
  cnae_principal: '',
  compras_insumos: '',
  despesas_operacionais: '',
  despesas_detalhadas: {},
  margem_lucro: '15',
  perfil_clientes: '',
};

export function ComparativoRegimesWizard({ onSubmit, isLoading }: ComparativoRegimesWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ComparativoRegimesFormData>(initialFormData);
  const [showPrefillBanner, setShowPrefillBanner] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [prefillOrigem, setPrefillOrigem] = useState<string | null>(null);
  const shared = useSharedCompanyData();
  const { currentCompany } = useCompany();

  // Pre-fill from shared company data, with DRE fallback
  useEffect(() => {
    if (shared.isLoading) return;

    const fetchDreAndPrefill = async () => {
      let dreData: any = null;

      // Fetch latest DRE if company exists
      if (currentCompany?.id) {
        const { data } = await supabase
          .from('company_dre')
          .select('calc_receita_bruta, input_salarios_encargos, input_prolabore, input_custo_mercadorias, input_custo_materiais, period_type')
          .eq('company_id', currentCompany.id)
          .order('period_year', { ascending: false })
          .order('period_month', { ascending: false })
          .limit(1)
          .maybeSingle();
        dreData = data;
      }

      const annualize = (value: number | null, periodType: string | null) => {
        if (!value) return 0;
        if (periodType === 'mensal' || periodType === 'monthly') return value * 12;
        if (periodType === 'trimestral' || periodType === 'quarterly') return value * 4;
        return value; // anual / yearly
      };

      let filled = false;
      let origem: string | null = null;

      setFormData(prev => {
        const next = { ...prev };

        // Faturamento: profile first, DRE fallback
        if (!prev.faturamento_anual) {
          if (shared.faturamento_anual) {
            next.faturamento_anual = Math.round(shared.faturamento_anual).toString();
            origem = origem || shared.origem;
            filled = true;
          } else if (dreData?.calc_receita_bruta) {
            next.faturamento_anual = Math.round(annualize(dreData.calc_receita_bruta, dreData.period_type)).toString();
            origem = 'dre';
            filled = true;
          }
        }

        // Folha: profile first, DRE fallback
        if (!prev.folha_pagamento) {
          if (shared.folha_anual) {
            next.folha_pagamento = Math.round(shared.folha_anual).toString();
            origem = origem || shared.origem;
            filled = true;
          } else if (dreData) {
            const folhaDre = (dreData.input_salarios_encargos || 0) + (dreData.input_prolabore || 0);
            if (folhaDre > 0) {
              next.folha_pagamento = Math.round(annualize(folhaDre, dreData.period_type)).toString();
              origem = 'dre';
              filled = true;
            }
          }
        }

        // Compras/Insumos: profile first, DRE fallback
        if (!prev.compras_insumos) {
          if (shared.compras_insumos_anual) {
            next.compras_insumos = Math.round(shared.compras_insumos_anual).toString();
            origem = origem || shared.origem;
            filled = true;
          } else if (dreData) {
            const comprasDre = (dreData.input_custo_mercadorias || 0) + (dreData.input_custo_materiais || 0);
            if (comprasDre > 0) {
              next.compras_insumos = Math.round(annualize(comprasDre, dreData.period_type)).toString();
              origem = 'dre';
              filled = true;
            }
          }
        }

        // CNAE: only from profile
        if (!prev.cnae_principal && shared.cnae_principal != null) {
          next.cnae_principal = shared.cnae_principal;
          origem = origem || shared.origem;
          filled = true;
        }

        return next;
      });

      if (filled) {
        setPrefillOrigem(origem);
        setShowPrefillBanner(true);
      }
    };

    fetchDreAndPrefill();
  }, [shared.isLoading, shared.faturamento_anual, shared.folha_anual, shared.compras_insumos_anual, shared.cnae_principal, currentCompany?.id]);

  const formatarParaExibicao = (valor: string): string => {
    if (!valor) return '';
    const numero = valor.replace(/\D/g, '');
    if (!numero) return '';
    return new Intl.NumberFormat('pt-BR').format(parseInt(numero));
  };

  const handleCurrencyChange = (field: keyof ComparativoRegimesFormData, value: string) => {
    const apenasNumeros = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, [field]: apenasNumeros }));
  };

  const isStep1Valid = () => {
    const faturamento = parseInt(formData.faturamento_anual) || 0;
    return faturamento > 0;
  };

  const isStep2Valid = () => {
    return formData.perfil_clientes !== '';
  };

  const handleSubmit = () => {
    if (!isStep2Valid()) return;

    const input: ComparativoRegimesInput = {
      faturamento_anual: parseInt(formData.faturamento_anual) || 0,
      folha_pagamento: parseInt(formData.folha_pagamento) || 0,
      cnae_principal: formData.cnae_principal,
      compras_insumos: parseInt(formData.compras_insumos) || 0,
      despesas_operacionais: parseInt(formData.despesas_operacionais) || 0,
      margem_lucro: parseInt(formData.margem_lucro) / 100,
      perfil_clientes: formData.perfil_clientes as PerfilClientes,
    };

    onSubmit(input);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          <Building2 className="h-4 w-4" />
          <span className="text-sm font-medium">Dados da Empresa</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">Dados Operacionais</span>
        </div>
      </div>

      {/* Banner de autopreenchimento */}
      {showPrefillBanner && step === 1 && (
        <Alert className="mb-4 border-yellow-500/50 bg-yellow-500/10">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
            Campos preenchidos automaticamente.
            <DataSourceBadge origem={prefillOrigem} />
            Ajuste se necessário.
          </AlertDescription>
        </Alert>
      )}

      {/* Passo 1: Dados da Empresa */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>
              Informe os dados básicos para simular os regimes tributários
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="faturamento_anual">
                Faturamento Anual Estimado <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  id="faturamento_anual"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={formatarParaExibicao(formData.faturamento_anual)}
                  onChange={(e) => handleCurrencyChange('faturamento_anual', e.target.value)}
                  className={`pl-10 ${showErrors && !(parseInt(formData.faturamento_anual) > 0) ? 'border-destructive' : ''}`}
                />
              </div>
              {showErrors && !(parseInt(formData.faturamento_anual) > 0) && (
                <p className="text-xs text-destructive">Este campo é obrigatório</p>
              )}
              <p className="text-xs text-muted-foreground">
                Informe a receita bruta total estimada para os próximos 12 meses
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="folha_pagamento">
                Gasto Anual com Folha de Pagamento <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  id="folha_pagamento"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={formatarParaExibicao(formData.folha_pagamento)}
                  onChange={(e) => handleCurrencyChange('folha_pagamento', e.target.value)}
                  className={`pl-10 ${showErrors && !(parseInt(formData.folha_pagamento) > 0) ? 'border-destructive' : ''}`}
                />
              </div>
              {showErrors && !(parseInt(formData.folha_pagamento) > 0) && (
                <p className="text-xs text-destructive">Este campo é obrigatório</p>
              )}
              <p className="text-xs text-muted-foreground">
                Inclua salários, pró-labore e encargos (INSS, FGTS)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnae_principal">
                Atividade Principal (CNAE)
              </Label>
              <Input
                id="cnae_principal"
                type="text"
                placeholder="Ex: 4711-3/02 ou Comércio varejista"
                value={formData.cnae_principal}
                onChange={(e) => setFormData(prev => ({ ...prev, cnae_principal: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Opcional: ajuda a refinar o cálculo das alíquotas
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={() => {
                  if (isStep1Valid()) {
                    setShowErrors(false);
                    setStep(2);
                  } else {
                    setShowErrors(true);
                    const firstInvalid = !(parseInt(formData.faturamento_anual) > 0) ? 'faturamento_anual' : 'folha_pagamento';
                    document.getElementById(firstInvalid)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="gap-2"
              >
                Próximo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Passo 2: Dados Operacionais */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Dados Operacionais
              <Badge variant="outline" className="ml-2">2027</Badge>
            </CardTitle>
            <CardDescription>
              Essenciais para simular o impacto do Simples 2027 com créditos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="compras_insumos">
                Gasto Anual com Compras e Insumos <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  id="compras_insumos"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={formatarParaExibicao(formData.compras_insumos)}
                  onChange={(e) => handleCurrencyChange('compras_insumos', e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Total de compras de mercadorias, matérias-primas e serviços que geram crédito de IBS/CBS
              </p>
            </div>

            <DespesasOperacionaisSelector
              valores={formData.despesas_detalhadas || {}}
              onChange={(novosValores) => {
                const total = Object.values(novosValores).reduce((sum, val) => sum + (val || 0), 0);
                setFormData(prev => ({
                  ...prev,
                  despesas_detalhadas: novosValores,
                  despesas_operacionais: total.toString(),
                }));
              }}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Margem de Lucro Estimada</Label>
                <span className="text-lg font-semibold">{formData.margem_lucro}%</span>
              </div>
              <Slider
                value={[parseInt(formData.margem_lucro) || 15]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, margem_lucro: value.toString() }))}
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>

            <div className="space-y-4">
              <Label>
                Qual o perfil principal dos seus clientes? <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={formData.perfil_clientes}
                onValueChange={(value) => setFormData(prev => ({ ...prev, perfil_clientes: value as PerfilClientes }))}
                className="space-y-3"
              >
                <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="B2B" id="b2b" className="mt-1" />
                  <label htmlFor="b2b" className="cursor-pointer flex-1">
                    <div className="font-medium">B2B - Outras empresas (PJ)</div>
                    <div className="text-sm text-muted-foreground">
                      Vendo principalmente para outras empresas. Elas podem aproveitar créditos tributários.
                    </div>
                  </label>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="B2C" id="b2c" className="mt-1" />
                  <label htmlFor="b2c" className="cursor-pointer flex-1">
                    <div className="font-medium">B2C - Consumidor final (PF)</div>
                    <div className="text-sm text-muted-foreground">
                      Vendo principalmente para pessoas físicas. Elas não aproveitam créditos.
                    </div>
                  </label>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="MISTO" id="misto" className="mt-1" />
                  <label htmlFor="misto" className="cursor-pointer flex-1">
                    <div className="font-medium">Misto - Ambos os públicos</div>
                    <div className="text-sm text-muted-foreground">
                      Vendo de forma equilibrada para empresas e consumidores finais.
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                O perfil de clientes é crucial para decidir entre Simples "por dentro" ou "por fora" em 2027.
              </AlertDescription>
            </Alert>

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!isStep2Valid() || isLoading}
                className="gap-2"
              >
                {isLoading ? 'Calculando...' : 'Simular Regimes'}
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
