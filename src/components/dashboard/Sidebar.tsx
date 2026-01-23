import { Link, useLocation } from "react-router-dom";
import { 
  Home, Scale, Wallet, Bot, FileText, Users, Calendar, 
  Clock, Settings, Lock, ChevronUp, Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoTributech from "@/assets/logo-tributech.png";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPlan?: 'BASICO' | 'PROFISSIONAL' | 'PREMIUM';
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Comparativo de Regimes', href: '/calculadora/comparativo-regimes', icon: Scale },
  { label: 'Split Payment', href: '/calculadora/split-payment', icon: Wallet },
  { label: 'TribuBot', href: '/tribubot', icon: Bot, requiredPlan: 'BASICO', badge: 'IA' },
  { label: 'Relatórios PDF', href: '/relatorios', icon: FileText, requiredPlan: 'PROFISSIONAL' },
  { label: 'Comunidade', href: '/comunidade', icon: Users, requiredPlan: 'PROFISSIONAL' },
  { label: 'Consultorias', href: '/consultorias', icon: Calendar, requiredPlan: 'PREMIUM' },
];

const secondaryNavItems: NavItem[] = [
  { label: 'Histórico', href: '/historico', icon: Clock },
  { label: 'Configurações', href: '/configuracoes', icon: Settings },
];

const PLAN_HIERARCHY = {
  'FREE': 0,
  'BASICO': 1,
  'PROFISSIONAL': 2,
  'PREMIUM': 3,
};

export function Sidebar() {
  const location = useLocation();
  const { profile } = useAuth();
  const currentPlan = profile?.plano || 'FREE';

  const hasAccess = (requiredPlan?: string) => {
    if (!requiredPlan) return true;
    const userLevel = PLAN_HIERARCHY[currentPlan as keyof typeof PLAN_HIERARCHY] || 0;
    const requiredLevel = PLAN_HIERARCHY[requiredPlan as keyof typeof PLAN_HIERARCHY] || 0;
    return userLevel >= requiredLevel;
  };

  const getPlanLabel = () => {
    const labels: Record<string, string> = {
      'FREE': 'Grátis',
      'BASICO': 'Básico',
      'PROFISSIONAL': 'Profissional',
      'PREMIUM': 'Premium',
    };
    return labels[currentPlan] || 'Grátis';
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
        {/* Main Nav */}
        {mainNavItems.map((item) => {
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
        })}

        {/* Divider */}
        <div className="my-4 border-t border-border" />

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
