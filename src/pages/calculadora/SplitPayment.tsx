import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, ArrowLeft, Wallet, Info, TrendingDown, Calendar, RefreshCw, FileDown, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SplitPaymentResult {
  mensal_min: number;
  mensal_max: number;
  anual_min: number;
  anual_max: number;
  percentual_faturamento: number;
}

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
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<SplitPaymentResult | null>(null);
  const [saved, setSaved] = useState(false);

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
    const ALIQUOTA_IVA = 0.28;
    const RANGE_VARIANCE = 0.15;
    
    const baseCalculo = faturamento_mensal * percentual_vendas_pj;
    const retencaoBase = baseCalculo * ALIQUOTA_IVA;
    
    const retencaoMin = retencaoBase * (1 - RANGE_VARIANCE);
    const retencaoMax = retencaoBase * (1 + RANGE_VARIANCE);
    
    return {
      mensal_min: retencaoMin,
      mensal_max: retencaoMax,
      anual_min: retencaoMin * 12,
      anual_max: retencaoMax * 12,
      percentual_faturamento: (retencaoBase / faturamento_mensal) * 100
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
          } as any,
          outputs: calculatedResult as any,
        }]);
        setSaved(true);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Calculator className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">TribuTech</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Impacto do Split Payment</h1>
          </div>
          <p className="text-muted-foreground">
            Descubra quanto vai ficar retido no seu caixa com o novo sistema.
          </p>
        </div>

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
                <div className="bg-muted/50 rounded-xl p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">IMPACTO MENSAL</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(result.mensal_min)} - {formatCurrency(result.mensal_max)}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">IMPACTO ANUAL</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(result.anual_min)} - {formatCurrency(result.anual_max)}
                  </p>
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
              </div>

              {/* Next Steps */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Próximos Passos Sugeridos
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Revisar projeção de fluxo de caixa para 2026</li>
                  <li>Avaliar necessidade de capital de giro adicional</li>
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

              {/* CTA */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
                <p className="text-foreground font-medium mb-3">
                  Quer validar esses números com um especialista?
                </p>
                <Button variant="default" asChild>
                  <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar diagnóstico gratuito
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

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground text-center">
                * Valores são estimativas baseadas em médias de mercado. 
                Não constituem parecer técnico ou promessa de resultado.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default SplitPayment;
