import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// ============================================
// TIPOS PARA BUSCA SEMÂNTICA
// ============================================

export interface SemanticSearchResult {
  type: 'knowledge' | 'memory' | 'pattern';
  id: string;
  content: string;
  title?: string;
  category?: string;
  similarity: number;
  metadata?: Record<string, unknown>;
}

export interface SemanticSearchResponse {
  results: SemanticSearchResult[];
  query: string;
  totalFound: number;
  searchTypes: string[];
}

export interface SemanticSearchOptions {
  searchTypes?: ('knowledge' | 'memory' | 'pattern')[];
  similarityThreshold?: number;
  maxResults?: number;
}

// ============================================
// HOOK - Busca Semântica
// ============================================

export function useSemanticSearch() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResults, setLastResults] = useState<SemanticSearchResult[]>([]);

  /**
   * Executa busca semântica em knowledge_base, memórias e padrões
   */
  const search = useCallback(async (
    query: string,
    options: SemanticSearchOptions = {}
  ): Promise<SemanticSearchResult[]> => {
    if (!query.trim()) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('semantic-search', {
        body: {
          query: query.trim(),
          userId: user?.id,
          searchTypes: options.searchTypes || ['knowledge', 'memory'],
          similarityThreshold: options.similarityThreshold || 0.6,
          maxResults: options.maxResults || 10,
        },
      });

      if (fnError) throw fnError;

      const response = data as SemanticSearchResponse;
      setLastResults(response.results);
      
      return response.results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro na busca semântica';
      setError(message);
      console.error('Semantic search error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Busca apenas na knowledge_base (para contexto da Clara)
   */
  const searchKnowledge = useCallback(async (
    query: string,
    maxResults = 5
  ): Promise<SemanticSearchResult[]> => {
    return search(query, {
      searchTypes: ['knowledge'],
      similarityThreshold: 0.65,
      maxResults,
    });
  }, [search]);

  /**
   * Busca nas memórias e padrões do usuário (contexto personalizado)
   */
  const searchUserContext = useCallback(async (
    query: string,
    maxResults = 8
  ): Promise<SemanticSearchResult[]> => {
    if (!user?.id) return [];
    
    return search(query, {
      searchTypes: ['memory', 'pattern'],
      similarityThreshold: 0.5,
      maxResults,
    });
  }, [search, user?.id]);

  /**
   * Busca híbrida para contexto completo da Clara
   */
  const searchForClaraContext = useCallback(async (
    query: string
  ): Promise<{
    knowledge: SemanticSearchResult[];
    userContext: SemanticSearchResult[];
  }> => {
    const [knowledge, userContext] = await Promise.all([
      searchKnowledge(query, 5),
      searchUserContext(query, 5),
    ]);

    return { knowledge, userContext };
  }, [searchKnowledge, searchUserContext]);

  /**
   * Formata resultados para injeção no prompt da Clara
   */
  const formatForPrompt = useCallback((results: SemanticSearchResult[]): string => {
    if (results.length === 0) return '';

    const sections: string[] = [];
    
    const knowledge = results.filter(r => r.type === 'knowledge');
    const memories = results.filter(r => r.type === 'memory');
    const patterns = results.filter(r => r.type === 'pattern');

    if (knowledge.length > 0) {
      sections.push('**Conhecimento Relevante:**');
      for (const k of knowledge) {
        sections.push(`- ${k.title || k.category}: ${k.content.slice(0, 300)}...`);
      }
    }

    if (memories.length > 0) {
      sections.push('\n**Memórias do Usuário:**');
      for (const m of memories) {
        sections.push(`- [${m.category}] ${m.content}`);
      }
    }

    if (patterns.length > 0) {
      sections.push('\n**Padrões Detectados:**');
      for (const p of patterns) {
        const confidence = (p.metadata?.confidence as number) || 0;
        sections.push(`- ${p.content} (confiança: ${(confidence * 100).toFixed(0)}%)`);
      }
    }

    return sections.join('\n');
  }, []);

  return {
    search,
    searchKnowledge,
    searchUserContext,
    searchForClaraContext,
    formatForPrompt,
    loading,
    error,
    lastResults,
  };
}

// ============================================
// HOOK - Geração de Embeddings
// ============================================

export function useEmbeddings() {
  const [loading, setLoading] = useState(false);

  /**
   * Gera embedding para um conteúdo
   */
  const generateEmbedding = useCallback(async (
    content: string,
    contentType: 'knowledge' | 'memory' | 'pattern' | 'query',
    recordId?: string
  ): Promise<number[] | null> => {
    if (!content.trim()) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-embeddings', {
        body: { content, contentType, recordId },
      });

      if (error) throw error;
      return data.embedding;
    } catch (err) {
      console.error('Embedding generation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Gera embeddings em batch para múltiplos registros
   */
  const generateBatchEmbeddings = useCallback(async (
    items: Array<{ id: string; content: string; type: 'knowledge' | 'memory' | 'pattern' }>
  ): Promise<{ success: number; failed: number }> => {
    let success = 0;
    let failed = 0;

    for (const item of items) {
      const result = await generateEmbedding(item.content, item.type, item.id);
      if (result) {
        success++;
      } else {
        failed++;
      }
      // Rate limiting básico
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return { success, failed };
  }, [generateEmbedding]);

  return {
    generateEmbedding,
    generateBatchEmbeddings,
    loading,
  };
}
