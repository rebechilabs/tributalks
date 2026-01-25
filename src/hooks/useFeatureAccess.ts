import { useAuth } from "@/hooks/useAuth";

export type UserPlan = 'FREE' | 'NAVIGATOR' | 'PROFESSIONAL' | 'ENTERPRISE';

// Mapeamento de planos legados para novos
const LEGACY_PLAN_MAP: Record<string, UserPlan> = {
  'FREE': 'FREE',
  'BASICO': 'NAVIGATOR',
  'PROFISSIONAL': 'PROFESSIONAL',
  'PREMIUM': 'ENTERPRISE',
  'NAVIGATOR': 'NAVIGATOR',
  'PROFESSIONAL': 'PROFESSIONAL',
  'ENTERPRISE': 'ENTERPRISE',
};

export const PLAN_HIERARCHY: Record<UserPlan, number> = {
  'FREE': 0,
  'NAVIGATOR': 1,
  'PROFESSIONAL': 2,
  'ENTERPRISE': 3,
};

export const PLAN_LABELS: Record<UserPlan, string> = {
  'FREE': 'Grátis',
  'NAVIGATOR': 'Navigator',
  'PROFESSIONAL': 'Professional',
  'ENTERPRISE': 'Enterprise',
};

export const PLAN_PRICES: Record<UserPlan, string> = {
  'FREE': 'R$ 0',
  'NAVIGATOR': 'R$ 697/mês',
  'PROFESSIONAL': 'R$ 2.497/mês',
  'ENTERPRISE': 'Sob consulta',
};

// Configuração de features por plano
export type FeatureKey = 
  // Notícias
  | 'news_feed'
  | 'news_pilula'
  | 'news_history'
  | 'news_email_alerts'
  | 'news_cnpj_analysis'
  // Calculadoras
  | 'score_tributario'
  | 'split_payment'
  | 'comparativo_regimes'
  | 'calculadora_rtc'
  | 'timeline_reforma'
  // Diagnóstico
  | 'importar_xmls'
  | 'radar_creditos'
  | 'dre_inteligente'
  | 'oportunidades'
  | 'benchmark_setorial'
  | 'relatorios_pdf'
  // IA e Suporte
  | 'tribubot'
  | 'comunidade'
  // Serviço Humano
  | 'diagnostico_humano'
  | 'reunioes_especialista'
  | 'implementacao_guiada';

interface FeatureConfig {
  minPlan: UserPlan;
  limit?: number | 'unlimited'; // undefined = sem limite, número = limite específico
  usageKey?: string; // chave para buscar uso no DB
}

export const FEATURE_CONFIG: Record<FeatureKey, FeatureConfig> = {
  // Notícias
  news_feed: { minPlan: 'NAVIGATOR' },
  news_pilula: { minPlan: 'NAVIGATOR' },
  news_history: { minPlan: 'NAVIGATOR' },
  news_email_alerts: { minPlan: 'PROFESSIONAL' },
  news_cnpj_analysis: { minPlan: 'ENTERPRISE' },
  
  // Calculadoras
  score_tributario: { minPlan: 'FREE', limit: 1 },
  split_payment: { minPlan: 'FREE', limit: 1 },
  comparativo_regimes: { minPlan: 'NAVIGATOR' },
  calculadora_rtc: { minPlan: 'NAVIGATOR' },
  timeline_reforma: { minPlan: 'NAVIGATOR' },
  
  // Diagnóstico
  importar_xmls: { minPlan: 'PROFESSIONAL' },
  radar_creditos: { minPlan: 'PROFESSIONAL' },
  dre_inteligente: { minPlan: 'PROFESSIONAL' },
  oportunidades: { minPlan: 'PROFESSIONAL' },
  benchmark_setorial: { minPlan: 'PROFESSIONAL' },
  relatorios_pdf: { minPlan: 'PROFESSIONAL' },
  
  // IA e Suporte
  tribubot: { minPlan: 'NAVIGATOR', limit: 10, usageKey: 'tribubot_messages_today' },
  comunidade: { minPlan: 'PROFESSIONAL' },
  
  // Serviço Humano
  diagnostico_humano: { minPlan: 'ENTERPRISE' },
  reunioes_especialista: { minPlan: 'ENTERPRISE' },
  implementacao_guiada: { minPlan: 'ENTERPRISE' },
};

// Limite de CNPJs por plano
export const CNPJ_LIMITS: Record<UserPlan, number | 'unlimited'> = {
  'FREE': 1,
  'NAVIGATOR': 1,
  'PROFESSIONAL': 3,
  'ENTERPRISE': 'unlimited',
};

interface FeatureAccessResult {
  hasAccess: boolean;
  limit: number | 'unlimited' | null;
  usage: number;
  minPlan: UserPlan;
  currentPlan: UserPlan;
  planLabel: string;
  upgradeMessage: string;
}

export function useFeatureAccess(feature: FeatureKey): FeatureAccessResult {
  const { profile } = useAuth();
  
  // Normaliza plano (legado → novo)
  const rawPlan = profile?.plano || 'FREE';
  const currentPlan: UserPlan = LEGACY_PLAN_MAP[rawPlan] || 'FREE';
  
  const config = FEATURE_CONFIG[feature];
  const userLevel = PLAN_HIERARCHY[currentPlan];
  const requiredLevel = PLAN_HIERARCHY[config.minPlan];
  
  const hasAccess = userLevel >= requiredLevel;
  
  // Para limites de uso específicos (como TribuBot), seria necessário buscar do DB
  // Por agora retornamos 0 como placeholder
  const usage = 0;
  
  const limit = hasAccess 
    ? (userLevel > requiredLevel ? 'unlimited' : config.limit ?? 'unlimited')
    : null;
  
  const upgradeMessage = hasAccess 
    ? ''
    : `Disponível a partir do plano ${PLAN_LABELS[config.minPlan]} (${PLAN_PRICES[config.minPlan]})`;
  
  return {
    hasAccess,
    limit,
    usage,
    minPlan: config.minPlan,
    currentPlan,
    planLabel: PLAN_LABELS[currentPlan],
    upgradeMessage,
  };
}

// Hook simplificado para verificar acesso por plano
export function usePlanAccess() {
  const { profile } = useAuth();
  
  const rawPlan = profile?.plano || 'FREE';
  const currentPlan: UserPlan = LEGACY_PLAN_MAP[rawPlan] || 'FREE';
  const userLevel = PLAN_HIERARCHY[currentPlan];
  
  const hasAccess = (minPlan: UserPlan): boolean => {
    return userLevel >= PLAN_HIERARCHY[minPlan];
  };
  
  const isNavigator = userLevel >= PLAN_HIERARCHY.NAVIGATOR;
  const isProfessional = userLevel >= PLAN_HIERARCHY.PROFESSIONAL;
  const isEnterprise = userLevel >= PLAN_HIERARCHY.ENTERPRISE;
  
  return {
    currentPlan,
    planLabel: PLAN_LABELS[currentPlan],
    userLevel,
    hasAccess,
    isNavigator,
    isProfessional,
    isEnterprise,
  };
}
