/**
 * Executive Report Generator
 * Professional text-only PDF with full traceability
 * Following TribuTalks Executive Report specifications
 */

import jsPDF from 'jspdf';
import type { RelatorioCreditos, NotaFiscalCredito, TributoCreditoDetalhe, Oportunidade } from './types';
import {
  EXEC_PAGE,
  EXEC_FONTS,
  EXEC_COLORS,
  EXEC_SPACING,
  EXEC_LINES,
  EXEC_CREDIT_BOX,
  getExecContentStart,
  getExecContentEnd,
  needsExecNewPage,
  formatCurrencyExec,
  formatDateExec,
  formatDateTimeExec,
  formatMonthYear,
  formatNfeNumber,
  formatCnpjExec,
  getSpedInfo,
  generateRecommendedAction,
  getRegimeFullName,
  getConfidenceLabel,
  getComplexityLabel,
  getRiskLabel,
} from './ExecutiveReportStyles';

interface ExecutiveReportOptions {
  maxCreditsPerTax?: number;
  includeOpportunities?: boolean;
}

const DEFAULT_OPTIONS: ExecutiveReportOptions = {
  maxCreditsPerTax: 15,
  includeOpportunities: true,
};

export async function generateExecutiveCreditReport(
  data: RelatorioCreditos,
  options: ExecutiveReportOptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let currentPage = 1;
  let totalPages = estimateTotalPages(data, opts);
  let y = EXEC_PAGE.marginTop;

  // Helper functions
  const setColor = (color: { r: number; g: number; b: number }) => {
    doc.setTextColor(color.r, color.g, color.b);
    doc.setDrawColor(color.r, color.g, color.b);
  };

  const setFont = (font: { size: number; style: 'normal' | 'bold' }) => {
    doc.setFontSize(font.size);
    doc.setFont('helvetica', font.style);
  };

  const setMonoFont = (size: number) => {
    doc.setFontSize(size);
    doc.setFont('courier', 'normal');
  };

  const drawSeparator = (yPos: number) => {
    setColor(EXEC_COLORS.border);
    doc.setLineWidth(EXEC_LINES.separator);
    doc.line(EXEC_PAGE.marginLeft, yPos, EXEC_PAGE.width - EXEC_PAGE.marginRight, yPos);
    setColor(EXEC_COLORS.black);
  };

  const drawHeader = () => {
    setFont(EXEC_FONTS.small);
    setColor(EXEC_COLORS.gray);
    doc.text('TribuTalks — Inteligência Tributária', EXEC_PAGE.marginLeft, EXEC_PAGE.marginTop - 5);
    doc.text(`Página ${currentPage} de ${totalPages}`, EXEC_PAGE.width - EXEC_PAGE.marginRight, EXEC_PAGE.marginTop - 5, { align: 'right' });
    
    setFont(EXEC_FONTS.monoSmall);
    doc.text(`Relatório ${data.id} | ${data.empresa.razaoSocial.substring(0, 40)}`, EXEC_PAGE.marginLeft, EXEC_PAGE.marginTop);
    
    drawSeparator(EXEC_PAGE.marginTop + 3);
    setColor(EXEC_COLORS.black);
  };

  const drawFooter = () => {
    const footerY = EXEC_PAGE.height - EXEC_PAGE.marginBottom + 5;
    setFont(EXEC_FONTS.small);
    setColor(EXEC_COLORS.gray);
    doc.text('Este documento tem caráter informativo. Consulte um profissional.', EXEC_PAGE.marginLeft, footerY);
    setColor(EXEC_COLORS.black);
  };

  const addNewPage = () => {
    doc.addPage();
    currentPage++;
    y = getExecContentStart();
    drawHeader();
    drawFooter();
  };

  const checkPageBreak = (requiredSpace: number) => {
    if (needsExecNewPage(y, requiredSpace)) {
      addNewPage();
    }
  };

  // =====================================================
  // PAGE 1: COVER
  // =====================================================
  const drawCoverPage = () => {
    y = EXEC_PAGE.marginTop + 30;
    
    // Decorative line
    drawSeparator(y);
    y += EXEC_SPACING.xxl;
    
    // Main title
    setFont(EXEC_FONTS.h1);
    setColor(EXEC_COLORS.black);
    doc.text('TribuTalks — Inteligência Tributária', EXEC_PAGE.width / 2, y, { align: 'center' });
    y += EXEC_SPACING.xxl;
    
    // Decorative line
    drawSeparator(y);
    y += EXEC_SPACING.xxl + 10;
    
    // Report title
    setFont(EXEC_FONTS.h2);
    doc.text('RELATÓRIO DE CRÉDITOS TRIBUTÁRIOS', EXEC_PAGE.width / 2, y, { align: 'center' });
    y += EXEC_SPACING.lg;
    setFont(EXEC_FONTS.body);
    doc.text('Sumário Executivo', EXEC_PAGE.width / 2, y, { align: 'center' });
    y += EXEC_SPACING.xxl + 10;
    
    // Decorative line
    drawSeparator(y);
    y += EXEC_SPACING.xl;
    
    // Company info
    const labelX = EXEC_PAGE.marginLeft;
    const valueX = EXEC_PAGE.marginLeft + 45;
    
    setFont(EXEC_FONTS.bodyBold);
    doc.text('EMPRESA:', labelX, y);
    setFont(EXEC_FONTS.body);
    doc.text(data.empresa.razaoSocial, valueX, y);
    y += EXEC_SPACING.md;
    
    setFont(EXEC_FONTS.bodyBold);
    doc.text('CNPJ:', labelX, y);
    setFont(EXEC_FONTS.body);
    doc.text(formatCnpjExec(data.empresa.cnpj), valueX, y);
    y += EXEC_SPACING.md;
    
    setFont(EXEC_FONTS.bodyBold);
    doc.text('REGIME:', labelX, y);
    setFont(EXEC_FONTS.body);
    doc.text(getRegimeFullName(data.empresa.regime), valueX, y);
    y += EXEC_SPACING.xxl;
    
    // Decorative line
    drawSeparator(y);
    y += EXEC_SPACING.xl;
    
    // Report metadata
    setFont(EXEC_FONTS.bodyBold);
    doc.text('Relatório nº:', labelX, y);
    setFont(EXEC_FONTS.body);
    doc.text(data.id, valueX, y);
    y += EXEC_SPACING.md;
    
    setFont(EXEC_FONTS.bodyBold);
    doc.text('Data de emissão:', labelX, y);
    setFont(EXEC_FONTS.body);
    doc.text(formatDateExec(data.dataGeracao), valueX, y);
    y += EXEC_SPACING.md;
    
    setFont(EXEC_FONTS.bodyBold);
    doc.text('Período analisado:', labelX, y);
    setFont(EXEC_FONTS.body);
    doc.text(`${formatMonthYear(data.periodoInicio)} a ${formatMonthYear(data.periodoFim)}`, valueX, y);
    y += EXEC_SPACING.md;
    
    setFont(EXEC_FONTS.bodyBold);
    doc.text('Documentos processados:', labelX, y);
    setFont(EXEC_FONTS.body);
    doc.text(`${data.estatisticas.totalXmlsAnalisados.toLocaleString('pt-BR')} XMLs de NF-e`, valueX, y);
    y += EXEC_SPACING.xxl;
    
    // Decorative line
    drawSeparator(y);
    
    // Page number
    setFont(EXEC_FONTS.small);
    setColor(EXEC_COLORS.gray);
    doc.text(`Página 1 de ${totalPages}`, EXEC_PAGE.width - EXEC_PAGE.marginRight, EXEC_PAGE.height - EXEC_PAGE.marginBottom, { align: 'right' });
    setColor(EXEC_COLORS.black);
  };

  // =====================================================
  // PAGE 2: EXECUTIVE SUMMARY
  // =====================================================
  const drawSummaryPage = () => {
    addNewPage();
    
    y = getExecContentStart() + 10;
    
    // Section title
    setFont(EXEC_FONTS.h2);
    setColor(EXEC_COLORS.black);
    doc.text('1. SUMÁRIO EXECUTIVO', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH2 + 5;
    
    // Total recoverable - HIGHLIGHT
    setFont(EXEC_FONTS.bodyBold);
    doc.text('TOTAL DE CRÉDITOS IDENTIFICADOS:', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.md;
    
    setFont({ size: 14, style: 'bold' });
    doc.text(formatCurrencyExec(data.sumario.totalRecuperavel), EXEC_PAGE.marginLeft + 5, y);
    y += EXEC_SPACING.xl + 5;
    
    // Distribution by tax
    setFont(EXEC_FONTS.body);
    doc.text('Distribuição por tributo:', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.lg;
    
    const taxItems = [
      { label: 'PIS/COFINS:', value: data.sumario.pisCofins, total: data.sumario.totalRecuperavel },
      { label: 'ICMS:', value: data.sumario.icms, total: data.sumario.totalRecuperavel },
      { label: 'ICMS-ST:', value: data.sumario.icmsSt, total: data.sumario.totalRecuperavel },
      { label: 'IPI:', value: data.sumario.ipi, total: data.sumario.totalRecuperavel },
    ].filter(item => item.value > 0);
    
    taxItems.forEach(item => {
      const percent = item.total > 0 ? ((item.value / item.total) * 100).toFixed(1) : '0.0';
      setFont(EXEC_FONTS.body);
      doc.text(`    • ${item.label}`, EXEC_PAGE.marginLeft, y);
      setFont(EXEC_FONTS.bodyBold);
      doc.text(`${formatCurrencyExec(item.value)}  (${percent}% do total)`, EXEC_PAGE.marginLeft + 40, y);
      y += EXEC_SPACING.md;
    });
    
    y += EXEC_SPACING.lg;
    
    // Annual savings estimate
    setFont(EXEC_FONTS.body);
    doc.text('Economia potencial anual estimada:', EXEC_PAGE.marginLeft, y);
    setFont(EXEC_FONTS.bodyBold);
    doc.text(
      `${formatCurrencyExec(data.sumario.economiaAnualMin)} a ${formatCurrencyExec(data.sumario.economiaAnualMax)}`,
      EXEC_PAGE.marginLeft + 70,
      y
    );
    y += EXEC_SPACING.xxl;
    
    // Opportunities summary
    if (opts.includeOpportunities && data.oportunidades.length > 0) {
      setFont(EXEC_FONTS.bodyBold);
      doc.text('RESUMO DAS OPORTUNIDADES:', EXEC_PAGE.marginLeft, y);
      y += EXEC_SPACING.lg;
      
      data.oportunidades.slice(0, 3).forEach((opp, index) => {
        setFont(EXEC_FONTS.body);
        doc.text(`    ${index + 1}. ${opp.titulo}`, EXEC_PAGE.marginLeft, y);
        setFont(EXEC_FONTS.bodyBold);
        doc.text(
          `— ${formatCurrencyExec(opp.economiaMin)} a ${formatCurrencyExec(opp.economiaMax)}/ano`,
          EXEC_PAGE.marginLeft + 65,
          y
        );
        y += EXEC_SPACING.sm;
        
        setFont(EXEC_FONTS.small);
        setColor(EXEC_COLORS.gray);
        doc.text(
          `       Complexidade: ${getComplexityLabel(opp.complexidade)} | Risco: ${getRiskLabel(opp.risco)}`,
          EXEC_PAGE.marginLeft,
          y
        );
        setColor(EXEC_COLORS.black);
        y += EXEC_SPACING.md + 2;
      });
    }
  };

  // =====================================================
  // PAGES 3+: CREDIT DETAILS WITH TRACEABILITY
  // =====================================================
  const drawCreditBox = (nota: NotaFiscalCredito, index: number, tributo: string) => {
    const boxHeight = EXEC_CREDIT_BOX.minHeight;
    checkPageBreak(boxHeight + 10);
    
    const boxX = EXEC_PAGE.marginLeft;
    const boxWidth = EXEC_PAGE.contentWidth;
    const padding = EXEC_CREDIT_BOX.padding;
    const lineH = EXEC_CREDIT_BOX.lineHeight;
    
    // Draw box border
    setColor(EXEC_COLORS.border);
    doc.setLineWidth(EXEC_LINES.box);
    doc.rect(boxX, y, boxWidth, boxHeight);
    
    // Credit header
    let innerY = y + padding;
    setFont(EXEC_FONTS.bodyBold);
    setColor(EXEC_COLORS.black);
    doc.text(`CRÉDITO #${index}`, boxX + padding, innerY);
    
    // Separator line
    innerY += lineH - 1;
    doc.setLineWidth(EXEC_LINES.separator);
    doc.line(boxX, innerY, boxX + boxWidth, innerY);
    innerY += padding;
    
    // Credit value and type
    setFont(EXEC_FONTS.body);
    doc.text('Valor do crédito:', boxX + padding, innerY);
    setFont(EXEC_FONTS.bodyBold);
    doc.text(formatCurrencyExec(nota.valorCredito), boxX + padding + 40, innerY);
    innerY += lineH;
    
    setFont(EXEC_FONTS.body);
    doc.text('Tipo:', boxX + padding, innerY);
    doc.text(tributo, boxX + padding + 40, innerY);
    doc.text('Confiança:', boxX + padding + 90, innerY);
    doc.text(getConfidenceLabel(nota.confianca), boxX + padding + 115, innerY);
    innerY += lineH + 2;
    
    // Separator line
    doc.setLineWidth(EXEC_LINES.separator);
    doc.line(boxX, innerY, boxX + boxWidth, innerY);
    innerY += padding;
    
    // Document origin section
    setFont(EXEC_FONTS.smallBold);
    doc.text('ORIGEM DOCUMENTAL:', boxX + padding, innerY);
    innerY += lineH;
    
    setFont(EXEC_FONTS.small);
    doc.text(`NF-e nº: ${formatNfeNumber(nota.numeroNfe)}`, boxX + padding, innerY);
    innerY += lineH - 1;
    
    // Access key in monospace
    setMonoFont(7);
    const chaveFormatada = nota.chaveAcesso || 'Não informada';
    doc.text(`Chave: ${chaveFormatada}`, boxX + padding, innerY);
    innerY += lineH - 1;
    
    setFont(EXEC_FONTS.small);
    doc.text(`Emitente: ${nota.nomeEmitente.substring(0, 50)}`, boxX + padding, innerY);
    innerY += lineH - 1;
    
    doc.text(`CNPJ: ${formatCnpjExec(nota.cnpjEmitente)}`, boxX + padding, innerY);
    doc.text(`Data: ${formatDateExec(nota.dataEmissao)}`, boxX + padding + 65, innerY);
    innerY += lineH - 1;
    
    // Item details on same line
    doc.text(`NCM: ${nota.ncm}`, boxX + padding, innerY);
    doc.text(`CFOP: ${nota.cfop}`, boxX + padding + 35, innerY);
    doc.text(`CST: ${nota.cst}`, boxX + padding + 65, innerY);
    if (nota.aliquota !== undefined) {
      doc.text(`Alíq: ${nota.aliquota.toFixed(2)}%`, boxX + padding + 90, innerY);
    }
    innerY += lineH;
    
    // SPED Reference
    const spedInfo = getSpedInfo(tributo);
    const periodo = formatMonthYear(nota.dataEmissao);
    
    setFont(EXEC_FONTS.smallBold);
    doc.text('REFERÊNCIA SPED:', boxX + padding, innerY);
    innerY += lineH - 1;
    
    setFont(EXEC_FONTS.small);
    doc.text(`${spedInfo.tipo}: Período ${periodo}`, boxX + padding, innerY);
    innerY += lineH - 1;
    doc.text(`Registro: ${spedInfo.registro}`, boxX + padding, innerY);
    
    y += boxHeight + EXEC_SPACING.md;
  };

  const drawCreditDetailsSection = () => {
    addNewPage();
    
    y = getExecContentStart() + 10;
    
    // Section title
    setFont(EXEC_FONTS.h2);
    setColor(EXEC_COLORS.black);
    doc.text('2. DETALHAMENTO DOS CRÉDITOS IDENTIFICADOS', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH2 + 5;
    
    let sectionNumber = 1;
    
    data.creditosPorTributo.forEach((tributoDetalhe) => {
      if (tributoDetalhe.notas.length === 0) return;
      
      checkPageBreak(30);
      
      // Tax section header
      setFont(EXEC_FONTS.h3);
      doc.text(
        `2.${sectionNumber} ${tributoDetalhe.tributo} — Total: ${formatCurrencyExec(tributoDetalhe.valorTotal)}`,
        EXEC_PAGE.marginLeft,
        y
      );
      y += EXEC_SPACING.md;
      
      // Legal basis
      if (tributoDetalhe.baseLegal) {
        setFont(EXEC_FONTS.small);
        setColor(EXEC_COLORS.gray);
        doc.text(`Base legal: ${tributoDetalhe.baseLegal}`, EXEC_PAGE.marginLeft, y);
        setColor(EXEC_COLORS.black);
        y += EXEC_SPACING.lg;
      } else {
        y += EXEC_SPACING.sm;
      }
      
      // Draw credit boxes
      const notasToShow = tributoDetalhe.notas.slice(0, opts.maxCreditsPerTax);
      notasToShow.forEach((nota, idx) => {
        drawCreditBox(nota, idx + 1, tributoDetalhe.tributo);
      });
      
      // If more credits exist
      if (tributoDetalhe.notas.length > opts.maxCreditsPerTax!) {
        setFont(EXEC_FONTS.small);
        setColor(EXEC_COLORS.gray);
        doc.text(
          `... e mais ${tributoDetalhe.notas.length - opts.maxCreditsPerTax!} créditos adicionais de ${tributoDetalhe.tributo}`,
          EXEC_PAGE.marginLeft,
          y
        );
        setColor(EXEC_COLORS.black);
        y += EXEC_SPACING.lg;
      }
      
      y += EXEC_SPACING.lg;
      sectionNumber++;
    });
  };

  // =====================================================
  // FINAL PAGE: NEXT STEPS + LEGAL DISCLAIMER
  // =====================================================
  const drawFinalPage = () => {
    checkPageBreak(120);
    
    if (y > getExecContentStart() + 50) {
      addNewPage();
      y = getExecContentStart() + 10;
    }
    
    // Next steps
    setFont(EXEC_FONTS.h2);
    setColor(EXEC_COLORS.black);
    doc.text('3. PRÓXIMOS PASSOS', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH2 + 5;
    
    setFont(EXEC_FONTS.body);
    doc.text('Para recuperar os créditos identificados neste relatório:', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.lg;
    
    const steps = [
      'Encaminhe este documento ao seu contador ou advogado tributarista para validação dos valores e bases legais.',
      'Localize os documentos originais (XMLs das NF-e) usando as chaves de acesso informadas em cada crédito.',
      'Retifique as obrigações acessórias (EFD Contribuições, EFD ICMS/IPI, DCTF) dos períodos indicados.',
      'Transmita os pedidos de restituição ou compensação via PER/DCOMP Web no e-CAC da Receita Federal.',
      'Acompanhe o processamento e mantenha a documentação suporte arquivada pelo prazo legal (5 anos).',
    ];
    
    steps.forEach((step, idx) => {
      setFont(EXEC_FONTS.body);
      const lines = doc.splitTextToSize(`    ${idx + 1}. ${step}`, EXEC_PAGE.contentWidth - 10);
      lines.forEach((line: string) => {
        doc.text(line, EXEC_PAGE.marginLeft, y);
        y += EXEC_SPACING.sm + 1;
      });
      y += EXEC_SPACING.xs;
    });
    
    y += EXEC_SPACING.xl;
    drawSeparator(y);
    y += EXEC_SPACING.xl;
    
    // Legal disclaimer
    setFont(EXEC_FONTS.h2);
    doc.text('4. AVISO LEGAL', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.afterH2 + 5;
    
    setFont(EXEC_FONTS.body);
    const disclaimer = [
      'Os créditos identificados neste relatório são ESTIMATIVAS baseadas na análise automatizada dos documentos fiscais eletrônicos (XMLs) fornecidos à plataforma TribuTalks.',
      '',
      'A recuperação efetiva dos valores está sujeita a:',
      '    • Validação por profissional contábil ou jurídico habilitado',
      '    • Confirmação das bases legais aplicáveis ao caso concreto',
      '    • Análise de eventuais particularidades da empresa',
      '    • Verificação de prazos decadenciais e prescricionais',
      '',
      'O TribuTalks tem natureza EXCLUSIVAMENTE EDUCATIVA E INFORMATIVA. O conteúdo deste relatório não constitui parecer jurídico, consultoria contábil, nem garantia de resultados.',
    ];
    
    disclaimer.forEach(line => {
      if (line === '') {
        y += EXEC_SPACING.sm;
      } else {
        const wrappedLines = doc.splitTextToSize(line, EXEC_PAGE.contentWidth);
        wrappedLines.forEach((wl: string) => {
          doc.text(wl, EXEC_PAGE.marginLeft, y);
          y += EXEC_SPACING.sm + 1;
        });
      }
    });
    
    y += EXEC_SPACING.xl;
    drawSeparator(y);
    y += EXEC_SPACING.lg;
    
    // Contact info
    setFont(EXEC_FONTS.bodyBold);
    doc.text('CONTATO', EXEC_PAGE.marginLeft, y);
    y += EXEC_SPACING.lg;
    
    setFont(EXEC_FONTS.body);
    doc.text('TribuTalks — Inteligência Tributária', EXEC_PAGE.marginLeft + 5, y);
    y += EXEC_SPACING.md;
    doc.text('E-mail:     suporte@tributalks.com.br', EXEC_PAGE.marginLeft + 5, y);
    y += EXEC_SPACING.sm;
    doc.text('WhatsApp:   +55 11 91452-3971', EXEC_PAGE.marginLeft + 5, y);
    y += EXEC_SPACING.sm;
    doc.text('Site:       tributalks.com.br', EXEC_PAGE.marginLeft + 5, y);
    
    y += EXEC_SPACING.xxl;
    drawSeparator(y);
    y += EXEC_SPACING.md;
    
    // Generation timestamp
    setFont(EXEC_FONTS.small);
    setColor(EXEC_COLORS.gray);
    doc.text(
      `Relatório gerado em ${formatDateTimeExec(new Date())}`,
      EXEC_PAGE.width / 2,
      y,
      { align: 'center' }
    );
    setColor(EXEC_COLORS.black);
  };

  // =====================================================
  // GENERATE REPORT
  // =====================================================
  
  // Page 1: Cover
  drawCoverPage();
  
  // Page 2: Summary
  drawSummaryPage();
  
  // Pages 3+: Credit details
  if (data.creditosPorTributo.length > 0) {
    drawCreditDetailsSection();
  }
  
  // Final page: Next steps + Disclaimer
  drawFinalPage();
  
  // Update total pages
  totalPages = currentPage;
  
  // Save the PDF
  const filename = `TribuTalks_${data.id}_${formatDateExec(new Date()).replace(/\//g, '-')}.pdf`;
  doc.save(filename);
}

// Estimate total pages for pagination
function estimateTotalPages(data: RelatorioCreditos, opts: ExecutiveReportOptions): number {
  let pages = 2; // Cover + Summary
  
  // Credits pages
  const totalCredits = data.creditosPorTributo.reduce((sum, t) => 
    sum + Math.min(t.notas.length, opts.maxCreditsPerTax || 15), 0
  );
  const creditsPerPage = 4; // Approximately 4 credit boxes per page
  pages += Math.ceil(totalCredits / creditsPerPage);
  
  // Final page
  pages += 1;
  
  return Math.max(pages, 4);
}
