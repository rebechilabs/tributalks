/**
 * TribuTalks PDF Template
 * Base template functions for PDF generation
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
  getRegimeName,
  getConfidenceName,
  getRiskName,
  truncateText,
} from './TribuTalksPdfStyles';
import type { EmpresaDados, SumarioExecutivo, NivelConfianca, NivelRisco } from './types';

// Draw page header with logo
export function drawHeader(
  doc: jsPDF, 
  logoBase64: string | null, 
  pageNumber: number, 
  totalPages: number
): void {
  const y = PAGE.marginTop;
  
  // Background bar
  doc.setFillColor(...TRIBUTALKS_PDF_COLORS.bgCard);
  doc.rect(0, 0, PAGE.width, PAGE.marginTop + PAGE.headerHeight - 5, 'F');
  
  // Logo (if available)
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', PAGE.marginLeft, y - 8, 30, 12);
    } catch {
      // Fallback to text
      doc.setTextColor(...TRIBUTALKS_PDF_COLORS.gold);
      doc.setFontSize(FONT_SIZES.heading2);
      doc.setFont('helvetica', 'bold');
      doc.text('TribuTalks', PAGE.marginLeft, y);
    }
  }
  
  // Brand text
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.goldText);
  doc.setFontSize(FONT_SIZES.small);
  doc.setFont('helvetica', 'normal');
  doc.text('Inteligência Tributária', PAGE.marginLeft + 35, y - 2);
  
  // Page number
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
  doc.setFontSize(FONT_SIZES.tiny);
  doc.text(
    `Página ${pageNumber} de ${totalPages}`,
    PAGE.width - PAGE.marginRight,
    y,
    { align: 'right' }
  );
  
  // Separator line
  doc.setDrawColor(...TRIBUTALKS_PDF_COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(PAGE.marginLeft, y + 8, PAGE.width - PAGE.marginRight, y + 8);
}

// Draw page footer
export function drawFooter(doc: jsPDF, reportId: string): void {
  const y = PAGE.height - PAGE.marginBottom;
  
  // Separator line
  doc.setDrawColor(...TRIBUTALKS_PDF_COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(PAGE.marginLeft, y, PAGE.width - PAGE.marginRight, y);
  
  // Report ID
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textMuted);
  doc.setFontSize(FONT_SIZES.tiny);
  doc.text(`Relatório ${reportId}`, PAGE.marginLeft, y + 8);
  
  // Legal entity
  doc.text(
    'Rebechi & Silva Produções • TribuTalks',
    PAGE.width - PAGE.marginRight,
    y + 8,
    { align: 'right' }
  );
  
  // Disclaimer
  doc.setFontSize(FONT_SIZES.micro);
  doc.text(
    'Este documento é de caráter informativo. Consulte um profissional habilitado.',
    PAGE.width / 2,
    y + 12,
    { align: 'center' }
  );
}

// Draw cover page
export function drawCoverPage(
  doc: jsPDF,
  logoBase64: string | null,
  empresa: EmpresaDados,
  reportId: string,
  dataGeracao: Date,
  periodoInicio: Date,
  periodoFim: Date,
  totalXmls: number
): void {
  // Full dark background
  doc.setFillColor(...TRIBUTALKS_PDF_COLORS.bgPrimary);
  doc.rect(0, 0, PAGE.width, PAGE.height, 'F');
  
  // Gold accent bar at top
  doc.setFillColor(...TRIBUTALKS_PDF_COLORS.gold);
  doc.rect(0, 0, PAGE.width, 8, 'F');
  
  let y = 50;
  
  // Logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', (PAGE.width - 60) / 2, y, 60, 24);
      y += 35;
    } catch {
      y += 5;
    }
  }
  
  // Main title
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.gold);
  doc.setFontSize(FONT_SIZES.title + 4);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE', PAGE.width / 2, y, { align: 'center' });
  y += 10;
  doc.text('CRÉDITOS TRIBUTÁRIOS', PAGE.width / 2, y, { align: 'center' });
  
  // Subtitle
  y += 15;
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
  doc.setFontSize(FONT_SIZES.heading2);
  doc.setFont('helvetica', 'normal');
  doc.text('Análise automatizada de oportunidades fiscais', PAGE.width / 2, y, { align: 'center' });
  
  // Company card
  y += 25;
  const cardX = PAGE.marginLeft + 10;
  const cardWidth = PAGE.contentWidth - 20;
  const cardHeight = 65;
  
  // Card background
  doc.setFillColor(...TRIBUTALKS_PDF_COLORS.bgGoldCard);
  doc.roundedRect(cardX, y, cardWidth, cardHeight, 3, 3, 'F');
  
  // Card border
  doc.setDrawColor(...TRIBUTALKS_PDF_COLORS.borderGold);
  doc.setLineWidth(0.5);
  doc.roundedRect(cardX, y, cardWidth, cardHeight, 3, 3, 'S');
  
  y += 12;
  const textX = cardX + 10;
  
  // Company name
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textPrimary);
  doc.setFontSize(FONT_SIZES.heading1);
  doc.setFont('helvetica', 'bold');
  doc.text(truncateText(empresa.razaoSocial || 'Empresa', 140, FONT_SIZES.heading1), textX, y);
  
  // CNPJ
  y += 10;
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.goldText);
  doc.setFontSize(FONT_SIZES.body);
  doc.setFont('helvetica', 'normal');
  doc.text(`CNPJ: ${formatCNPJ(empresa.cnpj || '')}`, textX, y);
  
  // Regime
  y += 7;
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
  doc.text(`Regime: ${getRegimeName(empresa.regime)}`, textX, y);
  
  // CNAE (if available)
  if (empresa.cnae) {
    y += 7;
    doc.text(`CNAE: ${empresa.cnae} - ${truncateText(empresa.cnaeDescricao || '', 80, FONT_SIZES.body)}`, textX, y);
  }
  
  // Location
  if (empresa.municipio && empresa.uf) {
    y += 7;
    doc.text(`${empresa.municipio} - ${empresa.uf}`, textX, y);
  }
  
  // Report info section
  y = 200;
  
  // Report ID badge
  doc.setFillColor(...TRIBUTALKS_PDF_COLORS.bgCard);
  doc.roundedRect(PAGE.width / 2 - 35, y, 70, 12, 2, 2, 'F');
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.gold);
  doc.setFontSize(FONT_SIZES.body);
  doc.setFont('helvetica', 'bold');
  doc.text(reportId, PAGE.width / 2, y + 8, { align: 'center' });
  
  // Dates and stats
  y += 25;
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
  doc.setFontSize(FONT_SIZES.small);
  doc.setFont('helvetica', 'normal');
  
  const infoItems = [
    `Data de Geração: ${formatDate(dataGeracao)}`,
    `Período Analisado: ${formatDate(periodoInicio)} a ${formatDate(periodoFim)}`,
    `XMLs Processados: ${totalXmls}`,
  ];
  
  infoItems.forEach((item, i) => {
    doc.text(item, PAGE.width / 2, y + (i * 8), { align: 'center' });
  });
  
  // Bottom brand
  y = PAGE.height - 30;
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.goldText);
  doc.setFontSize(FONT_SIZES.small);
  doc.text('TribuTalks — Inteligência Tributária', PAGE.width / 2, y, { align: 'center' });
  
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textMuted);
  doc.setFontSize(FONT_SIZES.tiny);
  doc.text('tributalks.com.br', PAGE.width / 2, y + 6, { align: 'center' });
}

// Draw executive summary page
export function drawExecutiveSummary(
  doc: jsPDF,
  sumario: SumarioExecutivo,
  startY: number
): number {
  let y = startY;
  
  // Section title
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.gold);
  doc.setFontSize(FONT_SIZES.heading1);
  doc.setFont('helvetica', 'bold');
  doc.text('SUMÁRIO EXECUTIVO', PAGE.marginLeft, y);
  y += 12;
  
  // Total recoverable card
  const totalCardWidth = PAGE.contentWidth;
  const totalCardHeight = 35;
  
  doc.setFillColor(...TRIBUTALKS_PDF_COLORS.bgGoldCard);
  doc.roundedRect(PAGE.marginLeft, y, totalCardWidth, totalCardHeight, 3, 3, 'F');
  doc.setDrawColor(...TRIBUTALKS_PDF_COLORS.gold);
  doc.setLineWidth(1);
  doc.roundedRect(PAGE.marginLeft, y, totalCardWidth, totalCardHeight, 3, 3, 'S');
  
  // Total label
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
  doc.setFontSize(FONT_SIZES.small);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL RECUPERÁVEL IDENTIFICADO', PAGE.marginLeft + 10, y + 10);
  
  // Total value
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.gold);
  doc.setFontSize(FONT_SIZES.title);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(sumario.totalRecuperavel), PAGE.marginLeft + 10, y + 25);
  
  // Confidence breakdown on the right
  const confidenceX = PAGE.width - PAGE.marginRight - 60;
  doc.setFontSize(FONT_SIZES.tiny);
  doc.setFont('helvetica', 'normal');
  
  const confidenceItems = [
    { label: 'Alta Confiança:', value: sumario.altaConfianca, color: TRIBUTALKS_PDF_COLORS.success },
    { label: 'Média Confiança:', value: sumario.mediaConfianca, color: TRIBUTALKS_PDF_COLORS.warning },
    { label: 'Baixa Confiança:', value: sumario.baixaConfianca, color: TRIBUTALKS_PDF_COLORS.danger },
  ];
  
  confidenceItems.forEach((item, i) => {
    const itemY = y + 8 + (i * 8);
    doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
    doc.text(item.label, confidenceX, itemY);
    doc.setTextColor(...item.color);
    doc.text(formatCurrency(item.value), confidenceX + 35, itemY);
  });
  
  y += totalCardHeight + SPACING.lg;
  
  // Tax breakdown
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textPrimary);
  doc.setFontSize(FONT_SIZES.heading3);
  doc.setFont('helvetica', 'bold');
  doc.text('Breakdown por Tributo', PAGE.marginLeft, y);
  y += 10;
  
  const taxItems = [
    { name: 'PIS/COFINS', value: sumario.pisCofins, color: TRIBUTALKS_PDF_COLORS.chart1 },
    { name: 'ICMS', value: sumario.icms, color: TRIBUTALKS_PDF_COLORS.chart2 },
    { name: 'ICMS-ST', value: sumario.icmsSt, color: TRIBUTALKS_PDF_COLORS.chart3 },
    { name: 'IPI', value: sumario.ipi, color: TRIBUTALKS_PDF_COLORS.chart4 },
  ];
  
  const barWidth = PAGE.contentWidth - 80;
  const maxValue = Math.max(...taxItems.map(t => t.value), 1);
  
  taxItems.forEach((tax, i) => {
    const itemY = y + (i * 14);
    
    // Label
    doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textPrimary);
    doc.setFontSize(FONT_SIZES.small);
    doc.setFont('helvetica', 'normal');
    doc.text(tax.name, PAGE.marginLeft, itemY + 3);
    
    // Bar background
    doc.setFillColor(...TRIBUTALKS_PDF_COLORS.bgCard);
    doc.roundedRect(PAGE.marginLeft + 35, itemY, barWidth, 6, 1, 1, 'F');
    
    // Bar fill
    const fillWidth = (tax.value / maxValue) * barWidth;
    if (fillWidth > 0) {
      doc.setFillColor(...tax.color);
      doc.roundedRect(PAGE.marginLeft + 35, itemY, fillWidth, 6, 1, 1, 'F');
    }
    
    // Value
    doc.setTextColor(...TRIBUTALKS_PDF_COLORS.goldText);
    doc.text(formatCurrency(tax.value), PAGE.width - PAGE.marginRight, itemY + 3, { align: 'right' });
  });
  
  y += taxItems.length * 14 + SPACING.lg;
  
  // Statistics
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textPrimary);
  doc.setFontSize(FONT_SIZES.heading3);
  doc.setFont('helvetica', 'bold');
  doc.text('Estatísticas da Análise', PAGE.marginLeft, y);
  y += 10;
  
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
  doc.setFontSize(FONT_SIZES.body);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de créditos identificados: ${sumario.totalCreditos}`, PAGE.marginLeft, y);
  
  return y + SPACING.lg;
}

// Draw a card with title and content
export function drawCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  title?: string
): void {
  // Background
  doc.setFillColor(...TRIBUTALKS_PDF_COLORS.bgCard);
  doc.roundedRect(x, y, width, height, 2, 2, 'F');
  
  // Border
  doc.setDrawColor(...TRIBUTALKS_PDF_COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, width, height, 2, 2, 'S');
  
  // Title
  if (title) {
    doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textPrimary);
    doc.setFontSize(FONT_SIZES.small);
    doc.setFont('helvetica', 'bold');
    doc.text(title, x + 5, y + 8);
  }
}

// Draw confidence badge
export function drawConfidenceBadge(
  doc: jsPDF,
  level: NivelConfianca | string,
  x: number,
  y: number
): void {
  const color = getConfidenceColor(level as NivelConfianca);
  const text = getConfidenceName(level);
  
  doc.setFillColor(...color);
  doc.roundedRect(x, y - 4, 18, 6, 1, 1, 'F');
  
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textDark);
  doc.setFontSize(FONT_SIZES.micro);
  doc.setFont('helvetica', 'bold');
  doc.text(text, x + 9, y, { align: 'center' });
}

// Draw risk badge
export function drawRiskBadge(
  doc: jsPDF,
  risk: NivelRisco | string,
  x: number,
  y: number
): void {
  const color = getRiskColor(risk as NivelRisco);
  const text = getRiskName(risk);
  
  doc.setFillColor(...color);
  doc.roundedRect(x, y - 4, 20, 6, 1, 1, 'F');
  
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textDark);
  doc.setFontSize(FONT_SIZES.micro);
  doc.setFont('helvetica', 'bold');
  doc.text(text, x + 10, y, { align: 'center' });
}

// Draw table header
export function drawTableHeader(
  doc: jsPDF,
  columns: { label: string; width: number }[],
  x: number,
  y: number
): number {
  // Header background
  doc.setFillColor(...TRIBUTALKS_PDF_COLORS.bgElevated);
  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
  doc.rect(x, y, totalWidth, TABLE.headerHeight, 'F');
  
  // Header text
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.gold);
  doc.setFontSize(TABLE.headerFontSize);
  doc.setFont('helvetica', 'bold');
  
  let colX = x + TABLE.cellPaddingX;
  columns.forEach(col => {
    doc.text(col.label, colX, y + TABLE.headerHeight - 2);
    colX += col.width;
  });
  
  return y + TABLE.headerHeight;
}

// Draw table row
export function drawTableRow(
  doc: jsPDF,
  values: string[],
  columns: { label: string; width: number }[],
  x: number,
  y: number,
  isAlternate: boolean = false
): number {
  // Row background
  if (isAlternate) {
    doc.setFillColor(...TRIBUTALKS_PDF_COLORS.bgSection);
    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
    doc.rect(x, y, totalWidth, TABLE.rowHeight, 'F');
  }
  
  // Row text
  doc.setTextColor(...TRIBUTALKS_PDF_COLORS.textSecondary);
  doc.setFontSize(TABLE.fontSize);
  doc.setFont('helvetica', 'normal');
  
  let colX = x + TABLE.cellPaddingX;
  columns.forEach((col, i) => {
    const text = truncateText(values[i] || '', col.width - TABLE.cellPaddingX * 2, TABLE.fontSize);
    doc.text(text, colX, y + TABLE.rowHeight - 2);
    colX += col.width;
  });
  
  return y + TABLE.rowHeight;
}
