import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Info, TrendingDown, Calendar, RefreshCw, FileDown, Loader2, CheckCircle, Calculator, AlertTriangle, Trash2 } from "lucide-react";
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

interface SplitPaymentResult {
  mensal_min: number;
  mensal_max: number;
  anual_min: number;
  anual_max: number;
  percentual_faturamento: number;
  cbs_mensal: number;
  ibs_mensal: number;
  aliquota_total: number;
}

// Alíquotas oficiais conforme LC 214/2025 e Manual RTC (13/01/2026)
const ALIQUOTAS = {
  // 2026: Alíquotas-teste (fase piloto - compensadas com PIS/COFINS)
  TESTE_2026: {
    CBS: 0.009,  // 0,9%
    IBS: 0.001,  // 0,1%
    TOTAL: 0.01, // 1%
    label: "2026 (Teste)",
  },
  // 2027+: Alíquotas de referência estimadas
  PADRAO_2027: {
    CBS: 0.093,   // 9,3%
    IBS: 0.187,   // 18,7%
    TOTAL: 0.28,  // 28%
    label: "2027+ (Padrão)",
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
  const navigate = useNavigate();
  const { isNavigator } = usePlanAccess();
  const { count: simulationCount, refetch: refetchCount } = useSimulationLimit('split-payment');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<SplitPaymentResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [cenario, setCenario] = useState<'TESTE_2026' | 'PADRAO_2027'>('PADRAO_2027');

  const [formData, setFormData] = useState({
    empresa: profile?.empresa || "",
    faturamento_mensal: profile?.faturamento_mensal?.toString() || "",
    regime: profile?.regime || "",
    setor: profile?.setor || "",
    percentual_vendas_pj: profile?.percentual_vendas_pj?.toString() || "0.80",
  });

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
    const RANGE_VARIANCE = 0.15;
    
    const baseCalculo = faturamento_mensal * percentual_vendas_pj;
    
    // Cálculo por tributo
    const cbsMensal = baseCalculo * aliquotas.CBS;
    const ibsMensal = baseCalculo * aliquotas.IBS;
    const retencaoBase = cbsMensal + ibsMensal;
    
    const retencaoMin = retencaoBase * (1 - RANGE_VARIANCE);
    const retencaoMax = retencaoBase * (1 + RANGE_VARIANCE);
    
    return {
      mensal_min: retencaoMin,
      mensal_max: retencaoMax,
      anual_min: retencaoMin * 12,
      anual_max: retencaoMax * 12,
      percentual_faturamento: (retencaoBase / faturamento_mensal) * 100,
      cbs_mensal: cbsMensal,
      ibs_mensal: ibsMensal,
      aliquota_total: aliquotas.TOTAL * 100,
    };
  };

  const handleCalculate = async () => {
    const faturamento = parseFloat(formData.faturamento_mensal);
    const percentual = parseFloat(formData.percentual_vendas_pj);

    if (!faturamento || !percentual) {
      toast({
        title: "Dados incompletos",
        description: "Preencha o faturamento e o percentual de vendas PJ.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    
    // Simulate calculation delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const calculatedResult = calcularSplitPayment(faturamento, percentual);
    setResult(calculatedResult);
    setIsCalculating(false);

    // Auto-save simulation
    if (user) {
      setIsSaving(true);
      try {
        await supabase.from('simulations').insert([{
          user_id: user.id,
          calculator_slug: 'split-payment',
          inputs: {
            empresa: formData.empresa,
            faturamento_mensal: faturamento,
            regime: formData.regime,
            setor: formData.setor,
            percentual_vendas_pj: percentual,
            cenario: cenario,
          } as any,
          outputs: calculatedResult as any,
        }]);
        setSaved(true);
        // Atualiza contagem para refletir nova simulação
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
      empresa: profile?.empresa || "",
      faturamento_mensal: "",
      regime: "",
      setor: "",
      percentual_vendas_pj: "0.80",
    });
    setResult(null);
    setSaved(false);
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
                  Calcule a retenção de caixa com base nas alíquotas oficiais da LC 214/2025 e Manual RTC.
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
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Cenário de Simulação</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={cenario === 'TESTE_2026' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setCenario('TESTE_2026'); setResult(null); }}
                >
                  2026 (Teste: 1%)
                </Button>
                <Button
                  variant={cenario === 'PADRAO_2027' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setCenario('PADRAO_2027'); setResult(null); }}
                >
                  2027+ (Padrão: 28%)
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {cenario === 'TESTE_2026' 
                ? "Em 2026, as alíquotas são simbólicas (CBS 0,9% + IBS 0,1%) e compensadas com PIS/COFINS."
                : "A partir de 2027, entram as alíquotas de referência (CBS 9,3% + IBS 18,7% = 28%)."
              }
            </p>
          </CardContent>
        </Card>

        {/* Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Seus Dados
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Esses dados vêm do seu perfil. Você pode ajustá-los para simular cenários diferentes.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
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

            <Button 
              onClick={handleCalculate} 
              size="lg" 
              className="w-full"
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
          </CardContent>
        </Card>

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
                    {cenario === 'TESTE_2026' ? '0,9%' : '9,3%'}
                  </Badge>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">IBS (Est/Mun)</p>
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(result.ibs_mensal)}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {cenario === 'TESTE_2026' ? '0,1%' : '18,7%'}
                  </Badge>
                </div>
                <div className="bg-card border-2 border-primary rounded-lg p-4 text-center shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">TOTAL IVA</p>
                  <p className="text-lg font-semibold text-primary">{result.aliquota_total.toFixed(0)}%</p>
                  <Badge variant="default" className="mt-1 text-xs">
                    LC 214/2025
                  </Badge>
                </div>
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

              {/* CTA Professional */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <div className="text-center mb-4">
                  <p className="text-foreground font-semibold text-lg mb-2">
                    Quer reduzir esse impacto no seu caixa?
                  </p>
                  <p className="text-muted-foreground text-sm">
                    O Plano Professional identifica oportunidades de economia que podem compensar o efeito do Split Payment.
                  </p>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-3 mb-4">
                  <div className="bg-card border border-border rounded-lg p-3 text-center shadow-sm">
                    <p className="text-2xl font-bold text-primary">🔍</p>
                    <p className="text-xs text-foreground mt-1">Análise de XMLs para identificar créditos perdidos</p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-3 text-center shadow-sm">
                    <p className="text-2xl font-bold text-primary">📊</p>
                    <p className="text-xs text-foreground mt-1">DRE Inteligente com impacto da reforma</p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-3 text-center shadow-sm">
                    <p className="text-2xl font-bold text-primary">💰</p>
                    <p className="text-xs text-foreground mt-1">Radar de 57 oportunidades tributárias</p>
                  </div>
                </div>

                <div className="text-center">
                  <Button variant="default" size="lg" asChild>
                    <Link to="/#planos">
                      Conhecer Plano Professional
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Empresas que usam o diagnóstico completo economizam em média 15% a 40% em tributos
                  </p>
                </div>
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
        )}
      </div>
      </FeatureGateLimit>
    </DashboardLayout>
  );
};

export default SplitPayment;
