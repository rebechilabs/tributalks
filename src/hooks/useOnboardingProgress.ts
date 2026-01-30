import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Json } from "@/integrations/supabase/types";

interface ChecklistItems {
  score: boolean;
  simulation: boolean;
  timeline: boolean;
  profile: boolean;
}

interface OnboardingProgress {
  id: string;
  user_id: string;
  tour_completed: boolean;
  first_mission_completed: boolean;
  checklist_items: ChecklistItems;
  started_at: string;
  completed_at: string | null;
}

export function useOnboardingProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const defaultChecklist: ChecklistItems = {
    score: false,
    simulation: false,
    timeline: false,
    profile: false,
  };

  const { data: progress, isLoading } = useQuery({
    queryKey: ["onboarding-progress", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_onboarding_progress")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Parse checklist_items from Json to typed object
      return {
        ...data,
        checklist_items: (data.checklist_items || defaultChecklist) as unknown as ChecklistItems,
      } as OnboardingProgress;
    },
    enabled: !!user?.id,
  });

  const initializeOnboarding = useMutation({
    mutationFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_onboarding_progress")
        .upsert({
          user_id: user.id,
          tour_completed: false,
          first_mission_completed: false,
          checklist_items: {
            score: false,
            simulation: false,
            timeline: false,
            profile: false,
          },
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-progress"] });
    },
  });

  const updateProgress = useMutation({
    mutationFn: async (updates: Partial<Omit<OnboardingProgress, 'checklist_items'>> & { checklist_items?: Record<string, boolean> }) => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_onboarding_progress")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-progress"] });
    },
  });

  const completeTour = () => updateProgress.mutate({ tour_completed: true });
  
  const completeFirstMission = () => updateProgress.mutate({ first_mission_completed: true });

  const completeChecklistItem = (item: keyof OnboardingProgress["checklist_items"]) => {
    if (!progress) return;
    
    const newChecklist = {
      ...progress.checklist_items,
      [item]: true,
    };
    
    // Check if all items are complete
    const allComplete = Object.values(newChecklist).every(Boolean);
    
    updateProgress.mutate({
      checklist_items: newChecklist,
      completed_at: allComplete ? new Date().toISOString() : null,
    });
  };

  const shouldShowOnboarding = !progress?.tour_completed;
  
  const checklistProgress = progress?.checklist_items
    ? Object.values(progress.checklist_items).filter(Boolean).length
    : 0;
  
  const isChecklistComplete = checklistProgress === 4;

  // Show checklist for 7 days after account creation
  const showChecklist = progress && !isChecklistComplete && (() => {
    const startDate = new Date(progress.started_at);
    const daysSinceStart = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceStart <= 7;
  })();

  return {
    progress,
    isLoading,
    initializeOnboarding: initializeOnboarding.mutate,
    completeTour,
    completeFirstMission,
    completeChecklistItem,
    shouldShowOnboarding,
    showChecklist,
    checklistProgress,
    isChecklistComplete,
  };
}
