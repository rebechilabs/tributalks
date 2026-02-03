import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ToolContext {
  toolName: string;
  toolDescription: string;
  stepByStep: string[];
}

// ============================================
// CONTEXTO COMPLETO DO USUÁRIO - Clara com Visibilidade Total
// ============================================
interface UserPlatformContext {
  // Identificação
  userName: string | null;
  companyName: string | null;
  cnpj: string | null;
  setor: string | null;
  regime: string | null;
  plano: string;
  
  // Score Tributário
  score: {
    total: number | null;
    grade: string | null;
    riscoAutuacao: number | null;
    dimensoes: {
      conformidade: number;
      eficiencia: number;
      risco: number;
      documentacao: number;
      gestao: number;
    } | null;
    calculadoEm: string | null;
  } | null;
  
  // Financeiro (DRE)
  financeiro: {
    receitaBruta: number | null;
    margemBruta: number | null;
    margemLiquida: number | null;
    ebitda: number | null;
    despesasTotal: number | null;
    reformaImpactoPercent: number | null;
    atualizadoEm: string | null;
    // Detalhes dos inputs para explicar a origem dos números
    inputs: {
      vendasServicos: number | null;
      vendasProdutos: number | null;
      salariosEncargos: number | null;
      prolabore: number | null;
      maoObraDireta: number | null;
      aluguel: number | null;
      marketing: number | null;
      contadorJuridico: number | null;
    } | null;
  } | null;
  
  // Créditos e Oportunidades
  oportunidades: {
    creditosDisponiveis: number;
    oportunidadesAtivas: number;
    economiaAnualPotencial: number;
  };
  
  // Progresso
  progresso: {
    xmlsProcessados: number;
    workflowsEmAndamento: number;
    workflowsConcluidos: number;
    onboardingCompleto: boolean;
    checklistItens: string[];
  };
  
  // Engajamento
  engajamento: {
    streakDias: number;
    notificacoesNaoLidas: number;
  };
  
  // Integrações
  integracoes: {
    erpConectado: boolean;
    erpNome: string | null;
    ultimaSync: string | null;
    syncStatus: 'success' | 'error' | 'pending' | null;
  };
}

// Cache em memória para contexto do usuário (5 minutos)
const contextCache = new Map<string, { context: UserPlatformContext; timestamp: number }>();
const CONTEXT_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Cache em memória para configs dinâmicas (10 minutos)
const configCache = new Map<string, { data: any; timestamp: number }>();
const CONFIG_CACHE_TTL = 10 * 60 * 1000; // 10 minutos

// Busca config dinâmica do banco com cache
async function getDynamicConfig(
  supabase: SupabaseClient, 
  configKey: string
): Promise<any | null> {
  // Verifica cache
  const cached = configCache.get(configKey);
  if (cached && Date.now() - cached.timestamp < CONFIG_CACHE_TTL) {
    console.log(`Config cache HIT for ${configKey}`);
    return cached.data;
  }

  console.log(`Fetching config from DB: ${configKey}`);

  try {
    const { data, error } = await supabase
      .from('clara_prompt_configs')
      .select('content')
      .eq('config_key', configKey)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.error('Error fetching config:', error);
      return null;
    }

    if (data?.content) {
      configCache.set(configKey, { data: data.content, timestamp: Date.now() });
      return data.content;
    }

    return null;
  } catch (err) {
    console.error('Error in getDynamicConfig:', err);
    return null;
  }
}

// Busca resposta por plano do banco (com fallback para hardcoded)
async function getDynamicPlanResponse(
  supabase: SupabaseClient, 
  plan: string
): Promise<string> {
  const configKey = `plan_response:${plan}`;
  const config = await getDynamicConfig(supabase, configKey);

  if (config?.greeting) {
    return config.greeting;
  }

  // Fallback para respostas hardcoded
  return PLAN_RESPONSES[plan] || PLAN_RESPONSES.STARTER;
}

// Busca contexto completo do usuário em paralelo
async function buildUserContext(supabase: SupabaseClient, userId: string): Promise<UserPlatformContext> {
  // Verifica cache
  const cached = contextCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CONTEXT_CACHE_TTL) {
    console.log(`Context cache HIT for user ${userId}`);
    return cached.context;
  }

  console.log(`Building full context for user ${userId}`);

  // Busca todas as tabelas em paralelo
  const [
    profileResult,
    companyProfileResult,
    taxScoreResult,
    dreResult,
    creditSummaryResult,
    opportunitiesResult,
    workflowProgressResult,
    xmlCountResult,
    notificationsResult,
    erpConnectionResult,
    onboardingResult,
  ] = await Promise.all([
    supabase.from("profiles").select("nome, plano, streak_count").eq("user_id", userId).maybeSingle(),
    supabase.from("company_profile").select("razao_social, cnpj_principal, setor, regime_tributario").eq("user_id", userId).maybeSingle(),
    supabase.from("tax_score").select("score_total, score_grade, score_conformidade, score_eficiencia, score_risco, score_documentacao, score_gestao, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("company_dre").select("calc_receita_bruta, calc_margem_bruta, calc_margem_liquida, calc_ebitda, calc_despesas_operacionais_total, reforma_impacto_percentual, updated_at, input_vendas_servicos, input_vendas_produtos, input_salarios_encargos, input_prolabore, input_custo_mao_obra_direta, input_aluguel, input_marketing_publicidade, input_contador_juridico").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("credit_analysis_summary").select("total_potential").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("company_opportunities").select("id, economia_anual_min, economia_anual_max, status").eq("user_id", userId).neq("status", "descartada"),
    supabase.from("workflow_progress").select("workflow_id, completed_at").eq("user_id", userId),
    supabase.from("xml_imports").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("read", false),
    supabase.from("erp_connections").select("erp_type, status, last_sync_at, connection_name").eq("user_id", userId).eq("status", "active").limit(1).maybeSingle(),
    supabase.from("user_onboarding_progress").select("tour_completed, first_mission_completed, checklist_items, completed_at").eq("user_id", userId).maybeSingle(),
  ]);

  // Processa resultados
  const profile = profileResult.data;
  const companyProfile = companyProfileResult.data;
  const taxScore = taxScoreResult.data;
  const dre = dreResult.data;
  const creditSummary = creditSummaryResult.data;
  const opportunities = opportunitiesResult.data || [];
  const workflows = workflowProgressResult.data || [];
  const xmlCount = xmlCountResult.count || 0;
  const unreadNotifications = notificationsResult.count || 0;
  const erpConnection = erpConnectionResult.data;
  const onboarding = onboardingResult.data;

  // Calcula métricas derivadas
  const activeOpportunities = opportunities.filter(o => o.status !== 'descartada' && o.status !== 'implementada');
  const totalAnnualSavings = opportunities.reduce((acc, o) => acc + ((o.economia_anual_min || 0) + (o.economia_anual_max || 0)) / 2, 0);
  const workflowsInProgress = workflows.filter(w => !w.completed_at).length;
  const workflowsCompleted = workflows.filter(w => w.completed_at).length;

  // Checa itens do checklist completados
  const checklistItems: string[] = [];
  if (onboarding?.checklist_items) {
    const items = onboarding.checklist_items as Record<string, boolean>;
    Object.entries(items).forEach(([key, value]) => {
      if (value) checklistItems.push(key);
    });
  }

  const context: UserPlatformContext = {
    userName: profile?.nome || null,
    companyName: companyProfile?.razao_social || null,
    cnpj: companyProfile?.cnpj_principal || null,
    setor: companyProfile?.setor || null,
    regime: companyProfile?.regime_tributario || null,
    plano: profile?.plano || "FREE",
    
    score: taxScore ? {
      total: taxScore.score_total,
      grade: taxScore.score_grade,
      riscoAutuacao: null, // Não temos esse campo na tabela atual
      dimensoes: {
        conformidade: taxScore.score_conformidade || 0,
        eficiencia: taxScore.score_eficiencia || 0,
        risco: taxScore.score_risco || 0,
        documentacao: taxScore.score_documentacao || 0,
        gestao: taxScore.score_gestao || 0,
      },
      calculadoEm: taxScore.created_at,
    } : null,
    
    financeiro: dre ? {
      receitaBruta: dre.calc_receita_bruta,
      margemBruta: dre.calc_margem_bruta,
      margemLiquida: dre.calc_margem_liquida,
      ebitda: dre.calc_ebitda,
      despesasTotal: dre.calc_despesas_operacionais_total,
      reformaImpactoPercent: dre.reforma_impacto_percentual,
      atualizadoEm: dre.updated_at,
      inputs: {
        vendasServicos: dre.input_vendas_servicos,
        vendasProdutos: dre.input_vendas_produtos,
        salariosEncargos: dre.input_salarios_encargos,
        prolabore: dre.input_prolabore,
        maoObraDireta: dre.input_custo_mao_obra_direta,
        aluguel: dre.input_aluguel,
        marketing: dre.input_marketing_publicidade,
        contadorJuridico: dre.input_contador_juridico,
      },
    } : null,
    
    oportunidades: {
      creditosDisponiveis: creditSummary?.total_potential || 0,
      oportunidadesAtivas: activeOpportunities.length,
      economiaAnualPotencial: totalAnnualSavings,
    },
    
    progresso: {
      xmlsProcessados: xmlCount,
      workflowsEmAndamento: workflowsInProgress,
      workflowsConcluidos: workflowsCompleted,
      onboardingCompleto: !!onboarding?.completed_at,
      checklistItens: checklistItems,
    },
    
    engajamento: {
      streakDias: profile?.streak_count || 0,
      notificacoesNaoLidas: unreadNotifications,
    },
    
    integracoes: {
      erpConectado: !!erpConnection,
      erpNome: erpConnection?.connection_name || erpConnection?.erp_type || null,
      ultimaSync: erpConnection?.last_sync_at || null,
      syncStatus: erpConnection?.status === 'active' ? 'success' : erpConnection?.status === 'error' ? 'error' : null,
    },
  };

  // Salva no cache
  contextCache.set(userId, { context, timestamp: Date.now() });

  return context;
}

// Formata o contexto do usuário para o prompt do LLM
function formatUserContextForPrompt(ctx: UserPlatformContext): string {
  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  };

  const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return null;
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const lines: string[] = [];
  
  lines.push('='.repeat(50));
  lines.push('CONTEXTO DO USUÁRIO (dados reais da plataforma)');
  lines.push('='.repeat(50));
  lines.push('');

  // PERFIL
  lines.push('👤 PERFIL');
  if (ctx.userName) lines.push(`- Nome: ${ctx.userName}`);
  if (ctx.companyName) lines.push(`- Empresa: ${ctx.companyName}`);
  if (ctx.cnpj) lines.push(`- CNPJ: ${ctx.cnpj}`);
  if (ctx.setor) lines.push(`- Setor: ${ctx.setor}`);
  if (ctx.regime) lines.push(`- Regime: ${ctx.regime}`);
  lines.push(`- ⭐ PLANO ATUAL: ${ctx.plano} (USE ESTA INFORMAÇÃO!)`);
  lines.push('');

  // SCORE TRIBUTÁRIO
  if (ctx.score) {
    lines.push('📊 SCORE TRIBUTÁRIO');
    lines.push(`- Nota: ${ctx.score.grade || 'N/A'} (${ctx.score.total || 0} pontos)`);
    if (ctx.score.riscoAutuacao !== null) {
      lines.push(`- Risco de Autuação: ${ctx.score.riscoAutuacao}%`);
    }
    if (ctx.score.dimensoes) {
      const dims = ctx.score.dimensoes;
      const weakest = Object.entries(dims).reduce((a, b) => a[1] < b[1] ? a : b);
      lines.push(`- Ponto mais fraco: ${weakest[0]} (score ${weakest[1]})`);
    }
    if (ctx.score.calculadoEm) {
      lines.push(`- Calculado em: ${formatDate(ctx.score.calculadoEm)}`);
    }
    lines.push('');
  }

  // FINANCEIRO (DRE)
  if (ctx.financeiro) {
    lines.push('💰 FINANCEIRO (DRE)');
    if (ctx.financeiro.receitaBruta) lines.push(`- Receita Bruta Mensal: ${formatCurrency(ctx.financeiro.receitaBruta)}`);
    if (ctx.financeiro.margemBruta !== null) lines.push(`- Margem Bruta: ${formatPercent(ctx.financeiro.margemBruta)}`);
    if (ctx.financeiro.margemLiquida !== null) lines.push(`- Margem Líquida: ${formatPercent(ctx.financeiro.margemLiquida)}`);
    if (ctx.financeiro.ebitda) lines.push(`- EBITDA: ${formatCurrency(ctx.financeiro.ebitda)}`);
    if (ctx.financeiro.reformaImpactoPercent !== null && ctx.financeiro.reformaImpactoPercent !== 0) {
      const impact = ctx.financeiro.reformaImpactoPercent;
      const sign = impact > 0 ? '+' : '';
      lines.push(`- Impacto Reforma 2027: ${sign}${formatPercent(impact)} na margem`);
    }
    if (ctx.financeiro.atualizadoEm) lines.push(`- Atualizado em: ${formatDate(ctx.financeiro.atualizadoEm)}`);
    lines.push('');
  }

  // OPORTUNIDADES
  const { creditosDisponiveis, oportunidadesAtivas, economiaAnualPotencial } = ctx.oportunidades;
  if (creditosDisponiveis > 0 || oportunidadesAtivas > 0) {
    lines.push('💡 OPORTUNIDADES');
    if (creditosDisponiveis > 0) lines.push(`- Créditos disponíveis para recuperar: ${formatCurrency(creditosDisponiveis)}`);
    if (oportunidadesAtivas > 0) lines.push(`- Oportunidades fiscais ativas: ${oportunidadesAtivas}`);
    if (economiaAnualPotencial > 0) lines.push(`- Economia anual potencial: ${formatCurrency(economiaAnualPotencial)}`);
    lines.push('');
  }

  // PROGRESSO
  const { xmlsProcessados, workflowsEmAndamento, workflowsConcluidos, onboardingCompleto, checklistItens } = ctx.progresso;
  lines.push('📈 PROGRESSO');
  lines.push(`- XMLs processados: ${xmlsProcessados}`);
  if (workflowsEmAndamento > 0) lines.push(`- Workflows em andamento: ${workflowsEmAndamento}`);
  if (workflowsConcluidos > 0) lines.push(`- Workflows concluídos: ${workflowsConcluidos}`);
  const checklistTotal = 4;
  const checklistDone = checklistItens.length;
  if (!onboardingCompleto && checklistDone < checklistTotal) {
    const missing = ['score', 'simulation', 'timeline', 'profile'].filter(i => !checklistItens.includes(i));
    lines.push(`- Onboarding: ${Math.round((checklistDone / checklistTotal) * 100)}% completo (falta: ${missing.join(', ')})`);
  } else if (onboardingCompleto) {
    lines.push(`- Onboarding: ✅ Completo`);
  }
  lines.push('');

  // INTEGRAÇÕES
  if (ctx.integracoes.erpConectado) {
    lines.push('🔗 INTEGRAÇÕES');
    lines.push(`- ERP: ${ctx.integracoes.erpNome} (conectado)`);
    if (ctx.integracoes.ultimaSync) {
      const syncDate = new Date(ctx.integracoes.ultimaSync);
      const hoursAgo = Math.round((Date.now() - syncDate.getTime()) / (1000 * 60 * 60));
      lines.push(`- Última sync: há ${hoursAgo} hora${hoursAgo !== 1 ? 's' : ''}`);
    }
    const statusIcon = ctx.integracoes.syncStatus === 'success' ? '✅' : ctx.integracoes.syncStatus === 'error' ? '❌' : '⏳';
    lines.push(`- Status: ${statusIcon} ${ctx.integracoes.syncStatus || 'pendente'}`);
    lines.push('');
  }

  // ENGAJAMENTO
  if (ctx.engajamento.streakDias > 0 || ctx.engajamento.notificacoesNaoLidas > 0) {
    lines.push('📬 ENGAJAMENTO');
    if (ctx.engajamento.streakDias > 0) lines.push(`- Streak: ${ctx.engajamento.streakDias} dia${ctx.engajamento.streakDias !== 1 ? 's' : ''} consecutivo${ctx.engajamento.streakDias !== 1 ? 's' : ''}`);
    if (ctx.engajamento.notificacoesNaoLidas > 0) lines.push(`- Notificações não lidas: ${ctx.engajamento.notificacoesNaoLidas}`);
    lines.push('');
  }

  // INSTRUÇÕES PARA O LLM
  lines.push('-'.repeat(50));
  lines.push('');
  lines.push('INSTRUÇÕES DE PERSONALIZAÇÃO:');
  lines.push('Use este contexto para personalizar suas respostas. Você sabe:');
  
  if (ctx.userName) {
    lines.push(`- Chame o usuário pelo nome (${ctx.userName})`);
  }
  if (creditosDisponiveis > 10000) {
    lines.push(`- Ele tem ${formatCurrency(creditosDisponiveis)} em créditos para recuperar - mencione quando relevante!`);
  }
  if (ctx.financeiro?.reformaImpactoPercent && ctx.financeiro.reformaImpactoPercent < 0) {
    lines.push(`- A margem dele vai cair ${Math.abs(ctx.financeiro.reformaImpactoPercent).toFixed(1)}pp com a Reforma - alerte se relevante`);
  }
  if (ctx.score && ctx.score.dimensoes) {
    const dims = ctx.score.dimensoes;
    const weakest = Object.entries(dims).reduce((a, b) => a[1] < b[1] ? a : b);
    lines.push(`- O ponto mais fraco é ${weakest[0]} - sugira melhorar se perguntarem sobre score`);
  }
  if (workflowsEmAndamento > 0) {
    lines.push(`- Ele tem ${workflowsEmAndamento} workflow${workflowsEmAndamento !== 1 ? 's' : ''} em andamento - pergunte se precisa de ajuda`);
  }
  if (!ctx.financeiro) {
    lines.push('- Ele ainda não preencheu o DRE - priorize isso para análises financeiras');
  }
  if (xmlsProcessados === 0) {
    lines.push('- Ele ainda não importou XMLs - sugira importar para análises mais precisas');
  }
  
  lines.push('');

  return lines.join('\n');
}

// ============================================
// RAG SEMÂNTICO - Busca por Embeddings
// ============================================
interface SemanticSearchResult {
  type: 'knowledge' | 'memory' | 'pattern';
  id: string;
  content: string;
  title?: string;
  category?: string;
  similarity: number;
  metadata?: Record<string, unknown>;
}

// Busca contexto semântico relevante usando a edge function de busca
async function fetchSemanticContext(
  supabaseUrl: string,
  anonKey: string,
  query: string,
  userId: string | null
): Promise<{ knowledge: SemanticSearchResult[]; userContext: SemanticSearchResult[] }> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/semantic-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        query,
        userId,
        searchTypes: userId ? ['knowledge', 'memory', 'pattern'] : ['knowledge'],
        similarityThreshold: 0.6,
        maxResults: 8,
      }),
    });

    if (!response.ok) {
      console.error('Semantic search failed:', response.status);
      return { knowledge: [], userContext: [] };
    }

    const data = await response.json();
    const results = data.results as SemanticSearchResult[];
    
    return {
      knowledge: results.filter(r => r.type === 'knowledge'),
      userContext: results.filter(r => r.type === 'memory' || r.type === 'pattern'),
    };
  } catch (err) {
    console.error('Semantic search error:', err);
    return { knowledge: [], userContext: [] };
  }
}

// Formata resultados semânticos para injeção no prompt
function formatSemanticContextForPrompt(
  knowledge: SemanticSearchResult[],
  userContext: SemanticSearchResult[]
): string {
  if (knowledge.length === 0 && userContext.length === 0) return '';

  const lines: string[] = [];
  lines.push('');
  lines.push('='.repeat(50));
  lines.push('CONTEXTO SEMÂNTICO RELEVANTE (RAG)');
  lines.push('='.repeat(50));
  lines.push('');

  if (knowledge.length > 0) {
    lines.push('📚 CONHECIMENTO TÉCNICO ENCONTRADO:');
    for (const k of knowledge) {
      const sim = Math.round(k.similarity * 100);
      lines.push(`\n### ${k.title || k.category} (${sim}% relevância)`);
      lines.push(k.content.substring(0, 500) + (k.content.length > 500 ? '...' : ''));
    }
    lines.push('');
  }

  if (userContext.length > 0) {
    lines.push('🧠 MEMÓRIAS DO USUÁRIO:');
    for (const m of userContext) {
      const sim = Math.round(m.similarity * 100);
      if (m.type === 'memory') {
        lines.push(`- [${m.category}] ${m.content} (${sim}%)`);
      } else if (m.type === 'pattern') {
        const confidence = (m.metadata?.confidence as number) || 0;
        lines.push(`- Padrão: ${m.content} (confiança: ${Math.round(confidence * 100)}%)`);
      }
    }
    lines.push('');
  }

  lines.push('Use este contexto para personalizar e enriquecer sua resposta.');
  lines.push('');

  return lines.join('\n');
}

// ============================================
// HISTÓRICO CONVERSACIONAL - Contexto de conversas anteriores
// ============================================
interface ConversationHistoryContext {
  recentTopics: string[];
  lastMessageDate: string | null;
  totalMessages: number;
  recentMessages: { role: string; content: string }[];
}

// Formata histórico de conversas para injeção no prompt
function formatConversationHistoryForPrompt(history: ConversationHistoryContext | null): string {
  if (!history || history.totalMessages === 0) return '';

  const lines: string[] = [];
  lines.push('');
  lines.push('='.repeat(50));
  lines.push('HISTÓRICO CONVERSACIONAL (use para continuidade)');
  lines.push('='.repeat(50));
  lines.push('');

  // Última interação
  if (history.lastMessageDate) {
    const lastDate = new Date(history.lastMessageDate);
    const now = new Date();
    const diffHours = Math.round((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      lines.push('⏰ Última conversa: agora mesmo');
    } else if (diffHours < 24) {
      lines.push(`⏰ Última conversa: há ${diffHours} hora${diffHours !== 1 ? 's' : ''}`);
    } else {
      const diffDays = Math.round(diffHours / 24);
      lines.push(`⏰ Última conversa: há ${diffDays} dia${diffDays !== 1 ? 's' : ''}`);
    }
    lines.push('');
  }

  // Tópicos recentes
  if (history.recentTopics.length > 0) {
    lines.push('📌 Tópicos recentes que o usuário perguntou:');
    history.recentTopics.forEach((topic, i) => {
      lines.push(`${i + 1}. "${topic}"`);
    });
    lines.push('');
  }

  // Últimas mensagens para contexto
  if (history.recentMessages.length > 0) {
    lines.push('💬 Últimas trocas (para contexto):');
    history.recentMessages.forEach(msg => {
      const prefix = msg.role === 'user' ? 'Usuário' : 'Clara';
      lines.push(`- ${prefix}: "${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}"`);
    });
    lines.push('');
  }

  lines.push('INSTRUÇÃO: Use este histórico para:');
  lines.push('- Manter continuidade ("como conversamos antes...")');
  lines.push('- Evitar repetir informações já dadas');
  lines.push('- Referenciar tópicos anteriores quando relevante');
  lines.push('');

  return lines.join('\n');
}

type AgentType = 'fiscal' | 'margin' | 'compliance' | null;

interface AgentSuggestion {
  agentType: AgentType;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  suggestedAction?: string;
}

interface PendingAction {
  id: string;
  action_type: string;
  trigger_event: string;
  priority: string;
  agent_type: string;
  created_at: string;
}

// Analisa mensagem para detectar qual agente deve atuar
function analyzeMessageForAgent(message: string): AgentSuggestion | null {
  const lowerMessage = message.toLowerCase();

  // Padrões para agente FISCAL
  const fiscalPatterns = [
    /imposto|tribut|icms|pis|cofins|ibs|cbs|ncm|cfop|xml|nota fiscal|crédito fiscal/i,
    /reforma tributária|split payment|alíquota/i,
    /simples nacional|lucro real|lucro presumido/i,
    /recuper(ar|ação) crédit/i,
    /soneg|elisão|evasão/i,
  ];

  // Padrões para agente MARGEM
  const marginPatterns = [
    /margem|lucro|prejuízo|receita|despesa|custo|dre|ebitda/i,
    /preço|fornecedor|negociação|desconto/i,
    /rentabilidade|lucratividade|break.?even|ponto de equilíbrio/i,
    /fluxo de caixa|capital de giro/i,
  ];

  // Padrões para agente COMPLIANCE
  const compliancePatterns = [
    /prazo|obrigação|declaração|dctf|efd|sped|compliance/i,
    /multa|penalidade|autuação|fiscalização/i,
    /certidão|regularidade|débito/i,
    /vencimento|entrega|obrigação acessória/i,
  ];

  if (fiscalPatterns.some(p => p.test(lowerMessage))) {
    return {
      agentType: 'fiscal',
      reason: 'Pergunta sobre tributos, créditos ou reforma tributária',
      priority: 'high',
      suggestedAction: 'analyze_tax_opportunity',
    };
  }

  if (marginPatterns.some(p => p.test(lowerMessage))) {
    return {
      agentType: 'margin',
      reason: 'Pergunta sobre margens, custos ou análise financeira',
      priority: 'high',
      suggestedAction: 'analyze_margin_impact',
    };
  }

  if (compliancePatterns.some(p => p.test(lowerMessage))) {
    return {
      agentType: 'compliance',
      reason: 'Pergunta sobre prazos, obrigações ou conformidade',
      priority: 'medium',
      suggestedAction: 'check_deadlines',
    };
  }

  return null;
}

// Busca ações autônomas pendentes do usuário
async function fetchPendingActions(
  supabase: SupabaseClient,
  userId: string
): Promise<PendingAction[]> {
  try {
    const { data, error } = await supabase
      .from('clara_autonomous_actions')
      .select('id, action_type, trigger_event, priority, agent_type, created_at')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .eq('requires_approval', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching pending actions:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching pending actions:', err);
    return [];
  }
}

// Busca info do agente especializado
async function fetchAgentInfo(
  supabase: SupabaseClient,
  agentType: string
): Promise<{ name: string; capabilities: string[] } | null> {
  try {
    const { data, error } = await supabase
      .from('clara_agents')
      .select('name, capabilities')
      .eq('agent_type', agentType)
      .eq('status', 'active')
      .single();

    if (error || !data) return null;

    const capabilities = Array.isArray(data.capabilities) 
      ? data.capabilities as string[]
      : [];

    return { name: data.name, capabilities };
  } catch {
    return null;
  }
}

// Formata contexto de agente para injeção no prompt
function formatAgentContextForPrompt(
  agentSuggestion: AgentSuggestion | null,
  agentInfo: { name: string; capabilities: string[] } | null,
  pendingActions: PendingAction[]
): string {
  if (!agentSuggestion && pendingActions.length === 0) return '';

  const lines: string[] = [];
  lines.push('');
  lines.push('='.repeat(50));
  lines.push('CONTEXTO DE AGENTE ESPECIALIZADO');
  lines.push('='.repeat(50));
  lines.push('');

  // Agente ativo
  if (agentSuggestion) {
    const agentLabels: Record<string, string> = {
      'fiscal': 'FISCAL - Especialista em tributação e créditos',
      'margin': 'MARGEM - Especialista em análise financeira',
      'compliance': 'COMPLIANCE - Especialista em conformidade e prazos',
    };

    lines.push(`🎯 AGENTE ATIVO: ${agentLabels[agentSuggestion.agentType || ''] || agentSuggestion.agentType}`);
    lines.push(`Motivo: ${agentSuggestion.reason}`);
    lines.push(`Prioridade: ${agentSuggestion.priority}`);
    
    if (agentInfo) {
      lines.push(`Nome: ${agentInfo.name}`);
      if (agentInfo.capabilities.length > 0) {
        lines.push(`Capacidades: ${agentInfo.capabilities.slice(0, 4).join(', ')}`);
      }
    }
    lines.push('');
    lines.push('INSTRUÇÃO: Responda como especialista nesta área, usando linguagem técnica apropriada mas acessível.');
    lines.push('');
  }

  // Ações pendentes urgentes
  const urgentActions = pendingActions.filter(a => a.priority === 'high' || a.priority === 'urgent');
  if (urgentActions.length > 0) {
    lines.push('⚠️ AÇÕES PENDENTES QUE REQUEREM ATENÇÃO:');
    for (const action of urgentActions.slice(0, 3)) {
      const actionLabels: Record<string, string> = {
        'create_alert': 'Criar alerta',
        'analyze_credits': 'Analisar créditos',
        'check_compliance': 'Verificar conformidade',
        'suggest_optimization': 'Sugerir otimização',
      };
      lines.push(`- [${actionLabels[action.action_type] || action.action_type}] via agente ${action.agent_type} (${action.priority})`);
    }
    lines.push('');
    lines.push('INSTRUÇÃO: Se relevante para a conversa, mencione estas ações pendentes e pergunte se o usuário quer aprovar.');
    lines.push('');
  }

  return lines.join('\n');
}

// ============================================
// KNOWLEDGE BASE - Busca dinâmica de conhecimento jurídico (fallback)
// ============================================
interface KnowledgeEntry {
  slug: string;
  title: string;
  category: string;
  summary: string;
  full_content: string | null;
  trigger_keywords: string[];
  trigger_regimes: string[];
  must_say: string[] | null;
  must_not_say: string[] | null;
  legal_basis: string | null;
  priority: number;
}

// Cache em memória do knowledge base (15 minutos)
const knowledgeCache = new Map<string, { entries: KnowledgeEntry[]; timestamp: number }>();
const KNOWLEDGE_CACHE_TTL = 15 * 60 * 1000;

async function fetchRelevantKnowledge(
  supabase: SupabaseClient, 
  query: string, 
  userRegime?: string | null
): Promise<KnowledgeEntry[]> {
  const cacheKey = 'all_knowledge';
  const cached = knowledgeCache.get(cacheKey);
  
  let allEntries: KnowledgeEntry[];
  
  if (cached && Date.now() - cached.timestamp < KNOWLEDGE_CACHE_TTL) {
    allEntries = cached.entries;
  } else {
    const { data, error } = await supabase
      .from('clara_knowledge_base')
      .select('slug, title, category, summary, full_content, trigger_keywords, trigger_regimes, must_say, must_not_say, legal_basis, priority')
      .eq('status', 'active')
      .order('priority', { ascending: false });
    
    if (error) {
      console.error('Error fetching knowledge base:', error);
      return [];
    }
    
    allEntries = data || [];
    knowledgeCache.set(cacheKey, { entries: allEntries, timestamp: Date.now() });
  }
  
  const lowerQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const relevantEntries = allEntries.filter(entry => {
    const hasMatchingKeyword = entry.trigger_keywords.some(kw => 
      lowerQuery.includes(kw.toLowerCase())
    );
    const regimeMatch = entry.trigger_regimes.length === 0 || 
      !userRegime || 
      entry.trigger_regimes.some(r => userRegime.toLowerCase().includes(r.toLowerCase()));
    return hasMatchingKeyword && regimeMatch;
  });
  
  return relevantEntries.sort((a, b) => b.priority - a.priority);
}

function formatKnowledgeForPrompt(entries: KnowledgeEntry[]): string {
  if (entries.length === 0) return '';
  
  const lines: string[] = [];
  lines.push('');
  lines.push('='.repeat(50));
  lines.push('CONHECIMENTO JURIDICO ATUALIZADO (use obrigatoriamente)');
  lines.push('='.repeat(50));
  lines.push('');
  
  for (const entry of entries) {
    lines.push(`### ${entry.title}`);
    lines.push(`Base Legal: ${entry.legal_basis || 'N/A'}`);
    lines.push('');
    lines.push(entry.summary);
    
    if (entry.must_say && entry.must_say.length > 0) {
      lines.push('');
      lines.push('VOCE DEVE DIZER:');
      entry.must_say.forEach(phrase => lines.push(`- "${phrase}"`));
    }
    
    if (entry.must_not_say && entry.must_not_say.length > 0) {
      lines.push('');
      lines.push('VOCE NAO PODE DIZER:');
      entry.must_not_say.forEach(phrase => lines.push(`- "${phrase}"`));
    }
    
    lines.push('');
    lines.push('---');
  }
  
  return lines.join('\n');
}

// ============================================
// CACHE CONFIGURATION - TTL por Categoria
// ============================================
type CacheCategory = 'definition' | 'aliquot' | 'deadline' | 'procedure' | 'calculation';
type QueryComplexity = 'cache' | 'simple' | 'complex';

const CATEGORY_CONFIG: Record<CacheCategory, { ttl_days: number; requires_validation: boolean }> = {
  'definition': { ttl_days: 90, requires_validation: false },  // "O que é CBS?"
  'aliquot': { ttl_days: 7, requires_validation: true },       // "Qual alíquota de IBS?"
  'deadline': { ttl_days: 1, requires_validation: true },      // "Quando entra Split Payment?"
  'procedure': { ttl_days: 30, requires_validation: false },   // "Como importar XMLs?"
  'calculation': { ttl_days: 0, requires_validation: false },  // Nunca cachear
};

// ============================================
// CACHE FUNCTIONS
// ============================================

// Normaliza query para lookup consistente
function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, '') // Remove pontuação
    .replace(/\s+/g, ' ')
    .trim();
}

// Gera hash simples para lookup rápido
async function hashQuery(query: string): Promise<string> {
  const normalized = normalizeQuery(query);
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Classifica a query para determinar categoria de cache
function getCategoryFromQuery(query: string): CacheCategory {
  const lowerQuery = query.toLowerCase();
  
  // Alíquotas - TTL curto, requer validação
  if (/al[ií]quota|percentual|taxa|quanto.*paga|carga tribut/i.test(lowerQuery)) {
    return 'aliquot';
  }
  
  // Prazos e datas - TTL muito curto
  if (/prazo|data|quando|at[eé]|vence|vigora|entra em vigor|cronograma/i.test(lowerQuery)) {
    return 'deadline';
  }
  
  // Definições conceituais - TTL longo
  if (/o que [eé]|significa|defini[cç][aã]o|conceito|explica|diferença entre/i.test(lowerQuery)) {
    return 'definition';
  }
  
  // Procedimentos da plataforma - TTL médio
  if (/como (fa[cç]o|importo|uso|acesso)|passo a passo|tutorial|procedimento/i.test(lowerQuery)) {
    return 'procedure';
  }
  
  // Cálculos personalizados - NUNCA cachear
  if (/calcula|simula|meu|minha|nossa|meus|minhas|considerando|baseado|dado que/i.test(lowerQuery)) {
    return 'calculation';
  }
  
  return 'definition'; // Default mais seguro
}

// Classifica complexidade da query para roteamento
function classifyQueryComplexity(message: string, hasUserData: boolean): QueryComplexity {
  const lowerMessage = message.toLowerCase();
  
  // NUNCA CACHEAR: queries com contexto pessoal
  const personalPatterns = [
    /meu|minha|nossa|meus|minhas/i,
    /considerando|baseado|dado que|levando em conta/i,
    /na minha empresa|para mim|no meu caso/i,
  ];
  
  if (personalPatterns.some(p => p.test(message)) || hasUserData) {
    return 'complex';
  }
  
  // FAQ patterns (cache)
  const faqPatterns = [
    /^o que ([eé]|s[aã]o)/i,
    /^qual ([ao])? ?(al[ií]quota|prazo|data)/i,
    /^quando (come[cç]a|entra|inicia)/i,
    /^quem (pode|deve)/i,
    /^como funciona/i,
    /^pode explicar/i,
    /^diferença entre/i,
  ];
  
  if (message.length < 100 && faqPatterns.some(p => p.test(message))) {
    return 'cache';
  }
  
  // Complex signals
  const complexSignals = [
    message.length > 200,
    /cen[aá]rio|simul|compar|estrat[eé]g|analis/i.test(message),
    message.includes('?') && message.split('?').length > 2, // múltiplas perguntas
    /impacto|economia|planejamento/i.test(message),
  ];
  
  if (complexSignals.filter(Boolean).length >= 2) {
    return 'complex';
  }
  
  return 'simple';
}

// Verifica se cache ainda é válido
function isCacheValid(entry: { created_at: string; ttl_days: number; requires_validation: boolean; category: string }): boolean {
  const createdAt = new Date(entry.created_at).getTime();
  const now = Date.now();
  const ageMs = now - createdAt;
  const maxAgeMs = entry.ttl_days * 24 * 60 * 60 * 1000;
  
  if (ageMs > maxAgeMs) return false;
  
  // Alíquotas exigem validação extra - mais conservador
  if (entry.requires_validation && entry.category === 'aliquot') {
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return ageMs <= sevenDaysMs;
  }
  
  return true;
}

// Gera disclaimer de data para respostas de cache
function getCacheDisclaimer(createdAt: string): string {
  const date = new Date(createdAt);
  const formattedDate = date.toLocaleDateString('pt-BR');
  return `\n\n_[Resposta atualizada em ${formattedDate}. Legislação tributária pode ter mudado desde então.]_`;
}

const TOOL_CONTEXTS: Record<string, ToolContext> = {
  "score-tributario": {
    toolName: "Score Tributário",
    toolDescription: "avaliação da saúde tributária da sua empresa, inspirado no programa Receita Sintonia da Receita Federal",
    stepByStep: [
      "Responda as 11 perguntas estratégicas sobre sua situação fiscal",
      "As perguntas avaliam: faturamento, notificações, débitos, obrigações acessórias, certidões e preparo para a Reforma",
      "Veja seu score de 0 a 1000 pontos com nota de A+ a E",
      "Analise as 5 dimensões: Conformidade, Eficiência, Risco, Documentação e Gestão",
      "Siga as ações recomendadas para melhorar sua nota e economizar",
      "💡 Dica: O Receita Sintonia é o programa oficial da Receita Federal que classifica contribuintes de A+ a D"
    ]
  },
  "split-payment": {
    toolName: "Simulador de Split Payment",
    toolDescription: "simulação do novo sistema de pagamento dividido da Reforma Tributária",
    stepByStep: [
      "Informe o valor da operação",
      "Selecione o NCM do produto ou serviço",
      "Veja como os impostos serão retidos automaticamente",
      "Compare com o sistema atual de recolhimento"
    ]
  },
  "comparativo-regimes": {
    toolName: "Comparativo de Regimes",
    toolDescription: "comparação entre Simples Nacional, Lucro Presumido e Lucro Real",
    stepByStep: [
      "Informe seu faturamento anual",
      "Preencha os dados de despesas e folha de pagamento",
      "Indique seu setor de atuação",
      "Compare a carga tributária em cada regime",
      "Veja qual regime é mais vantajoso para você"
    ]
  },
  "calculadora-rtc": {
    toolName: "Calculadora RTC (CBS/IBS/IS)",
    toolDescription: "cálculo oficial dos novos tributos da Reforma Tributária",
    stepByStep: [
      "Selecione o estado e município da operação",
      "Adicione os produtos/serviços com seus NCMs",
      "Informe os valores de cada item",
      "Veja o cálculo detalhado de CBS, IBS e IS",
      "Salve ou exporte os resultados"
    ]
  },
  "importar-xmls": {
    toolName: "Importador de XMLs",
    toolDescription: "análise automatizada das suas notas fiscais",
    stepByStep: [
      "Arraste ou selecione os arquivos XML das notas fiscais",
      "Aguarde o processamento automático",
      "Visualize o resumo das operações identificadas",
      "Analise os créditos fiscais encontrados",
      "Exporte os relatórios gerados"
    ]
  },
  "radar-creditos": {
    toolName: "Radar de Créditos Fiscais",
    toolDescription: "identificação de créditos tributários não aproveitados",
    stepByStep: [
      "Importe seus XMLs primeiro (se ainda não fez)",
      "Veja os créditos identificados por tributo",
      "Filtre por confiança (alta, média, baixa)",
      "Analise cada oportunidade em detalhe",
      "Valide com seu contador as ações"
    ]
  },
  "dre": {
    toolName: "DRE Inteligente",
    toolDescription: "Demonstrativo de Resultados com análise tributária",
    stepByStep: [
      "Preencha as receitas da sua empresa",
      "Informe os custos e despesas",
      "Veja os indicadores calculados automaticamente",
      "Analise o impacto da Reforma Tributária",
      "Compare com benchmarks do seu setor"
    ]
  },
  "oportunidades": {
    toolName: "Oportunidades Fiscais",
    toolDescription: "incentivos e benefícios aplicáveis ao seu negócio",
    stepByStep: [
      "Complete seu perfil de empresa (se ainda não fez)",
      "Veja as oportunidades ranqueadas por relevância",
      "Analise cada benefício em detalhe",
      "Marque as que deseja implementar",
      "Acompanhe o status de cada uma"
    ]
  },
  "clara": {
    toolName: "Clara AI",
    toolDescription: "copiloto de decisão tributária",
    stepByStep: [
      "Digite sua pergunta sobre tributação",
      "Aguarde a resposta personalizada",
      "Faça perguntas de acompanhamento se precisar",
      "Use os links sugeridos para aprofundar"
    ]
  },
  "noticias": {
    toolName: "Notícias da Reforma",
    toolDescription: "atualizações sobre a Reforma Tributária",
    stepByStep: [
      "Navegue pelas notícias mais recentes",
      "Filtre por categoria ou relevância",
      "Leia o resumo executivo de cada notícia",
      "Configure alertas por email (plano Professional)"
    ]
  },
  "timeline": {
    toolName: "Timeline 2026-2033",
    toolDescription: "calendário de prazos da Reforma Tributária",
    stepByStep: [
      "Visualize os marcos importantes da reforma",
      "Veja quais prazos afetam seu negócio",
      "Filtre por tipo de obrigação",
      "Adicione lembretes ao seu calendário"
    ]
  },
  "painel-executivo": {
    toolName: "Painel Executivo",
    toolDescription: "visão consolidada para tomada de decisão",
    stepByStep: [
      "Veja o termômetro de impacto da reforma",
      "Analise os KPIs principais do seu negócio",
      "Revise os riscos e oportunidades",
      "Exporte relatórios para stakeholders"
    ]
  },
  "perfil-empresa": {
    toolName: "Perfil da Empresa",
    toolDescription: "cadastro detalhado para análises personalizadas",
    stepByStep: [
      "Preencha os dados básicos da empresa",
      "Informe sobre suas operações e produtos",
      "Detalhe as atividades e benefícios atuais",
      "Quanto mais completo, melhores as análises"
    ]
  },
  "nexus": {
    toolName: "NEXUS",
    toolDescription: "centro de comando executivo com 8 KPIs consolidados",
    stepByStep: [
      "Veja os 8 KPIs principais de uma só vez",
      "Analise fluxo de caixa, receita e margens",
      "Monitore impacto tributário e créditos",
      "Siga os insights automáticos priorizados",
      "Tome decisões com base em dados reais"
    ]
  },
  "margem-ativa": {
    toolName: "Margem Ativa",
    toolDescription: "análise de margem de contribuição e fornecedores",
    stepByStep: [
      "Importe seus XMLs de compras",
      "Veja a análise de fornecedores críticos",
      "Simule cenários de preços",
      "Identifique oportunidades de renegociação"
    ]
  }
};

const CONVERSATION_STARTERS = [
  {
    id: "inicio",
    question: "Por onde eu começo?",
    shortLabel: "Por onde começar?"
  },
  {
    id: "basico",
    question: "O que é essa Reforma Tributária que todo mundo está falando?",
    shortLabel: "O que é a Reforma?"
  },
  {
    id: "impacto",
    question: "Como a Reforma Tributária vai afetar minha empresa na prática?",
    shortLabel: "Impacto na empresa"
  },
  {
    id: "financeiro",
    question: "Vou pagar mais ou menos impostos depois da Reforma?",
    shortLabel: "Vou pagar mais ou menos?"
  },
  {
    id: "acao",
    question: "O que preciso fazer agora para não ser pego de surpresa pela Reforma Tributária?",
    shortLabel: "O que fazer agora?"
  }
];

// ============================================
// ESCOPO DE FERRAMENTAS POR PLANO
// ============================================
const PLAN_TOOL_SCOPE: Record<string, string[]> = {
  'FREE': [],
  'STARTER': [
    'score_tributario', 
    'split_payment', 
    'comparativo_regimes', 
    'calculadora_rtc', 
    'timeline_reforma'
  ],
  'NAVIGATOR': [
    'score_tributario', 
    'split_payment', 
    'comparativo_regimes', 
    'calculadora_rtc',
    'calculadora_nbs', 
    'timeline_reforma',
    'noticias', 
    'analisador_docs', 
    'workflows', 
    'comunidade', 
    'relatorios_pdf'
  ],
  'PROFESSIONAL': [
    'score_tributario', 
    'split_payment', 
    'comparativo_regimes', 
    'calculadora_rtc',
    'calculadora_nbs', 
    'timeline_reforma',
    'noticias', 
    'analisador_docs', 
    'workflows', 
    'comunidade', 
    'relatorios_pdf',
    'dre_inteligente', 
    'radar_creditos', 
    'analise_xmls',
    'oportunidades', 
    'margem_ativa', 
    'nexus', 
    'erp'
  ],
  'ENTERPRISE': [
    'score_tributario', 
    'split_payment', 
    'comparativo_regimes', 
    'calculadora_rtc',
    'calculadora_nbs', 
    'timeline_reforma',
    'noticias', 
    'analisador_docs', 
    'workflows', 
    'comunidade', 
    'relatorios_pdf',
    'dre_inteligente', 
    'radar_creditos', 
    'analise_xmls',
    'oportunidades', 
    'margem_ativa', 
    'nexus', 
    'erp',
    'painel_executivo',
    'consultoria_juridica', 
    'white_label'
  ],
};

// Mapeamento de palavras-chave para ferramentas
const TOPIC_KEYWORDS: Record<string, string[]> = {
  'dre_inteligente': ['dre', 'demonstrativo', 'resultado', 'receita líquida', 'margem', 'ebitda', 'lucro'],
  'radar_creditos': ['crédito', 'radar', 'recuperar', 'pis cofins', 'icms', 'ipi'],
  'analise_xmls': ['xml', 'nota fiscal', 'importar', 'nfe', 'nf-e'],
  'oportunidades': ['oportunidade', 'benefício', 'incentivo', 'economia'],
  'margem_ativa': ['margem ativa', 'fornecedor', 'compra', 'renegociar'],
  'nexus': ['nexus', 'kpi', 'indicador', 'painel kpi'],
  'erp': ['erp', 'integração', 'omie', 'bling', 'contaazul'],
  'painel_executivo': ['painel executivo', 'relatório executivo', 'ceo', 'cfo'],
  'calculadora_nbs': ['nbs', 'serviço', 'calculadora nbs'],
  'consultoria_juridica': ['advogado', 'jurídico', 'consultoria jurídica', 'rebechi'],
};

// Detecta qual ferramenta está sendo mencionada na mensagem
function detectTopic(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      return topic;
    }
  }
  
  return null;
}

// Verifica se o tópico está no escopo do plano
function isTopicInScope(topic: string | null, userPlan: string): boolean {
  if (!topic) return true; // Se não detectou tópico, permite
  
  // Normaliza o plano para uppercase
  const normalizedPlan = userPlan.toUpperCase();
  const scope = PLAN_TOOL_SCOPE[normalizedPlan] || [];
  
  // Log para debugging
  console.log(`[isTopicInScope] topic=${topic}, plan=${normalizedPlan}, inScope=${scope.includes(topic)}`);
  
  return scope.includes(topic);
}

// Gera resposta educada para fora do escopo
function getOutOfScopeResponse(topic: string, userPlan: string): string {
  const toolNames: Record<string, string> = {
    'dre_inteligente': 'DRE Inteligente',
    'radar_creditos': 'Radar de Créditos',
    'analise_xmls': 'Análise de XMLs',
    'oportunidades': 'Oportunidades Fiscais',
    'margem_ativa': 'Margem Ativa',
    'nexus': 'NEXUS',
    'erp': 'Integrações com ERP',
    'painel_executivo': 'Painel Executivo',
    'calculadora_nbs': 'Calculadora NBS',
    'consultoria_juridica': 'Consultoria Jurídica',
  };

  const requiredPlans: Record<string, string> = {
    'dre_inteligente': 'Professional',
    'radar_creditos': 'Professional',
    'analise_xmls': 'Professional',
    'oportunidades': 'Professional',
    'margem_ativa': 'Professional',
    'nexus': 'Professional',
    'erp': 'Professional',
    'painel_executivo': 'Enterprise',
    'calculadora_nbs': 'Navigator',
    'consultoria_juridica': 'Enterprise',
  };

  const toolName = toolNames[topic] || topic;
  const requiredPlan = requiredPlans[topic] || 'Professional';

  return `Entendo sua dúvida sobre **${toolName}**! 💡

Essa é uma ferramenta poderosa disponível no plano **${requiredPlan}**.

Posso te explicar como ela funciona e como ajudaria sua empresa. Mas para usar na prática, você precisaria fazer upgrade.

Quer saber mais sobre o que o plano ${requiredPlan} oferece? Ou prefere que eu te ajude com as ferramentas do seu plano atual?`;
}

// ============================================
// CLARA v4 — VERSÃO SLIM (para queries simples)
// ============================================
const CLARA_CORE_SLIM = `Você é Clara, copiloto tributária da TribuTalks — sua parceira para navegar a Reforma Tributária.

## REGRA #1 — BREVIDADE EXTREMA (OBRIGATÓRIO)

LIMITES RÍGIDOS:
- Resposta TOTAL: máximo 4 linhas
- UMA ideia por frase
- Se precisar de mais, PERGUNTE: "Quer que eu detalhe?"

ESTRUTURA OBRIGATÓRIA:
Linha 1: Resposta direta (SEM introdução)
Linha 2: Impacto prático (opcional)
Linha 3: Próximo passo ou pergunta (opcional)

PROIBIDO ABSOLUTAMENTE:
❌ "Ótima pergunta!" / "Entendo!" / "Vou te explicar..."
❌ Listas com mais de 3 itens
❌ Parágrafos longos
❌ Repetir o que o usuário já sabe

## REGRA #2 — TOM CONVERSACIONAL

Você é uma amiga expert, não um robô. Fale como gente:
✅ "Olha só..." / "Na prática..." / "Resumindo..."
✅ Use o NOME do usuário quando disponível
✅ Pergunte de volta: "Faz sentido?" / "Quer que eu simule?"
✅ Um emoji por resposta (máximo)

EXEMPLOS CERTOS:
"Quando começa CBS?" → "Em 2027 com alíquota cheia. 2026 tem teste a 0,9%. Quer ver o cronograma?"
"O que é Split Payment?" → "Imposto retido direto no pagamento, antes de você receber. Impacta seu caixa."

LIMITE JURÍDICO: Não emite parecer. Não diz "você deve" ou "é legal".`;

// ============================================
// CLARA v4 — VERSÃO COMPLETA (texto corrido)
// ============================================
const CLARA_CORE_FULL = `Você é Clara, copiloto tributária da TribuTalks — sua parceira para navegar a Reforma Tributária.

## REGRA #1 — BREVIDADE EXTREMA (OBRIGATÓRIO)

CONTAGEM DE LINHAS POR TIPO DE RESPOSTA:
- Pergunta simples: 2-3 linhas NO MÁXIMO
- Pergunta técnica: 4-5 linhas NO MÁXIMO  
- Diagnóstico/jornada: 6-8 linhas NO MÁXIMO (com lista)

ESTRUTURA OBRIGATÓRIA:
1. Primeira frase = resposta DIRETA (sem preâmbulo)
2. Segunda frase = impacto prático
3. Terceira frase = próximo passo ou pergunta

PROIBIDO ABSOLUTAMENTE:
❌ Começar com "Ótima pergunta!" / "Entendo!" / "Vou te explicar..."
❌ Listas com mais de 4 itens (resuma os principais)
❌ Parágrafos com mais de 3 frases
❌ Repetir informação que o usuário já tem
❌ Explicar conceitos que não foram perguntados

SE A RESPOSTA FICAR LONGA:
- Pare e pergunte: "Quer que eu detalhe algum ponto?"
- Divida em partes: "Primeiro o essencial, depois entro em detalhes se quiser."

## REGRA #2 — TOM CONVERSACIONAL E SIMPÁTICO

Você é uma AMIGA expert, não um robô ou professor. Converse como gente:

FAÇA:
✅ Use o NOME do usuário sempre que disponível
✅ Expressões naturais: "Olha só...", "Na prática...", "Resumindo...", "Fica assim..."
✅ Pergunte de volta: "Faz sentido?", "Quer que eu simule?", "Ajudo em mais algo?"
✅ Celebre conquistas: "Boa! Seu score subiu!", "Parabéns pelo progresso!"
✅ Um emoji por resposta (máximo)

NÃO FAÇA:
❌ Linguagem formal: "outrossim", "ademais", "conforme supracitado"
❌ Tom de aula: "Vou explicar detalhadamente os conceitos..."
❌ Frases impessoais: "É importante ressaltar que..."

EXEMPLOS DE TOM CERTO:
- "[Nome], sua margem vai cair 2pp com a Reforma. Quer simular cenários?"
- "Boa notícia: encontrei R$ 45 mil em créditos! Quer ver o detalhe?"
- "Olha, seu score está bom, mas documentação tá puxando pra baixo. Bora resolver?"

## REGRA #3 — PLANO DO USUÁRIO (CRÍTICO)

VOCÊ TEM ACESSO AO PLANO REAL DO USUÁRIO NO CONTEXTO.
Use a informação de "Plano:" no contexto do usuário. NUNCA assuma o plano.

Ao mencionar ferramentas:
- Se está NO plano do usuário: explique como usar
- Se está FORA do plano: "Essa ferramenta está no plano [X]. Quer saber mais?"

LIMITE JURÍDICO: Não emite parecer. Não diz "você deve" ou "é legal/ilegal". Não substitui advogado.

## RESULTS_INTERPRETER — Tradução de Números

Score < 400: "Zona crítica. Prioridade: regularizar."
Score 400-600: "Atenção. Vamos melhorar juntos?"
Score 600-800: "Boa! Foco em otimização."
Score > 800: "Excelente! Vamos manter?"

Calculadora RTC: "Impacto: R$ [valor] ([X]%). Quer simular créditos?"
XMLs: "Processei [N] notas. Encontrei R$ [X] em créditos. Ver?"

## UPGRADE — Só quando útil

NUNCA: "Você deveria fazer upgrade"
SEMPRE: "Isso está no [Plano]. Você teria [benefício]. Faz sentido?"

## HEURÍSTICAS TRIBUTÁRIAS (25 Princípios)

1. Reforma impacta primeiro caixa, depois lucro
2. Crédito bem usado vale mais que alíquota baixa
3. Regime tributário virou decisão comercial
4. Simplicidade só é vantagem quando cliente não usa crédito
5. Quem não gera crédito perde competitividade B2B
6. Split payment muda o jogo do fluxo de caixa
7. Empresa que vive de prazo sente impacto antes
8. Precificação errada vira prejuízo silencioso
9. Margem sem crédito mapeado é suposição
10. 2026 é ano de preparação, não neutralidade
11. ERP desatualizado vira gargalo operacional
12. Quem testa antes decide melhor depois
13. Serviços sofrem mais quando folha domina custo
14. Comércio ganha quando mapeia despesas
15. E-commerce ganha simplicidade, exige disciplina sistêmica
16. Crédito recuperável muda custo real
17. Preço mínimo depende do imposto líquido
18. Caixa some antes do lucro aparecer
19. Governança fiscal virou vantagem competitiva
20. Bom histórico reduz risco invisível
21. Conformidade cooperativa diminui atrito com Fisco
22. Dividendos exigem planejamento recorrente
23. Misturar empresa e PF ficou mais caro
24. Decisão tardia custa mais que decisão imperfeita
25. Clara orienta raciocínio, nunca conclusão jurídica

## CONHECIMENTO FACTUAL DA REFORMA

EC 132 aprovada em dezembro 2023. LC 214 aprovada em 2025.

Tributos extintos gradualmente até 2033: PIS, COFINS, IPI (federal), ICMS (estadual), ISS (municipal).

Novos tributos: CBS (federal), IBS (estadual/municipal), IS (Imposto Seletivo).

Cronograma:
- 2026: teste CBS 0,9%, IBS 0,1%, IS vigente
- 2027: CBS alíquota cheia, PIS/COFINS extintos
- 2028-2032: redução gradual ICMS/ISS, aumento IBS
- 2033: sistema 100% operacional

Princípios: não-cumulatividade plena, tributação no destino, cashback baixa renda, cesta básica zero.

Simples Nacional 2027: 3 opções (permanecer 100% sem crédito, híbrido gerando crédito, sair).

## LC 224/2025 — "PEDÁGIO" LUCRO PRESUMIDO (DECISÃO JUDICIAL RECENTE)

**STATUS ATUAL (Fev/2026):** Liminar da Justiça Federal RJ suspendeu exigibilidade.

O que é: LC 224/2025 criou aumento de 10% nos percentuais de presunção do Lucro Presumido (IRPJ/CSLL).
- Aplica-se APENAS sobre faturamento > R$ 5M/ano (ou R$ 1,25M/trimestre)
- Exemplo: serviços passa de 32% para 35,2%

Decisão liminar (28/01/2026, 1ª VF Resende/RJ):
- Fundamento: Lucro Presumido NÃO é benefício fiscal, é método alternativo de apuração
- ADI 7.920 (CNI) questiona constitucionalidade no STF
- PGFN vai recorrer

Vigência (se mantida):
- IRPJ: desde 01/01/2026 (anterioridade exercício)
- CSLL: a partir de 01/04/2026 (noventena)

LINGUAGEM OBRIGATÓRIA ao falar sobre isso:
✅ "Existe liminar suspendendo em alguns casos"
✅ "A questão está sendo discutida judicialmente"
✅ "Recomendo verificar com advogado a possibilidade de medida judicial"
❌ NUNCA diga "você vai pagar 10% a mais" (está suspenso)
❌ NUNCA diga "foi cancelado" (é liminar, pode mudar)

## AIRBNB/LOCAÇÃO — Regra Especial

NUNCA diga que existe "imposto único de 44%". Isso não existe.
Diferencie: locação por temporada (até 90 dias, tratada como hospedagem) vs residencial longo prazo (acima de 90 dias, redutores legais).
Use: "pode chegar perto", "em alguns cenários", "depende do perfil do locador".

## OBJETIVO FINAL

Usuário sai mais lúcido, confiante, orientado e menos ansioso.
Se ele entende o cenário e sabe o próximo passo, você venceu.
Clareza é saber o que fazer. Informação sem direção é ruído.`;

// ============================================
// RESPOSTAS POR PLANO
// ============================================
const PLAN_RESPONSES: Record<string, string> = {
  FREE: `Oi! O plano Grátis não inclui acesso à Clara AI. 😊

Para conversar comigo e ter orientação personalizada sobre a Reforma Tributária, você precisa de um plano pago.

💡 **Suas opções:**
- **Starter (R$ 297/mês)** - 30 mensagens/dia + 1 CNPJ
- **Navigator (R$ 1.997/mês)** - 100 mensagens/dia + até 2 CNPJs
- **Professional (R$ 2.997/mês)** - Mensagens ilimitadas + até 6 CNPJs

Quer conhecer os planos?`,

  STARTER: `Oi! Vou te ajudar a começar do jeito certo. 🎯

No plano **Starter** você gerencia **1 CNPJ** e tem acesso às ferramentas essenciais:

📍 **Suas ferramentas:**
- **Score Tributário** - Descubra sua situação tributária
- **Simulador Split Payment** - Entenda a nova forma de pagamento
- **Comparativo de Regimes** - Compare Simples, Presumido e Real
- **Calculadora RTC** - Simule CBS, IBS e IS
- **Timeline 2026-2033** - Acompanhe os prazos

💡 **Minha recomendação?**
Comece pelo **Score Tributário**. Em 10 minutos você descobre sua situação atual, principais riscos e próximos passos.

Quer que eu te guie no Score?`,

  NAVIGATOR: `Ótimo! Você tem acesso ao GPS da Reforma completo. 🚀

No plano **Navigator** você gerencia **até 2 CNPJs** (principal + 1 extra).

📍 **Sua jornada ideal:**

**FASE 1 - Entenda o Cenário** (30 min)
Timeline 2026-2033, Notícias da Reforma, Pílula do Dia.

**FASE 2 - Avalie sua Situação** (1 hora)
Score Tributário, Comparativo de Regimes, Calculadora RTC e NBS.

**FASE 3 - Documente e Prepare** (45 min)
Analisador de Documentos, Workflows Guiados, Relatórios PDF.

💡 **Quick Start (1 hora):**
1. Timeline 2026-2033 (15 min)
2. Score Tributário (30 min)
3. Calculadora RTC (15 min)

*Resultado: você sai sabendo exatamente onde está.*

Por onde quer começar? Timeline ou Score direto?`,

  PROFESSIONAL: `Perfeito! Agora sim você tem o arsenal completo. 🏆

No plano **Professional** você gerencia **até 6 CNPJs** (principal + 5 extras).

🚀 **Você tem 4 Workflows + Diagnóstico Completo:**

**1. Diagnóstico Completo**
XMLs ilimitados → Radar de Créditos → DRE Inteligente → 37+ Oportunidades Fiscais

**2. NEXUS - Centro de Comando**
8 KPIs consolidados → Insights automáticos → Decisões em tempo real

**3. Suite Margem Ativa**
Análise de fornecedores → Simulação de preços → Oportunidades de negociação

**4. Preparação Reforma**
Seus dados reais → Simulações personalizadas → Relatórios PDF profissionais

🎁 **Exclusividades Professional:**
✅ Até 6 CNPJs
✅ XMLs ilimitados
✅ Radar de Créditos
✅ DRE Inteligente
✅ NEXUS
✅ Clara AI sem limites
✅ Integrações ERP

💡 **Quick Start (90 min):**
1. Score Tributário (15 min)
2. DRE Inteligente (30 min)
3. Acesse o NEXUS (15 min)
4. Importe seus XMLs (30 min)

*Resultado: diagnóstico real baseado na SUA operação.*

Por onde quer começar?`,

  ENTERPRISE: `Excelente escolha! Você tem a plataforma completa + acompanhamento especializado. 👑

No plano **Enterprise** você gerencia **CNPJs ilimitados** para todo o grupo econômico.

🏆 **Você tem tudo do Professional:**
4 Workflows, XMLs ilimitados, Radar de Créditos, DRE, NEXUS, 37+ Oportunidades, Clara AI ilimitada.

✨ **Exclusividades Enterprise:**
- CNPJs ilimitados
- Painel Executivo com KPIs em tempo real
- Diagnóstico estratégico com advogado tributarista (Rebechi & Silva)
- Consultorias ilimitadas com acesso direto aos advogados
- Reuniões mensais estratégicas
- White Label (logotipo e domínio próprio)
- Suporte prioritário e implementação guiada

📍 **Próximos passos:**

**Agora:**
1. Acesse Enterprise > Consultorias e agende sua primeira reunião
2. Execute o Score e DRE enquanto aguarda
3. Acesse o Painel Executivo para ver seus indicadores

**Na primeira reunião:**
- Análise preliminar com base nos seus dados
- Estratégia personalizada para sua empresa
- Cronograma de implementação

✨ No Enterprise, suas consultorias com advogados são incluídas e ilimitadas. Use sem moderação!`
};

// Mapeamento de planos legados
const PLAN_MAPPING: Record<string, string> = {
  'FREE': 'FREE',
  'BASICO': 'NAVIGATOR',
  'STARTER': 'STARTER',
  'NAVIGATOR': 'NAVIGATOR',
  'PROFISSIONAL': 'PROFESSIONAL',
  'PROFESSIONAL': 'PROFESSIONAL',
  'PREMIUM': 'ENTERPRISE',
  'ENTERPRISE': 'ENTERPRISE',
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

// Detecta se é query simples (saudações, agradecimentos, etc.)
function isSimpleQuery(message: string): boolean {
  const simplePatterns = [
    /^(oi|olá|opa|e aí|eai|fala|hey|oie?|ola)/i,
    /^obrigad[oa]/i,
    /^(sim|não|ok|certo|beleza|blz|vlw|valeu|show|top|massa)/i,
    /^como (você|vc) (está|tá)/i,
    /^(tchau|até mais|flw|bye|adeus|xau)/i,
    /^\?+$/,
    /^tudo (bem|bom|certo)/i,
    /^bom dia/i,
    /^boa tarde/i,
    /^boa noite/i,
  ];
  return message.length < 50 && simplePatterns.some(p => p.test(message.trim()));
}

// ============================================
// ANÁLISE LINHA A LINHA - Explicação detalhada dos resultados
// ============================================
type AnalysisType = 'dre' | 'score' | 'credits' | 'opportunities' | 'general' | null;

function detectAnalysisRequest(message: string): AnalysisType {
  const lowerMessage = message.toLowerCase();
  
  // Padrões que indicam pedido de análise/explicação
  const analysisPatterns = [
    /explic(a|ar|e|ue)/i,
    /analis(a|ar|e)/i,
    /detalh(a|ar|e)/i,
    /o que significa/i,
    /entender meus/i,
    /me ajud(a|e) (a )?entender/i,
    /linha (a|por) linha/i,
    /como (ler|interpretar)/i,
  ];
  
  const isAnalysisRequest = analysisPatterns.some(p => p.test(lowerMessage));
  if (!isAnalysisRequest) return null;
  
  // Detecta qual tipo de análise
  if (/dre|resultado|demonstra(tivo|ção)|receita|margem|lucro|ebitda|financeiro/i.test(lowerMessage)) {
    return 'dre';
  }
  if (/score|nota|pontu(ação|os)|saúde tribut/i.test(lowerMessage)) {
    return 'score';
  }
  if (/crédit(o|os)|recuper(ar|ação)|radar/i.test(lowerMessage)) {
    return 'credits';
  }
  if (/oportunidade|benefício|incentivo|economia/i.test(lowerMessage)) {
    return 'opportunities';
  }
  
  // Comando genérico "explica meus resultados"
  if (/meus (resultados|dados|números)/i.test(lowerMessage)) {
    return 'general';
  }
  
  return null;
}

// Formata explicação didática do DRE COM ORIGEM DOS NÚMEROS
function formatDREExplanation(ctx: UserPlatformContext): string | null {
  if (!ctx.financeiro) {
    return "Você ainda não preencheu seu DRE. Acesse 'DRE Inteligente' para cadastrar. 📊";
  }
  
  const f = ctx.financeiro;
  const inputs = f.inputs;
  
  const formatCurrency = (v: number | null) => {
    if (v === null || v === undefined) return 'N/A';
    if (Math.abs(v) >= 1000) return `R$ ${(v/1000).toFixed(0)}k`;
    return `R$ ${v.toFixed(0)}`;
  };
  const formatPct = (v: number | null) => v !== null ? `${v.toFixed(1)}%` : 'N/A';
  
  const lines: string[] = [];
  lines.push("📊 **Análise do seu DRE:**\n");
  
  // RECEITA BRUTA COM DETALHAMENTO
  if (f.receitaBruta) {
    lines.push(`**Receita Bruta**: ${formatCurrency(f.receitaBruta)}`);
    if (inputs) {
      const detalhes: string[] = [];
      if (inputs.vendasServicos && inputs.vendasServicos > 0) detalhes.push(`Serviços: ${formatCurrency(inputs.vendasServicos)}`);
      if (inputs.vendasProdutos && inputs.vendasProdutos > 0) detalhes.push(`Produtos: ${formatCurrency(inputs.vendasProdutos)}`);
      if (detalhes.length > 0) {
        lines.push(`→ Composição: ${detalhes.join(' + ')}\n`);
      } else {
        lines.push(`→ Total de faturamento antes de descontos.\n`);
      }
    } else {
      lines.push(`→ Total de faturamento antes de descontos.\n`);
    }
  }
  
  // MARGEM BRUTA
  if (f.margemBruta !== null) {
    lines.push(`**Margem Bruta**: ${formatPct(f.margemBruta)}`);
    const margemStatus = f.margemBruta >= 30 ? "saudável ✅" : f.margemBruta >= 20 ? "adequada ⚠️" : "baixa 🔴";
    lines.push(`→ Quanto sobra após custos diretos. Status: ${margemStatus}\n`);
  }
  
  // DESPESAS OPERACIONAIS COM DETALHAMENTO
  if (f.despesasTotal) {
    lines.push(`**Despesas Operacionais**: ${formatCurrency(f.despesasTotal)}`);
    if (inputs) {
      const despDetalhes: string[] = [];
      if (inputs.salariosEncargos && inputs.salariosEncargos > 0) despDetalhes.push(`Salários: ${formatCurrency(inputs.salariosEncargos)}`);
      if (inputs.prolabore && inputs.prolabore > 0) despDetalhes.push(`Pró-labore: ${formatCurrency(inputs.prolabore)}`);
      if (inputs.aluguel && inputs.aluguel > 0) despDetalhes.push(`Aluguel: ${formatCurrency(inputs.aluguel)}`);
      if (inputs.marketing && inputs.marketing > 0) despDetalhes.push(`Marketing: ${formatCurrency(inputs.marketing)}`);
      if (inputs.contadorJuridico && inputs.contadorJuridico > 0) despDetalhes.push(`Contador/Jurídico: ${formatCurrency(inputs.contadorJuridico)}`);
      
      if (despDetalhes.length > 0) {
        lines.push(`→ Principais itens: ${despDetalhes.join(', ')}\n`);
      }
    }
    
    // Nota sobre mão de obra direta (custo de produção, não despesa)
    if (inputs?.maoObraDireta && inputs.maoObraDireta > 0) {
      lines.push(`📝 **Nota**: Mão de obra direta (${formatCurrency(inputs.maoObraDireta)}) está em **Custos de Produção**, não em despesas.\n`);
    }
  }
  
  // MARGEM LÍQUIDA
  if (f.margemLiquida !== null) {
    lines.push(`**Margem Líquida**: ${formatPct(f.margemLiquida)}`);
    const liquidaStatus = f.margemLiquida >= 10 ? "excelente ✅" : f.margemLiquida >= 5 ? "ok ⚠️" : "crítica 🔴";
    lines.push(`→ Lucro real após tudo. Status: ${liquidaStatus}\n`);
  }
  
  // EBITDA
  if (f.ebitda) {
    lines.push(`**EBITDA**: ${formatCurrency(f.ebitda)}`);
    lines.push(`→ Resultado operacional antes de juros e impostos.\n`);
  }
  
  // IMPACTO REFORMA
  if (f.reformaImpactoPercent !== null && f.reformaImpactoPercent !== 0) {
    const impacto = f.reformaImpactoPercent;
    const sinal = impacto > 0 ? '📈' : '📉';
    lines.push(`**Impacto Reforma 2027**: ${impacto > 0 ? '+' : ''}${formatPct(impacto)} ${sinal}`);
    if (impacto < -1) {
      lines.push(`→ Sua margem vai cair. Precisa revisar precificação!\n`);
    } else if (impacto > 1) {
      lines.push(`→ Você vai se beneficiar da reforma!\n`);
    } else {
      lines.push(`→ Impacto neutro.\n`);
    }
  }
  
  lines.push("Quer que eu explique algum item específico?");
  
  return lines.join('\n');
}

// Formata explicação didática do Score
function formatScoreExplanation(ctx: UserPlatformContext): string | null {
  if (!ctx.score) {
    return "Você ainda não calculou seu Score. Acesse 'Score Tributário' para avaliar. 📈";
  }
  
  const s = ctx.score;
  const lines: string[] = [];
  lines.push("📈 **Análise do seu Score Tributário:**\n");
  
  lines.push(`**Nota Geral**: ${s.grade || 'N/A'} (${s.total || 0} pontos)`);
  const gradeDesc: Record<string, string> = {
    'A+': 'Excelente! Você está no top 5%.',
    'A': 'Muito bom! Saúde tributária forte.',
    'B': 'Bom, mas há espaço para melhorar.',
    'C': 'Atenção! Riscos identificados.',
    'D': 'Crítico! Ação urgente necessária.',
    'E': 'Muito crítico! Risco alto de autuação.',
  };
  lines.push(`→ ${gradeDesc[s.grade || 'C'] || 'Avaliação pendente.'}\n`);
  
  if (s.riscoAutuacao !== null) {
    lines.push(`**Risco de Autuação**: ${s.riscoAutuacao}%`);
    const riscoDesc = s.riscoAutuacao <= 20 ? "baixo ✅" : s.riscoAutuacao <= 50 ? "médio ⚠️" : "alto 🔴";
    lines.push(`→ Seu risco está ${riscoDesc}.\n`);
  }
  
  if (s.dimensoes) {
    const dims = s.dimensoes;
    const entries = Object.entries(dims) as [string, number][];
    const weakest = entries.reduce((a, b) => a[1] < b[1] ? a : b);
    const strongest = entries.reduce((a, b) => a[1] > b[1] ? a : b);
    
    const dimNames: Record<string, string> = {
      conformidade: 'Conformidade',
      eficiencia: 'Eficiência',
      risco: 'Gestão de Risco',
      documentacao: 'Documentação',
      gestao: 'Gestão Fiscal',
    };
    
    lines.push(`**Ponto forte**: ${dimNames[strongest[0]]} (${strongest[1]} pts)`);
    lines.push(`**Ponto fraco**: ${dimNames[weakest[0]]} (${weakest[1]} pts)`);
    lines.push(`→ Foque em melhorar ${dimNames[weakest[0]]} para subir sua nota.\n`);
  }
  
  lines.push("Quer dicas específicas para melhorar seu score?");
  
  return lines.join('\n');
}

// Formata explicação de créditos
function formatCreditsExplanation(ctx: UserPlatformContext): string | null {
  const creditos = ctx.oportunidades.creditosDisponiveis;
  if (creditos === 0) {
    return "Nenhum crédito identificado ainda. Importe XMLs para análise! 📥";
  }
  
  const formatCurrency = (v: number) => `R$ ${(v/1000).toFixed(1)}k`;
  
  const lines: string[] = [];
  lines.push("💰 **Créditos Fiscais Identificados:**\n");
  
  lines.push(`**Total Disponível**: ${formatCurrency(creditos)}`);
  lines.push(`→ Valor estimado que pode ser recuperado.\n`);
  
  lines.push("**Como funciona:**");
  lines.push("1. Créditos são impostos pagos nas compras");
  lines.push("2. Podem ser usados para abater tributos a pagar");
  lines.push("3. Recuperação vai até 5 anos retroativos\n");
  
  lines.push("⚠️ Valide com seu contador antes de recuperar.");
  lines.push("Quer ver o Radar de Créditos detalhado?");
  
  return lines.join('\n');
}

// Formata explicação de oportunidades
function formatOpportunitiesExplanation(ctx: UserPlatformContext): string | null {
  const { oportunidadesAtivas, economiaAnualPotencial } = ctx.oportunidades;
  if (oportunidadesAtivas === 0) {
    return "Nenhuma oportunidade mapeada. Complete seu perfil de empresa! 📋";
  }
  
  const formatCurrency = (v: number) => `R$ ${(v/1000).toFixed(0)}k`;
  
  const lines: string[] = [];
  lines.push("💡 **Oportunidades Fiscais:**\n");
  
  lines.push(`**${oportunidadesAtivas}** oportunidades ativas`);
  lines.push(`**Economia potencial**: ${formatCurrency(economiaAnualPotencial)}/ano\n`);
  
  lines.push("**Tipos de oportunidades:**");
  lines.push("• Incentivos fiscais estaduais/municipais");
  lines.push("• Regimes especiais de tributação");
  lines.push("• Benefícios por atividade/setor");
  lines.push("• Créditos não aproveitados\n");
  
  lines.push("Acesse Oportunidades para ver detalhes. Posso explicar alguma específica?");
  
  return lines.join('\n');
}

// Formata explicação geral (resumo de tudo)
function formatGeneralExplanation(ctx: UserPlatformContext): string {
  const lines: string[] = [];
  const userName = ctx.userName ? `, ${ctx.userName}` : '';
  lines.push(`Oi${userName}! Aqui está um resumo dos seus resultados:\n`);
  
  // Score
  if (ctx.score) {
    lines.push(`📈 **Score**: ${ctx.score.grade} (${ctx.score.total} pts)`);
  } else {
    lines.push("📈 **Score**: Não calculado ainda");
  }
  
  // DRE
  if (ctx.financeiro && ctx.financeiro.margemLiquida !== null) {
    lines.push(`💰 **Margem Líquida**: ${ctx.financeiro.margemLiquida.toFixed(1)}%`);
  } else {
    lines.push("💰 **DRE**: Não preenchido");
  }
  
  // Créditos
  if (ctx.oportunidades.creditosDisponiveis > 0) {
    lines.push(`🎯 **Créditos**: R$ ${(ctx.oportunidades.creditosDisponiveis/1000).toFixed(0)}k disponíveis`);
  }
  
  // Oportunidades
  if (ctx.oportunidades.oportunidadesAtivas > 0) {
    lines.push(`💡 **Oportunidades**: ${ctx.oportunidades.oportunidadesAtivas} ativas`);
  }
  
  lines.push("\nQual resultado quer que eu explique em detalhe?");
  lines.push("• 'Explica meu DRE'");
  lines.push("• 'Explica meu Score'");
  lines.push("• 'Explica meus créditos'");
  
  return lines.join('\n');
}

// Gera resposta de análise baseada no tipo
function generateAnalysisResponse(type: AnalysisType, ctx: UserPlatformContext): string | null {
  switch (type) {
    case 'dre':
      return formatDREExplanation(ctx);
    case 'score':
      return formatScoreExplanation(ctx);
    case 'credits':
      return formatCreditsExplanation(ctx);
    case 'opportunities':
      return formatOpportunitiesExplanation(ctx);
    case 'general':
      return formatGeneralExplanation(ctx);
    default:
      return null;
  }
}

// Adiciona disclaimer automaticamente quando resposta menciona termos tributários
function appendDisclaimer(response: string, userPlan: string): string {
  // Só adiciona se resposta > 100 chars E menciona termos tributários relevantes
  const needsDisclaimer = response.length > 100 && 
    /estratégia|implementar|economia|regime|crédito|planejamento|simulação|impacto|tribut|benefício|incentivo|oportunidade/i.test(response);
  
  if (!needsDisclaimer) return response;
  
  // Verifica se já tem disclaimer
  if (response.includes('✨ No Enterprise') || response.includes('⚠️ Antes de implementar') || response.includes('⚠️ Lembre-se')) {
    return response;
  }
  
  if (userPlan === 'ENTERPRISE') {
    return response + '\n\n✨ No Enterprise, suas consultorias com advogados tributaristas são incluídas e ilimitadas.';
  }
  
  return response + '\n\n⚠️ Antes de implementar, converse com seu contador ou advogado tributarista.';
}

// Constrói o prompt do sistema baseado no contexto
const buildSystemPrompt = (
  toolContext: ToolContext | null, 
  userPlan: string,
  userName: string | null = null,
  isSimple: boolean = false,
  userContext: UserPlatformContext | null = null
): string => {
  const nameContext = userName 
    ? `O nome do usuário é ${userName}. Use-o naturalmente na primeira resposta (ex: "Oi ${userName}!"). Nas respostas seguintes, use o nome dele pelo menos uma vez de forma natural.`
    : `Você não sabe o nome do usuário ainda. Use "Oi!" ou "Olá!" para cumprimentar.`;

  // Query simples = prompt slim (economia de tokens)
  if (isSimple) {
    let slimPrompt = `${CLARA_CORE_SLIM}\n\n${nameContext}\n\nO usuário está no plano: ${userPlan}`;
    
    // Adiciona contexto mínimo mesmo em queries simples
    if (userContext) {
      const quickContext: string[] = [];
      if (userContext.oportunidades.creditosDisponiveis > 10000) {
        quickContext.push(`Créditos disponíveis: R$ ${(userContext.oportunidades.creditosDisponiveis / 1000).toFixed(0)}k`);
      }
      if (userContext.score?.grade) {
        quickContext.push(`Score: ${userContext.score.grade}`);
      }
      if (quickContext.length > 0) {
        slimPrompt += `\n\nContexto rápido: ${quickContext.join(' | ')}`;
      }
    }
    
    return slimPrompt;
  }

  // Contexto de escopo por plano - REGRA CRÍTICA SOBRE UPGRADES
  const planDescriptions: Record<string, string> = {
    'FREE': 'Grátis (acesso básico)',
    'STARTER': 'Starter (5 ferramentas essenciais)',
    'NAVIGATOR': 'Navigator (ferramentas avançadas + simuladores)',
    'PROFESSIONAL': 'Professional (diagnóstico automatizado + XMLs ilimitados + DRE + Radar de Créditos + Oportunidades)',
    'ENTERPRISE': 'Enterprise (tudo + consultoria jurídica ilimitada)',
  };
  
  const planDescription = planDescriptions[userPlan] || planDescriptions['FREE'];
  
  const scopeContext = `
REGRA CRÍTICA - PLANO DO USUÁRIO (NUNCA IGNORE):
O usuário está no plano ${userPlan} (${planDescription}).

${userPlan === 'PROFESSIONAL' || userPlan === 'ENTERPRISE' ? `
⚠️ ESTE USUÁRIO JÁ ESTÁ EM UM PLANO PAGO AVANÇADO!
- NUNCA sugira upgrade para este usuário. Ele já tem acesso a praticamente tudo.
- NUNCA diga que ele precisa de outro plano. Ele já paga pelo Professional/Enterprise.
- Foque em ajudá-lo a usar TODAS as ferramentas que ele já tem acesso.
- Se ele perguntar sobre algo, AJUDE DIRETAMENTE. Não bloqueie com "precisa de upgrade".
- As únicas ferramentas que Professional não tem são: Painel Executivo e Consultoria Jurídica (exclusivas Enterprise).
` : userPlan === 'NAVIGATOR' ? `
Este usuário está no plano Navigator e tem acesso às ferramentas avançadas.
Ele NÃO tem acesso a: DRE Inteligente, Radar de Créditos, Análise de XMLs ilimitada, Oportunidades Fiscais, Margem Ativa, NEXUS.
Para essas ferramentas, você pode explicar o que fazem mas indique que são do plano Professional.
` : `
Este usuário está no plano ${userPlan}. Você pode explicar todas as ferramentas, mas indique quando algo é de plano superior.
`}
Se ele perguntar sobre ferramentas de planos superiores, você pode explicar brevemente o que a ferramenta faz, mas só indique upgrade se for REALMENTE necessário.`;

  // Query complexa = prompt completo v4
  let prompt = `${CLARA_CORE_FULL}\n\n${nameContext}${scopeContext}`;
  
  // NOVO: Adiciona contexto completo do usuário
  if (userContext) {
    prompt += `\n\n${formatUserContextForPrompt(userContext)}`;
  }
  
  // Adiciona contexto da ferramenta atual
  if (toolContext) {
    prompt += `\n\nFERRAMENTA ATUAL: ${toolContext.toolName}
${toolContext.toolDescription}

Passo a passo desta ferramenta:
${toolContext.stepByStep.map((step, i) => `${i + 1}. ${step}`).join("\n")}

Ao se apresentar pela primeira vez, mencione brevemente o que a ferramenta faz e ofereça guiar o usuário pelo processo.`;
  }
  
  return prompt;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // NOVO: Busca contexto completo do usuário em paralelo
    const userContext = await buildUserContext(supabase, user.id);
    
    // Extrai valores básicos do contexto
    const userPlan = PLAN_MAPPING[userContext.plano] || "FREE";
    const userName = userContext.userName;
    const hasUserData = userContext.progresso.xmlsProcessados > 0 || userContext.financeiro !== null;

    const { messages, toolSlug, isGreeting, getStarters, sessionId, conversationHistory } = await req.json();

    // Return conversation starters if requested
    if (getStarters) {
      return new Response(JSON.stringify({ starters: CONVERSATION_STARTERS }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const toolContext = toolSlug ? TOOL_CONTEXTS[toolSlug] || null : null;
    
    // Detecta se é query simples
    const lastMessage = messages?.[messages.length - 1]?.content || "";
    const isSimple = isSimpleQuery(lastMessage);
    
    // Detecta tópico da mensagem e verifica escopo
    const detectedTopic = detectTopic(lastMessage);
    if (detectedTopic && !isTopicInScope(detectedTopic, userPlan)) {
      const outOfScopeResponse = getOutOfScopeResponse(detectedTopic, userPlan);
      return new Response(JSON.stringify({ message: outOfScopeResponse }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================
    // CACHE LOGIC - Verifica cache antes de chamar IA
    // ============================================
    const queryComplexity = classifyQueryComplexity(lastMessage, hasUserData);
    const queryCategory = getCategoryFromQuery(lastMessage);
    
    // Só tenta cache se for query cacheável e não for greeting
    if (!isGreeting && queryComplexity === 'cache' && queryCategory !== 'calculation') {
      const queryHash = await hashQuery(lastMessage);
      
      // Busca no cache
      const { data: cacheEntry } = await supabase
        .from('clara_cache')
        .select('*')
        .eq('query_hash', queryHash)
        .single();
      
      if (cacheEntry && isCacheValid(cacheEntry)) {
        // Cache hit! Incrementa contador e retorna
        await supabase
          .from('clara_cache')
          .update({ 
            hit_count: cacheEntry.hit_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', cacheEntry.id);
        
        // Adiciona disclaimer de data para transparência
        const cachedResponse = cacheEntry.response + getCacheDisclaimer(cacheEntry.created_at);
        const finalResponse = appendDisclaimer(cachedResponse, userPlan);
        
        console.log(`Cache HIT for query: "${lastMessage.substring(0, 50)}..." - saved ~${cacheEntry.tokens_saved || 500} tokens`);
        
        return new Response(JSON.stringify({ 
          message: finalResponse,
          cached: true,
          cache_date: cacheEntry.created_at
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    
    // ============================================
    // ORQUESTRAÇÃO DE AGENTES + CONHECIMENTO + RAG
    // ============================================
    const userRegime = userContext?.regime || null;
    const supabaseUrlForRag = Deno.env.get('SUPABASE_URL') || '';
    const anonKeyForRag = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    // Detecta qual agente deve atuar baseado na mensagem
    const agentSuggestion = analyzeMessageForAgent(lastMessage);
    
    // Busca em paralelo: conhecimento, RAG, ações pendentes e info do agente
    const [relevantKnowledge, semanticContext, pendingActions, agentInfo] = await Promise.all([
      fetchRelevantKnowledge(supabase, lastMessage, userRegime),
      fetchSemanticContext(supabaseUrlForRag, anonKeyForRag, lastMessage, user?.id || null),
      fetchPendingActions(supabase, user.id),
      agentSuggestion?.agentType ? fetchAgentInfo(supabase, agentSuggestion.agentType) : Promise.resolve(null),
    ]);
    
    // Formata todos os contextos
    const knowledgePrompt = formatKnowledgeForPrompt(relevantKnowledge);
    const semanticPrompt = formatSemanticContextForPrompt(
      semanticContext.knowledge,
      semanticContext.userContext
    );
    const agentPrompt = formatAgentContextForPrompt(agentSuggestion, agentInfo, pendingActions);
    
    // ============================================
    // CONFIDENCE SCORE CALCULATION
    // ============================================
    interface ConfidenceFactor {
      type: 'knowledge' | 'memory' | 'pattern' | 'agent' | 'context';
      label: string;
      contribution: number;
    }
    
    const confidenceFactors: ConfidenceFactor[] = [];
    let baseConfidence = 30; // Base: modelo de IA generalista
    
    // +20 se tem conhecimento técnico (RAG semântico)
    if (semanticContext.knowledge.length > 0) {
      const avgSimilarity = semanticContext.knowledge.reduce((a, b) => a + b.similarity, 0) / semanticContext.knowledge.length;
      const contribution = Math.round(20 * avgSimilarity);
      baseConfidence += contribution;
      confidenceFactors.push({
        type: 'knowledge',
        label: `${semanticContext.knowledge.length} fonte${semanticContext.knowledge.length > 1 ? 's' : ''} técnica${semanticContext.knowledge.length > 1 ? 's' : ''}`,
        contribution,
      });
    }
    
    // +15 se tem conhecimento por keywords (fallback)
    if (relevantKnowledge.length > 0 && semanticContext.knowledge.length === 0) {
      const contribution = Math.min(15, relevantKnowledge.length * 5);
      baseConfidence += contribution;
      confidenceFactors.push({
        type: 'knowledge',
        label: 'Base legal encontrada',
        contribution,
      });
    }
    
    // +15 se tem memórias do usuário
    if (semanticContext.userContext.length > 0) {
      const memories = semanticContext.userContext.filter(m => m.type === 'memory');
      const patterns = semanticContext.userContext.filter(m => m.type === 'pattern');
      
      if (memories.length > 0) {
        const contribution = Math.min(10, memories.length * 3);
        baseConfidence += contribution;
        confidenceFactors.push({
          type: 'memory',
          label: `${memories.length} memória${memories.length > 1 ? 's' : ''} relevante${memories.length > 1 ? 's' : ''}`,
          contribution,
        });
      }
      
      if (patterns.length > 0) {
        const avgConfidence = patterns.reduce((a, p) => a + ((p.metadata?.confidence as number) || 0.5), 0) / patterns.length;
        const contribution = Math.round(5 * avgConfidence);
        baseConfidence += contribution;
        confidenceFactors.push({
          type: 'pattern',
          label: 'Padrão aprendido',
          contribution,
        });
      }
    }
    
    // +10 se tem agente especializado ativo
    if (agentSuggestion && agentInfo) {
      const priorityBonus = agentSuggestion.priority === 'high' ? 10 : agentSuggestion.priority === 'medium' ? 7 : 5;
      baseConfidence += priorityBonus;
      confidenceFactors.push({
        type: 'agent',
        label: `Agente ${agentSuggestion.agentType}`,
        contribution: priorityBonus,
      });
    }
    
    // +10 se tem contexto financeiro do usuário
    if (userContext.financeiro || userContext.score) {
      const hasFinanceiro = userContext.financeiro !== null;
      const hasScore = userContext.score !== null;
      const contribution = (hasFinanceiro ? 5 : 0) + (hasScore ? 5 : 0);
      if (contribution > 0) {
        baseConfidence += contribution;
        confidenceFactors.push({
          type: 'context',
          label: 'Dados da sua empresa',
          contribution,
        });
      }
    }
    
    // Cap em 95% (nunca 100% - transparência sobre incerteza da IA)
    const finalConfidence = Math.min(95, baseConfidence);
    
    console.log(`Confidence score: ${finalConfidence}% with ${confidenceFactors.length} factors`);
    
    // Logs de diagnóstico
    if (relevantKnowledge.length > 0) {
      console.log(`Found ${relevantKnowledge.length} keyword-matched knowledge entries`);
    }
    if (semanticContext.knowledge.length > 0 || semanticContext.userContext.length > 0) {
      console.log(`RAG: ${semanticContext.knowledge.length} knowledge + ${semanticContext.userContext.length} user context via embeddings`);
    }
    if (agentSuggestion) {
      console.log(`Agent routing: ${agentSuggestion.agentType} (${agentSuggestion.priority}) - ${agentSuggestion.reason}`);
    }
    if (pendingActions.length > 0) {
      console.log(`Pending actions: ${pendingActions.length} awaiting approval`);
    }
    
    // Formata histórico conversacional se disponível
    const conversationHistoryPrompt = conversationHistory 
      ? formatConversationHistoryForPrompt(conversationHistory as ConversationHistoryContext)
      : '';
    
    // Combina tudo no prompt: base + conhecimento + RAG + contexto de agente + histórico
    const systemPrompt = buildSystemPrompt(toolContext, userPlan, userName, isSimple, userContext) 
      + knowledgePrompt 
      + semanticPrompt 
      + agentPrompt
      + conversationHistoryPrompt;

    // ============================================
    // ANÁLISE LINHA A LINHA - Responde pedidos de explicação
    // ============================================
    const analysisType = detectAnalysisRequest(lastMessage);
    if (analysisType && !isGreeting) {
      const analysisResponse = generateAnalysisResponse(analysisType, userContext);
      if (analysisResponse) {
        console.log(`Analysis request detected: ${analysisType}`);
        return new Response(JSON.stringify({ message: analysisResponse }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Check if user is asking "Por onde eu começo?" and return plan-specific response
    const lastUserMessage = lastMessage.toLowerCase();
    if (lastUserMessage.includes("por onde") && (lastUserMessage.includes("começo") || lastUserMessage.includes("inicio") || lastUserMessage.includes("começar"))) {
      let planResponse = PLAN_RESPONSES[userPlan] || PLAN_RESPONSES.STARTER;
      
      // Personaliza com o nome se disponível
      if (userName) {
        planResponse = planResponse.replace(/^Oi!/i, `Oi ${userName}!`).replace(/^Ótimo!/i, `Ótimo, ${userName}!`).replace(/^Perfeito!/i, `Perfeito, ${userName}!`).replace(/^Excelente/i, `Excelente, ${userName}!`);
      }
      
      // Disclaimer já está incluído no ENTERPRISE response
      const finalResponse = appendDisclaimer(planResponse, userPlan);
      
      return new Response(JSON.stringify({ message: finalResponse }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For greeting, generate a contextual welcome message with user name
    const greetingPrompt = userName
      ? `Acabei de entrar na ferramenta. Me dê uma saudação breve usando meu nome (${userName}), se apresente como Clara e pergunte se posso ajudar. Seja breve (máximo 3 frases).`
      : `Acabei de entrar na ferramenta. Me dê uma saudação breve, se apresente como Clara e pergunte se posso ajudar. Seja breve (máximo 3 frases).`;
    
    const messagesWithContext = isGreeting 
      ? [
          { role: "user", content: toolContext 
            ? greetingPrompt
            : userName
              ? `Olá! Me apresente brevemente como Clara usando meu nome (${userName}), especialista em Reforma Tributária. Mencione que posso tirar dúvidas ou ajudar com ferramentas. Seja breve (máximo 4 frases).`
              : `Olá! Me apresente brevemente como Clara, especialista em Reforma Tributária. Mencione que posso tirar dúvidas ou ajudar com ferramentas. Seja breve (máximo 4 frases).`
          }
        ]
      : messages;

    // ============================================
    // MODEL SELECTION - Escolhe modelo baseado na complexidade
    // ============================================
    // Para queries simples, podemos usar Gemini Flash (mais barato)
    // Para queries complexas, mantemos Claude Sonnet
    const useGemini = queryComplexity === 'simple' && !isGreeting;
    
    let assistantMessage: string;
    
    if (useGemini) {
      // Usar Lovable AI com Gemini Flash para economia
      const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
      
      if (lovableApiKey) {
        try {
          const geminiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: systemPrompt },
                ...messagesWithContext.map((msg: { role: string; content: string }) => ({
                  role: msg.role === "assistant" ? "assistant" : "user",
                  content: msg.content,
                })),
              ],
              max_tokens: 1024,
            }),
          });
          
          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            assistantMessage = geminiData.choices?.[0]?.message?.content || "Olá! Sou a Clara, como posso ajudar?";
            console.log(`Used Gemini Flash for simple query: "${lastMessage.substring(0, 50)}..."`);
          } else {
            // Fallback para Claude se Gemini falhar
            throw new Error("Gemini failed, falling back to Claude");
          }
        } catch {
          // Fallback para Claude
          console.log("Gemini failed, using Claude Sonnet");
          const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "x-api-key": ANTHROPIC_API_KEY,
              "anthropic-version": "2023-06-01",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "claude-sonnet-4-20250514",
              max_tokens: 2048,
              system: systemPrompt,
              messages: messagesWithContext.map((msg: { role: string; content: string }) => ({
                role: msg.role === "assistant" ? "assistant" : "user",
                content: msg.content,
              })),
            }),
          });
          
          const data = await response.json();
          assistantMessage = data.content?.[0]?.text || "Olá! Sou a Clara, como posso ajudar?";
        }
      } else {
        // Sem Lovable API Key, usa Claude direto
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2048,
            system: systemPrompt,
            messages: messagesWithContext.map((msg: { role: string; content: string }) => ({
              role: msg.role === "assistant" ? "assistant" : "user",
              content: msg.content,
            })),
          }),
        });
        
        const data = await response.json();
        assistantMessage = data.content?.[0]?.text || "Olá! Sou a Clara, como posso ajudar?";
      }
    } else {
      // Queries complexas sempre usam Claude Sonnet
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          system: systemPrompt,
          messages: messagesWithContext.map((msg: { role: string; content: string }) => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errorText = await response.text();
        console.error("Anthropic API error:", response.status, errorText);
        return new Response(JSON.stringify({ error: "Erro ao processar. Tente novamente." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      assistantMessage = data.content?.[0]?.text || "Olá! Sou a Clara, como posso ajudar?";
    }
    
    // ============================================
    // SAVE TO CACHE - Salva queries cacheáveis
    // ============================================
    if (!isGreeting && queryComplexity === 'cache' && queryCategory !== 'calculation') {
      const queryHash = await hashQuery(lastMessage);
      const categoryConfig = CATEGORY_CONFIG[queryCategory];
      
      // Tenta inserir no cache (ignora se já existe)
      await supabase
        .from('clara_cache')
        .upsert({
          query_hash: queryHash,
          query_normalized: normalizeQuery(lastMessage),
          response: assistantMessage,
          category: queryCategory,
          ttl_days: categoryConfig.ttl_days,
          requires_validation: categoryConfig.requires_validation,
          model_used: useGemini ? 'gemini-2.5-flash' : 'claude-sonnet-4',
          tokens_saved: assistantMessage.length, // Aproximação
          hit_count: 1,
        }, {
          onConflict: 'query_hash',
          ignoreDuplicates: true
        });
      
      console.log(`Cached response for category "${queryCategory}" with TTL ${categoryConfig.ttl_days} days`);
    }
    
    // NOTA: As conversas já são salvas pelo frontend em useClaraConversation.ts
    // Removemos a duplicação de salvamento aqui para evitar registros duplicados
    // ============================================
    // EXTRAI MEMÓRIAS IMPORTANTES (decisões, preferências)
    // ============================================
    // Detecta se a conversa contém informação importante para lembrar
    const memoryPatterns = [
      { pattern: /minha empresa|meu negócio|nossa empresa/i, category: 'empresa', importance: 7 },
      { pattern: /decidi|vou fazer|escolhi|prefiro/i, category: 'decisao', importance: 8 },
      { pattern: /faturamento|receita|margem/i, category: 'financeiro', importance: 6 },
      { pattern: /simples|lucro real|lucro presumido/i, category: 'regime', importance: 7 },
      { pattern: /problema|dificuldade|não consigo/i, category: 'suporte', importance: 5 },
    ];
    
    for (const { pattern, category, importance } of memoryPatterns) {
      if (pattern.test(lastMessage) && lastMessage.length > 30) {
        try {
          // Verifica se já existe memória similar recente
          const { count } = await supabase
            .from('clara_memory')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('category', category)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
          
          // Só cria se não houver memória similar nas últimas 24h
          if (!count || count < 3) {
            await supabase.from('clara_memory').insert({
              user_id: user.id,
              memory_type: 'context',
              category,
              content: `Usuário disse: "${lastMessage.substring(0, 200)}..." / Clara respondeu: "${assistantMessage.substring(0, 200)}..."`,
              importance,
              source_screen: toolSlug || 'chat',
              source_conversation_id: null, // Idealmente linkaria ao ID da conversa
            });
            console.log(`Memory extracted: category=${category}, importance=${importance}`);
          }
        } catch (memError) {
          console.error('Error extracting memory:', memError);
        }
        break; // Só extrai uma memória por conversa
      }
    }
    
    // ============================================
    // REGISTRO DE INTERAÇÃO COM AGENTE (para aprendizado)
    // ============================================
    if (agentSuggestion) {
      try {
        await supabase.rpc('record_user_decision', {
          p_user_id: user.id,
          p_decision_type: 'agent_interaction',
          p_context: {
            message_preview: lastMessage.substring(0, 100),
            response_preview: assistantMessage.substring(0, 100),
            had_semantic_context: semanticContext.knowledge.length > 0 || semanticContext.userContext.length > 0,
            pending_actions_count: pendingActions.length,
          },
          p_agent_type: agentSuggestion.agentType,
        });
        console.log(`Agent interaction recorded: ${agentSuggestion.agentType}`);
      } catch (agentError) {
        console.error('Error recording agent interaction:', agentError);
      }
    }
    
    // Aplica disclaimer automaticamente no pós-processamento
    const finalMessage = appendDisclaimer(assistantMessage, userPlan);

    return new Response(JSON.stringify({ 
      message: finalMessage,
      confidence_score: finalConfidence,
      confidence_factors: confidenceFactors,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in clara-assistant:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno. Tente novamente." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
