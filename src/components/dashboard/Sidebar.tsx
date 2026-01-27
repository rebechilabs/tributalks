import { Link, useLocation } from "react-router-dom";
import { 
  Home, Scale, Wallet, Bot, FileText, Users, Calendar, 
  Clock, Settings, Lock, Sparkles, Newspaper,
  Upload, Calculator, Target, BarChart3, Trophy, Lightbulb, LayoutDashboard,
  MapPin, ShieldCheck, FileSearch, Route, Briefcase
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoTributech from "@/assets/logo-tributech.png";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPlan?: 'NAVIGATOR' | 'PROFESSIONAL' | 'ENTERPRISE';
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: '',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: Home },
    ]
  },
  {
    title: 'GPS da Reforma',
    items: [
      { label: 'TribuBot', href: '/tribubot', icon: Bot, requiredPlan: 'NAVIGATOR', badge: 'IA' },
      { label: 'Notícias da Reforma', href: '/noticias', icon: Newspaper, requiredPlan: 'NAVIGATOR' },
      { label: 'Timeline 2026-2033', href: '/dashboard/timeline-reforma', icon: MapPin, requiredPlan: 'NAVIGATOR' },
    ]
  },
  {
    title: 'Calculadoras',
    items: [
      { label: 'Score Tributário', href: '/dashboard/score-tributario', icon: Trophy },
      { label: 'Split Payment', href: '/calculadora/split-payment', icon: Wallet },
      { label: 'Comparativo de Regimes', href: '/calculadora/comparativo-regimes', icon: Scale },
      { label: 'Calculadora RTC', href: '/calculadora/rtc', icon: Calculator, badge: 'NCM' },
      { label: 'Calculadora Serviços', href: '/calculadora/servicos', icon: Briefcase, badge: 'NBS' },
    ]
  },
  {
    title: 'Diagnóstico',
    items: [
      { label: 'Importar XMLs', href: '/dashboard/importar-xml', icon: Upload, requiredPlan: 'PROFESSIONAL' },
      { label: 'Radar de Créditos', href: '/dashboard/radar-creditos', icon: Target, requiredPlan: 'PROFESSIONAL' },
      { label: 'DRE Inteligente', href: '/dashboard/dre', icon: BarChart3, requiredPlan: 'PROFESSIONAL' },
      { label: 'Oportunidades', href: '/dashboard/oportunidades', icon: Lightbulb, requiredPlan: 'PROFESSIONAL' },
    ]
  },
  {
    title: 'Documentos',
    items: [
      { label: 'Analisador de Documentos', href: '/dashboard/analisador-documentos', icon: FileSearch, requiredPlan: 'NAVIGATOR', badge: 'Novo' },
      { label: 'Workflows', href: '/dashboard/workflows', icon: Route, requiredPlan: 'NAVIGATOR', badge: 'Novo' },
      { label: 'Comunidade', href: '/comunidade', icon: Users, requiredPlan: 'PROFESSIONAL' },
    ]
  },
  {
    title: 'Enterprise',
    items: [
      { label: 'Painel Executivo', href: '/dashboard/executivo', icon: LayoutDashboard, requiredPlan: 'ENTERPRISE' },
      { label: 'Consultorias', href: '/consultorias', icon: Calendar, requiredPlan: 'ENTERPRISE' },
    ]
  },
];

const secondaryNavItems: NavItem[] = [
  { label: 'Histórico', href: '/historico', icon: Clock },
  { label: 'Configurações', href: '/configuracoes', icon: Settings },
];

// Mapeamento de planos legados para novos
const LEGACY_PLAN_MAP: Record<string, string> = {
  'FREE': 'FREE',
  'BASICO': 'NAVIGATOR',
  'PROFISSIONAL': 'PROFESSIONAL',
  'PREMIUM': 'ENTERPRISE',
  'NAVIGATOR': 'NAVIGATOR',
  'PROFESSIONAL': 'PROFESSIONAL',
  'ENTERPRISE': 'ENTERPRISE',
};

const PLAN_HIERARCHY: Record<string, number> = {
  'FREE': 0,
  'NAVIGATOR': 1,
  'PROFESSIONAL': 2,
  'ENTERPRISE': 3,
};

export function Sidebar() {
  const location = useLocation();
  const { profile } = useAuth();
  const rawPlan = profile?.plano || 'FREE';
  const currentPlan = LEGACY_PLAN_MAP[rawPlan] || 'FREE';

  const hasAccess = (requiredPlan?: string) => {
    if (!requiredPlan) return true;
    const userLevel = PLAN_HIERARCHY[currentPlan] || 0;
    const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 0;
    return userLevel >= requiredLevel;
  };

  const getPlanLabel = () => {
    const labels: Record<string, string> = {
      'FREE': 'Grátis',
      'NAVIGATOR': 'Navigator',
      'PROFESSIONAL': 'Professional',
      'ENTERPRISE': 'Enterprise',
    };
    return labels[currentPlan] || 'Grátis';
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.href;
    const canAccess = hasAccess(item.requiredPlan);

    if (!canAccess) {
      return (
        <div
          key={item.href}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground/50 cursor-not-allowed"
        >
          <Lock className="w-4 h-4" />
          <span className="flex-1 text-sm">{item.label}</span>
          {item.badge && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {item.badge}
            </span>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
          isActive
            ? "bg-primary/10 text-primary border-l-2 border-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Icon className="w-4 h-4" />
        <span className="flex-1 text-sm font-medium">{item.label}</span>
        {item.badge && (
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded",
            isActive ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"
          )}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-card border-r border-border">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src={logoTributech} alt="TribuTech" className="h-8 w-auto" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navGroups.map((group, index) => (
          <div key={group.title || 'home'} className="mb-2">
            {/* Group Title */}
            {group.title && (
              <>
                {index > 0 && <Separator className="my-3" />}
                <span className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.title}
                </span>
              </>
            )}
            {/* Group Items */}
            <div className="space-y-1">
              {group.items.map(renderNavItem)}
            </div>
          </div>
        ))}

        {/* Divider */}
        <Separator className="my-3" />

        {/* Secondary Nav */}
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Plan Badge */}
      <div className="p-4 border-t border-border">
        <div className="p-3 rounded-lg bg-muted">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Seu plano</span>
            <span className="text-xs font-medium text-primary">{getPlanLabel()}</span>
          </div>
          {currentPlan === 'FREE' && (
            <Link
              to="/#planos"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Fazer upgrade
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
