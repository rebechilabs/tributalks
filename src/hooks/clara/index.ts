// ============================================
// CLARA AI-FIRST - Sistema de Agentes Especializados
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
