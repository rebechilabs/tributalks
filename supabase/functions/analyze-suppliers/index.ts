import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://tributalks.com.br",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Alíquota de crédito IBS/CBS estimada por regime tributário do fornecedor
// Lucro Real: crédito pleno (26,5%)
// Presumido: PIS/COFINS cumulativo (~9,25%), sem IBS
// Simples: transfere crédito limitado do DAS (~3,5%)
// MEI: não gera crédito
function calcularAliquotaCredito(regime: string): number {
  const r = (regime || '').toLowerCase();
  if (r.includes('real')) return 26.5;
  if (r.includes('presumido')) return 9.25;
  if (r.includes('simples')) return 3.5;
  if (r.includes('mei')) return 0;
  return 9.25; // Default conservador
}

// Score 0-100: quanto mais alto, maior a perda de crédito (pior fornecedor)
function calcularCustoEfetivoScore(totalCompras: number, aliquotaCredito: number): number {
  if (totalCompras <= 0) return 0;
  const creditoPerdidoPercent = 26.5 - aliquotaCredito;
  const score = (creditoPerdidoPercent / 26.5) * 100;
  return Math.round(Math.min(Math.max(score, 0), 100));
}

// Classificação baseada no gap de crédito e volume de compras
// Gap < 5%: manter (fornecedor eficiente)
// Gap 5-15% + volume relevante: renegociar (pedir desconto equivalente ao crédito perdido)
// Gap > 15% + volume alto: substituir (buscar alternativa no Lucro Real)
function classificarFornecedor(totalCompras: number, aliquotaCredito: number): string {
  const gap = 26.5 - aliquotaCredito;
  const volumeRelevante = totalCompras > 50000; // R$ 50k/ano
  if (gap < 5) return 'manter';
  if (gap <= 15) return volumeRelevante ? 'renegociar' : 'manter';
  return volumeRelevante ? 'substituir' : 'renegociar';
}

// Preço máximo que um fornecedor sem crédito pleno pode cobrar
// para que o custo líquido seja equivalente a um fornecedor com crédito pleno
function calcularPrecoIndiferenca(precoMedio: number, aliquotaCredito: number): number {
  const gap = (26.5 - aliquotaCredito) / 100;
  return precoMedio * (1 - gap);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Validar autenticação
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId } = await req.json();
    const authenticatedUserId = claimsData.claims.sub;

    // Segurança: usuário só pode analisar seus próprios dados
    if (userId && userId !== authenticatedUserId) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const targetUserId = userId || authenticatedUserId;

    // Usar service role para operações de escrita (upsert)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Buscar créditos identificados do usuário
    // Campos reais: supplier_cnpj, supplier_name, original_tax_value, potential_recovery, ncm_code
    const { data: credits, error: creditsError } = await supabaseAdmin
      .from('identified_credits')
      .select('supplier_cnpj, supplier_name, original_tax_value, potential_recovery, ncm_code, nfe_date')
      .eq('user_id', targetUserId);

    if (creditsError) throw creditsError;

    if (!credits || credits.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhum crédito identificado encontrado. Importe XMLs primeiro.',
          processados: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar perfil da empresa para obter contexto (regime, UF)
    const { data: profile } = await supabaseAdmin
      .from('company_profile')
      .select('regime_tributario, uf_sede')
      .eq('user_id', targetUserId)
      .maybeSingle();

    // Agrupar por CNPJ do fornecedor
    const fornecedoresMap = new Map<string, {
      cnpj: string;
      razao_social: string | null;
      regime_tributario: string;
      regime_confianca: string;
      total_compras_12m: number;
      qtd_notas_12m: number;
      ncms_frequentes: string[];
    }>();

    for (const credit of credits) {
      const cnpj = credit.supplier_cnpj;
      if (!cnpj) continue;

      if (!fornecedoresMap.has(cnpj)) {
        fornecedoresMap.set(cnpj, {
          cnpj,
          razao_social: credit.supplier_name || null,
          // Sem dado do regime do fornecedor nos XMLs, estimamos como presumido (conservador)
          regime_tributario: 'presumido',
          regime_confianca: 'estimado',
          total_compras_12m: 0,
          qtd_notas_12m: 0,
          ncms_frequentes: [],
        });
      }

      const f = fornecedoresMap.get(cnpj)!;
      // Usar original_tax_value como proxy do valor da operação
      // Se não disponível, usar potential_recovery como fallback
      f.total_compras_12m += credit.original_tax_value || credit.potential_recovery || 0;
      f.qtd_notas_12m += 1;
      if (credit.ncm_code && !f.ncms_frequentes.includes(credit.ncm_code)) {
        f.ncms_frequentes.push(credit.ncm_code);
      }
    }

    // Calcular scores e classificar cada fornecedor
    const suppliersToUpsert = Array.from(fornecedoresMap.values()).map(f => {
      const aliquotaCredito = calcularAliquotaCredito(f.regime_tributario);
      const custoScore = calcularCustoEfetivoScore(f.total_compras_12m, aliquotaCredito);
      const classificacao = classificarFornecedor(f.total_compras_12m, aliquotaCredito);
      const precoMedioEstimado = f.qtd_notas_12m > 0 
        ? f.total_compras_12m / f.qtd_notas_12m 
        : 0;
      const precoIndiferenca = calcularPrecoIndiferenca(precoMedioEstimado, aliquotaCredito);

      return {
        user_id: targetUserId,
        cnpj: f.cnpj,
        razao_social: f.razao_social,
        regime_tributario: f.regime_tributario,
        regime_confianca: f.regime_confianca,
        uf: profile?.uf_sede || null,
        municipio: null,
        cnae_principal: null,
        total_compras_12m: f.total_compras_12m,
        qtd_notas_12m: f.qtd_notas_12m,
        ncms_frequentes: f.ncms_frequentes.slice(0, 10),
        aliquota_credito_estimada: aliquotaCredito,
        custo_efetivo_score: custoScore,
        classificacao,
        preco_indiferenca: precoIndiferenca,
        ultima_atualizacao: new Date().toISOString(),
      };
    });

    // Upsert na tabela suppliers (unique on user_id, cnpj)
    const { error: upsertError } = await supabaseAdmin
      .from('suppliers')
      .upsert(suppliersToUpsert, { onConflict: 'user_id,cnpj' });

    if (upsertError) throw upsertError;

    // Resumo por classificação
    const resumo = {
      manter: suppliersToUpsert.filter(s => s.classificacao === 'manter').length,
      renegociar: suppliersToUpsert.filter(s => s.classificacao === 'renegociar').length,
      substituir: suppliersToUpsert.filter(s => s.classificacao === 'substituir').length,
    };

    console.log(`[analyze-suppliers] ${suppliersToUpsert.length} fornecedores processados para user ${targetUserId}`);

    return new Response(
      JSON.stringify({
        success: true,
        processados: suppliersToUpsert.length,
        resumo,
        message: `${suppliersToUpsert.length} fornecedores analisados com sucesso.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro em analyze-suppliers:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno ao analisar fornecedores.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
