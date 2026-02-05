/**
 * TribuTalks PDF Styles
 * Typography and layout constants for PDF generation
 */

// Page dimensions (A4 in mm)
export const PAGE = {
  width: 210,
  height: 297,
  marginTop: 20,
  marginBottom: 25,
  marginLeft: 20,
  marginRight: 20,
  contentWidth: 170, // 210 - 20 - 20
  headerHeight: 25,
  footerHeight: 15,
};

// Typography sizes
export const FONT_SIZES = {
  title: 24,
  subtitle: 18,
  heading1: 16,
  heading2: 14,
  heading3: 12,
  body: 10,
  small: 9,
  tiny: 8,
  micro: 7,
};

// Line heights (multiplier)
export const LINE_HEIGHTS = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
  loose: 2.0,
};

// Spacing (in mm)
export const SPACING = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
};

// Table settings
export const TABLE = {
  headerHeight: 8,
  rowHeight: 7,
  cellPaddingX: 3,
  cellPaddingY: 2,
  fontSize: 8,
  headerFontSize: 9,
};

// Card settings
export const CARD = {
  padding: 10,
  borderRadius: 4,
  borderWidth: 0.5,
};

// Common column widths for credit tables
export const CREDIT_TABLE_COLUMNS = {
  nfeNumber: 25,
  supplier: 45,
  date: 22,
  value: 25,
  ncm: 20,
  cfop: 15,
  cst: 12,
  confidence: 20,
};

// Position helpers
export function getContentStartY(): number {
  return PAGE.marginTop + PAGE.headerHeight;
}

export function getContentEndY(): number {
  return PAGE.height - PAGE.marginBottom - PAGE.footerHeight;
}

export function getUsableHeight(): number {
  return getContentEndY() - getContentStartY();
}

export function needsNewPage(currentY: number, requiredSpace: number): boolean {
  return currentY + requiredSpace > getContentEndY();
}

// Text width calculation (approximate)
export function estimateTextWidth(text: string, fontSize: number): number {
  // Approximate character width ratio for helvetica
  const avgCharWidth = fontSize * 0.5;
  return text.length * avgCharWidth;
}

// Truncate text to fit width
export function truncateText(text: string, maxWidth: number, fontSize: number): string {
  const charWidth = fontSize * 0.5;
  const maxChars = Math.floor(maxWidth / charWidth) - 3;
  if (text.length > maxChars) {
    return text.substring(0, maxChars) + '...';
  }
  return text;
}

// Format CNPJ
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Format date
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
}

// Format NFe key (44 digits in groups)
export function formatNfeKey(key: string): string {
  const cleaned = key.replace(/\D/g, '');
  if (cleaned.length !== 44) return key;
  return cleaned.match(/.{1,4}/g)?.join(' ') || key;
}

// Format percentage
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Regime names
export function getRegimeName(regime: string): string {
  const regimes: Record<string, string> = {
    simples: 'Simples Nacional',
    presumido: 'Lucro Presumido',
    real: 'Lucro Real',
  };
  return regimes[regime] || regime;
}

// Confidence level names
export function getConfidenceName(level: string): string {
  const levels: Record<string, string> = {
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa',
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa',
  };
  return levels[level] || level;
}

// Risk level names
export function getRiskName(risk: string): string {
  const risks: Record<string, string> = {
    nenhum: 'Nenhum',
    baixo: 'Baixo',
    medio: 'Médio',
    alto: 'Alto',
  };
  return risks[risk] || risk;
}
