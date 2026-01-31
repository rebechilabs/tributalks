import { 
  Home, Scale, Wallet, FileText, Users, Calendar, 
  Clock, Settings, Lock, Sparkles, Newspaper,
  Calculator, Target, BarChart3, Trophy, Lightbulb, LayoutDashboard,
  MapPin, Briefcase, ClipboardCheck, Plug, Gift, Route, FileSearch,
  ArrowUp, Command
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
}

export interface MenuDivider {
  type: 'divider';
}

export type MenuElement = MenuGroup | MenuDivider;

// Clara AI - Item fixo em TODOS os planos (AI First)
export const CLARA_AI_ITEM: MenuItem = {
  label: 'Clara AI',
  href: '/tribubot',
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
 * MENU PROFESSIONAL (R$ 2.997/mês)
 * Filosofia: Comando executivo
 * Clara ilimitada, NEXUS em destaque, foco em ação
 */
export const MENU_PROFESSIONAL: MenuElement[] = [
  {
    title: '',
    items: [
      { ...CLARA_AI_ITEM, badge: '∞', badgeVariant: 'success', description: 'Copiloto tributário ilimitado' },
    ]
  },
  {
    title: 'Comando',
    items: [
      { label: 'NEXUS', href: '/dashboard/nexus', icon: LayoutDashboard, featured: true, badge: '8 KPIs', description: 'Centro de Comando' },
      { label: 'Dashboard', href: '/dashboard', icon: Home },
    ]
  },
  {
    title: 'Diagnóstico Avançado',
    collapsible: true,
    items: [
      { label: 'Radar de Créditos', href: '/dashboard/analise-notas', icon: FileText, description: 'Identifique créditos' },
      { label: 'DRE Inteligente', href: '/dashboard/dre', icon: BarChart3, description: 'Impacto na margem' },
      { label: 'Oportunidades Fiscais', href: '/dashboard/oportunidades', icon: Lightbulb, badge: '61+' },
      { label: 'Suíte Margem Ativa', href: '/dashboard/margem-ativa', icon: Target },
    ]
  },
  {
    title: 'Simuladores',
    collapsible: true,
    items: [
      { label: 'Calculadora RTC', href: '/calculadora/rtc', icon: Calculator },
      { label: 'Calculadora NBS', href: '/calculadora/servicos', icon: Briefcase },
      { label: 'Split Payment', href: '/calculadora/split-payment', icon: Wallet },
      { label: 'Comparativo de Regimes', href: '/calculadora/comparativo-regimes', icon: Scale },
    ]
  },
  {
    title: 'Integrações',
    items: [
      { label: 'Conectar ERP', href: '/dashboard/integracoes', icon: Plug },
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
      return MENU_PROFESSIONAL;
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
      return '/dashboard/nexus';
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
