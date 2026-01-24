import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Download, Mail, X, TrendingUp, TrendingDown, AlertTriangle, Wallet, Shield, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logoTributech from "@/assets/logo-tributech.png";
import type { ThermometerData, ProjetoTributario, ReformImpactData, RiskItem } from "@/hooks/useExecutiveData";

interface ExecutiveReportPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  thermometerData: ThermometerData | null;
  topProjects: ProjetoTributario[];
  reformData: ReformImpactData | null;
  risks: RiskItem[];
  companyName?: string;
  userId?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function generateExecutiveSummary(data: ThermometerData | null): string {
  if (!data) {
    return "Ainda não temos dados suficientes para gerar o resumo executivo. Complete a avaliação de saúde tributária.";
  }

  const riscoLabels: Record<string, string> = {
    'baixo': 'baixo',
    'medio': 'moderado',
    'alto': 'elevado',
  };

  let parts: string[] = [];

  // Grade
  if (data.scoreGrade) {
    parts.push(`Sua empresa está com nota ${data.scoreGrade} na saúde tributária`);
  }

  // Tax burden
  if (data.cargaEfetivaPercent !== null) {
    parts.push(`pagando cerca de ${data.cargaEfetivaPercent}% do faturamento em impostos`);
  }

  // Potential cash
  if (data.caixaPotencialMin !== null && data.caixaPotencialMax !== null) {
    parts.push(`Há entre ${formatCurrency(data.caixaPotencialMin)} e ${formatCurrency(data.caixaPotencialMax)} de caixa tributário em jogo`);
  }

  // Risk level
  if (data.riscoNivel) {
    const riscoLabel = riscoLabels[data.riscoNivel] || 'moderado';
    parts.push(`e o nível de risco atual é ${riscoLabel}`);
  }

  if (parts.length === 0) {
    return "Complete mais dados para gerar um resumo executivo detalhado.";
  }

  // Combine the parts intelligently
  if (parts.length >= 3) {
    return `${parts[0]}, ${parts[1]}. ${parts.slice(2).join(' ')}.`;
  }
  return parts.join('. ') + '.';
}

export function ExecutiveReportPreview({
  open,
  onOpenChange,
  thermometerData,
  topProjects,
  reformData,
  risks,
  companyName,
  userId,
}: ExecutiveReportPreviewProps) {
  const [isSending, setIsSending] = useState(false);
  const currentMonth = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });
  const currentDate = format(new Date(), "dd/MM/yyyy");

  const handleDownloadPdf = () => {
    // TODO: Implement PDF generation with jsPDF
    toast({
      title: "Em desenvolvimento",
      description: "A funcionalidade de download em PDF estará disponível em breve.",
    });
  };

  const handleSendEmail = async () => {
    if (!userId) {
      toast({
        title: "Erro",
        description: "Usuário não identificado. Por favor, faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      // Get current month in YYYY-MM format
      const now = new Date();
      const referenceMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const { data, error } = await supabase.functions.invoke('send-executive-report', {
        body: {
          userId,
          referenceMonth,
          reportData: {
            thermometerData,
            topProjects,
            reformData,
            risks,
            companyName,
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.error) {
        // Check if it's a configuration error
        if (data.error.includes('not configured') || data.error.includes('RESEND_API_KEY')) {
          toast({
            title: "Configuração pendente",
            description: "O serviço de email ainda não foi configurado. Entre em contato com o suporte.",
            variant: "destructive",
          });
        } else if (data.error.includes('No recipients')) {
          toast({
            title: "Destinatários não configurados",
            description: "Configure os emails de CEO, CFO ou contador no perfil da empresa.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }
      
      toast({
        title: "Relatório enviado!",
        description: `Enviado para ${data.recipients?.join(', ') || 'os destinatários configurados'}.`,
      });
      
    } catch (error) {
      console.error('Error sending report:', error);
      toast({
        title: "Erro ao enviar",
        description: error instanceof Error ? error.message : "Não foi possível enviar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const gradeColors: Record<string, string> = {
    'A+': 'text-emerald-600',
    'A': 'text-emerald-600',
    'B': 'text-green-600',
    'C': 'text-yellow-600',
    'D': 'text-orange-600',
    'E': 'text-red-600',
  };

  const nivelStyles: Record<string, { bg: string; text: string }> = {
    'baixo': { bg: 'bg-emerald-500/10', text: 'text-emerald-700' },
    'medio': { bg: 'bg-yellow-500/10', text: 'text-yellow-700' },
    'alto': { bg: 'bg-red-500/10', text: 'text-red-700' },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Relatório Tributário Executivo</DialogTitle>
          <DialogDescription>Preview do relatório mensal para a diretoria</DialogDescription>
        </DialogHeader>

        {/* Report Content */}
        <div className="bg-white text-gray-900 rounded-lg" id="executive-report">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img src={logoTributech} alt="Tributech" className="h-10 w-auto" />
            </div>
            <div className="text-right">
              <h1 className="text-lg font-bold text-gray-900">
                Relatório Tributário Executivo
              </h1>
              <p className="text-sm text-gray-500 capitalize">{currentMonth}</p>
            </div>
          </div>

          {/* Company Info */}
          {(companyName || thermometerData?.userName) && (
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Empresa:</span> {companyName || `Empresa de ${thermometerData?.userName}`}
              </p>
              <p className="text-xs text-gray-400">Gerado em {currentDate}</p>
            </div>
          )}

          {/* Section 1: Executive Summary */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              <FileText className="w-5 h-5 text-primary" />
              Resumo Executivo
            </h2>
            
            {/* Score Badge */}
            {thermometerData?.scoreGrade && (
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 text-2xl font-bold",
                  gradeColors[thermometerData.scoreGrade] || 'text-gray-600'
                )}>
                  {thermometerData.scoreGrade}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Nota Tributária</p>
                  <p className="text-xs text-gray-500">{thermometerData.scoreTotal}/1000 pontos</p>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-700 leading-relaxed">
              {generateExecutiveSummary(thermometerData)}
            </p>
          </div>

          {/* Section 2: Tax Cash */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              <Wallet className="w-5 h-5 text-emerald-600" />
              Projetos de caixa recomendados
            </h2>

            {thermometerData?.caixaPotencialMin !== null && thermometerData?.caixaPotencialMax !== null ? (
              <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">Caixa tributário em jogo nos próximos 12 meses:</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(thermometerData.caixaPotencialMin)} – {formatCurrency(thermometerData.caixaPotencialMax)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic mb-4">
                Avalie sua saúde tributária para estimar o potencial de caixa.
              </p>
            )}

            {/* Projects List */}
            {topProjects.length > 0 ? (
              <div className="space-y-2">
                {topProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{project.nome}</span>
                    {project.impactoMax > 0 && (
                      <span className="text-sm font-medium text-emerald-600">
                        potencial de {formatCurrency(project.impactoMin)} – {formatCurrency(project.impactoMax)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Nenhum projeto prioritário identificado ainda.
              </p>
            )}
          </div>

          {/* Section 3: Risks */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              <Shield className="w-5 h-5 text-primary" />
              Principais riscos a monitorar
            </h2>

            {risks.length > 0 ? (
              <ul className="space-y-2">
                {risks.map((risk, index) => {
                  const style = nivelStyles[risk.nivel] || nivelStyles['medio'];
                  return (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <AlertTriangle className={cn("w-4 h-4 mt-0.5 shrink-0", style.text)} />
                      <span>
                        <strong>{risk.categoria}:</strong> {risk.descricao} (risco {risk.nivel})
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-emerald-600">
                ✓ Nenhum risco significativo identificado.
              </p>
            )}
          </div>

          {/* Section 4: Tax Reform */}
          <div className="p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              {reformData?.hasData && reformData.impactoPercentual < 0 ? (
                <TrendingDown className="w-5 h-5 text-emerald-600" />
              ) : (
              <TrendingUp className="w-5 h-5 text-red-600" />
            )}
            Impacto da Reforma Tributária
          </h2>

          {reformData?.hasData ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                A Reforma tende a alterar sua carga de{" "}
                <strong>{formatCurrency(reformData.impostosAtuais)}</strong> para{" "}
                <strong>{formatCurrency(reformData.impostosNovos)}</strong>
                {reformData.impactoLucroAnual > 0 && (
                  <>, com impacto estimado de{" "}
                  <span className={cn(
                    "font-semibold",
                    reformData.impactoPercentual < 0 ? 'text-emerald-600' : 'text-red-600'
                  )}>
                    {reformData.impactoPercentual < 0 ? '+' : '-'}{formatCurrency(reformData.impactoLucroAnual)}
                  </span>{" "}
                  no lucro anual</>
                )}
                .
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Ainda não há simulações da Reforma para esta empresa. Use a Calculadora Oficial da Reforma para incluir este bloco no próximo relatório.
              </p>
            </div>
          )}
        </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <p className="text-xs text-gray-400 text-center">
              Relatório gerado automaticamente pela plataforma Tributech · {currentDate}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSendEmail}
            disabled={isSending}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            {isSending ? 'Enviando...' : 'Enviar por email'}
          </Button>
          <Button onClick={handleDownloadPdf} disabled>
            <Download className="w-4 h-4 mr-2" />
            Baixar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
