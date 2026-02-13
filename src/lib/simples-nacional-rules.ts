// src/lib/simples-nacional-rules.ts
// Motor de cálculo de créditos para Simples Nacional

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

export function calcularCreditoMonofasico(
  itensSaida: ItemNfe[],
  dadosPgdas: DadosPgdas,
  mes: string
): CreditoIdentificado[] {
  const creditos: CreditoIdentificado[] = [];

  const { aliquotaEfetiva, reparticao } = calcularAliquotaEfetiva(
    dadosPgdas.rbt12,
    dadosPgdas.anexo
  );

  if (!reparticao) return creditos;

  const percentualPis = reparticao.PIS;
  const percentualCofins = reparticao.COFINS;
  const percentualPisCofins = percentualPis + percentualCofins;

  let receitaMonofasica = 0;
  const ncmsEncontrados: Set<string> = new Set();

  for (const item of itensSaida) {
    let isMonofasico = false;

    if (item.cstPis && isMonofasicoPorCst(item.cstPis)) {
      isMonofasico = true;
    } else if (item.cstCofins && isMonofasicoPorCst(item.cstCofins)) {
      isMonofasico = true;
    } else {
      const ncmInfo = verificarNcmMonofasico(item.ncm);
      if (ncmInfo) {
        isMonofasico = true;
      }
    }

    if (isMonofasico) {
      receitaMonofasica += item.valorProduto;
      ncmsEncontrados.add(item.ncm);
    }
  }

  if (receitaMonofasica > 0) {
    const valorRecuperavel = receitaMonofasica * aliquotaEfetiva * (percentualPisCofins / 100);

    creditos.push({
      regra: "SIMPLES_MONO_001",
      tributo: "PIS/COFINS",
      descricao: `PIS e COFINS pagos indevidamente no DAS sobre receita de produtos monofásicos em ${mes}`,
      baseLegal: "LC 123/2006, art. 18, §4º-A, inciso I; Leis 10.147/2000, 10.485/2002, 13.097/2015",
      valorRecuperavel: Math.round(valorRecuperavel * 100) / 100,
      confianca: "alta",
      detalhamento: {
        ncm: Array.from(ncmsEncontrados).join(", "),
        mes,
        receitaBase: Math.round(receitaMonofasica * 100) / 100,
        aliquotaEfetiva,
        percentualTributo: percentualPisCofins,
      }
    });
  }

  return creditos;
}

export function calcularCreditoIcmsST(
  itensSaida: ItemNfe[],
  dadosPgdas: DadosPgdas,
  mes: string
): CreditoIdentificado[] {
  const creditos: CreditoIdentificado[] = [];

  const { aliquotaEfetiva, reparticao } = calcularAliquotaEfetiva(
    dadosPgdas.rbt12,
    dadosPgdas.anexo
  );

  if (!reparticao || !reparticao.ICMS) return creditos;
  if (reparticao.ICMS === 0) return creditos;

  const percentualIcms = reparticao.ICMS;

  let receitaComST = 0;

  for (const item of itensSaida) {
    let isComST = false;

    if (item.csosn && isIcmsRecolhidoPorST(item.csosn)) {
      isComST = true;
    } else if (isCfopSaidaComST(item.cfop)) {
      isComST = true;
    }

    if (isComST) {
      receitaComST += item.valorProduto;
    }
  }

  if (receitaComST > 0) {
    const valorRecuperavel = receitaComST * aliquotaEfetiva * (percentualIcms / 100);

    creditos.push({
      regra: "SIMPLES_ICMS_ST_001",
      tributo: "ICMS",
      descricao: `ICMS pago indevidamente no DAS sobre receita de produtos com ST em ${mes}`,
      baseLegal: "LC 123/2006, art. 18, §4º-A, inciso IV",
      valorRecuperavel: Math.round(valorRecuperavel * 100) / 100,
      confianca: "alta",
      detalhamento: {
        mes,
        receitaBase: Math.round(receitaComST * 100) / 100,
        aliquotaEfetiva,
        percentualTributo: percentualIcms,
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

  const totalPisCofins = todosCreditos
    .filter(c => c.tributo === "PIS/COFINS")
    .reduce((sum, c) => sum + c.valorRecuperavel, 0);

  const totalIcms = todosCreditos
    .filter(c => c.tributo === "ICMS")
    .reduce((sum, c) => sum + c.valorRecuperavel, 0);

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
