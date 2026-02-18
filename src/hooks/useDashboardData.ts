import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// ============= TYPES =============

export interface ThermometerData {
  userName: string;
  scoreGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | null;
  scoreTotal: number | null;
  cargaEfetivaPercent: number | null;
  caixaPotencialMin: number | null;
  caixaPotencialMax: number | null;
  riscoNivel: 'baixo' | 'medio' | 'alto' | null;
  alertasCount: number;
  hasScoreData: boolean;
  hasDreData: boolean;
  hasCreditsData: boolean;
}

export interface UserProgressData {
  hasScore: boolean;
  hasXmls: boolean;
  hasDre: boolean;
  hasOpportunities: boolean;
  hasWorkflow: boolean;
  companyName: string | null;
  cnpj: string | null;
  scoreGrade: string | null;
  scoreTotal: number | null;
  scoreDate: string | null;
  xmlCount: number;
  creditsTotal: number;
  dreDate: string | null;
  opportunitiesCount: number;
  workflowsCompleted: number;
  workflowsInProgress: number;
  lastActivity: {
    type: 'score' | 'xml' | 'dre' | 'opportunity' | 'workflow' | 'simulation' | null;
    date: string | null;
    description: string | null;
    link: string | null;
  };
  progressPercent: number;
}

export interface WorkflowProgressItem {
  id: string;
  workflow_id: string;
  current_step_index: number;
  completed_steps: string[];
  updated_at: string;
  completed_at: string | null;
}

export interface ExpiringBenefit {
  id: string;
  name: string;
  futuro_reforma: string;
  months_until_expiry: number;
  economia_mensal: number;
}

export interface PrazoItem {
  id: string;
  titulo: string;
  data_prazo: string;
  descricao: string | null;
  tipo: string | null;
  base_legal: string | null;
  url_referencia: string | null;
  afeta_regimes: string[] | null;
  afeta_setores: string[] | null;
}

export interface ScoreAction {
  id: string;
  action_code: string;
  action_title: string;
  action_description: string | null;
  link_to: string | null;
  points_gain: number | null;
  economia_estimada: number | null;
  priority: number | null;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastAccessDate: string | null;
}

export interface DashboardData {
  // Thermometer / Executive Summary
  thermometerData: ThermometerData | null;
  
  // User Progress
  userProgress: UserProgressData;
  
  // Workflows
  inProgressWorkflows: WorkflowProgressItem[];
  
  // Benefits at risk
  expiringBenefits: ExpiringBenefit[];
  
  // Deadlines
  nextDeadline: PrazoItem | null;
  
  // Score Actions
  scoreActions: ScoreAction[];
  
  // Streak
  streakData: StreakData;
}

// ============= HELPERS =============

function getRiscoNivelFromAuditRisk(value: number): 'baixo' | 'medio' | 'alto' {
  if (value <= 30) return 'baixo';
  if (value <= 70) return 'medio';
  return 'alto';
}

function getRiscoNivelFromScore(score: number, maxScore: number = 200): 'baixo' | 'medio' | 'alto' {
  const percent = (score / maxScore) * 100;
  if (percent >= 70) return 'baixo';
  if (percent >= 40) return 'medio';
  return 'alto';
}

// ============= MAIN HOOK =============

export function useDashboardData() {
  const { user, profile } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['dashboard-data', userId],
    queryFn: async (): Promise<DashboardData> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Execute ALL queries in parallel
      const [
        profileResult,
        companyProfileResult,
        taxScoreResult,
        taxScoreHistoryResult,
        dreResult,
        creditSummaryResult,
        identifiedCreditsResult,
        xmlCountResult,
        opportunitiesResult,
        opportunitiesCountResult,
        workflowsResult,
        scoreActionsResult,
        simulationResult,
        prazosResult,
      ] = await Promise.all([
        // 1. Profile (for streak + name)
        supabase
          .from('profiles')
          .select('nome, last_access_date, current_streak, longest_streak')
          .eq('user_id', userId)
          .maybeSingle(),
        
        // 2. Company Profile
        supabase
          .from('company_profile')
          .select('razao_social, nome_fantasia, cnpj_principal, setor')
          .eq('user_id', userId)
          .maybeSingle(),
        
        // 3. Tax Score (latest)
        supabase
          .from('tax_score')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        
        // 4. Tax Score History (for date)
        supabase
          .from('tax_score_history')
          .select('score_grade, score_total, calculated_at')
          .eq('user_id', userId)
          .order('calculated_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        
        // 5. DRE
        supabase
          .from('company_dre')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        
        // 6. Credit Analysis Summary
        supabase
          .from('credit_analysis_summary')
          .select('total_potential')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        
        // 7. Identified Credits (for sum)
        supabase
          .from('identified_credits')
          .select('potential_recovery')
          .eq('user_id', userId)
          .eq('status', 'identified'),
        
        // 8. XML Imports count
        supabase
          .from('xml_imports')
          .select('id, created_at', { count: 'exact' })
          .eq('user_id', userId)
          .eq('status', 'processed')
          .order('created_at', { ascending: false })
          .limit(1),
        
        // 9. Company Opportunities (with join for expiring benefits)
        supabase
          .from('company_opportunities')
          .select(`
            id,
            economia_mensal_min,
            economia_mensal_max,
            status,
            created_at,
            tax_opportunities:opportunity_id (
              name,
              futuro_reforma,
              validade_ate
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        
        // 10. Opportunities count
        supabase
          .from('company_opportunities')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        
        // 11. Workflows (all for progress + in-progress filter)
        supabase
          .from('workflow_progress')
          .select('id, workflow_id, current_step_index, completed_steps, updated_at, completed_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false }),
        
        // 12. Score Actions
        supabase
          .from('score_actions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'pending')
          .order('priority', { ascending: true })
          .limit(3),
        
        // 13. Last simulation
        supabase
          .from('simulations')
          .select('calculator_slug, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        
        // 14. Prazos (upcoming deadlines)
        supabase
          .from('prazos_reforma')
          .select('*')
          .eq('ativo', true)
          .gte('data_prazo', new Date().toISOString().split('T')[0])
          .order('data_prazo', { ascending: true })
          .limit(10),
      ]);

      // ============= PROCESS DATA =============

      const userName = profileResult.data?.nome || profile?.nome || 'Usuário';
      const taxScore = taxScoreResult.data;
      const taxScoreHistory = taxScoreHistoryResult.data;
      const dre = dreResult.data;
      const allOpportunities = opportunitiesResult.data || [];
      const allWorkflows = workflowsResult.data || [];

      // Credits total
      let creditosTotal = 0;
      if (creditSummaryResult.data?.total_potential) {
        creditosTotal = Number(creditSummaryResult.data.total_potential);
      } else if (identifiedCreditsResult.data && identifiedCreditsResult.data.length > 0) {
        creditosTotal = identifiedCreditsResult.data.reduce(
          (sum, c) => sum + Number(c.potential_recovery || 0), 
          0
        );
      }

      // Flags
      const hasScoreData = !!taxScore && taxScore.score_total !== null;
      const hasDreData = !!dre && dre.calc_receita_bruta !== null && Number(dre.calc_receita_bruta) > 0;
      const hasCreditsData = creditosTotal > 0;
      const hasScore = !!taxScoreHistory?.score_grade;
      const xmlCount = xmlCountResult.count || 0;
      const hasXmls = xmlCount > 0;
      const hasDre = !!dre;
      const opportunitiesCount = opportunitiesCountResult.count || 0;
      const hasOpportunities = opportunitiesCount > 0;
      const workflowsCompleted = allWorkflows.filter(w => w.completed_at).length;
      const workflowsInProgress = allWorkflows.filter(w => !w.completed_at).length;
      const hasWorkflow = workflowsCompleted > 0;

      // Calculate effective tax burden
      let cargaEfetivaPercent: number | null = null;
      if (hasDreData && dre.input_impostos_sobre_vendas && dre.calc_receita_bruta) {
        const impostos = Number(dre.input_impostos_sobre_vendas);
        const receita = Number(dre.calc_receita_bruta);
        if (receita > 0) {
          cargaEfetivaPercent = Math.round((impostos / receita) * 1000) / 10;
        }
      }

      // Calculate potential cash
      const economiaPotencial = taxScore?.economia_potencial ? Number(taxScore.economia_potencial) : 0;
      const totalPotencial = economiaPotencial + creditosTotal;
      
      let caixaPotencialMin: number | null = null;
      let caixaPotencialMax: number | null = null;
      if (totalPotencial > 0) {
        caixaPotencialMin = totalPotencial * 0.7;
        caixaPotencialMax = totalPotencial * 1.3;
      }

      // Risk level
      let riscoNivel: 'baixo' | 'medio' | 'alto' | null = null;
      if (taxScore?.risco_autuacao !== null && taxScore?.risco_autuacao !== undefined) {
        riscoNivel = getRiscoNivelFromAuditRisk(Number(taxScore.risco_autuacao));
      } else if (taxScore?.score_risco !== null && taxScore?.score_risco !== undefined) {
        riscoNivel = getRiscoNivelFromScore(Number(taxScore.score_risco));
      }

      // Thermometer data
      const thermometerData: ThermometerData = {
        userName,
        scoreGrade: hasScoreData ? (taxScore.score_grade as ThermometerData['scoreGrade']) : null,
        scoreTotal: hasScoreData ? taxScore.score_total : null,
        cargaEfetivaPercent,
        caixaPotencialMin,
        caixaPotencialMax,
        riscoNivel,
        alertasCount: scoreActionsResult.data?.length || 0,
        hasScoreData,
        hasDreData,
        hasCreditsData,
      };

      // In-progress workflows (top 3)
      const inProgressWorkflows = allWorkflows
        .filter(w => !w.completed_at)
        .slice(0, 3) as WorkflowProgressItem[];

      // Expiring benefits calculation
      const expiringBenefits: ExpiringBenefit[] = [];
      const now = new Date();
      const transitionDates = {
        cbs_start: new Date("2026-01-01"),
        icms_ibs_transition: new Date("2027-01-01"),
        full_transition: new Date("2033-01-01"),
      };

      for (const opp of allOpportunities) {
        if (!['nova', 'analisando', 'implementando', 'implementada'].includes(opp.status || '')) continue;
        
        const taxOpp = opp.tax_opportunities as any;
        if (!taxOpp || taxOpp.futuro_reforma === "mantido") continue;

        let expiryDate: Date | null = null;

        if (taxOpp.validade_ate) {
          expiryDate = new Date(taxOpp.validade_ate);
        } else if (taxOpp.futuro_reforma === "extinto") {
          expiryDate = transitionDates.cbs_start;
        } else if (taxOpp.futuro_reforma === "substituido" || taxOpp.futuro_reforma === "reduzido") {
          expiryDate = transitionDates.icms_ibs_transition;
        } else if (taxOpp.futuro_reforma === "em_analise") {
          expiryDate = transitionDates.full_transition;
        }

        if (!expiryDate) continue;

        const monthsUntilExpiry = Math.floor(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );

        if (monthsUntilExpiry <= 12) {
          expiringBenefits.push({
            id: opp.id,
            name: taxOpp.name,
            futuro_reforma: taxOpp.futuro_reforma,
            months_until_expiry: monthsUntilExpiry,
            economia_mensal: ((opp.economia_mensal_min || 0) + (opp.economia_mensal_max || 0)) / 2,
          });
        }
      }

      expiringBenefits.sort((a, b) => a.months_until_expiry - b.months_until_expiry);

      // Next deadline (filter by user regime/sector)
      const userRegime = profile?.regime?.toUpperCase() || null;
      const userSetor = companyProfileResult.data?.setor || null;
      
      const relevantPrazos = (prazosResult.data || []).filter(p => {
        const hasRegimeFilter = p.afeta_regimes && p.afeta_regimes.length > 0;
        const hasSetorFilter = p.afeta_setores && p.afeta_setores.length > 0;

        if (!hasRegimeFilter && !hasSetorFilter) return true;

        const regimeMatch = !hasRegimeFilter || 
          (userRegime && p.afeta_regimes?.includes(userRegime)) ||
          p.afeta_regimes?.includes('TODOS');

        const setorMatch = !hasSetorFilter || 
          (userSetor && p.afeta_setores?.includes(userSetor)) ||
          p.afeta_setores?.includes('TODOS');

        return regimeMatch || setorMatch;
      });

      const nextDeadline = relevantPrazos[0] || null;

      // User Progress calculation
      const scoreDate = taxScoreHistory?.calculated_at || null;
      const lastXmlDate = xmlCountResult.data?.[0]?.created_at || null;
      const dreDate = dre?.updated_at || dre?.created_at || null;
      const lastOpportunityDate = allOpportunities[0]?.created_at || null;
      const lastWorkflowDate = allWorkflows[0]?.updated_at || null;

      const completedSteps = [hasScore, hasXmls, hasDre, hasOpportunities, hasWorkflow].filter(Boolean).length;
      const progressPercent = (completedSteps / 5) * 100;

      // Last activity
      const activities = [
        { type: 'score' as const, date: scoreDate, description: `Score ${taxScoreHistory?.score_grade}`, link: '/dashboard/score-tributario' },
        { type: 'xml' as const, date: lastXmlDate, description: `${xmlCount} XMLs importados`, link: '/dashboard/analise-notas' },
        { type: 'dre' as const, date: dreDate, description: 'DRE atualizado', link: '/dashboard/dre' },
        { type: 'opportunity' as const, date: lastOpportunityDate, description: `${opportunitiesCount} oportunidades`, link: '/dashboard/planejar/oportunidades' },
        { type: 'workflow' as const, date: lastWorkflowDate, description: 'Workflow atualizado', link: '/dashboard/workflows' },
        { type: 'simulation' as const, date: simulationResult.data?.created_at, description: `Simulação ${simulationResult.data?.calculator_slug}`, link: '/historico' },
      ].filter(a => a.date);

      const lastActivity = activities.sort((a, b) => 
        new Date(b.date!).getTime() - new Date(a.date!).getTime()
      )[0] || { type: null, date: null, description: null, link: null };

      const userProgress: UserProgressData = {
        hasScore,
        hasXmls,
        hasDre,
        hasOpportunities,
        hasWorkflow,
        companyName: companyProfileResult.data?.nome_fantasia || companyProfileResult.data?.razao_social || null,
        cnpj: companyProfileResult.data?.cnpj_principal || null,
        scoreGrade: taxScoreHistory?.score_grade || null,
        scoreTotal: taxScoreHistory?.score_total || null,
        scoreDate,
        xmlCount,
        creditsTotal: creditosTotal,
        dreDate,
        opportunitiesCount,
        workflowsCompleted,
        workflowsInProgress,
        lastActivity,
        progressPercent,
      };

      // Streak data
      const today = new Date().toISOString().split("T")[0];
      const lastAccess = profileResult.data?.last_access_date;
      const currentStreak = profileResult.data?.current_streak || 0;
      const longestStreak = profileResult.data?.longest_streak || 0;

      // Update streak if needed (side effect, but important for UX)
      if (lastAccess !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        let newStreak = 1;
        if (lastAccess === yesterday) {
          newStreak = currentStreak + 1;
        }
        const newLongest = Math.max(newStreak, longestStreak);
        
        // Fire and forget update
        supabase
          .from("profiles")
          .update({
            last_access_date: today,
            current_streak: newStreak,
            longest_streak: newLongest,
          })
          .eq("user_id", userId)
          .then(() => {});
      }

      const streakData: StreakData = {
        currentStreak: profileResult.data?.current_streak || 0,
        longestStreak: profileResult.data?.longest_streak || 0,
        lastAccessDate: profileResult.data?.last_access_date || null,
      };

      return {
        thermometerData,
        userProgress,
        inProgressWorkflows,
        expiringBenefits: expiringBenefits.slice(0, 3),
        nextDeadline,
        scoreActions: (scoreActionsResult.data || []) as ScoreAction[],
        streakData,
      };
    },
    enabled: !!userId,
    staleTime: 60000, // Cache for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}
