import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, ArrowLeft, Scale, Info, Star, AlertTriangle, RefreshCw, FileDown, Loader2, CheckCircle, Calendar, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface RegimeResult {
  simples: number | null;
  presumido: number;
  real: number;
  melhor_opcao: string;
  economia_mensal: number;
  economia_anual: number;
  simples_elegivel: boolean;
}

const MARGENS_LUCRO = [
  { value: '0.075', label: '5% - 10%' },
  { value: '0.125', label: '10% - 15%' },
  { value: '0.175', label: '15% - 20%' },
  { value: '0.25', label: '20% - 30%' },
  { value: '0.35', label: '30% - 40%' },
  { value: '0.45', label: 'Acima de 40%' },
];

const ComparativoRegimes = () => {
  const { user, profile } = useAuth();
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<RegimeResult | null>(null);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    faturamento_mensal: profile?.faturamento_mensal?.toString() || "",
    margem_lucro: "0.25",
    folha_pagamento: "",
    setor: profile?.setor || "",
    regime_atual: profile?.regime || "",
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

    // Lucro Real
    const real_irpj = lucro_mensal * 0.15 + Math.max(0, lucro_mensal - 20000) * 0.10;
    const real_csll = lucro_mensal * 0.09;
    const real_pis = faturamento_mensal * 0.0165;
    const real_cofins = faturamento_mensal * 0.076;
    const real_iss_icms = faturamento_mensal * 0.05;
    // Estimated credits (simplified)
    const creditos_estimados = faturamento_mensal * 0.03;
    const total_real = real_irpj + real_csll + real_pis + real_cofins + real_iss_icms - creditos_estimados;

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
        await supabase.from('simulations').insert([{
          user_id: user.id,
          calculator_slug: 'comparativo-regimes',
          inputs: {
            faturamento_mensal: faturamento,
            margem_lucro: parseFloat(formData.margem_lucro),
            folha_pagamento: parseFloat(formData.folha_pagamento) || null,
            setor: formData.setor,
            regime_atual: formData.regime_atual,
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
          <span className="text-foreground">Comparativo de Regimes</span>
        </nav>

        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Comparativo de Regimes Tributários</h1>
          </div>
          <p className="text-muted-foreground">
            Descubra qual regime é mais vantajoso para sua empresa.
          </p>
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
                <Label>Margem de lucro</Label>
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
          <Card id="resultado" className="border-primary/30 animate-fade-in">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Comparativo dos Regimes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              {/* Regime Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* Simples Nacional */}
                <div className={`rounded-xl p-6 text-center border-2 transition-all ${
                  !result.simples_elegivel 
                    ? 'bg-muted/30 border-muted opacity-60' 
                    : result.melhor_opcao === 'SIMPLES' 
                      ? 'bg-secondary/10 border-secondary' 
                      : 'bg-muted/50 border-border'
                }`}>
                  <p className="text-sm font-medium text-muted-foreground mb-2">SIMPLES</p>
                  {result.simples_elegivel && result.simples !== null ? (
                    <>
                      <p className="text-2xl font-bold text-foreground mb-2">
                        {formatCurrency(result.simples)}<span className="text-sm font-normal">/mês</span>
                      </p>
                      {result.melhor_opcao === 'SIMPLES' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary">
                          <Star className="w-3 h-3" /> MELHOR
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">Inelegível</span>
                    </div>
                  )}
                </div>

                {/* Lucro Presumido */}
                <div className={`rounded-xl p-6 text-center border-2 transition-all ${
                  result.melhor_opcao === 'PRESUMIDO' 
                    ? 'bg-secondary/10 border-secondary' 
                    : 'bg-muted/50 border-border'
                }`}>
                  <p className="text-sm font-medium text-muted-foreground mb-2">PRESUMIDO</p>
                  <p className="text-2xl font-bold text-foreground mb-2">
                    {formatCurrency(result.presumido)}<span className="text-sm font-normal">/mês</span>
                  </p>
                  {result.melhor_opcao === 'PRESUMIDO' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary">
                      <Star className="w-3 h-3" /> MELHOR
                    </span>
                  )}
                </div>

                {/* Lucro Real */}
                <div className={`rounded-xl p-6 text-center border-2 transition-all ${
                  result.melhor_opcao === 'REAL' 
                    ? 'bg-secondary/10 border-secondary' 
                    : 'bg-muted/50 border-border'
                }`}>
                  <p className="text-sm font-medium text-muted-foreground mb-2">LUCRO REAL</p>
                  <p className="text-2xl font-bold text-foreground mb-2">
                    {formatCurrency(result.real)}<span className="text-sm font-normal">/mês</span>
                  </p>
                  {result.melhor_opcao === 'REAL' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary">
                      <Star className="w-3 h-3" /> MELHOR
                    </span>
                  )}
                </div>
              </div>

              {/* Savings */}
              {result.economia_anual > 0 && formData.regime_atual && (
                <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-secondary" />
                    Economia Potencial
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Seu regime atual</p>
                      <p className="font-semibold text-foreground">{getRegimeLabel(formData.regime_atual)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Regime recomendado</p>
                      <p className="font-semibold text-secondary">{getRegimeLabel(result.melhor_opcao)}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-secondary/20">
                    <p className="text-sm text-muted-foreground">Economia estimada</p>
                    <p className="text-2xl font-bold text-secondary">
                      {formatCurrency(result.economia_anual)} / ano
                    </p>
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-accent" />
                  Importante
                </h3>
                <p className="text-muted-foreground">
                  A mudança de regime só pode ser feita no início do ano-calendário. 
                  Planeje com antecedência.
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
                  Quer ajuda para mudar de regime?
                </p>
                <Button variant="default" asChild>
                  <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar consultoria
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
                * Valores são estimativas baseadas em médias de mercado e alíquotas simplificadas. 
                Consulte um contador para análise detalhada.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ComparativoRegimes;
