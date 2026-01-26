import { useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  PDF_LAYOUT,
  PDF_COLORS,
  formatCurrency,
  formatDate,
  drawCoverPage,
  drawScoreDisplay,
  drawScoreInterpretation,
  drawDimensionBars,
  drawFinancialImpact,
  drawActionsList,
  drawDisclaimer,
  addHeader,
  addFooter,
  type CompanyData,
  type ScoreData,
  type ActionItem,
} from '@/lib/pdfReportTemplate';

interface ScoreAction {
  id: string;
  action_code: string;
  action_title: string;
  action_description: string;
  points_gain: number;
  economia_estimada: number;
  priority: number;
  link_to: string;
  status: string;
}

interface TaxScoreData {
  score_total: number;
  score_grade: string;
  score_status: string;
  score_conformidade: number;
  score_eficiencia: number;
  score_risco: number;
  score_documentacao: number;
  score_gestao: number;
  economia_potencial: number;
  risco_autuacao: number;
  creditos_nao_aproveitados: number;
}

interface ScorePdfReportProps {
  scoreData: TaxScoreData;
  actions: ScoreAction[];
  open: boolean;
  onClose: () => void;
}

export function ScorePdfReport({ scoreData, actions, open, onClose }: ScorePdfReportProps) {
  const { profile } = useAuth();
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);

    try {
      const { default: jsPDF } = await import('jspdf');

      const doc = new jsPDF();
      const { pageHeight, margin } = PDF_LAYOUT;
      const reportDate = new Date();
      let pageNumber = 1;

      // Dados da empresa
      const company: CompanyData = {
        razaoSocial: profile?.empresa || 'Empresa não informada',
        cnpj: profile?.cnae || undefined, // Usando CNAE como placeholder
        regimeTributario: profile?.regime || undefined,
        faturamentoAnual: profile?.faturamento_mensal ? profile.faturamento_mensal * 12 : undefined,
      };

      // Dados do Score
      const score: ScoreData = {
        total: scoreData.score_total,
        grade: scoreData.score_grade,
        status: scoreData.score_status,
        dimensions: {
          conformidade: scoreData.score_conformidade,
          eficiencia: scoreData.score_eficiencia,
          risco: scoreData.score_risco,
          documentacao: scoreData.score_documentacao,
          gestao: scoreData.score_gestao,
        },
        financialImpact: {
          economiaPotencial: scoreData.economia_potencial,
          riscoAutuacao: scoreData.risco_autuacao,
          creditosNaoAproveitados: scoreData.creditos_nao_aproveitados,
        },
      };

      // Converter ações para formato do template
      const actionItems: ActionItem[] = actions.map((a) => ({
        title: a.action_title,
        description: a.action_description,
        pointsGain: a.points_gain,
        economia: a.economia_estimada,
        priority: a.priority,
      }));

      // ========== PÁGINA 1: CAPA ==========
      drawCoverPage(doc, 'Relatório de Score Tributário', 'Análise Completa de Conformidade Fiscal', company, reportDate);

      // ========== PÁGINA 2: SCORE E INTERPRETAÇÃO ==========
      doc.addPage();
      pageNumber++;
      addHeader(doc, pageNumber);

      let yPos = 35;

      // Score Display
      yPos = drawScoreDisplay(doc, score, yPos);

      // Interpretação
      yPos = drawScoreInterpretation(doc, score.total, yPos);

      addFooter(doc, reportDate);

      // ========== PÁGINA 3: DIMENSÕES E IMPACTO FINANCEIRO ==========
      doc.addPage();
      pageNumber++;
      addHeader(doc, pageNumber);

      yPos = 35;

      // Barras das dimensões
      yPos = drawDimensionBars(doc, score.dimensions, yPos);

      yPos += 10;

      // Impacto financeiro
      yPos = drawFinancialImpact(doc, score.financialImpact, yPos);

      addFooter(doc, reportDate);

      // ========== PÁGINA 4: AÇÕES E DISCLAIMER ==========
      if (actionItems.length > 0) {
        doc.addPage();
        pageNumber++;
        addHeader(doc, pageNumber);

        yPos = 35;

        // Lista de ações
        yPos = drawActionsList(doc, actionItems, yPos, 5);

        // Verificar se cabe o disclaimer
        if (yPos > pageHeight - 80) {
          doc.addPage();
          pageNumber++;
          addHeader(doc, pageNumber);
          yPos = 35;
        }

        yPos += 10;

        // Disclaimer
        drawDisclaimer(doc, yPos);

        addFooter(doc, reportDate);
      }

      // ========== SALVAR ==========
      const fileName = `Score_Tributario_${company.razaoSocial.replace(/\s+/g, '_').substring(0, 30)}_${formatDate(reportDate).replace(/\//g, '-')}.pdf`;
      doc.save(fileName);

      toast.success('Relatório PDF gerado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar relatório PDF. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Gerar Relatório de Score
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">O relatório incluirá:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Capa com identificação da empresa</li>
              <li>• Score principal com interpretação</li>
              <li>• Pontuação por dimensão (5 áreas)</li>
              <li>• Impacto financeiro estimado</li>
              <li>• Top 5 ações prioritárias</li>
              <li>• Disclaimer profissional</li>
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-success/10 border border-success/30 text-center">
              <span className="text-xs text-success block">Economia</span>
              <span className="text-sm font-bold text-success">
                {formatCurrency(scoreData.economia_potencial)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-center">
              <span className="text-xs text-warning block">Créditos</span>
              <span className="text-sm font-bold text-warning">
                {formatCurrency(scoreData.creditos_nao_aproveitados)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
              <span className="text-xs text-destructive block">Risco</span>
              <span className="text-sm font-bold text-destructive">
                {formatCurrency(scoreData.risco_autuacao)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-3xl font-bold">{scoreData.score_total}</div>
              <div className="text-sm text-muted-foreground">pontos / 1000</div>
              <div className="mt-1 inline-block px-2 py-0.5 rounded bg-primary text-primary-foreground text-xs font-bold">
                {scoreData.score_grade}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={generatePDF} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
