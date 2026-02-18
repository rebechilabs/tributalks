import { useState, useEffect } from "react";
import { EnterpriseModal } from "@/components/landing/EnterpriseModal";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Info, TrendingDown, Calendar, RefreshCw, FileDown, Loader2, CheckCircle, Calculator, AlertTriangle, Trash2, Search, BarChart3, DollarSign as DollarSignIcon, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { FeatureGateLimit } from "@/components/FeatureGate";
import { useSimulationLimit } from "@/hooks/useSimulationLimit";
import { usePlanAccess } from "@/hooks/useFeatureAccess";
import { TaxDisclaimer } from "@/components/common/TaxDisclaimer";
import { HelpButton } from "@/components/common/HelpButton";
import { useCompany } from "@/contexts/CompanyContext";

interface SplitPaymentResult {
  mensal_min: number;
  mensal_max: number;
  anual_min: number;
  anual_max: number;
  percentual_faturamento: number;
  cbs_mensal: number;
  ibs_mensal: number;
  aliquota_total: number;
  credito_estimado_mensal: number;
  impacto_liquido_mensal: number;
  percentual_credito_setor: number;
  descricao_modalidade: string;
}

// Alíquotas de referência conforme LC 214/2025 e Manual RTC (13/01/2026)
// Alíquotas definitivas serão fixadas pelo Comitê Gestor e Receita Federal
const ALIQUOTAS = {
  // 2026: Alíquotas-teste (fase piloto - compensadas com PIS/COFINS)
  TESTE_2026: {
    CBS: 0.009,  // 0,9%
    IBS: 0.001,  // 0,1%
    TOTAL: 0.01, // 1%
    label: "2026 (Teste)",
  },
  // 2027+: Alíquotas de referência conforme LC 214/2025 e Manual RTC (13/01/2026)
  PADRAO_2027: {
    CBS: 0.088,   // 8,8% — CBS federal
    IBS: 0.177,   // 17,7% — IBS estados + municípios
    TOTAL: 0.265, // 26,5% — alíquota de referência total
    label: "2027+ (Referência 26,5%)",
  },
};

const PERCENTUAIS_PJ = [
  { value: '0.50', label: '50%' },
  { value: '0.60', label: '60%' },
  { value: '0.70', label: '70%' },
  { value: '0.80', label: '80%' },
  { value: '0.90', label: '90%' },
  { value: '1.00', label: '100%' },
];

const SplitPayment = () => {
  const { user, profile } = useAuth();
  const { currentCompany } = useCompany();
  const navigate = useNavigate();
  const { isNavigator } = usePlanAccess();
  const { count: simulationCount, refetch: refetchCount } = useSimulationLimit('split-payment');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<SplitPaymentResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [cenario, setCenario] = useState<'TESTE_2026' | 'PADRAO_2027'>('PADRAO_2027');
  const [enterpriseModalOpen, setEnterpriseModalOpen] = useState(false);

  // Modalidade de recolhimento — relevante apenas para Simples Nacional (LC 214/2025)
  const [modalidadeSimples, setModalidadeSimples] = useState<'por_dentro' | 'por_fora'>('por_dentro');

  const faturamentoMensalInicial = currentCompany?.faturamento_anual
    ? (currentCompany.faturamento_anual / 12).toString()
    : profile?.faturamento_mensal?.toString() || "";

  const [formData, setFormData] = useState({
    empresa: currentCompany?.razao_social || profile?.empresa || "",
    faturamento_mensal: faturamentoMensalInicial,
    regime: currentCompany?.regime_tributario || profile?.regime || "",
    setor: currentCompany?.setor || profile?.setor || "",
    percentual_vendas_pj: profile?.percentual_vendas_pj?.toString() || "0.80",
  });

  useEffect(() => {
    if (currentCompany) {
      setFormData(prev => ({
        ...prev,
        empresa: currentCompany.razao_social || prev.empresa,
        faturamento_mensal: currentCompany.faturamento_anual
          ? (currentCompany.faturamento_anual / 12).toString()
          : prev.faturamento_mensal,
        regime: currentCompany.regime_tributario || prev.regime,
        setor: currentCompany.setor || prev.setor,
      }));
      setResult(null);
      setSaved(false);
    }
  }, [currentCompany?.id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const handleFaturamentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    handleChange("faturamento_mensal", rawValue);
  };

  const calcularSplitPayment = (faturamento_mensal: number, percentual_vendas_pj: number): SplitPaymentResult => {
    const aliquotas = ALIQUOTAS[cenario];
    const isSimples = formData.regime === 'SIMPLES';
    const isSimplesPorDentro = isSimples && modalidadeSimples === 'por_dentro';
    const isSimplesPorFora = isSimples && modalidadeSimples === 'por_fora';

    // IBS e CBS são calculados "por fora" (EC 132/2023, art. 156-A, IX)
    // O split payment retém na fonte o valor correspondente ao tributo
    const baseCalculo = faturamento_mensal * percentual_vendas_pj;

    let cbsMensal: number;
    let ibsMensal: number;
    let descricaoModalidade: string;

    if (isSimplesPorDentro) {
      // Por dentro do DAS: IBS/CBS embutidos com alíquota reduzida (~40% da alíquota cheia)
      // Sem destaque em nota fiscal → sem split payment separado → retenção menor
      const FATOR_REDUCAO_DAS = 0.40;
      cbsMensal = baseCalculo * aliquotas.CBS * FATOR_REDUCAO_DAS;
      ibsMensal = baseCalculo * aliquotas.IBS * FATOR_REDUCAO_DAS;
      descricaoModalidade = 'Simples Nacional — Por Dentro do DAS (alíquota reduzida, sem crédito para o comprador)';
    } else if (isSimplesPorFora) {
      // Por fora (Simples Híbrido): alíquota cheia, gera crédito integral para o comprador
      cbsMensal = baseCalculo * aliquotas.CBS;
      ibsMensal = baseCalculo * aliquotas.IBS;
      descricaoModalidade = 'Simples Nacional — Por Fora / Híbrido (alíquota cheia, crédito integral para o comprador)';
    } else {
      // Lucro Presumido / Lucro Real: split payment padrão com alíquota cheia
      cbsMensal = baseCalculo * aliquotas.CBS;
      ibsMensal = baseCalculo * aliquotas.IBS;
      descricaoModalidade = `${formData.regime === 'PRESUMIDO' ? 'Lucro Presumido' : 'Lucro Real'} — Split Payment padrão (alíquota cheia)`;
    }

    const retencaoBrutaMensal = cbsMensal + ibsMensal;

    // Estimativa de créditos recuperáveis por setor
    const CREDITOS_POR_SETOR: Record<string, number> = {
      industria: 0.65,
      comercio: 0.55,
      servicos: 0.25,
      tecnologia: 0.30,
      outro: 0.40,
    };

    const percentualCreditoSetor = isSimplesPorDentro
      ? 0
      : (CREDITOS_POR_SETOR[formData.setor] || 0.40);

    const creditoEstimadoMensal = retencaoBrutaMensal * percentualCreditoSetor;
    const impactoLiquidoMensal = retencaoBrutaMensal - creditoEstimadoMensal;

    const RANGE_VARIANCE = isSimplesPorDentro ? 0.10 : 0.15;

    const retencaoMin = retencaoBrutaMensal * (1 - RANGE_VARIANCE);
    const retencaoMax = retencaoBrutaMensal * (1 + RANGE_VARIANCE);

    return {
      mensal_min: retencaoMin,
      mensal_max: retencaoMax,
      anual_min: retencaoMin * 12,
      anual_max: retencaoMax * 12,
      percentual_faturamento: (retencaoBrutaMensal / faturamento_mensal) * 100,
      cbs_mensal: cbsMensal,
      ibs_mensal: ibsMensal,
      aliquota_total: (aliquotas.CBS + aliquotas.IBS) * 100 * (isSimplesPorDentro ? 0.40 : 1),
      credito_estimado_mensal: creditoEstimadoMensal,
      impacto_liquido_mensal: impactoLiquidoMensal,
      percentual_credito_setor: percentualCreditoSetor * 100,
      descricao_modalidade: descricaoModalidade,
    };
  };

  const handleCalculate = async () => {
    const erros: string[] = [];
    if (!formData.faturamento_mensal) erros.push("Faturamento Mensal");
    if (!formData.regime) erros.push("Regime Tributário");
    if (!formData.setor) erros.push("Setor");

    if (erros.length > 0) {
      toast({
        title: "Campos obrigatórios não preenchidos",
        description: `Preencha: ${erros.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    const faturamento = parseFloat(formData.faturamento_mensal);
    const percentual = parseFloat(formData.percentual_vendas_pj);

    setIsCalculating(true);
    
    // Simulate calculation delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const calculatedResult = calcularSplitPayment(faturamento, percentual);
    setResult(calculatedResult);
    setIsCalculating(false);

    // Contextual feedback
    const impactoLiquidoPercent = (calculatedResult.impacto_liquido_mensal / faturamento) * 100;
    const isSimplesPorDentro = formData.regime === 'SIMPLES' && modalidadeSimples === 'por_dentro';
    const isSimplesPorFora = formData.regime === 'SIMPLES' && modalidadeSimples === 'por_fora';

    if (isSimplesPorDentro) {
      toast({
        title: "Simples por dentro — impacto reduzido",
        description: `Retenção estimada em ~${impactoLiquidoPercent.toFixed(1)}% do faturamento. Atenção: seu cliente PJ não poderá se creditar de IBS/CBS nas compras feitas com você.`,
      });
    } else if (isSimplesPorFora) {
      toast({
        title: "Simples Híbrido — split payment com alíquota cheia",
        description: `Retenção de ~${impactoLiquidoPercent.toFixed(1)}% do faturamento, mas seu cliente PJ recebe crédito integral — vantagem competitiva no B2B.`,
      });
    } else if (impactoLiquidoPercent > 10) {
      toast({
        title: "Atenção: impacto relevante no fluxo de caixa",
        description: `O split payment pode comprometer ~${impactoLiquidoPercent.toFixed(1)}% do faturamento. Planeje reforço de capital de giro para 2027.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Simulação concluída",
        description: `Impacto líquido estimado: ${impactoLiquidoPercent.toFixed(1)}% do faturamento após créditos de IBS/CBS.`,
      });
    }

    // Auto-save simulation
    if (user) {
      setIsSaving(true);
      try {
        await supabase.from('simulations').insert([{
          user_id: user.id,
          company_id: currentCompany?.id || null,
          calculator_slug: 'split-payment',
          inputs: {
            empresa: formData.empresa,
            faturamento_mensal: faturamento,
            regime: formData.regime,
            setor: formData.setor,
            percentual_vendas_pj: percentual,
            cenario: cenario,
            modalidade_simples: modalidadeSimples,
          } as any,
          outputs: calculatedResult as any,
        }]);
        setSaved(true);
        await refetchCount();
      } catch (error) {
        console.error('Error saving simulation:', error);
      } finally {
        setIsSaving(false);
      }
    }

    // Scroll to result
    setTimeout(() => {
      document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReset = () => {
    setFormData({
      empresa: currentCompany?.razao_social || profile?.empresa || "",
      faturamento_mensal: "",
      regime: currentCompany?.regime_tributario || profile?.regime || "",
      setor: currentCompany?.setor || profile?.setor || "",
      percentual_vendas_pj: profile?.percentual_vendas_pj?.toString() || "0.80",
    });
    setResult(null);
    setSaved(false);
    setModalidadeSimples('por_dentro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSetorLabel = (setor: string) => {
    const labels: Record<string, string> = {
      industria: 'indústria',
      comercio: 'comércio',
      servicos: 'serviços',
      tecnologia: 'tecnologia',
      outro: 'seu setor',
    };
    return labels[setor] || setor;
  };

  const getRegimeLabel = (regime: string) => {
    const labels: Record<string, string> = {
      SIMPLES: 'Simples Nacional',
      PRESUMIDO: 'Lucro Presumido',
      REAL: 'Lucro Real',
    };
    return labels[regime] || regime;
  };

  // Usuários pagos (NAVIGATOR+) não precisam do gate de limite
  const showLimitGate = !isNavigator;

  return (
    <DashboardLayout title="Split Payment">
      <FeatureGateLimit feature="split_payment" usageCount={showLimitGate ? simulationCount : 0}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
          {" > "}
          <span>Calculadoras</span>
          {" > "}
          <span className="text-foreground">Split Payment</span>
        </nav>

        {/* Title */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Impacto do Split Payment</h1>
                <p className="text-muted-foreground">
                  Descubra quanto o Split Payment vai reter do seu faturamento a partir de 2027.
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
              <HelpButton toolSlug="split-payment" size="default" />
            </div>
          </div>
        </div>

        {/* Cenário Selector */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={cenario === 'TESTE_2026' ? 'default' : 'outline'}
            onClick={() => { setCenario('TESTE_2026'); setResult(null); }}
          >
            2026 — Teste (1%)
          </Button>
          <Button
            variant={cenario === 'PADRAO_2027' ? 'default' : 'outline'}
            onClick={() => { setCenario('PADRAO_2027'); setResult(null); }}
          >
            2027+ — Referência (26,5%)
          </Button>
        </div>

        {/* Modalidade Simples Nacional */}
        {formData.regime === 'SIMPLES' && (
          <div className="mb-6">
            <p className="text-sm font-medium text-foreground mb-2">
              Simples Nacional: como você vai recolher IBS/CBS?
            </p>
            <div className="flex gap-2">
              <Button
                variant={modalidadeSimples === 'por_dentro' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setModalidadeSimples('por_dentro'); setResult(null); }}
              >
                Por Dentro do DAS
              </Button>
              <Button
                variant={modalidadeSimples === 'por_fora' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setModalidadeSimples('por_fora'); setResult(null); }}
              >
                Por Fora (Híbrido)
              </Button>
            </div>
          </div>
        )}

        {/* Calculate Button - always visible */}
        <Button 
          onClick={handleCalculate} 
          size="lg" 
          className="w-full mb-6"
          disabled={isCalculating || !formData.faturamento_mensal}
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Calculando...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4 mr-2" />
              Calcular Impacto
            </>
          )}
        </Button>

        {/* Form - Collapsible */}
        <Collapsible defaultOpen={false} className="mb-8">
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3 cursor-pointer">
            <ChevronDown className="w-4 h-4" />
            Seus Dados (clique para ajustar)
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input
                      id="empresa"
                      value={formData.empresa}
                      onChange={(e) => handleChange("empresa", e.target.value)}
                      placeholder="Nome da empresa"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faturamento">Faturamento mensal</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                      <Input
                        id="faturamento"
                        value={formatInputCurrency(formData.faturamento_mensal)}
                        onChange={handleFaturamentoChange}
                        placeholder="0"
                        className="h-12 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Regime tributário</Label>
                    <Select value={formData.regime} onValueChange={(v) => handleChange("regime", v)}>
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
                    <Label>% das vendas para PJ</Label>
                    <Select value={formData.percentual_vendas_pj} onValueChange={(v) => handleChange("percentual_vendas_pj", v)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {PERCENTUAIS_PJ.map((p) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Result */}
        {result && (
          <Card id="resultado" className="border-primary/30 animate-fade-in">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-primary" />
                Resultado da Sua Simulação
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              {/* Main Result */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card border-2 border-primary/30 rounded-xl p-6 text-center shadow-sm">
                  <p className="text-sm text-muted-foreground mb-2">IMPACTO MENSAL</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(result.mensal_min)} - {formatCurrency(result.mensal_max)}
                  </p>
                </div>
                <div className="bg-card border-2 border-primary/30 rounded-xl p-6 text-center shadow-sm">
                  <p className="text-sm text-muted-foreground mb-2">IMPACTO ANUAL</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(result.anual_min)} - {formatCurrency(result.anual_max)}
                  </p>
                </div>
              </div>

              {/* Tax Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">CBS (Federal)</p>
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(result.cbs_mensal)}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {cenario === 'TESTE_2026' ? '0,9%' : '8,8%'}
                  </Badge>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">IBS (Est/Mun)</p>
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(result.ibs_mensal)}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {cenario === 'TESTE_2026' ? '0,1%' : '17,7%'}
                  </Badge>
                </div>
                <div className="bg-card border-2 border-primary rounded-lg p-4 text-center shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">TOTAL IVA</p>
                  <p className="text-lg font-semibold text-primary">{result.aliquota_total.toFixed(1)}%</p>
                  <Badge variant="default" className="mt-1 text-xs">
                    LC 214/2025
                  </Badge>
                </div>
              </div>

              {/* Impacto Líquido com Créditos */}
              {formData.setor && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-success/5 border-2 border-success/30 rounded-xl p-5 text-center">
                    <p className="text-xs text-muted-foreground mb-1">CRÉDITO ESTIMADO/MÊS</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {result.percentual_credito_setor > 0
                        ? `~${result.percentual_credito_setor.toFixed(0)}% de recuperação (${getSetorLabel(formData.setor)})`
                        : 'Simples por dentro não gera crédito para o comprador'}
                    </p>
                    <p className="text-xl font-bold text-success">
                      {result.percentual_credito_setor > 0
                        ? `+ ${formatCurrency(result.credito_estimado_mensal)}`
                        : 'R$ 0'}
                    </p>
                  </div>
                  <div className="bg-warning/5 border-2 border-warning/30 rounded-xl p-5 text-center">
                    <p className="text-xs text-muted-foreground mb-1">IMPACTO LÍQUIDO NO CAIXA/MÊS</p>
                    <p className="text-xs text-muted-foreground mb-2">retenção bruta menos créditos recuperados</p>
                    <p className="text-xl font-bold text-warning">
                      {formatCurrency(result.impacto_liquido_mensal)}
                    </p>
                  </div>
                </div>
              )}

              {/* Badge de modalidade */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground text-center">
                📋 {result.descricao_modalidade}
              </div>

              {/* Explanation */}
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-accent" />
                  O Que Isso Significa
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Para uma operação de <strong>{getSetorLabel(formData.setor)}</strong> no <strong>{getRegimeLabel(formData.regime)}</strong> com 
                  faturamento de <strong>{formatCurrency(parseFloat(formData.faturamento_mensal))}/mês</strong>, o split payment 
                  vai reter aproximadamente <strong>{result.percentual_faturamento.toFixed(1)}%</strong> do valor antes de chegar no seu caixa.
                </p>
                <p className="text-muted-foreground mt-3">
                  Em 12 meses, estamos falando de <strong>{formatCurrency(result.anual_min)}</strong> a <strong>{formatCurrency(result.anual_max)}</strong> de 
                  capital de giro comprometido.
                </p>
                {cenario === 'TESTE_2026' && (
                  <p className="text-sm text-primary mt-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Em 2026, esses valores serão compensados com PIS/COFINS (impacto líquido zero).
                  </p>
                )}
              </div>

              {/* Next Steps */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Próximos Passos Sugeridos
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Revisar projeção de fluxo de caixa para 2026/2027</li>
                  <li>Avaliar necessidade de capital de giro adicional</li>
                  <li>Adaptar sistemas ERP ao Portal RTC da Receita Federal</li>
                  <li>Considerar antecipação de recebíveis</li>
                </ol>
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

              {/* CTA Enterprise */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <div className="text-center mb-4">
                  <p className="text-foreground font-semibold text-lg mb-2">
                    Quer reduzir esse impacto no seu caixa?
                  </p>
                  <p className="text-muted-foreground text-sm">
                    O Plano Enterprise oferece consultoria personalizada para compensar o efeito do Split Payment na sua operação.
                  </p>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-3 mb-4">
                  <div className="bg-card border border-border rounded-lg p-3 text-center shadow-sm">
                    <Search className="w-6 h-6 text-primary mx-auto" />
                    <p className="text-xs text-foreground mt-1">Consultoria personalizada com especialistas tributários</p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-3 text-center shadow-sm">
                    <BarChart3 className="w-6 h-6 text-primary mx-auto" />
                    <p className="text-xs text-foreground mt-1">Palestras sobre Reforma Tributária</p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-3 text-center shadow-sm">
                    <DollarSignIcon className="w-6 h-6 text-primary mx-auto" />
                    <p className="text-xs text-foreground mt-1">White Label e parcerias estratégicas</p>
                  </div>
                </div>

                <div className="text-center">
                  <Button variant="default" size="lg" onClick={() => setEnterpriseModalOpen(true)}>
                    Conhecer Plano Enterprise
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Empresas que usam o diagnóstico completo economizam em média 15% a 40% em tributos
                  </p>
                </div>
              </div>

              <EnterpriseModal open={enterpriseModalOpen} onOpenChange={setEnterpriseModalOpen} />

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
        )}
      </div>
      </FeatureGateLimit>
    </DashboardLayout>
  );
};

export default SplitPayment;
