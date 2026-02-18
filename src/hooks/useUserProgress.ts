import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/contexts/CompanyContext";

export interface UserProgressData {
  // Completion flags
  hasScore: boolean;
  hasXmls: boolean;
  hasDre: boolean;
  hasOpportunities: boolean;
  hasWorkflow: boolean;
  
  // Company data
  companyName: string | null;
  cnpj: string | null;
  
  // Data summaries
  scoreGrade: string | null;
  scoreTotal: number | null;
  scoreDate: string | null;
  xmlCount: number;
  creditsTotal: number;
  dreDate: string | null;
  opportunitiesCount: number;
  workflowsCompleted: number;
  workflowsInProgress: number;
  
  // Last activity
  lastActivity: {
    type: 'score' | 'xml' | 'dre' | 'opportunity' | 'workflow' | 'simulation' | null;
    date: string | null;
    description: string | null;
    link: string | null;
  };
  
  // Progress percentage
  progressPercent: number;
  
  // Loading state
  loading: boolean;
}

export function useUserProgress(): UserProgressData {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [data, setData] = useState<UserProgressData>({
    hasScore: false,
    hasXmls: false,
    hasDre: false,
    hasOpportunities: false,
    hasWorkflow: false,
    companyName: null,
    cnpj: null,
    scoreGrade: null,
    scoreTotal: null,
    scoreDate: null,
    xmlCount: 0,
    creditsTotal: 0,
    dreDate: null,
    opportunitiesCount: 0,
    workflowsCompleted: 0,
    workflowsInProgress: 0,
    lastActivity: { type: null, date: null, description: null, link: null },
    progressPercent: 0,
    loading: true,
  });

  useEffect(() => {
    if (!user?.id) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchProgress = async () => {
      try {
        // Build company filter for queries that support it
        const companyId = currentCompany?.id;

        // Fetch all data in parallel
        const [
          companyResult,
          scoreResult,
          xmlResult,
          dreResult,
          opportunitiesResult,
          workflowResult,
          creditsResult,
          simulationResult,
        ] = await Promise.all([
          // Company profile
          companyId 
            ? supabase
                .from('company_profile')
                .select('razao_social, nome_fantasia, cnpj_principal')
                .eq('id', companyId)
                .maybeSingle()
            : supabase
                .from('company_profile')
                .select('razao_social, nome_fantasia, cnpj_principal')
                .eq('user_id', user.id)
                .maybeSingle(),
          
          // Latest tax score - filter by company if available
          companyId
            ? supabase
                .from('tax_score_history')
                .select('score_grade, score_total, calculated_at')
                .eq('user_id', user.id)
                .eq('company_id', companyId)
                .order('calculated_at', { ascending: false })
                .limit(1)
                .maybeSingle()
            : supabase
                .from('tax_score_history')
                .select('score_grade, score_total, calculated_at')
                .eq('user_id', user.id)
                .order('calculated_at', { ascending: false })
                .limit(1)
                .maybeSingle(),
          
          // XML imports count
          supabase
            .from('xml_imports')
            .select('id, created_at', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('status', 'processed')
            .order('created_at', { ascending: false })
            .limit(1),
          
          // Latest DRE
          supabase
            .from('company_dre')
            .select('created_at, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          
          // Matched opportunities
          supabase
            .from('company_opportunities')
            .select('id, created_at', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1),
          
          // Workflows
          supabase
            .from('workflow_progress')
            .select('workflow_id, completed_at, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false }),
          
          // Identified credits sum
          supabase
            .from('identified_credits')
            .select('potential_recovery')
            .eq('user_id', user.id)
            .eq('status', 'identified'),
          
          // Last simulation - filter by company if available
          companyId
            ? supabase
                .from('simulations')
                .select('calculator_slug, created_at')
                .eq('user_id', user.id)
                .or(`company_id.eq.${companyId},company_id.is.null`)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()
            : supabase
                .from('simulations')
                .select('calculator_slug, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle(),
        ]);

        // Process score
        const hasScore = !!scoreResult.data?.score_grade;
        const scoreGrade = scoreResult.data?.score_grade || null;
        const scoreTotal = scoreResult.data?.score_total || null;
        const scoreDate = scoreResult.data?.calculated_at || null;

        // Process XMLs
        const xmlCount = xmlResult.count || 0;
        const hasXmls = xmlCount > 0;
        const lastXmlDate = xmlResult.data?.[0]?.created_at || null;

        // Process DRE
        const hasDre = !!dreResult.data;
        const dreDate = dreResult.data?.updated_at || dreResult.data?.created_at || null;

        // Process opportunities
        const opportunitiesCount = opportunitiesResult.count || 0;
        const hasOpportunities = opportunitiesCount > 0;
        const lastOpportunityDate = opportunitiesResult.data?.[0]?.created_at || null;

        // Process workflows
        const workflows = workflowResult.data || [];
        const workflowsCompleted = workflows.filter(w => w.completed_at).length;
        const workflowsInProgress = workflows.filter(w => !w.completed_at).length;
        const hasWorkflow = workflowsCompleted > 0;
        const lastWorkflowDate = workflows[0]?.updated_at || null;

        // Process credits
        const creditsTotal = creditsResult.data?.reduce(
          (sum, c) => sum + (Number(c.potential_recovery) || 0), 
          0
        ) || 0;

        // Calculate progress (20% each)
        const completedSteps = [hasScore, hasXmls, hasDre, hasOpportunities, hasWorkflow].filter(Boolean).length;
        const progressPercent = (completedSteps / 5) * 100;

        // Determine last activity
        const activities = [
          { type: 'score' as const, date: scoreDate, description: `Score ${scoreGrade}`, link: '/dashboard/score-tributario' },
          { type: 'xml' as const, date: lastXmlDate, description: `${xmlCount} XMLs importados`, link: '/dashboard/analise-notas' },
          { type: 'dre' as const, date: dreDate, description: 'DRE atualizado', link: '/dashboard/dre' },
          { type: 'opportunity' as const, date: lastOpportunityDate, description: `${opportunitiesCount} oportunidades`, link: '/dashboard/planejar/oportunidades' },
          { type: 'workflow' as const, date: lastWorkflowDate, description: 'Workflow atualizado', link: '/dashboard/workflows' },
          { type: 'simulation' as const, date: simulationResult.data?.created_at, description: `Simulação ${simulationResult.data?.calculator_slug}`, link: '/historico' },
        ].filter(a => a.date);

        const lastActivity = activities.sort((a, b) => 
          new Date(b.date!).getTime() - new Date(a.date!).getTime()
        )[0] || { type: null, date: null, description: null, link: null };

        // Process company
        const companyName = companyResult.data?.nome_fantasia || companyResult.data?.razao_social || null;
        const cnpj = companyResult.data?.cnpj_principal || null;

        setData({
          hasScore,
          hasXmls,
          hasDre,
          hasOpportunities,
          hasWorkflow,
          companyName,
          cnpj,
          scoreGrade,
          scoreTotal,
          scoreDate,
          xmlCount,
          creditsTotal,
          dreDate,
          opportunitiesCount,
          workflowsCompleted,
          workflowsInProgress,
          lastActivity,
          progressPercent,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching user progress:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchProgress();
  }, [user?.id, currentCompany?.id]);

  return data;
}
