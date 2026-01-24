import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TaxCalculatorForm, TaxFormData } from "@/components/rtc/TaxCalculatorForm";
import { TaxResultsDisplay } from "@/components/rtc/TaxResultsDisplay";
import { CalculationHistory } from "@/components/rtc/CalculationHistory";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calculator, HelpCircle, ExternalLink } from "lucide-react";

export default function CalculadoraRTC() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("form");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [formData, setFormData] = useState<TaxFormData | null>(null);

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

      toast({
        title: "Cálculo realizado!",
        description: "Os tributos foram calculados com sucesso.",
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

  return (
    <DashboardLayout>
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
    </DashboardLayout>
  );
}
