import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SessionContext {
  todayPriority: 'caixa' | 'margem' | 'compliance' | 'crescimento' | 'explorar';
  timeAvailable: '5min' | '15min' | '30min' | '1h+';
  urgentConcern?: string;
  decisionStyle?: 'dados_profundos' | 'resumo_executivo' | 'so_o_essencial';
}

interface RoadmapStep {
  order: number;
  tool: string;
  toolRoute: string;
  action: string;
  why: string;
  estimatedTime: string;
  priority: 'urgent' | 'high' | 'medium';
  icon: string;
}

// Mapeamento de ferramentas com rotas e ícones
const TOOLS_MAP: Record<string, { route: string; icon: string; name: string }> = {
  'score-tributario': { route: '/score-tributario', icon: 'Target', name: 'Score Tributário' },
  'split-payment': { route: '/calculadora/split-payment', icon: 'CreditCard', name: 'Simulador Split Payment' },
  'radar-creditos': { route: '/analise-notas', icon: 'Search', name: 'Radar de Créditos' },
  'dre': { route: '/dre', icon: 'TrendingUp', name: 'DRE Inteligente' },
  'price-guard': { route: '/margem-ativa', icon: 'ShieldCheck', name: 'PriceGuard' },
  'checklist-reforma': { route: '/checklist-reforma', icon: 'CheckSquare', name: 'Checklist Reforma' },
  'timeline-reforma': { route: '/timeline-reforma', icon: 'Calendar', name: 'Timeline Reforma' },
  'calculadora-rtc': { route: '/calculadora/rtc', icon: 'Calculator', name: 'Calculadora RTC' },
  'nexus': { route: '/nexus', icon: 'Zap', name: 'NEXUS Central' },
  'clara': { route: '/clara', icon: 'Bot', name: 'Clara AI' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar autenticação
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { sessionContext } = await req.json() as { sessionContext: SessionContext };

    // Buscar dados do usuário em paralelo
    const [
      profileResult,
      scoreResult,
      dreResult,
      creditsResult,
      preferencesResult,
      patternsResult,
    ] = await Promise.all([
      supabase.from('company_profile').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('tax_score_results').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('company_dre').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('credit_analysis_summary').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('user_session_preferences').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('clara_learned_patterns').select('pattern_key, pattern_value, confidence').eq('user_id', user.id).order('confidence', { ascending: false }).limit(10),
    ]);

    const profile = profileResult.data;
    const score = scoreResult.data;
    const dre = dreResult.data;
    const credits = creditsResult.data;
    const preferences = preferencesResult.data;
    const patterns = patternsResult.data || [];

    // Calcular sinais de dados
    const dataSignals = {
      scoreValue: score?.score_total || null,
      scoreLevel: score?.nivel || null,
      scoreOutdated: score?.created_at ? 
        (new Date().getTime() - new Date(score.created_at).getTime()) > 30 * 24 * 60 * 60 * 1000 : true,
      unusedCredits: credits?.total_potential || 0,
      margemLiquida: dre?.calc_margem_liquida || null,
      margemBruta: dre?.calc_margem_bruta || null,
      regimeTributario: profile?.regime_tributario || 'unknown',
      faturamentoAnual: profile?.faturamento_anual || 0,
      sophisticationLevel: preferences?.sophistication_level || 3,
    };

    // Gerar roadmap baseado no contexto
    const roadmap = generateRoadmapSteps(sessionContext, dataSignals, patterns);

    // Determinar goal da sessão
    const sessionGoal = getSessionGoal(sessionContext, dataSignals);

    // Salvar roadmap no banco
    const { data: savedRoadmap, error: saveError } = await supabase
      .from('clara_roadmaps')
      .insert({
        user_id: user.id,
        session_date: new Date().toISOString().split('T')[0],
        user_priority: sessionContext.todayPriority,
        time_available: sessionContext.timeAvailable,
        urgent_concern: sessionContext.urgentConcern,
        decision_style: sessionContext.decisionStyle || 'resumo_executivo',
        session_goal: sessionGoal,
        steps: roadmap,
        estimated_total_time: calculateTotalTime(roadmap),
        data_signals: dataSignals,
        model_used: 'rules-v1',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving roadmap:', saveError);
    }

    // Atualizar preferências do usuário
    await supabase
      .from('user_session_preferences')
      .upsert({
        user_id: user.id,
        last_session_date: new Date().toISOString().split('T')[0],
        show_welcome_modal: false,
      }, { onConflict: 'user_id' });

    return new Response(JSON.stringify({
      success: true,
      roadmap: {
        id: savedRoadmap?.id,
        sessionGoal,
        steps: roadmap,
        estimatedTotalTime: calculateTotalTime(roadmap),
        dataSignals,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error generating roadmap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateRoadmapSteps(
  context: SessionContext, 
  signals: any, 
  patterns: any[]
): RoadmapStep[] {
  const steps: RoadmapStep[] = [];
  let order = 1;

  // URGENTES (baseados em dados reais)
  
  // Score desatualizado ou baixo
  if (signals.scoreOutdated || (signals.scoreValue && signals.scoreValue < 60)) {
    steps.push({
      order: order++,
      tool: 'score-tributario',
      toolRoute: TOOLS_MAP['score-tributario'].route,
      action: signals.scoreOutdated ? 'Atualizar Score Tributário' : 'Revisar alertas do Score',
      why: signals.scoreOutdated 
        ? 'Seu score está desatualizado há mais de 30 dias. Pode haver riscos não identificados.'
        : `Score em ${signals.scoreValue}/100 indica pontos de atenção que precisam ser resolvidos.`,
      estimatedTime: '3min',
      priority: 'urgent',
      icon: TOOLS_MAP['score-tributario'].icon,
    });
  }

  // Créditos não aproveitados significativos
  if (signals.unusedCredits > 10000) {
    steps.push({
      order: order++,
      tool: 'radar-creditos',
      toolRoute: TOOLS_MAP['radar-creditos'].route,
      action: 'Revisar créditos identificados',
      why: `R$ ${(signals.unusedCredits / 1000).toFixed(0)}k em créditos tributários aguardando aproveitamento.`,
      estimatedTime: '5min',
      priority: 'urgent',
      icon: TOOLS_MAP['radar-creditos'].icon,
    });
  }

  // BASEADOS NA PRIORIDADE DO USUÁRIO
  
  if (context.todayPriority === 'caixa') {
    if (!steps.find(s => s.tool === 'split-payment')) {
      steps.push({
        order: order++,
        tool: 'split-payment',
        toolRoute: TOOLS_MAP['split-payment'].route,
        action: 'Simular impacto do Split Payment',
        why: 'O Split Payment pode travar até 30% do seu fluxo de caixa. Simule para se preparar.',
        estimatedTime: '3min',
        priority: 'high',
        icon: TOOLS_MAP['split-payment'].icon,
      });
    }
    
    if (!steps.find(s => s.tool === 'radar-creditos')) {
      steps.push({
        order: order++,
        tool: 'radar-creditos',
        toolRoute: TOOLS_MAP['radar-creditos'].route,
        action: 'Buscar créditos tributários',
        why: 'Créditos recuperados viram caixa imediato. Empresas do seu porte deixam em média R$40k/ano na mesa.',
        estimatedTime: '5min',
        priority: 'high',
        icon: TOOLS_MAP['radar-creditos'].icon,
      });
    }
  }

  if (context.todayPriority === 'margem') {
    steps.push({
      order: order++,
      tool: 'dre',
      toolRoute: TOOLS_MAP['dre'].route,
      action: signals.margemLiquida ? 'Analisar evolução da margem' : 'Cadastrar DRE para análise',
      why: signals.margemLiquida 
        ? `Margem líquida atual: ${signals.margemLiquida.toFixed(1)}%. Vamos identificar otimizações.`
        : 'Sem dados de DRE, não consigo identificar oportunidades de margem.',
      estimatedTime: '8min',
      priority: 'high',
      icon: TOOLS_MAP['dre'].icon,
    });

    steps.push({
      order: order++,
      tool: 'price-guard',
      toolRoute: TOOLS_MAP['price-guard'].route,
      action: 'Simular precificação com Reforma',
      why: 'Proteja sua margem simulando como os novos impostos afetarão seus preços de venda.',
      estimatedTime: '5min',
      priority: 'high',
      icon: TOOLS_MAP['price-guard'].icon,
    });
  }

  if (context.todayPriority === 'compliance') {
    steps.push({
      order: order++,
      tool: 'checklist-reforma',
      toolRoute: TOOLS_MAP['checklist-reforma'].route,
      action: 'Verificar preparação para Reforma',
      why: 'A Reforma Tributária exige adaptações até 2026. Veja o que falta fazer.',
      estimatedTime: '5min',
      priority: 'high',
      icon: TOOLS_MAP['checklist-reforma'].icon,
    });

    steps.push({
      order: order++,
      tool: 'timeline-reforma',
      toolRoute: TOOLS_MAP['timeline-reforma'].route,
      action: 'Revisar prazos importantes',
      why: 'Não perca deadlines críticos da transição 2026-2033.',
      estimatedTime: '3min',
      priority: 'medium',
      icon: TOOLS_MAP['timeline-reforma'].icon,
    });
  }

  if (context.todayPriority === 'crescimento') {
    steps.push({
      order: order++,
      tool: 'nexus',
      toolRoute: TOOLS_MAP['nexus'].route,
      action: 'Acessar visão consolidada NEXUS',
      why: 'Veja todos os indicadores em um só lugar para tomar decisões estratégicas.',
      estimatedTime: '5min',
      priority: 'high',
      icon: TOOLS_MAP['nexus'].icon,
    });

    if (!steps.find(s => s.tool === 'dre')) {
      steps.push({
        order: order++,
        tool: 'dre',
        toolRoute: TOOLS_MAP['dre'].route,
        action: 'Projetar cenários de crescimento',
        why: 'Entenda como o crescimento impacta sua estrutura tributária.',
        estimatedTime: '8min',
        priority: 'medium',
        icon: TOOLS_MAP['dre'].icon,
      });
    }
  }

  if (context.todayPriority === 'explorar') {
    // Para quem quer explorar, sugere baseado no nível de sofisticação
    if (signals.sophisticationLevel < 5) {
      steps.push({
        order: order++,
        tool: 'clara',
        toolRoute: TOOLS_MAP['clara'].route,
        action: 'Conversar com Clara AI',
        why: 'Tire dúvidas sobre tributação e descubra o que a plataforma pode fazer por você.',
        estimatedTime: '5min',
        priority: 'medium',
        icon: TOOLS_MAP['clara'].icon,
      });

      steps.push({
        order: order++,
        tool: 'score-tributario',
        toolRoute: TOOLS_MAP['score-tributario'].route,
        action: 'Descobrir seu Score Tributário',
        why: 'O Score é o ponto de partida para entender sua situação fiscal.',
        estimatedTime: '3min',
        priority: 'medium',
        icon: TOOLS_MAP['score-tributario'].icon,
      });
    } else {
      steps.push({
        order: order++,
        tool: 'nexus',
        toolRoute: TOOLS_MAP['nexus'].route,
        action: 'Explorar insights do NEXUS',
        why: 'Visão 360° com todas as métricas e oportunidades.',
        estimatedTime: '10min',
        priority: 'medium',
        icon: TOOLS_MAP['nexus'].icon,
      });
    }
  }

  // Limitar baseado no tempo disponível
  const timeLimit = getTimeLimit(context.timeAvailable);
  let accumulatedTime = 0;
  const filteredSteps: RoadmapStep[] = [];

  for (const step of steps) {
    const stepTime = parseInt(step.estimatedTime);
    if (accumulatedTime + stepTime <= timeLimit) {
      filteredSteps.push(step);
      accumulatedTime += stepTime;
    }
  }

  // Garantir pelo menos 2 steps
  if (filteredSteps.length < 2 && steps.length >= 2) {
    return steps.slice(0, 2);
  }

  return filteredSteps.length > 0 ? filteredSteps : steps.slice(0, 3);
}

function getTimeLimit(timeAvailable: string): number {
  switch (timeAvailable) {
    case '5min': return 6;
    case '15min': return 18;
    case '30min': return 35;
    case '1h+': return 70;
    default: return 15;
  }
}

function calculateTotalTime(steps: RoadmapStep[]): number {
  return steps.reduce((acc, step) => acc + parseInt(step.estimatedTime), 0);
}

function getSessionGoal(context: SessionContext, signals: any): string {
  const goals: Record<string, string> = {
    'caixa': 'Proteger seu fluxo de caixa',
    'margem': 'Otimizar sua margem de lucro',
    'compliance': 'Garantir conformidade fiscal',
    'crescimento': 'Planejar crescimento estratégico',
    'explorar': 'Descobrir oportunidades tributárias',
  };

  let goal = goals[context.todayPriority] || 'Melhorar sua gestão tributária';

  // Adicionar contexto específico se houver dados
  if (context.todayPriority === 'caixa' && signals.unusedCredits > 10000) {
    goal += ` — R$ ${(signals.unusedCredits / 1000).toFixed(0)}k em créditos disponíveis`;
  }

  if (context.todayPriority === 'margem' && signals.margemLiquida) {
    goal += ` — Margem atual: ${signals.margemLiquida.toFixed(1)}%`;
  }

  return goal;
}
