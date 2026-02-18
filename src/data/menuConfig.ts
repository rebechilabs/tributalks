import { 
  Home, Scale, Wallet, FileText, Users, Calendar, 
  Clock, Settings, Lock, Sparkles, Newspaper, Mail,
  Calculator, Target, BarChart3, Trophy, Lightbulb, LayoutDashboard,
  MapPin, Briefcase, ClipboardCheck, Plug, Gift, Route, FileSearch,
  ArrowUp, Command, Shield, TrendingUp, Handshake
} from "lucide-react";

export type PlanType = 'STARTER' | 'NAVIGATOR' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'success' | 'destructive';
  description?: string;
  featured?: boolean;
  locked?: boolean;
  requiredPlan?: PlanType;
  shortcut?: string;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
  collapsible?: boolean;
  moduleHref?: string; // New: link when clicking on module title
}

export interface MenuDivider {
  type: 'divider';
}

export type MenuElement = MenuGroup | MenuDivider;

// Clara AI - Item fixo em TODOS os planos (AI First)
export const CLARA_AI_ITEM: MenuItem = {
  label: 'Clara AI',
  href: '/clara-ai',
  icon: Sparkles,
  badge: '⌘K',
  badgeVariant: 'default',
  description: 'Sua copiloto tributária',
  featured: true,
  shortcut: 'k'
};

/**
 * MENU STARTER V2 (R$ 297/mês)
 * Filosofia: Mesmo layout modular do Professional, mas apenas módulo ENTENDER
 * Clara com limite de 30 msgs/dia, foco em diagnóstico e simulação
 */
export const MENU_STARTER: MenuElement[] = [
  // Clara AI no topo
  {
    title: '',
    items: [
      { ...CLARA_AI_ITEM, badge: '30/dia', description: 'Pergunte sobre a Reforma' },
    ]
  },
  // HOME
  {
    title: '',
    items: [
      { label: 'Home', href: '/dashboard/home', icon: Home },
    ]
  },
  // Módulo ENTENDER
  {
    title: 'ENTENDER',
    collapsible: true,
    moduleHref: '/dashboard/entender',
    items: [
      { label: 'DRE Inteligente', href: '/dashboard/entender/dre', icon: BarChart3, description: 'Base para análises' },
      { label: 'Score Tributário', href: '/dashboard/entender/score', icon: Trophy, description: 'Diagnóstico 0-1000' },
      { label: 'Comparativo de Regimes Tributários', href: '/dashboard/entender/comparativo', icon: Scale, description: '5 regimes tributários', badge: '2027' },
    ]
  },
  // PIT - Prazos Importantes Tributários
  {
    title: 'PIT',
    collapsible: true,
    items: [
      { label: 'Timeline 2026-2033', href: '/dashboard/timeline-reforma', icon: MapPin },
    ]
  },
  { type: 'divider' as const },
  // Preview de ferramentas PRO (FOMO)
  {
    title: 'Ferramentas Pro',
    items: [
      { label: 'Radar de Créditos', href: '/upgrade?feature=radar', icon: FileText, locked: true, description: 'Análise de XMLs' },
      { label: 'NEXUS', href: '/upgrade?feature=nexus', icon: LayoutDashboard, locked: true, description: 'Centro de Comando' },
      { label: 'Margem Ativa', href: '/upgrade?feature=margem', icon: Target, locked: true, description: 'Precificação inteligente' },
    ]
  },
  { type: 'divider' as const },
  {
    title: '',
    items: [
      { label: 'Notícias', href: '/noticias', icon: Newspaper, description: 'Reforma Tributária' },
      { label: 'Conexão & Negócios', href: '/dashboard/conexao', icon: Handshake, description: 'Comunidade e networking' },
      { label: 'Indique e Ganhe', href: '/indicar', icon: Gift, badge: 'Até 20%', badgeVariant: 'success', description: 'Ganhe desconto indicando' },
      { label: 'Integrações', href: '/dashboard/integracoes', icon: Plug },
      { label: 'Configurações', href: '/configuracoes', icon: Settings },
    ]
  },
];

// Itens bloqueados para Starter (cria FOMO para Navigator)
export const STARTER_LOCKED_PREVIEW: MenuItem[] = [
  { label: 'Notícias da Reforma', href: '/upgrade?feature=noticias', icon: Newspaper, locked: true, requiredPlan: 'NAVIGATOR', description: 'Atualizações diárias' },
  { label: 'Comunidade', href: '/upgrade?feature=comunidade', icon: Users, locked: true, requiredPlan: 'NAVIGATOR', description: 'Circle exclusivo' },
  { label: 'NEXUS', href: '/upgrade?feature=nexus', icon: LayoutDashboard, locked: true, requiredPlan: 'PROFESSIONAL', description: 'Centro de Comando' },
];

/**
 * MENU NAVIGATOR V2 (R$ 697/mês → R$ 1.997/mês)
 * Filosofia: Mesmo layout modular do Professional, mas apenas ENTENDER + RECUPERAR
 * Clara com 100 msgs/dia, foco em diagnóstico completo e recuperação de créditos
 * 2 CNPJs permitidos
 */
export const MENU_NAVIGATOR: MenuElement[] = [
  // Clara AI no topo
  {
    title: '',
    items: [
      { ...CLARA_AI_ITEM, badge: '100/dia', description: 'Análise e recuperação' },
    ]
  },
  // HOME
  {
    title: '',
    items: [
      { label: 'Home', href: '/dashboard/home', icon: Home },
    ]
  },
  // Módulo ENTENDER
  {
    title: 'ENTENDER',
    collapsible: true,
    moduleHref: '/dashboard/entender',
    items: [
      { label: 'DRE Inteligente', href: '/dashboard/entender/dre', icon: BarChart3, description: 'Base para análises' },
      { label: 'Score Tributário', href: '/dashboard/entender/score', icon: Trophy, description: 'Diagnóstico 0-1000' },
      { label: 'Comparativo de Regimes Tributários', href: '/dashboard/entender/comparativo', icon: Scale, description: '5 regimes tributários', badge: '2027' },
    ]
  },
  // Módulo RECUPERAR
  {
    title: 'RECUPERAR',
    collapsible: true,
    moduleHref: '/dashboard/recuperar',
    items: [
      { label: 'Radar de Créditos', href: '/dashboard/recuperar/radar', icon: FileText, description: 'Análise de XMLs' },
    ]
  },
  // Módulo PLANEJAR
  {
    title: 'PLANEJAR',
    collapsible: true,
    moduleHref: '/dashboard/planejar',
    items: [
      { label: 'Oportunidades Tributárias', href: '/dashboard/planejar/oportunidades', icon: Lightbulb, badge: '61+' },
      { label: 'Planejamento Tributário', href: '/dashboard/planejar/planejamento', icon: Route, badge: 'Em breve' },
    ]
  },
  // PIT - Prazos Importantes Tributários
  {
    title: 'PIT',
    collapsible: true,
    items: [
      { label: 'Timeline 2026-2033', href: '/dashboard/timeline-reforma', icon: MapPin },
      { label: 'Checklist de Prontidão', href: '/dashboard/checklist-reforma', icon: ClipboardCheck },
    ]
  },
  { type: 'divider' as const },
  // Preview de ferramentas PRO (FOMO para Professional)
  {
    title: 'Ferramentas Pro',
    items: [
      { label: 'NEXUS', href: '/upgrade?feature=nexus', icon: LayoutDashboard, locked: true, description: 'Centro de Comando' },
      { label: 'Margem Ativa', href: '/upgrade?feature=margem', icon: Target, locked: true, description: 'Precificação inteligente' },
      { label: 'PriceGuard', href: '/upgrade?feature=priceguard', icon: Shield, locked: true, description: 'Proteção de preços' },
    ]
  },
  { type: 'divider' as const },
  // Seções secundárias
  {
    title: '',
    items: [
      { label: 'Notícias', href: '/noticias', icon: Newspaper, description: 'Reforma Tributária' },
      { label: 'Conexão & Negócios', href: '/dashboard/conexao', icon: Handshake, description: 'Comunidade e networking' },
      { label: 'Indique e Ganhe', href: '/indicar', icon: Gift, badge: 'Até 20%', badgeVariant: 'success', description: 'Ganhe desconto indicando' },
      { label: 'Integrações', href: '/dashboard/integracoes', icon: Plug },
      { label: 'Configurações', href: '/configuracoes', icon: Settings },
    ]
  },
];

/**
 * MENU PROFESSIONAL V2 (R$ 2.997/mês)
 * Nova estrutura por módulos de objetivo de negócio
 * Clara ilimitada, navegação por objetivos
 */
export const MENU_PROFESSIONAL_V2: MenuElement[] = [
  // Clara AI no topo
  {
    title: '',
    items: [
      { ...CLARA_AI_ITEM, badge: '∞', badgeVariant: 'success', description: 'Copiloto tributário ilimitado' },
    ]
  },
  // HOME
  {
    title: '',
    items: [
      { label: 'Home', href: '/dashboard/home', icon: Home },
    ]
  },
  // Módulo ENTENDER
  {
    title: 'ENTENDER',
    collapsible: true,
    moduleHref: '/dashboard/entender',
    items: [
      { label: 'DRE Inteligente', href: '/dashboard/entender/dre', icon: BarChart3, description: 'Base para análises' },
      { label: 'Score Tributário', href: '/dashboard/entender/score', icon: Trophy, description: 'Diagnóstico 0-1000' },
      { label: 'Comparativo de Regimes Tributários', href: '/dashboard/entender/comparativo', icon: Scale, description: '5 regimes tributários', badge: '2027' },
    ]
  },
  // Módulo PRECIFICAR
  {
    title: 'PRECIFICAR',
    collapsible: true,
    moduleHref: '/dashboard/precificacao',
    items: [
      { label: 'Margem Ativa', href: '/dashboard/precificacao/margem', icon: Target, description: 'Análise por NCM' },
      { label: 'Split Payment', href: '/dashboard/precificacao/split', icon: Wallet, description: 'Impacto 2026' },
      { label: 'PriceGuard', href: '/dashboard/precificacao/priceguard', icon: Shield, badge: 'Novo' },
    ]
  },
  // Módulo RECUPERAR
  {
    title: 'RECUPERAR',
    collapsible: true,
    moduleHref: '/dashboard/recuperar',
    items: [
      { label: 'Radar de Créditos', href: '/dashboard/recuperar/radar', icon: FileText, description: 'Análise de XMLs' },
    ]
  },
  // Módulo PLANEJAR
  {
    title: 'PLANEJAR',
    collapsible: true,
    moduleHref: '/dashboard/planejar',
    items: [
      { label: 'Oportunidades Tributárias', href: '/dashboard/planejar/oportunidades', icon: Lightbulb, badge: '61+' },
      { label: 'Planejamento Tributário', href: '/dashboard/planejar/planejamento', icon: Route, badge: 'Em breve' },
    ]
  },
  // Módulo COMANDAR
  {
    title: 'COMANDAR',
    collapsible: true,
    moduleHref: '/dashboard/comandar',
    items: [
      { label: 'NEXUS', href: '/dashboard/comandar/nexus', icon: LayoutDashboard, featured: true, badge: '8 KPIs' },
      { label: 'Valuation', href: '/dashboard/comandar/valuation', icon: TrendingUp, description: 'Estimativa de valor', badge: '3 métodos' },
      { label: 'Relatórios PDF', href: '/dashboard/comandar/relatorios', icon: FileText },
    ]
  },
  { type: 'divider' as const },
  // Seções secundárias
  {
    title: '',
    items: [
      { label: 'Notícias', href: '/noticias', icon: Newspaper, description: 'Reforma Tributária' },
      { label: 'Conexão & Negócios', href: '/dashboard/conexao', icon: Handshake, description: 'Comunidade e networking' },
      { label: 'Indique e Ganhe', href: '/indicar', icon: Gift, badge: 'Até 20%', badgeVariant: 'success', description: 'Ganhe desconto indicando' },
      { label: 'Integrações', href: '/dashboard/integracoes', icon: Plug },
      { label: 'Configurações', href: '/configuracoes', icon: Settings },
    ]
  },
];

/**
 * MENU PROFESSIONAL (Legacy - mantido para compatibilidade)
 */
export const MENU_PROFESSIONAL: MenuElement[] = MENU_PROFESSIONAL_V2;

// Mapeamento de planos legados para novos
export const LEGACY_PLAN_MAP: Record<string, PlanType> = {
  'FREE': 'STARTER',
  'BASICO': 'NAVIGATOR',
  'PROFISSIONAL': 'PROFESSIONAL',
  'PREMIUM': 'ENTERPRISE',
  'STARTER': 'STARTER',
  'NAVIGATOR': 'NAVIGATOR',
  'PROFESSIONAL': 'PROFESSIONAL',
  'ENTERPRISE': 'ENTERPRISE',
};

export const PLAN_HIERARCHY: Record<PlanType, number> = {
  'STARTER': 0,
  'NAVIGATOR': 1,
  'PROFESSIONAL': 2,
  'ENTERPRISE': 3,
};

export const PLAN_LABELS: Record<PlanType, string> = {
  'STARTER': 'Starter',
  'NAVIGATOR': 'Navigator',
  'PROFESSIONAL': 'Professional',
  'ENTERPRISE': 'Enterprise',
};

export function getMenuForPlan(plan: PlanType): MenuElement[] {
  switch (plan) {
    case 'PROFESSIONAL':
    case 'ENTERPRISE':
      return MENU_PROFESSIONAL_V2;
    case 'NAVIGATOR':
      return MENU_NAVIGATOR;
    case 'STARTER':
    default:
      return MENU_STARTER;
  }
}

export function getDefaultRouteForPlan(plan: PlanType): string {
  switch (plan) {
    case 'PROFESSIONAL':
    case 'ENTERPRISE':
    case 'NAVIGATOR':  // Navigator agora usa Home Inteligente
    case 'STARTER':    // Starter também usa Home Inteligente
      return '/dashboard/home';
    default:
      return '/dashboard/score-tributario';
  }
}

export function getUpgradeCTA(currentPlan: PlanType): { label: string; targetPlan: PlanType; href: string } | null {
  switch (currentPlan) {
    case 'STARTER':
      return { label: 'Upgrade → Navigator', targetPlan: 'NAVIGATOR', href: '/upgrade' };
    case 'NAVIGATOR':
      return { label: 'Upgrade → Professional', targetPlan: 'PROFESSIONAL', href: '/upgrade' };
    default:
      return null;
  }
}

// Feature highlights para página de upgrade
export const FEATURE_HIGHLIGHTS: Record<string, { title: string; description: string; icon: React.ComponentType<{ className?: string }>; value: string }> = {
  nexus: {
    title: 'NEXUS Command Center',
    description: '8 KPIs executivos em tempo real',
    icon: LayoutDashboard,
    value: 'Visão consolidada do impacto da Reforma no seu negócio'
  },
  radar: {
    title: 'Radar de Créditos',
    description: 'Identifique créditos tributários automaticamente',
    icon: FileText,
    value: 'Empresas encontram em média R$ 30-50k em créditos não aproveitados'
  },
  dre: {
    title: 'DRE Inteligente',
    description: 'Demonstrativo com impacto da Reforma na margem',
    icon: BarChart3,
    value: 'Veja exatamente como CBS/IBS afetam seu lucro líquido'
  },
  noticias: {
    title: 'Notícias da Reforma',
    description: 'Atualizações diárias sobre a Reforma Tributária',
    icon: Newspaper,
    value: 'Fique por dentro de todas as mudanças que afetam seu negócio'
  },
  comunidade: {
    title: 'TribuTalks Connect',
    description: 'Comunidade exclusiva Professional+',
    icon: Users,
    value: 'Networking com outros empresários e especialistas tributários'
  },
};
