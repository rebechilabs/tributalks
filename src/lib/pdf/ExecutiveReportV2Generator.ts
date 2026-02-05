/**
 * Executive Report V2 Generator
 * Professional PDF with 7 mandatory sections following Nestlé standard:
 * 1. Capa
 * 2. Sumário Executivo (renumbered to 1)
 * 3. Metodologia Aplicada (renumbered to 2)
 * 4. Análise Detalhada dos Créditos (renumbered to 3)
 * 5. Recomendações e Próximos Passos (renumbered to 4)
 * 6. Premissas, Limitações e Aviso Legal (renumbered to 5)
 * 7. Anexos de Rastreabilidade (renumbered to 6)
 * + Seção de Contato
 */

import { jsPDF } from 'jspdf';
import type { RelatorioCreditos, TributoCreditoDetalhe, NotaFiscalCredito } from './types';
import {
  EXEC_PAGE,
  EXEC_FONTS,
  EXEC_COLORS,
  EXEC_SPACING,
  EXEC_LINES,
  getExecContentStart,
  getExecContentEnd,
  needsExecNewPage,
  formatCurrencyExec,
  formatDateExec,
  formatDateTimeExec,
  formatCnpjExec,
  formatNfeNumber,
  getRegimeFullName,
  getSpedInfo,
  generateRecommendedAction,
} from './ExecutiveReportStyles';

// Bar chart colors for each tax type
const TAX_COLORS = {
  'PIS/COFINS': { r: 59, g: 130, b: 246 },   // Blue
  'PIS': { r: 99, g: 102, b: 241 },          // Indigo
  'COFINS': { r: 139, g: 92, b: 246 },       // Purple
  'ICMS': { r: 16, g: 185, b: 129 },         // Green
  'ICMS-ST': { r: 245, g: 158, b: 11 },      // Amber
  'IPI': { r: 239, g: 68, b: 68 },           // Red
  'Outros': { r: 107, g: 114, b: 128 },      // Gray
};

interface ReportV2Options {
  maxCreditsPerTax?: number;
  includeOpportunities?: boolean;
}

export async function generateExecutiveReportV2(
  data: RelatorioCreditos,
  logoBase64: string | null,
  options: ReportV2Options = {}
): Promise<void> {
  const { maxCreditsPerTax = 15, includeOpportunities = true } = options;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Page tracking
  let currentPage = 1;
  let totalPages = 1;

  // Helper: add page with tracking
  const addPage = () => {
    doc.addPage();
    currentPage++;
  };

  // Helper: draw header on all pages (except cover)
  const drawHeader = (pageNum: number) => {
    if (pageNum === 1) return;
    
    // Logo
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', EXEC_PAGE.marginLeft, 8, 35, 12);
      } catch {
        doc.setFont('helvetica', EXEC_FONTS.smallBold.style);
        doc.setFontSize(EXEC_FONTS.smallBold.size);
        doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
        doc.text('TribuTalks', EXEC_PAGE.marginLeft, 14);
      }
    }
    
    // Report ID on the right
    doc.setFont('courier', EXEC_FONTS.mono.style);
    doc.setFontSize(EXEC_FONTS.mono.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    doc.text(data.id, EXEC_PAGE.width - EXEC_PAGE.marginRight, 14, { align: 'right' });
    
    // Line under header
    doc.setDrawColor(EXEC_COLORS.gold.r, EXEC_COLORS.gold.g, EXEC_COLORS.gold.b);
    doc.setLineWidth(EXEC_LINES.separator);
    doc.line(EXEC_PAGE.marginLeft, 22, EXEC_PAGE.width - EXEC_PAGE.marginRight, 22);
  };

  // Helper: draw footer with pagination
  const drawFooter = (pageNum: number, total: number) => {
    if (pageNum === 1) return;
    
    const footerY = EXEC_PAGE.height - 10;
    
    doc.setFont('helvetica', EXEC_FONTS.small.style);
    doc.setFontSize(EXEC_FONTS.small.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    
    // Page number
    doc.text(`Página ${pageNum} de ${total}`, EXEC_PAGE.width - EXEC_PAGE.marginRight, footerY, { align: 'right' });
    
    // Date
    doc.text(formatDateTimeExec(data.dataGeracao), EXEC_PAGE.marginLeft, footerY);
  };

  // ============================================
  // SECTION 1: COVER PAGE
  // ============================================
  const drawCoverPage = () => {
    // Logo at top left
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', EXEC_PAGE.marginLeft, EXEC_PAGE.marginTop, 50, 18);
      } catch {
        doc.setFont('helvetica', EXEC_FONTS.h2.style);
        doc.setFontSize(EXEC_FONTS.h2.size);
        doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
        doc.text('TribuTalks', EXEC_PAGE.marginLeft, EXEC_PAGE.marginTop + 10);
      }
    }
    
    // Main title
    let y = 85;
    doc.setFont('helvetica', EXEC_FONTS.h1.style);
    doc.setFontSize(24);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('RELATÓRIO DE CRÉDITOS', EXEC_PAGE.width / 2, y, { align: 'center' });
    y += 12;
    doc.text('TRIBUTÁRIOS', EXEC_PAGE.width / 2, y, { align: 'center' });
    
    // Subtitle
    y += 15;
    doc.setFont('helvetica', EXEC_FONTS.h2.style);
    doc.setFontSize(14);
    doc.setTextColor(EXEC_COLORS.gold.r, EXEC_COLORS.gold.g, EXEC_COLORS.gold.b);
    doc.text('Sumário Executivo', EXEC_PAGE.width / 2, y, { align: 'center' });
    
    // Company info box
    y = 135;
    const boxX = EXEC_PAGE.marginLeft + 15;
    const boxWidth = EXEC_PAGE.contentWidth - 30;
    const boxHeight = 60;
    
    doc.setDrawColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.setLineWidth(0.5);
    doc.roundedRect(boxX, y, boxWidth, boxHeight, 3, 3, 'S');
    
    y += 14;
    doc.setFont('helvetica', EXEC_FONTS.bodyBold.style);
    doc.setFontSize(EXEC_FONTS.bodyBold.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('EMPRESA', boxX + 12, y);
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    doc.text(data.empresa.razaoSocial, boxX + 55, y);
    
    y += 10;
    doc.setFont('helvetica', EXEC_FONTS.bodyBold.style);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('CNPJ', boxX + 12, y);
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    doc.text(formatCnpjExec(data.empresa.cnpj), boxX + 55, y);
    
    y += 10;
    doc.setFont('helvetica', EXEC_FONTS.bodyBold.style);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('REGIME', boxX + 12, y);
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    doc.text(getRegimeFullName(data.empresa.regime), boxX + 55, y);
    
    // Report info
    y = 215;
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setFontSize(EXEC_FONTS.body.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    
    doc.text(`Relatório nº: ${data.id}`, EXEC_PAGE.width / 2, y, { align: 'center' });
    y += 8;
    doc.text(`Data de emissão: ${formatDateExec(data.dataGeracao)}`, EXEC_PAGE.width / 2, y, { align: 'center' });
    y += 8;
    doc.text(`Período analisado: ${formatDateExec(data.periodoInicio)} a ${formatDateExec(data.periodoFim)}`, EXEC_PAGE.width / 2, y, { align: 'center' });
    y += 8;
    doc.text(`Documentos processados: ${data.estatisticas.totalXmlsAnalisados} arquivos XML de NF-e`, EXEC_PAGE.width / 2, y, { align: 'center' });
    
    // Footer branding
    doc.setFont('helvetica', EXEC_FONTS.smallBold.style);
    doc.setFontSize(EXEC_FONTS.small.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('TribuTalks Inteligência Tributária', EXEC_PAGE.width / 2, EXEC_PAGE.height - 20, { align: 'center' });
  };

  // ============================================
  // SECTION 2: EXECUTIVE SUMMARY (numbered as 1)
  // ============================================
  const drawExecutiveSummary = () => {
    addPage();
    drawHeader(currentPage);
    
    let y = getExecContentStart();
    
    // Section title
    doc.setFont('helvetica', EXEC_FONTS.h1.style);
    doc.setFontSize(EXEC_FONTS.h1.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('1. SUMÁRIO EXECUTIVO', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH1;
    
    // Introductory paragraph
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setFontSize(EXEC_FONTS.body.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    const introParagraph = `Este relatório apresenta a análise dos créditos tributários identificados para ${data.empresa.razaoSocial}, com base nos documentos fiscais eletrônicos processados no período de ${formatDateExec(data.periodoInicio)} a ${formatDateExec(data.periodoFim)}.`;
    const introLines = doc.splitTextToSize(introParagraph, EXEC_PAGE.contentWidth);
    doc.text(introLines, EXEC_PAGE.marginLeft, y);
    y += introLines.length * 5 + 8;
    
    // Total highlight box with GREEN color
    doc.setFillColor(EXEC_COLORS.tableHeader.r, EXEC_COLORS.tableHeader.g, EXEC_COLORS.tableHeader.b);
    doc.roundedRect(EXEC_PAGE.marginLeft, y, EXEC_PAGE.contentWidth, 28, 2, 2, 'F');
    
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setFontSize(EXEC_FONTS.body.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    doc.text('Total de Créditos Identificados', EXEC_PAGE.marginLeft + 5, y + 8);
    
    // GREEN total value
    doc.setFont('helvetica', EXEC_FONTS.h1.style);
    doc.setFontSize(20);
    doc.setTextColor(EXEC_COLORS.green.r, EXEC_COLORS.green.g, EXEC_COLORS.green.b);
    doc.text(formatCurrencyExec(data.sumario.totalRecuperavel), EXEC_PAGE.marginLeft + 5, y + 22);
    
    // Economia anual estimada
    doc.setFont('helvetica', EXEC_FONTS.small.style);
    doc.setFontSize(EXEC_FONTS.small.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    const economiaMin = formatCurrencyExec(data.sumario.economiaAnualMin);
    const economiaMax = formatCurrencyExec(data.sumario.economiaAnualMax);
    doc.text(`Economia potencial anual estimada: ${economiaMin} a ${economiaMax}`, EXEC_PAGE.marginLeft + 100, y + 18);
    
    y += 38;
    
    // Tax distribution table
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('Distribuição por Tributo', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH3;
    
    // Build tax data
    const taxData = [
      { tributo: 'PIS/COFINS', valor: data.sumario.pisCofins },
      { tributo: 'ICMS', valor: data.sumario.icms },
      { tributo: 'ICMS-ST', valor: data.sumario.icmsSt },
      { tributo: 'IPI', valor: data.sumario.ipi },
    ].filter(t => t.valor > 0);
    
    const total = taxData.reduce((sum, t) => sum + t.valor, 0);
    
    // Table header
    const tableX = EXEC_PAGE.marginLeft;
    const colWidths = [60, 55, 55];
    
    doc.setFillColor(EXEC_COLORS.tableHeader.r, EXEC_COLORS.tableHeader.g, EXEC_COLORS.tableHeader.b);
    doc.rect(tableX, y, EXEC_PAGE.contentWidth, 7, 'F');
    
    doc.setFont('helvetica', EXEC_FONTS.smallBold.style);
    doc.setFontSize(EXEC_FONTS.smallBold.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('Tributo', tableX + 3, y + 5);
    doc.text('Valor (R$)', tableX + colWidths[0] + 3, y + 5);
    doc.text('Representatividade (%)', tableX + colWidths[0] + colWidths[1] + 3, y + 5);
    
    y += 7;
    
    // Table rows
    doc.setFont('helvetica', EXEC_FONTS.small.style);
    doc.setFontSize(EXEC_FONTS.small.size);
    
    taxData.forEach((row, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(tableX, y, EXEC_PAGE.contentWidth, 6, 'F');
      }
      
      doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
      doc.text(row.tributo, tableX + 3, y + 4);
      doc.text(formatCurrencyExec(row.valor), tableX + colWidths[0] + 3, y + 4);
      doc.text(`${((row.valor / total) * 100).toFixed(1)}%`, tableX + colWidths[0] + colWidths[1] + 3, y + 4);
      
      y += 6;
    });
    
    // Total row with gold highlight
    doc.setFillColor(EXEC_COLORS.gold.r, EXEC_COLORS.gold.g, EXEC_COLORS.gold.b);
    doc.rect(tableX, y, EXEC_PAGE.contentWidth, 7, 'F');
    doc.setFont('helvetica', EXEC_FONTS.smallBold.style);
    doc.setTextColor(EXEC_COLORS.white.r, EXEC_COLORS.white.g, EXEC_COLORS.white.b);
    doc.text('TOTAL', tableX + 3, y + 5);
    doc.text(formatCurrencyExec(total), tableX + colWidths[0] + 3, y + 5);
    doc.text('100%', tableX + colWidths[0] + colWidths[1] + 3, y + 5);
    
    y += 15;
    
    // Bar chart
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('Gráfico de Distribuição', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH3;
    
    const maxBarWidth = 100;
    const barHeight = 8;
    const maxValue = Math.max(...taxData.map(t => t.valor));
    
    taxData.forEach(row => {
      const barWidth = (row.valor / maxValue) * maxBarWidth;
      const color = TAX_COLORS[row.tributo as keyof typeof TAX_COLORS] || TAX_COLORS.Outros;
      
      // Label
      doc.setFont('helvetica', EXEC_FONTS.small.style);
      doc.setFontSize(EXEC_FONTS.small.size);
      doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
      doc.text(row.tributo, EXEC_PAGE.marginLeft, y + 5);
      
      // Bar
      doc.setFillColor(color.r, color.g, color.b);
      doc.roundedRect(EXEC_PAGE.marginLeft + 35, y, barWidth, barHeight, 1, 1, 'F');
      
      // Value
      doc.setFont('helvetica', EXEC_FONTS.smallBold.style);
      doc.text(formatCurrencyExec(row.valor), EXEC_PAGE.marginLeft + 40 + barWidth, y + 5);
      
      y += barHeight + 4;
    });
    
    y += 10;
    
    // Top opportunities summary
    if (includeOpportunities && data.oportunidades.length > 0) {
      doc.setFont('helvetica', EXEC_FONTS.h3.style);
      doc.setFontSize(EXEC_FONTS.h3.size);
      doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
      doc.text('Resumo das Oportunidades', EXEC_PAGE.marginLeft, y);
      y += EXEC_SPACING.afterH3;
      
      // Opportunities table header
      doc.setFillColor(EXEC_COLORS.tableHeader.r, EXEC_COLORS.tableHeader.g, EXEC_COLORS.tableHeader.b);
      doc.rect(tableX, y, EXEC_PAGE.contentWidth, 6, 'F');
      doc.setFont('helvetica', EXEC_FONTS.smallBold.style);
      doc.setFontSize(EXEC_FONTS.smallBold.size);
      doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
      doc.text('Oportunidade', tableX + 3, y + 4);
      doc.text('Complexidade', tableX + 100, y + 4);
      doc.text('Risco', tableX + 140, y + 4);
      y += 6;
      
      doc.setFont('helvetica', EXEC_FONTS.small.style);
      data.oportunidades.slice(0, 3).forEach((op, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(tableX, y, EXEC_PAGE.contentWidth, 5, 'F');
        }
        doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
        doc.text(op.titulo.substring(0, 50), tableX + 3, y + 3.5);
        doc.text(op.complexidade.charAt(0).toUpperCase() + op.complexidade.slice(1), tableX + 100, y + 3.5);
        doc.text(op.risco.charAt(0).toUpperCase() + op.risco.slice(1), tableX + 140, y + 3.5);
        y += 5;
      });
    }
  };

  // ============================================
  // SECTION 3: METHODOLOGY (numbered as 2)
  // ============================================
  const drawMethodology = () => {
    addPage();
    drawHeader(currentPage);
    
    let y = getExecContentStart();
    
    doc.setFont('helvetica', EXEC_FONTS.h1.style);
    doc.setFontSize(EXEC_FONTS.h1.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('2. METODOLOGIA APLICADA', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH1;
    
    // Data sources
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.text('2.1 Fontes de Dados', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH3;
    
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setFontSize(EXEC_FONTS.body.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    
    const sources = [
      `• XMLs de NF-e: ${data.estatisticas.totalXmlsAnalisados} arquivos processados`,
      `• Período de análise: ${formatDateExec(data.periodoInicio)} a ${formatDateExec(data.periodoFim)}`,
      `• Fornecedores analisados: ${data.estatisticas.fornecedoresAnalisados}`,
      `• Regras tributárias aplicadas: ${data.estatisticas.regrasAplicadas}`,
    ];
    
    sources.forEach(source => {
      doc.text(source, EXEC_PAGE.marginLeft + 5, y);
      y += 6;
    });
    
    y += 10;
    
    // Analysis process - 5 steps as per Nestlé model
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('2.2 Processo de Análise', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH3;
    
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setFontSize(EXEC_FONTS.body.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    
    const steps = [
      {
        step: '1. Coleta e Validação',
        desc: 'Extração e validação dos dados dos arquivos XML de NF-e e SPED Contribuições.',
      },
      {
        step: '2. Classificação Fiscal',
        desc: 'Cruzamento de informações de NCM, CFOP e CST com a legislação vigente.',
      },
      {
        step: '3. Aplicação Legal',
        desc: 'Verificação das bases legais aplicáveis, incluindo Leis 10.637/02 e 10.833/03 para PIS/COFINS.',
      },
      {
        step: '4. Cálculo de Créditos',
        desc: 'Aplicação das alíquotas corretas e cálculo dos valores passíveis de recuperação.',
      },
      {
        step: '5. Consolidação',
        desc: 'Agrupamento por tributo e período, com classificação por nível de confiança.',
      },
    ];
    
    steps.forEach(s => {
      doc.setFont('helvetica', EXEC_FONTS.bodyBold.style);
      doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
      doc.text(s.step, EXEC_PAGE.marginLeft + 5, y);
      y += 5;
      doc.setFont('helvetica', EXEC_FONTS.body.style);
      doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
      const lines = doc.splitTextToSize(s.desc, EXEC_PAGE.contentWidth - 15);
      doc.text(lines, EXEC_PAGE.marginLeft + 10, y);
      y += lines.length * 5 + 5;
    });
    
    y += 10;
    
    // Legal references
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('2.3 Fundamentação Legal', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH3;
    
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setFontSize(EXEC_FONTS.body.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    
    const legalBases = [
      '• Lei 10.637/02 — Regime não-cumulativo do PIS',
      '• Lei 10.833/03 — Regime não-cumulativo da COFINS',
      '• Lei Complementar 87/96 — Lei Kandir (ICMS)',
      '• Decreto 7.212/10 — Regulamento do IPI',
    ];
    
    legalBases.forEach(basis => {
      doc.text(basis, EXEC_PAGE.marginLeft + 5, y);
      y += 6;
    });
    
    y += 10;
    
    // Validation criteria
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('2.4 Critérios de Validação', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH3;
    
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setFontSize(EXEC_FONTS.body.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    
    const criteria = [
      '• Alta Confiança: Crédito com base legal clara e documentação completa.',
      '• Média Confiança: Crédito provável, requer validação documental adicional.',
      '• Baixa Confiança: Crédito possível, requer análise especializada.',
    ];
    
    criteria.forEach(criterion => {
      const lines = doc.splitTextToSize(criterion, EXEC_PAGE.contentWidth - 10);
      doc.text(lines, EXEC_PAGE.marginLeft + 5, y);
      y += lines.length * 5 + 2;
    });
  };

  // ============================================
  // SECTION 4: DETAILED CREDIT ANALYSIS (numbered as 3)
  // ============================================
  const drawDetailedAnalysis = () => {
    addPage();
    drawHeader(currentPage);
    
    let y = getExecContentStart();
    
    doc.setFont('helvetica', EXEC_FONTS.h1.style);
    doc.setFontSize(EXEC_FONTS.h1.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('3. ANÁLISE DETALHADA DOS CRÉDITOS', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH1;
    
    data.creditosPorTributo.forEach((tributo, tribIndex) => {
      // Check if we need a new page
      if (needsExecNewPage(y, 80)) {
        addPage();
        drawHeader(currentPage);
        y = getExecContentStart();
      }
      
      // Subsection title
      doc.setFont('helvetica', EXEC_FONTS.h2.style);
      doc.setFontSize(EXEC_FONTS.h2.size);
      doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
      doc.text(`3.${tribIndex + 1} Créditos de ${tributo.tributo}`, EXEC_PAGE.marginLeft, y);
      y += EXEC_SPACING.afterH2;
      
      // Summary info
      doc.setFont('helvetica', EXEC_FONTS.body.style);
      doc.setFontSize(EXEC_FONTS.body.size);
      doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
      doc.text(`Total identificado: ${formatCurrencyExec(tributo.valorTotal)} | Documentos: ${tributo.notas.length}`, EXEC_PAGE.marginLeft + 3, y);
      y += 5;
      if (tributo.baseLegal) {
        doc.text(`Fundamentação: ${tributo.baseLegal}`, EXEC_PAGE.marginLeft + 3, y);
        y += 8;
      } else {
        y += 3;
      }
      
      // Detail table with all columns
      const tableX = EXEC_PAGE.marginLeft;
      const cols = [25, 35, 18, 30, 35, EXEC_PAGE.contentWidth - 143];
      
      // Header
      doc.setFillColor(EXEC_COLORS.tableHeader.r, EXEC_COLORS.tableHeader.g, EXEC_COLORS.tableHeader.b);
      doc.rect(tableX, y, EXEC_PAGE.contentWidth, 6, 'F');
      
      doc.setFont('courier', EXEC_FONTS.monoSmall.style);
      doc.setFontSize(EXEC_FONTS.monoSmall.size);
      doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
      
      let colX = tableX + 2;
      doc.text('Período', colX, y + 4); colX += cols[0];
      doc.text('Base Cálc.', colX, y + 4); colX += cols[1];
      doc.text('Alíq.', colX, y + 4); colX += cols[2];
      doc.text('Crédito (R$)', colX, y + 4); colX += cols[3];
      doc.text('Fund. Legal', colX, y + 4); colX += cols[4];
      doc.text('Documento', colX, y + 4);
      
      y += 6;
      
      // Table rows (limited)
      const notasToShow = tributo.notas.slice(0, maxCreditsPerTax);
      
      doc.setFont('courier', EXEC_FONTS.monoSmall.style);
      notasToShow.forEach((nota, index) => {
        if (needsExecNewPage(y, 8)) {
          addPage();
          drawHeader(currentPage);
          y = getExecContentStart();
        }
        
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(tableX, y, EXEC_PAGE.contentWidth, 5, 'F');
        }
        
        doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
        
        const dataEmissao = typeof nota.dataEmissao === 'string' 
          ? new Date(nota.dataEmissao) 
          : nota.dataEmissao;
        const periodo = `${(dataEmissao.getMonth() + 1).toString().padStart(2, '0')}/${dataEmissao.getFullYear()}`;
        
        colX = tableX + 2;
        doc.text(periodo, colX, y + 3.5); colX += cols[0];
        doc.text(formatCurrencyExec(nota.valorNota).substring(3, 15), colX, y + 3.5); colX += cols[1];
        doc.text(`${(nota.aliquota || 0).toFixed(2)}%`, colX, y + 3.5); colX += cols[2];
        doc.text(formatCurrencyExec(nota.valorCredito).substring(3, 15), colX, y + 3.5); colX += cols[3];
        doc.text((nota.baseLegal || tributo.baseLegal || '').substring(0, 15), colX, y + 3.5); colX += cols[4];
        
        // Truncated NFe key
        const truncatedKey = nota.chaveAcesso.length > 20 
          ? `${nota.chaveAcesso.substring(0, 10)}...${nota.chaveAcesso.slice(-6)}`
          : nota.chaveAcesso || nota.numeroNfe;
        doc.text(truncatedKey, colX, y + 3.5);
        
        y += 5;
      });
      
      // TOTAL row
      doc.setFillColor(EXEC_COLORS.gold.r, EXEC_COLORS.gold.g, EXEC_COLORS.gold.b);
      doc.rect(tableX, y, EXEC_PAGE.contentWidth, 6, 'F');
      doc.setFont('courier', EXEC_FONTS.monoSmall.style);
      doc.setTextColor(EXEC_COLORS.white.r, EXEC_COLORS.white.g, EXEC_COLORS.white.b);
      doc.text('TOTAL', tableX + 2, y + 4);
      doc.text(formatCurrencyExec(tributo.valorTotal), tableX + cols[0] + cols[1] + cols[2] + 2, y + 4);
      y += 6;
      
      if (tributo.notas.length > maxCreditsPerTax) {
        doc.setFont('helvetica', EXEC_FONTS.small.style);
        doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
        doc.text(`... e mais ${tributo.notas.length - maxCreditsPerTax} documentos (ver Anexo A)`, tableX + 3, y + 4);
        y += 8;
      }
      
      y += 10;
    });
  };

  // ============================================
  // SECTION 5: RECOMMENDATIONS (numbered as 4)
  // ============================================
  const drawRecommendations = () => {
    addPage();
    drawHeader(currentPage);
    
    let y = getExecContentStart();
    
    doc.setFont('helvetica', EXEC_FONTS.h1.style);
    doc.setFontSize(EXEC_FONTS.h1.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('4. RECOMENDAÇÕES E PRÓXIMOS PASSOS', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH1;
    
    const recommendations = [
      {
        step: '1. Validação Contábil e Jurídica',
        text: 'Encaminhe este documento ao seu contador ou advogado tributarista para validação dos valores e bases legais antes de qualquer ação.',
      },
      {
        step: '2. Localização dos Documentos',
        text: 'Localize os documentos originais (XMLs das NF-e) usando as chaves de acesso de 44 dígitos informadas no Anexo A para cada crédito identificado.',
      },
      {
        step: '3. Retificação de Obrigações',
        text: 'Retifique as obrigações acessórias (EFD Contribuições, EFD ICMS/IPI, DCTF) dos períodos indicados, ajustando os CSTs e valores de crédito.',
      },
      {
        step: '4. Pedido de Restituição/Compensação',
        text: 'Transmita os pedidos de restituição ou compensação via PER/DCOMP Web no e-CAC da Receita Federal para créditos federais.',
      },
      {
        step: '5. Documentação e Arquivamento',
        text: 'Mantenha toda a documentação comprobatória arquivada pelo prazo de 5 anos, incluindo XMLs, SPEDs retificados e comprovantes de transmissão.',
      },
    ];
    
    recommendations.forEach(rec => {
      doc.setFont('helvetica', EXEC_FONTS.h3.style);
      doc.setFontSize(EXEC_FONTS.h3.size);
      doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
      doc.text(rec.step, EXEC_PAGE.marginLeft, y);
      y += 6;
      
      doc.setFont('helvetica', EXEC_FONTS.body.style);
      doc.setFontSize(EXEC_FONTS.body.size);
      doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
      const lines = doc.splitTextToSize(rec.text, EXEC_PAGE.contentWidth - 5);
      doc.text(lines, EXEC_PAGE.marginLeft + 5, y);
      y += lines.length * 5 + 8;
    });
    
    // Timeline
    y += 5;
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('Prazo Estimado para Recuperação', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH3;
    
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    doc.text('• Créditos administrativos (PER/DCOMP): 60 a 180 dias', EXEC_PAGE.marginLeft + 5, y);
    y += 6;
    doc.text('• Créditos via retificação de SPED: 30 a 90 dias', EXEC_PAGE.marginLeft + 5, y);
    y += 6;
    doc.text('• Restituição de ICMS-ST: varia por estado (30 a 360 dias)', EXEC_PAGE.marginLeft + 5, y);
  };

  // ============================================
  // SECTION 6: DISCLAIMERS (numbered as 5)
  // ============================================
  const drawDisclaimers = () => {
    addPage();
    drawHeader(currentPage);
    
    let y = getExecContentStart();
    
    doc.setFont('helvetica', EXEC_FONTS.h1.style);
    doc.setFontSize(EXEC_FONTS.h1.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('5. PREMISSAS, LIMITAÇÕES E AVISO LEGAL', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH1;
    
    // Informative nature
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.text('5.1 Caráter Informativo', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH3;
    
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setFontSize(EXEC_FONTS.body.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    
    const disclaimer1 = 'Os créditos identificados neste relatório são ESTIMATIVAS baseadas na análise automatizada dos documentos fiscais eletrônicos fornecidos. O conteúdo deste relatório tem natureza EXCLUSIVAMENTE EDUCATIVA E INFORMATIVA, não constituindo parecer jurídico ou consultoria fiscal.';
    const lines1 = doc.splitTextToSize(disclaimer1, EXEC_PAGE.contentWidth - 5);
    doc.text(lines1, EXEC_PAGE.marginLeft + 3, y);
    y += lines1.length * 5 + 10;
    
    // Conditions
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('5.2 Condições para Recuperação', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH3;
    
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setFontSize(EXEC_FONTS.body.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    
    doc.text('A recuperação efetiva dos valores está sujeita a:', EXEC_PAGE.marginLeft + 3, y);
    y += 7;
    
    const conditions = [
      '• Validação por profissional contábil ou jurídico habilitado;',
      '• Confirmação das bases legais aplicáveis ao caso concreto;',
      '• Análise de eventuais particularidades da empresa;',
      '• Verificação de prazos decadenciais e prescricionais (5 anos).',
    ];
    
    conditions.forEach(cond => {
      doc.text(cond, EXEC_PAGE.marginLeft + 6, y);
      y += 6;
    });
    
    y += 10;
    
    // Responsibilities
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('5.3 Limitação de Responsabilidade', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH3;
    
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setFontSize(EXEC_FONTS.body.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    
    const disclaimer2 = 'A TribuTalks não se responsabiliza por decisões tomadas com base exclusivamente nas informações deste relatório sem a devida assessoria de profissional habilitado. Os valores apresentados são indicativos e podem sofrer alterações após análise detalhada da documentação fiscal.';
    const lines2 = doc.splitTextToSize(disclaimer2, EXEC_PAGE.contentWidth - 5);
    doc.text(lines2, EXEC_PAGE.marginLeft + 3, y);
  };

  // ============================================
  // SECTION 7: ANNEXES (numbered as 6)
  // ============================================
  const drawAnnexes = () => {
    addPage();
    drawHeader(currentPage);
    
    let y = getExecContentStart();
    
    doc.setFont('helvetica', EXEC_FONTS.h1.style);
    doc.setFontSize(EXEC_FONTS.h1.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('6. ANEXOS DE RASTREABILIDADE', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH1;
    
    doc.setFont('helvetica', EXEC_FONTS.h2.style);
    doc.setFontSize(EXEC_FONTS.h2.size);
    doc.text('ANEXO A — RASTREABILIDADE DE NF-e', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH2;
    
    // Introductory paragraph
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setFontSize(EXEC_FONTS.body.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    const annexIntro = 'A tabela a seguir garante a auditoria completa dos créditos identificados, listando todas as chaves de acesso das NF-e que originaram os valores apresentados neste relatório.';
    const annexLines = doc.splitTextToSize(annexIntro, EXEC_PAGE.contentWidth);
    doc.text(annexLines, EXEC_PAGE.marginLeft, y);
    y += annexLines.length * 5 + 8;
    
    // Collect all notes
    const allNotas: (NotaFiscalCredito & { tributo: string })[] = [];
    data.creditosPorTributo.forEach(trib => {
      trib.notas.forEach(nota => {
        allNotas.push({ ...nota, tributo: trib.tributo });
      });
    });
    
    // Sort by value descending
    allNotas.sort((a, b) => b.valorCredito - a.valorCredito);
    
    // Table header with new columns (including Valor NF-e)
    const tableX = EXEC_PAGE.marginLeft;
    const colsAnnex = [8, 80, 28, 28, EXEC_PAGE.contentWidth - 144];
    
    const drawAnnexTableHeader = () => {
      doc.setFillColor(EXEC_COLORS.tableHeader.r, EXEC_COLORS.tableHeader.g, EXEC_COLORS.tableHeader.b);
      doc.rect(tableX, y, EXEC_PAGE.contentWidth, 6, 'F');
      
      doc.setFont('courier', EXEC_FONTS.monoSmall.style);
      doc.setFontSize(EXEC_FONTS.monoSmall.size);
      doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
      
      let colX = tableX + 2;
      doc.text('Nº', colX, y + 4); colX += colsAnnex[0];
      doc.text('Chave de Acesso (44 dígitos)', colX, y + 4); colX += colsAnnex[1];
      doc.text('Valor NF-e', colX, y + 4); colX += colsAnnex[2];
      doc.text('Crédito Total', colX, y + 4); colX += colsAnnex[3];
      doc.text('Fornecedor', colX, y + 4);
      
      y += 6;
    };
    
    drawAnnexTableHeader();
    
    // All notes with COMPLETE 44-digit keys
    allNotas.forEach((nota, index) => {
      if (needsExecNewPage(y, 12)) {
        addPage();
        drawHeader(currentPage);
        y = getExecContentStart();
        drawAnnexTableHeader();
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(tableX, y, EXEC_PAGE.contentWidth, 10, 'F');
      }
      
      // Use Courier for keys
      doc.setFont('courier', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
      
      let colX = tableX + 2;
      
      // Nº
      doc.text(`${index + 1}`, colX, y + 6); colX += colsAnnex[0];
      
      // Complete 44-digit key (formatted with spaces for readability)
      const fullKey = nota.chaveAcesso || '';
      if (fullKey.length === 44) {
        // Format: XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX
        const formattedKey = fullKey.replace(/(\d{4})/g, '$1 ').trim();
        const keyLines = doc.splitTextToSize(formattedKey, colsAnnex[1] - 4);
        doc.text(keyLines.slice(0, 2), colX, y + 4);
      } else {
        doc.text(fullKey || nota.numeroNfe, colX, y + 6);
      }
      colX += colsAnnex[1];
      
      // Valor NF-e
      doc.setFont('helvetica', EXEC_FONTS.monoSmall.style);
      doc.setFontSize(EXEC_FONTS.monoSmall.size);
      doc.text(formatCurrencyExec(nota.valorNota).substring(0, 14), colX, y + 6); colX += colsAnnex[2];
      
      // Crédito Total
      doc.text(formatCurrencyExec(nota.valorCredito).substring(0, 14), colX, y + 6); colX += colsAnnex[3];
      
      // Fornecedor
      doc.text((nota.nomeEmitente || '').substring(0, 22), colX, y + 6);
      
      y += 10;
    });
    
    // Summary row
    y += 3;
    doc.setFillColor(EXEC_COLORS.gold.r, EXEC_COLORS.gold.g, EXEC_COLORS.gold.b);
    doc.rect(tableX, y, EXEC_PAGE.contentWidth, 7, 'F');
    doc.setFont('helvetica', EXEC_FONTS.smallBold.style);
    doc.setFontSize(EXEC_FONTS.smallBold.size);
    doc.setTextColor(EXEC_COLORS.white.r, EXEC_COLORS.white.g, EXEC_COLORS.white.b);
    doc.text(`TOTAL: ${allNotas.length} documentos`, tableX + 3, y + 5);
    doc.text(formatCurrencyExec(data.sumario.totalRecuperavel), tableX + colsAnnex[0] + colsAnnex[1] + colsAnnex[2], y + 5);
    
    y += 12;
    
    // Footnote about NF-e Portal
    doc.setFont('helvetica', EXEC_FONTS.small.style);
    doc.setFontSize(EXEC_FONTS.small.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    doc.text('* Consulte o Portal da Nota Fiscal Eletrônica (https://www.nfe.fazenda.gov.br) para validar as chaves de acesso.', EXEC_PAGE.marginLeft, y);
  };

  // ============================================
  // CONTACT SECTION
  // ============================================
  const drawContactSection = () => {
    addPage();
    drawHeader(currentPage);
    
    let y = getExecContentStart() + 40;
    
    // Contact box
    const boxX = EXEC_PAGE.marginLeft + 30;
    const boxWidth = EXEC_PAGE.contentWidth - 60;
    const boxHeight = 80;
    
    doc.setDrawColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.setLineWidth(0.5);
    doc.roundedRect(boxX, y, boxWidth, boxHeight, 3, 3, 'S');
    
    y += 15;
    
    doc.setFont('helvetica', EXEC_FONTS.h2.style);
    doc.setFontSize(EXEC_FONTS.h2.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('CONTATO', EXEC_PAGE.width / 2, y, { align: 'center' });
    
    y += 15;
    
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setFontSize(EXEC_FONTS.body.size);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    
    doc.text('Email: suporte@tributalks.com.br', EXEC_PAGE.width / 2, y, { align: 'center' });
    y += 8;
    doc.text('WhatsApp: +55 11 91452-3971', EXEC_PAGE.width / 2, y, { align: 'center' });
    y += 8;
    doc.text('Site: tributalks.com.br', EXEC_PAGE.width / 2, y, { align: 'center' });
    
    y += 25;
    
    // Generation timestamp
    doc.setFont('helvetica', EXEC_FONTS.small.style);
    doc.setFontSize(EXEC_FONTS.small.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    doc.text(`Relatório gerado em ${formatDateTimeExec(data.dataGeracao)}`, EXEC_PAGE.width / 2, y, { align: 'center' });
    
    y += 30;
    
    // Branding
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.setTextColor(EXEC_COLORS.navyBlue.r, EXEC_COLORS.navyBlue.g, EXEC_COLORS.navyBlue.b);
    doc.text('TribuTalks Inteligência Tributária', EXEC_PAGE.width / 2, y, { align: 'center' });
  };

  // ============================================
  // GENERATE REPORT
  // ============================================
  
  // Draw all sections
  drawCoverPage();
  drawExecutiveSummary();
  drawMethodology();
  drawDetailedAnalysis();
  drawRecommendations();
  drawDisclaimers();
  drawAnnexes();
  drawContactSection();
  
  // Get total pages
  totalPages = doc.getNumberOfPages();
  
  // Add headers and footers to all pages
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawHeader(i);
    drawFooter(i, totalPages);
  }

  // Save
  const fileName = `TribuTalks_Executivo_${data.id}.pdf`;
  doc.save(fileName);
}
