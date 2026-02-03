import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export type UserPriority = 'caixa' | 'margem' | 'compliance' | 'crescimento' | 'explorar';
export type TimeAvailable = '5min' | '15min' | '30min' | '1h+';
export type DecisionStyle = 'dados_profundos' | 'resumo_executivo' | 'so_o_essencial';

export interface SessionContext {
  todayPriority: UserPriority;
  timeAvailable: TimeAvailable;
  urgentConcern?: string;
  decisionStyle?: DecisionStyle;
}

export interface RoadmapStep {
  order: number;
  tool: string;
  toolRoute: string;
  action: string;
  why: string;
  estimatedTime: string;
  priority: 'urgent' | 'high' | 'medium';
  icon: string;
}

export interface Roadmap {
  id: string;
  sessionGoal: string;
  steps: RoadmapStep[];
  estimatedTotalTime: number;
  dataSignals: Record<string, unknown>;
  completedSteps: string[];
  skippedSteps: string[];
  progress: number;
}

export interface SessionPreferences {
  roadmapEnabled: boolean;
  showWelcomeModal: boolean;
  sophisticationLevel: number;
  lastSessionDate: string | null;
}

export const useAdaptiveRoadmap = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar roadmap de hoje
  const { data: todayRoadmap, isLoading: isLoadingRoadmap } = useQuery({
    queryKey: ['roadmap', user?.id, new Date().toISOString().split('T')[0]],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('clara_roadmaps')
        .select('*')
        .eq('user_id', user?.id)
        .eq('session_date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Safely parse steps array
      let steps: RoadmapStep[] = [];
      if (Array.isArray(data.steps)) {
        steps = data.steps as unknown as RoadmapStep[];
      }
      
      const completedSteps = (data.completed_steps as string[]) || [];
      const skippedSteps = (data.skipped_steps as string[]) || [];

      return {
        id: data.id,
        sessionGoal: data.session_goal || '',
        steps,
        estimatedTotalTime: data.estimated_total_time || 0,
        dataSignals: (data.data_signals as Record<string, unknown>) || {},
        completedSteps,
        skippedSteps,
        progress: steps.length > 0 
          ? Math.round((completedSteps.length / steps.length) * 100) 
          : 0,
      } as Roadmap;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Buscar preferências do usuário
  const { data: preferences, isLoading: isLoadingPrefs } = useQuery({
    queryKey: ['session-preferences', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_session_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      const today = new Date().toISOString().split('T')[0];
      const lastSession = data?.last_session_date;
      const isNewSession = !lastSession || lastSession !== today;

      return {
        roadmapEnabled: data?.roadmap_enabled ?? true,
        showWelcomeModal: isNewSession && (data?.show_welcome_modal ?? true),
        sophisticationLevel: data?.sophistication_level || 3,
        lastSessionDate: lastSession,
      } as SessionPreferences;
    },
    enabled: !!user?.id,
  });

  // Gerar novo roadmap
  const generateRoadmap = useMutation({
    mutationFn: async (context: SessionContext) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('generate-roadmap', {
        body: { sessionContext: context },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['session-preferences'] });
      
      if (data?.roadmap) {
        toast({
          title: "Roadmap criado!",
          description: `${data.roadmap.steps?.length || 0} ações priorizadas para você.`,
        });
      }
    },
    onError: (error) => {
      console.error('Error generating roadmap:', error);
      toast({
        title: "Erro ao criar roadmap",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  // Marcar step como completo
  const completeStep = useMutation({
    mutationFn: async (stepTool: string) => {
      if (!todayRoadmap?.id) return;

      const newCompleted = [...(todayRoadmap.completedSteps || []), stepTool];
      
      const { error } = await supabase
        .from('clara_roadmaps')
        .update({ 
          completed_steps: newCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', todayRoadmap.id);

      if (error) throw error;
      return newCompleted;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    },
  });

  // Pular step
  const skipStep = useMutation({
    mutationFn: async (stepTool: string) => {
      if (!todayRoadmap?.id) return;

      const newSkipped = [...(todayRoadmap.skippedSteps || []), stepTool];
      
      const { error } = await supabase
        .from('clara_roadmaps')
        .update({ 
          skipped_steps: newSkipped,
          updated_at: new Date().toISOString(),
        })
        .eq('id', todayRoadmap.id);

      if (error) throw error;
      return newSkipped;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    },
  });

  // Enviar feedback do roadmap
  const submitFeedback = useMutation({
    mutationFn: async ({ feedback, text }: { feedback: string; text?: string }) => {
      if (!todayRoadmap?.id) return;

      const { error } = await supabase
        .from('clara_roadmaps')
        .update({ 
          user_feedback: feedback,
          feedback_text: text,
          updated_at: new Date().toISOString(),
        })
        .eq('id', todayRoadmap.id);

      if (error) throw error;

      // Calcular efetividade
      await supabase.rpc('calculate_roadmap_effectiveness', { 
        p_roadmap_id: todayRoadmap.id 
      });

      // Atualizar nível de sofisticação
      await supabase.rpc('update_user_sophistication', { 
        p_user_id: user?.id 
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback registrado!",
        description: "Clara vai aprender com sua avaliação.",
      });
    },
  });

  // Desativar modal de boas-vindas
  const dismissWelcomeModal = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('user_session_preferences')
        .upsert({
          user_id: user?.id,
          show_welcome_modal: false,
          last_session_date: new Date().toISOString().split('T')[0],
        }, { onConflict: 'user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-preferences'] });
    },
  });

  // Toggle roadmap habilitado
  const toggleRoadmapEnabled = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase
        .from('user_session_preferences')
        .upsert({
          user_id: user?.id,
          roadmap_enabled: enabled,
        }, { onConflict: 'user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-preferences'] });
    },
  });

  return {
    // Data
    roadmap: todayRoadmap,
    preferences,
    isLoading: isLoadingRoadmap || isLoadingPrefs,
    hasRoadmapToday: !!todayRoadmap,
    shouldShowWelcome: preferences?.showWelcomeModal && preferences?.roadmapEnabled,
    
    // Actions
    generateRoadmap: generateRoadmap.mutate,
    isGenerating: generateRoadmap.isPending,
    
    completeStep: completeStep.mutate,
    skipStep: skipStep.mutate,
    submitFeedback: submitFeedback.mutate,
    
    dismissWelcomeModal: dismissWelcomeModal.mutate,
    toggleRoadmapEnabled: toggleRoadmapEnabled.mutate,
  };
};
