import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scale, Info, Star, AlertTriangle, RefreshCw, FileDown, Loader2, CheckCircle, Calendar, XCircle, Package, Zap, Truck, Building2, Wrench, HelpCircle, Sparkles, ArrowRight, TrendingDown, Crown, Lock, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TaxDisclaimer } from "@/components/common/TaxDisclaimer";
import { HelpButton } from "@/components/common/HelpButton";
interface RegimeResult {
  simples: number | null;
  presumido: number;
  real: number;
  melhor_opcao: string;
  economia_mensal: number;
  economia_anual: number;
  simples_elegivel: boolean;
  creditos_pis_cofins: number;
}

const MARGENS_LUCRO = [
  { value: '0.075', label: '5% - 10%' },
  { value: '0.125', label: '10% - 15%' },
  { value: '0.175', label: '15% - 20%' },
  { value: '0.25', label: '20% - 30%' },
  { value: '0.35', label: '30% - 40%' },
  { value: '0.45', label: 'Acima de 40%' },
];

// Insumos creditáveis de PIS/COFINS no Lucro Real
// Alíquota combinada PIS (1,65%) + COFINS (7,6%) = 9,25%
// IMPORTANTE: Os insumos variam por setor (comércio/indústria vs serviços)

interface InsumoCreditable {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
  aliquota: number;
  setores: string[]; // quais setores podem usar este insumo
}

const INSUMOS_CREDITAVEIS: InsumoCreditable[] = [
  // Comércio e Indústria
  { 
    id: 'mercadorias', 
    label: 'Mercadorias para revenda', 
    icon: Package,
    tooltip: 'Produtos adquiridos para revenda. Crédito de 9,25% sobre o valor.',
    aliquota: 0.0925,
    setores: ['comercio', 'industria']
  },
  { 
    id: 'insumos_producao', 
    label: 'Insumos de produção', 
    icon: Wrench,
    tooltip: 'Matérias-primas, embalagens e materiais usados na fabricação. Crédito de 9,25%.',
    aliquota: 0.0925,
    setores: ['industria']
  },
  // Todos os setores
  { 
    id: 'energia', 
    label: 'Energia elétrica', 
    icon: Zap,
    tooltip: 'Consumo de energia elétrica na atividade. Crédito de 9,25%.',
    aliquota: 0.0925,
    setores: ['comercio', 'industria', 'servicos', 'tecnologia', 'outro']
  },
  { 
    id: 'aluguel', 
    label: 'Aluguel de imóveis (PJ)', 
    icon: Building2,
    tooltip: 'Aluguel pago a pessoa jurídica para uso na atividade. Crédito de 9,25%.',
    aliquota: 0.0925,
    setores: ['comercio', 'industria', 'servicos', 'tecnologia', 'outro']
  },
  { 
    id: 'frete', 
    label: 'Frete sobre vendas', 
    icon: Truck,
    tooltip: 'Frete na operação de venda (quando pago pelo vendedor). Crédito de 9,25%.',
    aliquota: 0.0925,
    setores: ['comercio', 'industria']
  },
  // Serviços e Tecnologia
  { 
    id: 'servicos_terceiros', 
    label: 'Serviços de terceiros (PJ)', 
    icon: Wrench,
    tooltip: 'Serviços essenciais contratados de PJ (TI, manutenção, limpeza, segurança). Crédito de 9,25%.',
    aliquota: 0.0925,
    setores: ['servicos', 'tecnologia', 'outro']
  },
];

const ComparativoRegimes = () => {
  const { user, profile } = useAuth();
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<RegimeResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [showInsumos, setShowInsumos] = useState(false);

  const [formData, setFormData] = useState({
    faturamento_mensal: profile?.faturamento_mensal?.toString() || "",
    margem_lucro: "0.25",
    folha_pagamento: "",
    setor: profile?.setor || "",
    regime_atual: profile?.regime || "",
  });

  const [insumos, setInsumos] = useState<Record<string, string>>({
    mercadorias: "",
    insumos_producao: "",
    energia: "",
    aluguel: "",
    frete: "",
    servicos_terceiros: "",
  });

  // Filtra insumos baseado no setor selecionado
  const insumosDoSetor = INSUMOS_CREDITAVEIS.filter(
    (insumo) => insumo.setores.includes(formData.setor) || formData.setor === ""
  );

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setResult(null);
    setSaved(false);
  };

  const handleInsumoChange = (insumoId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setInsumos((prev) => ({ ...prev, [insumoId]: rawValue }));
    setResult(null);
    setSaved(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatInputCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    const number = parseInt(numericValue, 10);
    return new Intl.NumberFormat('pt-BR').format(number);
  };

  const handleCurrencyChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    handleChange(field, rawValue);
  };

  const getAliquotaSimples = (faturamento_anual: number, setor: string): number => {
    // Simplified Simples Nacional rates based on revenue and sector
    if (setor === 'comercio') {
      if (faturamento_anual <= 360000) return 0.04;
      if (faturamento_anual <= 720000) return 0.073;
      if (faturamento_anual <= 1800000) return 0.095;
      if (faturamento_anual <= 3600000) return 0.107;
      return 0.143;
    }
    if (setor === 'industria') {
      if (faturamento_anual <= 360000) return 0.045;
      if (faturamento_anual <= 720000) return 0.078;
      if (faturamento_anual <= 1800000) return 0.10;
      if (faturamento_anual <= 3600000) return 0.112;
      return 0.147;
    }
    // Services (higher rates)
    if (faturamento_anual <= 360000) return 0.06;
    if (faturamento_anual <= 720000) return 0.112;
    if (faturamento_anual <= 1800000) return 0.135;
    if (faturamento_anual <= 3600000) return 0.16;
    return 0.21;
  };

  const getPresuncao = (setor: string): number => {
    if (setor === 'comercio' || setor === 'industria') return 0.08;
    return 0.32; // Services
  };

  const calcularCreditosPisCofins = (): number => {
    let totalCreditos = 0;
    
    INSUMOS_CREDITAVEIS.forEach((insumo) => {
      const valor = parseFloat(insumos[insumo.id]) || 0;
      totalCreditos += valor * insumo.aliquota;
    });

    return totalCreditos;
  };

  const calcularComparativo = (): RegimeResult => {
    const faturamento_mensal = parseFloat(formData.faturamento_mensal);
    const margem_lucro = parseFloat(formData.margem_lucro);
    const folha_pagamento = parseFloat(formData.folha_pagamento) || faturamento_mensal * 0.15;
    const setor = formData.setor;
    const regime_atual = formData.regime_atual;

    const faturamento_anual = faturamento_mensal * 12;
    const lucro_mensal = faturamento_mensal * margem_lucro;

    // Simples Nacional (if eligible: up to R$4.8M/year)
    let simples: number | null = null;
    const simples_elegivel = faturamento_anual <= 4800000;
    
    if (simples_elegivel) {
      const aliquota_simples = getAliquotaSimples(faturamento_anual, setor);
      simples = faturamento_mensal * aliquota_simples;
    }

    // Lucro Presumido
    const presuncao = getPresuncao(setor);
    const base_presumida = faturamento_mensal * presuncao;
    const presumido_irpj = base_presumida * 0.15;
    const presumido_csll = base_presumida * 0.09;
    const presumido_pis = faturamento_mensal * 0.0065;
    const presumido_cofins = faturamento_mensal * 0.03;
    const presumido_iss_icms = faturamento_mensal * 0.05;
    const total_presumido = presumido_irpj + presumido_csll + presumido_pis + presumido_cofins + presumido_iss_icms;

    // Lucro Real - Com créditos detalhados de PIS/COFINS
    const real_irpj = lucro_mensal * 0.15 + Math.max(0, lucro_mensal - 20000) * 0.10;
    const real_csll = lucro_mensal * 0.09;
    const real_pis = faturamento_mensal * 0.0165;
    const real_cofins = faturamento_mensal * 0.076;
    const real_iss_icms = faturamento_mensal * 0.05;
    
    // Créditos de PIS/COFINS baseados nos insumos informados
    const creditos_pis_cofins = calcularCreditosPisCofins();
    
    // Se não informou insumos, usa estimativa de 3% do faturamento
    const creditos_finais = creditos_pis_cofins > 0 
      ? creditos_pis_cofins 
      : faturamento_mensal * 0.03;
    
    const total_real = real_irpj + real_csll + real_pis + real_cofins + real_iss_icms - creditos_finais;

    // Determine best option
    const opcoes = [
      { nome: 'SIMPLES', valor: simples ?? Infinity },
      { nome: 'PRESUMIDO', valor: total_presumido },
      { nome: 'REAL', valor: total_real },
    ];

    const melhor = opcoes.reduce((a, b) => a.valor < b.valor ? a : b);
    
    // Calculate savings vs current regime
    let valorAtual = 0;
    if (regime_atual === 'SIMPLES' && simples !== null) valorAtual = simples;
    else if (regime_atual === 'PRESUMIDO') valorAtual = total_presumido;
    else if (regime_atual === 'REAL') valorAtual = total_real;

    const economia_mensal = valorAtual - melhor.valor;
    const economia_anual = economia_mensal * 12;

    return {
      simples,
      presumido: total_presumido,
      real: total_real,
      melhor_opcao: melhor.nome,
      economia_mensal: Math.max(0, economia_mensal),
      economia_anual: Math.max(0, economia_anual),
      simples_elegivel,
      creditos_pis_cofins: creditos_finais,
    };
  };

  const handleCalculate = async () => {
    const faturamento = parseFloat(formData.faturamento_mensal);

    if (!faturamento) {
      toast({
        title: "Dados incompletos",
        description: "Preencha o faturamento mensal.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const calculatedResult = calcularComparativo();
    setResult(calculatedResult);
    setIsCalculating(false);

    // Auto-save simulation
    if (user) {
      try {
        // Preparar insumos para salvar
        const insumosParaSalvar: Record<string, number> = {};
        INSUMOS_CREDITAVEIS.forEach((insumo) => {
          const valor = parseFloat(insumos[insumo.id]) || 0;
          if (valor > 0) {
            insumosParaSalvar[insumo.id] = valor;
          }
        });

        await supabase.from('simulations').insert([{
          user_id: user.id,
          calculator_slug: 'comparativo-regimes',
          inputs: {
            faturamento_mensal: faturamento,
            margem_lucro: parseFloat(formData.margem_lucro),
            folha_pagamento: parseFloat(formData.folha_pagamento) || null,
            setor: formData.setor,
            regime_atual: formData.regime_atual,
            insumos: insumosParaSalvar,
          } as any,
          outputs: calculatedResult as any,
        }]);
        setSaved(true);
      } catch (error) {
        console.error('Error saving simulation:', error);
      }
    }

    setTimeout(() => {
      document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReset = () => {
    setFormData({
      faturamento_mensal: "",
      margem_lucro: "0.25",
      folha_pagamento: "",
      setor: "",
      regime_atual: "",
    });
    setInsumos({
      mercadorias: "",
      insumos_producao: "",
      energia: "",
      aluguel: "",
      frete: "",
      servicos_terceiros: "",
    });
    setResult(null);
    setSaved(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRegimeLabel = (regime: string) => {
    const labels: Record<string, string> = {
      SIMPLES: 'Simples Nacional',
      PRESUMIDO: 'Lucro Presumido',
      REAL: 'Lucro Real',
    };
    return labels[regime] || regime;
  };

  return (
    <DashboardLayout title="Comparativo de Regimes">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
          {" > "}
          <span>Calculadoras</span>
          {" > "}
          <span className="text-foreground">Comparativo de Regimes</span>
        </nav>

        {/* Title */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Comparativo de Regimes Tributários</h1>
                <p className="text-muted-foreground">
                  Descubra qual regime é mais vantajoso para sua empresa.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Zerar Cálculo
              </Button>
              <HelpButton toolSlug="comparativo-regimes" size="default" />
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Seus Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="faturamento">Faturamento mensal</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="faturamento"
                    value={formatInputCurrency(formData.faturamento_mensal)}
                    onChange={handleCurrencyChange("faturamento_mensal")}
                    placeholder="0"
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Margem de lucro</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">
                          <strong>Lucro líquido sobre o faturamento.</strong><br />
                          Calcule: (Receita - Custos - Despesas) ÷ Receita.<br /><br />
                          Ex: Se você fatura R$ 100.000 e sobram R$ 20.000 de lucro, sua margem é 20%.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select value={formData.margem_lucro} onValueChange={(v) => handleChange("margem_lucro", v)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARGENS_LUCRO.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="folha">Folha de pagamento mensal</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="folha"
                    value={formatInputCurrency(formData.folha_pagamento)}
                    onChange={handleCurrencyChange("folha_pagamento")}
                    placeholder="Opcional"
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Setor</Label>
                <Select value={formData.setor} onValueChange={(v) => handleChange("setor", v)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="industria">Indústria</SelectItem>
                    <SelectItem value="comercio">Comércio</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Regime atual</Label>
                <Select value={formData.regime_atual} onValueChange={(v) => handleChange("regime_atual", v)}>
                  <SelectTrigger className="h-12">
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

            {/* Seção de Insumos Creditáveis - PIS/COFINS */}
            <Collapsible open={showInsumos} onOpenChange={setShowInsumos} className="mt-6">
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between group">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <span>Insumos para crédito de PIS/COFINS (Lucro Real)</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-xs">{showInsumos ? 'Ocultar' : 'Expandir para cálculo mais preciso'}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${showInsumos ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      Custos mensais com insumos
                    </CardTitle>
                    <CardDescription>
                      Informe seus gastos mensais para calcular os créditos de PIS/COFINS no Lucro Real.
                      Alíquota: 9,25% (PIS 1,65% + COFINS 7,6%)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Disclaimer de Marketing */}
                    <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                      <div className="flex gap-2">
                        <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium mb-1 text-foreground">⚠️ Importante: Esta é apenas uma estimativa ilustrativa.</p>
                          <p>
                            Os insumos creditáveis variam conforme a atividade específica da empresa e a interpretação da legislação. 
                            Para garantia jurídica e aproveitamento correto dos créditos, <span className="font-semibold text-primary">consulte um advogado tributarista</span>.
                          </p>
                        </div>
                      </div>
                    </div>

                    {!formData.setor ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Selecione o setor da empresa acima para ver os insumos aplicáveis.</p>
                      </div>
                    ) : (
                      <TooltipProvider>
                        <div className="grid md:grid-cols-2 gap-4">
                          {insumosDoSetor.map((insumo) => {
                            const Icon = insumo.icon;
                            const valorInsumo = parseFloat(insumos[insumo.id]) || 0;
                            const creditoInsumo = valorInsumo * insumo.aliquota;
                            
                            return (
                              <div key={insumo.id} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4 text-primary" />
                                  <Label htmlFor={insumo.id} className="flex-1">{insumo.label}</Label>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p>{insumo.tooltip}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                  <Input
                                    id={insumo.id}
                                    value={formatInputCurrency(insumos[insumo.id])}
                                    onChange={handleInsumoChange(insumo.id)}
                                    placeholder="0"
                                    className="h-10 pl-10 pr-24"
                                  />
                                  {valorInsumo > 0 && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary font-medium">
                                      Crédito: {formatCurrency(creditoInsumo)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </TooltipProvider>
                    )}

                    {/* Total de créditos calculados */}
                    {calcularCreditosPisCofins() > 0 && (
                      <div className="mt-4 pt-4 border-t border-primary/20 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total de créditos PIS/COFINS mensais:</span>
                        <span className="text-lg font-bold text-secondary">{formatCurrency(calcularCreditosPisCofins())}</span>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-4">
                      💡 Se não informar os insumos, usaremos uma estimativa de 3% do faturamento como crédito.
                    </p>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            <Button 
              onClick={handleCalculate} 
              size="lg" 
              className="w-full"
              disabled={isCalculating || !formData.faturamento_mensal || !formData.setor}
            >
              {isCalculating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4 mr-2" />
                  Comparar Regimes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <div id="resultado" className="space-y-6 animate-fade-in">
            {/* HERO: Melhor Regime - DESTAQUE PRINCIPAL */}
            <Card className="border-2 border-secondary bg-gradient-to-br from-secondary/10 via-secondary/5 to-background overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
              <CardContent className="pt-8 pb-8 relative">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/20 rounded-full text-secondary text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4" />
                    Resultado da Análise
                  </div>
                  
                  <h2 className="text-lg text-muted-foreground mb-2">O regime mais vantajoso para você é</h2>
                  
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center">
                      <Star className="w-8 h-8 text-secondary" />
                    </div>
                    <div className="text-left">
                      <p className="text-3xl md:text-4xl font-bold text-foreground">
                        {getRegimeLabel(result.melhor_opcao)}
                      </p>
                      <p className="text-xl font-semibold text-secondary">
                        {formatCurrency(
                          result.melhor_opcao === 'SIMPLES' && result.simples 
                            ? result.simples 
                            : result.melhor_opcao === 'PRESUMIDO' 
                              ? result.presumido 
                              : result.real
                        )}/mês
                      </p>
                    </div>
                  </div>

                  {/* Economia em destaque */}
                  {result.economia_anual > 0 && formData.regime_atual && (
                    <div className="inline-flex flex-col items-center bg-secondary/20 rounded-2xl px-8 py-4 mt-2">
                      <div className="flex items-center gap-2 text-secondary mb-1">
                        <TrendingDown className="w-5 h-5" />
                        <span className="text-sm font-medium">Economia vs {getRegimeLabel(formData.regime_atual)}</span>
                      </div>
                      <p className="text-3xl md:text-4xl font-bold text-secondary">
                        {formatCurrency(result.economia_anual)}
                        <span className="text-lg font-normal text-secondary/80"> /ano</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        ({formatCurrency(result.economia_mensal)}/mês)
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comparativo detalhado dos 3 regimes */}
            <Card className="border-primary/30">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  Comparativo Detalhado
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-8">
                {/* Regime Cards - Redesenhados */}
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Simples Nacional */}
                  <div className={`rounded-2xl p-6 text-center border-2 transition-all relative ${
                    !result.simples_elegivel 
                      ? 'bg-muted/30 border-muted opacity-60' 
                      : result.melhor_opcao === 'SIMPLES' 
                        ? 'bg-gradient-to-b from-secondary/15 to-secondary/5 border-secondary shadow-lg shadow-secondary/10' 
                        : 'bg-muted/50 border-border hover:border-primary/30'
                  }`}>
                    {result.melhor_opcao === 'SIMPLES' && result.simples_elegivel && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Crown className="w-3 h-3" /> MELHOR OPÇÃO
                      </div>
                    )}
                    <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Simples Nacional</p>
                    {result.simples_elegivel && result.simples !== null ? (
                      <>
                        <p className="text-3xl font-bold text-foreground mb-1">
                          {formatCurrency(result.simples)}
                        </p>
                        <p className="text-sm text-muted-foreground">/mês</p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-2">
                        <XCircle className="w-6 h-6" />
                        <span className="text-sm font-medium">Inelegível</span>
                        <span className="text-xs">Faturamento acima do limite</span>
                      </div>
                    )}
                  </div>

                  {/* Lucro Presumido */}
                  <div className={`rounded-2xl p-6 text-center border-2 transition-all relative ${
                    result.melhor_opcao === 'PRESUMIDO' 
                      ? 'bg-gradient-to-b from-secondary/15 to-secondary/5 border-secondary shadow-lg shadow-secondary/10' 
                      : 'bg-muted/50 border-border hover:border-primary/30'
                  }`}>
                    {result.melhor_opcao === 'PRESUMIDO' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Crown className="w-3 h-3" /> MELHOR OPÇÃO
                      </div>
                    )}
                    <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Lucro Presumido</p>
                    <p className="text-3xl font-bold text-foreground mb-1">
                      {formatCurrency(result.presumido)}
                    </p>
                    <p className="text-sm text-muted-foreground">/mês</p>
                  </div>

                  {/* Lucro Real */}
                  <div className={`rounded-2xl p-6 text-center border-2 transition-all relative ${
                    result.melhor_opcao === 'REAL' 
                      ? 'bg-gradient-to-b from-secondary/15 to-secondary/5 border-secondary shadow-lg shadow-secondary/10' 
                      : 'bg-muted/50 border-border hover:border-primary/30'
                  }`}>
                    {result.melhor_opcao === 'REAL' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Crown className="w-3 h-3" /> MELHOR OPÇÃO
                      </div>
                    )}
                    <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Lucro Real</p>
                    <p className="text-3xl font-bold text-foreground mb-1">
                      {formatCurrency(result.real)}
                    </p>
                    <p className="text-sm text-muted-foreground">/mês</p>
                    {result.creditos_pis_cofins > 0 && (
                      <p className="text-xs text-primary mt-2 font-medium">
                        Créditos: {formatCurrency(result.creditos_pis_cofins)}
                      </p>
                    )}
                  </div>
                </div>

                {/* CTA PROFESSIONAL - Oportunidades não consideradas */}
                <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 border-2 border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                        <Lock className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-500" />
                          Quer economizar ainda mais?
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Esta simulação <strong>não considera oportunidades tributárias</strong> como incentivos fiscais, 
                          regimes especiais, créditos acumulados e benefícios setoriais que podem 
                          <span className="text-amber-600 font-semibold"> reduzir sua carga tributária em até 40%</span>.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                            <Link to="/oportunidades">
                              <Sparkles className="w-4 h-4 mr-2" />
                              Ver Oportunidades Tributárias
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                          <Button variant="outline" asChild className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10">
                            <Link to="/#planos">
                              Conhecer Plano Professional
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              {/* Detalhamento dos créditos - se informou insumos */}
              {calcularCreditosPisCofins() > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Detalhamento dos Créditos de PIS/COFINS
                  </h3>
                  <div className="space-y-2">
                    {INSUMOS_CREDITAVEIS.map((insumo) => {
                      const valor = parseFloat(insumos[insumo.id]) || 0;
                      if (valor === 0) return null;
                      const credito = valor * insumo.aliquota;
                      const Icon = insumo.icon;
                      return (
                        <div key={insumo.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">{insumo.label}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-foreground">{formatCurrency(valor)}</span>
                            <span className="text-secondary font-medium">→ {formatCurrency(credito)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-primary/20 flex items-center justify-between">
                    <span className="font-medium text-foreground">Total de créditos mensais</span>
                    <span className="text-lg font-bold text-secondary">{formatCurrency(result.creditos_pis_cofins)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    * Créditos calculados com base na alíquota combinada de 9,25% (PIS 1,65% + COFINS 7,6%) no regime não-cumulativo.
                  </p>
                </div>
              )}

              {/* Seção de economia já está no HERO acima, removida duplicação */}

              {/* Warning */}
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-accent" />
                  Importante — Esta é uma estimativa simplificada
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>A mudança de regime só pode ser feita no início do ano-calendário</li>
                  <li>O comparativo deve considerar: projeções de faturamento, expansão planejada, volume de compras e vendas</li>
                  <li>Vendas interestaduais e município de prestação de serviços afetam a carga tributária</li>
                  <li>Incentivos fiscais estaduais/municipais não foram considerados</li>
                  <li>Créditos acumulados e operações especiais podem alterar o resultado</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-3 font-medium">
                  Recomendamos validar esta análise com um contador antes de tomar decisões.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1" onClick={handleReset}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Nova Simulação
                </Button>
                <Button variant="outline" className="flex-1" disabled>
                  <FileDown className="w-4 h-4 mr-2" />
                  Baixar PDF (em breve)
                </Button>
              </div>

              {/* CTA */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
                <p className="text-foreground font-medium mb-3">
                  Quer uma análise completa para mudar de regime?
                </p>
                <Button variant="default" asChild>
                  <a href="https://bit.ly/rescontabilidade" target="_blank" rel="noopener noreferrer">
                    <Calendar className="w-4 h-4 mr-2" />
                    Falar com R&S Contabilidade
                  </a>
                </Button>
              </div>

              {/* Save Status */}
              {saved && (
                <p className="text-sm text-secondary flex items-center gap-2 justify-center">
                  <CheckCircle className="w-4 h-4" />
                  Simulação salva no seu histórico
                </p>
              )}

              {/* Professional Disclaimer */}
              <TaxDisclaimer />
            </CardContent>
          </Card>
        </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ComparativoRegimes;
