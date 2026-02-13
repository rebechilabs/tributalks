// src/data/simples-nacional-tabelas.ts
// Fonte: Lei Complementar 123/2006 (Anexos I a V), atualizada pela LC 155/2016

export interface ReparticaoTributos {
  IRPJ: number;
  CSLL: number;
  COFINS: number;
  PIS: number;
  CPP: number;
  ICMS: number;
  ISS: number;
}

export interface FaixaSimples {
  faixa: number;
  receitaBrutaAte: number;
  aliquotaNominal: number;
  parcelaADeduzir: number;
  reparticao: ReparticaoTributos;
}

export interface AnexoSimples {
  anexo: string;
  descricao: string;
  faixas: FaixaSimples[];
}

// ========================================
// ANEXO I — Comércio
// ========================================
const ANEXO_I: AnexoSimples = {
  anexo: "anexo_I",
  descricao: "Comércio",
  faixas: [
    {
      faixa: 1, receitaBrutaAte: 180000, aliquotaNominal: 4.00, parcelaADeduzir: 0,
      reparticao: { IRPJ: 5.50, CSLL: 3.50, COFINS: 12.74, PIS: 2.76, CPP: 41.50, ICMS: 34.00, ISS: 0 }
    },
    {
      faixa: 2, receitaBrutaAte: 360000, aliquotaNominal: 7.30, parcelaADeduzir: 5940,
      reparticao: { IRPJ: 5.50, CSLL: 3.50, COFINS: 12.74, PIS: 2.76, CPP: 41.50, ICMS: 34.00, ISS: 0 }
    },
    {
      faixa: 3, receitaBrutaAte: 720000, aliquotaNominal: 9.50, parcelaADeduzir: 13860,
      reparticao: { IRPJ: 5.50, CSLL: 3.50, COFINS: 12.74, PIS: 2.76, CPP: 42.00, ICMS: 33.50, ISS: 0 }
    },
    {
      faixa: 4, receitaBrutaAte: 1800000, aliquotaNominal: 10.70, parcelaADeduzir: 22500,
      reparticao: { IRPJ: 5.50, CSLL: 3.50, COFINS: 12.74, PIS: 2.76, CPP: 42.00, ICMS: 33.50, ISS: 0 }
    },
    {
      faixa: 5, receitaBrutaAte: 3600000, aliquotaNominal: 14.30, parcelaADeduzir: 87300,
      reparticao: { IRPJ: 5.50, CSLL: 3.50, COFINS: 12.74, PIS: 2.76, CPP: 42.00, ICMS: 33.50, ISS: 0 }
    },
    {
      faixa: 6, receitaBrutaAte: 4800000, aliquotaNominal: 19.00, parcelaADeduzir: 378000,
      reparticao: { IRPJ: 13.50, CSLL: 10.00, COFINS: 28.27, PIS: 6.13, CPP: 42.10, ICMS: 0, ISS: 0 }
    },
  ]
};

// ========================================
// ANEXO II — Indústria
// ========================================
const ANEXO_II: AnexoSimples = {
  anexo: "anexo_II",
  descricao: "Indústria",
  faixas: [
    {
      faixa: 1, receitaBrutaAte: 180000, aliquotaNominal: 4.50, parcelaADeduzir: 0,
      reparticao: { IRPJ: 5.50, CSLL: 3.50, COFINS: 11.51, PIS: 2.49, CPP: 37.50, ICMS: 32.00, ISS: 0 }
    },
    {
      faixa: 2, receitaBrutaAte: 360000, aliquotaNominal: 7.80, parcelaADeduzir: 5940,
      reparticao: { IRPJ: 5.50, CSLL: 3.50, COFINS: 11.51, PIS: 2.49, CPP: 37.50, ICMS: 32.00, ISS: 0 }
    },
    {
      faixa: 3, receitaBrutaAte: 720000, aliquotaNominal: 10.00, parcelaADeduzir: 13860,
      reparticao: { IRPJ: 5.50, CSLL: 3.50, COFINS: 11.51, PIS: 2.49, CPP: 37.50, ICMS: 32.00, ISS: 0 }
    },
    {
      faixa: 4, receitaBrutaAte: 1800000, aliquotaNominal: 11.20, parcelaADeduzir: 22500,
      reparticao: { IRPJ: 5.50, CSLL: 3.50, COFINS: 11.51, PIS: 2.49, CPP: 37.50, ICMS: 32.00, ISS: 0 }
    },
    {
      faixa: 5, receitaBrutaAte: 3600000, aliquotaNominal: 14.70, parcelaADeduzir: 85500,
      reparticao: { IRPJ: 5.50, CSLL: 3.50, COFINS: 11.51, PIS: 2.49, CPP: 37.50, ICMS: 32.00, ISS: 0 }
    },
    {
      faixa: 6, receitaBrutaAte: 4800000, aliquotaNominal: 30.00, parcelaADeduzir: 720000,
      reparticao: { IRPJ: 8.50, CSLL: 7.50, COFINS: 20.96, PIS: 4.54, CPP: 23.50, ICMS: 35.00, ISS: 0 }
    },
  ]
};

// ========================================
// ANEXO III — Serviços (receitas do §5º-B)
// ========================================
const ANEXO_III: AnexoSimples = {
  anexo: "anexo_III",
  descricao: "Serviços (§5º-B do art. 18 da LC 123/2006)",
  faixas: [
    {
      faixa: 1, receitaBrutaAte: 180000, aliquotaNominal: 6.00, parcelaADeduzir: 0,
      reparticao: { IRPJ: 4.00, CSLL: 3.50, COFINS: 12.82, PIS: 2.78, CPP: 43.40, ICMS: 0, ISS: 33.50 }
    },
    {
      faixa: 2, receitaBrutaAte: 360000, aliquotaNominal: 11.20, parcelaADeduzir: 9360,
      reparticao: { IRPJ: 4.00, CSLL: 3.50, COFINS: 14.05, PIS: 3.05, CPP: 43.40, ICMS: 0, ISS: 32.00 }
    },
    {
      faixa: 3, receitaBrutaAte: 720000, aliquotaNominal: 13.50, parcelaADeduzir: 17640,
      reparticao: { IRPJ: 4.00, CSLL: 3.50, COFINS: 13.64, PIS: 2.96, CPP: 43.40, ICMS: 0, ISS: 32.50 }
    },
    {
      faixa: 4, receitaBrutaAte: 1800000, aliquotaNominal: 16.00, parcelaADeduzir: 35640,
      reparticao: { IRPJ: 4.00, CSLL: 3.50, COFINS: 13.64, PIS: 2.96, CPP: 43.40, ICMS: 0, ISS: 32.50 }
    },
    {
      faixa: 5, receitaBrutaAte: 3600000, aliquotaNominal: 21.00, parcelaADeduzir: 125640,
      reparticao: { IRPJ: 4.00, CSLL: 3.50, COFINS: 12.82, PIS: 2.78, CPP: 43.40, ICMS: 0, ISS: 33.50 }
    },
    {
      faixa: 6, receitaBrutaAte: 4800000, aliquotaNominal: 33.00, parcelaADeduzir: 648000,
      reparticao: { IRPJ: 35.00, CSLL: 15.00, COFINS: 16.03, PIS: 3.47, CPP: 30.50, ICMS: 0, ISS: 0 }
    },
  ]
};

// ========================================
// ANEXO IV — Serviços (construção, vigilância, limpeza)
// ========================================
const ANEXO_IV: AnexoSimples = {
  anexo: "anexo_IV",
  descricao: "Serviços de construção, vigilância, limpeza e obras",
  faixas: [
    {
      faixa: 1, receitaBrutaAte: 180000, aliquotaNominal: 4.50, parcelaADeduzir: 0,
      reparticao: { IRPJ: 18.80, CSLL: 15.20, COFINS: 17.67, PIS: 3.83, CPP: 0, ICMS: 0, ISS: 44.50 }
    },
    {
      faixa: 2, receitaBrutaAte: 360000, aliquotaNominal: 9.00, parcelaADeduzir: 8100,
      reparticao: { IRPJ: 19.80, CSLL: 15.20, COFINS: 20.55, PIS: 4.45, CPP: 0, ICMS: 0, ISS: 40.00 }
    },
    {
      faixa: 3, receitaBrutaAte: 720000, aliquotaNominal: 10.20, parcelaADeduzir: 12420,
      reparticao: { IRPJ: 20.80, CSLL: 15.20, COFINS: 19.73, PIS: 4.27, CPP: 0, ICMS: 0, ISS: 40.00 }
    },
    {
      faixa: 4, receitaBrutaAte: 1800000, aliquotaNominal: 14.00, parcelaADeduzir: 39780,
      reparticao: { IRPJ: 17.80, CSLL: 19.20, COFINS: 18.90, PIS: 4.10, CPP: 0, ICMS: 0, ISS: 40.00 }
    },
    {
      faixa: 5, receitaBrutaAte: 3600000, aliquotaNominal: 22.00, parcelaADeduzir: 183780,
      reparticao: { IRPJ: 18.80, CSLL: 19.20, COFINS: 18.08, PIS: 3.92, CPP: 0, ICMS: 0, ISS: 40.00 }
    },
    {
      faixa: 6, receitaBrutaAte: 4800000, aliquotaNominal: 33.00, parcelaADeduzir: 828000,
      reparticao: { IRPJ: 53.50, CSLL: 21.50, COFINS: 20.55, PIS: 4.45, CPP: 0, ICMS: 0, ISS: 0 }
    },
  ]
};

// ========================================
// ANEXO V — Serviços (§5º-I)
// ========================================
const ANEXO_V: AnexoSimples = {
  anexo: "anexo_V",
  descricao: "Serviços (§5º-I do art. 18 da LC 123/2006) — TI, engenharia, etc.",
  faixas: [
    {
      faixa: 1, receitaBrutaAte: 180000, aliquotaNominal: 15.50, parcelaADeduzir: 0,
      reparticao: { IRPJ: 25.00, CSLL: 15.00, COFINS: 14.10, PIS: 3.05, CPP: 28.85, ICMS: 0, ISS: 14.00 }
    },
    {
      faixa: 2, receitaBrutaAte: 360000, aliquotaNominal: 18.00, parcelaADeduzir: 4500,
      reparticao: { IRPJ: 23.00, CSLL: 15.00, COFINS: 14.10, PIS: 3.05, CPP: 27.85, ICMS: 0, ISS: 17.00 }
    },
    {
      faixa: 3, receitaBrutaAte: 720000, aliquotaNominal: 19.50, parcelaADeduzir: 9900,
      reparticao: { IRPJ: 24.00, CSLL: 15.00, COFINS: 14.92, PIS: 3.23, CPP: 23.85, ICMS: 0, ISS: 19.00 }
    },
    {
      faixa: 4, receitaBrutaAte: 1800000, aliquotaNominal: 20.50, parcelaADeduzir: 17100,
      reparticao: { IRPJ: 21.00, CSLL: 15.00, COFINS: 15.74, PIS: 3.41, CPP: 23.85, ICMS: 0, ISS: 21.00 }
    },
    {
      faixa: 5, receitaBrutaAte: 3600000, aliquotaNominal: 23.00, parcelaADeduzir: 62100,
      reparticao: { IRPJ: 23.00, CSLL: 12.50, COFINS: 14.10, PIS: 3.05, CPP: 23.85, ICMS: 0, ISS: 23.50 }
    },
    {
      faixa: 6, receitaBrutaAte: 4800000, aliquotaNominal: 30.50, parcelaADeduzir: 540000,
      reparticao: { IRPJ: 35.00, CSLL: 15.50, COFINS: 16.44, PIS: 3.56, CPP: 29.50, ICMS: 0, ISS: 0 }
    },
  ]
};

// ========================================
// CONSTANTE PRINCIPAL
// ========================================
export const SIMPLES_NACIONAL: Record<string, AnexoSimples> = {
  "anexo_I": ANEXO_I,
  "anexo_II": ANEXO_II,
  "anexo_III": ANEXO_III,
  "anexo_IV": ANEXO_IV,
  "anexo_V": ANEXO_V,
  // Aliases
  "I": ANEXO_I,
  "II": ANEXO_II,
  "III": ANEXO_III,
  "IV": ANEXO_IV,
  "V": ANEXO_V,
};

// ========================================
// FUNÇÕES DE CÁLCULO
// ========================================

export interface ResultadoAliquota {
  aliquotaEfetiva: number;
  reparticao: ReparticaoTributos | null;
  faixa: number;
  anexo: string;
}

/**
 * Calcula a alíquota efetiva do Simples Nacional.
 * Fórmula: [(RBT12 × Alíquota Nominal) – Parcela a Deduzir] / RBT12
 */
export function calcularAliquotaEfetiva(rbt12: number, anexo: string): ResultadoAliquota {
  const anexoData = SIMPLES_NACIONAL[anexo];
  if (!anexoData || rbt12 <= 0) {
    return { aliquotaEfetiva: 0, reparticao: null, faixa: 0, anexo };
  }

  let faixaEncontrada: FaixaSimples | null = null;
  for (const faixa of anexoData.faixas) {
    if (rbt12 <= faixa.receitaBrutaAte) {
      faixaEncontrada = faixa;
      break;
    }
  }

  if (!faixaEncontrada) {
    faixaEncontrada = anexoData.faixas[anexoData.faixas.length - 1];
  }

  const aliquotaEfetiva = ((rbt12 * (faixaEncontrada.aliquotaNominal / 100)) - faixaEncontrada.parcelaADeduzir) / rbt12;

  return {
    aliquotaEfetiva: Math.round(aliquotaEfetiva * 10000) / 10000,
    reparticao: faixaEncontrada.reparticao,
    faixa: faixaEncontrada.faixa,
    anexo,
  };
}

/**
 * Calcula o valor de um tributo específico dentro do DAS.
 */
export function calcularParcelaTributo(
  receitaMensal: number,
  rbt12: number,
  anexo: string,
  tributo: keyof ReparticaoTributos
): number {
  const { aliquotaEfetiva, reparticao } = calcularAliquotaEfetiva(rbt12, anexo);
  if (!reparticao) return 0;

  const valorDAS = receitaMensal * aliquotaEfetiva;
  return Math.round(valorDAS * (reparticao[tributo] / 100) * 100) / 100;
}
