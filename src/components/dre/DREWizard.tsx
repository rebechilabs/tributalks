import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, Briefcase, Landmark, Calculator, ChevronRight, ChevronLeft, Loader2, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
  { id: 1, title: 'Suas Vendas', icon: ShoppingCart, emoji: '🛒' },
  { id: 2, title: 'Custos', icon: Package, emoji: '📦' },
  { id: 3, title: 'Despesas', icon: Briefcase, emoji: '💼' },
  { id: 4, title: 'Financeiro', icon: Landmark, emoji: '🏦' },
  { id: 5, title: 'Impostos', icon: Calculator, emoji: '🏛️' },
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

  const CurrencyInput = ({ label, field, tooltip, placeholder }: { label: string; field: keyof DREFormData; tooltip?: string; placeholder?: string }) => {
    const fieldValue = formData[field];
    const displayValue = typeof fieldValue === 'number' ? (fieldValue === 0 ? '' : fieldValue.toString()) : '';
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={field} className="text-sm font-medium">{label}</Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                <TooltipContent><p className="max-w-xs text-sm">{tooltip}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
          <Input id={field} type="text" className="pl-10" placeholder={placeholder || '0,00'} value={displayValue} onChange={(e) => handleInputChange(field, parseCurrencyInput(e.target.value))} />
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-semibold mb-2">Quanto sua empresa vendeu neste período?</h3><p className="text-sm text-muted-foreground mb-6">Informe os valores totais de vendas do mês selecionado</p></div>
            <div className="grid gap-4 md:grid-cols-2">
              <CurrencyInput label="Vendas de produtos" field="vendas_produtos" tooltip="Total de notas fiscais de produtos vendidos" placeholder="150.000" />
              <CurrencyInput label="Vendas de serviços" field="vendas_servicos" tooltip="Total de notas de serviço emitidas" placeholder="80.000" />
              <CurrencyInput label="Outras receitas" field="outras_receitas" tooltip="Aluguéis, comissões, rendimentos, etc" placeholder="5.000" />
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-4">Deduções da receita</p>
              <div className="grid gap-4 md:grid-cols-2">
                <CurrencyInput label="Devoluções" field="devolucoes" tooltip="Vendas canceladas ou devolvidas" placeholder="3.000" />
                <CurrencyInput label="Descontos concedidos" field="descontos" tooltip="Descontos dados aos clientes" placeholder="2.000" />
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
            <div><h3 className="text-lg font-semibold mb-2">Quanto custou o que você vendeu?</h3><p className="text-sm text-muted-foreground mb-6">Custos diretamente ligados aos produtos ou serviços vendidos</p></div>
            <div className="grid gap-4 md:grid-cols-2">
              <CurrencyInput label="Custo das mercadorias" field="custo_mercadorias" tooltip="Valor pago aos fornecedores" />
              <CurrencyInput label="Custo de materiais" field="custo_materiais" tooltip="Matéria-prima, insumos, embalagens" />
              <CurrencyInput label="Mão de obra direta" field="mao_obra_direta" tooltip="Salários da equipe de produção" />
              <CurrencyInput label="Serviços de terceiros" field="servicos_terceiros" tooltip="Freelancers, fábricas terceirizadas" />
            </div>
            <Card className="bg-muted/50"><CardContent className="pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Receita Líquida:</span><span>{formatCurrency(receitaLiquida)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>(-) Custos:</span><span>{formatCurrency(custosTotal)}</span></div>
                <div className="flex justify-between font-bold pt-2 border-t"><span>= Lucro Bruto:</span><span className={lucroBruto >= 0 ? 'text-emerald-600' : 'text-red-600'}>{formatCurrency(lucroBruto)}</span></div>
                <div className="flex justify-between text-sm"><span>Margem Bruta:</span><span className={margemBruta >= 30 ? 'text-emerald-600' : 'text-amber-600'}>{margemBruta.toFixed(1)}% {margemBruta >= 30 ? '✅' : '⚠️'}</span></div>
              </div>
            </CardContent></Card>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-semibold mb-2">Quanto você gasta para manter a empresa?</h3><p className="text-sm text-muted-foreground mb-6">Despesas operacionais do dia a dia</p></div>
            <div className="space-y-6">
              <div><h4 className="text-sm font-medium text-muted-foreground mb-3">👥 Pessoas</h4><div className="grid gap-4 md:grid-cols-2"><CurrencyInput label="Salários + encargos" field="salarios_encargos" tooltip="Folha de pagamento" /><CurrencyInput label="Pró-labore dos sócios" field="prolabore" tooltip="Retiradas mensais dos sócios" /></div></div>
              <div><h4 className="text-sm font-medium text-muted-foreground mb-3">🏢 Estrutura</h4><div className="grid gap-4 md:grid-cols-3"><CurrencyInput label="Aluguel" field="aluguel" /><CurrencyInput label="Energia, água, internet" field="energia_agua_internet" /><CurrencyInput label="Software e assinaturas" field="software" /></div></div>
              <div><h4 className="text-sm font-medium text-muted-foreground mb-3">⚙️ Operação</h4><div className="grid gap-4 md:grid-cols-3"><CurrencyInput label="Marketing" field="marketing" /><CurrencyInput label="Contador, advogado" field="contador_juridico" /><CurrencyInput label="Viagens, alimentação" field="viagens" /><CurrencyInput label="Manutenção" field="manutencao" /><CurrencyInput label="Frete e logística" field="frete" /><CurrencyInput label="Outras despesas" field="outras_despesas" /></div></div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-semibold mb-2">Receitas e despesas financeiras</h3><p className="text-sm text-muted-foreground mb-6">Juros, tarifas bancárias e outros custos financeiros</p></div>
            <div className="grid gap-4 md:grid-cols-2">
              <CurrencyInput label="Juros pagos" field="juros_pagos" tooltip="Empréstimos, cartões, cheque especial" />
              <CurrencyInput label="Juros recebidos" field="juros_recebidos" tooltip="Rendimentos de aplicações" />
              <CurrencyInput label="Tarifas bancárias" field="tarifas" tooltip="DOC, TED, taxas de maquininha" />
              <CurrencyInput label="Multas por atraso" field="multas" tooltip="Multas pagas a fornecedores ou governo" />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-semibold mb-2">Como sua empresa paga impostos?</h3><p className="text-sm text-muted-foreground mb-6">Selecione o regime tributário e informe os impostos pagos</p></div>
            <div className="space-y-4">
              <Label>Regime Tributário</Label>
              <RadioGroup value={formData.regime_tributario} onValueChange={(value) => handleInputChange('regime_tributario', value)} className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted"><RadioGroupItem value="simples" id="simples" /><Label htmlFor="simples" className="cursor-pointer">Simples Nacional</Label></div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted"><RadioGroupItem value="presumido" id="presumido" /><Label htmlFor="presumido" className="cursor-pointer">Lucro Presumido</Label></div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted"><RadioGroupItem value="real" id="real" /><Label htmlFor="real" className="cursor-pointer">Lucro Real</Label></div>
              </RadioGroup>
            </div>
            <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg"><Switch id="calcular_auto" checked={formData.calcular_auto} onCheckedChange={(checked) => handleInputChange('calcular_auto', checked)} /><Label htmlFor="calcular_auto">Calcular impostos automaticamente</Label></div>
            {!formData.calcular_auto && <CurrencyInput label="Impostos sobre vendas (PIS, COFINS, ICMS, ISS)" field="impostos_vendas" tooltip="Valor total de impostos sobre o faturamento" />}
            <div className="flex items-center space-x-2 p-4 bg-primary/5 border border-primary/20 rounded-lg"><Switch id="simular_reforma" checked={formData.simular_reforma} onCheckedChange={(checked) => handleInputChange('simular_reforma', checked)} /><div><Label htmlFor="simular_reforma" className="text-primary">📊 Ver impacto da Reforma Tributária</Label><p className="text-xs text-muted-foreground">Simula como ficará sua carga tributária após 2027</p></div></div>
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
          {steps.map((step) => (
            <div key={step.id} className={`flex flex-col items-center ${step.id === currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1 ${step.id < currentStep ? 'bg-primary text-primary-foreground' : step.id === currentStep ? 'bg-primary/20 border-2 border-primary' : 'bg-muted'}`}>{step.id < currentStep ? '✓' : step.emoji}</div>
              <span className="text-xs hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>
        <Progress value={(currentStep / 5) * 100} className="h-2" />
      </div>
      <Card><CardHeader className="pb-4"><CardTitle className="flex items-center gap-2 text-lg">{steps[currentStep - 1].emoji} {steps[currentStep - 1].title}</CardTitle></CardHeader><CardContent>{renderStep()}</CardContent></Card>
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 1}><ChevronLeft className="h-4 w-4 mr-2" />Voltar</Button>
        {currentStep < 5 ? (<Button onClick={() => setCurrentStep(prev => prev + 1)}>Próximo<ChevronRight className="h-4 w-4 ml-2" /></Button>) : (<Button onClick={handleSubmit} disabled={loading}>{loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Calculando...</>) : (<><Calculator className="h-4 w-4 mr-2" />Gerar DRE e Diagnóstico</>)}</Button>)}
      </div>
    </div>
  );
}
