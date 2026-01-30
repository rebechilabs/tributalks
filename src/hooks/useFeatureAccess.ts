import { useAuth } from "@/hooks/useAuth";

export type UserPlan = 'FREE' | 'STARTER' | 'NAVIGATOR' | 'PROFESSIONAL' | 'ENTERPRISE';

// Mapeamento de planos legados para novos
const LEGACY_PLAN_MAP: Record<string, UserPlan> = {
  'FREE': 'FREE',
  'BASICO': 'STARTER',
  'PROFISSIONAL': 'PROFESSIONAL',
  'PREMIUM': 'ENTERPRISE',
  'STARTER': 'STARTER',
  'NAVIGATOR': 'NAVIGATOR',
  'PROFESSIONAL': 'PROFESSIONAL',
  'ENTERPRISE': 'ENTERPRISE',
};

export const PLAN_HIERARCHY: Record<UserPlan, number> = {
  'FREE': 0,
  'STARTER': 1,
  'NAVIGATOR': 2,
  'PROFESSIONAL': 3,
  'ENTERPRISE': 4,
};

export const PLAN_LABELS: Record<UserPlan, string> = {
  'FREE': 'Grátis',
  'STARTER': 'Starter',
  'NAVIGATOR': 'Navigator',
  'PROFESSIONAL': 'Professional',
  'ENTERPRISE': 'Enterprise',
};

export const PLAN_PRICES: Record<UserPlan, string> = {
  'FREE': 'R$ 0',
  'STARTER': 'R$ 297/mês',
  'NAVIGATOR': 'R$ 697/mês',
  'PROFESSIONAL': 'R$ 1.997/mês',
  'ENTERPRISE': 'Sob consulta',
};

// Configuração de features por plano conforme matriz aprovada
export type FeatureKey = 
  // Calculadoras CORE
  | 'score_tributario'      // ILIMITADO para todos
  | 'split_payment'         // ILIMITADO para todos
  | 'comparativo_regimes'   // ILIMITADO para todos
  | 'calculadora_rtc'       // STARTER+
  | 'calculadora_nbs'       // NAVIGATOR+
  // Notícias
  | 'news_feed'             // NAVIGATOR+
  | 'timeline_reforma'      // STARTER+ (calendário prazos)
  | 'news_email_alerts'     // PROFESSIONAL+
  // Diagnóstico
  | 'importar_xmls'         // PROFESSIONAL+
  | 'radar_creditos'        // PROFESSIONAL+
  | 'dre_inteligente'       // PROFESSIONAL+
  | 'oportunidades'         // PROFESSIONAL+
  | 'margem_ativa'          // PROFESSIONAL+
  | 'nexus'                 // PROFESSIONAL+
  | 'relatorios_pdf'        // NAVIGATOR+
  | 'erp_conexao'           // PROFESSIONAL+
  // IA e Documentos
  | 'tribubot'              // Clara AI: STARTER: 30/dia, NAVIGATOR: 100/dia, PROFESSIONAL+: ilimitado
  | 'document_analyzer'     // NAVIGATOR+ (Analisador de Documentos)
  | 'workflows'             // NAVIGATOR+ (Workflows Guiados)
  // Extras
  | 'comunidade'            // NAVIGATOR+
  // Painel Executivo
  | 'painel_executivo'      // ENTERPRISE
  // Serviço Humano
  | 'consultoria_advogados' // ENTERPRISE
  | 'white_label';          // ENTERPRISE

interface FeatureConfig {
  minPlan: UserPlan;
  limit?: number | 'unlimited'; // undefined = sem limite, número = limite específico
  usageKey?: string; // chave para buscar uso no DB
}

export const FEATURE_CONFIG: Record<FeatureKey, FeatureConfig> = {
  // Calculadoras CORE - ILIMITADO para todos (porta de entrada)
  score_tributario: { minPlan: 'FREE', limit: 'unlimited' },
  split_payment: { minPlan: 'FREE', limit: 'unlimited' },
  comparativo_regimes: { minPlan: 'FREE', limit: 'unlimited' },
  
  // Calculadoras - níveis diferentes
  calculadora_rtc: { minPlan: 'STARTER' },
  calculadora_nbs: { minPlan: 'NAVIGATOR' },
  
  // Notícias
  news_feed: { minPlan: 'NAVIGATOR' },
  timeline_reforma: { minPlan: 'STARTER' },
  news_email_alerts: { minPlan: 'PROFESSIONAL' },
  
  // Diagnóstico - PROFESSIONAL+
  importar_xmls: { minPlan: 'PROFESSIONAL' },
  radar_creditos: { minPlan: 'PROFESSIONAL' },
  dre_inteligente: { minPlan: 'PROFESSIONAL' },
  oportunidades: { minPlan: 'PROFESSIONAL' },
  margem_ativa: { minPlan: 'PROFESSIONAL' },
  nexus: { minPlan: 'PROFESSIONAL' },
  relatorios_pdf: { minPlan: 'NAVIGATOR' },
  erp_conexao: { minPlan: 'PROFESSIONAL' },
  
  // IA e Documentos - Limites específicos de Clara AI por plano são controlados em useUserCredits
  tribubot: { minPlan: 'STARTER', usageKey: 'tribubot_messages_daily' },
  document_analyzer: { minPlan: 'NAVIGATOR' },
  workflows: { minPlan: 'NAVIGATOR' },
  
  // Extras
  comunidade: { minPlan: 'NAVIGATOR' },
  
  // Painel Executivo
  painel_executivo: { minPlan: 'ENTERPRISE' },
  
  // Serviço Humano - ENTERPRISE
  consultoria_advogados: { minPlan: 'ENTERPRISE' },
  white_label: { minPlan: 'ENTERPRISE' },
};

// Limite de CNPJs por plano
export const CNPJ_LIMITS: Record<UserPlan, number | 'unlimited'> = {
  'FREE': 1,
  'STARTER': 1,
  'NAVIGATOR': 2,
  'PROFESSIONAL': 5,
  'ENTERPRISE': 'unlimited',
};

// Limite de mensagens Clara AI por plano (diário)
export const CLARA_DAILY_LIMITS: Record<UserPlan, number | 'unlimited'> = {
  'FREE': 0,           // FREE não tem acesso
  'STARTER': 30,       // 30 mensagens/dia
  'NAVIGATOR': 100,    // 100 mensagens/dia
  'PROFESSIONAL': 'unlimited',
  'ENTERPRISE': 'unlimited',
};

// Escopo de ferramentas que a Clara pode responder por plano
export const CLARA_TOOL_SCOPE: Record<UserPlan, string[]> = {
  'FREE': [],
  'STARTER': [
    'score_tributario', 
    'split_payment', 
    'comparativo_regimes', 
    'calculadora_rtc', 
    'timeline_reforma'
  ],
  'NAVIGATOR': [
    'score_tributario', 
    'split_payment', 
    'comparativo_regimes', 
    'calculadora_rtc',
    'calculadora_nbs', 
    'timeline_reforma',
    'noticias', 
    'analisador_docs', 
    'workflows', 
    'comunidade', 
    'relatorios_pdf'
  ],
  'PROFESSIONAL': [
    'score_tributario', 
    'split_payment', 
    'comparativo_regimes', 
    'calculadora_rtc',
    'calculadora_nbs', 
    'timeline_reforma',
    'noticias', 
    'analisador_docs', 
    'workflows', 
    'comunidade', 
    'relatorios_pdf',
    'dre_inteligente', 
    'radar_creditos', 
    'analise_xmls',
    'oportunidades', 
    'margem_ativa', 
    'nexus', 
    'erp'
  ],
  'ENTERPRISE': [
    'score_tributario', 
    'split_payment', 
    'comparativo_regimes', 
    'calculadora_rtc',
    'calculadora_nbs', 
    'timeline_reforma',
    'noticias', 
    'analisador_docs', 
    'workflows', 
    'comunidade', 
    'relatorios_pdf',
    'dre_inteligente', 
    'radar_creditos', 
    'analise_xmls',
    'oportunidades', 
    'margem_ativa', 
    'nexus', 
    'erp',
    'painel_executivo',
    'consultoria_juridica', 
    'white_label'
  ],
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
  
  const isStarter = userLevel >= PLAN_HIERARCHY.STARTER;
  const isNavigator = userLevel >= PLAN_HIERARCHY.NAVIGATOR;
  const isProfessional = userLevel >= PLAN_HIERARCHY.PROFESSIONAL;
  const isEnterprise = userLevel >= PLAN_HIERARCHY.ENTERPRISE;
  
  // Pode comprar créditos extras da Clara (só STARTER e NAVIGATOR)
  const canBuyClaraCredits = currentPlan === 'STARTER' || currentPlan === 'NAVIGATOR';
  
  // Limite diário da Clara para o plano atual
  const claraDailyLimit = CLARA_DAILY_LIMITS[currentPlan];
  
  // Escopo de ferramentas da Clara para o plano atual
  const claraToolScope = CLARA_TOOL_SCOPE[currentPlan];
  
  return {
    currentPlan,
    planLabel: PLAN_LABELS[currentPlan],
    userLevel,
    hasAccess,
    isStarter,
    isNavigator,
    isProfessional,
    isEnterprise,
    canBuyClaraCredits,
    claraDailyLimit,
    claraToolScope,
  };
}
