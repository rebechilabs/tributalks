import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// ============================================
// TIPOS PARA MEMÓRIA EVOLUTIVA
// ============================================

export interface LearnedPattern {
  pattern_type: string;
  pattern_key: string;
  pattern_value: Record<string, unknown>;
  confidence: number;
  times_observed: number;
  decay_rate?: number;
  last_observed_at?: string;
}

export interface UserDecision {
  id: string;
  decision_type: string;
  context: Record<string, unknown>;
  options_presented: string[] | null;
  option_chosen: string | null;
  outcome_feedback: 'positive' | 'negative' | 'neutral' | null;
  agent_type: string | null;
  created_at: string;
}

export interface UserPreferences {
  communicationStyle: 'formal' | 'casual' | 'technical';
  detailLevel: 'minimal' | 'balanced' | 'detailed';
  proactiveAlerts: boolean;
  preferredTools: string[];
  avoidedTopics: string[];
}

export interface MemoryStats {
  total_patterns: number;
  active_patterns: number;
  high_confidence_patterns: number;
  total_memories: number;
  active_memories: number;
  avg_pattern_confidence: number;
  avg_memory_importance: number;
  oldest_pattern_days: number;
  most_used_pattern_key: string;
}

// ============================================
// HOOK - Sistema de Aprendizado
// ============================================

export function useClaraLearning() {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<LearnedPattern[]>([]);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Busca padrões aprendidos do usuário
  const fetchPatterns = useCallback(async (
    patternType?: string,
    minConfidence = 0.3
  ): Promise<LearnedPattern[]> => {
    if (!user?.id) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_patterns', {
        p_user_id: user.id,
        p_pattern_type: patternType || null,
        p_min_confidence: minConfidence,
        p_limit: 50,
      });

      if (error) throw error;
      
      const typedPatterns = (data || []) as LearnedPattern[];
      setPatterns(typedPatterns);
      return typedPatterns;
    } catch (error) {
      console.error('Erro ao buscar padrões:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Registra uma decisão do usuário para aprendizado
  const recordDecision = useCallback(async (
    decisionType: string,
    context: Record<string, unknown>,
    options?: string[],
    chosen?: string,
    agentType?: string
  ): Promise<string | null> => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase.rpc('record_user_decision', {
        p_user_id: user.id,
        p_decision_type: decisionType,
        p_context: context as unknown as never,
        p_options: (options || null) as unknown as never,
        p_chosen: chosen || null,
        p_agent_type: agentType || null,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao registrar decisão:', error);
      return null;
    }
  }, [user?.id]);

  // Atualiza feedback de uma decisão anterior
  const updateDecisionFeedback = useCallback(async (
    decisionId: string,
    feedback: 'positive' | 'negative' | 'neutral'
  ): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('clara_user_decisions')
        .update({ outcome_feedback: feedback })
        .eq('id', decisionId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Atualiza confiança do padrão baseado no feedback
      const confidenceAdjustment = feedback === 'positive' ? 0.05 : 
                                    feedback === 'negative' ? -0.1 : 0;
      
      if (confidenceAdjustment !== 0) {
        // Busca a decisão para encontrar o padrão relacionado
        const { data: decision } = await supabase
          .from('clara_user_decisions')
          .select('decision_type, option_chosen')
          .eq('id', decisionId)
          .single();
        
        if (decision) {
          const patternKey = `${decision.decision_type}:${decision.option_chosen || 'no_choice'}`;
          
          // Busca e atualiza o padrão manualmente
          const { data: existingPattern } = await supabase
            .from('clara_learned_patterns')
            .select('confidence')
            .eq('user_id', user.id)
            .eq('pattern_key', patternKey)
            .single();
          
          if (existingPattern) {
            const newConfidence = Math.max(0.1, Math.min(0.95, 
              (existingPattern.confidence || 0.5) + confidenceAdjustment
            ));
            
            await supabase
              .from('clara_learned_patterns')
              .update({
                confidence: newConfidence,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', user.id)
              .eq('pattern_key', patternKey);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar feedback:', error);
      return false;
    }
  }, [user?.id]);

  // Infere preferências do usuário baseado nos padrões
  const inferPreferences = useCallback(async (): Promise<UserPreferences> => {
    const patterns = await fetchPatterns('preference', 0.5);
    
    // Valores padrão
    const prefs: UserPreferences = {
      communicationStyle: 'balanced' as 'formal' | 'casual' | 'technical',
      detailLevel: 'balanced',
      proactiveAlerts: true,
      preferredTools: [],
      avoidedTopics: [],
    };
    
    // Analisa padrões para inferir preferências
    for (const pattern of patterns) {
      if (pattern.pattern_key.includes('style:')) {
        const style = pattern.pattern_key.split(':')[1];
        if (['formal', 'casual', 'technical'].includes(style)) {
          prefs.communicationStyle = style as 'formal' | 'casual' | 'technical';
        }
      }
      if (pattern.pattern_key.includes('detail:')) {
        const detail = pattern.pattern_key.split(':')[1];
        if (['minimal', 'balanced', 'detailed'].includes(detail)) {
          prefs.detailLevel = detail as 'minimal' | 'balanced' | 'detailed';
        }
      }
      if (pattern.pattern_key.includes('tool:')) {
        const tool = pattern.pattern_key.split(':')[1];
        if (pattern.confidence > 0.6) {
          prefs.preferredTools.push(tool);
        }
      }
    }
    
    return prefs;
  }, [fetchPatterns]);

  // Registra uso de ferramenta para aprendizado
  const recordToolUsage = useCallback(async (
    toolName: string,
    context: Record<string, unknown>
  ) => {
    return recordDecision('tool_usage', { tool: toolName, ...context }, undefined, toolName);
  }, [recordDecision]);

  // Registra preferência de comunicação
  const recordCommunicationPreference = useCallback(async (
    style: 'formal' | 'casual' | 'technical',
    context: Record<string, unknown>
  ) => {
    return recordDecision(
      'communication_preference',
      context,
      ['formal', 'casual', 'technical'],
      style
    );
  }, [recordDecision]);

  // Reforça um padrão existente (aumenta confiança)
  const reinforcePattern = useCallback(async (
    patternType: string,
    patternKey: string,
    boost = 0.1
  ): Promise<{ confidence: number; timesObserved: number } | null> => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase.rpc('reinforce_pattern', {
        p_user_id: user.id,
        p_pattern_type: patternType,
        p_pattern_key: patternKey,
        p_boost: boost,
      });

      if (error) throw error;
      
      const result = data?.[0];
      if (result) {
        // Atualiza estado local
        setPatterns(prev => prev.map(p => 
          p.pattern_type === patternType && p.pattern_key === patternKey
            ? { ...p, confidence: result.new_confidence, times_observed: result.new_times_observed }
            : p
        ));
        return { 
          confidence: result.new_confidence, 
          timesObserved: result.new_times_observed 
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao reforçar padrão:', error);
      return null;
    }
  }, [user?.id]);

  // Busca estatísticas de memória evolutiva
  const fetchMemoryStats = useCallback(async (): Promise<MemoryStats | null> => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase.rpc('get_memory_stats', {
        p_user_id: user.id,
      });

      if (error) throw error;
      
      const result = data?.[0] as MemoryStats | undefined;
      if (result) {
        setStats(result);
      }
      return result || null;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return null;
    }
  }, [user?.id]);

  // Carrega estatísticas ao montar
  useEffect(() => {
    if (user?.id) {
      fetchMemoryStats();
    }
  }, [user?.id, fetchMemoryStats]);

  return {
    patterns,
    stats,
    loading,
    fetchPatterns,
    recordDecision,
    updateDecisionFeedback,
    inferPreferences,
    recordToolUsage,
    recordCommunicationPreference,
    reinforcePattern,
    fetchMemoryStats,
  };
}

// ============================================
// HOOK - Memória de Contexto
// ============================================

export function useClaraContextMemory() {
  const { user } = useAuth();

  // Salva contexto importante na memória
  const saveToMemory = useCallback(async (
    content: string,
    category: string,
    options?: {
      memoryType?: string;
      importance?: number;
      sourceScreen?: string;
      learnedPattern?: Record<string, unknown>;
    }
  ): Promise<string | null> => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('clara_memory')
        .insert([{
          user_id: user.id,
          content,
          category,
          memory_type: options?.memoryType || 'context',
          importance: options?.importance || 5,
          source_screen: options?.sourceScreen || null,
          learned_pattern: options?.learnedPattern ? JSON.parse(JSON.stringify(options.learnedPattern)) : null,
        }])
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Erro ao salvar memória:', error);
      return null;
    }
  }, [user?.id]);

  // Busca memórias relevantes para um contexto
  const recallMemories = useCallback(async (
    category?: string,
    limit = 10
  ) => {
    if (!user?.id) return [];
    
    try {
      let query = supabase
        .from('clara_memory')
        .select('id, content, category, importance, source_screen, learned_pattern, created_at')
        .eq('user_id', user.id)
        .order('importance', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar memórias:', error);
      return [];
    }
  }, [user?.id]);

  // Reforça uma memória existente (aumenta importância)
  const reinforceMemory = useCallback(async (memoryId: string) => {
    if (!user?.id) return false;
    
    try {
      // Primeiro busca os valores atuais
      const { data: current } = await supabase
        .from('clara_memory')
        .select('times_reinforced, importance')
        .eq('id', memoryId)
        .eq('user_id', user.id)
        .single();
      
      if (!current) return false;
      
      const { error } = await supabase
        .from('clara_memory')
        .update({
          times_reinforced: (current.times_reinforced || 0) + 1,
          importance: Math.min(10, (current.importance || 5) + 1),
          last_used_at: new Date().toISOString(),
        })
        .eq('id', memoryId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao reforçar memória:', error);
      return false;
    }
  }, [user?.id]);

  return {
    saveToMemory,
    recallMemories,
    reinforceMemory,
  };
}
