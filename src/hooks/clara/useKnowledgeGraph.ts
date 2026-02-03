import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// ============================================
// KNOWLEDGE GRAPH TRIBUTÁRIO
// ============================================

export type KGNodeType = 
  | 'ncm' | 'nbs' | 'cfop' | 'regime' | 'beneficio' 
  | 'tributo' | 'fornecedor' | 'estado' | 'setor' | 'aliquota';

export type KGEdgeType =
  | 'tributado_por' | 'tem_beneficio' | 'aplica_em' | 'fornece'
  | 'opera_com' | 'gera_credito' | 'impacta' | 'pertence_a'
  | 'substitui' | 'depende_de' | 'conflita_com';

export interface KGNode {
  id: string;
  node_type: KGNodeType;
  code: string;
  label: string;
  description?: string;
  properties: Record<string, unknown>;
  source?: string;
}

export interface KGRelationship {
  relationship_id: string;
  edge_type: KGEdgeType;
  direction: 'outgoing' | 'incoming';
  related_node_id: string;
  related_node_type: KGNodeType;
  related_node_code: string;
  related_node_label: string;
  weight: number;
  properties: Record<string, unknown>;
}

export interface CascadeImpact {
  depth: number;
  path: string[];
  node_id: string;
  node_type: KGNodeType;
  node_code: string;
  node_label: string;
  impact_weight: number;
  edge_chain: KGEdgeType[];
}

export interface RelationshipPath {
  path_length: number;
  node_path: string[];
  edge_path: KGEdgeType[];
  total_weight: number;
}

export interface ReformImpact {
  id: string;
  node_id: string;
  impact_type: string;
  current_value: number;
  projected_value: number;
  delta_value: number;
  effective_date: string;
  details: Record<string, unknown>;
}

export function useKnowledgeGraph() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca um nó pelo código e tipo
  const getNode = useCallback(async (
    code: string, 
    nodeType: KGNodeType
  ): Promise<KGNode | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('tax_knowledge_nodes')
        .select('*')
        .eq('code', code)
        .eq('node_type', nodeType)
        .maybeSingle();

      if (dbError) throw dbError;
      return data as KGNode | null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar nó');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca relacionamentos de um nó
  const getRelationships = useCallback(async (
    code: string,
    nodeType: KGNodeType,
    direction: 'outgoing' | 'incoming' | 'both' = 'both',
    edgeTypes?: KGEdgeType[]
  ): Promise<KGRelationship[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .rpc('get_node_relationships', {
          p_node_code: code,
          p_node_type: nodeType,
          p_direction: direction,
          p_edge_types: edgeTypes || null
        });

      if (dbError) throw dbError;
      return (data || []) as KGRelationship[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar relacionamentos');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Análise de impacto em cascata
  const analyzeCascadeImpact = useCallback(async (
    code: string,
    nodeType: KGNodeType,
    maxDepth: number = 3
  ): Promise<CascadeImpact[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .rpc('analyze_cascade_impact', {
          p_start_node_code: code,
          p_start_node_type: nodeType,
          p_max_depth: maxDepth
        });

      if (dbError) throw dbError;
      return (data || []) as CascadeImpact[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao analisar impacto');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Encontra caminhos entre dois nós
  const findPath = useCallback(async (
    fromCode: string,
    fromType: KGNodeType,
    toCode: string,
    toType: KGNodeType,
    maxDepth: number = 4
  ): Promise<RelationshipPath[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .rpc('find_relationship_path', {
          p_from_code: fromCode,
          p_from_type: fromType,
          p_to_code: toCode,
          p_to_type: toType,
          p_max_depth: maxDepth
        });

      if (dbError) throw dbError;
      return (data || []) as RelationshipPath[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar caminho');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca impactos da reforma para o usuário
  const getReformImpacts = useCallback(async (): Promise<ReformImpact[]> => {
    if (!user) return [];
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('tax_reform_impacts')
        .select('*')
        .eq('user_id', user.id)
        .order('analysis_date', { ascending: false });

      if (dbError) throw dbError;
      return (data || []) as ReformImpact[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar impactos');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Gera contexto do grafo para a Clara AI
  const generateGraphContext = useCallback(async (
    ncms: string[] = [],
    cfops: string[] = [],
    regime?: string
  ): Promise<string> => {
    const contexts: string[] = [];

    // Analisa NCMs
    for (const ncm of ncms.slice(0, 5)) { // Limita a 5 para não sobrecarregar
      const impacts = await analyzeCascadeImpact(ncm, 'ncm', 2);
      if (impacts.length > 0) {
        const impactSummary = impacts
          .filter(i => i.depth <= 2)
          .map(i => `${i.node_label} (peso: ${(i.impact_weight * 100).toFixed(0)}%)`)
          .join(', ');
        contexts.push(`NCM ${ncm}: impacta ${impactSummary}`);
      }
    }

    // Busca transição de regime se informado
    if (regime) {
      const regimeRels = await getRelationships(regime, 'regime', 'outgoing');
      if (regimeRels.length > 0) {
        const transitions = regimeRels
          .filter(r => r.edge_type === 'depende_de' || r.edge_type === 'tem_beneficio')
          .map(r => r.related_node_label)
          .join(', ');
        if (transitions) {
          contexts.push(`Regime ${regime}: relacionado a ${transitions}`);
        }
      }
    }

    // Analisa impacto da reforma nos tributos
    const reformRelations = await getRelationships('ICMS', 'tributo', 'outgoing', ['substitui']);
    if (reformRelations.length > 0) {
      contexts.push(`Transição tributária: ICMS/ISS → IBS, PIS/COFINS → CBS (2026-2033)`);
    }

    return contexts.length > 0 
      ? `[Knowledge Graph]\n${contexts.join('\n')}`
      : '';
  }, [analyzeCascadeImpact, getRelationships]);

  return {
    loading,
    error,
    getNode,
    getRelationships,
    analyzeCascadeImpact,
    findPath,
    getReformImpacts,
    generateGraphContext,
  };
}

// Hook simplificado para análise rápida
export function useQuickGraphAnalysis(code: string, nodeType: KGNodeType) {
  const { getRelationships, analyzeCascadeImpact } = useKnowledgeGraph();
  const [data, setData] = useState<{
    relationships: KGRelationship[];
    impacts: CascadeImpact[];
  }>({ relationships: [], impacts: [] });
  const [loading, setLoading] = useState(false);

  const analyze = useCallback(async () => {
    if (!code) return;
    setLoading(true);

    const [relationships, impacts] = await Promise.all([
      getRelationships(code, nodeType),
      analyzeCascadeImpact(code, nodeType, 2)
    ]);

    setData({ relationships, impacts });
    setLoading(false);
  }, [code, nodeType, getRelationships, analyzeCascadeImpact]);

  return { ...data, loading, analyze };
}
