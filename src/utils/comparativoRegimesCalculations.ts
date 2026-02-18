import { 
  ComparativoRegimesInput, 
  ComparativoRegimesResult, 
  RegimeCalculation, 
  RegimeType, 
  PerfilClientes 
} from "@/types/comparativoRegimes";

// Constantes de cálculo
export const ALIQUOTA_CBS_IBS = 0.265; // 26.5% estimado
export const REDUCAO_DAS_POR_FORA = 0.30; // 30% redução
export const LIMITE_SIMPLES = 4800000; // R$ 4.8M/ano

// Faixas do Simples Nacional (valores anuais)
export const FAIXAS_SIMPLES = [180000, 360000, 720000, 1800000, 3600000, 4800000];

// Alíquotas por anexo e faixa (simplificadas)
export const ALIQUOTAS_SIMPLES = {
  comercio: [0.04, 0.073, 0.095, 0.107, 0.143, 0.19],
  industria: [0.045, 0.078, 0.10, 0.112, 0.147, 0.30],
  servicos: [0.06, 0.112, 0.135, 0.16, 0.21, 0.33],
};

// Presunção para Lucro Presumido
export const PRESUNCAO_LUCRO = {
  comercio: 0.08,
  industria: 0.08,
  servicos: 0.32,
};

// Determina o setor baseado no CNAE (simplificado)
function determinarSetor(cnae: string): 'comercio' | 'industria' | 'servicos' {
  if (!cnae) return 'comercio';
  
  const codigoPrincipal = cnae.replace(/\D/g, '').slice(0, 2);
  const codigoNum = parseInt(codigoPrincipal);
  
  if (codigoNum >= 10 && codigoNum <= 33) return 'industria';
  if (codigoNum >= 45 && codigoNum <= 47) return 'comercio';
  
  return 'servicos';
}

function calcularAliquotaSimples(faturamento: number, setor: 'comercio' | 'industria' | 'servicos', folha: number): number {
  if (faturamento > LIMITE_SIMPLES) return 0;
  
  const aliquotas = ALIQUOTAS_SIMPLES[setor];
  let faixaIndex = 0;
  
  for (let i = 0; i < FAIXAS_SIMPLES.length; i++) {
    if (faturamento <= FAIXAS_SIMPLES[i]) {
      faixaIndex = i;
      break;
    }
    faixaIndex = i;
  }
  
  let aliquota = aliquotas[faixaIndex];
  
  if (setor === 'servicos' && faturamento > 0) {
    const fatorR = folha / faturamento;
    if (fatorR >= 0.28) {
      aliquota = aliquota * 0.85;
    }
  }
  
  return aliquota;
}

function calcularSimplesNacional(input: ComparativoRegimesInput): RegimeCalculation {
  const setor = determinarSetor(input.cnae_principal);
  const aliquota = calcularAliquotaSimples(input.faturamento_anual, setor, input.folha_pagamento);
  const imposto = input.faturamento_anual * aliquota;
  const isElegivel = input.faturamento_anual <= LIMITE_SIMPLES;
  
  return {
    tipo: 'SIMPLES_NACIONAL',
    nome: 'Simples Nacional',
    imposto_anual: isElegivel ? imposto : 0,
    aliquota_efetiva: isElegivel ? aliquota * 100 : 0,
    creditos_gerados: 0,
    vantagem: 'Simplicidade e unificação',
    is_elegivel: isElegivel,
    motivo_inelegibilidade: !isElegivel ? 'Faturamento acima de R$ 4,8 milhões' : undefined,
  };
}

function calcularLucroPresumido(input: ComparativoRegimesInput): RegimeCalculation {
  const setor = determinarSetor(input.cnae_principal);
  const presuncao = PRESUNCAO_LUCRO[setor];
  const basePresumida = input.faturamento_anual * presuncao;
  
  let irpj = basePresumida * 0.15;
  if (basePresumida > 240000) {
    irpj += (basePresumida - 240000) * 0.10;
  }
  
  const csll = basePresumida * 0.09;
  const pisCofins = input.faturamento_anual * 0.0365;
  const impostoTotal = irpj + csll + pisCofins;
  const aliquotaEfetiva = (impostoTotal / input.faturamento_anual) * 100;
  
  return {
    tipo: 'LUCRO_PRESUMIDO',
    nome: 'Lucro Presumido',
    imposto_anual: impostoTotal,
    aliquota_efetiva: aliquotaEfetiva,
    creditos_gerados: 0,
    vantagem: 'Previsibilidade e simplicidade',
    is_elegivel: true,
  };
}

function calcularLucroReal(input: ComparativoRegimesInput): RegimeCalculation {
  const custosMercadorias = input.compras_insumos;
  const despesasOperacionais = input.despesas_operacionais || 0;
  const lucroOperacional = input.faturamento_anual - custosMercadorias - input.folha_pagamento - despesasOperacionais;
  const lucroAjustado = Math.max(0, lucroOperacional);
  
  let irpj = lucroAjustado * 0.15;
  if (lucroAjustado > 240000) {
    irpj += (lucroAjustado - 240000) * 0.10;
  }
  
  const csll = lucroAjustado * 0.09;
  const pisCofinsDebito = input.faturamento_anual * 0.0925;
  const pisCofinsCredito = input.compras_insumos * 0.0925;
  const FATOR_ESSENCIALIDADE = 0.50;
  const pisCofinsCredDespesas = despesasOperacionais * 0.0925 * FATOR_ESSENCIALIDADE;
  const totalCreditos = pisCofinsCredito + pisCofinsCredDespesas;
  const pisCofinsLiquido = Math.max(0, pisCofinsDebito - totalCreditos);
  
  const impostoTotal = irpj + csll + pisCofinsLiquido;
  const aliquotaEfetiva = input.faturamento_anual > 0 
    ? (impostoTotal / input.faturamento_anual) * 100 
    : 0;
  
  return {
    tipo: 'LUCRO_REAL',
    nome: 'Lucro Real',
    imposto_anual: impostoTotal,
    aliquota_efetiva: aliquotaEfetiva,
    creditos_gerados: totalCreditos,
    vantagem: despesasOperacionais > 0 
      ? 'Dedução de despesas e créditos (inclui despesas operacionais c/ fator 50%)' 
      : 'Dedução de despesas e créditos',
    is_elegivel: true,
  };
}

function calcularSimples2027Dentro(input: ComparativoRegimesInput): RegimeCalculation {
  const setor = determinarSetor(input.cnae_principal);
  const aliquota = calcularAliquotaSimples(input.faturamento_anual, setor, input.folha_pagamento);
  const imposto = input.faturamento_anual * aliquota;
  const isElegivel = input.faturamento_anual <= LIMITE_SIMPLES;
  
  return {
    tipo: 'SIMPLES_2027_DENTRO',
    nome: 'Simples 2027 ("Por Dentro")',
    imposto_anual: isElegivel ? imposto : 0,
    aliquota_efetiva: isElegivel ? aliquota * 100 : 0,
    creditos_gerados: 0,
    vantagem: 'Simplicidade mantida',
    is_elegivel: isElegivel,
    motivo_inelegibilidade: !isElegivel ? 'Faturamento acima de R$ 4,8 milhões' : undefined,
  };
}

function calcularSimples2027Fora(input: ComparativoRegimesInput): RegimeCalculation {
  const setor = determinarSetor(input.cnae_principal);
  const aliquotaSimples = calcularAliquotaSimples(input.faturamento_anual, setor, input.folha_pagamento);
  const isElegivel = input.faturamento_anual <= LIMITE_SIMPLES;
  
  if (!isElegivel) {
    return {
      tipo: 'SIMPLES_2027_FORA',
      nome: 'Simples 2027 ("Por Fora")',
      imposto_anual: 0,
      aliquota_efetiva: 0,
      creditos_gerados: 0,
      vantagem: 'Geração de créditos IBS/CBS',
      is_elegivel: false,
      motivo_inelegibilidade: 'Faturamento acima de R$ 4,8 milhões',
    };
  }
  
  const dasReduzido = input.faturamento_anual * aliquotaSimples * (1 - REDUCAO_DAS_POR_FORA);
  const ibsCbsDevido = input.faturamento_anual * ALIQUOTA_CBS_IBS;
  const ibsCbsCredito = input.compras_insumos * ALIQUOTA_CBS_IBS;
  const ibsCbsLiquido = Math.max(0, ibsCbsDevido - ibsCbsCredito);
  
  const impostoTotal = dasReduzido + ibsCbsLiquido;
  const aliquotaEfetiva = input.faturamento_anual > 0 
    ? (impostoTotal / input.faturamento_anual) * 100 
    : 0;
  
  return {
    tipo: 'SIMPLES_2027_FORA',
    nome: 'Simples 2027 ("Por Fora")',
    imposto_anual: impostoTotal,
    aliquota_efetiva: aliquotaEfetiva,
    creditos_gerados: ibsCbsCredito,
    vantagem: 'Geração de créditos IBS/CBS',
    is_elegivel: true,
  };
}

function gerarJustificativa(recomendado: RegimeType, perfil: PerfilClientes, regimes: RegimeCalculation[]): string {
  const justificativas: Record<RegimeType, string> = {
    'SIMPLES_2027_FORA': perfil === 'B2B' 
      ? 'Como você vende principalmente para outras empresas (B2B), a geração de créditos IBS/CBS torna sua empresa mais competitiva. Seus clientes poderão aproveitar os créditos gerados, o que pode ser um diferencial comercial.'
      : 'Mesmo vendendo para consumidor final, seu alto volume de compras de insumos gera economia significativa via créditos de IBS/CBS, compensando a complexidade adicional.',
    'SIMPLES_2027_DENTRO': 'A simplicidade do regime unificado é ideal para o seu modelo de negócio. Como você vende principalmente para consumidor final (B2C), seus clientes não aproveitariam os créditos, então o regime "por dentro" oferece menor burocracia sem perda de competitividade.',
    'LUCRO_REAL': 'Com sua estrutura de custos e margem, o Lucro Real permite deduzir uma gama maior de despesas e aproveitar créditos de PIS/COFINS, resultando em menor carga tributária líquida.',
    'LUCRO_PRESUMIDO': 'Para sua atividade e estrutura de custos, a alíquota fixa de presunção do Lucro Presumido oferece a menor carga tributária com boa previsibilidade e menor complexidade operacional.',
    'SIMPLES_NACIONAL': 'O Simples Nacional atual continua sendo a opção mais econômica para seu perfil de faturamento e atividade, oferecendo simplicidade e alíquota unificada.',
  };
  
  return justificativas[recomendado] || 'Análise baseada nos dados informados.';
}

// Função principal de cálculo
export function calcularComparativoRegimes(input: ComparativoRegimesInput): ComparativoRegimesResult {
  const regimes: RegimeCalculation[] = [
    calcularSimplesNacional(input),
    calcularLucroPresumido(input),
    calcularLucroReal(input),
    calcularSimples2027Dentro(input),
    calcularSimples2027Fora(input),
  ];
  
  const regimesElegiveis = regimes.filter(r => r.is_elegivel);
  const ordenados = [...regimesElegiveis].sort((a, b) => a.imposto_anual - b.imposto_anual);
  
  const recomendado = ordenados[0]?.tipo || 'SIMPLES_NACIONAL';
  const segundoMelhor = ordenados[1];
  
  const economiaVsSegundo = segundoMelhor 
    ? segundoMelhor.imposto_anual - ordenados[0].imposto_anual 
    : 0;
  
  const justificativa = gerarJustificativa(recomendado, input.perfil_clientes, regimes);
  
  return {
    regimes,
    recomendado,
    economia_vs_segundo: economiaVsSegundo,
    justificativa,
    disclaimer: 'Os valores para "Simples 2027" são simulações baseadas no cenário atual da Reforma Tributária (LC 214/2025) e podem sofrer alterações conforme regulamentação futura. Consulte um contador para decisões definitivas.',
  };
}

// Formata valor em reais
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

// Formata percentual
export function formatarPercentual(valor: number): string {
  return `${valor.toFixed(1)}%`;
}

// Nomes amigáveis dos regimes
export const NOMES_REGIMES: Record<RegimeType, string> = {
  'SIMPLES_NACIONAL': 'Simples Nacional',
  'LUCRO_PRESUMIDO': 'Lucro Presumido',
  'LUCRO_REAL': 'Lucro Real',
  'SIMPLES_2027_DENTRO': 'Simples 2027 ("Por Dentro")',
  'SIMPLES_2027_FORA': 'Simples 2027 ("Por Fora")',
};
