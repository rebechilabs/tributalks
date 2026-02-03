import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// ============================================
// TIPOS DOS AGENTES ESPECIALIZADOS
// ============================================

export type AgentType = 'fiscal' | 'margin' | 'compliance' | 'orchestrator';

export interface ClaraAgent {
  id: string;
  agent_type: AgentType;
  name: string;
  description: string | null;
  capabilities: string[];
  priority_rules: string[];
  trigger_conditions: string[];
  status: 'active' | 'paused' | 'testing';
}

export interface AgentAction {
  id: string;
  agent_type: AgentType;
  action_type: string;
  trigger_event: string;
  trigger_data: Record<string, unknown>;
  action_payload: Record<string, unknown>;
  status: 'pending' | 'approved' | 'executed' | 'rejected' | 'failed';
  requires_approval: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  executed_at: string | null;
  result: Record<string, unknown> | null;
}

export interface AgentContext {
  screen: string;
  userIntent?: string;
  recentActions?: string[];
  dataAvailable: {
    hasXmls: boolean;
    hasDre: boolean;
    hasScore: boolean;
    hasOpportunities: boolean;
  };
}

// ============================================
// HOOK PRINCIPAL - Orquestrador de Agentes
// ============================================

export function useClaraAgents() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<ClaraAgent[]>([]);
  const [pendingActions, setPendingActions] = useState<AgentAction[]>([]);
  const [loading, setLoading] = useState(false);

  // Busca todos os agentes ativos
  const fetchAgents = useCallback(async () => {
    if (!user?.id) return [];
    
    try {
      const { data, error } = await supabase
        .from('clara_agents')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      
      const typedAgents = (data || []).map(a => ({
        ...a,
        capabilities: a.capabilities as string[],
        priority_rules: a.priority_rules as string[],
        trigger_conditions: a.trigger_conditions as string[],
      })) as ClaraAgent[];
      
      setAgents(typedAgents);
      return typedAgents;
    } catch (error) {
      console.error('Erro ao buscar agentes:', error);
      return [];
    }
  }, [user?.id]);

  // Busca ações pendentes do usuário
  const fetchPendingActions = useCallback(async () => {
    if (!user?.id) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clara_autonomous_actions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'approved'])
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingActions(data as AgentAction[]);
      return data as AgentAction[];
    } catch (error) {
      console.error('Erro ao buscar ações pendentes:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Determina qual agente deve responder baseado no contexto
  const routeToAgent = useCallback((
    query: string,
    context: AgentContext
  ): AgentType => {
    const lowerQuery = query.toLowerCase();
    
    // Keywords para cada agente
    const fiscalKeywords = [
      'crédito', 'credito', 'ncm', 'cfop', 'icms', 'pis', 'cofins', 'ipi',
      'xml', 'nota fiscal', 'dctf', 'sped', 'obrigação', 'compliance',
      'autuação', 'fiscalização', 'restituição', 'compensação'
    ];
    
    const marginKeywords = [
      'margem', 'dre', 'lucro', 'receita', 'despesa', 'ebitda', 'custo',
      'preço', 'pricing', 'fornecedor', 'compra', 'venda', 'markup',
      'rentabilidade', 'fluxo de caixa', 'cashflow'
    ];
    
    const complianceKeywords = [
      'prazo', 'deadline', 'vencimento', 'obrigação', 'reforma',
      'cronograma', 'timeline', 'vigência', 'lei', 'regulamento',
      'adequação', 'checklist', 'certidão', 'regularidade'
    ];
    
    // Conta matches
    const fiscalScore = fiscalKeywords.filter(kw => lowerQuery.includes(kw)).length;
    const marginScore = marginKeywords.filter(kw => lowerQuery.includes(kw)).length;
    const complianceScore = complianceKeywords.filter(kw => lowerQuery.includes(kw)).length;
    
    // Contexto da tela também influencia
    if (context.screen.includes('radar') || context.screen.includes('xml')) {
      return 'fiscal';
    }
    if (context.screen.includes('dre') || context.screen.includes('margem')) {
      return 'margin';
    }
    if (context.screen.includes('timeline') || context.screen.includes('checklist')) {
      return 'compliance';
    }
    
    // Retorna baseado em scores
    const maxScore = Math.max(fiscalScore, marginScore, complianceScore);
    if (maxScore === 0) return 'orchestrator';
    if (fiscalScore === maxScore) return 'fiscal';
    if (marginScore === maxScore) return 'margin';
    return 'compliance';
  }, []);

  // Aprova uma ação pendente
  const approveAction = useCallback(async (actionId: string) => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('clara_autonomous_actions')
        .update({ status: 'approved' })
        .eq('id', actionId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Atualiza lista local
      setPendingActions(prev => 
        prev.map(a => a.id === actionId ? { ...a, status: 'approved' as const } : a)
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao aprovar ação:', error);
      return false;
    }
  }, [user?.id]);

  // Rejeita uma ação pendente
  const rejectAction = useCallback(async (actionId: string) => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('clara_autonomous_actions')
        .update({ status: 'rejected' })
        .eq('id', actionId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setPendingActions(prev => prev.filter(a => a.id !== actionId));
      return true;
    } catch (error) {
      console.error('Erro ao rejeitar ação:', error);
      return false;
    }
  }, [user?.id]);

  return {
    agents,
    pendingActions,
    loading,
    fetchAgents,
    fetchPendingActions,
    routeToAgent,
    approveAction,
    rejectAction,
  };
}

// ============================================
// HOOK - Agente Fiscal
// ============================================

export function useFiscalAgent() {
  const { user } = useAuth();

  // Analisa créditos potenciais dos XMLs
  const analyzeCredits = useCallback(async () => {
    if (!user?.id) return null;
    
    // Busca resumo de créditos
    const { data } = await supabase
      .from('credit_analysis_summary')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    return data;
  }, [user?.id]);

  // Verifica compliance fiscal
  const checkCompliance = useCallback(async () => {
    if (!user?.id) return null;
    
    // Busca score tributário
    const { data: score } = await supabase
      .from('tax_score')
      .select('score_total, score_grade, score_conformidade, score_risco')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    // Busca análises fiscais cruzadas
    const { data: gaps } = await supabase
      .from('fiscal_cross_analysis')
      .select('nivel_risco, divergencia_total')
      .eq('user_id', user.id)
      .eq('nivel_risco', 'alto')
      .limit(5);
    
    return {
      score,
      hasHighRiskGaps: (gaps?.length || 0) > 0,
      gapsCount: gaps?.length || 0,
    };
  }, [user?.id]);

  // Gera insight proativo
  const generateInsight = useCallback(async (
    insightType: string,
    title: string,
    description: string,
    actionCta?: string,
    actionRoute?: string
  ) => {
    if (!user?.id) return null;
    
    const { data, error } = await supabase
      .from('clara_insights')
      .insert({
        user_id: user.id,
        insight_type: insightType,
        priority: 'high',
        title,
        description,
        action_cta: actionCta,
        action_route: actionRoute,
        trigger_condition: 'fiscal_agent_proactive',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar insight fiscal:', error);
      return null;
    }
    
    return data;
  }, [user?.id]);

  return {
    analyzeCredits,
    checkCompliance,
    generateInsight,
  };
}

// ============================================
// HOOK - Agente Margem
// ============================================

export function useMarginAgent() {
  const { user } = useAuth();

  // Analisa DRE e margens
  const analyzeDre = useCallback(async () => {
    if (!user?.id) return null;
    
    const { data } = await supabase
      .from('company_dre')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (!data) return null;
    
    // Análise de saúde da margem
    const marginHealth = {
      margem_bruta: data.calc_margem_bruta,
      margem_liquida: data.calc_margem_liquida,
      ebitda_margin: data.calc_ebitda_margin,
      reforma_impact: data.reforma_impacto_percentual,
      health_score: data.health_score,
      health_status: data.health_status,
      alerts: [] as string[],
    };
    
    // Detecta alertas
    if ((data.calc_margem_bruta || 0) < 20) {
      marginHealth.alerts.push('Margem bruta abaixo de 20% - risco de erosão');
    }
    if ((data.calc_margem_liquida || 0) < 5) {
      marginHealth.alerts.push('Margem líquida crítica - abaixo de 5%');
    }
    if ((data.reforma_impacto_percentual || 0) < -2) {
      marginHealth.alerts.push(`Reforma vai reduzir margem em ${Math.abs(data.reforma_impacto_percentual || 0).toFixed(1)}pp`);
    }
    
    return marginHealth;
  }, [user?.id]);

  // Analisa fornecedores (OMC) - placeholder para dados agregados
  const analyzeSuppliers = useCallback(async () => {
    if (!user?.id) return null;
    
    // Por enquanto retorna placeholder - será integrado com dados reais de XMLs
    return { topSuppliers: [] };
  }, [user?.id]);

  return {
    analyzeDre,
    analyzeSuppliers,
  };
}

// ============================================
// HOOK - Agente Compliance
// ============================================

export function useComplianceAgent() {
  const { user } = useAuth();

  // Busca prazos próximos - usa notifications como fonte
  const checkDeadlines = useCallback(async () => {
    if (!user?.id) return [];
    
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'deadline')
      .order('created_at', { ascending: false })
      .limit(10);
    
    return data || [];
  }, [user?.id]);

  // Verifica benefícios expirando
  const checkExpiringBenefits = useCallback(async () => {
    if (!user?.id) return [];
    
    const { data } = await supabase
      .from('company_opportunities')
      .select('*, tax_opportunities(*)')
      .eq('user_id', user.id)
      .eq('status', 'em_andamento');
    
    // Filtra os que têm prazo próximo de expirar
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return (data || []).filter(op => {
      // Lógica de verificação de expiração
      return true; // Simplificado por agora
    });
  }, [user?.id]);

  // Verifica progresso no checklist da reforma
  const checkReformReadiness = useCallback(async () => {
    if (!user?.id) return null;
    
    const { data: onboarding } = await supabase
      .from('user_onboarding_progress')
      .select('checklist_items')
      .eq('user_id', user.id)
      .maybeSingle();
    
    const items = (onboarding?.checklist_items || {}) as Record<string, boolean>;
    const completed = Object.values(items).filter(Boolean).length;
    const total = 4;
    
    return {
      completedItems: completed,
      totalItems: total,
      percentage: Math.round((completed / total) * 100),
      isReady: completed >= 3,
    };
  }, [user?.id]);

  return {
    checkDeadlines,
    checkExpiringBenefits,
    checkReformReadiness,
  };
}
