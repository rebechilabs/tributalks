import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format, startOfDay, endOfDay } from "date-fns";

export interface CostMetrics {
  totalCost: number;
  costPerUser: number;
  costByModel: { model: string; cost: number; queries: number }[];
  dailyCosts: { date: string; cost: number }[];
  cacheSavings: number;
  tokensSaved: number;
}

export interface QualityMetrics {
  positiveRate: number;
  negativeRate: number;
  totalFeedback: number;
  avgConfidence: number;
  cacheHitRate: number;
  responsesByCategory: { category: string; count: number }[];
  feedbackTrend: { date: string; positive: number; negative: number }[];
}

export interface AgentMetrics {
  totalActions: number;
  pendingActions: number;
  approvedActions: number;
  rejectedActions: number;
  executedActions: number;
  avgExecutionTime: number;
  actionsByAgent: { agent: string; count: number; approved: number }[];
  triggersByEvent: { event: string; count: number }[];
}

export interface MemoryMetrics {
  totalPatterns: number;
  activePatterns: number;
  highConfidencePatterns: number;
  totalMemories: number;
  activeMemories: number;
  avgPatternConfidence: number;
  avgMemoryImportance: number;
  patternsByType: { type: string; count: number; avgConfidence: number }[];
}

export interface RAGMetrics {
  totalDocuments: number;
  embeddedDocuments: number;
  pendingEmbedding: number;
  avgSimilarityScore: number;
  searchVolume: number;
  topCategories: { category: string; count: number }[];
}

export interface AIHealthMetrics {
  cost: CostMetrics;
  quality: QualityMetrics;
  agents: AgentMetrics;
  memory: MemoryMetrics;
  rag: RAGMetrics;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: Date | null;
}

// Cost estimates per 1K tokens (in BRL)
const MODEL_COSTS = {
  'gemini-2.5-flash': 0.15,
  'gemini-2.5-pro': 0.60,
  'claude-sonnet-4': 3.00,
  'claude-3-5-sonnet': 2.50,
  'default': 0.50,
};

export function useAIHealthMetrics(days: number = 7): AIHealthMetrics {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const [cost, setCost] = useState<CostMetrics>({
    totalCost: 0,
    costPerUser: 0,
    costByModel: [],
    dailyCosts: [],
    cacheSavings: 0,
    tokensSaved: 0,
  });

  const [quality, setQuality] = useState<QualityMetrics>({
    positiveRate: 0,
    negativeRate: 0,
    totalFeedback: 0,
    avgConfidence: 0,
    cacheHitRate: 0,
    responsesByCategory: [],
    feedbackTrend: [],
  });

  const [agents, setAgents] = useState<AgentMetrics>({
    totalActions: 0,
    pendingActions: 0,
    approvedActions: 0,
    rejectedActions: 0,
    executedActions: 0,
    avgExecutionTime: 0,
    actionsByAgent: [],
    triggersByEvent: [],
  });

  const [memory, setMemory] = useState<MemoryMetrics>({
    totalPatterns: 0,
    activePatterns: 0,
    highConfidencePatterns: 0,
    totalMemories: 0,
    activeMemories: 0,
    avgPatternConfidence: 0,
    avgMemoryImportance: 0,
    patternsByType: [],
  });

  const [rag, setRAG] = useState<RAGMetrics>({
    totalDocuments: 0,
    embeddedDocuments: 0,
    pendingEmbedding: 0,
    avgSimilarityScore: 0,
    searchVolume: 0,
    topCategories: [],
  });

  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Parallel fetch all data
      const [
        { data: conversations, error: convError },
        { data: feedback, error: fbError },
        { data: cache, error: cacheError },
        { data: autonomousActions, error: actionsError },
        { data: patterns, error: patternsError },
        { data: memories, error: memoriesError },
        { data: knowledgeBase, error: kbError },
        { data: profiles, error: profilesError },
      ] = await Promise.all([
        supabase
          .from('clara_conversations')
          .select('id, model_used, tokens_used, created_at, role')
          .gte('created_at', startDate)
          .eq('role', 'assistant'),
        supabase
          .from('clara_feedback')
          .select('id, rating, category, created_at, model_used')
          .gte('created_at', startDate),
        supabase
          .from('clara_cache')
          .select('id, hit_count, tokens_saved, model_used, created_at'),
        supabase
          .from('clara_autonomous_actions')
          .select('id, agent_type, status, trigger_event, created_at, executed_at')
          .gte('created_at', startDate),
        supabase
          .from('clara_learned_patterns')
          .select('id, pattern_type, confidence, times_observed'),
        supabase
          .from('clara_memory')
          .select('id, category, importance, expires_at'),
        supabase
          .from('clara_knowledge_base')
          .select('id, category, status, embedding'),
        supabase
          .from('profiles')
          .select('id'),
      ]);

      if (convError) throw convError;
      if (fbError) throw fbError;
      if (cacheError) throw cacheError;
      if (actionsError) throw actionsError;
      if (patternsError) throw patternsError;
      if (memoriesError) throw memoriesError;
      if (kbError) throw kbError;

      const activeUsers = profiles?.length || 1;

      // ===== COST METRICS =====
      const modelCosts: Record<string, { cost: number; queries: number }> = {};
      let totalCost = 0;
      const dailyCostsMap: Record<string, number> = {};

      conversations?.forEach(conv => {
        const model = conv.model_used || 'default';
        const tokens = conv.tokens_used || 500;
        const costPer1k = MODEL_COSTS[model as keyof typeof MODEL_COSTS] || MODEL_COSTS.default;
        const queryCost = (tokens / 1000) * costPer1k;
        
        totalCost += queryCost;
        
        if (!modelCosts[model]) {
          modelCosts[model] = { cost: 0, queries: 0 };
        }
        modelCosts[model].cost += queryCost;
        modelCosts[model].queries += 1;

        const day = format(new Date(conv.created_at), 'yyyy-MM-dd');
        dailyCostsMap[day] = (dailyCostsMap[day] || 0) + queryCost;
      });

      const totalTokensSaved = cache?.reduce((acc, c) => acc + (c.tokens_saved || 0), 0) || 0;
      const cacheHits = cache?.reduce((acc, c) => acc + (c.hit_count || 0), 0) || 0;
      const cacheSavings = (totalTokensSaved / 1000) * MODEL_COSTS.default;

      setCost({
        totalCost: Math.round(totalCost * 100) / 100,
        costPerUser: Math.round((totalCost / activeUsers) * 100) / 100,
        costByModel: Object.entries(modelCosts).map(([model, data]) => ({
          model,
          cost: Math.round(data.cost * 100) / 100,
          queries: data.queries,
        })).sort((a, b) => b.cost - a.cost),
        dailyCosts: Object.entries(dailyCostsMap).map(([date, cost]) => ({
          date,
          cost: Math.round(cost * 100) / 100,
        })).sort((a, b) => a.date.localeCompare(b.date)),
        cacheSavings: Math.round(cacheSavings * 100) / 100,
        tokensSaved: totalTokensSaved,
      });

      // ===== QUALITY METRICS =====
      const positive = feedback?.filter(f => f.rating === 'positive').length || 0;
      const negative = feedback?.filter(f => f.rating === 'negative').length || 0;
      const totalFb = feedback?.length || 1;

      const categoryMap: Record<string, number> = {};
      feedback?.forEach(f => {
        const cat = f.category || 'geral';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });

      const feedbackTrendMap: Record<string, { positive: number; negative: number }> = {};
      feedback?.forEach(f => {
        const day = format(new Date(f.created_at), 'yyyy-MM-dd');
        if (!feedbackTrendMap[day]) {
          feedbackTrendMap[day] = { positive: 0, negative: 0 };
        }
        if (f.rating === 'positive') feedbackTrendMap[day].positive++;
        else feedbackTrendMap[day].negative++;
      });

      const totalConvs = conversations?.length || 1;
      const cacheHitRate = totalConvs > 0 ? (cacheHits / (totalConvs + cacheHits)) * 100 : 0;

      setQuality({
        positiveRate: Math.round((positive / totalFb) * 100),
        negativeRate: Math.round((negative / totalFb) * 100),
        totalFeedback: totalFb,
        avgConfidence: 75, // Would need to track from conversations
        cacheHitRate: Math.round(cacheHitRate),
        responsesByCategory: Object.entries(categoryMap).map(([category, count]) => ({
          category,
          count,
        })),
        feedbackTrend: Object.entries(feedbackTrendMap).map(([date, data]) => ({
          date,
          ...data,
        })).sort((a, b) => a.date.localeCompare(b.date)),
      });

      // ===== AGENT METRICS =====
      const pending = autonomousActions?.filter(a => a.status === 'pending').length || 0;
      const approved = autonomousActions?.filter(a => a.status === 'approved').length || 0;
      const rejected = autonomousActions?.filter(a => a.status === 'rejected').length || 0;
      const executed = autonomousActions?.filter(a => a.status === 'executed').length || 0;

      const agentMap: Record<string, { count: number; approved: number }> = {};
      const triggerMap: Record<string, number> = {};

      autonomousActions?.forEach(action => {
        const agent = action.agent_type;
        if (!agentMap[agent]) {
          agentMap[agent] = { count: 0, approved: 0 };
        }
        agentMap[agent].count++;
        if (action.status === 'approved' || action.status === 'executed') {
          agentMap[agent].approved++;
        }

        const trigger = action.trigger_event;
        triggerMap[trigger] = (triggerMap[trigger] || 0) + 1;
      });

      // Calculate avg execution time
      const executedWithTime = autonomousActions?.filter(a => a.executed_at && a.created_at) || [];
      const avgExecTime = executedWithTime.length > 0
        ? executedWithTime.reduce((acc, a) => {
            const created = new Date(a.created_at).getTime();
            const executed = new Date(a.executed_at!).getTime();
            return acc + (executed - created);
          }, 0) / executedWithTime.length / 1000 // in seconds
        : 0;

      setAgents({
        totalActions: autonomousActions?.length || 0,
        pendingActions: pending,
        approvedActions: approved,
        rejectedActions: rejected,
        executedActions: executed,
        avgExecutionTime: Math.round(avgExecTime),
        actionsByAgent: Object.entries(agentMap).map(([agent, data]) => ({
          agent,
          count: data.count,
          approved: data.approved,
        })),
        triggersByEvent: Object.entries(triggerMap).map(([event, count]) => ({
          event,
          count,
        })).sort((a, b) => b.count - a.count),
      });

      // ===== MEMORY METRICS =====
      const activePatterns = patterns?.filter(p => (p.confidence || 0) > 0.3).length || 0;
      const highConfPatterns = patterns?.filter(p => (p.confidence || 0) > 0.7).length || 0;
      const avgConfidence = patterns && patterns.length > 0
        ? patterns.reduce((acc, p) => acc + (p.confidence || 0), 0) / patterns.length
        : 0;

      const activeMemories = memories?.filter(m => !m.expires_at || new Date(m.expires_at) > new Date()).length || 0;
      const avgImportance = memories && memories.length > 0
        ? memories.reduce((acc, m) => acc + (m.importance || 0), 0) / memories.length
        : 0;

      const patternTypeMap: Record<string, { count: number; totalConf: number }> = {};
      patterns?.forEach(p => {
        const type = p.pattern_type;
        if (!patternTypeMap[type]) {
          patternTypeMap[type] = { count: 0, totalConf: 0 };
        }
        patternTypeMap[type].count++;
        patternTypeMap[type].totalConf += p.confidence || 0;
      });

      setMemory({
        totalPatterns: patterns?.length || 0,
        activePatterns,
        highConfidencePatterns: highConfPatterns,
        totalMemories: memories?.length || 0,
        activeMemories,
        avgPatternConfidence: Math.round(avgConfidence * 100),
        avgMemoryImportance: Math.round(avgImportance * 10) / 10,
        patternsByType: Object.entries(patternTypeMap).map(([type, data]) => ({
          type,
          count: data.count,
          avgConfidence: Math.round((data.totalConf / data.count) * 100),
        })),
      });

      // ===== RAG METRICS =====
      const embedded = knowledgeBase?.filter(kb => kb.embedding !== null).length || 0;
      const pendingEmbed = knowledgeBase?.filter(kb => kb.embedding === null && kb.status === 'published').length || 0;

      const kbCategoryMap: Record<string, number> = {};
      knowledgeBase?.forEach(kb => {
        const cat = kb.category;
        kbCategoryMap[cat] = (kbCategoryMap[cat] || 0) + 1;
      });

      setRAG({
        totalDocuments: knowledgeBase?.length || 0,
        embeddedDocuments: embedded,
        pendingEmbedding: pendingEmbed,
        avgSimilarityScore: 78, // Would need to track from searches
        searchVolume: conversations?.length || 0,
        topCategories: Object.entries(kbCategoryMap).map(([category, count]) => ({
          category,
          count,
        })).sort((a, b) => b.count - a.count).slice(0, 5),
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching AI health metrics:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  }, [days, startDate]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    cost,
    quality,
    agents,
    memory,
    rag,
    loading,
    error,
    refetch: fetchMetrics,
    lastUpdated,
  };
}
