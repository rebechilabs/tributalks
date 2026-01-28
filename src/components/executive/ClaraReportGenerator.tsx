import { useState } from "react";
import { Sparkles, FileText, TrendingUp, Wallet, BarChart3, AlertTriangle, Loader2, Copy, Download, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import type { ThermometerData, ProjetoTributario, ReformImpactData, RiskItem } from "@/hooks/useExecutiveData";

export type ReportType = 
  | 'executive_monthly'
  | 'dre_analysis'
  | 'credit_radar'
  | 'reform_impact'
  | 'opportunities';

interface ReportOption {
  type: ReportType;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

const REPORT_OPTIONS: ReportOption[] = [
  {
    type: 'executive_monthly',
    title: 'Relatório Executivo Mensal',
    description: 'Síntese mensal para diretoria com score, projetos e riscos',
    icon: <FileText className="w-5 h-5" />,
    badge: 'Recomendado'
  },
  {
    type: 'dre_analysis',
    title: 'Análise da DRE',
    description: 'Diagnóstico financeiro com indicadores e benchmarks',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    type: 'credit_radar',
    title: 'Radar de Créditos',
    description: 'Consolidado de créditos identificados e próximos passos',
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    type: 'reform_impact',
    title: 'Impacto da Reforma',
    description: 'Projeção do impacto CBS/IBS na sua operação',
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    type: 'opportunities',
    title: 'Mapa de Oportunidades',
    description: 'Benefícios fiscais aplicáveis ao seu perfil',
    icon: <AlertTriangle className="w-5 h-5" />,
  },
];

interface ClaraReportGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  thermometerData: ThermometerData | null;
  topProjects: ProjetoTributario[];
  reformData: ReformImpactData | null;
  risks: RiskItem[];
  companyName?: string;
  userId?: string;
}

export function ClaraReportGenerator({
  open,
  onOpenChange,
  thermometerData,
  topProjects,
  reformData,
  risks,
  companyName,
  userId,
}: ClaraReportGeneratorProps) {
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [reportMeta, setReportMeta] = useState<{ type: ReportType; title: string } | null>(null);

  const handleSelectReport = async (type: ReportType) => {
    if (!userId) {
      toast({
        title: "Erro",
        description: "Usuário não identificado. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    setSelectedType(type);
    setIsGenerating(true);
    setGeneratedReport(null);

    try {
      const reportData = {
        thermometerData,
        topProjects,
        reformData,
        risks,
        companyName,
      };

      const { data, error } = await supabase.functions.invoke('generate-executive-report', {
        body: {
          userId,
          reportType: type,
          reportData,
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        if (data.error.includes('plano')) {
          toast({
            title: "Plano insuficiente",
            description: "Relatórios AI estão disponíveis a partir do plano Professional.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      const option = REPORT_OPTIONS.find(o => o.type === type);
      setReportMeta({ type, title: option?.title || 'Relatório' });
      setGeneratedReport(data.report);

      toast({
        title: "Relatório gerado!",
        description: "Clara preparou seu relatório executivo.",
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: error instanceof Error ? error.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
      setSelectedType(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyReport = async () => {
    if (!generatedReport) return;
    
    try {
      await navigator.clipboard.writeText(generatedReport);
      toast({
        title: "Copiado!",
        description: "Relatório copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o relatório.",
        variant: "destructive",
      });
    }
  };

  const handleNewReport = () => {
    setSelectedType(null);
    setGeneratedReport(null);
    setReportMeta(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setSelectedType(null);
      setGeneratedReport(null);
      setReportMeta(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Relatórios Clara AI
          </DialogTitle>
          <DialogDescription>
            Relatórios executivos gerados por inteligência artificial
          </DialogDescription>
        </DialogHeader>

        {/* Report Selection */}
        {!selectedType && !generatedReport && (
          <div className="grid gap-3 py-4">
            <p className="text-sm text-muted-foreground">
              Selecione o tipo de relatório que deseja gerar:
            </p>
            
            {REPORT_OPTIONS.map((option) => (
              <Card 
                key={option.type}
                className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                onClick={() => handleSelectReport(option.type)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{option.title}</h4>
                      {option.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {option.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {option.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Generating State */}
        {isGenerating && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <Loader2 className="w-6 h-6 text-primary absolute -right-1 -bottom-1 animate-spin" />
            </div>
            <div className="text-center">
              <h3 className="font-medium">Clara está preparando seu relatório...</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Analisando dados e estruturando insights executivos
              </p>
            </div>
          </div>
        )}

        {/* Generated Report */}
        {generatedReport && !isGenerating && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Report Header */}
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {reportMeta?.title}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Gerado por Clara AI
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopyReport}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </Button>
                <Button variant="ghost" size="sm" onClick={handleNewReport}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Novo
                </Button>
              </div>
            </div>

            {/* Report Content */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground">
                <ReactMarkdown>{generatedReport}</ReactMarkdown>
              </div>
            </div>

            {/* Disclaimer */}
            <Separator className="my-3" />
            <p className="text-xs text-muted-foreground text-center pb-2">
              ⚠️ Este relatório é informativo. Consulte seu contador ou advogado tributarista antes de implementar qualquer estratégia.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
