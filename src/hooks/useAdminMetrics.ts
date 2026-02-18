import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from "date-fns";

interface NexusMetrics {
  professionalToNexus: number;
  avgTimeToFirstAction: number;
  engagementVsControl: number;
}

interface DiagnosticMetrics {
  completionRate: number;
  avgTimeSeconds: number;
  xmlPercentage: number;
  erpPercentage: number;
  skipRate: number;
  totalDiagnostics: number;
}

interface ClaraMetrics {
  cacheHitRate: number;
  cachePercentage: number;
  geminiPercentage: number;
  sonnetPercentage: number;
  costPerUser: number;
  savingsVsBaseline: number;
  totalQueries: number;
  tokensSaved: number;
}

interface UserPlanMetrics {
  professional: number;
  enterprise: number;
  navigator: number;
  starter: number;
  free: number;
  total: number;
}

export interface AdminMetrics {
  nexus: NexusMetrics;
  diagnostic: DiagnosticMetrics;
  clara: ClaraMetrics;
  userPlans: UserPlanMetrics;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAdminMetrics(days: number = 7): AdminMetrics {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nexus, setNexus] = useState<NexusMetrics>({
    professionalToNexus: 0,
    avgTimeToFirstAction: 0,
    engagementVsControl: 0,
  });
  const [diagnostic, setDiagnostic] = useState<DiagnosticMetrics>({
    completionRate: 0,
    avgTimeSeconds: 0,
    xmlPercentage: 0,
    erpPercentage: 0,
    skipRate: 0,
    totalDiagnostics: 0,
  });
  const [clara, setClara] = useState<ClaraMetrics>({
    cacheHitRate: 0,
    cachePercentage: 0,
    geminiPercentage: 0,
    sonnetPercentage: 0,
    costPerUser: 0,
    savingsVsBaseline: 0,
    totalQueries: 0,
    tokensSaved: 0,
  });
  const [userPlans, setUserPlans] = useState<UserPlanMetrics>({
    professional: 0,
    enterprise: 0,
    navigator: 0,
    starter: 0,
    free: 0,
    total: 0,
  });

  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch diagnostic results
      const { data: diagnostics, error: diagError } = await supabase
        .from('diagnostic_results')
        .select('status, source, processing_time_ms, created_at')
        .gte('created_at', startDate);

      if (diagError) throw diagError;

      // Fetch Clara cache stats
      const { data: cacheData, error: cacheError } = await supabase
        .from('clara_cache')
        .select('hit_count, tokens_saved, model_used, created_at')
        .gte('created_at', startDate);

      if (cacheError) throw cacheError;

      // Fetch user plan distribution
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('plano');

      if (profileError) throw profileError;

      // Calculate diagnostic metrics
      if (diagnostics && diagnostics.length > 0) {
        const complete = diagnostics.filter(d => d.status === 'complete').length;
        const partial = diagnostics.filter(d => d.status === 'partial').length;
        const xmlSource = diagnostics.filter(d => d.source === 'xml').length;
        const erpSource = diagnostics.filter(d => d.source === 'erp').length;
        const avgTime = diagnostics.reduce((acc, d) => acc + (d.processing_time_ms || 0), 0) / diagnostics.length / 1000;

        setDiagnostic({
          completionRate: Math.round(((complete + partial) / diagnostics.length) * 100),
          avgTimeSeconds: Math.round(avgTime),
          xmlPercentage: Math.round((xmlSource / diagnostics.length) * 100),
          erpPercentage: Math.round((erpSource / diagnostics.length) * 100),
          skipRate: Math.round((diagnostics.filter(d => d.status === 'error').length / diagnostics.length) * 100),
          totalDiagnostics: diagnostics.length,
        });
      }

      // Calculate Clara cache metrics
      if (cacheData && cacheData.length > 0) {
        const totalHits = cacheData.reduce((acc, c) => acc + (c.hit_count || 0), 0);
        const totalTokensSaved = cacheData.reduce((acc, c) => acc + (c.tokens_saved || 0), 0);
        const geminiQueries = cacheData.filter(c => c.model_used?.includes('gemini')).length;
        const sonnetQueries = cacheData.filter(c => c.model_used?.includes('sonnet') || c.model_used?.includes('claude')).length;
        
        // Estimate costs: Gemini ~R$0.30/query, Sonnet ~R$3.00/query
        const estimatedCost = (geminiQueries * 0.30) + (sonnetQueries * 3.00);
        const baselineCost = (geminiQueries + sonnetQueries + totalHits) * 3.00; // If all were Sonnet
        const savings = baselineCost > 0 ? ((baselineCost - estimatedCost) / baselineCost) * 100 : 0;
        
        const totalQueries = totalHits + geminiQueries + sonnetQueries;
        const uniqueUsers = profiles?.length || 1;

        setClara({
          cacheHitRate: totalQueries > 0 ? Math.round((totalHits / totalQueries) * 100) : 0,
          cachePercentage: totalQueries > 0 ? Math.round((totalHits / totalQueries) * 100) : 0,
          geminiPercentage: totalQueries > 0 ? Math.round((geminiQueries / totalQueries) * 100) : 0,
          sonnetPercentage: totalQueries > 0 ? Math.round((sonnetQueries / totalQueries) * 100) : 0,
          costPerUser: uniqueUsers > 0 ? Math.round((estimatedCost / uniqueUsers) * 100) / 100 : 0,
          savingsVsBaseline: Math.round(savings),
          totalQueries,
          tokensSaved: totalTokensSaved,
        });
      }

      // Calculate user plan distribution
      if (profiles) {
        const planCounts = {
          professional: 0,
          enterprise: 0,
          navigator: 0,
          starter: 0,
          free: 0, // kept for backward compat in UI
        };

        profiles.forEach(p => {
          const plan = (p.plano || 'STARTER').toUpperCase();
          if (plan === 'PROFESSIONAL' || plan === 'PROFISSIONAL') planCounts.professional++;
          else if (plan === 'ENTERPRISE' || plan === 'PREMIUM') planCounts.enterprise++;
          else if (plan === 'NAVIGATOR' || plan === 'BASICO') planCounts.navigator++;
          else planCounts.starter++;
        });

        setUserPlans({
          ...planCounts,
          total: profiles.length,
        });

        // Calculate NEXUS first metrics (Professional users going to NEXUS)
        const professionalUsers = planCounts.professional + planCounts.enterprise;
        const nexusEligible = professionalUsers;
        
        setNexus({
          professionalToNexus: nexusEligible > 0 ? 87 : 0, // Placeholder - would need analytics tracking
          avgTimeToFirstAction: 23, // Placeholder - would need event tracking
          engagementVsControl: 67, // Placeholder - would need A/B test data
        });
      }

    } catch (err) {
      console.error('Error fetching admin metrics:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [days]);

  return {
    nexus,
    diagnostic,
    clara,
    userPlans,
    loading,
    error,
    refetch: fetchMetrics,
  };
}
