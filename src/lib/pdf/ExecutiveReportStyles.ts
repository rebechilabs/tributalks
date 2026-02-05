/**
 * Executive Report Styles
 * Typography and layout constants for text-only professional PDF
 * Following TribuTalks Executive Report specifications
 */

// Page dimensions (A4 in mm) - Professional margins
export const EXEC_PAGE = {
  width: 210,
  height: 297,
  marginTop: 25,
  marginBottom: 25,
  marginLeft: 20,
  marginRight: 20,
  contentWidth: 170, // 210 - 20 - 20
};

// Typography sizes (jsPDF uses Helvetica/Courier)
export const EXEC_FONTS = {
  // Titles
  h1: { size: 16, style: 'bold' as const },
  h2: { size: 14, style: 'bold' as const },
  h3: { size: 12, style: 'bold' as const },
  
  // Body text
  body: { size: 10, style: 'normal' as const },
  bodyBold: { size: 10, style: 'bold' as const },
  
  // Small/secondary text
  small: { size: 9, style: 'normal' as const },
  smallBold: { size: 9, style: 'bold' as const },
  
  // Monospace for keys/codes
  mono: { size: 8, style: 'normal' as const },
  monoSmall: { size: 7, style: 'normal' as const },
};

// Colors (black and white for printing)
export const EXEC_COLORS = {
  black: { r: 0, g: 0, b: 0 },
  gray: { r: 102, g: 102, b: 102 },  // #666666
  lightGray: { r: 150, g: 150, b: 150 },
  border: { r: 46, g: 46, b: 46 },   // #2E2E2E
  white: { r: 255, g: 255, b: 255 },
};

// Spacing (in mm)
export const EXEC_SPACING = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 10,
  xl: 14,
  xxl: 20,
  
  // After titles
  afterH1: 12,
  afterH2: 8,
  afterH3: 6,
  
  // Paragraphs
  paragraph: 8,
  line: 4,
};

// Credit box dimensions
export const EXEC_CREDIT_BOX = {
  padding: 6,
  lineHeight: 5,
  sectionGap: 4,
  minHeight: 55,
  maxHeight: 80,
};

// Line settings
export const EXEC_LINES = {
  separator: 0.3,
  box: 0.4,
  header: 0.5,
};

// Calculate content boundaries
export function getExecContentStart(): number {
  return EXEC_PAGE.marginTop + 15; // Space for header
}

export function getExecContentEnd(): number {
  return EXEC_PAGE.height - EXEC_PAGE.marginBottom - 10; // Space for footer
}

export function needsExecNewPage(currentY: number, requiredSpace: number): boolean {
  return currentY + requiredSpace > getExecContentEnd();
}

// Format helpers specific to executive report
export function formatCurrencyExec(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateExec(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTimeExec(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateStr = d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dateStr} às ${timeStr}`;
}

export function formatMonthYear(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatNfeNumber(number: string): string {
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.length <= 6) return cleaned;
  return cleaned.replace(/(\d{3})(\d{3})(\d+)?/, '$1.$2.$3').replace(/\.$/, '');
}

export function formatCnpjExec(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

// SPED register mapping
export function getSpedInfo(tributo: string): { tipo: string; registro: string } {
  const tributoUpper = tributo.toUpperCase();
  
  if (tributoUpper.includes('PIS') || tributoUpper.includes('COFINS')) {
    return {
      tipo: 'EFD Contribuições',
      registro: 'C170 (itens do documento)',
    };
  }
  
  if (tributoUpper === 'ICMS-ST' || tributoUpper.includes('ST')) {
    return {
      tipo: 'EFD ICMS/IPI',
      registro: 'C100/C113 (substituição tributária)',
    };
  }
  
  if (tributoUpper.includes('ICMS')) {
    return {
      tipo: 'EFD ICMS/IPI',
      registro: 'C100/C190 (documentos e totais)',
    };
  }
  
  if (tributoUpper.includes('IPI')) {
    return {
      tipo: 'EFD ICMS/IPI',
      registro: 'C170/E520 (itens e apuração)',
    };
  }
  
  return {
    tipo: 'SPED Fiscal',
    registro: 'Verificar documentação',
  };
}

// Generate recommended action based on credit type
export function generateRecommendedAction(
  tributo: string, 
  periodo: string,
  cstAtual?: string,
  cstCorreto?: string
): string {
  const tributoUpper = tributo.toUpperCase();
  
  if (tributoUpper.includes('PIS') || tributoUpper.includes('COFINS')) {
    if (cstAtual && cstCorreto) {
      return `Retificar EFD Contribuições de ${periodo}. Corrigir CST de ${cstAtual} para ${cstCorreto} nos itens identificados. Transmitir PER/DCOMP para restituição ou compensação.`;
    }
    return `Retificar EFD Contribuições de ${periodo}. Revisar CST dos itens monofásicos. Transmitir PER/DCOMP via e-CAC.`;
  }
  
  if (tributoUpper === 'ICMS-ST' || tributoUpper.includes('ST')) {
    return `Solicitar restituição de ICMS-ST via e-CAC ou sistema estadual. Verificar base de cálculo e MVA aplicados.`;
  }
  
  if (tributoUpper.includes('ICMS')) {
    return `Retificar EFD ICMS/IPI de ${periodo}. Incluir registro C190 com apropriação do crédito não aproveitado. Verificar prazo decadencial (5 anos).`;
  }
  
  if (tributoUpper.includes('IPI')) {
    return `Retificar EFD ICMS/IPI de ${periodo}. Verificar apuração no registro E520. Compensar via PER/DCOMP.`;
  }
  
  return `Consultar contador para retificação do período ${periodo}. Documentar crédito e base legal.`;
}

// Regime tributário full name
export function getRegimeFullName(regime: string): string {
  const regimes: Record<string, string> = {
    simples: 'Simples Nacional',
    presumido: 'Lucro Presumido',
    real: 'Lucro Real',
  };
  return regimes[regime] || regime;
}

// Confidence level display
export function getConfidenceLabel(level: string): string {
  const labels: Record<string, string> = {
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa',
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa',
  };
  return labels[level?.toLowerCase()] || 'Média';
}

// Complexity label
export function getComplexityLabel(complexity: string): string {
  const labels: Record<string, string> = {
    rapida: 'Rápida',
    media: 'Média',
    complexa: 'Complexa',
  };
  return labels[complexity] || complexity;
}

// Risk label
export function getRiskLabel(risk: string): string {
  const labels: Record<string, string> = {
    nenhum: 'Nenhum',
    baixo: 'Baixo',
    medio: 'Médio',
    alto: 'Alto',
  };
  return labels[risk] || risk;
}
