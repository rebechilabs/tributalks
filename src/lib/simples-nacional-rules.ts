// src/lib/simples-nacional-rules.ts
// Motor de cálculo de créditos para Simples Nacional
// Usa fórmula proporcional baseada nos valores absolutos do PGDAS

import { calcularAliquotaEfetiva } from '../data/simples-nacional-tabelas';
import { verificarNcmMonofasico } from '../data/ncms-monofasicos';
import { isMonofasicoPorCst, isIcmsRecolhidoPorST } from '../data/codigos-fiscais';
import { isCfopSaidaComST } from '../data/cfops';

export interface ItemNfe {
  ncm: string;
  cfop: string;
  csosn?: string;
  cstPis?: string;
  cstCofins?: string;
  valorProduto: number;
  valorIcmsSt?: number;
}

export interface DadosPgdas {
  rbt12: number;
  anexo: string;
  receitaBruta?: number;
  reparticao?: {
    pis: number;
    cofins: number;
    icms: number;
    irpj: number;
    csll: number;
    cpp: number;
  };
}

export interface CreditoIdentificado {
  regra: string;
  tributo: string;
  descricao: string;
  baseLegal: string;
  valorRecuperavel: number;
  confianca: 'alta' | 'media' | 'baixa';
  detalhamento: {
    ncm?: string;
    descricaoProduto?: string;
    mes?: string;
    receitaBase: number;
    aliquotaEfetiva: number;
    percentualTributo: number;
  };
}

export interface ResultadoAnalise {
  regime: 'simples_nacional';
  creditos: CreditoIdentificado[];
  totalRecuperavel: number;
  totalPisCofins: number;
  totalIcms: number;
  regrasBloqueadas: string[];
  orientacoes: string[];
}

export const REGRAS_BLOQUEADAS_SIMPLES: string[] = [
  "IPI_001", "IPI_002", "IPI_003",
  "ICMS_001", "ICMS_002", "ICMS_005",
  "ICMS_ST_001",
  "PIS_COFINS_001", "PIS_COFINS_002", "PIS_COFINS_003",
  "PIS_COFINS_004", "PIS_COFINS_005", "PIS_COFINS_006",
  "PIS_COFINS_007", "PIS_COFINS_008", "PIS_COFINS_009",
  "PIS_COFINS_010", "PIS_COFINS_011",
];

/**
 * Calcula créditos de PIS e COFINS monofásicos usando fórmula proporcional.
 * 
 * Fórmula:
 *   PIS indevido    = PIS_pago    × (fat_mono + fat_ST) / fat_total
 *   COFINS indevido = COFINS_pago × (fat_mono + fat_ST) / fat_total
 * 
 * Quando reparticao em R$ está disponível no PGDAS, usa valores absolutos.
 * Caso contrário, estima via alíquota efetiva × percentuais de repartição.
 */
export function calcularCreditoMonofasico(
  itensSaida: ItemNfe[],
  dadosPgdas: DadosPgdas,
  mes: string
): CreditoIdentificado[] {
  const creditos: CreditoIdentificado[] = [];

  const { aliquotaEfetiva, reparticao: reparticaoPercentual } = calcularAliquotaEfetiva(
    dadosPgdas.rbt12,
    dadosPgdas.anexo
  );

  if (!reparticaoPercentual) return creditos;

  // Aggregate revenues from items
  let faturamentoTotal = 0;
  let faturamentoMonofasico = 0;
  let faturamentoST = 0;
  const ncmsEncontrados: Set<string> = new Set();

  for (const item of itensSaida) {
    faturamentoTotal += item.valorProduto;

    // Check monophasic
    let isMonofasico = false;
    if (item.cstPis && isMonofasicoPorCst(item.cstPis)) {
      isMonofasico = true;
    } else if (item.cstCofins && isMonofasicoPorCst(item.cstCofins)) {
      isMonofasico = true;
    } else {
      const ncmInfo = verificarNcmMonofasico(item.ncm);
      if (ncmInfo) isMonofasico = true;
    }

    if (isMonofasico) {
      faturamentoMonofasico += item.valorProduto;
      ncmsEncontrados.add(item.ncm);
    }

    // Check ST
    let isComST = false;
    if (item.csosn && isIcmsRecolhidoPorST(item.csosn)) {
      isComST = true;
    } else if (isCfopSaidaComST(item.cfop)) {
      isComST = true;
    }

    if (isComST) {
      faturamentoST += item.valorProduto;
    }
  }

  const fatTotalRef = dadosPgdas.receitaBruta || faturamentoTotal;
  if (fatTotalRef === 0) return creditos;

  const baseIndevida = faturamentoMonofasico + faturamentoST;
  if (baseIndevida === 0) return creditos;

  const proporcao = baseIndevida / fatTotalRef;

  // Use absolute R$ values from PGDAS if available, otherwise estimate
  let pisPago: number;
  let cofinsPago: number;

  if (dadosPgdas.reparticao) {
    pisPago = dadosPgdas.reparticao.pis;
    cofinsPago = dadosPgdas.reparticao.cofins;
  } else {
    // Estimate from aliquota efetiva × receita × percentual
    const dasTotal = fatTotalRef * aliquotaEfetiva;
    pisPago = dasTotal * (reparticaoPercentual.PIS / 100);
    cofinsPago = dasTotal * (reparticaoPercentual.COFINS / 100);
  }

  const pisIndevido = Math.round(pisPago * proporcao * 100) / 100;
  const cofinsIndevido = Math.round(cofinsPago * proporcao * 100) / 100;

  // Credit 1: PIS
  if (pisIndevido > 0.01) {
    creditos.push({
      regra: "SIMPLES_MONO_001",
      tributo: "PIS",
      descricao: `PIS recolhido indevidamente no DAS sobre receita de produtos monofásicos e com ST em ${mes}`,
      baseLegal: "Art. 2º, §1º-A da Lei 10.637/2002",
      valorRecuperavel: pisIndevido,
      confianca: "alta",
      detalhamento: {
        ncm: Array.from(ncmsEncontrados).join(", "),
        mes,
        receitaBase: Math.round(baseIndevida * 100) / 100,
        aliquotaEfetiva,
        percentualTributo: reparticaoPercentual.PIS,
      }
    });
  }

  // Credit 2: COFINS
  if (cofinsIndevido > 0.01) {
    creditos.push({
      regra: "SIMPLES_MONO_001",
      tributo: "COFINS",
      descricao: `COFINS recolhido indevidamente no DAS sobre receita de produtos monofásicos e com ST em ${mes}`,
      baseLegal: "Art. 2º, §1º-A da Lei 10.833/2003",
      valorRecuperavel: cofinsIndevido,
      confianca: "alta",
      detalhamento: {
        ncm: Array.from(ncmsEncontrados).join(", "),
        mes,
        receitaBase: Math.round(baseIndevida * 100) / 100,
        aliquotaEfetiva,
        percentualTributo: reparticaoPercentual.COFINS,
      }
    });
  }

  return creditos;
}

/**
 * Calcula créditos de ICMS-ST usando fórmula proporcional.
 * 
 * Fórmula:
 *   ICMS-ST indevido = ICMS_pago × fat_ST / fat_total
 * 
 * Nota: Apenas faturamento com ST entra aqui (monofásicos NÃO afetam ICMS).
 */
export function calcularCreditoIcmsST(
  itensSaida: ItemNfe[],
  dadosPgdas: DadosPgdas,
  mes: string
): CreditoIdentificado[] {
  const creditos: CreditoIdentificado[] = [];

  const { aliquotaEfetiva, reparticao: reparticaoPercentual } = calcularAliquotaEfetiva(
    dadosPgdas.rbt12,
    dadosPgdas.anexo
  );

  if (!reparticaoPercentual || !reparticaoPercentual.ICMS) return creditos;
  if (reparticaoPercentual.ICMS === 0) return creditos;

  let faturamentoTotal = 0;
  let faturamentoST = 0;

  for (const item of itensSaida) {
    faturamentoTotal += item.valorProduto;

    let isComST = false;
    if (item.csosn && isIcmsRecolhidoPorST(item.csosn)) {
      isComST = true;
    } else if (isCfopSaidaComST(item.cfop)) {
      isComST = true;
    }

    if (isComST) {
      faturamentoST += item.valorProduto;
    }
  }

  const fatTotalRef = dadosPgdas.receitaBruta || faturamentoTotal;
  if (fatTotalRef === 0 || faturamentoST === 0) return creditos;

  const proporcaoST = faturamentoST / fatTotalRef;

  // Use absolute R$ values from PGDAS if available, otherwise estimate
  let icmsPago: number;
  if (dadosPgdas.reparticao) {
    icmsPago = dadosPgdas.reparticao.icms;
  } else {
    const dasTotal = fatTotalRef * aliquotaEfetiva;
    icmsPago = dasTotal * (reparticaoPercentual.ICMS / 100);
  }

  const icmsStIndevido = Math.round(icmsPago * proporcaoST * 100) / 100;

  if (icmsStIndevido > 0.01) {
    creditos.push({
      regra: "SIMPLES_ICMS_ST_001",
      tributo: "ICMS",
      descricao: `ICMS recolhido indevidamente no DAS sobre receita de produtos com ST em ${mes}`,
      baseLegal: "Art. 13, §1º, XIII da LC 123/2006",
      valorRecuperavel: icmsStIndevido,
      confianca: "alta",
      detalhamento: {
        mes,
        receitaBase: Math.round(faturamentoST * 100) / 100,
        aliquotaEfetiva,
        percentualTributo: reparticaoPercentual.ICMS,
      }
    });
  }

  return creditos;
}

export function analisarCreditosSimplesNacional(
  itensSaidaPorMes: Record<string, ItemNfe[]>,
  dadosPgdas: DadosPgdas
): ResultadoAnalise {
  const todosCreditos: CreditoIdentificado[] = [];

  for (const [mes, itens] of Object.entries(itensSaidaPorMes)) {
    const creditosMono = calcularCreditoMonofasico(itens, dadosPgdas, mes);
    todosCreditos.push(...creditosMono);

    const creditosIcmsSt = calcularCreditoIcmsST(itens, dadosPgdas, mes);
    todosCreditos.push(...creditosIcmsSt);
  }

  const totalPis = todosCreditos
    .filter(c => c.tributo === "PIS")
    .reduce((sum, c) => sum + c.valorRecuperavel, 0);

  const totalCofins = todosCreditos
    .filter(c => c.tributo === "COFINS")
    .reduce((sum, c) => sum + c.valorRecuperavel, 0);

  const totalIcms = todosCreditos
    .filter(c => c.tributo === "ICMS")
    .reduce((sum, c) => sum + c.valorRecuperavel, 0);

  const totalPisCofins = totalPis + totalCofins;

  return {
    regime: 'simples_nacional',
    creditos: todosCreditos,
    totalRecuperavel: Math.round((totalPisCofins + totalIcms) * 100) / 100,
    totalPisCofins: Math.round(totalPisCofins * 100) / 100,
    totalIcms: Math.round(totalIcms * 100) / 100,
    regrasBloqueadas: REGRAS_BLOQUEADAS_SIMPLES,
    orientacoes: [
      "Para efetivar a recuperação, é necessário RETIFICAR o PGDAS-D dos períodos afetados, segregando as receitas monofásicas e com ST.",
      "Após a retificação, solicitar restituição ou compensação via PER/DCOMP.",
      "O prazo prescricional para recuperação é de 5 ANOS a partir do pagamento indevido.",
      "A recuperação efetiva deve ser validada e executada por um contador ou advogado tributarista.",
    ]
  };
}
