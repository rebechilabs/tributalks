import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TaxCalculatorForm, TaxFormData } from "@/components/rtc/TaxCalculatorForm";
import { TaxResultsDisplay } from "@/components/rtc/TaxResultsDisplay";
import { CalculationHistory } from "@/components/rtc/CalculationHistory";
import { ClaraContextualCard } from "@/components/common/ClaraContextualCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calculator, HelpCircle, ExternalLink, FileText, ArrowLeft, Zap } from "lucide-react";

export default function CalculadoraRTC() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("form");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [formData, setFormData] = useState<TaxFormData | null>(null);

  // DRE Integration params
  const fromDreId = searchParams.get('from_dre');
  const dreReceita = searchParams.get('receita');

  const handleCalculate = async (data: TaxFormData, municipioNome: string) => {
    setIsLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para fazer cálculos.",
          variant: "destructive",
        });
        return;
      }

      const payload = {
        municipio: data.municipio,
        municipioNome,
        uf: data.uf,
        itens: data.itens.map((item, index) => ({
          numero: index + 1,
          ncm: item.ncm,
          descricao: item.descricao,
          quantidade: item.quantidade,
          unidade: item.unidade,
          valorUnitario: item.valorUnitario,
          cst: item.cst,
        })),
      };

      const response = await supabase.functions.invoke("calculate-rtc", {
        body: payload,
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao calcular tributos");
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || "Erro ao calcular tributos");
      }

      setResults(response.data);
      setFormData(data);
      setActiveTab("results");

      // Se veio do DRE, atualiza o registro com os dados oficiais
      if (fromDreId && response.data?.totals) {
        await updateDREWithOfficialData(fromDreId, response.data.totals);
      }

      toast({
        title: "Cálculo realizado!",
        description: fromDreId 
          ? "Os tributos foram calculados e seu DRE foi atualizado com dados oficiais."
          : "Os tributos foram calculados com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro no cálculo:", error);
      toast({
        title: "Erro no cálculo",
        description: error.message || "Não foi possível calcular os tributos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewCalculation = () => {
    setResults(null);
    setActiveTab("form");
  };

  const handleLoadCalculation = (inputData: any) => {
    // Reload the form with saved data
    setFormData(inputData);
    setActiveTab("form");
    toast({
      title: "Dados carregados",
      description: "Os dados do cálculo foram carregados no formulário.",
    });
  };

  const updateDREWithOfficialData = async (dreId: string, totals: any) => {
    try {
      const totalReforma = (totals.total_cbs || 0) + (totals.total_ibs_uf || 0) + 
                          (totals.total_ibs_mun || 0) + (totals.total_is || 0);
      
      await supabase
        .from('company_dre')
        .update({
          reforma_impostos_novos: totalReforma,
          reforma_source: 'api_oficial',
          reforma_calculated_at: new Date().toISOString(),
        })
        .eq('id', dreId);
    } catch (error) {
      console.error('Erro ao atualizar DRE:', error);
    }
  };

  const handleBackToDRE = () => {
    if (fromDreId) {
      navigate(`/dashboard/dre-resultados?id=${fromDreId}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="h-8 w-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Calculadora RTC
              </h1>
              <Badge className="bg-green-600 hover:bg-green-600">
                API Oficial
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Calcule CBS, IBS e Imposto Seletivo usando a API oficial da Receita
              Federal
            </p>
          </div>

          <a
            href="https://www.gov.br/receitafederal/pt-br/assuntos/reforma-tributaria-regulamentacao"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            Documentação RFB
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* DRE Context Banner */}
        {fromDreId && (
          <Alert className="bg-primary/5 border-primary/20">
            <FileText className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <span className="font-medium">Simulação vinculada ao seu DRE</span>
                {dreReceita && (
                  <span className="text-muted-foreground ml-2">
                    (Receita: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(dreReceita))})
                  </span>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Adicione seus produtos (NCMs) para calcular o impacto real da Reforma Tributária no seu DRE.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleBackToDRE}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar ao DRE
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Clara AI Card - Contextual Help */}
        <ClaraContextualCard className="mb-2" />

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-card border-border cursor-help">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="font-medium">CBS</span>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Contribuição sobre Bens e Serviços (Federal)
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p>
                A CBS substitui o PIS e a COFINS. É um tributo federal sobre o
                consumo que incide sobre operações com bens e serviços.
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-card border-border cursor-help">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="font-medium">IBS</span>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Imposto sobre Bens e Serviços (Estadual + Municipal)
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p>
                O IBS substitui o ICMS (estadual) e o ISS (municipal). É repartido
                entre estados e municípios conforme o destino da operação.
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-card border-border cursor-help">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="font-medium">IS</span>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Imposto Seletivo (produtos específicos)
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p>
                O Imposto Seletivo incide sobre produtos prejudiciais à saúde ou
                ao meio ambiente, como cigarros, bebidas alcoólicas e combustíveis
                fósseis.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="form">Dados da Operação</TabsTrigger>
            <TabsTrigger value="results" disabled={!results}>
              Resultados
            </TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="form" className="m-0">
              <TaxCalculatorForm
                onSubmit={handleCalculate}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="results" className="m-0">
              {results && (
                <TaxResultsDisplay
                  results={results}
                  onNewCalculation={handleNewCalculation}
                />
              )}
            </TabsContent>

            <TabsContent value="history" className="m-0">
              <CalculationHistory onLoadCalculation={handleLoadCalculation} />
            </TabsContent>
          </div>
        </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
