/**
 * TribuTalks PDF Color Palette
 * Design system colors for PDF generation
 * Based on dark theme with gold accents
 */

export const TRIBUTALKS_PDF_COLORS = {
  // Background colors (RGB arrays for jsPDF)
  bgPrimary: [10, 10, 10] as [number, number, number],        // #0A0A0A - Main dark background
  bgCard: [20, 20, 20] as [number, number, number],           // #141414 - Card backgrounds
  bgElevated: [29, 28, 26] as [number, number, number],       // #1D1C1A - Elevated surfaces
  bgGoldCard: [38, 32, 23] as [number, number, number],       // #262017 - Gold accent cards
  bgSection: [15, 15, 15] as [number, number, number],        // #0F0F0F - Section backgrounds
  
  // Gold accent colors
  gold: [239, 162, 25] as [number, number, number],           // #EFA219 - Primary gold
  goldText: [234, 159, 29] as [number, number, number],       // #EA9F1D - Gold for text
  goldButton: [245, 158, 11] as [number, number, number],     // #F59E0B - Gold buttons
  goldLight: [251, 191, 36] as [number, number, number],      // #FBBF24 - Light gold
  goldDark: [180, 120, 20] as [number, number, number],       // #B47814 - Dark gold
  
  // Status colors
  success: [34, 197, 94] as [number, number, number],         // #22C55E - Green
  successBg: [20, 40, 30] as [number, number, number],        // Dark green bg
  warning: [234, 179, 8] as [number, number, number],         // #EAB308 - Yellow
  warningBg: [40, 35, 15] as [number, number, number],        // Dark yellow bg
  danger: [239, 68, 68] as [number, number, number],          // #EF4444 - Red
  dangerBg: [45, 20, 20] as [number, number, number],         // Dark red bg
  info: [59, 130, 246] as [number, number, number],           // #3B82F6 - Blue
  infoBg: [20, 30, 50] as [number, number, number],           // Dark blue bg
  
  // Text colors
  textPrimary: [255, 255, 255] as [number, number, number],   // White
  textSecondary: [163, 163, 163] as [number, number, number], // #A3A3A3 - Muted
  textMuted: [115, 115, 115] as [number, number, number],     // #737373 - Very muted
  textDark: [30, 30, 30] as [number, number, number],         // For light backgrounds
  
  // Border colors
  border: [46, 46, 46] as [number, number, number],           // #2E2E2E
  borderLight: [68, 68, 68] as [number, number, number],      // #444444
  borderGold: [68, 66, 61] as [number, number, number],       // #44423D - Gold border
  
  // Chart colors
  chart1: [59, 130, 246] as [number, number, number],         // Blue
  chart2: [34, 197, 94] as [number, number, number],          // Green
  chart3: [239, 162, 25] as [number, number, number],         // Gold
  chart4: [168, 85, 247] as [number, number, number],         // Purple
  chart5: [236, 72, 153] as [number, number, number],         // Pink
};

// Hex versions for reference
export const TRIBUTALKS_PDF_HEX = {
  bgPrimary: '#0A0A0A',
  bgCard: '#141414',
  bgElevated: '#1D1C1A',
  bgGoldCard: '#262017',
  gold: '#EFA219',
  goldText: '#EA9F1D',
  success: '#22C55E',
  warning: '#EAB308',
  danger: '#EF4444',
  textPrimary: '#FFFFFF',
  textSecondary: '#A3A3A3',
  border: '#2E2E2E',
};

// Confidence level colors
export function getConfidenceColor(level: 'alta' | 'media' | 'baixa' | 'high' | 'medium' | 'low'): [number, number, number] {
  const normalizedLevel = level.toLowerCase();
  if (normalizedLevel === 'alta' || normalizedLevel === 'high') {
    return TRIBUTALKS_PDF_COLORS.success;
  }
  if (normalizedLevel === 'media' || normalizedLevel === 'medium') {
    return TRIBUTALKS_PDF_COLORS.warning;
  }
  return TRIBUTALKS_PDF_COLORS.danger;
}

// Risk level colors
export function getRiskColor(risk: 'nenhum' | 'baixo' | 'medio' | 'alto'): [number, number, number] {
  switch (risk) {
    case 'nenhum':
      return TRIBUTALKS_PDF_COLORS.success;
    case 'baixo':
      return TRIBUTALKS_PDF_COLORS.info;
    case 'medio':
      return TRIBUTALKS_PDF_COLORS.warning;
    case 'alto':
      return TRIBUTALKS_PDF_COLORS.danger;
    default:
      return TRIBUTALKS_PDF_COLORS.textSecondary;
  }
}
