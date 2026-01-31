import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, Briefcase, Landmark, Calculator, ChevronRight, ChevronLeft, Loader2, CheckCircle2, Users, Building2, Settings, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { VoiceCurrencyInput } from './VoiceCurrencyInput';

interface DREFormData {
  vendas_produtos: number;
  vendas_servicos: number;
  outras_receitas: number;
  devolucoes: number;
  descontos: number;
  custo_mercadorias: number;
  custo_materiais: number;
  mao_obra_direta: number;
  servicos_terceiros: number;
  salarios_encargos: number;
  prolabore: number;
  aluguel: number;
  energia_agua_internet: number;
  marketing: number;
  software: number;
  contador_juridico: number;
  viagens: number;
  manutencao: number;
  frete: number;
  outras_despesas: number;
  juros_pagos: number;
  juros_recebidos: number;
  tarifas: number;
  multas: number;
  regime_tributario: string;
  impostos_vendas: number;
  calcular_auto: boolean;
  simular_reforma: boolean;
}

const initialFormData: DREFormData = {
  vendas_produtos: 0, vendas_servicos: 0, outras_receitas: 0, devolucoes: 0, descontos: 0,
  custo_mercadorias: 0, custo_materiais: 0, mao_obra_direta: 0, servicos_terceiros: 0,
  salarios_encargos: 0, prolabore: 0, aluguel: 0, energia_agua_internet: 0, marketing: 0,
  software: 0, contador_juridico: 0, viagens: 0, manutencao: 0, frete: 0, outras_despesas: 0,
  juros_pagos: 0, juros_recebidos: 0, tarifas: 0, multas: 0,
  regime_tributario: 'presumido', impostos_vendas: 0, calcular_auto: true, simular_reforma: true
};

const steps = [
  { id: 1, title: 'Suas Vendas', icon: ShoppingCart },
  { id: 2, title: 'Custos', icon: Package },
  { id: 3, title: 'Despesas', icon: Briefcase },
  { id: 4, title: 'Financeiro', icon: Landmark },
  { id: 5, title: 'Impostos', icon: Calculator },
];

interface DREWizardProps {
  onComplete?: (dreId: string) => void;
  initialData?: Partial<DREFormData>;
}

export function DREWizard({ onComplete, initialData }: DREWizardProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DREFormData>({ ...initialFormData, ...initialData });
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getPeriodLabel = () => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${monthNames[selectedMonth - 1]}/${selectedYear}`;
  };

  const handleInputChange = (field: keyof DREFormData, value: number | string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const parseCurrencyInput = (value: string): number => {
    const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const receitaBruta = formData.vendas_produtos + formData.vendas_servicos + formData.outras_receitas;
  const deducoes = formData.devolucoes + formData.descontos;
  const receitaLiquida = receitaBruta - deducoes;
  const custosTotal = formData.custo_mercadorias + formData.custo_materiais + formData.mao_obra_direta + formData.servicos_terceiros;
  const lucroBruto = receitaLiquida - custosTotal;
  const margemBruta = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;

  const handleSubmit = async () => {
    if (!user) { toast.error('Você precisa estar logado'); return; }
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('process-dre', {
        body: { inputs: formData, cnae_code: profile?.cnae || null, period: { type: 'monthly', month: selectedMonth, year: selectedYear } }
      });
      if (response.error) throw response.error;
      toast.success('DRE calculado com sucesso!');
      if (onComplete && response.data?.savedDre?.id) { onComplete(response.data.savedDre.id); }
      else { navigate('/dashboard/dre-resultados'); }
    } catch (error) {
      console.error('Error processing DRE:', error);
      toast.error('Erro ao processar DRE');
    } finally { setLoading(false); }
  };

  // Helper to get numeric value safely
  const getNumValue = (field: keyof DREFormData) => {
    const v = formData[field];
    return typeof v === 'number' ? v : 0;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-semibold mb-2">Quanto sua empresa vendeu em {getPeriodLabel()}?</h3><p className="text-sm text-muted-foreground mb-6">Informe os valores totais de vendas de {getPeriodLabel()}</p></div>
            <div className="grid gap-4 md:grid-cols-2">
              <VoiceCurrencyInput label="Vendas de produtos" field="vendas_produtos" value={getNumValue('vendas_produtos')} onChange={(v) => handleInputChange('vendas_produtos', v)} tooltip="Total de notas fiscais de produtos vendidos" placeholder="150.000" />
              <VoiceCurrencyInput label="Vendas de serviços" field="vendas_servicos" value={getNumValue('vendas_servicos')} onChange={(v) => handleInputChange('vendas_servicos', v)} tooltip="Total de notas de serviço emitidas" placeholder="80.000" />
              <VoiceCurrencyInput label="Outras receitas" field="outras_receitas" value={getNumValue('outras_receitas')} onChange={(v) => handleInputChange('outras_receitas', v)} tooltip="Aluguéis, comissões, rendimentos, etc" placeholder="5.000" />
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-4">Deduções da receita</p>
              <div className="grid gap-4 md:grid-cols-2">
                <VoiceCurrencyInput label="Devoluções" field="devolucoes" value={getNumValue('devolucoes')} onChange={(v) => handleInputChange('devolucoes', v)} tooltip="Vendas canceladas ou devolvidas" placeholder="3.000" />
                <VoiceCurrencyInput label="Descontos concedidos" field="descontos" value={getNumValue('descontos')} onChange={(v) => handleInputChange('descontos', v)} tooltip="Descontos dados aos clientes" placeholder="2.000" />
              </div>
            </div>
            <Card className="bg-muted/50"><CardContent className="pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Receita Bruta:</span><span className="font-semibold">{formatCurrency(receitaBruta)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>(-) Deduções:</span><span>{formatCurrency(deducoes)}</span></div>
                <div className="flex justify-between font-bold pt-2 border-t"><span>= Receita Líquida:</span><span className="text-primary">{formatCurrency(receitaLiquida)}</span></div>
              </div>
            </CardContent></Card>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-semibold mb-2">Quanto custou o que você vendeu em {getPeriodLabel()}?</h3><p className="text-sm text-muted-foreground mb-6">Custos diretamente ligados às vendas de {getPeriodLabel()}</p></div>
            <div className="grid gap-4 md:grid-cols-2">
              <VoiceCurrencyInput label="Custo das mercadorias" field="custo_mercadorias" value={getNumValue('custo_mercadorias')} onChange={(v) => handleInputChange('custo_mercadorias', v)} tooltip="Valor pago aos fornecedores" />
              <VoiceCurrencyInput label="Custo de materiais" field="custo_materiais" value={getNumValue('custo_materiais')} onChange={(v) => handleInputChange('custo_materiais', v)} tooltip="Matéria-prima, insumos, embalagens" />
              <VoiceCurrencyInput label="Mão de obra direta" field="mao_obra_direta" value={getNumValue('mao_obra_direta')} onChange={(v) => handleInputChange('mao_obra_direta', v)} tooltip="Salários da equipe de produção" />
              <VoiceCurrencyInput label="Serviços de terceiros" field="servicos_terceiros" value={getNumValue('servicos_terceiros')} onChange={(v) => handleInputChange('servicos_terceiros', v)} tooltip="Freelancers, fábricas terceirizadas" />
            </div>
            <Card className="bg-muted/50"><CardContent className="pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Receita Líquida:</span><span>{formatCurrency(receitaLiquida)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>(-) Custos:</span><span>{formatCurrency(custosTotal)}</span></div>
                <div className="flex justify-between font-bold pt-2 border-t"><span>= Lucro Bruto:</span><span className={lucroBruto >= 0 ? 'text-emerald-600' : 'text-red-600'}>{formatCurrency(lucroBruto)}</span></div>
                <div className="flex justify-between text-sm items-center"><span>Margem Bruta:</span><span className={`flex items-center gap-1 ${margemBruta >= 30 ? 'text-emerald-600' : 'text-amber-600'}`}>{margemBruta.toFixed(1)}% {margemBruta >= 30 ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-amber-500">⚠</span>}</span></div>
              </div>
            </CardContent></Card>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-semibold mb-2">Quanto você gastou para manter a empresa em {getPeriodLabel()}?</h3><p className="text-sm text-muted-foreground mb-6">Despesas operacionais de {getPeriodLabel()}</p></div>
            <div className="space-y-6">
              <div><h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Pessoas</h4><div className="grid gap-4 md:grid-cols-2"><VoiceCurrencyInput label="Salários + encargos" field="salarios_encargos" value={getNumValue('salarios_encargos')} onChange={(v) => handleInputChange('salarios_encargos', v)} tooltip="Folha de pagamento" /><VoiceCurrencyInput label="Pró-labore dos sócios" field="prolabore" value={getNumValue('prolabore')} onChange={(v) => handleInputChange('prolabore', v)} tooltip="Retiradas mensais dos sócios" /></div></div>
              <div><h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2"><Building2 className="w-4 h-4" /> Estrutura</h4><div className="grid gap-4 md:grid-cols-3"><VoiceCurrencyInput label="Aluguel" field="aluguel" value={getNumValue('aluguel')} onChange={(v) => handleInputChange('aluguel', v)} /><VoiceCurrencyInput label="Energia, água, internet" field="energia_agua_internet" value={getNumValue('energia_agua_internet')} onChange={(v) => handleInputChange('energia_agua_internet', v)} /><VoiceCurrencyInput label="Software e assinaturas" field="software" value={getNumValue('software')} onChange={(v) => handleInputChange('software', v)} /></div></div>
              <div><h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2"><Settings className="w-4 h-4" /> Operação</h4><div className="grid gap-4 md:grid-cols-3"><VoiceCurrencyInput label="Marketing" field="marketing" value={getNumValue('marketing')} onChange={(v) => handleInputChange('marketing', v)} /><VoiceCurrencyInput label="Contador, advogado" field="contador_juridico" value={getNumValue('contador_juridico')} onChange={(v) => handleInputChange('contador_juridico', v)} /><VoiceCurrencyInput label="Viagens, alimentação" field="viagens" value={getNumValue('viagens')} onChange={(v) => handleInputChange('viagens', v)} /><VoiceCurrencyInput label="Manutenção" field="manutencao" value={getNumValue('manutencao')} onChange={(v) => handleInputChange('manutencao', v)} /><VoiceCurrencyInput label="Frete e logística" field="frete" value={getNumValue('frete')} onChange={(v) => handleInputChange('frete', v)} /><VoiceCurrencyInput label="Outras despesas" field="outras_despesas" value={getNumValue('outras_despesas')} onChange={(v) => handleInputChange('outras_despesas', v)} /></div></div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-semibold mb-2">Receitas e despesas financeiras de {getPeriodLabel()}</h3><p className="text-sm text-muted-foreground mb-6">Juros, tarifas e custos financeiros de {getPeriodLabel()}</p></div>
            <div className="grid gap-4 md:grid-cols-2">
              <VoiceCurrencyInput label="Juros pagos" field="juros_pagos" value={getNumValue('juros_pagos')} onChange={(v) => handleInputChange('juros_pagos', v)} tooltip="Empréstimos, cartões, cheque especial" />
              <VoiceCurrencyInput label="Juros recebidos" field="juros_recebidos" value={getNumValue('juros_recebidos')} onChange={(v) => handleInputChange('juros_recebidos', v)} tooltip="Rendimentos de aplicações" />
              <VoiceCurrencyInput label="Tarifas bancárias" field="tarifas" value={getNumValue('tarifas')} onChange={(v) => handleInputChange('tarifas', v)} tooltip="DOC, TED, taxas de maquininha" />
              <VoiceCurrencyInput label="Multas por atraso" field="multas" value={getNumValue('multas')} onChange={(v) => handleInputChange('multas', v)} tooltip="Multas pagas a fornecedores ou governo" />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-semibold mb-2">Como sua empresa pagou impostos em {getPeriodLabel()}?</h3><p className="text-sm text-muted-foreground mb-6">Regime tributário e impostos de {getPeriodLabel()}</p></div>
            <div className="space-y-4">
              <Label>Regime Tributário</Label>
              <RadioGroup value={formData.regime_tributario} onValueChange={(value) => handleInputChange('regime_tributario', value)} className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted"><RadioGroupItem value="simples" id="simples" /><Label htmlFor="simples" className="cursor-pointer">Simples Nacional</Label></div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted"><RadioGroupItem value="presumido" id="presumido" /><Label htmlFor="presumido" className="cursor-pointer">Lucro Presumido</Label></div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted"><RadioGroupItem value="real" id="real" /><Label htmlFor="real" className="cursor-pointer">Lucro Real</Label></div>
              </RadioGroup>
            </div>
            <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg"><Switch id="calcular_auto" checked={formData.calcular_auto} onCheckedChange={(checked) => handleInputChange('calcular_auto', checked)} /><Label htmlFor="calcular_auto">Calcular impostos automaticamente</Label></div>
            {!formData.calcular_auto && <VoiceCurrencyInput label="Impostos sobre vendas (PIS, COFINS, ICMS, ISS)" field="impostos_vendas" value={getNumValue('impostos_vendas')} onChange={(v) => handleInputChange('impostos_vendas', v)} tooltip="Valor total de impostos sobre o faturamento" />}
            <div className="flex items-center space-x-2 p-4 bg-primary/5 border border-primary/20 rounded-lg"><Switch id="simular_reforma" checked={formData.simular_reforma} onCheckedChange={(checked) => handleInputChange('simular_reforma', checked)} /><div><Label htmlFor="simular_reforma" className="text-primary flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Ver impacto da Reforma Tributária</Label><p className="text-xs text-muted-foreground">Simula como ficará sua carga tributária após 2027</p></div></div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">DRE Inteligente</h2><p className="text-muted-foreground">Preencha os dados e receba um diagnóstico completo</p></div>
        <div className="flex gap-2">
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}><SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger><SelectContent>{['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((m, i) => (<SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>))}</SelectContent></Select>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}><SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger><SelectContent>{[2024, 2025, 2026].map((y) => (<SelectItem key={y} value={y.toString()}>{y}</SelectItem>))}</SelectContent></Select>
        </div>
      </div>
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step) => {
            const StepIcon = step.icon;
            return (
              <div key={step.id} className={`flex flex-col items-center ${step.id === currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${step.id < currentStep ? 'bg-primary text-primary-foreground' : step.id === currentStep ? 'bg-primary/20 border-2 border-primary' : 'bg-muted'}`}>
                  {step.id < currentStep ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                </div>
                <span className="text-xs hidden sm:block">{step.title}</span>
              </div>
            );
          })}
        </div>
        <Progress value={(currentStep / 5) * 100} className="h-2" />
      </div>
      <Card><CardHeader className="pb-4"><CardTitle className="flex items-center gap-2 text-lg">{(() => { const StepIcon = steps[currentStep - 1].icon; return <StepIcon className="w-5 h-5 text-primary" />; })()} {steps[currentStep - 1].title}</CardTitle></CardHeader><CardContent>{renderStep()}</CardContent></Card>
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 1}><ChevronLeft className="h-4 w-4 mr-2" />Voltar</Button>
        {currentStep < 5 ? (<Button onClick={() => setCurrentStep(prev => prev + 1)}>Próximo<ChevronRight className="h-4 w-4 ml-2" /></Button>) : (<Button onClick={handleSubmit} disabled={loading}>{loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Calculando...</>) : (<><Calculator className="h-4 w-4 mr-2" />Gerar DRE e Diagnóstico</>)}</Button>)}
      </div>
    </div>
  );
}
