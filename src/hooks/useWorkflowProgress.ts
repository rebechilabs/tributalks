import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface WorkflowProgress {
  id: string;
  workflow_id: string;
  current_step_index: number;
  completed_steps: string[];
  started_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface UseWorkflowProgressReturn {
  currentStepIndex: number;
  completedSteps: Set<string>;
  loading: boolean;
  saving: boolean;
  setCurrentStep: (index: number) => void;
  markStepComplete: (stepId: string) => void;
  markWorkflowComplete: () => void;
  resetProgress: () => void;
}

export function useWorkflowProgress(workflowId: string, totalSteps: number): UseWorkflowProgressReturn {
  const { user } = useAuth();
  const [progress, setProgress] = useState<WorkflowProgress | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load progress from database
  useEffect(() => {
    async function loadProgress() {
      if (!user?.id || !workflowId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('workflow_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('workflow_id', workflowId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProgress(data);
          setCurrentStepIndex(data.current_step_index);
          setCompletedSteps(new Set(data.completed_steps || []));
        }
      } catch (err) {
        console.error('Error loading workflow progress:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [user?.id, workflowId]);

  // Save progress to database
  const saveProgress = useCallback(async (
    stepIndex: number, 
    steps: Set<string>, 
    isComplete: boolean = false
  ) => {
    if (!user?.id || !workflowId) return;

    setSaving(true);
    try {
      const progressData = {
        user_id: user.id,
        workflow_id: workflowId,
        current_step_index: stepIndex,
        completed_steps: Array.from(steps),
        completed_at: isComplete ? new Date().toISOString() : null,
      };

      const { error } = await supabase
        .from('workflow_progress')
        .upsert(progressData, {
          onConflict: 'user_id,workflow_id',
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving workflow progress:', err);
    } finally {
      setSaving(false);
    }
  }, [user?.id, workflowId]);

  const setCurrentStep = useCallback((index: number) => {
    setCurrentStepIndex(index);
    saveProgress(index, completedSteps);
  }, [completedSteps, saveProgress]);

  const markStepComplete = useCallback((stepId: string) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepId);
    setCompletedSteps(newCompleted);
    
    const isWorkflowComplete = newCompleted.size === totalSteps;
    saveProgress(currentStepIndex, newCompleted, isWorkflowComplete);
  }, [completedSteps, currentStepIndex, totalSteps, saveProgress]);

  const markWorkflowComplete = useCallback(() => {
    saveProgress(currentStepIndex, completedSteps, true);
  }, [currentStepIndex, completedSteps, saveProgress]);

  const resetProgress = useCallback(async () => {
    if (!user?.id || !workflowId) return;

    try {
      await supabase
        .from('workflow_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('workflow_id', workflowId);

      setCurrentStepIndex(0);
      setCompletedSteps(new Set());
      setProgress(null);
    } catch (err) {
      console.error('Error resetting workflow progress:', err);
    }
  }, [user?.id, workflowId]);

  return {
    currentStepIndex,
    completedSteps,
    loading,
    saving,
    setCurrentStep,
    markStepComplete,
    markWorkflowComplete,
    resetProgress,
  };
}
