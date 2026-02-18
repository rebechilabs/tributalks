/**
 * TribuTalks Credit Report Generator
 * Generates professional multi-page PDF reports for tax credits
 */

import jsPDF from 'jspdf';
import { TRIBUTALKS_PDF_COLORS, getConfidenceColor, getRiskColor } from './TribuTalksPdfColors';
import { 
  PAGE, 
  FONT_SIZES, 
  SPACING, 
  TABLE,
  formatCNPJ, 
  formatCurrency, 
  formatDate,
  formatNfeKey,
  getConfidenceName,
  getRiskName,
  truncateText,
  getContentStartY,
  getContentEndY,
  needsNewPage,
} from './TribuTalksPdfStyles';
import {
  drawHeader,
  drawFooter,
  drawCoverPage,
  drawExecutiveSummary,
  drawConfidenceBadge,
  drawRiskBadge,
  drawTableHeader,
  drawTableRow,
} from './TribuTalksPdfTemplate';
import { 
  type RelatorioCreditos, 
  type TributoCreditoDetalhe, 
  type Inconsistencia, 
  type Oportunidade,
  type ReportOptions,
  DEFAULT_REPORT_OPTIONS,
} from './types';

// Main report generation function
export async function generateTribuTalksCreditReport(
  data: RelatorioCreditos,
  logoBase64: string | null,
  options: Partial<ReportOptions> = {}
): Promise<void> {
  const opts = { ...DEFAULT_REPORT_OPTIONS, ...options };
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Calculate total pages (approximate)
  let totalPages = 2; // Cover + Summary
  totalPages += data.creditosPorTributo.length; // Tribute details
  if (opts.incluirInconsistencias && data.inconsistencias.length > 0) totalPages++;
  if (opts.incluirOportunidades && data.oportunidades.length > 0) totalPages++;
  totalPages++; // Next steps + disclaimer
  
  let currentPage = 1;
  
  // === PAGE 1: COVER ===
  drawCoverPage(
    doc,
    logoBase64,
    data.empresa,
    data.id,
    data.dataGeracao,
    data.periodoInicio,
    data.periodoFim,
    data.estatisticas.totalXmlsAnalisados
  );
  
  // === PAGE 2: EXECUTIVE SUMMARY ===
  doc.addPage();
  currentPage++;
  applyPageBackground(doc, opts.tema);
  drawHeader(doc, logoBase64, currentPage, totalPages);
  drawFooter(doc, data.id);
  
  let y = getContentStartY();
  y = drawExecutiveSummary(doc, data.sumario, y);
  
  // === PAGES 3+: TAX DETAILS ===
  if (opts.incluirDetalhes) {
    for (const tributo of data.creditosPorTributo) {
      if (tributo.valorTotal <= 0) continue;
      
      doc.addPage();
      currentPage++;
      applyPageBackground(doc, opts.tema);
      drawHeader(doc, logoBase64, currentPage, totalPages);
      drawFooter(doc, data.id);
      
      y = getContentStartY();
      y = drawTributeDetailPage(doc, tributo, y, opts.maxNotasPorTributo);
    }
  }
  
  // === INCONSISTENCIES PAGE ===
  if (opts.incluirInconsistencias && data.inconsistencias.length > 0) {
    doc.addPage();
    currentPage++;
    applyPageBackground(doc, opts.tema);
    drawHeader(doc, logoBase64, currentPage, totalPages);
    drawFooter(doc, data.id);
    
    y = getContentStartY();
    y = drawInconsistenciesPage(doc, data.inconsistencias, y);
  }
  
  // === OPPORTUNITIES PAGE ===
  if (opts.incluirOportunidades && data.oportunidades.length > 0) {
    doc.addPage();
    currentPage++;
    applyPageBackground(doc, opts.tema);
    drawHeader(doc, logoBase64, currentPage, totalPages);
    drawFooter(doc, data.id);
    
    y = getContentStartY();
    y = drawOpportunitiesPage(doc, data.oportunidades, y);
  }
  
  // === FINAL PAGE: NEXT STEPS + DISCLAIMER ===
  doc.addPage();
  currentPage++;
  applyPageBackground(doc, opts.tema);
  drawHeader(doc, logoBase64, currentPage, totalPages);
  drawFooter(doc, data.id);
  
  y = getContentStartY();
  drawNextStepsAndDisclaimer(doc, y);
  
  // Save the PDF
  const filename = `TribuTalks_Creditos_${data.id.replace(/^TT-/, '')}.pdf`;
  doc.save(filename);
}

// Apply page background based on theme
function applyPageBackground(doc: jsPDF, tema: 'escuro' | 'claro'): void {
  if (tema === 'escuro') {
    doc.setFillColor(...TRIBUTALKS_PDF_COLORS.bgPrimary);
    doc.rect(0, 0, PAGE.width, PAGE.height, 'F');
  }
}

// Draw tribute detail page
function drawTributeDetailPage(
  doc: jsPDF,
  tributo: TributoCreditoDetalhe,
  startY: number,
  maxNotas: number
): number {
  let y = startY;
  
  // Section title
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.gold);
  doc.setFontSize(FONT_SIZES.heading1);
  doc.setFont('helvetica', 'bold');
  doc.text(`DETALHAMENTO: ${tributo.tributo}`, PAGE.marginLeft, y);
  y += 10;
  
  // Total value
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textPrimary);
  doc.setFontSize(FONT_SIZES.heading2);
  doc.text(`Total Identificado: ${formatCurrency(tributo.valorTotal)}`, PAGE.marginLeft, y);
  y += 8;
  
  // Risk badge
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
  doc.setFontSize(FONT_SIZES.small);
  doc.setFont('helvetica', 'normal');
  doc.text('Nível de Risco:', PAGE.marginLeft, y);
  drawRiskBadge(doc, tributo.risco, PAGE.marginLeft + 30, y);
  y += 12;
  
  // Legal basis card
  if (tributo.baseLegal) {
    doc.setFillColor(...TRIBUTALKS_PDF_COLORS.bgCard);
    const cardHeight = 20;
    doc.roundedRect(PAGE.marginLeft, y, PAGE.contentWidth, cardHeight, 2, 2, 'F');
    
    doc.setTextColor(...TRIBUTALKS_PDF_COLORS.goldText);
    doc.setFontSize(FONT_SIZES.small);
    doc.setFont('helvetica', 'bold');
    doc.text('Base Legal:', PAGE.marginLeft + 5, y + 7);
    
    doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textPrimary);
    doc.setFont('helvetica', 'normal');
    doc.text(tributo.baseLegal, PAGE.marginLeft + 28, y + 7);
    
    if (tributo.descricaoBaseLegal) {
      doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
      doc.setFontSize(FONT_SIZES.tiny);
      const descTruncated = truncateText(tributo.descricaoBaseLegal, PAGE.contentWidth - 15, FONT_SIZES.tiny);
      doc.text(descTruncated, PAGE.marginLeft + 5, y + 14);
    }
    
    y += cardHeight + SPACING.md;
  }
  
  // Rules applied
  if (tributo.regras && tributo.regras.length > 0) {
    doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textPrimary);
    doc.setFontSize(FONT_SIZES.heading3);
    doc.setFont('helvetica', 'bold');
    doc.text('Regras Aplicadas:', PAGE.marginLeft, y);
    y += 8;
    
    tributo.regras.slice(0, 3).forEach((regra, i) => {
      doc.setTextColor(...TRIBUTALKS_PDF_COLORS.goldText);
      doc.setFontSize(FONT_SIZES.small);
      doc.setFont('helvetica', 'bold');
      doc.text(`${regra.codigo}`, PAGE.marginLeft, y);
      
      doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
      doc.setFont('helvetica', 'normal');
      doc.text(`- ${truncateText(regra.nome, 100, FONT_SIZES.small)} (${regra.quantidadeNotas} notas)`, PAGE.marginLeft + 25, y);
      
      y += 6;
    });
    
    y += SPACING.sm;
  }
  
  // Notes table
  if (tributo.notas && tributo.notas.length > 0) {
    doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textPrimary);
    doc.setFontSize(FONT_SIZES.heading3);
    doc.setFont('helvetica', 'bold');
    doc.text('Notas Fiscais Identificadas:', PAGE.marginLeft, y);
    y += 8;
    
    // Table columns
    const columns = [
      { label: 'NF-e', width: 22 },
      { label: 'Fornecedor', width: 50 },
      { label: 'Data', width: 22 },
      { label: 'NCM', width: 22 },
      { label: 'CFOP', width: 15 },
      { label: 'Valor Crédito', width: 28 },
      { label: 'Conf.', width: 15 },
    ];
    
    y = drawTableHeader(doc, columns, PAGE.marginLeft, y);
    
    const notesToShow = tributo.notas.slice(0, maxNotas);
    notesToShow.forEach((nota, i) => {
      if (needsNewPage(y, TABLE.rowHeight + 5)) return;
      
      const values = [
        nota.numeroNfe,
        truncateText(nota.nomeEmitente, 45, TABLE.fontSize),
        formatDate(nota.dataEmissao),
        nota.ncm || '-',
        nota.cfop || '-',
        formatCurrency(nota.valorCredito),
        getConfidenceName(nota.confianca),
      ];
      
      y = drawTableRow(doc, values, columns, PAGE.marginLeft, y, i % 2 === 1);
    });
    
    // Show count if more notes exist
    if (tributo.notas.length > maxNotas) {
      y += 5;
      doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textMuted);
      doc.setFontSize(FONT_SIZES.tiny);
      doc.text(`+ ${tributo.notas.length - maxNotas} notas adicionais não exibidas`, PAGE.marginLeft, y);
    }
  }
  
  return y;
}

// Draw inconsistencies page
function drawInconsistenciesPage(
  doc: jsPDF,
  inconsistencias: Inconsistencia[],
  startY: number
): number {
  let y = startY;
  
  // Section title
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.gold);
  doc.setFontSize(FONT_SIZES.heading1);
  doc.setFont('helvetica', 'bold');
  doc.text('MAPA DE INCONSISTÊNCIAS', PAGE.marginLeft, y);
  y += 8;
  
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
  doc.setFontSize(FONT_SIZES.small);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inconsistencias.length} tipos de inconsistência identificados`, PAGE.marginLeft, y);
  y += 12;
  
  // Total impact
  const totalImpacto = inconsistencias.reduce((sum, inc) => sum + inc.impacto, 0);
  
  doc.setFillColor(...TRIBUTALKS_PDF_COLORS.dangerBg);
  doc.roundedRect(PAGE.marginLeft, y, PAGE.contentWidth, 18, 2, 2, 'F');
  
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.danger);
  doc.setFontSize(FONT_SIZES.heading2);
  doc.setFont('helvetica', 'bold');
  doc.text(`Impacto Total Estimado: ${formatCurrency(totalImpacto)}`, PAGE.marginLeft + 5, y + 12);
  y += 25;
  
  // Inconsistency list
  inconsistencias.forEach((inc, i) => {
    if (needsNewPage(y, 30)) return;
    
    // Card
    doc.setFillColor(...TRIBUTALKS_PDF_COLORS.bgCard);
    doc.roundedRect(PAGE.marginLeft, y, PAGE.contentWidth, 25, 2, 2, 'F');
    
    // Type
    doc.setTextColor(...TRIBUTALKS_PDF_COLORS.warning);
    doc.setFontSize(FONT_SIZES.small);
    doc.setFont('helvetica', 'bold');
    doc.text(getInconsistencyTypeName(inc.tipo), PAGE.marginLeft + 5, y + 7);
    
    // Stats
    doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
    doc.setFontSize(FONT_SIZES.tiny);
    doc.setFont('helvetica', 'normal');
    doc.text(`${inc.quantidadeNotas} notas • Impacto: ${formatCurrency(inc.impacto)}`, PAGE.width - PAGE.marginRight - 5, y + 7, { align: 'right' });
    
    // Description
    doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
    doc.setFontSize(FONT_SIZES.tiny);
    const descTruncated = truncateText(inc.descricao, PAGE.contentWidth - 15, FONT_SIZES.tiny);
    doc.text(descTruncated, PAGE.marginLeft + 5, y + 14);
    
    // Recommendation
    doc.setTextColor(...TRIBUTALKS_PDF_COLORS.goldText);
    const recTruncated = truncateText(`Ação: ${inc.recomendacao}`, PAGE.contentWidth - 15, FONT_SIZES.tiny);
    doc.text(recTruncated, PAGE.marginLeft + 5, y + 20);
    
    y += 30;
  });
  
  return y;
}

// Draw opportunities page
function drawOpportunitiesPage(
  doc: jsPDF,
  oportunidades: Oportunidade[],
  startY: number
): number {
  let y = startY;
  
  // Section title
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.gold);
  doc.setFontSize(FONT_SIZES.heading1);
  doc.setFont('helvetica', 'bold');
  doc.text('OPORTUNIDADES IDENTIFICADAS', PAGE.marginLeft, y);
  y += 8;
  
  const quickWins = oportunidades.filter(o => o.quickWin);
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
  doc.setFontSize(FONT_SIZES.small);
  doc.setFont('helvetica', 'normal');
  doc.text(`${oportunidades.length} oportunidades (${quickWins.length} Quick Wins)`, PAGE.marginLeft, y);
  y += 12;
  
  oportunidades.slice(0, 6).forEach((op, i) => {
    if (needsNewPage(y, 35)) return;
    
    // Card
    const cardBg = op.quickWin ? TRIBUTALKS_PDF_COLORS.bgGoldCard : TRIBUTALKS_PDF_COLORS.bgCard;
    doc.setFillColor(...cardBg);
    doc.roundedRect(PAGE.marginLeft, y, PAGE.contentWidth, 30, 2, 2, 'F');
    
    // Quick Win badge
    if (op.quickWin) {
      doc.setFillColor(...TRIBUTALKS_PDF_COLORS.gold);
      doc.roundedRect(PAGE.marginLeft + 5, y + 4, 22, 5, 1, 1, 'F');
      doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textDark);
      doc.setFontSize(FONT_SIZES.micro);
      doc.setFont('helvetica', 'bold');
      doc.text('QUICK WIN', PAGE.marginLeft + 16, y + 7.5, { align: 'center' });
    }
    
    // Title
    doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textPrimary);
    doc.setFontSize(FONT_SIZES.small);
    doc.setFont('helvetica', 'bold');
    doc.text(truncateText(op.titulo, 120, FONT_SIZES.small), PAGE.marginLeft + 5, y + (op.quickWin ? 15 : 10));
    
    // Savings
    doc.setTextColor(...TRIBUTALKS_PDF_COLORS.goldText);
    doc.setFontSize(FONT_SIZES.small);
    doc.text(
      `${formatCurrency(op.economiaMin)} — ${formatCurrency(op.economiaMax)} /ano`,
      PAGE.width - PAGE.marginRight - 5,
      y + 10,
      { align: 'right' }
    );
    
    // Description
    doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
    doc.setFontSize(FONT_SIZES.tiny);
    doc.setFont('helvetica', 'normal');
    const descTruncated = truncateText(op.descricao, PAGE.contentWidth - 15, FONT_SIZES.tiny);
    doc.text(descTruncated, PAGE.marginLeft + 5, y + (op.quickWin ? 22 : 18));
    
    // Risk and complexity
    doc.text(`Risco: ${getRiskName(op.risco)} • Complexidade: ${getComplexityName(op.complexidade)}`, PAGE.marginLeft + 5, y + 27);
    
    y += 35;
  });
  
  return y;
}

// Draw final page with next steps and disclaimer
function drawNextStepsAndDisclaimer(doc: jsPDF, startY: number): void {
  let y = startY;
  
  // Section title
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.gold);
  doc.setFontSize(FONT_SIZES.heading1);
  doc.setFont('helvetica', 'bold');
  doc.text('PRÓXIMOS PASSOS', PAGE.marginLeft, y);
  y += 12;
  
  const steps = [
    'Revise os créditos identificados com seu contador ou advogado tributarista',
    'Priorize as oportunidades de Quick Win para resultados mais rápidos',
    'Valide as bases legais citadas com a legislação vigente',
    'Prepare a documentação necessária (notas fiscais, SPEDs, DCTFs)',
    'Submeta o pedido de compensação ou restituição junto à Receita Federal',
    'Monitore o processo e acompanhe os prazos de homologação',
    'Atualize suas rotinas fiscais para aproveitar créditos futuros',
  ];
  
  steps.forEach((step, i) => {
    // Number circle
    doc.setFillColor(...TRIBUTALKS_PDF_COLORS.gold);
    doc.circle(PAGE.marginLeft + 4, y + 2, 4, 'F');
    
    doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textDark);
    doc.setFontSize(FONT_SIZES.small);
    doc.setFont('helvetica', 'bold');
    doc.text(String(i + 1), PAGE.marginLeft + 4, y + 3.5, { align: 'center' });
    
    // Step text
    doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textPrimary);
    doc.setFontSize(FONT_SIZES.small);
    doc.setFont('helvetica', 'normal');
    doc.text(step, PAGE.marginLeft + 12, y + 3);
    
    y += 10;
  });
  
  y += 10;
  
  // Disclaimer
  doc.setFillColor(...TRIBUTALKS_PDF_COLORS.bgCard);
  doc.roundedRect(PAGE.marginLeft, y, PAGE.contentWidth, 45, 2, 2, 'F');
  
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.warning);
  doc.setFontSize(FONT_SIZES.heading3);
  doc.setFont('helvetica', 'bold');
  doc.text('AVISO LEGAL', PAGE.marginLeft + 5, y + 10);
  
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
  doc.setFontSize(FONT_SIZES.tiny);
  doc.setFont('helvetica', 'normal');
  
  const disclaimerText = [
    'Os créditos identificados neste relatório são estimativas baseadas na análise automatizada',
    'dos documentos fiscais fornecidos. A recuperação efetiva dos valores deve ser validada',
    'e executada por um contador ou advogado tributarista de sua confiança.',
    '',
    'O TribuTalks tem natureza EXCLUSIVAMENTE EDUCATIVA E INFORMATIVA. O conteúdo, cálculos',
    'e simulações não constituem parecer jurídico, consultoria contábil ou garantia de resultados.',
  ];
  
  disclaimerText.forEach((line, i) => {
    doc.text(line, PAGE.marginLeft + 5, y + 18 + (i * 4));
  });
  
  y += 55;
  
  // Contact info
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.goldText);
  doc.setFontSize(FONT_SIZES.small);
  doc.setFont('helvetica', 'bold');
  doc.text('Precisa de ajuda?', PAGE.marginLeft, y);
  
  y += 8;
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
  doc.setFontSize(FONT_SIZES.tiny);
  doc.setFont('helvetica', 'normal');
  doc.text('suporte@tributalks.com.br', PAGE.marginLeft, y);
  doc.text('WhatsApp: +55 11 91452-3971', PAGE.marginLeft + 60, y);
  doc.text('tributalks.com.br', PAGE.marginLeft + 120, y);
}

// Helper functions
function getInconsistencyTypeName(tipo: string): string {
  const names: Record<string, string> = {
    cst_incorreto: 'CST Incorreto',
    ncm_divergente: 'NCM Divergente',
    aliquota_indevida: 'Alíquota Indevida',
    base_calculo_incorreta: 'Base de Cálculo Incorreta',
    cfop_incompativel: 'CFOP Incompatível',
    credito_nao_aproveitado: 'Crédito Não Aproveitado',
    tributacao_monofasica: 'Tributação Monofásica',
    outro: 'Outro',
  };
  return names[tipo] || tipo;
}

function getComplexityName(complexidade: string): string {
  const names: Record<string, string> = {
    rapida: 'Rápida',
    media: 'Média',
    complexa: 'Complexa',
  };
  return names[complexidade] || complexidade;
}

// Export utilities
export { generateReportId } from './types';
