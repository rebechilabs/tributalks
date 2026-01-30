import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Workflow, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceBrasilia } from "@/lib/dateUtils";

// Workflow definitions matching WorkflowsGuiados.tsx
const WORKFLOW_DEFINITIONS: Record<string, { title: string; totalSteps: number }> = {
  'preparacao-erp': { title: 'Preparação do ERP para Split Payment', totalSteps: 8 },
  'analise-contratos': { title: 'Revisão de Contratos e Preços', totalSteps: 6 },
  'mapeamento-incentivos': { title: 'Mapeamento de Incentivos Fiscais', totalSteps: 7 },
  'planejamento-caixa': { title: 'Planejamento de Caixa na Transição', totalSteps: 5 },
};

interface WorkflowProgress {
  id: string;
  workflow_id: string;
  current_step_index: number;
  completed_steps: string[]; // Array comes as strings from Supabase
  updated_at: string;
}

export function InProgressWorkflows() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<WorkflowProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchWorkflows = async () => {
      try {
        const { data, error } = await supabase
          .from('workflow_progress')
          .select('id, workflow_id, current_step_index, completed_steps, updated_at')
          .eq('user_id', user.id)
          .is('completed_at', null)
          .order('updated_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        
        setWorkflows(data || []);
      } catch (error) {
        console.error('Error fetching workflows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, [user?.id]);

  if (loading) {
    return (
      <Card className="mb-6 border-amber-500/30">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  // No in-progress workflows
  if (workflows.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <Workflow className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Continuar de onde parou</h3>
        </div>

        <div className="space-y-3">
          {workflows.map((wf) => {
            const definition = WORKFLOW_DEFINITIONS[wf.workflow_id] || {
              title: 'Workflow', 
              totalSteps: 5 
            };
            const completedCount = wf.completed_steps?.length || 0;
            const progressPercent = (completedCount / definition.totalSteps) * 100;
            const currentStep = wf.current_step_index + 1;

            // Parse completed_steps as numbers for comparison
            const completedStepsNums = (wf.completed_steps || []).map(s => parseInt(String(s), 10));
            
            return (
              <div 
                key={wf.id} 
                className="p-3 rounded-lg bg-background border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {definition.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceBrasilia(wf.updated_at)}</span>
                      <span>•</span>
                      <span>Passo {currentStep} de {definition.totalSteps}</span>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline" className="flex-shrink-0">
                    <Link to={`/dashboard/workflows?workflow=${wf.workflow_id}`}>
                      Continuar
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Progress value={progressPercent} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(progressPercent)}%
                  </span>
                </div>

                {/* Completed steps indicator */}
                <div className="flex gap-1 mt-2">
                  {Array.from({ length: definition.totalSteps }).map((_, i) => (
                    <div 
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        completedStepsNums.includes(i) 
                          ? 'bg-primary' 
                          : i === wf.current_step_index
                            ? 'bg-primary/50 ring-2 ring-primary/30'
                            : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {workflows.length > 0 && (
          <Link 
            to="/dashboard/workflows" 
            className="text-xs text-primary hover:underline mt-3 inline-flex items-center gap-1"
          >
            Ver todos os workflows
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
