import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AgentType } from "./useClaraAgents";
import { toast } from "sonner";

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
  // Entender Agent Triggers
  'xml_imported': {
    event: 'xml_imported',
    agentType: 'entender',
    actionType: 'analyze_credits',
    payload: { analysis_type: 'full' },
    requiresApproval: false,
    priority: 'medium',
  },
  'score_below_60': {
    event: 'score_below_threshold',
    agentType: 'entender',
    actionType: 'generate_compliance_alert',
    payload: { threshold: 60, severity: 'high' },
    requiresApproval: false,
    priority: 'high',
  },
  'dctf_gap_detected': {
    event: 'dctf_gap_detected',
    agentType: 'recuperar',
    actionType: 'notify_gap',
    payload: { notification_type: 'gap_alert' },
    requiresApproval: false,
    priority: 'urgent',
  },
  
  // Precificar Agent Triggers
  'margin_drop_5pp': {
    event: 'margin_drop_detected',
    agentType: 'precificar',
    actionType: 'generate_margin_alert',
    payload: { drop_threshold: 5 },
    requiresApproval: false,
    priority: 'high',
  },
  'dre_updated': {
    event: 'dre_updated',
    agentType: 'entender',
    actionType: 'recalculate_projections',
    payload: {},
    requiresApproval: false,
    priority: 'low',
  },
  
  // Planejar Agent Triggers
  'deadline_7_days': {
    event: 'deadline_approaching',
    agentType: 'planejar',
    actionType: 'send_deadline_reminder',
    payload: { days_before: 7 },
    requiresApproval: false,
    priority: 'medium',
  },
  'benefit_expiring': {
    event: 'benefit_expiring',
    agentType: 'planejar',
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
  const [executingIds, setExecutingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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

  // Aprova e executa uma ação pendente
  const approveAction = useCallback(async (actionId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    setExecutingIds(prev => new Set([...prev, actionId]));
    
    try {
      // Atualiza para aprovado - o trigger do banco vai disparar a execução
      const { error } = await supabase
        .from('clara_autonomous_actions')
        .update({ status: 'approved' })
        .eq('id', actionId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success("Ação aprovada", {
        description: "A Clara está executando a ação...",
      });
      
      // Atualização otimista
      setActions(prev => 
        prev.map(a => a.id === actionId ? { ...a, status: 'approved' as const } : a)
      );
      setPendingCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('Erro ao aprovar ação:', error);
      toast.error("Erro ao aprovar ação");
      return false;
    } finally {
      setExecutingIds(prev => {
        const next = new Set(prev);
        next.delete(actionId);
        return next;
      });
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
      
      toast.info("Ação rejeitada");
      setActions(prev => prev.filter(a => a.id !== actionId));
      setPendingCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('Erro ao rejeitar ação:', error);
      toast.error("Erro ao rejeitar ação");
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

  // Carrega ações e configura realtime
  useEffect(() => {
    if (!user?.id) return;

    fetchActions(['pending', 'approved', 'executed']);

    // Configura subscription realtime
    channelRef.current = supabase
      .channel('clara-actions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clara_autonomous_actions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          if (eventType === 'INSERT') {
            const action = newRecord as AutonomousAction;
            setActions(prev => [action, ...prev]);
            if (action.status === 'pending') {
              setPendingCount(prev => prev + 1);
              toast.info("Nova ação detectada", {
                description: `Clara sugere: ${action.action_type.replace(/_/g, ' ')}`,
              });
            }
          } else if (eventType === 'UPDATE') {
            const action = newRecord as AutonomousAction;
            const oldAction = oldRecord as AutonomousAction;
            
            setActions(prev => 
              prev.map(a => a.id === action.id ? action : a)
            );
            
            // Se mudou para executed, notifica
            if (action.status === 'executed' && oldAction?.status !== 'executed') {
              toast.success("Ação executada com sucesso", {
                description: action.action_type.replace(/_/g, ' '),
              });
            } else if (action.status === 'failed' && oldAction?.status !== 'failed') {
              toast.error("Falha na execução", {
                description: (action.result as { message?: string })?.message || action.action_type,
              });
            }
            
            // Recalcula pending count
            if (oldAction?.status === 'pending' && action.status !== 'pending') {
              setPendingCount(prev => Math.max(0, prev - 1));
            }
          } else if (eventType === 'DELETE') {
            const id = (oldRecord as AutonomousAction).id;
            setActions(prev => prev.filter(a => a.id !== id));
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user?.id, fetchActions]);

  return {
    actions,
    pendingCount,
    executingIds,
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
