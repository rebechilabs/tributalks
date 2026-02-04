import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type HomeState = 'LOADING' | 'NO_DRE' | 'NO_SCORE' | 'NO_CREDITS' | 'COMPLETE';

export interface HomeStateData {
  state: HomeState;
  dreData: {
    receitaBruta: number;
    margemLiquida: number;
    lucroLiquido: number;
  } | null;
  scoreData: {
    score: number;
    nivel: string;
  } | null;
  creditsData: {
    totalCreditos: number;
    novosCreditos: number;
  } | null;
  hasERP: boolean;
}

export function useHomeState(): HomeStateData & { isLoading: boolean; refetch: () => void } {
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['home-state', user?.id],
    queryFn: async (): Promise<HomeStateData> => {
      if (!user?.id) {
        return { state: 'NO_DRE', dreData: null, scoreData: null, creditsData: null, hasERP: false };
      }

      // Fetch DRE data
      const { data: dreData } = await supabase
        .from('company_dre')
        .select('calc_receita_bruta, calc_margem_liquida, calc_lucro_liquido')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Check if DRE has meaningful data
      const hasDRE = dreData && (dreData.calc_receita_bruta || 0) > 0;

      if (!hasDRE) {
        // Check for ERP connection
        const { data: erpData } = await supabase
          .from('erp_connections')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle();

        return {
          state: 'NO_DRE',
          dreData: null,
          scoreData: null,
          creditsData: null,
          hasERP: !!erpData,
        };
      }

      // Fetch Score data
      const { data: scoreData } = await supabase
        .from('tax_score_history')
        .select('score_total, score_grade')
        .eq('user_id', user.id)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const hasScore = scoreData && (scoreData.score_total || 0) > 0;

      if (!hasScore) {
        return {
          state: 'NO_SCORE',
          dreData: {
            receitaBruta: dreData.calc_receita_bruta || 0,
            margemLiquida: dreData.calc_margem_liquida || 0,
            lucroLiquido: dreData.calc_lucro_liquido || 0,
          },
          scoreData: null,
          creditsData: null,
          hasERP: false,
        };
      }

      // Fetch Credits data
      const { data: creditsData, count: creditsCount } = await supabase
        .from('credit_analysis_summary')
        .select('total_potential, credits_found_count', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const hasCredits = creditsData && (creditsData.credits_found_count || 0) > 0;

      if (!hasCredits) {
        // Check for XMLs uploaded
        const { count: xmlCount } = await supabase
          .from('xml_imports')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (!xmlCount || xmlCount === 0) {
          return {
            state: 'NO_CREDITS',
            dreData: {
              receitaBruta: dreData.calc_receita_bruta || 0,
              margemLiquida: dreData.calc_margem_liquida || 0,
              lucroLiquido: dreData.calc_lucro_liquido || 0,
            },
          scoreData: {
            score: scoreData.score_total || 0,
            nivel: scoreData.score_grade || 'C',
          },
            creditsData: null,
            hasERP: false,
          };
        }
      }

      // User has completed all steps
      return {
        state: 'COMPLETE',
        dreData: {
          receitaBruta: dreData.calc_receita_bruta || 0,
          margemLiquida: dreData.calc_margem_liquida || 0,
          lucroLiquido: dreData.calc_lucro_liquido || 0,
        },
        scoreData: {
          score: scoreData?.score_total || 0,
          nivel: scoreData?.score_grade || 'C',
        },
        creditsData: {
          totalCreditos: creditsData?.total_potential || 0,
          novosCreditos: creditsData?.credits_found_count || 0,
        },
        hasERP: false,
      };
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
  });

  return {
    state: isLoading ? 'LOADING' : (data?.state || 'NO_DRE'),
    dreData: data?.dreData || null,
    scoreData: data?.scoreData || null,
    creditsData: data?.creditsData || null,
    hasERP: data?.hasERP || false,
    isLoading,
    refetch,
  };
}
