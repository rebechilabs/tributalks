import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ClaraMemory {
  id: string;
  memory_type: string;
  category: string;
  content: string;
  importance: number;
  source_screen: string | null;
  created_at: string;
}

interface ClaraConversation {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  screen_context: string | null;
  created_at: string;
}

/**
 * Hook para gerenciar memória de longo prazo da Clara
 * Permite que a Clara "lembre" de contextos importantes entre sessões
 */
export function useClaraMemory() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<ClaraMemory[]>([]);
  const [loading, setLoading] = useState(false);

  // Busca memórias do usuário
  const fetchMemories = useCallback(async (category?: string, limit = 20) => {
    if (!user?.id) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_memories', {
        p_user_id: user.id,
        p_category: category || null,
        p_limit: limit
      });

      if (error) throw error;
      
      const typedData = (data || []) as ClaraMemory[];
      setMemories(typedData);
      return typedData;
    } catch (error) {
      console.error('Erro ao buscar memórias:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Busca conversas recentes
  const fetchConversations = useCallback(async (limit = 20): Promise<ClaraConversation[]> => {
    if (!user?.id) return [];
    
    try {
      const { data, error } = await supabase.rpc('get_recent_conversations', {
        p_user_id: user.id,
        p_limit: limit
      });

      if (error) throw error;
      return (data || []) as ClaraConversation[];
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      return [];
    }
  }, [user?.id]);

  return {
    memories,
    loading,
    fetchMemories,
    fetchConversations,
  };
}

/**
 * Hook para gerenciar feedback da Clara
 * Coleta thumbs up/down para treinar o modelo no futuro
 */
export function useClaraFeedback() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const submitFeedback = useCallback(async (
    messageContent: string,
    responseContent: string,
    rating: 'positive' | 'negative' | 'neutral',
    options?: {
      feedbackText?: string;
      category?: string;
      contextScreen?: string;
      conversationId?: string;
      modelUsed?: string;
    }
  ) => {
    if (!user?.id) return null;
    
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('clara_feedback')
        .insert({
          user_id: user.id,
          message_content: messageContent,
          response_content: responseContent,
          rating,
          feedback_text: options?.feedbackText,
          category: options?.category,
          context_screen: options?.contextScreen,
          conversation_id: options?.conversationId,
          model_used: options?.modelUsed,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [user?.id]);

  return {
    submitting,
    submitFeedback,
  };
}

/**
 * Hook para insights proativos da Clara
 * Mostra alertas e recomendações baseados em dados
 */
export function useClaraInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Array<{
    id: string;
    insight_type: string;
    priority: string;
    title: string;
    description: string;
    action_cta: string | null;
    action_route: string | null;
    created_at: string;
  }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchActiveInsights = useCallback(async () => {
    if (!user?.id) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clara_insights')
        .select('id, insight_type, priority, title, description, action_cta, action_route, created_at')
        .eq('user_id', user.id)
        .is('dismissed_at', null)
        .is('acted_at', null)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setInsights(data || []);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar insights:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const dismissInsight = useCallback(async (insightId: string) => {
    if (!user?.id) return;
    
    try {
      await supabase
        .from('clara_insights')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', insightId)
        .eq('user_id', user.id);
      
      setInsights(prev => prev.filter(i => i.id !== insightId));
    } catch (error) {
      console.error('Erro ao dispensar insight:', error);
    }
  }, [user?.id]);

  const markInsightActed = useCallback(async (insightId: string) => {
    if (!user?.id) return;
    
    try {
      await supabase
        .from('clara_insights')
        .update({ acted_at: new Date().toISOString() })
        .eq('id', insightId)
        .eq('user_id', user.id);
      
      setInsights(prev => prev.filter(i => i.id !== insightId));
    } catch (error) {
      console.error('Erro ao marcar insight como acionado:', error);
    }
  }, [user?.id]);

  return {
    insights,
    loading,
    fetchActiveInsights,
    dismissInsight,
    markInsightActed,
  };
}
