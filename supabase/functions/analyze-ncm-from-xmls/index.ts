import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// NCMs com regimes especiais na Reforma Tributária (CBS/IBS/IS)
// Estrutura preparada para futura migração para tabela ncm_reforma_rules
const NCM_REGRAS_REFORMA = {
  // Imposto Seletivo - produtos nocivos à saúde e meio ambiente
  impostoSeletivo: {
    combustiveis: ['2710', '2711'], // Petróleo, gás
    bebidas_alcoolicas: ['2203', '2204', '2205', '2206', '2207', '2208'], // Cervejas, vinhos, destilados
    bebidas_acucaradas: ['2202'], // Refrigerantes
    cigarros_tabaco: ['2401', '2402', '2403'], // Tabaco e cigarros
    veiculos: ['8702', '8703', '8704', '8711'], // Automóveis, motos
    embarcacoes_aeronaves: ['8901', '8802', '8803'], // Barcos, aviões
    minerais: ['2601', '2602', '2603', '2604', '2605', '2606', '2607', '2608', '2609', '2610', '2611', '2612', '2613', '2614', '2615', '2616', '2617', '2618', '2619', '2620', '2621'], // Minérios
  },
  // Alíquota reduzida (60%) - saúde, educação, cultura
  aliquotaReduzida60: {
    medicamentos: ['3001', '3002', '3003', '3004', '3005', '3006'],
    equipamentos_medicos: ['9018', '9019', '9020', '9021', '9022'],
    educacao: ['4901', '4902', '4903', '4904'], // Livros, jornais
    alimentos_basicos: ['0201', '0202', '0203', '0204', '0207', '0301', '0302', '0303', '0304', '0305', '0306', '0307', '0401', '0402', '0403', '0404', '0405', '0406', '0407', '0408', '0701', '0702', '0703', '0704', '0705', '0706', '0707', '0708', '0709', '0710', '0711', '0712', '0713', '0714', '0803', '0804', '0805', '0806', '0807', '0808', '0809', '0810', '0901', '1001', '1002', '1003', '1004', '1005', '1006', '1007', '1101', '1102', '1103', '1104', '1901', '1902', '1903', '1904', '1905'],
    produtos_higiene: ['3401', '3402', '3304', '3305', '3306', '3307'],
    produtos_limpeza: ['3401', '3402'],
  },
  // Isenção ou alíquota zero
  isencao: {
    cesta_basica_nacional: ['0713.10', '0713.20', '0713.31', '0713.32', '0713.33', '0713.39', '0713.40', '0713.50', '0713.60', '0713.90', '1006.20', '1006.30', '1902.11', '1902.19'],
    medicamentos_essenciais: ['3003', '3004'],
  }
};

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
}

interface NcmClassification {
  status: 'ok' | 'revisar_ncm' | 'revisar_tributacao' | 'incompleto' | 'regime_especial';
  reason: string;
  suggested_action: string;
}

// Classifica NCM baseado nas regras da Reforma
function classificarNcm(ncmCode: string, productName: string): NcmClassification {
  // Verifica se NCM está vazio ou inválido
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

  // Verifica Imposto Seletivo
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

  // Verifica alíquota reduzida 60%
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

  // Verifica isenção
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

  // NCM sem alerta específico
  return {
    status: 'ok',
    reason: 'NCM sem alerta relevante para a Reforma. Tributação padrão de CBS/IBS.',
    suggested_action: '',
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar autenticação
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

    // Verificar usuário
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

    // 1. Buscar XMLs analisados do usuário
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

    // 2. Agregar NCMs dos produtos
    const ncmAggregations = new Map<string, NcmAggregation>();
    let totalFaturamento = 0;

    for (const xml of xmlAnalysisData as XmlAnalysisRow[]) {
      if (!xml.raw_data?.produtos) continue;

      for (const produto of xml.raw_data.produtos) {
        const ncmCode = String(produto.ncm || '').replace(/\D/g, '').substring(0, 8);
        const valor = Number(produto.valorTotal) || 0;
        totalFaturamento += valor;

        if (ncmAggregations.has(ncmCode)) {
          const existing = ncmAggregations.get(ncmCode)!;
          existing.total_value += valor;
          existing.count += 1;
          // Manter a descrição mais comum (primeira encontrada)
        } else {
          ncmAggregations.set(ncmCode, {
            ncm_code: ncmCode,
            product_name: produto.descricao || `NCM ${ncmCode}`,
            total_value: valor,
            count: 1,
          });
        }
      }
    }

    console.log(`[analyze-ncm] NCMs únicos encontrados: ${ncmAggregations.size}`);
    console.log(`[analyze-ncm] Faturamento total: ${totalFaturamento}`);

    // 3. Limpar análises anteriores do usuário
    const { error: deleteError } = await supabase
      .from('company_ncm_analysis')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('[analyze-ncm] Erro ao limpar análises anteriores:', deleteError);
    }

    // 4. Classificar e inserir NCMs
    const ncmRecords: Array<{
      user_id: string;
      ncm_code: string;
      product_name: string;
      status: string;
      reason: string | null;
      suggested_action: string | null;
      revenue_percentage: number;
    }> = [];

    for (const [ncmCode, aggregation] of ncmAggregations) {
      const classification = classificarNcm(ncmCode, aggregation.product_name);
      const revenuePercentage = totalFaturamento > 0 
        ? (aggregation.total_value / totalFaturamento) * 100 
        : 0;

      ncmRecords.push({
        user_id: userId,
        ncm_code: ncmCode,
        product_name: aggregation.product_name,
        status: classification.status,
        reason: classification.reason || null,
        suggested_action: classification.suggested_action || null,
        revenue_percentage: Math.round(revenuePercentage * 100) / 100,
      });
    }

    // 5. Inserir registros em batch
    if (ncmRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('company_ncm_analysis')
        .insert(ncmRecords);

      if (insertError) {
        console.error('[analyze-ncm] Erro ao inserir análises:', insertError);
        throw new Error(`Erro ao inserir análises: ${insertError.message}`);
      }
    }

    // 6. Calcular estatísticas
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
    };

    console.log(`[analyze-ncm] Análise concluída:`, stats);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Análise de NCM concluída. ${ncmRecords.length} NCMs analisados, ${criticalCount} requerem atenção.`,
        stats 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[analyze-ncm] Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno ao analisar NCMs';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
