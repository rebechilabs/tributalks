import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do hook useClaraAgentIntegration
describe("Clara Agent Integration", () => {
  describe("Agent Intent Detection", () => {
    const fiscalPatterns = [/imposto|tribut|icms|pis|cofins|ncm|nota fiscal|crédito|débito|alíquota|isenção|benefício fiscal/i];
    const marginPatterns = [/margem|lucro|prejuízo|dre|receita|custo|despesa|ebitda|resultado|rentabilidade|preço|markup/i];
    const compliancePatterns = [/prazo|obrigaç|dctf|sped|entrega|vencimento|multa|penalidade|declaração|calendário/i];

    const detectAgent = (message: string) => {
      const lowerMessage = message.toLowerCase();
      
      if (fiscalPatterns.some(p => p.test(lowerMessage))) {
        return { agentType: 'fiscal', priority: 'high' };
      }
      if (marginPatterns.some(p => p.test(lowerMessage))) {
        return { agentType: 'margin', priority: 'medium' };
      }
      if (compliancePatterns.some(p => p.test(lowerMessage))) {
        return { agentType: 'compliance', priority: 'medium' };
      }
      return { agentType: 'general', priority: 'low' };
    };

    it("should detect fiscal agent for tax-related queries", () => {
      expect(detectAgent("Como calcular o ICMS?")).toEqual({ agentType: 'fiscal', priority: 'high' });
      expect(detectAgent("Quero entender PIS e COFINS")).toEqual({ agentType: 'fiscal', priority: 'high' });
      expect(detectAgent("NCM do meu produto")).toEqual({ agentType: 'fiscal', priority: 'high' });
      expect(detectAgent("Nota fiscal de entrada")).toEqual({ agentType: 'fiscal', priority: 'high' });
      expect(detectAgent("Crédito tributário")).toEqual({ agentType: 'fiscal', priority: 'high' });
    });

    it("should detect margin agent for financial queries", () => {
      expect(detectAgent("Qual minha margem líquida?")).toEqual({ agentType: 'margin', priority: 'medium' });
      expect(detectAgent("Preciso analisar a DRE")).toEqual({ agentType: 'margin', priority: 'medium' });
      expect(detectAgent("Lucro do trimestre")).toEqual({ agentType: 'margin', priority: 'medium' });
      expect(detectAgent("Custo operacional")).toEqual({ agentType: 'margin', priority: 'medium' });
      expect(detectAgent("Como calcular markup")).toEqual({ agentType: 'margin', priority: 'medium' });
    });

    it("should detect compliance agent for deadline queries", () => {
      expect(detectAgent("Qual o prazo da DCTF?")).toEqual({ agentType: 'compliance', priority: 'medium' });
      expect(detectAgent("Entrega do SPED")).toEqual({ agentType: 'compliance', priority: 'medium' });
      expect(detectAgent("Obrigações acessórias")).toEqual({ agentType: 'compliance', priority: 'medium' });
      expect(detectAgent("Calendário fiscal")).toEqual({ agentType: 'compliance', priority: 'medium' });
    });

    it("should default to general agent for unrelated queries", () => {
      expect(detectAgent("Olá, bom dia")).toEqual({ agentType: 'general', priority: 'low' });
      expect(detectAgent("Como funciona a plataforma?")).toEqual({ agentType: 'general', priority: 'low' });
      expect(detectAgent("Quem é você?")).toEqual({ agentType: 'general', priority: 'low' });
    });
  });

  describe("Context Formatting", () => {
    const formatContext = (agent: string, actions: { action_type: string; priority: string }[]) => {
      let context = "";
      
      if (agent !== 'general') {
        context += `[AGENTE ATIVO: ${agent.toUpperCase()}]\n`;
      }
      
      const urgent = actions.filter(a => a.priority === 'urgent' || a.priority === 'high');
      if (urgent.length > 0) {
        context += `[AÇÕES PENDENTES: ${urgent.length} de alta prioridade]\n`;
      }
      
      return context;
    };

    it("should format active agent correctly", () => {
      expect(formatContext('fiscal', [])).toContain("[AGENTE ATIVO: FISCAL]");
      expect(formatContext('margin', [])).toContain("[AGENTE ATIVO: MARGIN]");
      expect(formatContext('general', [])).toBe("");
    });

    it("should include pending actions count", () => {
      const actions = [
        { action_type: 'analyze_credits', priority: 'high' },
        { action_type: 'send_reminder', priority: 'low' },
      ];
      expect(formatContext('fiscal', actions)).toContain("[AÇÕES PENDENTES: 1 de alta prioridade]");
    });
  });
});

describe("Autonomous Actions", () => {
  describe("Action Triggers", () => {
    const AUTO_TRIGGERS: Record<string, { agentType: string; priority: string }> = {
      'xml_imported': { agentType: 'fiscal', priority: 'medium' },
      'score_below_60': { agentType: 'fiscal', priority: 'high' },
      'dctf_gap_detected': { agentType: 'fiscal', priority: 'urgent' },
      'margin_drop_5pp': { agentType: 'margin', priority: 'high' },
      'deadline_7_days': { agentType: 'compliance', priority: 'medium' },
    };

    it("should have correct trigger configurations", () => {
      expect(AUTO_TRIGGERS['xml_imported'].agentType).toBe('fiscal');
      expect(AUTO_TRIGGERS['score_below_60'].priority).toBe('high');
      expect(AUTO_TRIGGERS['dctf_gap_detected'].priority).toBe('urgent');
    });

    it("should map events to correct agents", () => {
      expect(AUTO_TRIGGERS['xml_imported'].agentType).toBe('fiscal');
      expect(AUTO_TRIGGERS['margin_drop_5pp'].agentType).toBe('margin');
      expect(AUTO_TRIGGERS['deadline_7_days'].agentType).toBe('compliance');
    });
  });
});
