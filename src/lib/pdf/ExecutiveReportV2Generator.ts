/**
 * Executive Report V2 Generator
 * Professional PDF with 7 mandatory sections:
 * 1. Capa
 * 2. Sumário Executivo (with bar chart)
 * 3. Metodologia Aplicada
 * 4. Análise Detalhada dos Créditos
 * 5. Recomendações e Próximos Passos
 * 6. Premissas, Limitações e Aviso Legal
 * 7. Anexos de Rastreabilidade
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
  let totalPages = 1; // Will be calculated at the end
  const pageContents: (() => void)[] = [];

  // Helper: add page with tracking
  const addPage = () => {
    doc.addPage();
    currentPage++;
  };

  // Helper: draw header on all pages (except cover)
  const drawHeader = (pageNum: number) => {
    if (pageNum === 1) return; // Skip cover
    
    // Logo
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', EXEC_PAGE.marginLeft, 8, 35, 12);
      } catch {
        // Fallback to text
        doc.setFont('helvetica', EXEC_FONTS.smallBold.style);
        doc.setFontSize(EXEC_FONTS.smallBold.size);
        doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
        doc.text('TribuTalks', EXEC_PAGE.marginLeft, 14);
      }
    }
    
    // Report ID on the right
    doc.setFont('helvetica', EXEC_FONTS.mono.style);
    doc.setFontSize(EXEC_FONTS.mono.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    doc.text(data.id, EXEC_PAGE.width - EXEC_PAGE.marginRight, 14, { align: 'right' });
    
    // Line under header
    doc.setDrawColor(EXEC_COLORS.lightGray.r, EXEC_COLORS.lightGray.g, EXEC_COLORS.lightGray.b);
    doc.setLineWidth(EXEC_LINES.separator);
    doc.line(EXEC_PAGE.marginLeft, 22, EXEC_PAGE.width - EXEC_PAGE.marginRight, 22);
  };

  // Helper: draw footer with pagination
  const drawFooter = (pageNum: number, total: number) => {
    if (pageNum === 1) return; // Skip cover
    
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
        doc.text('TribuTalks', EXEC_PAGE.marginLeft, EXEC_PAGE.marginTop + 10);
      }
    }
    
    // Main title
    let y = 90;
    doc.setFont('helvetica', EXEC_FONTS.h1.style);
    doc.setFontSize(22);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    doc.text('RELATÓRIO DE CRÉDITOS', EXEC_PAGE.width / 2, y, { align: 'center' });
    y += 10;
    doc.text('TRIBUTÁRIOS', EXEC_PAGE.width / 2, y, { align: 'center' });
    
    // Company info box
    y = 130;
    const boxX = EXEC_PAGE.marginLeft + 20;
    const boxWidth = EXEC_PAGE.contentWidth - 40;
    const boxHeight = 55;
    
    doc.setDrawColor(EXEC_COLORS.border.r, EXEC_COLORS.border.g, EXEC_COLORS.border.b);
    doc.setLineWidth(EXEC_LINES.box);
    doc.roundedRect(boxX, y, boxWidth, boxHeight, 3, 3, 'S');
    
    y += 12;
    doc.setFont('helvetica', EXEC_FONTS.bodyBold.style);
    doc.setFontSize(EXEC_FONTS.bodyBold.size);
    doc.text('EMPRESA', boxX + 10, y);
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.text(data.empresa.razaoSocial, boxX + 50, y);
    
    y += 8;
    doc.setFont('helvetica', EXEC_FONTS.bodyBold.style);
    doc.text('CNPJ', boxX + 10, y);
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.text(formatCnpjExec(data.empresa.cnpj), boxX + 50, y);
    
    y += 8;
    doc.setFont('helvetica', EXEC_FONTS.bodyBold.style);
    doc.text('REGIME', boxX + 10, y);
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.text(getRegimeFullName(data.empresa.regime), boxX + 50, y);
    
    y += 16;
    doc.setDrawColor(EXEC_COLORS.lightGray.r, EXEC_COLORS.lightGray.g, EXEC_COLORS.lightGray.b);
    doc.line(boxX + 10, y - 6, boxX + boxWidth - 10, y - 6);
    
    // Report info
    y = 200;
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setFontSize(EXEC_FONTS.body.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    
    doc.text(`Relatório nº: ${data.id}`, EXEC_PAGE.width / 2, y, { align: 'center' });
    y += 7;
    doc.text(`Data de emissão: ${formatDateExec(data.dataGeracao)}`, EXEC_PAGE.width / 2, y, { align: 'center' });
    y += 7;
    doc.text(`Período analisado: ${formatDateExec(data.periodoInicio)} a ${formatDateExec(data.periodoFim)}`, EXEC_PAGE.width / 2, y, { align: 'center' });
    y += 7;
    doc.text(`Documentos processados: ${data.estatisticas.totalXmlsAnalisados} arquivos XML de NF-e`, EXEC_PAGE.width / 2, y, { align: 'center' });
    
    // Footer branding
    doc.setFontSize(EXEC_FONTS.small.size);
    doc.text('TribuTalks Inteligência Tributária', EXEC_PAGE.width / 2, EXEC_PAGE.height - 20, { align: 'center' });
  };

  // ============================================
  // SECTION 2: EXECUTIVE SUMMARY
  // ============================================
  const drawExecutiveSummary = () => {
    addPage();
    drawHeader(currentPage);
    
    let y = getExecContentStart();
    
    // Section title
    doc.setFont('helvetica', EXEC_FONTS.h1.style);
    doc.setFontSize(EXEC_FONTS.h1.size);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    doc.text('2. SUMÁRIO EXECUTIVO', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH1;
    
    // Total highlight box
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(EXEC_PAGE.marginLeft, y, EXEC_PAGE.contentWidth, 25, 2, 2, 'F');
    
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setFontSize(EXEC_FONTS.body.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    doc.text('Total de Créditos Identificados', EXEC_PAGE.marginLeft + 5, y + 8);
    
    doc.setFont('helvetica', EXEC_FONTS.h1.style);
    doc.setFontSize(18);
    doc.setTextColor(239, 162, 25); // Gold
    doc.text(formatCurrencyExec(data.sumario.totalRecuperavel), EXEC_PAGE.marginLeft + 5, y + 20);
    
    y += 35;
    
    // Tax distribution table
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
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
    
    doc.setFillColor(240, 240, 240);
    doc.rect(tableX, y, EXEC_PAGE.contentWidth, 7, 'F');
    
    doc.setFont('helvetica', EXEC_FONTS.smallBold.style);
    doc.setFontSize(EXEC_FONTS.smallBold.size);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    doc.text('Tributo', tableX + 3, y + 5);
    doc.text('Valor Identificado (R$)', tableX + colWidths[0] + 3, y + 5);
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
    
    // Total row
    doc.setFillColor(235, 235, 235);
    doc.rect(tableX, y, EXEC_PAGE.contentWidth, 7, 'F');
    doc.setFont('helvetica', EXEC_FONTS.smallBold.style);
    doc.text('TOTAL', tableX + 3, y + 5);
    doc.text(formatCurrencyExec(total), tableX + colWidths[0] + 3, y + 5);
    doc.text('100%', tableX + colWidths[0] + colWidths[1] + 3, y + 5);
    
    y += 15;
    
    // Bar chart
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
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
      doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
      doc.text('Principais Oportunidades', EXEC_PAGE.marginLeft, y);
      y += EXEC_SPACING.afterH3;
      
      doc.setFont('helvetica', EXEC_FONTS.body.style);
      doc.setFontSize(EXEC_FONTS.body.size);
      
      data.oportunidades.slice(0, 3).forEach((op, index) => {
        doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
        doc.text(`${index + 1}. ${op.titulo}`, EXEC_PAGE.marginLeft + 3, y);
        y += 5;
        doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
        const lines = doc.splitTextToSize(op.descricao, EXEC_PAGE.contentWidth - 10);
        doc.text(lines.slice(0, 2), EXEC_PAGE.marginLeft + 6, y);
        y += lines.slice(0, 2).length * 4 + 3;
      });
    }
  };

  // ============================================
  // SECTION 3: METHODOLOGY
  // ============================================
  const drawMethodology = () => {
    addPage();
    drawHeader(currentPage);
    
    let y = getExecContentStart();
    
    doc.setFont('helvetica', EXEC_FONTS.h1.style);
    doc.setFontSize(EXEC_FONTS.h1.size);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    doc.text('3. METODOLOGIA APLICADA', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH1;
    
    // Data sources
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.text('3.1 Fontes de Dados', EXEC_PAGE.marginLeft, y);
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
    
    // Analysis process
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    doc.text('3.2 Processo de Análise', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH3;
    
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setFontSize(EXEC_FONTS.body.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    
    const steps = [
      '1. Extração e validação dos dados dos arquivos XML e SPED.',
      '2. Cruzamento de informações de NCM, CFOP e CST.',
      '3. Aplicação da legislação tributária vigente para cada operação.',
      '4. Cálculo e consolidação dos valores passíveis de crédito.',
    ];
    
    steps.forEach(step => {
      const lines = doc.splitTextToSize(step, EXEC_PAGE.contentWidth - 10);
      doc.text(lines, EXEC_PAGE.marginLeft + 5, y);
      y += lines.length * 5 + 3;
    });
    
    y += 10;
    
    // Validation criteria
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    doc.text('3.3 Critérios de Validação', EXEC_PAGE.marginLeft, y);
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
  // SECTION 4: DETAILED CREDIT ANALYSIS
  // ============================================
  const drawDetailedAnalysis = () => {
    addPage();
    drawHeader(currentPage);
    
    let y = getExecContentStart();
    
    doc.setFont('helvetica', EXEC_FONTS.h1.style);
    doc.setFontSize(EXEC_FONTS.h1.size);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    doc.text('4. ANÁLISE DETALHADA DOS CRÉDITOS', EXEC_PAGE.marginLeft, y);
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
      doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
      doc.text(`4.${tribIndex + 1} ${tributo.tributo}`, EXEC_PAGE.marginLeft, y);
      y += EXEC_SPACING.afterH2;
      
      // Summary info
      doc.setFont('helvetica', EXEC_FONTS.body.style);
      doc.setFontSize(EXEC_FONTS.body.size);
      doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
      doc.text(`Total: ${formatCurrencyExec(tributo.valorTotal)} | Notas: ${tributo.notas.length}`, EXEC_PAGE.marginLeft + 3, y);
      y += 5;
      if (tributo.baseLegal) {
        doc.text(`Fundamentação: ${tributo.baseLegal}`, EXEC_PAGE.marginLeft + 3, y);
        y += 8;
      } else {
        y += 3;
      }
      
      // Detail table
      const tableX = EXEC_PAGE.marginLeft;
      const cols = [25, 35, 18, 25, 35, EXEC_PAGE.contentWidth - 138]; // Período, Base, Alíq, Valor, Fund, Docs
      
      // Header
      doc.setFillColor(240, 240, 240);
      doc.rect(tableX, y, EXEC_PAGE.contentWidth, 6, 'F');
      
      doc.setFont('helvetica', EXEC_FONTS.monoSmall.style);
      doc.setFontSize(EXEC_FONTS.monoSmall.size);
      doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
      
      let colX = tableX + 2;
      doc.text('Período', colX, y + 4); colX += cols[0];
      doc.text('Base Cálc.', colX, y + 4); colX += cols[1];
      doc.text('Alíq.', colX, y + 4); colX += cols[2];
      doc.text('Crédito', colX, y + 4); colX += cols[3];
      doc.text('Fund. Legal', colX, y + 4); colX += cols[4];
      doc.text('Documento', colX, y + 4);
      
      y += 6;
      
      // Table rows (limited)
      const notasToShow = tributo.notas.slice(0, maxCreditsPerTax);
      
      doc.setFont('helvetica', EXEC_FONTS.monoSmall.style);
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
        doc.text((nota.baseLegal || tributo.baseLegal || '').substring(0, 18), colX, y + 3.5); colX += cols[4];
        
        // Truncated NFe key
        const truncatedKey = nota.chaveAcesso.length > 20 
          ? `${nota.chaveAcesso.substring(0, 10)}...${nota.chaveAcesso.slice(-6)}`
          : nota.chaveAcesso || nota.numeroNfe;
        doc.text(truncatedKey, colX, y + 3.5);
        
        y += 5;
      });
      
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
  // SECTION 5: RECOMMENDATIONS
  // ============================================
  const drawRecommendations = () => {
    addPage();
    drawHeader(currentPage);
    
    let y = getExecContentStart();
    
    doc.setFont('helvetica', EXEC_FONTS.h1.style);
    doc.setFontSize(EXEC_FONTS.h1.size);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    doc.text('5. RECOMENDAÇÕES E PRÓXIMOS PASSOS', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH1;
    
    const recommendations = [
      {
        step: '1. Validação Contábil',
        text: 'Encaminhe este documento ao seu contador ou advogado tributarista para validação dos valores e bases legais.',
      },
      {
        step: '2. Localização dos Documentos',
        text: 'Localize os documentos originais (XMLs das NF-e) usando as chaves de acesso informadas nos Anexos de Rastreabilidade para cada crédito.',
      },
      {
        step: '3. Retificação de Obrigações',
        text: 'Retifique as obrigações acessórias (EFD Contribuições, EFD ICMS/IPI, DCTF) dos períodos indicados.',
      },
      {
        step: '4. Pedido de Restituição',
        text: 'Transmita os pedidos de restituição ou compensação via PER/DCOMP Web no e-CAC da Receita Federal.',
      },
    ];
    
    recommendations.forEach(rec => {
      doc.setFont('helvetica', EXEC_FONTS.h3.style);
      doc.setFontSize(EXEC_FONTS.h3.size);
      doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
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
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
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
  // SECTION 6: DISCLAIMERS
  // ============================================
  const drawDisclaimers = () => {
    addPage();
    drawHeader(currentPage);
    
    let y = getExecContentStart();
    
    doc.setFont('helvetica', EXEC_FONTS.h1.style);
    doc.setFontSize(EXEC_FONTS.h1.size);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    doc.text('6. PREMISSAS, LIMITAÇÕES E AVISO LEGAL', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH1;
    
    // Informative nature
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.text('6.1 Caráter Informativo', EXEC_PAGE.marginLeft, y);
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
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    doc.text('6.2 Condições para Recuperação', EXEC_PAGE.marginLeft, y);
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
      '• Verificação de prazos decadenciais e prescricionais.',
    ];
    
    conditions.forEach(cond => {
      doc.text(cond, EXEC_PAGE.marginLeft + 6, y);
      y += 6;
    });
    
    y += 10;
    
    // Responsibilities
    doc.setFont('helvetica', EXEC_FONTS.h3.style);
    doc.setFontSize(EXEC_FONTS.h3.size);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    doc.text('6.3 Responsabilidades', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH3;
    
    doc.setFont('helvetica', EXEC_FONTS.body.style);
    doc.setFontSize(EXEC_FONTS.body.size);
    doc.setTextColor(EXEC_COLORS.gray.r, EXEC_COLORS.gray.g, EXEC_COLORS.gray.b);
    
    const disclaimer2 = 'A TribuTalks não se responsabiliza por decisões tomadas com base exclusivamente nas informações deste relatório sem a devida assessoria de profissional habilitado. Os valores apresentados são indicativos e podem sofrer alterações após análise detalhada da documentação fiscal.';
    const lines2 = doc.splitTextToSize(disclaimer2, EXEC_PAGE.contentWidth - 5);
    doc.text(lines2, EXEC_PAGE.marginLeft + 3, y);
  };

  // ============================================
  // SECTION 7: ANNEXES
  // ============================================
  const drawAnnexes = () => {
    // ANNEX A - NF-e Keys
    addPage();
    drawHeader(currentPage);
    
    let y = getExecContentStart();
    
    doc.setFont('helvetica', EXEC_FONTS.h1.style);
    doc.setFontSize(EXEC_FONTS.h1.size);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    doc.text('7. ANEXOS DE RASTREABILIDADE', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH1;
    
    doc.setFont('helvetica', EXEC_FONTS.h2.style);
    doc.setFontSize(EXEC_FONTS.h2.size);
    doc.text('Anexo A - Detalhamento de NF-e', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH2;
    
    // Collect all notes
    const allNotas: (NotaFiscalCredito & { tributo: string })[] = [];
    data.creditosPorTributo.forEach(trib => {
      trib.notas.forEach(nota => {
        allNotas.push({ ...nota, tributo: trib.tributo });
      });
    });
    
    // Sort by value descending
    allNotas.sort((a, b) => b.valorCredito - a.valorCredito);
    
    // Table header
    const tableX = EXEC_PAGE.marginLeft;
    const colsAnnex = [85, 25, 30, EXEC_PAGE.contentWidth - 140];
    
    doc.setFillColor(240, 240, 240);
    doc.rect(tableX, y, EXEC_PAGE.contentWidth, 6, 'F');
    
    doc.setFont('helvetica', EXEC_FONTS.monoSmall.style);
    doc.setFontSize(EXEC_FONTS.monoSmall.size);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    
    let colX = tableX + 2;
    doc.text('Chave de Acesso (44 dígitos)', colX, y + 4); colX += colsAnnex[0];
    doc.text('Tributo', colX, y + 4); colX += colsAnnex[1];
    doc.text('Valor Crédito', colX, y + 4); colX += colsAnnex[2];
    doc.text('Fornecedor', colX, y + 4);
    
    y += 6;
    
    // All notes
    allNotas.forEach((nota, index) => {
      if (needsExecNewPage(y, 10)) {
        addPage();
        drawHeader(currentPage);
        y = getExecContentStart();
        
        // Re-draw header
        doc.setFillColor(240, 240, 240);
        doc.rect(tableX, y, EXEC_PAGE.contentWidth, 6, 'F');
        doc.setFont('helvetica', EXEC_FONTS.monoSmall.style);
        doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
        
        colX = tableX + 2;
        doc.text('Chave de Acesso (44 dígitos)', colX, y + 4); colX += colsAnnex[0];
        doc.text('Tributo', colX, y + 4); colX += colsAnnex[1];
        doc.text('Valor Crédito', colX, y + 4); colX += colsAnnex[2];
        doc.text('Fornecedor', colX, y + 4);
        y += 6;
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(tableX, y, EXEC_PAGE.contentWidth, 8, 'F');
      }
      
      doc.setFont('helvetica', EXEC_FONTS.monoSmall.style);
      doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
      
      // Format 44-digit key with spaces
      const formattedKey = nota.chaveAcesso.replace(/(\d{4})/g, '$1 ').trim();
      
      colX = tableX + 2;
      
      // Key may need two lines
      if (nota.chaveAcesso.length > 30) {
        doc.setFontSize(6);
        const keyLines = doc.splitTextToSize(formattedKey, colsAnnex[0] - 4);
        doc.text(keyLines.slice(0, 2), colX, y + 3);
      } else {
        doc.text(nota.chaveAcesso || nota.numeroNfe, colX, y + 5);
      }
      
      doc.setFontSize(EXEC_FONTS.monoSmall.size);
      colX += colsAnnex[0];
      doc.text(nota.tributo, colX, y + 5); colX += colsAnnex[1];
      doc.text(formatCurrencyExec(nota.valorCredito).substring(0, 14), colX, y + 5); colX += colsAnnex[2];
      doc.text((nota.nomeEmitente || '').substring(0, 25), colX, y + 5);
      
      y += 8;
    });
    
    // Summary
    y += 5;
    doc.setFont('helvetica', EXEC_FONTS.smallBold.style);
    doc.setFontSize(EXEC_FONTS.smallBold.size);
    doc.setTextColor(EXEC_COLORS.black.r, EXEC_COLORS.black.g, EXEC_COLORS.black.b);
    doc.text(`Total: ${allNotas.length} documentos | ${formatCurrencyExec(data.sumario.totalRecuperavel)}`, tableX + 3, y);
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
