import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaxScore {
  user_id: string;
  score_total: number;
  score_grade: string;
  score_status: string;
  score_conformidade: number;
  score_eficiencia: number;
  score_risco: number;
  score_documentacao: number;
  score_gestao: number;
  resp_situacao_fiscal?: string;
  resp_certidoes?: string;
  resp_obrigacoes?: string;
  resp_controles?: string;
  auto_regime_tributario?: string;
  auto_xmls_importados: number;
  auto_xmls_periodo_inicio?: string;
  auto_xmls_periodo_fim?: string;
  auto_dre_preenchido: boolean;
  auto_creditos_identificados: number;
  auto_comparativo_realizado: boolean;
  economia_potencial: number;
  risco_autuacao: number;
  creditos_nao_aproveitados: number;
  cards_completos: number;
  cards_total: number;
}

interface ScoreAction {
  user_id: string;
  action_code: string;
  action_title: string;
  action_description: string;
  points_gain: number;
  economia_estimada: number;
  priority: number;
  link_to: string;
}

function calculateGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'E';
}

function calculateStatus(score: number): string {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'regular';
  if (score >= 20) return 'attention';
  return 'critical';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    // 1. BUSCAR DADOS AUTOMÁTICOS
    
    // Profile (cadastro)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // XMLs importados
    const { count: xmlCount } = await supabase
      .from('xml_imports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Datas dos XMLs
    const { data: xmlDates } = await supabase
      .from('xml_imports')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1);

    const { data: xmlDatesMax } = await supabase
      .from('xml_imports')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    // DRE
    const { data: dre } = await supabase
      .from('company_dre')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Créditos identificados
    const { data: creditos } = await supabase
      .from('credit_analysis_summary')
      .select('total_potential')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Comparativo de regimes realizado
    const { count: comparativoCount } = await supabase
      .from('simulations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('calculator_slug', 'comparativo-regimes');

    // Score atual (respostas manuais)
    const { data: currentScore } = await supabase
      .from('tax_score')
      .select('*')
      .eq('user_id', userId)
      .single();

    // 2. CALCULAR CADA DIMENSÃO

    // CONFORMIDADE (peso 2.5 = max 250 pontos do total)
    let conformidade = 0;
    
    // Situação fiscal (0-80 pontos)
    const situacaoFiscal = currentScore?.resp_situacao_fiscal;
    if (situacaoFiscal === 'sem_pendencias') {
      conformidade += 80;
    } else if (situacaoFiscal === 'com_pendencias') {
      conformidade += 30;
    } else if (situacaoFiscal === 'notificacao') {
      conformidade += 10;
    } else if (situacaoFiscal === 'nao_sei') {
      conformidade += 50;
    }
    
    // Certidões (0-80 pontos)
    const certidoes = currentScore?.resp_certidoes;
    if (certidoes === 'sim') {
      conformidade += 80;
    } else if (certidoes === 'parcelado') {
      conformidade += 50;
    } else if (certidoes === 'nao') {
      conformidade += 10;
    } else if (certidoes === 'nao_sei') {
      conformidade += 40;
    }
    
    // Obrigações (0-90 pontos)
    const obrigacoes = currentScore?.resp_obrigacoes;
    if (obrigacoes === 'em_dia') {
      conformidade += 90;
    } else if (obrigacoes === 'algumas_atrasadas') {
      conformidade += 50;
    } else if (obrigacoes === 'frequente_atraso') {
      conformidade += 20;
    } else if (obrigacoes === 'nao_sei') {
      conformidade += 60;
    }
    
    // Normalizar para 0-100
    const scoreConformidade = Math.min(Math.round(conformidade / 2.5), 100);

    // EFICIÊNCIA (peso 2.5 = max 250 pontos)
    let eficiencia = 0;
    
    // Regime otimizado - verificar se fez comparativo
    if (comparativoCount && comparativoCount > 0) {
      eficiencia += 80;
    } else {
      eficiencia += 20;
    }
    
    // Se tem DRE, analisar carga tributária
    if (dre && dre.calc_receita_bruta > 0) {
      const cargaTrib = (dre.calc_deducoes_receita || 0) / dre.calc_receita_bruta;
      if (cargaTrib < 0.12) eficiencia += 70;
      else if (cargaTrib < 0.18) eficiencia += 50;
      else if (cargaTrib < 0.25) eficiencia += 30;
      else eficiencia += 10;
    } else {
      eficiencia += 40;
    }
    
    // Créditos aproveitados
    const creditosPotencial = creditos?.total_potential || 0;
    if (creditosPotencial > 10000) {
      eficiencia += 30; // Tem muitos créditos não usados = perde pontos
    } else if (creditosPotencial > 0) {
      eficiencia += 60;
    } else {
      eficiencia += 100; // Sem créditos perdidos
    }
    
    const scoreEficiencia = Math.min(Math.round(eficiencia / 2.5), 100);

    // RISCO (peso 2.0 = max 200 pontos)
    let risco = 200; // Começa no máximo, deduz por problemas
    
    if (situacaoFiscal === 'notificacao') {
      risco -= 80;
    } else if (situacaoFiscal === 'com_pendencias') {
      risco -= 40;
    }
    
    if (certidoes === 'nao') {
      risco -= 60;
    } else if (certidoes === 'parcelado') {
      risco -= 20;
    }
    
    if (obrigacoes === 'frequente_atraso') {
      risco -= 60;
    } else if (obrigacoes === 'algumas_atrasadas') {
      risco -= 30;
    }
    
    const scoreRisco = Math.max(Math.round(risco / 2), 0);

    // DOCUMENTAÇÃO (peso 1.5 = max 150 pontos)
    let documentacao = 0;
    
    // XMLs guardados
    const xmlTotal = xmlCount || 0;
    if (xmlTotal > 500) documentacao += 80;
    else if (xmlTotal > 100) documentacao += 60;
    else if (xmlTotal > 0) documentacao += 30;
    
    // DRE preenchido
    if (dre) documentacao += 70;
    
    const scoreDocumentacao = Math.min(Math.round(documentacao / 1.5), 100);

    // GESTÃO (peso 1.5 = max 150 pontos)
    let gestao = 0;
    
    // Controle de prazos
    const controles = currentScore?.resp_controles;
    if (controles === 'sistema') {
      gestao += 100;
    } else if (controles === 'contador') {
      gestao += 70;
    } else if (controles === 'manual') {
      gestao += 40;
    } else if (controles === 'sem_controle') {
      gestao += 10;
    }
    
    const scoreGestao = Math.min(Math.round(gestao / 1), 100);

    // 3. CALCULAR SCORE TOTAL (soma ponderada normalizada para 0-100)
    const scoreTotal = Math.round(
      (scoreConformidade * 2.5 +
      scoreEficiencia * 2.5 +
      scoreRisco * 2.0 +
      scoreDocumentacao * 1.5 +
      scoreGestao * 1.5) / 10
    );

    // 4. DETERMINAR GRADE E STATUS
    const grade = calculateGrade(scoreTotal);
    const status = calculateStatus(scoreTotal);

    // 5. CONTAR CARDS COMPLETOS
    let cardsCompletos = 0;
    if (profile?.empresa || profile?.cnae) cardsCompletos++;
    if (profile?.regime) cardsCompletos++;
    if (xmlTotal > 0) cardsCompletos++;
    if (dre) cardsCompletos++;
    if (currentScore?.resp_situacao_fiscal) cardsCompletos++;
    if (currentScore?.resp_certidoes) cardsCompletos++;
    if (currentScore?.resp_obrigacoes) cardsCompletos++;
    if (currentScore?.resp_controles) cardsCompletos++;

    // 6. CALCULAR IMPACTO FINANCEIRO
    const faturamentoAnual = (dre?.calc_receita_bruta || profile?.faturamento_mensal || 50000) * 12;
    
    const economiaRegime = (!comparativoCount || comparativoCount === 0) && dre 
      ? (dre.calc_deducoes_receita || faturamentoAnual * 0.15) * 0.15 // 15% economia potencial
      : 0;
    
    const creditosNaoAproveitados = creditosPotencial;
    
    const riscoAutuacao = situacaoFiscal === 'notificacao'
      ? faturamentoAnual * 0.03 // 3% do faturamento como multa típica
      : situacaoFiscal === 'com_pendencias'
        ? faturamentoAnual * 0.01
        : 0;
    
    const economiaPotencial = economiaRegime + creditosNaoAproveitados;

    // 7. GERAR AÇÕES RECOMENDADAS
    const actions: ScoreAction[] = [];
    
    if (!comparativoCount || comparativoCount === 0) {
      actions.push({
        user_id: userId,
        action_code: 'COMPARAR_REGIME',
        action_title: 'Comparar regimes tributários',
        action_description: 'Você nunca analisou se está no regime mais vantajoso para sua empresa',
        points_gain: 80,
        economia_estimada: economiaRegime,
        priority: 1,
        link_to: '/calculadora/comparativo-regimes'
      });
    }
    
    if (creditosNaoAproveitados > 0) {
      actions.push({
        user_id: userId,
        action_code: 'RECUPERAR_CREDITOS',
        action_title: 'Recuperar créditos identificados',
        action_description: `Encontramos R$ ${creditosNaoAproveitados.toLocaleString('pt-BR')} em créditos tributários não aproveitados`,
        points_gain: 50,
        economia_estimada: creditosNaoAproveitados,
        priority: 2,
        link_to: '/dashboard/radar-creditos'
      });
    }
    
    if (xmlTotal < 100) {
      actions.push({
        user_id: userId,
        action_code: 'IMPORTAR_XMLS',
        action_title: 'Importar mais XMLs',
        action_description: 'Importe pelo menos 12 meses de notas fiscais para uma análise completa',
        points_gain: 40,
        economia_estimada: 0,
        priority: 3,
        link_to: '/dashboard/importar-xml'
      });
    }
    
    if (!dre) {
      actions.push({
        user_id: userId,
        action_code: 'PREENCHER_DRE',
        action_title: 'Preencher o DRE Inteligente',
        action_description: 'O DRE permite análise completa da sua carga tributária e margens',
        points_gain: 35,
        economia_estimada: 0,
        priority: 4,
        link_to: '/dashboard/dre'
      });
    }

    if (!currentScore?.resp_situacao_fiscal || !currentScore?.resp_certidoes || 
        !currentScore?.resp_obrigacoes || !currentScore?.resp_controles) {
      actions.push({
        user_id: userId,
        action_code: 'COMPLETAR_DIAGNOSTICO',
        action_title: 'Completar diagnóstico fiscal',
        action_description: 'Responda as perguntas sobre sua situação fiscal para um score mais preciso',
        points_gain: 60,
        economia_estimada: 0,
        priority: 1,
        link_to: '/dashboard/score-tributario'
      });
    }

    // 8. SALVAR SCORE
    const scoreData: Partial<TaxScore> = {
      user_id: userId,
      score_total: scoreTotal,
      score_grade: grade,
      score_status: status,
      score_conformidade: scoreConformidade,
      score_eficiencia: scoreEficiencia,
      score_risco: scoreRisco,
      score_documentacao: scoreDocumentacao,
      score_gestao: scoreGestao,
      auto_regime_tributario: profile?.regime,
      auto_xmls_importados: xmlTotal,
      auto_xmls_periodo_inicio: xmlDates?.[0]?.created_at?.split('T')[0],
      auto_xmls_periodo_fim: xmlDatesMax?.[0]?.created_at?.split('T')[0],
      auto_dre_preenchido: !!dre,
      auto_creditos_identificados: creditosPotencial,
      auto_comparativo_realizado: (comparativoCount || 0) > 0,
      economia_potencial: economiaPotencial,
      risco_autuacao: riscoAutuacao,
      creditos_nao_aproveitados: creditosNaoAproveitados,
      cards_completos: cardsCompletos,
      cards_total: 8,
    };

    // Upsert score
    if (currentScore) {
      await supabase
        .from('tax_score')
        .update({
          ...scoreData,
          calculated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentScore.id);
    } else {
      await supabase
        .from('tax_score')
        .insert(scoreData);
    }

    // Salvar histórico (apenas se score > 0)
    if (scoreTotal > 0) {
      await supabase.from('tax_score_history').insert({
        user_id: userId,
        score_total: scoreTotal,
        score_grade: grade,
        score_conformidade: scoreConformidade,
        score_eficiencia: scoreEficiencia,
        score_risco: scoreRisco,
        score_documentacao: scoreDocumentacao,
        score_gestao: scoreGestao,
      });
    }

    // Limpar e inserir novas ações
    await supabase
      .from('score_actions')
      .delete()
      .eq('user_id', userId);
    
    if (actions.length > 0) {
      await supabase.from('score_actions').insert(actions);
    }

    return new Response(JSON.stringify({
      success: true,
      score: scoreTotal,
      grade,
      status,
      dimensions: {
        conformidade: scoreConformidade,
        eficiencia: scoreEficiencia,
        risco: scoreRisco,
        documentacao: scoreDocumentacao,
        gestao: scoreGestao,
      },
      cardsCompletos,
      cardsTotal: 8,
      financialImpact: {
        economiaPotencial,
        riscoAutuacao,
        creditosNaoAproveitados,
      },
      actions: actions.sort((a, b) => a.priority - b.priority),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error calculating tax score:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
