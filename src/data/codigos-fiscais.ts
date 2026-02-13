// src/data/codigos-fiscais.ts
// Fonte: Ajuste SINIEF 07/2005 (CSOSN); IN RFB 1.009/2010 (CST PIS/COFINS)

export interface CodigoCST {
  codigo: string;
  descricao: string;
  tipo: string;
  monofasico: boolean;
  temCredito: boolean;
}

export interface CodigoCSOSN {
  codigo: string;
  descricao: string;
  icmsNoDas: boolean;
  temST: boolean;
}

// ========================================
// CSOSN — Código de Situação da Operação no Simples Nacional (10 códigos)
// ========================================
export const CSOSN_TABLE: Record<string, CodigoCSOSN> = {
  "101": { codigo: "101", descricao: "Tributada com permissão de crédito", icmsNoDas: true, temST: false },
  "102": { codigo: "102", descricao: "Tributada sem permissão de crédito", icmsNoDas: true, temST: false },
  "103": { codigo: "103", descricao: "Isenção do ICMS para faixa de receita bruta", icmsNoDas: false, temST: false },
  "201": { codigo: "201", descricao: "Tributada com permissão de crédito e cobrança de ICMS por ST", icmsNoDas: true, temST: true },
  "202": { codigo: "202", descricao: "Tributada sem permissão de crédito e cobrança de ICMS por ST", icmsNoDas: true, temST: true },
  "203": { codigo: "203", descricao: "Isenção do ICMS para faixa de receita bruta e cobrança de ICMS por ST", icmsNoDas: false, temST: true },
  "300": { codigo: "300", descricao: "Imune", icmsNoDas: false, temST: false },
  "400": { codigo: "400", descricao: "Não tributada pelo Simples Nacional", icmsNoDas: false, temST: false },
  "500": { codigo: "500", descricao: "ICMS cobrado anteriormente por ST ou antecipação", icmsNoDas: false, temST: true },
  "900": { codigo: "900", descricao: "Outros", icmsNoDas: true, temST: false },
};

// ========================================
// CST PIS/COFINS de SAÍDA (11 códigos mais relevantes)
// ========================================
export const CST_PIS_COFINS_SAIDA: Record<string, CodigoCST> = {
  "01": { codigo: "01", descricao: "Operação Tributável com Alíquota Básica", tipo: "saida", monofasico: false, temCredito: false },
  "02": { codigo: "02", descricao: "Operação Tributável com Alíquota Diferenciada", tipo: "saida", monofasico: false, temCredito: false },
  "03": { codigo: "03", descricao: "Operação Tributável com Alíquota por Unidade de Medida", tipo: "saida", monofasico: false, temCredito: false },
  "04": { codigo: "04", descricao: "Operação Tributável Monofásica - Revenda a Alíquota Zero", tipo: "saida", monofasico: true, temCredito: false },
  "05": { codigo: "05", descricao: "Operação Tributável por Substituição Tributária", tipo: "saida", monofasico: true, temCredito: false },
  "06": { codigo: "06", descricao: "Operação Tributável a Alíquota Zero", tipo: "saida", monofasico: true, temCredito: false },
  "07": { codigo: "07", descricao: "Operação Isenta da Contribuição", tipo: "saida", monofasico: false, temCredito: false },
  "08": { codigo: "08", descricao: "Operação sem Incidência da Contribuição", tipo: "saida", monofasico: false, temCredito: false },
  "09": { codigo: "09", descricao: "Operação com Suspensão da Contribuição", tipo: "saida", monofasico: false, temCredito: false },
  "49": { codigo: "49", descricao: "Outras Operações de Saída", tipo: "saida", monofasico: false, temCredito: false },
  "99": { codigo: "99", descricao: "Outras Operações", tipo: "saida", monofasico: false, temCredito: false },
};

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Verifica se o CST de PIS ou COFINS indica tributação monofásica.
 * CSTs monofásicos: 04 (revenda alíquota zero), 05 (ST), 06 (alíquota zero).
 */
export function isMonofasicoPorCst(cst: string): boolean {
  return ["04", "05", "06"].includes(cst);
}

/**
 * Verifica se o CSOSN indica que o ICMS já foi recolhido por ST.
 * CSOSN 500 = "ICMS cobrado anteriormente por substituição tributária"
 */
export function isIcmsRecolhidoPorST(csosn: string): boolean {
  return csosn === "500";
}

/**
 * Verifica se o CSOSN indica que o ICMS deve ser pago no DAS.
 */
export function devePayIcmsNoDas(csosn: string): boolean {
  const info = CSOSN_TABLE[csosn];
  return info ? info.icmsNoDas : true; // Default: paga
}
