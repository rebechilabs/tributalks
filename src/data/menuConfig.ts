import { 
  Home, Scale, Wallet, FileText, Users, Calendar, 
  Clock, Settings, Lock, Sparkles, Newspaper,
  Calculator, Target, BarChart3, Trophy, Lightbulb, LayoutDashboard,
  MapPin, Briefcase, ClipboardCheck, Plug, Gift, Route, FileSearch,
  ArrowUp, Command, Shield
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
 * MENU STARTER (R$ 397/mês)
 * Filosofia: Educacional e exploratório
 * Clara com limite de 20 msgs/dia, foco em Score e Calculadoras básicas
 */
export const MENU_STARTER: MenuElement[] = [
  {
    title: '',
    items: [
      { ...CLARA_AI_ITEM, badge: '20/dia', description: 'Pergunte sobre a Reforma' },
    ]
  },
  {
    title: 'Diagnóstico',
    items: [
      { label: 'Meu Score', href: '/dashboard/score-tributario', icon: Trophy, description: 'Avaliação fiscal' },
      { label: 'Dashboard', href: '/dashboard', icon: Home },
    ]
  },
  {
    title: 'Simuladores',
    collapsible: true,
    items: [
      { label: 'Calculadora RTC', href: '/calculadora/rtc', icon: Calculator, badge: 'NCM' },
      { label: 'Split Payment', href: '/calculadora/split-payment', icon: Wallet },
      { label: 'Comparativo de Regimes', href: '/calculadora/comparativo-regimes', icon: Scale },
    ]
  },
  {
    title: 'PIT',
    items: [
      { label: 'Timeline 2026-2033', href: '/dashboard/timeline-reforma', icon: MapPin },
    ]
  },
  { type: 'divider' as const },
  {
    title: '',
    items: [
      { label: 'Configurações', href: '/configuracoes', icon: Settings },
    ]
  },
];

// Itens bloqueados para Navigator (cria FOMO)
export const STARTER_LOCKED_PREVIEW: MenuItem[] = [
  { label: 'Notícias da Reforma', href: '/upgrade?feature=noticias', icon: Newspaper, locked: true, requiredPlan: 'NAVIGATOR', description: 'Atualizações diárias' },
  { label: 'Comunidade', href: '/upgrade?feature=comunidade', icon: Users, locked: true, requiredPlan: 'NAVIGATOR', description: 'Circle exclusivo' },
  { label: 'NEXUS', href: '/upgrade?feature=nexus', icon: LayoutDashboard, locked: true, requiredPlan: 'PROFESSIONAL', description: 'Centro de Comando' },
];

/**
 * MENU NAVIGATOR (R$ 1.297/mês)
 * Filosofia: Monitoramento ativo
 * Clara com 60 msgs/dia, adiciona conteúdo e comunidade
 * Ferramentas Professional aparecem bloqueadas (FOMO)
 */
export const MENU_NAVIGATOR: MenuElement[] = [
  {
    title: '',
    items: [
      { ...CLARA_AI_ITEM, badge: '60/dia', description: 'Tire dúvidas complexas' },
    ]
  },
  {
    title: 'Diagnóstico',
    items: [
      { label: 'Meu Score', href: '/dashboard/score-tributario', icon: Trophy },
      { label: 'Dashboard', href: '/dashboard', icon: Home },
    ]
  },
  {
    title: 'Simuladores',
    collapsible: true,
    items: [
      { label: 'Calculadora RTC', href: '/calculadora/rtc', icon: Calculator, badge: 'NCM' },
      { label: 'Calculadora NBS', href: '/calculadora/servicos', icon: Briefcase, badge: 'Serviços' },
      { label: 'Split Payment', href: '/calculadora/split-payment', icon: Wallet },
      { label: 'Comparativo de Regimes', href: '/calculadora/comparativo-regimes', icon: Scale },
    ]
  },
  {
    title: 'PIT',
    items: [
      { label: 'Notícias da Reforma', href: '/noticias', icon: Newspaper, badge: 'Novo' },
      { label: 'Timeline 2026-2033', href: '/dashboard/timeline-reforma', icon: MapPin },
      { label: 'Checklist de Prontidão', href: '/dashboard/checklist-reforma', icon: ClipboardCheck },
    ]
  },
  {
    title: 'Central Inteligente',
    items: [
      { label: 'Analisador de Documentos', href: '/dashboard/analisador-documentos', icon: FileSearch },
      { label: 'Workflows', href: '/dashboard/workflows', icon: Route },
      { label: 'Comunidade', href: '/comunidade', icon: Users },
    ]
  },
  { type: 'divider' as const },
  {
    title: 'Ferramentas Pro',
    items: [
      { label: 'NEXUS', href: '/upgrade?feature=nexus', icon: LayoutDashboard, locked: true, description: 'Centro de Comando - 8 KPIs' },
      { label: 'Radar de Créditos', href: '/upgrade?feature=radar', icon: FileText, locked: true, description: 'Análise automática de XMLs' },
      { label: 'DRE Inteligente', href: '/upgrade?feature=dre', icon: BarChart3, locked: true, description: 'Impacto na margem' },
    ]
  },
  { type: 'divider' as const },
  {
    title: '',
    items: [
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
    title: 'ENTENDER MEU NEGÓCIO',
    collapsible: true,
    moduleHref: '/dashboard/entender',
    items: [
      { label: 'DRE Inteligente', href: '/dashboard/entender/dre', icon: BarChart3, description: 'Base para análises' },
      { label: 'Score Tributário', href: '/dashboard/entender/score', icon: Trophy, description: 'Diagnóstico 0-1000' },
      { label: 'Comparativo de Regimes', href: '/dashboard/entender/comparativo', icon: Scale, description: 'Simule regimes' },
    ]
  },
  // Módulo RECUPERAR
  {
    title: 'RECUPERAR CRÉDITOS',
    collapsible: true,
    moduleHref: '/dashboard/recuperar',
    items: [
      { label: 'Radar de Créditos', href: '/dashboard/recuperar/radar', icon: FileText, description: 'Análise de XMLs' },
      { label: 'Oportunidades Fiscais', href: '/dashboard/recuperar/oportunidades', icon: Lightbulb, badge: '61+' },
    ]
  },
  // Módulo PRECIFICAÇÃO
  {
    title: 'PRECIFICAÇÃO',
    collapsible: true,
    moduleHref: '/dashboard/precificacao',
    items: [
      { label: 'Margem Ativa', href: '/dashboard/precificacao/margem', icon: Target, description: 'Análise por NCM' },
      { label: 'Split Payment', href: '/dashboard/precificacao/split', icon: Wallet, description: 'Impacto 2026' },
      { label: 'PriceGuard', href: '/dashboard/precificacao/priceguard', icon: Shield, badge: 'Novo' },
    ]
  },
  // Módulo COMANDAR
  {
    title: 'COMANDAR',
    collapsible: true,
    moduleHref: '/dashboard/comandar',
    items: [
      { label: 'NEXUS', href: '/dashboard/comandar/nexus', icon: LayoutDashboard, featured: true, badge: '8 KPIs' },
      { label: 'Relatórios PDF', href: '/dashboard/comandar/relatorios', icon: FileText },
    ]
  },
  { type: 'divider' as const },
  // Seções secundárias
  {
    title: '',
    items: [
      { label: 'Newsletter', href: '/noticias', icon: Newspaper, description: 'Toda terça às 07h07' },
      { label: 'Comunidade', href: '/comunidade', icon: Users, description: 'Conexões e negócios' },
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
      return '/dashboard/home';
    case 'NAVIGATOR':
      return '/dashboard';
    case 'STARTER':
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
