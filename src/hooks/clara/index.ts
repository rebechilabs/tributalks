// ============================================
// CLARA AI-NATIVE - Sistema Completo
// ============================================

// Agentes Especializados
export {
  useClaraAgents,
  useFiscalAgent,
  useMarginAgent,
  useComplianceAgent,
  type AgentType,
  type ClaraAgent,
  type AgentAction,
  type AgentContext,
} from './useClaraAgents';

// Memória Evolutiva e Aprendizado
export {
  useClaraLearning,
  useClaraContextMemory,
  type LearnedPattern,
  type UserDecision,
  type UserPreferences,
} from './useClaraLearning';

// Ações Autônomas
export {
  useClaraAutonomousActions,
  AUTO_TRIGGERS,
  type AutonomousAction,
  type ActionTrigger,
} from './useClaraAutonomousActions';

// Busca Semântica (RAG)
export {
  useSemanticSearch,
  useEmbeddings,
  type SemanticSearchResult,
  type SemanticSearchResponse,
  type SemanticSearchOptions,
} from './useSemanticSearch';

// Integração de Agentes ao Chat
export {
  useClaraAgentIntegration,
  type ClaraEnrichedContext,
  type AgentSuggestion,
  type KnowledgeGraphContext,
} from './useClaraAgentIntegration';

// Knowledge Graph Tributário
export {
  useKnowledgeGraph,
  useQuickGraphAnalysis,
  type KGNodeType,
  type KGEdgeType,
  type KGNode,
  type KGRelationship,
  type CascadeImpact,
  type RelationshipPath,
  type ReformImpact,
} from './useKnowledgeGraph';

// Triggers Automáticos
export {
  useClaraTrigger,
} from './useClaraTrigger';
