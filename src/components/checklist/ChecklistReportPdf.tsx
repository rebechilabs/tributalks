import jsPDF from 'jspdf';
import { 
  checklistBlocks, 
  riskLevelLabels,
  responseLabels,
  ChecklistResponse 
} from '@/data/checklistReformaItems';
import { ChecklistResults } from './ChecklistWizard';

export async function generateChecklistPdf(
  results: ChecklistResults,
  companyName?: string
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  const primaryColor: [number, number, number] = [30, 64, 175]; // Blue
  const textColor: [number, number, number] = [31, 41, 55];
  const mutedColor: [number, number, number] = [107, 114, 128];

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // === COVER PAGE ===
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 60, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Prontidão', margin, 30);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('para a Reforma Tributária', margin, 40);

  y = 80;

  // Company name if provided
  if (companyName) {
    doc.setTextColor(...textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, margin, y);
    y += 10;
  }

  // Date
  doc.setTextColor(...mutedColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, y);
  y += 20;

  // Main Score Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 50, 3, 3, 'F');

  doc.setTextColor(...primaryColor);
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.text(`${results.readinessScore}%`, margin + 20, y + 35);

  const riskConfig = riskLevelLabels[results.riskLevel];
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Score de Prontidão', margin + 70, y + 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(riskConfig.label, margin + 70, y + 32);
  
  doc.setTextColor(...mutedColor);
  doc.setFontSize(9);
  const descLines = doc.splitTextToSize(riskConfig.description, contentWidth - 90);
  doc.text(descLines, margin + 70, y + 42);

  y += 60;

  // Response Summary
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo das Respostas', margin, y);
  y += 8;

  const summaryItems = [
    { label: 'Sim', value: results.simCount, color: [34, 197, 94] as [number, number, number] },
    { label: 'Parcial', value: results.parcialCount, color: [234, 179, 8] as [number, number, number] },
    { label: 'Não', value: results.naoCount, color: [239, 68, 68] as [number, number, number] },
    { label: 'Não sei', value: results.naoSeiCount, color: [107, 114, 128] as [number, number, number] }
  ];

  const boxWidth = (contentWidth - 15) / 4;
  summaryItems.forEach((item, index) => {
    const x = margin + (index * (boxWidth + 5));
    doc.setFillColor(...item.color);
    doc.roundedRect(x, y, boxWidth, 20, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(String(item.value), x + boxWidth/2, y + 12, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, x + boxWidth/2, y + 17, { align: 'center' });
  });

  y += 35;

  // Top Risks Section
  if (results.topRisks.length > 0) {
    addNewPageIfNeeded(60);
    
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, y, contentWidth, 8 + (results.topRisks.length * 18), 3, 3, 'F');
    
    doc.setTextColor(180, 83, 9);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠ Principais Pontos de Atenção', margin + 5, y + 6);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    results.topRisks.forEach((risk, index) => {
      doc.setTextColor(180, 83, 9);
      doc.text(`${index + 1}.`, margin + 5, y);
      doc.setTextColor(120, 53, 15);
      doc.setFont('helvetica', 'bold');
      doc.text(risk.blockTitle, margin + 12, y);
      doc.setFont('helvetica', 'normal');
      y += 5;
      const riskLines = doc.splitTextToSize(risk.itemQuestion, contentWidth - 20);
      doc.text(riskLines, margin + 12, y);
      y += riskLines.length * 4 + 6;
    });

    y += 10;
  }

  // Block-by-Block Analysis
  doc.addPage();
  y = margin;

  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Análise Detalhada por Área', margin, y);
  y += 15;

  checklistBlocks.forEach((block) => {
    addNewPageIfNeeded(50);

    // Block header
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(block.title, margin + 5, y + 7);
    y += 15;

    // Block items
    doc.setFontSize(9);
    block.items.forEach((item) => {
      addNewPageIfNeeded(15);
      
      const response = results.responses[item.key];
      const responseConfig = response ? responseLabels[response] : null;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...mutedColor);
      
      // Response indicator
      let statusSymbol = '○';
      let statusColor: [number, number, number] = mutedColor;
      
      if (response === 'sim') {
        statusSymbol = '●';
        statusColor = [34, 197, 94];
      } else if (response === 'parcial') {
        statusSymbol = '◐';
        statusColor = [234, 179, 8];
      } else if (response === 'nao') {
        statusSymbol = '●';
        statusColor = [239, 68, 68];
      } else if (response === 'nao_sei') {
        statusSymbol = '?';
        statusColor = [107, 114, 128];
      }

      doc.setTextColor(...statusColor);
      doc.text(statusSymbol, margin + 3, y);
      
      doc.setTextColor(...textColor);
      const questionLines = doc.splitTextToSize(item.question, contentWidth - 30);
      doc.text(questionLines, margin + 10, y);
      
      if (responseConfig) {
        doc.setTextColor(...statusColor);
        doc.setFont('helvetica', 'bold');
        doc.text(responseConfig.label, pageWidth - margin - 15, y);
      }

      y += questionLines.length * 4 + 6;
    });

    y += 8;
  });

  // Footer disclaimer
  addNewPageIfNeeded(30);
  y = pageHeight - 35;
  
  doc.setFillColor(248, 250, 252);
  doc.rect(0, y - 5, pageWidth, 40, 'F');
  
  doc.setTextColor(...mutedColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  const disclaimer = 'Este relatório é uma avaliação de prontidão operacional e não constitui parecer jurídico, auditoria formal ou laudo definitivo. Antes de implementar qualquer estratégia tributária, consulte seu contador ou advogado tributarista.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(disclaimerLines, margin, y);

  // Brand
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('TribuTalks', margin, pageHeight - 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedColor);
  doc.text('| GPS da Reforma Tributária', margin + 22, pageHeight - 10);

  // Save
  const fileName = `relatorio-prontidao-reforma-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
