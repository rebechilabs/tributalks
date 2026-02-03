import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Json } from "@/integrations/supabase/types";

interface ToolPlanItem {
  id: string;
  name: string;
  path: string;
  estimatedTime: number;
  completed?: boolean;
}

interface AIJourneyRow {
  id: string;
  user_id: string;
  priority: string | null;
  tool_plan: Json;
  completed_tools: string[] | null;
  tool_results: Json;
  welcome_seen_at: string | null;
  last_activity: string | null;
  satisfaction_score: number | null;
  created_at: string;
  updated_at: string;
}

interface AIJourney {
  id: string;
  user_id: string;
  priority: string | null;
  tool_plan: ToolPlanItem[];
  completed_tools: string[];
  tool_results: Record<string, unknown>;
  welcome_seen_at: string | null;
  last_activity: string | null;
  satisfaction_score: number | null;
  created_at: string;
  updated_at: string;
}

// Converte row do DB para interface tipada
function parseJourneyRow(row: AIJourneyRow): AIJourney {
  return {
    ...row,
    tool_plan: Array.isArray(row.tool_plan) ? (row.tool_plan as unknown as ToolPlanItem[]) : [],
    completed_tools: row.completed_tools || [],
    tool_results: (row.tool_results as Record<string, unknown>) || {},
  };
}

// Gera plano de ferramentas baseado na prioridade
function generateToolPlan(priority: string): ToolPlanItem[] {
  const plans: Record<string, ToolPlanItem[]> = {
    caixa: [
      { id: "score", name: "Score Tributário", path: "/dashboard/score-tributario", estimatedTime: 3 },
      { id: "split", name: "Simulador Split Payment", path: "/dashboard/calculadora/split-payment", estimatedTime: 5 },
      { id: "radar", name: "Radar de Créditos", path: "/dashboard/analise-notas-fiscais", estimatedTime: 10 },
    ],
    margem: [
      { id: "dre", name: "DRE Inteligente", path: "/dashboard/dre", estimatedTime: 8 },
      { id: "margem", name: "Margem Ativa", path: "/dashboard/margem-ativa", estimatedTime: 10 },
      { id: "comparativo", name: "Comparativo de Regimes", path: "/dashboard/calculadora/comparativo-regimes", estimatedTime: 5 },
    ],
    compliance: [
      { id: "checklist", name: "Checklist Reforma", path: "/dashboard/checklist-reforma", estimatedTime: 5 },
      { id: "timeline", name: "Timeline Reforma", path: "/dashboard/timeline-reforma", estimatedTime: 3 },
      { id: "score", name: "Score Tributário", path: "/dashboard/score-tributario", estimatedTime: 3 },
    ],
    crescimento: [
      { id: "dre", name: "DRE Inteligente", path: "/dashboard/dre", estimatedTime: 8 },
      { id: "comparativo", name: "Comparativo de Regimes", path: "/dashboard/calculadora/comparativo-regimes", estimatedTime: 5 },
      { id: "checklist", name: "Checklist Reforma", path: "/dashboard/checklist-reforma", estimatedTime: 5 },
    ],
  };

  return plans[priority] || plans.caixa;
}

export function useAIJourney() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar jornada atual
  const { data: journey, isLoading } = useQuery({
    queryKey: ["ai-journey", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_ai_journey")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching AI journey:", error);
        throw error;
      }

      return data ? parseJourneyRow(data) : null;
    },
    enabled: !!user?.id,
  });

  // Iniciar nova jornada
  const startJourney = useMutation({
    mutationFn: async (priority: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      const plan = generateToolPlan(priority);

      const { data, error } = await supabase
        .from("user_ai_journey")
        .upsert(
          {
            user_id: user.id,
            priority,
            tool_plan: plan as unknown as Json,
            welcome_seen_at: new Date().toISOString(),
            last_activity: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (error) throw error;
      return parseJourneyRow(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-journey", user?.id] });
    },
  });

  // Marcar ferramenta como completa
  const completeTool = useMutation({
    mutationFn: async ({ toolId, result }: { toolId: string; result?: unknown }) => {
      if (!user?.id || !journey) throw new Error("No journey found");

      const completedTools = [...(journey.completed_tools || [])];
      if (!completedTools.includes(toolId)) {
        completedTools.push(toolId);
      }

      const toolResults = { ...(journey.tool_results || {}) };
      if (result) {
        toolResults[toolId] = result;
      }

      const { data, error } = await supabase
        .from("user_ai_journey")
        .update({
          completed_tools: completedTools,
          tool_results: toolResults as unknown as Json,
          last_activity: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return parseJourneyRow(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-journey", user?.id] });
    },
  });

  // Atualizar prioridade
  const updatePriority = useMutation({
    mutationFn: async (priority: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      const plan = generateToolPlan(priority);

      const { data, error } = await supabase
        .from("user_ai_journey")
        .update({
          priority,
          tool_plan: plan as unknown as Json,
          last_activity: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return parseJourneyRow(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-journey", user?.id] });
    },
  });

  // Salvar feedback
  const saveFeedback = useMutation({
    mutationFn: async (score: number) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_ai_journey")
        .update({
          satisfaction_score: score,
          last_activity: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return parseJourneyRow(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-journey", user?.id] });
    },
  });

  // Helpers
  const hasSeenWelcome = !!journey?.welcome_seen_at;
  const completedCount = journey?.completed_tools?.length || 0;
  const totalTools = journey?.tool_plan?.length || 0;
  const progressPercent = totalTools > 0 ? (completedCount / totalTools) * 100 : 0;

  return {
    journey,
    isLoading,
    startJourney,
    completeTool,
    updatePriority,
    saveFeedback,
    hasSeenWelcome,
    completedCount,
    totalTools,
    progressPercent,
  };
}
