import { useState } from 'react';
import { FileText, Download, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface IdentifiedCredit {
  id: string;
  nfe_key: string;
  nfe_number: string;
  nfe_date: string;
  supplier_cnpj: string;
  supplier_name: string;
  original_tax_value: number;
  potential_recovery: number;
  ncm_code: string;
  product_description: string;
  cfop: string;
  cst: string;
  confidence_score: number;
  confidence_level: string;
  status: string;
  created_at: string;
  credit_rules?: {
    tax_type: string;
    rule_name: string;
    legal_basis: string;
  };
}

interface CreditSummary {
  total_potential: number;
  pis_cofins_potential: number;
  icms_potential: number;
  icms_st_potential: number;
  ipi_potential: number;
  high_confidence_total: number;
  medium_confidence_total: number;
  low_confidence_total: number;
  total_xmls_analyzed: number;
  credits_found_count: number;
}

interface CreditPdfReportProps {
  credits: IdentifiedCredit[];
  summary: CreditSummary | null;
  onClose: () => void;
}

export function CreditPdfReport({ credits, summary, onClose }: CreditPdfReportProps) {
  const { user, profile } = useAuth();
  const [generating, setGenerating] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return '-';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      // Dynamic import of jsPDF
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      // Helper functions
      const addNewPage = () => {
        doc.addPage();
        yPos = margin;
      };

      const checkPageBreak = (neededSpace: number) => {
        if (yPos + neededSpace > pageHeight - margin) {
          addNewPage();
        }
      };

      // ========== CAPA ==========
      doc.setFillColor(22, 163, 74); // Green
      doc.rect(0, 0, pageWidth, 60, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('TribuTech', margin, 35);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Relatório de Créditos Recuperáveis', margin, 50);

      yPos = 80;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Análise de Créditos Tributários', margin, yPos);
      
      yPos += 20;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const companyName = profile?.empresa || 'Empresa não informada';
      const cnpj = profile?.cnae || 'CNPJ não informado';
      
      doc.text(`Empresa: ${companyName}`, margin, yPos);
      yPos += 8;
      doc.text(`CNAE: ${cnpj}`, margin, yPos);
      yPos += 8;
      doc.text(`Data do Relatório: ${formatDate(new Date())}`, margin, yPos);
      yPos += 8;
      doc.text(`Período Analisado: Últimos 12 meses`, margin, yPos);

      // ========== PÁGINA 2: SUMÁRIO EXECUTIVO ==========
      addNewPage();
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Sumário Executivo', margin, yPos);
      yPos += 15;

      // Total Box
      doc.setFillColor(22, 163, 74);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 30, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('TOTAL RECUPERÁVEL', margin + 10, yPos + 12);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(summary?.total_potential || 0), margin + 10, yPos + 25);
      
      yPos += 45;
      doc.setTextColor(0, 0, 0);
      
      // Confidence breakdown
      const confidenceData = [
        { label: 'Alta Confiança', value: summary?.high_confidence_total || 0, color: [22, 163, 74] },
        { label: 'Média Confiança', value: summary?.medium_confidence_total || 0, color: [245, 158, 11] },
        { label: 'Baixa Confiança', value: summary?.low_confidence_total || 0, color: [239, 68, 68] },
      ];

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Por Nível de Confiança', margin, yPos);
      yPos += 10;

      confidenceData.forEach((item) => {
        doc.setFillColor(item.color[0], item.color[1], item.color[2]);
        doc.circle(margin + 5, yPos + 3, 3, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`${item.label}: ${formatCurrency(item.value)}`, margin + 15, yPos + 5);
        yPos += 12;
      });

      yPos += 10;
      
      // Tax breakdown
      const taxData = [
        { label: 'PIS/COFINS', value: summary?.pis_cofins_potential || 0 },
        { label: 'ICMS', value: summary?.icms_potential || 0 },
        { label: 'ICMS-ST', value: summary?.icms_st_potential || 0 },
        { label: 'IPI', value: summary?.ipi_potential || 0 },
      ];

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Por Tributo', margin, yPos);
      yPos += 10;

      taxData.forEach((item) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`${item.label}: ${formatCurrency(item.value)}`, margin + 5, yPos + 5);
        yPos += 10;
      });

      yPos += 15;
      
      // Stats
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Estatísticas', margin, yPos);
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`XMLs Analisados: ${summary?.total_xmls_analyzed || 0}`, margin + 5, yPos);
      yPos += 8;
      doc.text(`Créditos Identificados: ${summary?.credits_found_count || credits.length}`, margin + 5, yPos);

      // ========== PÁGINAS 3+: DETALHAMENTO ==========
      addNewPage();
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalhamento dos Créditos', margin, yPos);
      yPos += 15;

      // Group credits by tax type
      const creditsByTax: Record<string, IdentifiedCredit[]> = {};
      credits.forEach(credit => {
        const taxType = credit.credit_rules?.tax_type || 'Outros';
        if (!creditsByTax[taxType]) {
          creditsByTax[taxType] = [];
        }
        creditsByTax[taxType].push(credit);
      });

      Object.entries(creditsByTax).forEach(([taxType, taxCredits]) => {
        checkPageBreak(50);
        
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 12, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${taxType} (${taxCredits.length} itens)`, margin + 5, yPos + 3);
        yPos += 15;

        // Table header
        const colWidths = [25, 45, 30, 35, 30];
        const headers = ['NF-e', 'Fornecedor', 'NCM', 'Valor Original', 'Potencial'];
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        let xPos = margin;
        headers.forEach((header, i) => {
          doc.text(header, xPos, yPos);
          xPos += colWidths[i];
        });
        yPos += 8;

        // Table rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        
        taxCredits.slice(0, 20).forEach((credit) => {
          checkPageBreak(10);
          
          xPos = margin;
          doc.text(credit.nfe_number || '-', xPos, yPos);
          xPos += colWidths[0];
          
          const supplierName = (credit.supplier_name || '-').substring(0, 20);
          doc.text(supplierName, xPos, yPos);
          xPos += colWidths[1];
          
          doc.text(credit.ncm_code || '-', xPos, yPos);
          xPos += colWidths[2];
          
          doc.text(formatCurrency(credit.original_tax_value), xPos, yPos);
          xPos += colWidths[3];
          
          doc.setTextColor(22, 163, 74);
          doc.text(formatCurrency(credit.potential_recovery), xPos, yPos);
          doc.setTextColor(0, 0, 0);
          
          yPos += 7;
        });

        if (taxCredits.length > 20) {
          doc.setFont('helvetica', 'italic');
          doc.text(`... e mais ${taxCredits.length - 20} itens`, margin, yPos);
          yPos += 7;
        }

        yPos += 10;
      });

      // ========== PÁGINA FINAL: PRÓXIMOS PASSOS ==========
      addNewPage();
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Próximos Passos', margin, yPos);
      yPos += 15;

      const steps = [
        '1. Revise os créditos identificados com seu contador',
        '2. Valide a documentação comprobatória (XMLs originais)',
        '3. Prepare os pedidos de restituição/compensação',
        '4. Acompanhe os processos junto à Receita Federal',
        '5. Utilize a TribuTech para monitoramento contínuo'
      ];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      steps.forEach(step => {
        doc.text(step, margin, yPos);
        yPos += 10;
      });

      yPos += 20;
      
      // Disclaimer
      doc.setFillColor(255, 243, 205);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 40, 3, 3, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('AVISO IMPORTANTE', margin + 5, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const disclaimer = 'Este relatório é gerado automaticamente com base na análise dos XMLs importados. Os valores apresentados são estimativas e devem ser validados por um profissional contábil antes de qualquer ação de recuperação. A TribuTech não se responsabiliza por decisões tomadas com base exclusivamente neste relatório.';
      const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin - 10);
      doc.text(splitDisclaimer, margin + 5, yPos + 20);

      // Footer on last page
      yPos = pageHeight - 20;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Gerado por TribuTech em ${formatDate(new Date())}`, margin, yPos);
      doc.text('www.tributech.ai', pageWidth - margin - 30, yPos);

      // Save
      const fileName = `TribuTech_Creditos_${profile?.empresa?.replace(/\s/g, '_') || 'Empresa'}_${formatDate(new Date()).replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      toast.success('Relatório PDF gerado com sucesso!');
      onClose();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar relatório PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Relatório de Créditos
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">O relatório incluirá:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Capa com dados da empresa</li>
              <li>• Sumário executivo com totais</li>
              <li>• Detalhamento por tributo ({credits.length} créditos)</li>
              <li>• Próximos passos e disclaimers</li>
            </ul>
          </div>

          <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
            <span className="text-sm font-medium">Total Recuperável:</span>
            <span className="text-lg font-bold text-emerald-600">
              {formatCurrency(summary?.total_potential || 0)}
            </span>
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
