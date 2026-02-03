import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useClaraAgents, type AgentType, type ClaraAgent } from "./useClaraAgents";
import { useClaraAutonomousActions, type AutonomousAction } from "./useClaraAutonomousActions";
import { useSemanticSearch, type SemanticSearchResult } from "./useSemanticSearch";
import { useKnowledgeGraph, type CascadeImpact, type KGRelationship } from "./useKnowledgeGraph";

// ============================================
// TIPOS PARA INTEGRAÇÃO DE AGENTES NO CHAT
// ============================================

export interface KnowledgeGraphContext {
  ncmImpacts: CascadeImpact[];
  tributeTransitions: KGRelationship[];
  sectorBenefits: KGRelationship[];
  formattedContext: string;
}

export interface ClaraEnrichedContext {
  // Contexto do agente ativo
  activeAgent: AgentType | null;
  agentInfo: ClaraAgent | null;
  
  // Ações autônomas pendentes
  pendingActions: AutonomousAction[];
  
  // Contexto semântico (RAG)
  semanticKnowledge: SemanticSearchResult[];
  semanticUserContext: SemanticSearchResult[];
  
  // Knowledge Graph
  knowledgeGraph: KnowledgeGraphContext | null;
  
  // Flags
  hasUrgentAction: boolean;
  hasRelevantKnowledge: boolean;
  hasGraphContext: boolean;
}

export interface AgentSuggestion {
  agentType: AgentType;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  suggestedAction?: string;
}

// ============================================
// HOOK - Integração de Agentes ao Chat
// ============================================

export function useClaraAgentIntegration() {
  const { user } = useAuth();
  const { agents, routeToAgent, fetchAgents } = useClaraAgents();
  const { actions, approveAction, rejectAction, fetchActions } = useClaraAutonomousActions();
  const { searchForClaraContext, formatForPrompt } = useSemanticSearch();
  const { getRelationships, analyzeCascadeImpact, generateGraphContext } = useKnowledgeGraph();
  const [currentAgent, setCurrentAgent] = useState<AgentType | null>(null);

  /**
   * Analisa a mensagem do usuário e sugere qual agente deve atuar
   */
  const analyzeMessageForAgent = useCallback((message: string): AgentSuggestion | null => {
    const lowerMessage = message.toLowerCase();

    // Padrões para cada agente
    const fiscalPatterns = [
      /imposto|tribut|icms|pis|cofins|ibs|cbs|ncm|cfop|xml|nota fiscal|crédito fiscal/i,
      /reforma tributária|split payment|alíquota/i,
      /simples nacional|lucro real|lucro presumido/i,
    ];

    const marginPatterns = [
      /margem|lucro|prejuízo|receita|despesa|custo|dre|ebitda/i,
      /preço|fornecedor|negociação|desconto/i,
      /rentabilidade|lucratividade|break.?even|ponto de equilíbrio/i,
    ];

    const compliancePatterns = [
      /prazo|obrigação|declaração|dctf|efd|sped|compliance/i,
      /multa|penalidade|autuação|fiscalização/i,
      /certidão|regularidade|débito/i,
    ];

    // Verifica cada conjunto de padrões
    if (fiscalPatterns.some(p => p.test(lowerMessage))) {
      return {
        agentType: 'fiscal',
        reason: 'Pergunta relacionada a tributos, créditos ou reforma tributária',
        priority: 'high',
        suggestedAction: 'analyze_tax_opportunity',
      };
    }

    if (marginPatterns.some(p => p.test(lowerMessage))) {
      return {
        agentType: 'margin',
        reason: 'Pergunta sobre margens, custos ou análise financeira',
        priority: 'high',
        suggestedAction: 'analyze_margin_impact',
      };
    }

    if (compliancePatterns.some(p => p.test(lowerMessage))) {
      return {
        agentType: 'compliance',
        reason: 'Pergunta sobre prazos, obrigações ou conformidade',
        priority: 'medium',
        suggestedAction: 'check_deadlines',
      };
    }

    return null;
  }, []);

  /**
   * Enriquece o contexto do chat com informações de agentes, RAG e Knowledge Graph
   */
  const enrichChatContext = useCallback(async (
    message: string,
    userNcms: string[] = [],
    userRegime?: string
  ): Promise<ClaraEnrichedContext> => {
    // Analisa qual agente deve atuar
    const suggestion = analyzeMessageForAgent(message);
    let activeAgent: AgentType | null = null;
    let agentInfo: ClaraAgent | null = null;

    if (suggestion) {
      activeAgent = suggestion.agentType;
      setCurrentAgent(activeAgent);
      
      // Busca info do agente se não temos ainda
      if (agents.length === 0) {
        await fetchAgents();
      }
      agentInfo = agents.find(a => a.agent_type === activeAgent) || null;
    }

    // Busca ações pendentes se ainda não temos
    let pendingActions: AutonomousAction[] = actions.filter(a => a.status === 'pending');

    // Busca contexto semântico
    let semanticKnowledge: SemanticSearchResult[] = [];
    let semanticUserContext: SemanticSearchResult[] = [];

    try {
      const ragContext = await searchForClaraContext(message);
      semanticKnowledge = ragContext.knowledge;
      semanticUserContext = ragContext.userContext;
    } catch (err) {
      console.error("Error fetching semantic context:", err);
    }

    // === KNOWLEDGE GRAPH ===
    let knowledgeGraph: KnowledgeGraphContext | null = null;
    
    try {
      // Busca impactos de NCMs se o agente fiscal está ativo ou há NCMs
      const ncmImpacts: CascadeImpact[] = [];
      if ((activeAgent === 'fiscal' || userNcms.length > 0) && userNcms.length > 0) {
        for (const ncm of userNcms.slice(0, 3)) {
          const impacts = await analyzeCascadeImpact(ncm, 'ncm', 2);
          ncmImpacts.push(...impacts);
        }
      }

      // Busca transições tributárias (reforma)
      const tributeTransitions = await getRelationships('ICMS', 'tributo', 'outgoing', ['substitui']);
      
      // Busca benefícios setoriais se relevante
      let sectorBenefits: KGRelationship[] = [];
      if (message.match(/saúde|educação|transporte|agro|cesta básica/i)) {
        const sectors = ['SAUDE', 'EDUCACAO', 'TRANSPORTE', 'AGRO', 'CESTA_BASICA'];
        for (const sector of sectors) {
          if (message.toLowerCase().includes(sector.toLowerCase().replace('_', ' '))) {
            const benefits = await getRelationships(sector, 'setor', 'outgoing', ['tem_beneficio']);
            sectorBenefits.push(...benefits);
          }
        }
      }

      // Gera contexto formatado
      const formattedContext = await generateGraphContext(userNcms, [], userRegime);

      if (ncmImpacts.length > 0 || tributeTransitions.length > 0 || sectorBenefits.length > 0 || formattedContext) {
        knowledgeGraph = {
          ncmImpacts,
          tributeTransitions,
          sectorBenefits,
          formattedContext,
        };
      }
    } catch (err) {
      console.error("Error fetching knowledge graph context:", err);
    }

    // Filtra ações pendentes de alta prioridade
    const urgentActions = pendingActions.filter(a => a.priority === 'high' || a.priority === 'urgent');

    return {
      activeAgent,
      agentInfo,
      pendingActions,
      semanticKnowledge,
      semanticUserContext,
      knowledgeGraph,
      hasUrgentAction: urgentActions.length > 0,
      hasRelevantKnowledge: semanticKnowledge.length > 0 || semanticUserContext.length > 0,
      hasGraphContext: knowledgeGraph !== null,
    };
  }, [analyzeMessageForAgent, agents, fetchAgents, actions, searchForClaraContext, analyzeCascadeImpact, getRelationships, generateGraphContext]);

  /**
   * Formata o contexto enriquecido para injeção no prompt
   */
  const formatEnrichedContextForPrompt = useCallback((
    context: ClaraEnrichedContext
  ): string => {
    const lines: string[] = [];

    // Agente ativo
    if (context.activeAgent) {
      lines.push(`\n[AGENTE ATIVO: ${context.activeAgent.toUpperCase()}]`);
      lines.push(`Você está atuando como especialista em ${
        context.activeAgent === 'fiscal' ? 'tributação e créditos fiscais' :
        context.activeAgent === 'margin' ? 'margens e análise financeira' :
        'compliance e conformidade fiscal'
      }.`);
    }

    // Info do agente
    if (context.agentInfo) {
      lines.push(`Agente: ${context.agentInfo.name}`);
      if (context.agentInfo.capabilities.length > 0) {
        lines.push(`Capacidades: ${context.agentInfo.capabilities.slice(0, 3).join(', ')}`);
      }
    }

    // Ações pendentes urgentes
    if (context.hasUrgentAction) {
      lines.push(`\n⚠️ AÇÕES PENDENTES URGENTES:`);
      for (const action of context.pendingActions.filter(a => a.priority === 'high' || a.priority === 'urgent').slice(0, 2)) {
        lines.push(`- [${action.action_type}] Requer aprovação do usuário`);
      }
      lines.push(`Mencione estas ações se relevante para a conversa.`);
    }

    // Contexto semântico já é adicionado pela clara-assistant
    // Aqui só adicionamos metadados extras
    if (context.hasRelevantKnowledge) {
      const knowledgeCount = context.semanticKnowledge.length;
      const userContextCount = context.semanticUserContext.length;
      lines.push(`\n[RAG: ${knowledgeCount} conhecimentos + ${userContextCount} memórias encontrados]`);
    }

    // Knowledge Graph context
    if (context.hasGraphContext && context.knowledgeGraph) {
      lines.push(`\n[KNOWLEDGE GRAPH TRIBUTÁRIO]`);
      
      // Impactos de NCM
      if (context.knowledgeGraph.ncmImpacts.length > 0) {
        const topImpacts = context.knowledgeGraph.ncmImpacts
          .slice(0, 5)
          .map(i => `• ${i.node_label} (${(i.impact_weight * 100).toFixed(0)}% impacto)`);
        lines.push(`Impactos em cascata:`);
        lines.push(...topImpacts);
      }
      
      // Transições tributárias
      if (context.knowledgeGraph.tributeTransitions.length > 0) {
        lines.push(`Transições ativas: ${context.knowledgeGraph.tributeTransitions.map(t => 
          `${t.related_node_code}`
        ).join(', ')}`);
      }
      
      // Benefícios setoriais
      if (context.knowledgeGraph.sectorBenefits.length > 0) {
        const benefits = context.knowledgeGraph.sectorBenefits.map(b => {
          const reduction = (b.properties as Record<string, unknown>)?.percentual || '60';
          return `${b.related_node_label} (${reduction}% redução)`;
        });
        lines.push(`Benefícios aplicáveis: ${benefits.join(', ')}`);
      }
      
      // Contexto formatado adicional
      if (context.knowledgeGraph.formattedContext) {
        lines.push(context.knowledgeGraph.formattedContext);
      }
    }

    return lines.join('\n');
  }, []);

  /**
   * Registra a interação para aprendizado
   */
  const recordInteraction = useCallback(async (
    message: string,
    response: string,
    context: ClaraEnrichedContext
  ) => {
    if (!user?.id) return;

    try {
      // Registra qual agente foi usado
      if (context.activeAgent) {
        await supabase.rpc('record_user_decision', {
          p_user_id: user.id,
          p_decision_type: 'agent_interaction',
          p_context: {
            message_preview: message.substring(0, 100),
            response_preview: response.substring(0, 100),
            had_semantic_context: context.hasRelevantKnowledge,
          },
          p_agent_type: context.activeAgent,
        });
      }
    } catch (err) {
      console.error("Error recording interaction:", err);
    }
  }, [user?.id]);

  return {
    // Análise de mensagem
    analyzeMessageForAgent,
    
    // Enriquecimento de contexto
    enrichChatContext,
    formatEnrichedContextForPrompt,
    
    // Estado atual
    currentAgent,
    pendingActions: actions.filter(a => a.status === 'pending'),
    
    // Ações
    approveAction,
    rejectAction,
    recordInteraction,
  };
}
