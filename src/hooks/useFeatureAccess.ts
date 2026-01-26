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

// Configuração de features por plano conforme matriz aprovada
export type FeatureKey = 
  // Calculadoras CORE
  | 'score_tributario'      // FREE: 1x, depois ilimitado
  | 'split_payment'         // FREE: 1x, depois ilimitado
  | 'comparativo_regimes'   // NAVIGATOR+
  | 'calculadora_rtc'       // NAVIGATOR+
  // Notícias
  | 'news_feed'             // NAVIGATOR+
  | 'timeline_reforma'      // NAVIGATOR+ (calendário prazos)
  | 'news_email_alerts'     // PROFESSIONAL+
  // Diagnóstico
  | 'importar_xmls'         // PROFESSIONAL+
  | 'radar_creditos'        // PROFESSIONAL+
  | 'dre_inteligente'       // PROFESSIONAL+
  | 'oportunidades'         // PROFESSIONAL+
  | 'relatorios_pdf'        // PROFESSIONAL+
  // IA
  | 'tribubot'              // NAVIGATOR: 10 msg/dia, PROFESSIONAL+: ilimitado
  // Extras
  | 'comunidade'            // PROFESSIONAL+
  // Serviço Humano
  | 'diagnostico_humano'    // ENTERPRISE
  | 'reunioes_especialista' // ENTERPRISE
  | 'implementacao_guiada'; // ENTERPRISE

interface FeatureConfig {
  minPlan: UserPlan;
  limit?: number | 'unlimited'; // undefined = sem limite, número = limite específico
  usageKey?: string; // chave para buscar uso no DB
}

export const FEATURE_CONFIG: Record<FeatureKey, FeatureConfig> = {
  // Calculadoras CORE - FREE com limite de 1x cada
  score_tributario: { minPlan: 'FREE', limit: 1, usageKey: 'score-tributario' },
  split_payment: { minPlan: 'FREE', limit: 1, usageKey: 'split-payment' },
  
  // Calculadoras NAVIGATOR+ (sem limite)
  comparativo_regimes: { minPlan: 'NAVIGATOR' },
  calculadora_rtc: { minPlan: 'NAVIGATOR' },
  
  // Notícias
  news_feed: { minPlan: 'NAVIGATOR' },
  timeline_reforma: { minPlan: 'NAVIGATOR' },
  news_email_alerts: { minPlan: 'PROFESSIONAL' },
  
  // Diagnóstico - PROFESSIONAL+
  importar_xmls: { minPlan: 'PROFESSIONAL' },
  radar_creditos: { minPlan: 'PROFESSIONAL' },
  dre_inteligente: { minPlan: 'PROFESSIONAL' },
  oportunidades: { minPlan: 'PROFESSIONAL' },
  relatorios_pdf: { minPlan: 'PROFESSIONAL' },
  
  // IA
  tribubot: { minPlan: 'NAVIGATOR', limit: 10, usageKey: 'tribubot_messages_today' },
  
  // Extras
  comunidade: { minPlan: 'PROFESSIONAL' },
  
  // Serviço Humano - ENTERPRISE
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

// Limite de mensagens TribuBot por plano (por dia)
export const TRIBUBOT_LIMITS: Record<UserPlan, number | 'unlimited'> = {
  'FREE': 0,        // Sem acesso
  'NAVIGATOR': 10,  // 10 mensagens/dia
  'PROFESSIONAL': 'unlimited',
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

export function useFeatureAccess(feature: FeatureKey, usageCount?: number): FeatureAccessResult {
  const { profile } = useAuth();
  
  // Normaliza plano (legado → novo)
  const rawPlan = profile?.plano || 'FREE';
  const currentPlan: UserPlan = LEGACY_PLAN_MAP[rawPlan] || 'FREE';
  
  const config = FEATURE_CONFIG[feature];
  const userLevel = PLAN_HIERARCHY[currentPlan];
  const requiredLevel = PLAN_HIERARCHY[config.minPlan];
  
  // Tem acesso ao plano mínimo?
  const hasBasicAccess = userLevel >= requiredLevel;
  
  // Para features com limite, usageCount é passado externamente
  const usage = usageCount ?? 0;
  
  // Determinar limite efetivo
  // Se usuário está acima do plano mínimo, tem acesso ilimitado
  // Se está no plano mínimo, aplica o limite configurado
  let limit: number | 'unlimited' | null = null;
  if (hasBasicAccess) {
    if (userLevel > requiredLevel) {
      // Plano superior = ilimitado
      limit = 'unlimited';
    } else {
      // Plano mínimo = aplica limite configurado (ou unlimited se não tiver)
      limit = config.limit ?? 'unlimited';
    }
  }
  
  // Verificar se excedeu limite
  const hasAccess = hasBasicAccess && (
    limit === 'unlimited' || 
    typeof limit !== 'number' ||
    usage < limit
  );
  
  const upgradeMessage = hasBasicAccess 
    ? (typeof limit === 'number' && usage >= limit)
      ? `Você atingiu o limite de ${limit} uso${limit > 1 ? 's' : ''} do plano ${PLAN_LABELS[currentPlan]}. Faça upgrade para uso ilimitado.`
      : ''
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
