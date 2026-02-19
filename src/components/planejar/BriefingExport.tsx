import jsPDF from 'jspdf';
import { TRIBUTALKS_PDF_COLORS } from '@/lib/pdf/TribuTalksPdfColors';
import { PAGE, FONT_SIZES, SPACING, formatCurrency, formatDate } from '@/lib/pdf/TribuTalksPdfStyles';
import type { OpportunityData } from './OpportunityCard';

interface CompanyInfo {
  razao_social?: string;
  cnpj_principal?: string;
  regime_tributario?: string;
  setor?: string;
  faturamento_anual?: number;
  uf_sede?: string;
  municipio_sede?: string;
  [key: string]: unknown;
}

function getRegimeLabel(regime?: string) {
  const map: Record<string, string> = { simples: 'Simples Nacional', presumido: 'Lucro Presumido', lucro_real: 'Lucro Real' };
  return map[regime || ''] || regime || '—';
}

export function generateBriefingText(opp: OpportunityData, company?: CompanyInfo): string {
  const now = new Date();
  const razao = (company?.razao_social as string) || 'Sua Empresa';
  const cnpj = (company?.cnpj_principal as string) || '—';
  const regime = getRegimeLabel(company?.regime_tributario as string);

  const lines = [
    `BRIEFING TRIBUTÁRIO — ${opp.name}`,
    `Preparado por TribuTalks em ${formatDate(now)}`,
    `Empresa: ${razao} | CNPJ: ${cnpj} | Regime: ${regime}`,
    '',
    '═══ HIPÓTESE IDENTIFICADA ═══',
    opp.description || 'Descrição em breve.',
    '',
    '═══ POR QUE ESTA EMPRESA PODE SE QUALIFICAR ═══',
  ];

  if (opp.match_reasons && opp.match_reasons.length > 0) {
    opp.match_reasons.forEach(r => lines.push(`• ${r}`));
  } else {
    lines.push(`Empresa do ${regime} pode se beneficiar desta oportunidade.`);
  }

  const hasPct = opp.economia_percentual_min != null && opp.economia_percentual_max != null &&
    (opp.economia_percentual_min > 0 || opp.economia_percentual_max > 0);

  lines.push(
    '',
    '═══ IMPACTO ESTIMADO ═══',
    hasPct
      ? `${opp.economia_percentual_min}%–${opp.economia_percentual_max}% de economia estimada por ano`
      : `Impacto: ${opp.impact_label === 'alto' ? 'Alto' : opp.impact_label === 'baixo' ? 'Baixo' : 'Médio'} (estimativa baseada no perfil)`,
    '',
    '═══ FUNDAMENTAÇÃO LEGAL ═══',
    opp.base_legal || 'Fundamentação a ser complementada.',
  );

  if (opp.futuro_reforma || opp.status_lc_224_2025) {
    lines.push(
      '',
      '⚡ ATENÇÃO — JANELA DA REFORMA TRIBUTÁRIA',
      opp.descricao_reforma || opp.descricao_lc_224_2025 || 'A Reforma Tributária pode impactar esta oportunidade.',
    );
  }

  lines.push(
    '',
    '═══ PRÓXIMOS PASSOS SUGERIDOS ═══',
    `1. ${opp.requer_contador ? 'Consultar contador para avaliação detalhada' : 'Avaliar documentação necessária'}`,
    `2. ${opp.requer_advogado ? 'Consultar advogado tributarista para parecer' : 'Revisar obrigações acessórias'}`,
    '3. Implementar com acompanhamento profissional',
    '',
    '---',
    'Este documento descreve uma hipótese identificada por análise automatizada.',
    'A confirmação e execução dependem de validação por profissional habilitado.',
    'TribuTalks — Inteligência Tributária | tributalks.com.br',
  );

  return lines.join('\n');
}

export function generateBriefingPdf(opp: OpportunityData, company?: CompanyInfo): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const C = TRIBUTALKS_PDF_COLORS;

  // Background
  doc.setFillColor(...C.bgPrimary);
  doc.rect(0, 0, PAGE.width, PAGE.height, 'F');

  // Gold accent bar
  doc.setFillColor(...C.gold);
  doc.rect(0, 0, PAGE.width, 6, 'F');

  let y = 25;

  // Header
  doc.setTextColor(...C.gold);
  doc.setFontSize(FONT_SIZES.heading1);
  doc.setFont('helvetica', 'bold');
  doc.text('BRIEFING TRIBUTÁRIO', PAGE.marginLeft, y);

  y += 8;
  doc.setTextColor(...C.textSecondary);
  doc.setFontSize(FONT_SIZES.small);
  doc.setFont('helvetica', 'normal');
  doc.text(`Preparado por TribuTalks em ${formatDate(new Date())}`, PAGE.marginLeft, y);

  // Company info card
  y += 10;
  doc.setFillColor(...C.bgGoldCard);
  doc.roundedRect(PAGE.marginLeft, y, PAGE.contentWidth, 20, 2, 2, 'F');
  doc.setDrawColor(...C.borderGold);
  doc.setLineWidth(0.3);
  doc.roundedRect(PAGE.marginLeft, y, PAGE.contentWidth, 20, 2, 2, 'S');

  y += 8;
  doc.setTextColor(...C.textPrimary);
  doc.setFontSize(FONT_SIZES.body);
  doc.setFont('helvetica', 'bold');
  doc.text((company?.razao_social as string) || 'Sua Empresa', PAGE.marginLeft + 5, y);
  y += 6;
  doc.setTextColor(...C.goldText);
  doc.setFontSize(FONT_SIZES.small);
  doc.setFont('helvetica', 'normal');
  doc.text(`CNPJ: ${(company?.cnpj_principal as string) || '—'} | Regime: ${getRegimeLabel(company?.regime_tributario as string)}`, PAGE.marginLeft + 5, y);

  // Opportunity title
  y += 15;
  doc.setFillColor(...C.bgCard);
  doc.roundedRect(PAGE.marginLeft, y, PAGE.contentWidth, 30, 2, 2, 'F');
  y += 10;
  doc.setTextColor(...C.textPrimary);
  doc.setFontSize(FONT_SIZES.heading2);
  doc.setFont('helvetica', 'bold');
  doc.text(opp.name, PAGE.marginLeft + 5, y);
  y += 8;

  const hasPct = opp.economia_percentual_min != null && opp.economia_percentual_max != null &&
    (opp.economia_percentual_min > 0 || opp.economia_percentual_max > 0);
  doc.setTextColor(...C.success);
  doc.setFontSize(FONT_SIZES.heading1);
  if (hasPct) {
    doc.text(`${opp.economia_percentual_min}%–${opp.economia_percentual_max}% de economia /ano`, PAGE.marginLeft + 5, y);
  } else {
    const label = opp.impact_label === 'alto' ? 'Alto' : opp.impact_label === 'baixo' ? 'Baixo' : 'Médio';
    doc.text(`Impacto: ${label} (estimativa)`, PAGE.marginLeft + 5, y);
  }

  // Description
  y += 18;
  doc.setTextColor(...C.gold);
  doc.setFontSize(FONT_SIZES.heading3);
  doc.setFont('helvetica', 'bold');
  doc.text('HIPÓTESE IDENTIFICADA', PAGE.marginLeft, y);
  y += 7;
  doc.setTextColor(...C.textSecondary);
  doc.setFontSize(FONT_SIZES.body);
  doc.setFont('helvetica', 'normal');
  const descLines = doc.splitTextToSize(opp.description || 'Descrição em breve.', PAGE.contentWidth);
  doc.text(descLines, PAGE.marginLeft, y);
  y += descLines.length * 5 + SPACING.md;

  // Match reasons
  doc.setTextColor(...C.gold);
  doc.setFontSize(FONT_SIZES.heading3);
  doc.setFont('helvetica', 'bold');
  doc.text('POR QUE ESTA EMPRESA PODE SE QUALIFICAR', PAGE.marginLeft, y);
  y += 7;
  doc.setTextColor(...C.textSecondary);
  doc.setFontSize(FONT_SIZES.body);
  doc.setFont('helvetica', 'normal');

  if (opp.match_reasons && opp.match_reasons.length > 0) {
    opp.match_reasons.forEach(reason => {
      const rLines = doc.splitTextToSize(`• ${reason}`, PAGE.contentWidth - 5);
      doc.text(rLines, PAGE.marginLeft + 3, y);
      y += rLines.length * 5;
    });
  } else {
    doc.text(`Empresa do ${getRegimeLabel(company?.regime_tributario as string)} pode se beneficiar.`, PAGE.marginLeft, y);
    y += 5;
  }

  y += SPACING.md;

  // Legal basis
  doc.setTextColor(...C.gold);
  doc.setFontSize(FONT_SIZES.heading3);
  doc.setFont('helvetica', 'bold');
  doc.text('FUNDAMENTAÇÃO LEGAL', PAGE.marginLeft, y);
  y += 7;
  doc.setTextColor(...C.textSecondary);
  doc.setFontSize(FONT_SIZES.body);
  doc.setFont('helvetica', 'normal');
  const legalLines = doc.splitTextToSize(opp.base_legal || 'Fundamentação a ser complementada.', PAGE.contentWidth);
  doc.text(legalLines, PAGE.marginLeft, y);
  y += legalLines.length * 5 + SPACING.md;

  // Reforma warning
  if (opp.futuro_reforma || opp.status_lc_224_2025) {
    if (y > 240) { doc.addPage(); y = 25; doc.setFillColor(...C.bgPrimary); doc.rect(0, 0, PAGE.width, PAGE.height, 'F'); }
    doc.setFillColor(45, 20, 50);
    doc.roundedRect(PAGE.marginLeft, y, PAGE.contentWidth, 20, 2, 2, 'F');
    y += 8;
    doc.setTextColor(168, 85, 247);
    doc.setFontSize(FONT_SIZES.body);
    doc.setFont('helvetica', 'bold');
    doc.text('⚡ ATENÇÃO — JANELA DA REFORMA TRIBUTÁRIA', PAGE.marginLeft + 5, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_SIZES.small);
    const reformaText = opp.descricao_reforma || opp.descricao_lc_224_2025 || 'A Reforma pode impactar esta oportunidade.';
    const rLines = doc.splitTextToSize(reformaText, PAGE.contentWidth - 10);
    doc.text(rLines, PAGE.marginLeft + 5, y);
    y += rLines.length * 4 + SPACING.lg;
  }

  // Footer
  const footerY = PAGE.height - 15;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(PAGE.marginLeft, footerY, PAGE.width - PAGE.marginRight, footerY);
  doc.setTextColor(...C.textMuted);
  doc.setFontSize(FONT_SIZES.micro);
  doc.text('Este documento descreve uma hipótese identificada por análise automatizada. A confirmação e execução dependem de validação por profissional habilitado.', PAGE.width / 2, footerY + 5, { align: 'center', maxWidth: PAGE.contentWidth });
  doc.text('TribuTalks — Inteligência Tributária | tributalks.com.br', PAGE.width / 2, footerY + 9, { align: 'center' });

  doc.save(`briefing-${opp.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}
