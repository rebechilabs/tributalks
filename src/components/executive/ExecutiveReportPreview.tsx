import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Download, Mail, X, TrendingUp, TrendingDown, AlertTriangle, Wallet, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
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
    return "Dados insuficientes para gerar o resumo executivo. Complete o Score Tributário para uma análise completa.";
  }

  const gradeDescriptions: Record<string, string> = {
    'A+': 'excelente',
    'A': 'muito boa',
    'B': 'boa',
    'C': 'regular',
    'D': 'abaixo do esperado',
    'E': 'crítica',
  };

  const riscoDescriptions: Record<string, string> = {
    'baixo': 'baixo nível de exposição a riscos fiscais',
    'medio': 'nível moderado de exposição a riscos fiscais, requerendo atenção',
    'alto': 'alto nível de exposição a riscos fiscais, requerendo ação imediata',
  };

  let summary = '';

  // Grade assessment
  if (data.scoreGrade) {
    const gradeDesc = gradeDescriptions[data.scoreGrade] || 'em avaliação';
    summary += `A saúde tributária da empresa está ${gradeDesc} (nota ${data.scoreGrade}). `;
  }

  // Tax burden
  if (data.cargaEfetivaPercent !== null) {
    summary += `A carga tributária efetiva representa ${data.cargaEfetivaPercent}% da receita bruta. `;
  }

  // Potential cash
  if (data.caixaPotencialMin !== null && data.caixaPotencialMax !== null) {
    summary += `Identificamos um potencial de recuperação de caixa entre ${formatCurrency(data.caixaPotencialMin)} e ${formatCurrency(data.caixaPotencialMax)} nos próximos 12 meses. `;
  }

  // Risk level
  if (data.riscoNivel) {
    const riscoDesc = riscoDescriptions[data.riscoNivel] || '';
    summary += `A empresa apresenta ${riscoDesc}.`;
  }

  return summary || "Complete mais dados para gerar um resumo executivo detalhado.";
}

export function ExecutiveReportPreview({
  open,
  onOpenChange,
  thermometerData,
  topProjects,
  reformData,
  risks,
  companyName,
}: ExecutiveReportPreviewProps) {
  const currentMonth = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });
  const currentDate = format(new Date(), "dd/MM/yyyy");

  const handleDownloadPdf = () => {
    // TODO: Implement PDF generation with jsPDF
    toast({
      title: "Em desenvolvimento",
      description: "A funcionalidade de download em PDF estará disponível em breve.",
    });
  };

  const handleSendEmail = () => {
    // Log data for future email integration
    console.log('Report data for email:', {
      month: currentMonth,
      thermometerData,
      topProjects,
      reformData,
      risks,
      companyName,
    });
    
    toast({
      title: "Em desenvolvimento",
      description: "O envio por email estará disponível em breve.",
    });
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
              Caixa Tributário Potencial
            </h2>

            {thermometerData?.caixaPotencialMin !== null && thermometerData?.caixaPotencialMax !== null ? (
              <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">Economia potencial estimada em 12 meses:</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(thermometerData.caixaPotencialMin)} – {formatCurrency(thermometerData.caixaPotencialMax)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic mb-4">
                Complete o Score Tributário para estimar o potencial de caixa.
              </p>
            )}

            {/* Projects List */}
            {topProjects.length > 0 ? (
              <>
                <p className="text-sm font-medium text-gray-700 mb-2">Projetos prioritários:</p>
                <div className="space-y-2">
                  {topProjects.map((project, index) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700">{project.nome}</span>
                      </div>
                      {project.impactoMax > 0 && (
                        <span className="text-sm font-medium text-emerald-600">
                          {formatCurrency(project.impactoMin)} – {formatCurrency(project.impactoMax)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
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
              Riscos & Governança
            </h2>

            {risks.length > 0 ? (
              <div className="space-y-2">
                {risks.map((risk, index) => {
                  const style = nivelStyles[risk.nivel] || nivelStyles['medio'];
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <AlertTriangle className={cn("w-4 h-4 mt-0.5 shrink-0", style.text)} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{risk.categoria}</span>
                          <Badge variant="secondary" className={cn("text-xs", style.bg, style.text)}>
                            {risk.nivel === 'baixo' ? 'Baixo' : risk.nivel === 'medio' ? 'Médio' : 'Alto'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{risk.descricao}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Impostos Atuais</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(reformData.impostosAtuais)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Com Reforma</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(reformData.impostosNovos)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Variação</p>
                    <p className={cn(
                      "text-lg font-semibold",
                      reformData.impactoPercentual < 0 ? 'text-emerald-600' : 'text-red-600'
                    )}>
                      {reformData.impactoPercentual > 0 ? '+' : ''}{reformData.impactoPercentual.toFixed(1)}%
                    </p>
                  </div>
                </div>
                {reformData.impactoLucroAnual > 0 && (
                  <p className="text-sm text-gray-600 mt-3 text-center">
                    Impacto estimado no lucro anual: {' '}
                    <span className={cn(
                      "font-semibold",
                      reformData.impactoPercentual < 0 ? 'text-emerald-600' : 'text-red-600'
                    )}>
                      {reformData.impactoPercentual < 0 ? '+' : '-'}{formatCurrency(reformData.impactoLucroAnual)}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Simule na Calculadora RTC para ver o impacto da Reforma no próximo relatório.
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
          <Button variant="outline" onClick={handleSendEmail}>
            <Mail className="w-4 h-4 mr-2" />
            Enviar por email
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
