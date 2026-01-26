import type jsPDF from 'jspdf';

// ==========================================
// TRIBUTECH PROFESSIONAL PDF REPORT TEMPLATE
// ==========================================
// Reutilizável para todos os relatórios da plataforma

// Cores do Design System
export const PDF_COLORS = {
  // Primária - Azul corporativo
  primary: { r: 30, g: 64, b: 175 },       // #1E40AF
  primaryLight: { r: 59, g: 130, b: 246 }, // #3B82F6
  
  // Textos
  textDark: { r: 55, g: 65, b: 81 },       // #374151
  textMuted: { r: 107, g: 114, b: 128 },   // #6B7280
  textLight: { r: 156, g: 163, b: 175 },   // #9CA3AF
  
  // Status
  success: { r: 16, g: 185, b: 129 },      // #10B981
  warning: { r: 245, g: 158, b: 11 },      // #F59E0B
  danger: { r: 239, g: 68, b: 68 },        // #EF4444
  info: { r: 59, g: 130, b: 246 },         // #3B82F6
  
  // Backgrounds
  bgWhite: { r: 255, g: 255, b: 255 },
  bgLight: { r: 249, g: 250, b: 251 },     // #F9FAFB
  bgMuted: { r: 243, g: 244, b: 246 },     // #F3F4F6
  
  // Borders
  border: { r: 229, g: 231, b: 235 },      // #E5E7EB
};

// Configurações de layout
export const PDF_LAYOUT = {
  pageWidth: 210, // A4
  pageHeight: 297,
  margin: 20,
  contentWidth: 170, // 210 - 40
  headerHeight: 50,
  footerHeight: 20,
};

// Tipografia
export const PDF_FONTS = {
  title: { size: 24, weight: 'bold' as const },
  h1: { size: 18, weight: 'bold' as const },
  h2: { size: 14, weight: 'bold' as const },
  h3: { size: 12, weight: 'bold' as const },
  body: { size: 11, weight: 'normal' as const },
  small: { size: 9, weight: 'normal' as const },
  tiny: { size: 8, weight: 'normal' as const },
};

// Interface para dados da empresa
export interface CompanyData {
  razaoSocial: string;
  cnpj?: string;
  inscricaoEstadual?: string;
  atividadePrincipal?: string;
  regimeTributario?: string;
  faturamentoAnual?: number;
  numFuncionarios?: number;
}

// Interface para dados do score
export interface ScoreData {
  total: number;
  grade: string;
  status: string;
  dimensions: {
    conformidade: number;
    eficiencia: number;
    risco: number;
    documentacao: number;
    gestao: number;
  };
  financialImpact: {
    economiaPotencial: number;
    riscoAutuacao: number;
    creditosNaoAproveitados: number;
  };
}

// Interface para ações
export interface ActionItem {
  title: string;
  description: string;
  pointsGain?: number;
  economia?: number;
  priority?: number;
}

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCNPJ(cnpj: string): string {
  if (!cnpj) return '-';
  const cleaned = cnpj.replace(/\D/g, '');
  return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateFull(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ==========================================
// COMPONENTES DO TEMPLATE
// ==========================================

/**
 * Adiciona o cabeçalho padrão em todas as páginas
 */
export function addHeader(doc: jsPDF, pageNumber: number = 1): void {
  const { margin, pageWidth } = PDF_LAYOUT;
  
  // Logo / Nome da empresa parceira
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PDF_COLORS.primary.r, PDF_COLORS.primary.g, PDF_COLORS.primary.b);
  doc.text('Rebechi & Silva Advogados Associados', margin, 15);
  
  // Linha separadora
  doc.setDrawColor(PDF_COLORS.border.r, PDF_COLORS.border.g, PDF_COLORS.border.b);
  doc.setLineWidth(0.5);
  doc.line(margin, 22, pageWidth - margin, 22);
  
  // Número da página (exceto na capa)
  if (pageNumber > 1) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(PDF_COLORS.textMuted.r, PDF_COLORS.textMuted.g, PDF_COLORS.textMuted.b);
    doc.text(`Página ${pageNumber}`, pageWidth - margin, 15, { align: 'right' });
  }
}

/**
 * Adiciona o rodapé padrão em todas as páginas
 */
export function addFooter(doc: jsPDF, date: Date): void {
  const { margin, pageWidth, pageHeight } = PDF_LAYOUT;
  const yPos = pageHeight - 12;
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(PDF_COLORS.textLight.r, PDF_COLORS.textLight.g, PDF_COLORS.textLight.b);
  
  // Texto à esquerda
  doc.text(`Gerado por Tributech em ${formatDate(date)}`, margin, yPos);
  
  // Texto à direita
  doc.text('Este relatório é informativo e não substitui consultoria profissional.', pageWidth - margin, yPos, { align: 'right' });
}

/**
 * Desenha a capa do relatório
 */
export function drawCoverPage(
  doc: jsPDF,
  title: string,
  subtitle: string,
  company: CompanyData,
  date: Date
): void {
  const { margin, pageWidth, pageHeight } = PDF_LAYOUT;
  
  // Header band
  doc.setFillColor(PDF_COLORS.primary.r, PDF_COLORS.primary.g, PDF_COLORS.primary.b);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  // Logo text (substituir por imagem real se disponível)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Rebechi & Silva Advogados Associados', margin + 5, 25);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Consultoria Tributária Especializada', margin + 5, 35);
  
  // Título principal
  let yPos = 90;
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PDF_COLORS.textDark.r, PDF_COLORS.textDark.g, PDF_COLORS.textDark.b);
  doc.text(title, margin, yPos);
  
  // Subtítulo
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(PDF_COLORS.textMuted.r, PDF_COLORS.textMuted.g, PDF_COLORS.textMuted.b);
  doc.text(subtitle, margin, yPos);
  
  // Linha decorativa
  yPos += 15;
  doc.setFillColor(PDF_COLORS.warning.r, PDF_COLORS.warning.g, PDF_COLORS.warning.b);
  doc.rect(margin, yPos, 60, 3, 'F');
  
  // Dados da empresa
  yPos += 30;
  doc.setFillColor(PDF_COLORS.bgLight.r, PDF_COLORS.bgLight.g, PDF_COLORS.bgLight.b);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 80, 5, 5, 'F');
  
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PDF_COLORS.textDark.r, PDF_COLORS.textDark.g, PDF_COLORS.textDark.b);
  doc.text('Identificação da Empresa', margin + 10, yPos);
  
  yPos += 12;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const fields = [
    { label: 'Razão Social:', value: company.razaoSocial },
    { label: 'CNPJ:', value: company.cnpj ? formatCNPJ(company.cnpj) : '-' },
    { label: 'Regime Tributário:', value: company.regimeTributario || '-' },
    { label: 'Faturamento Anual:', value: company.faturamentoAnual ? formatCurrency(company.faturamentoAnual) : '-' },
  ];
  
  fields.forEach((field) => {
    doc.setTextColor(PDF_COLORS.textMuted.r, PDF_COLORS.textMuted.g, PDF_COLORS.textMuted.b);
    doc.text(field.label, margin + 10, yPos);
    doc.setTextColor(PDF_COLORS.textDark.r, PDF_COLORS.textDark.g, PDF_COLORS.textDark.b);
    doc.text(field.value, margin + 60, yPos);
    yPos += 10;
  });
  
  // Data da análise
  yPos = pageHeight - 50;
  doc.setFontSize(10);
  doc.setTextColor(PDF_COLORS.textMuted.r, PDF_COLORS.textMuted.g, PDF_COLORS.textMuted.b);
  doc.text(`Data da Análise: ${formatDateFull(date)}`, margin, yPos);
  
  // Rodapé da capa
  addFooter(doc, date);
}

/**
 * Desenha o display principal do Score
 */
export function drawScoreDisplay(doc: jsPDF, score: ScoreData, yStart: number): number {
  const { margin, pageWidth } = PDF_LAYOUT;
  let yPos = yStart;
  
  // Box do score
  const boxWidth = pageWidth - 2 * margin;
  const boxHeight = 100;
  
  doc.setFillColor(PDF_COLORS.bgLight.r, PDF_COLORS.bgLight.g, PDF_COLORS.bgLight.b);
  doc.roundedRect(margin, yPos, boxWidth, boxHeight, 5, 5, 'F');
  
  // Borda com cor baseada no status
  const statusColor = getScoreColor(score.total);
  doc.setDrawColor(statusColor.r, statusColor.g, statusColor.b);
  doc.setLineWidth(2);
  doc.roundedRect(margin, yPos, boxWidth, boxHeight, 5, 5, 'S');
  
  // Título
  yPos += 18;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PDF_COLORS.textDark.r, PDF_COLORS.textDark.g, PDF_COLORS.textDark.b);
  doc.text('SCORE TRIBUTÁRIO', pageWidth / 2, yPos, { align: 'center' });
  
  // Score número
  yPos += 25;
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
  doc.text(`${score.total}`, pageWidth / 2 - 15, yPos, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(PDF_COLORS.textMuted.r, PDF_COLORS.textMuted.g, PDF_COLORS.textMuted.b);
  doc.text('/1000', pageWidth / 2 + 25, yPos, { align: 'center' });
  
  // Nota/Grade
  yPos += 15;
  doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
  const gradeWidth = 40;
  doc.roundedRect(pageWidth / 2 - gradeWidth / 2, yPos - 8, gradeWidth, 14, 3, 3, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(score.grade, pageWidth / 2, yPos + 2, { align: 'center' });
  
  // Status text
  yPos += 18;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
  doc.text(getStatusLabel(score.status), pageWidth / 2, yPos, { align: 'center' });
  
  // Barra de progresso visual
  yPos += 12;
  const barWidth = boxWidth - 40;
  const barHeight = 8;
  const barX = margin + 20;
  
  // Background
  doc.setFillColor(PDF_COLORS.bgMuted.r, PDF_COLORS.bgMuted.g, PDF_COLORS.bgMuted.b);
  doc.roundedRect(barX, yPos, barWidth, barHeight, 2, 2, 'F');
  
  // Progress
  const progressWidth = (score.total / 1000) * barWidth;
  doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
  doc.roundedRect(barX, yPos, progressWidth, barHeight, 2, 2, 'F');
  
  return yStart + boxHeight + 15;
}

/**
 * Desenha seção de interpretação do score
 */
export function drawScoreInterpretation(doc: jsPDF, score: number, yStart: number): number {
  const { margin, pageWidth } = PDF_LAYOUT;
  let yPos = yStart;
  
  // Título da seção
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PDF_COLORS.textDark.r, PDF_COLORS.textDark.g, PDF_COLORS.textDark.b);
  doc.text('O que significa essa nota?', margin, yPos);
  
  yPos += 10;
  
  // Box de interpretação
  const interpretation = getScoreInterpretation(score);
  const boxColor = getScoreColor(score);
  
  doc.setFillColor(boxColor.r, boxColor.g, boxColor.b);
  doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 90, 5, 5, 'F');
  doc.setGState(new (doc as any).GState({ opacity: 1 }));
  
  doc.setDrawColor(boxColor.r, boxColor.g, boxColor.b);
  doc.setLineWidth(1);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 90, 5, 5, 'S');
  
  yPos += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(boxColor.r, boxColor.g, boxColor.b);
  doc.text(interpretation.title, margin + 10, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(PDF_COLORS.textDark.r, PDF_COLORS.textDark.g, PDF_COLORS.textDark.b);
  
  // Pontos da interpretação
  interpretation.points.forEach((point) => {
    if (yPos < yStart + 85) {
      doc.text(`${point.icon} ${point.text}`, margin + 10, yPos);
      yPos += 8;
    }
  });
  
  return yStart + 100;
}

/**
 * Desenha as barras horizontais das dimensões
 */
export function drawDimensionBars(doc: jsPDF, dimensions: ScoreData['dimensions'], yStart: number): number {
  const { margin, pageWidth } = PDF_LAYOUT;
  let yPos = yStart;
  
  // Título
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PDF_COLORS.textDark.r, PDF_COLORS.textDark.g, PDF_COLORS.textDark.b);
  doc.text('Pontuação por Dimensão', margin, yPos);
  
  yPos += 15;
  
  const barHeight = 12;
  const barWidth = 100;
  const labelWidth = 50;
  
  const dimensionList = [
    { label: 'Conformidade', value: dimensions.conformidade, max: 200, color: PDF_COLORS.info },
    { label: 'Eficiência', value: dimensions.eficiencia, max: 200, color: PDF_COLORS.success },
    { label: 'Risco', value: dimensions.risco, max: 200, color: PDF_COLORS.danger },
    { label: 'Documentação', value: dimensions.documentacao, max: 200, color: { r: 147, g: 51, b: 234 } }, // Purple
    { label: 'Gestão', value: dimensions.gestao, max: 200, color: PDF_COLORS.warning },
  ];
  
  dimensionList.forEach((dim) => {
    // Label
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(PDF_COLORS.textDark.r, PDF_COLORS.textDark.g, PDF_COLORS.textDark.b);
    doc.text(dim.label, margin, yPos + 8);
    
    // Background bar
    doc.setFillColor(PDF_COLORS.bgMuted.r, PDF_COLORS.bgMuted.g, PDF_COLORS.bgMuted.b);
    doc.roundedRect(margin + labelWidth, yPos, barWidth, barHeight, 2, 2, 'F');
    
    // Progress bar
    const progress = (dim.value / dim.max) * barWidth;
    doc.setFillColor(dim.color.r, dim.color.g, dim.color.b);
    doc.roundedRect(margin + labelWidth, yPos, progress, barHeight, 2, 2, 'F');
    
    // Value
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${dim.value}/${dim.max}`, margin + labelWidth + barWidth + 5, yPos + 8);
    
    yPos += 18;
  });
  
  return yPos + 5;
}

/**
 * Desenha seção de impacto financeiro
 */
export function drawFinancialImpact(doc: jsPDF, impact: ScoreData['financialImpact'], yStart: number): number {
  const { margin, pageWidth } = PDF_LAYOUT;
  let yPos = yStart;
  
  // Título
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PDF_COLORS.textDark.r, PDF_COLORS.textDark.g, PDF_COLORS.textDark.b);
  doc.text('Impacto Financeiro', margin, yPos);
  
  yPos += 12;
  
  const boxWidth = (pageWidth - 2 * margin - 10) / 3;
  const boxHeight = 45;
  
  const impacts = [
    { label: 'Economia Potencial', value: impact.economiaPotencial, color: PDF_COLORS.success },
    { label: 'Créditos a Recuperar', value: impact.creditosNaoAproveitados, color: PDF_COLORS.warning },
    { label: 'Risco de Autuação', value: impact.riscoAutuacao, color: PDF_COLORS.danger },
  ];
  
  impacts.forEach((item, index) => {
    const xPos = margin + index * (boxWidth + 5);
    
    // Box background
    doc.setFillColor(item.color.r, item.color.g, item.color.b);
    doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
    doc.roundedRect(xPos, yPos, boxWidth, boxHeight, 3, 3, 'F');
    doc.setGState(new (doc as any).GState({ opacity: 1 }));
    
    // Border
    doc.setDrawColor(item.color.r, item.color.g, item.color.b);
    doc.setLineWidth(0.5);
    doc.roundedRect(xPos, yPos, boxWidth, boxHeight, 3, 3, 'S');
    
    // Label
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(item.color.r, item.color.g, item.color.b);
    doc.text(item.label, xPos + 5, yPos + 12);
    
    // Value
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(item.value), xPos + 5, yPos + 30);
  });
  
  return yPos + boxHeight + 15;
}

/**
 * Desenha lista de ações recomendadas
 */
export function drawActionsList(doc: jsPDF, actions: ActionItem[], yStart: number, maxItems: number = 5): number {
  const { margin, pageWidth } = PDF_LAYOUT;
  let yPos = yStart;
  
  // Título
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PDF_COLORS.textDark.r, PDF_COLORS.textDark.g, PDF_COLORS.textDark.b);
  doc.text('Ações Prioritárias', margin, yPos);
  
  yPos += 12;
  
  actions.slice(0, maxItems).forEach((action, index) => {
    // Número
    doc.setFillColor(PDF_COLORS.primary.r, PDF_COLORS.primary.g, PDF_COLORS.primary.b);
    doc.circle(margin + 8, yPos + 3, 6, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${index + 1}`, margin + 8, yPos + 6, { align: 'center' });
    
    // Título
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_COLORS.textDark.r, PDF_COLORS.textDark.g, PDF_COLORS.textDark.b);
    doc.text(action.title, margin + 20, yPos + 4);
    
    // Descrição
    yPos += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(PDF_COLORS.textMuted.r, PDF_COLORS.textMuted.g, PDF_COLORS.textMuted.b);
    const description = action.description.length > 100 
      ? action.description.substring(0, 100) + '...' 
      : action.description;
    doc.text(description, margin + 20, yPos);
    
    // Meta info
    if (action.pointsGain || action.economia) {
      yPos += 8;
      doc.setFontSize(8);
      let metaText = [];
      if (action.pointsGain) metaText.push(`+${action.pointsGain} pontos`);
      if (action.economia) metaText.push(`Economia: ${formatCurrency(action.economia)}`);
      doc.setTextColor(PDF_COLORS.primary.r, PDF_COLORS.primary.g, PDF_COLORS.primary.b);
      doc.text(metaText.join(' | '), margin + 20, yPos);
    }
    
    yPos += 12;
  });
  
  return yPos;
}

/**
 * Adiciona disclaimer padrão
 */
export function drawDisclaimer(doc: jsPDF, yStart: number): number {
  const { margin, pageWidth } = PDF_LAYOUT;
  let yPos = yStart;
  
  // Box de aviso
  doc.setFillColor(255, 243, 205);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 35, 3, 3, 'F');
  
  yPos += 12;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PDF_COLORS.textDark.r, PDF_COLORS.textDark.g, PDF_COLORS.textDark.b);
  doc.text('AVISO IMPORTANTE', margin + 10, yPos);
  
  yPos += 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(PDF_COLORS.textMuted.r, PDF_COLORS.textMuted.g, PDF_COLORS.textMuted.b);
  const disclaimer = 'Este relatório é gerado automaticamente com base nos dados informados. Os valores apresentados são estimativas e devem ser validados por um profissional contábil ou tributário antes de qualquer decisão. A Tributech não se responsabiliza por decisões tomadas com base exclusivamente neste relatório.';
  const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin - 20);
  doc.text(splitDisclaimer, margin + 10, yPos);
  
  return yStart + 45;
}

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function getScoreColor(score: number): { r: number; g: number; b: number } {
  if (score <= 400) return PDF_COLORS.danger;
  if (score <= 600) return PDF_COLORS.warning;
  if (score <= 800) return { r: 234, g: 179, b: 8 }; // Amarelo
  return PDF_COLORS.success;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    excellent: 'EXCELENTE',
    good: 'BOM',
    regular: 'REGULAR',
    attention: 'ATENÇÃO NECESSÁRIA',
    critical: 'CRÍTICO',
  };
  return labels[status] || 'PENDENTE';
}

interface InterpretationPoint {
  icon: string;
  text: string;
}

interface Interpretation {
  title: string;
  points: InterpretationPoint[];
}

function getScoreInterpretation(score: number): Interpretation {
  if (score <= 400) {
    return {
      title: 'Sua empresa está em ZONA CRÍTICA no radar da Receita Federal.',
      points: [
        { icon: '⚠️', text: 'Risco elevado de autuações e multas' },
        { icon: '⚠️', text: 'Possível inclusão em malha fiscal prioritária' },
        { icon: '⚠️', text: 'Sem acesso a benefícios de regularização' },
        { icon: '⚠️', text: 'Classificação estimada: Nota D ou E no Receita Sintonia' },
      ],
    };
  }
  if (score <= 600) {
    return {
      title: 'Sua empresa está em ZONA DE ATENÇÃO no radar da Receita Federal.',
      points: [
        { icon: '✓', text: 'Você não está em risco crítico imediato' },
        { icon: '⚠️', text: 'Existem inconsistências que podem escalar para autuações' },
        { icon: '⚠️', text: 'Você pode estar na lista de "cobrança amigável" para 2026' },
        { icon: '⚠️', text: 'Classificação estimada: Nota C ou D no Receita Sintonia' },
      ],
    };
  }
  if (score <= 800) {
    return {
      title: 'Sua empresa está em SITUAÇÃO MODERADA.',
      points: [
        { icon: '✓', text: 'Conformidade fiscal razoável' },
        { icon: '✓', text: 'Baixo risco de autuações graves' },
        { icon: '⚠️', text: 'Ainda há oportunidades de otimização' },
        { icon: '✓', text: 'Classificação estimada: Nota B no Receita Sintonia' },
      ],
    };
  }
  return {
    title: 'Sua empresa está em CONFORMIDADE EXCELENTE.',
    points: [
      { icon: '✓', text: 'Baixíssimo risco de autuações' },
      { icon: '✓', text: 'Acesso a regularização facilitada (120 dias)' },
      { icon: '✓', text: 'Multas reduzidas em caso de divergências' },
      { icon: '✓', text: 'Classificação estimada: Nota A+ ou A no Receita Sintonia' },
    ],
  };
}
