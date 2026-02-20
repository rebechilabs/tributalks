import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// NCMs com regimes especiais na Reforma Tributária (CBS/IBS/IS)
const NCM_REGRAS_REFORMA = {
  impostoSeletivo: {
    combustiveis: ['2710', '2711'],
    bebidas_alcoolicas: ['2203', '2204', '2205', '2206', '2207', '2208'],
    bebidas_acucaradas: ['2202'],
    cigarros_tabaco: ['2401', '2402', '2403'],
    veiculos: ['8702', '8703', '8704', '8711'],
    embarcacoes_aeronaves: ['8901', '8802', '8803'],
    minerais: ['2601', '2602', '2603', '2604', '2605', '2606', '2607', '2608', '2609', '2610', '2611', '2612', '2613', '2614', '2615', '2616', '2617', '2618', '2619', '2620', '2621'],
  },
  aliquotaReduzida60: {
    medicamentos: ['3001', '3002', '3003', '3004', '3005', '3006'],
    equipamentos_medicos: ['9018', '9019', '9020', '9021', '9022'],
    educacao: ['4901', '4902', '4903', '4904'],
    alimentos_basicos: ['0201', '0202', '0203', '0204', '0207', '0301', '0302', '0303', '0304', '0305', '0306', '0307', '0401', '0402', '0403', '0404', '0405', '0406', '0407', '0408', '0701', '0702', '0703', '0704', '0705', '0706', '0707', '0708', '0709', '0710', '0711', '0712', '0713', '0714', '0803', '0804', '0805', '0806', '0807', '0808', '0809', '0810', '0901', '1001', '1002', '1003', '1004', '1005', '1006', '1007', '1101', '1102', '1103', '1104', '1901', '1902', '1903', '1904', '1905'],
    produtos_higiene: ['3401', '3402', '3304', '3305', '3306', '3307'],
    produtos_limpeza: ['3401', '3402'],
  },
  isencao: {
    cesta_basica_nacional: ['0713.10', '0713.20', '0713.31', '0713.32', '0713.33', '0713.39', '0713.40', '0713.50', '0713.60', '0713.90', '1006.20', '1006.30', '1902.11', '1902.19'],
    medicamentos_essenciais: ['3003', '3004'],
  }
};

// ============= CFOP ANALYSIS =============
// Regras de classificação de CFOP para a Reforma Tributária

// Entradas com direito a crédito de CBS/IBS
const CFOP_ENTRADAS_CREDITO = {
  compra_revenda: ['1102', '2102', '1403', '2403'], // Compra para comercialização
  compra_industrializacao: ['1101', '2101', '1401', '2401'], // Compra para industrialização
  compra_ativo: ['1551', '2551', '1406', '2406'], // Ativo imobilizado (crédito em 48 meses)
  compra_uso_consumo: ['1556', '2556', '1407', '2407'], // Uso e consumo (crédito a partir de 2027)
  energia_telecom: ['1252', '1253', '1352', '1353'], // Energia e telecomunicações
  transporte_frete: ['1352', '1353', '2352', '2353', '1932', '2932'], // Frete sobre compras
  servicos_tomados: ['1933', '2933', '1949', '2949'], // Serviços tomados
};

// Saídas - vendas normais
const CFOP_SAIDAS_TRIBUTADAS = {
  venda_mercadoria: ['5102', '6102', '5403', '6403'], // Venda de mercadoria
  venda_producao: ['5101', '6101', '5401', '6401'], // Venda de produção própria
  prestacao_servico: ['5933', '6933'], // Prestação de serviço
};

// Saídas para consumidor final (regras específicas de IBS)
const CFOP_CONSUMIDOR_FINAL = ['5405', '6405', '5929', '6929'];

// Devoluções (anulam créditos/débitos)
const CFOP_DEVOLUCAO = {
  devolucao_compra: ['5201', '5202', '5208', '5209', '5210', '5410', '5411', '5412', '6201', '6202', '6208', '6209', '6210', '6410', '6411', '6412'],
  devolucao_venda: ['1201', '1202', '1203', '1204', '1410', '1411', '2201', '2202', '2203', '2204', '2410', '2411'],
};

// Operações interestaduais (split payment de IBS)
const CFOP_INTERESTADUAL = ['2', '6']; // Começa com 2 (entrada) ou 6 (saída)

// Transferências (atenção na Reforma - não geram crédito entre estabelecimentos)
const CFOP_TRANSFERENCIA = ['5151', '5152', '5153', '5155', '5156', '5409', '6151', '6152', '6153', '6155', '6156', '6409', '1151', '1152', '1153', '1154', '1408', '2151', '2152', '2153', '2154', '2408'];

// Exportação (imunes de CBS/IBS, mas mantêm crédito)
const CFOP_EXPORTACAO = ['7101', '7102', '7105', '7106', '7127', '7501', '7551', '7553'];

// Importação (tributação na entrada)
const CFOP_IMPORTACAO = ['3101', '3102', '3127', '3201', '3202', '3211', '3251', '3301', '3351', '3352', '3353', '3551', '3556'];

interface CfopClassification {
  tipo: 'entrada_credito' | 'saida_tributada' | 'consumidor_final' | 'devolucao' | 'transferencia' | 'exportacao' | 'importacao' | 'outro';
  alerta: string | null;
  interestadual: boolean;
}

function classificarCfop(cfop: string): CfopClassification {
  const cfopClean = cfop?.replace(/\D/g, '') || '';
  if (cfopClean.length < 4) {
    return { tipo: 'outro', alerta: null, interestadual: false };
  }

  const primeiroDigito = cfopClean[0];
  const interestadual = primeiroDigito === '2' || primeiroDigito === '6';

  // Exportação
  if (CFOP_EXPORTACAO.includes(cfopClean)) {
    return { tipo: 'exportacao', alerta: 'Operação de exportação - imune de CBS/IBS, mantém direito a crédito.', interestadual: false };
  }

  // Importação
  if (CFOP_IMPORTACAO.includes(cfopClean) || primeiroDigito === '3') {
    return { tipo: 'importacao', alerta: 'Importação - CBS/IBS devidos na entrada. Verificar split payment.', interestadual: false };
  }

  // Devoluções
  for (const cfops of Object.values(CFOP_DEVOLUCAO)) {
    if (cfops.includes(cfopClean)) {
      return { tipo: 'devolucao', alerta: 'Devolução - anula crédito/débito original. Verificar estorno no ERP.', interestadual };
    }
  }

  // Transferências
  if (CFOP_TRANSFERENCIA.includes(cfopClean)) {
    return { tipo: 'transferencia', alerta: 'Transferência entre estabelecimentos - não gera crédito de CBS/IBS na Reforma. Revisar parametrização.', interestadual };
  }

  // Consumidor final
  if (CFOP_CONSUMIDOR_FINAL.includes(cfopClean)) {
    return { tipo: 'consumidor_final', alerta: 'Venda para consumidor final - IBS devido integralmente no destino (split payment).', interestadual };
  }

  // Entradas com crédito
  for (const [tipo, cfops] of Object.entries(CFOP_ENTRADAS_CREDITO)) {
    if (cfops.includes(cfopClean)) {
      let alerta = null;
      if (tipo === 'compra_ativo') {
        alerta = 'Ativo imobilizado - crédito de CBS/IBS em 48 parcelas mensais.';
      } else if (tipo === 'compra_uso_consumo') {
        alerta = 'Uso e consumo - crédito de CBS/IBS só a partir de 2027.';
      } else if (tipo === 'energia_telecom') {
        alerta = 'Energia/Telecom - verificar proporcionalidade do crédito conforme atividade.';
      }
      return { tipo: 'entrada_credito', alerta, interestadual };
    }
  }

  // Saídas tributadas
  for (const cfops of Object.values(CFOP_SAIDAS_TRIBUTADAS)) {
    if (cfops.includes(cfopClean)) {
      let alerta = null;
      if (interestadual) {
        alerta = 'Operação interestadual - IBS dividido entre origem e destino (split payment).';
      }
      return { tipo: 'saida_tributada', alerta, interestadual };
    }
  }

  // Operações gerais por primeiro dígito
  if (primeiroDigito === '1' || primeiroDigito === '2') {
    return { tipo: 'entrada_credito', alerta: interestadual ? 'Entrada interestadual - verificar crédito de IBS.' : null, interestadual };
  }
  if (primeiroDigito === '5' || primeiroDigito === '6') {
    return { tipo: 'saida_tributada', alerta: interestadual ? 'Saída interestadual - split payment de IBS aplicável.' : null, interestadual };
  }

  return { tipo: 'outro', alerta: null, interestadual };
}

interface RawProduct {
  ncm: string;
  descricao: string;
  valorTotal: number;
  cfop: string;
  cst_icms?: string;
  quantidade?: number;
}

interface XmlAnalysisRow {
  id: string;
  user_id: string;
  raw_data: {
    produtos?: RawProduct[];
    totalProdutos?: number;
    totalNota?: number;
  } | null;
  document_total: number;
}

interface NcmAggregation {
  ncm_code: string;
  product_name: string;
  total_value: number;
  count: number;
  cfops: Map<string, number>;
  alertas_cfop: Set<string>;
  tipos_operacao: Set<string>;
}

interface NcmClassification {
  status: 'ok' | 'revisar_ncm' | 'revisar_tributacao' | 'incompleto' | 'regime_especial';
  reason: string;
  suggested_action: string;
}

function classificarNcm(ncmCode: string, productName: string): NcmClassification {
  if (!ncmCode || ncmCode.trim() === '' || ncmCode.length < 4) {
    return {
      status: 'incompleto',
      reason: 'NCM ausente ou inválido nas notas.',
      suggested_action: 'Verificar cadastro do produto no ERP e incluir NCM correto.',
    };
  }

  const ncmPrefix = ncmCode.substring(0, 4);
  const ncmPrefix6 = ncmCode.substring(0, 6);
  const ncmPrefix8 = ncmCode.substring(0, 8);

  for (const [categoria, prefixos] of Object.entries(NCM_REGRAS_REFORMA.impostoSeletivo)) {
    if (prefixos.some(p => ncmCode.startsWith(p) || ncmPrefix.startsWith(p))) {
      const categoriaFormatada = categoria.replace(/_/g, ' ');
      return {
        status: 'revisar_tributacao',
        reason: `NCM sujeito a Imposto Seletivo (categoria: ${categoriaFormatada}). Alíquota adicional será aplicada.`,
        suggested_action: `Parametrizar alíquota de IS para ${categoriaFormatada} no ERP. Avaliar impacto no preço de venda.`,
      };
    }
  }

  for (const [categoria, prefixos] of Object.entries(NCM_REGRAS_REFORMA.aliquotaReduzida60)) {
    if (prefixos.some(p => ncmCode.startsWith(p) || ncmPrefix.startsWith(p))) {
      const categoriaFormatada = categoria.replace(/_/g, ' ');
      return {
        status: 'revisar_tributacao',
        reason: `NCM com alíquota reduzida de CBS/IBS (60% da alíquota padrão). Categoria: ${categoriaFormatada}.`,
        suggested_action: `Configurar regra de alíquota reduzida para ${categoriaFormatada} no ERP.`,
      };
    }
  }

  for (const [categoria, prefixos] of Object.entries(NCM_REGRAS_REFORMA.isencao)) {
    if (prefixos.some(p => ncmCode.startsWith(p) || ncmPrefix6.startsWith(p.replace('.', '')) || ncmPrefix8.startsWith(p.replace('.', '')))) {
      const categoriaFormatada = categoria.replace(/_/g, ' ');
      return {
        status: 'revisar_tributacao',
        reason: `NCM com possível isenção ou alíquota zero de CBS/IBS. Categoria: ${categoriaFormatada}.`,
        suggested_action: `Verificar enquadramento na lista de isenção para ${categoriaFormatada}. Configurar no ERP.`,
      };
    }
  }

  return {
    status: 'ok',
    reason: 'NCM sem alerta relevante para a Reforma. Tributação padrão de CBS/IBS.',
    suggested_action: '',
  };
}

function determinarTipoOperacao(tipos: Set<string>): string {
  const tiposArray = Array.from(tipos);
  if (tiposArray.length === 0) return 'indefinido';
  if (tiposArray.length === 1) return tiposArray[0];
  
  // Se tem entrada e saída, é misto
  const temEntrada = tiposArray.some(t => ['entrada_credito', 'importacao'].includes(t));
  const temSaida = tiposArray.some(t => ['saida_tributada', 'consumidor_final', 'exportacao'].includes(t));
  
  if (temEntrada && temSaida) return 'misto';
  if (temEntrada) return 'entrada';
  if (temSaida) return 'saida';
  
  return 'misto';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autorização não fornecido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log(`[analyze-ncm] Iniciando análise para usuário: ${userId}`);

    const { data: xmlAnalysisData, error: xmlError } = await supabase
      .from('xml_analysis')
      .select('id, user_id, raw_data, document_total')
      .eq('user_id', userId);

    if (xmlError) {
      console.error('[analyze-ncm] Erro ao buscar XMLs:', xmlError);
      throw new Error(`Erro ao buscar XMLs: ${xmlError.message}`);
    }

    if (!xmlAnalysisData || xmlAnalysisData.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhum XML encontrado para análise',
          stats: { xmls_processed: 0, ncms_found: 0, ncms_created: 0 }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[analyze-ncm] XMLs encontrados: ${xmlAnalysisData.length}`);

    // Agregar NCMs + CFOPs dos produtos
    const ncmAggregations = new Map<string, NcmAggregation>();
    let totalFaturamento = 0;
    let totalOperacoesInterestaduais = 0;
    let totalDevolucoes = 0;
    let totalTransferencias = 0;

    for (const xml of xmlAnalysisData as XmlAnalysisRow[]) {
      if (!xml.raw_data?.produtos) continue;

      for (const produto of xml.raw_data.produtos) {
        const ncmCode = String(produto.ncm || '').replace(/\D/g, '').substring(0, 8);
        const cfop = String(produto.cfop || '').replace(/\D/g, '');
        const valor = Number(produto.valorTotal) || 0;
        totalFaturamento += valor;

        // Classificar CFOP
        const cfopClass = classificarCfop(cfop);
        if (cfopClass.interestadual) totalOperacoesInterestaduais++;
        if (cfopClass.tipo === 'devolucao') totalDevolucoes++;
        if (cfopClass.tipo === 'transferencia') totalTransferencias++;

        if (ncmAggregations.has(ncmCode)) {
          const existing = ncmAggregations.get(ncmCode)!;
          existing.total_value += valor;
          existing.count += 1;
          
          // Agregar CFOPs
          existing.cfops.set(cfop, (existing.cfops.get(cfop) || 0) + 1);
          existing.tipos_operacao.add(cfopClass.tipo);
          if (cfopClass.alerta) {
            existing.alertas_cfop.add(cfopClass.alerta);
          }
        } else {
          const cfopsMap = new Map<string, number>();
          cfopsMap.set(cfop, 1);
          
          const alertas = new Set<string>();
          if (cfopClass.alerta) alertas.add(cfopClass.alerta);
          
          const tipos = new Set<string>();
          tipos.add(cfopClass.tipo);

          ncmAggregations.set(ncmCode, {
            ncm_code: ncmCode,
            product_name: produto.descricao || `NCM ${ncmCode}`,
            total_value: valor,
            count: 1,
            cfops: cfopsMap,
            alertas_cfop: alertas,
            tipos_operacao: tipos,
          });
        }
      }
    }

    console.log(`[analyze-ncm] NCMs únicos encontrados: ${ncmAggregations.size}`);
    console.log(`[analyze-ncm] Operações interestaduais: ${totalOperacoesInterestaduais}`);
    console.log(`[analyze-ncm] Devoluções: ${totalDevolucoes}`);
    console.log(`[analyze-ncm] Transferências: ${totalTransferencias}`);

    // Limpar análises anteriores
    const { error: deleteError } = await supabase
      .from('company_ncm_analysis')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('[analyze-ncm] Erro ao limpar análises anteriores:', deleteError);
    }

    // Classificar e inserir NCMs com dados de CFOP
    const ncmRecords: Array<{
      user_id: string;
      ncm_code: string;
      product_name: string;
      status: string;
      reason: string | null;
      suggested_action: string | null;
      revenue_percentage: number;
      cfops_frequentes: string[];
      tipo_operacao: string;
      qtd_operacoes: number;
      alerta_cfop: string | null;
    }> = [];

    for (const [ncmCode, aggregation] of ncmAggregations) {
      const classification = classificarNcm(ncmCode, aggregation.product_name);
      const revenuePercentage = totalFaturamento > 0 
        ? (aggregation.total_value / totalFaturamento) * 100 
        : 0;

      // Pegar os 5 CFOPs mais frequentes
      const cfopsOrdenados = Array.from(aggregation.cfops.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cfop]) => cfop)
        .filter(cfop => cfop && cfop.length >= 4);

      // Combinar alertas de CFOP
      const alertasCfop = Array.from(aggregation.alertas_cfop);
      const alertaCfopCombinado = alertasCfop.length > 0 
        ? alertasCfop.slice(0, 3).join(' | ') 
        : null;

      // Se há alertas de CFOP importantes, pode elevar o status
      let statusFinal = classification.status;
      let reasonFinal = classification.reason;
      
      if (classification.status === 'ok' && alertasCfop.length > 0) {
        // Se NCM está ok mas CFOP tem alertas, marcar para revisão
        const temAlertaCritico = alertasCfop.some(a => 
          a.includes('transferência') || 
          a.includes('split payment') || 
          a.includes('48 parcelas')
        );
        if (temAlertaCritico) {
          statusFinal = 'revisar_tributacao';
          reasonFinal = `NCM ok, mas operações requerem atenção: ${alertasCfop[0]}`;
        }
      }

      ncmRecords.push({
        user_id: userId,
        ncm_code: ncmCode,
        product_name: aggregation.product_name,
        status: statusFinal,
        reason: reasonFinal || null,
        suggested_action: classification.suggested_action || null,
        revenue_percentage: Math.round(revenuePercentage * 100) / 100,
        cfops_frequentes: cfopsOrdenados,
        tipo_operacao: determinarTipoOperacao(aggregation.tipos_operacao),
        qtd_operacoes: aggregation.count,
        alerta_cfop: alertaCfopCombinado,
      });
    }

    // Inserir registros
    if (ncmRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('company_ncm_analysis')
        .insert(ncmRecords);

      if (insertError) {
        console.error('[analyze-ncm] Erro ao inserir análises:', insertError);
        throw new Error(`Erro ao inserir análises: ${insertError.message}`);
      }
    }

    // Estatísticas
    const criticalCount = ncmRecords.filter(r => r.status !== 'ok').length;
    const criticalRevenuePercentage = ncmRecords
      .filter(r => r.status !== 'ok')
      .reduce((acc, r) => acc + r.revenue_percentage, 0);

    const stats = {
      xmls_processed: xmlAnalysisData.length,
      ncms_found: ncmRecords.length,
      ncms_created: ncmRecords.length,
      ncms_ok: ncmRecords.filter(r => r.status === 'ok').length,
      ncms_critical: criticalCount,
      total_faturamento: totalFaturamento,
      critical_revenue_percentage: Math.round(criticalRevenuePercentage * 100) / 100,
      operacoes_interestaduais: totalOperacoesInterestaduais,
      devolucoes: totalDevolucoes,
      transferencias: totalTransferencias,
    };

    console.log(`[analyze-ncm] Análise concluída:`, stats);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Análise de NCM + CFOP concluída. ${ncmRecords.length} NCMs analisados, ${criticalCount} requerem atenção. ${totalOperacoesInterestaduais} operações interestaduais detectadas.`,
        stats 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[analyze-ncm] Erro:', error);
    return new Response(
      JSON.stringify({ error: 'Ocorreu um erro ao processar sua solicitação.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
