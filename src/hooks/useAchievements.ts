import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Json } from "@/integrations/supabase/types";
import {
  Target,
  Star,
  TrendingUp,
  FileText,
  Library,
  DollarSign,
  Gem,
  CheckSquare,
  Medal,
  Users,
  Flame,
  Sparkles,
  BarChart3,
  Search,
  type LucideIcon,
} from "lucide-react";

interface AchievementMetadata {
  name: string;
  description: string;
}

interface Achievement {
  id: string;
  achievement_code: string;
  achieved_at: string;
  metadata: AchievementMetadata;
}

// Achievement definitions for display
export const ACHIEVEMENT_DEFINITIONS: Record<string, { 
  icon: LucideIcon; 
  name: string; 
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}> = {
  first_score: {
    icon: Target,
    name: "Primeiro Score",
    description: "Calculou o Score Tributário pela primeira vez",
    tier: "bronze",
  },
  score_a_plus: {
    icon: Star,
    name: "Score A+",
    description: "Atingiu nota A+ no Score Tributário",
    tier: "gold",
  },
  score_improved: {
    icon: TrendingUp,
    name: "Score Melhorou!",
    description: "Seu Score subiu 10+ pontos",
    tier: "silver",
  },
  xml_100: {
    icon: FileText,
    name: "100 XMLs",
    description: "Importou 100 notas fiscais",
    tier: "bronze",
  },
  xml_1000: {
    icon: Library,
    name: "1.000 XMLs",
    description: "Importou 1.000 notas fiscais",
    tier: "silver",
  },
  credits_10k: {
    icon: DollarSign,
    name: "R$10k em Créditos",
    description: "Identificou R$10.000+ em créditos",
    tier: "silver",
  },
  credits_100k: {
    icon: Gem,
    name: "R$100k em Créditos",
    description: "Identificou R$100.000+ em créditos",
    tier: "platinum",
  },
  workflow_complete: {
    icon: CheckSquare,
    name: "Workflow Completo",
    description: "Completou seu primeiro Workflow",
    tier: "bronze",
  },
  workflow_all: {
    icon: Medal,
    name: "Mestre dos Workflows",
    description: "Completou todos os 4 Workflows",
    tier: "gold",
  },
  referral_3: {
    icon: Users,
    name: "Embaixador",
    description: "Indicou 3 amigos",
    tier: "silver",
  },
  streak_5: {
    icon: Flame,
    name: "5 Dias Seguidos",
    description: "Acessou por 5 dias consecutivos",
    tier: "bronze",
  },
  streak_30: {
    icon: Sparkles,
    name: "Dedicação Total",
    description: "Acessou por 30 dias consecutivos",
    tier: "gold",
  },
  first_dre: {
    icon: BarChart3,
    name: "Primeira DRE",
    description: "Completou sua primeira análise DRE",
    tier: "bronze",
  },
  opportunities_explorer: {
    icon: Search,
    name: "Explorador",
    description: "Descobriu 5+ oportunidades",
    tier: "silver",
  },
};

export function useAchievements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: achievements, isLoading } = useQuery({
    queryKey: ["user-achievements", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", user.id)
        .order("achieved_at", { ascending: false });

      if (error) throw error;
      
      // Parse metadata from Json to typed object
      return (data || []).map((item) => ({
        ...item,
        metadata: (item.metadata || { name: "", description: "" }) as unknown as AchievementMetadata,
      })) as Achievement[];
    },
    enabled: !!user?.id,
  });

  const checkAchievements = useMutation({
    mutationFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase.functions.invoke("check-achievements", {
        body: { user_id: user.id },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.new_achievements?.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    },
  });

  const earnedCodes = new Set(achievements?.map((a) => a.achievement_code) || []);

  const allAchievements = Object.entries(ACHIEVEMENT_DEFINITIONS).map(([code, def]) => ({
    code,
    ...def,
    earned: earnedCodes.has(code),
    earnedAt: achievements?.find((a) => a.achievement_code === code)?.achieved_at,
  }));

  const earnedCount = achievements?.length || 0;
  const totalCount = Object.keys(ACHIEVEMENT_DEFINITIONS).length;

  return {
    achievements: allAchievements,
    earnedAchievements: achievements || [],
    earnedCount,
    totalCount,
    progress: totalCount > 0 ? (earnedCount / totalCount) * 100 : 0,
    isLoading,
    checkAchievements: checkAchievements.mutate,
    isChecking: checkAchievements.isPending,
  };
}
