// src/data/codigos-fiscais.ts
// Fontes: Ajuste SINIEF 07/2005, Resolução CGSN 140/2018, IN RFB 1.911/2019

// ========================================
// CSOSN - Código de Situação da Operação no Simples Nacional
// Usado no campo ICMS das NF-e emitidas por empresas do Simples
// ========================================

export interface CsosnInfo {
  codigo: string;
  descricao: string;
  icmsPagoNoDas: boolean;
  icmsJaRecolhidoPorST: boolean;
  relevanciaPataRadar: string;
}

export const CSOSN_TABLE: Record<string, CsosnInfo> = {
  "101": {
    codigo: "101",
    descricao: "Tributada pelo Simples com permissão de crédito",
    icmsPagoNoDas: true,
    icmsJaRecolhidoPorST: false,
    relevanciaPataRadar: "Normal. ICMS é pago no DAS."
  },
  "102": {
    codigo: "102",
    descricao: "Tributada pelo Simples sem permissão de crédito",
    icmsPagoNoDas: true,
    icmsJaRecolhidoPorST: false,
    relevanciaPataRadar: "Normal. ICMS é pago no DAS. Verificar se produto é monofásico para PIS/COFINS."
  },
  "103": {
    codigo: "103",
    descricao: "Isenção do ICMS para faixa de receita bruta",
    icmsPagoNoDas: false,
    icmsJaRecolhidoPorST: false,
    relevanciaPataRadar: "Isento. Sem oportunidade de ICMS."
  },
  "201": {
    codigo: "201",
    descricao: "Tributada pelo Simples com crédito e cobrança de ICMS-ST",
    icmsPagoNoDas: true,
    icmsJaRecolhidoPorST: false,
    relevanciaPataRadar: "Empresa é substituta tributária. Diferente do 500."
  },
  "202": {
    codigo: "202",
    descricao: "Tributada pelo Simples sem crédito e cobrança de ICMS-ST",
    icmsPagoNoDas: true,
    icmsJaRecolhidoPorST: false,
    relevanciaPataRadar: "Empresa é substituta tributária."
  },
  "203": {
    codigo: "203",
    descricao: "Isenção do ICMS com cobrança de ICMS-ST",
    icmsPagoNoDas: false,
    icmsJaRecolhidoPorST: false,
    relevanciaPataRadar: "Isento com ST."
  },
  "300": {
    codigo: "300",
    descricao: "Imune (ex: livros, jornais)",
    icmsPagoNoDas: false,
    icmsJaRecolhidoPorST: false,
    relevanciaPataRadar: "Imune. Sem oportunidade."
  },
  "400": {
    codigo: "400",
    descricao: "Não tributada pelo Simples Nacional",
    icmsPagoNoDas: false,
    icmsJaRecolhidoPorST: false,
    relevanciaPataRadar: "Fora da incidência."
  },
  "500": {
    codigo: "500",
    descricao: "ICMS cobrado anteriormente por ST ou antecipação",
    icmsPagoNoDas: false,
    icmsJaRecolhidoPorST: true,
    relevanciaPataRadar: "CRUCIAL: ICMS já pago por ST. NÃO deve pagar ICMS no DAS. Principal oportunidade de ICMS no Simples."
  },
  "900": {
    codigo: "900",
    descricao: "Outros",
    icmsPagoNoDas: false,
    icmsJaRecolhidoPorST: false,
    relevanciaPataRadar: "Analisar caso a caso."
  },
};

// ========================================
// CST PIS/COFINS - Código de Situação Tributária
// Usado para identificar se o produto é monofásico, tributado, isento, etc.
// ========================================

export interface CstPisCofinsInfo {
  cst: string;
  descricao: string;
  tributado: boolean;
  tipo: string;
  relevanciaPataRadar: string;
}

export const CST_PIS_COFINS_SAIDA: Record<string, CstPisCofinsInfo> = {
  "01": {
    cst: "01",
    descricao: "Operação Tributável com Alíquota Básica",
    tributado: true,
    tipo: "cumulativo_ou_nao_cumulativo",
    relevanciaPataRadar: "Tributação normal."
  },
  "02": {
    cst: "02",
    descricao: "Operação Tributável com Alíquota Diferenciada",
    tributado: true,
    tipo: "aliquota_diferenciada",
    relevanciaPataRadar: "Tributação diferenciada."
  },
  "03": {
    cst: "03",
    descricao: "Operação Tributável por Unidade de Medida de Produto",
    tributado: true,
    tipo: "por_unidade",
    relevanciaPataRadar: "Tributação por unidade (bebidas frias)."
  },
  "04": {
    cst: "04",
    descricao: "Operação Tributável Monofásica - Revenda a Alíquota Zero",
    tributado: false,
    tipo: "monofasico",
    relevanciaPataRadar: "ALTA PRIORIDADE: Produto monofásico. No Simples, NÃO deve pagar PIS/COFINS no DAS sobre esta receita."
  },
  "05": {
    cst: "05",
    descricao: "Operação Tributável por Substituição Tributária",
    tributado: false,
    tipo: "substituicao_tributaria",
    relevanciaPataRadar: "ST de PIS/COFINS."
  },
  "06": {
    cst: "06",
    descricao: "Operação Tributável a Alíquota Zero",
    tributado: false,
    tipo: "aliquota_zero",
    relevanciaPataRadar: "Alíquota zero. Também não deveria gerar PIS/COFINS no DAS."
  },
  "07": {
    cst: "07",
    descricao: "Operação Isenta da Contribuição",
    tributado: false,
    tipo: "isenta",
    relevanciaPataRadar: "Isenta."
  },
  "08": {
    cst: "08",
    descricao: "Operação sem Incidência da Contribuição",
    tributado: false,
    tipo: "sem_incidencia",
    relevanciaPataRadar: "Sem incidência."
  },
  "09": {
    cst: "09",
    descricao: "Operação com Suspensão da Contribuição",
    tributado: false,
    tipo: "suspensao",
    relevanciaPataRadar: "Suspensão."
  },
  "49": {
    cst: "49",
    descricao: "Outras Operações de Saída",
    tributado: true,
    tipo: "outras_saidas",
    relevanciaPataRadar: "Genérico. Verificar NCM para determinar se é monofásico."
  },
  "99": {
    cst: "99",
    descricao: "Outras Operações",
    tributado: true,
    tipo: "outras",
    relevanciaPataRadar: "Genérico. Verificar NCM."
  },
};

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Verifica se uma operação de saída é monofásica pelo CST
 */
export function isMonofasicoPorCst(cstPis: string): boolean {
  return cstPis === "04";
}

/**
 * Verifica se o ICMS já foi recolhido por ST pelo CSOSN
 */
export function isIcmsRecolhidoPorST(csosn: string): boolean {
  return csosn === "500";
}

/**
 * Verifica se a receita deve ter ICMS no DAS
 */
export function devePayIcmsNoDas(csosn: string): boolean {
  const info = CSOSN_TABLE[csosn];
  if (!info) return true; // Na dúvida, assume que paga
  return info.icmsPagoNoDas;
}
