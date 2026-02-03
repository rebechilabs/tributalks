import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AgentType } from "./useClaraAgents";

// ============================================
// TIPOS PARA AÇÕES AUTÔNOMAS
// ============================================

export interface AutonomousAction {
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

export interface ActionTrigger {
  event: string;
  agentType: AgentType;
  actionType: string;
  payload: Record<string, unknown>;
  requiresApproval: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// ============================================
// DEFINIÇÃO DE TRIGGERS AUTOMÁTICOS
// ============================================

export const AUTO_TRIGGERS: Record<string, ActionTrigger> = {
  // Fiscal Agent Triggers
  'xml_imported': {
    event: 'xml_imported',
    agentType: 'fiscal',
    actionType: 'analyze_credits',
    payload: { analysis_type: 'full' },
    requiresApproval: false,
    priority: 'medium',
  },
  'score_below_60': {
    event: 'score_below_threshold',
    agentType: 'fiscal',
    actionType: 'generate_compliance_alert',
    payload: { threshold: 60, severity: 'high' },
    requiresApproval: false,
    priority: 'high',
  },
  'dctf_gap_detected': {
    event: 'dctf_gap_detected',
    agentType: 'fiscal',
    actionType: 'notify_gap',
    payload: { notification_type: 'gap_alert' },
    requiresApproval: false,
    priority: 'urgent',
  },
  
  // Margin Agent Triggers
  'margin_drop_5pp': {
    event: 'margin_drop_detected',
    agentType: 'margin',
    actionType: 'generate_margin_alert',
    payload: { drop_threshold: 5 },
    requiresApproval: false,
    priority: 'high',
  },
  'dre_updated': {
    event: 'dre_updated',
    agentType: 'margin',
    actionType: 'recalculate_projections',
    payload: {},
    requiresApproval: false,
    priority: 'low',
  },
  
  // Compliance Agent Triggers
  'deadline_7_days': {
    event: 'deadline_approaching',
    agentType: 'compliance',
    actionType: 'send_deadline_reminder',
    payload: { days_before: 7 },
    requiresApproval: false,
    priority: 'medium',
  },
  'benefit_expiring': {
    event: 'benefit_expiring',
    agentType: 'compliance',
    actionType: 'alert_benefit_expiration',
    payload: {},
    requiresApproval: false,
    priority: 'high',
  },
};

// ============================================
// HOOK - Gerenciador de Ações Autônomas
// ============================================

export function useClaraAutonomousActions() {
  const { user } = useAuth();
  const [actions, setActions] = useState<AutonomousAction[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Busca ações do usuário
  const fetchActions = useCallback(async (
    statusFilter?: AutonomousAction['status'][]
  ) => {
    if (!user?.id) return [];
    
    setLoading(true);
    try {
      let query = supabase
        .from('clara_autonomous_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (statusFilter && statusFilter.length > 0) {
        query = query.in('status', statusFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      setActions(data as AutonomousAction[]);
      setPendingCount(data?.filter(a => a.status === 'pending').length || 0);
      
      return data as AutonomousAction[];
    } catch (error) {
      console.error('Erro ao buscar ações:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Cria uma nova ação autônoma
  const createAction = useCallback(async (trigger: ActionTrigger): Promise<string | null> => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase.rpc('create_autonomous_action', {
        p_user_id: user.id,
        p_agent_type: trigger.agentType,
        p_action_type: trigger.actionType,
        p_trigger_event: trigger.event,
        p_trigger_data: {} as unknown as never,
        p_action_payload: trigger.payload as unknown as never,
        p_requires_approval: trigger.requiresApproval,
        p_priority: trigger.priority,
      });

      if (error) throw error;
      
      // Recarrega lista
      await fetchActions(['pending', 'approved']);
      
      return data;
    } catch (error) {
      console.error('Erro ao criar ação:', error);
      return null;
    }
  }, [user?.id, fetchActions]);

  // Aprova uma ação pendente
  const approveAction = useCallback(async (actionId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('clara_autonomous_actions')
        .update({ status: 'approved' })
        .eq('id', actionId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setActions(prev => 
        prev.map(a => a.id === actionId ? { ...a, status: 'approved' as const } : a)
      );
      setPendingCount(prev => prev - 1);
      
      return true;
    } catch (error) {
      console.error('Erro ao aprovar ação:', error);
      return false;
    }
  }, [user?.id]);

  // Rejeita uma ação
  const rejectAction = useCallback(async (actionId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('clara_autonomous_actions')
        .update({ status: 'rejected' })
        .eq('id', actionId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setActions(prev => prev.filter(a => a.id !== actionId));
      setPendingCount(prev => prev - 1);
      
      return true;
    } catch (error) {
      console.error('Erro ao rejeitar ação:', error);
      return false;
    }
  }, [user?.id]);

  // Marca ação como executada
  const markExecuted = useCallback(async (
    actionId: string,
    result: Record<string, unknown>
  ): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('clara_autonomous_actions')
        .update({
          status: 'executed',
          executed_at: new Date().toISOString(),
          result: result as unknown as never,
        })
        .eq('id', actionId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setActions(prev => 
        prev.map(a => a.id === actionId ? { 
          ...a, 
          status: 'executed' as const,
          executed_at: new Date().toISOString(),
          result,
        } : a)
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao marcar execução:', error);
      return false;
    }
  }, [user?.id]);

  // Dispara ação baseado em evento
  const triggerFromEvent = useCallback(async (eventName: string): Promise<string | null> => {
    const trigger = AUTO_TRIGGERS[eventName];
    if (!trigger) {
      console.warn(`Trigger não encontrado para evento: ${eventName}`);
      return null;
    }
    
    return createAction(trigger);
  }, [createAction]);

  // Executa ações aprovadas pendentes
  const executeApprovedActions = useCallback(async (): Promise<number> => {
    if (!user?.id) return 0;
    
    const approved = actions.filter(a => a.status === 'approved');
    let executed = 0;
    
    for (const action of approved) {
      try {
        // Aqui entraria a lógica real de execução baseada no action_type
        // Por enquanto, apenas marca como executada
        const success = await markExecuted(action.id, {
          executed_by: 'autonomous_system',
          timestamp: new Date().toISOString(),
        });
        
        if (success) executed++;
      } catch (error) {
        console.error(`Erro ao executar ação ${action.id}:`, error);
      }
    }
    
    return executed;
  }, [user?.id, actions, markExecuted]);

  // Carrega ações pendentes ao montar
  useEffect(() => {
    if (user?.id) {
      fetchActions(['pending', 'approved']);
    }
  }, [user?.id, fetchActions]);

  return {
    actions,
    pendingCount,
    loading,
    fetchActions,
    createAction,
    approveAction,
    rejectAction,
    markExecuted,
    triggerFromEvent,
    executeApprovedActions,
  };
}
