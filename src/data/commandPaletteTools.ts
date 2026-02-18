/**
 * Command Palette Tools Registry
 * All tools available for search via ⌘K / Ctrl+K
 */

export type PlanLevel = 'starter' | 'navigator' | 'professional' | 'enterprise';

import type { IconKey } from '@/lib/iconMap';

export interface CommandTool {
  id: string;
  name: string;
  path?: string;
  action?: 'openClara';
  icon: IconKey;
  plan: PlanLevel;
  keywords: string[];
  description: string;
}

export const ALL_TOOLS: CommandTool[] = [
  // ============ Professional Only ============
  { 
    id: 'nexus',
    name: 'NEXUS Command Center', 
    path: '/dashboard/nexus', 
    icon: 'sliders',
    plan: 'professional',
    keywords: ['nexus', 'kpi', 'comando', 'centro', 'painel', 'executivo'],
    description: '8 KPIs executivos em tempo real'
  },
  { 
    id: 'radar',
    name: 'Radar de Créditos', 
    path: '/creditos-tributarios', 
    icon: 'search',
    plan: 'professional',
    keywords: ['radar', 'creditos', 'xml', 'nota fiscal', 'recuperacao'],
    description: 'Identifique créditos tributários automaticamente'
  },
  { 
    id: 'dre',
    name: 'DRE Inteligente', 
    path: '/dre', 
    icon: 'briefcase',
    plan: 'professional',
    keywords: ['dre', 'demonstrativo', 'margem', 'lucro', 'resultado'],
    description: 'Impacto da Reforma na sua margem'
  },
  {
    id: 'margem-ativa',
    name: 'Margem Ativa',
    path: '/dashboard/margem-ativa',
    icon: 'trendingUp',
    plan: 'professional',
    keywords: ['margem', 'ativa', 'fornecedores', 'omc', 'price guard'],
    description: 'Suite de proteção de margem'
  },
  {
    id: 'erp',
    name: 'Conectar ERP',
    path: '/integracoes',
    icon: 'link',
    plan: 'professional',
    keywords: ['erp', 'integrar', 'conectar', 'omie', 'bling', 'totvs'],
    description: 'Sincronize Omie, Bling, TOTVS...'
  },
  {
    id: 'oportunidades',
    name: 'Oportunidades Tributárias',
    path: '/oportunidades',
    icon: 'barChart',
    plan: 'professional',
    keywords: ['oportunidades', 'incentivos', 'beneficios', 'economia'],
    description: '61+ incentivos fiscais mapeados'
  },

  // ============ Navigator+ ============
  { 
    id: 'noticias',
    name: 'Notícias da Reforma', 
    path: '/gps-reforma/noticias', 
    icon: 'newspaper',
    plan: 'navigator',
    keywords: ['noticias', 'reforma', 'atualizacoes', 'pilulas'],
    description: 'Feed diário com pílulas tributárias'
  },
  { 
    id: 'comunidade',
    name: 'TribuTalks Connect', 
    path: '/comunidade', 
    icon: 'users',
    plan: 'navigator',
    keywords: ['comunidade', 'circle', 'forum', 'rede', 'network', 'tributalks', 'connect'],
    description: 'Comunidade exclusiva Professional+'
  },
  {
    id: 'checklist',
    name: 'Checklist de Prontidão',
    path: '/checklist-reforma',
    icon: 'checkCircle',
    plan: 'navigator',
    keywords: ['checklist', 'prontidao', '2026', 'preparacao'],
    description: 'Autoavaliação para a Reforma'
  },
  {
    id: 'nbs',
    name: 'Calculadora NBS (Serviços)',
    path: '/calculadora/nbs',
    icon: 'calculator',
    plan: 'navigator',
    keywords: ['calculadora', 'nbs', 'servicos', 'cbs', 'ibs'],
    description: 'CBS + IBS para serviços'
  },
  {
    id: 'analisador',
    name: 'Analisador de Documentos',
    path: '/analisador-documentos',
    icon: 'fileText',
    plan: 'navigator',
    keywords: ['analisador', 'documentos', 'pdf', 'contrato'],
    description: 'Análise inteligente de documentos fiscais'
  },
  {
    id: 'workflows',
    name: 'Workflows Guiados',
    path: '/workflows-guiados',
    icon: 'refreshCw',
    plan: 'navigator',
    keywords: ['workflows', 'guiados', 'passo', 'wizard'],
    description: 'Processos passo a passo'
  },

  // ============ Starter+ ============
  { 
    id: 'score',
    name: 'Score Tributário', 
    path: '/dashboard/score-tributario', 
    icon: 'target',
    plan: 'starter',
    keywords: ['score', 'avaliacao', 'saude', 'fiscal', 'nota'],
    description: 'Avaliação da saúde fiscal em 5 dimensões'
  },
  { 
    id: 'rtc',
    name: 'Calculadora RTC', 
    path: '/calculadora/rtc', 
    icon: 'calculator',
    plan: 'starter',
    keywords: ['calculadora', 'rtc', 'cbs', 'ibs', 'produtos', 'ncm'],
    description: 'CBS + IBS + IS por NCM'
  },
  { 
    id: 'split',
    name: 'Simulador Split Payment', 
    path: '/calculadora/split', 
    icon: 'creditCard',
    plan: 'starter',
    keywords: ['split', 'payment', 'caixa', 'retencao', 'fluxo'],
    description: 'Impacto no fluxo de caixa'
  },
  {
    id: 'regimes',
    name: 'Comparativo de Regimes Tributários',
    path: '/calculadora/regimes',
    icon: 'scale',
    plan: 'starter',
    keywords: ['comparativo', 'regimes', 'simples', 'presumido', 'real'],
    description: 'Simples vs Presumido vs Real'
  },
  { 
    id: 'timeline',
    name: 'Timeline 2026-2033', 
    path: '/gps-reforma', 
    icon: 'calendar',
    plan: 'starter',
    keywords: ['timeline', 'reforma', 'cronograma', 'marcos', 'calendario'],
    description: 'Marcos da transição tributária'
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'home',
    plan: 'starter',
    keywords: ['dashboard', 'inicio', 'home', 'painel'],
    description: 'Visão geral da sua jornada'
  },
  
  // ============ Ações Especiais ============
  {
    id: 'clara',
    name: 'Abrir Clara AI',
    action: 'openClara',
    icon: 'bot',
    plan: 'starter',
    keywords: ['clara', 'ia', 'assistente', 'chat', 'ajuda', 'copiloto'],
    description: 'Copiloto tributário 24/7'
  },
  {
    id: 'perfil',
    name: 'Meu Perfil',
    path: '/perfil',
    icon: 'user',
    plan: 'starter',
    keywords: ['perfil', 'conta', 'usuario', 'configuracoes'],
    description: 'Gerenciar minha conta'
  },
  {
    id: 'indicar',
    name: 'Indique e Ganhe',
    path: '/indicar',
    icon: 'gift',
    plan: 'starter',
    keywords: ['indicar', 'referral', 'indicacao', 'desconto'],
    description: 'Ganhe 20% de desconto indicando'
  },
  {
    id: 'ajuda',
    name: 'Central de Ajuda',
    path: '/ajuda',
    icon: 'helpCircle',
    plan: 'starter',
    keywords: ['ajuda', 'suporte', 'faq', 'duvidas'],
    description: 'FAQ e tutoriais'
  },
];

// Plan hierarchy for access control
const PLAN_LEVELS: Record<PlanLevel, number> = {
  starter: 1,
  navigator: 2,
  professional: 3,
  enterprise: 3
};

/**
 * Check if a user can access a tool based on their plan
 */
export function canAccessTool(tool: CommandTool, userPlan: string | null | undefined): boolean {
  const normalizedPlan = (userPlan?.toLowerCase() || 'starter') as PlanLevel;
  const userLevel = PLAN_LEVELS[normalizedPlan] || 1;
  const toolLevel = PLAN_LEVELS[tool.plan] || 1;
  
  return userLevel >= toolLevel;
}

/**
 * Filter tools by search query
 */
export function filterTools(tools: CommandTool[], query: string): CommandTool[] {
  if (!query.trim()) return tools;
  
  const searchLower = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return tools.filter(tool => {
    const nameNormalized = tool.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const descNormalized = tool.description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const keywordsJoined = tool.keywords.join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    return (
      nameNormalized.includes(searchLower) ||
      descNormalized.includes(searchLower) ||
      keywordsJoined.includes(searchLower)
    );
  });
}
