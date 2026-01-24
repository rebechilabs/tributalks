import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, X, Home, Scale, Wallet, Bot, FileText, Users, Calendar, 
  Clock, Settings, Lock, Sparkles, Newspaper, Upload, Calculator,
  Target, BarChart3, Trophy, Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
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
    title: 'Calculadoras',
    items: [
      { label: 'Calculadora RTC', href: '/calculadora/rtc', icon: Calculator, badge: 'API' },
      { label: 'Comparativo de Regimes', href: '/calculadora/comparativo-regimes', icon: Scale },
      { label: 'Split Payment', href: '/calculadora/split-payment', icon: Wallet },
    ]
  },
  {
    title: 'XMLs e Créditos',
    items: [
      { label: 'Importar XMLs', href: '/dashboard/importar-xml', icon: Upload },
      { label: 'Radar de Créditos', href: '/dashboard/radar-creditos', icon: Target, badge: 'Novo' },
    ]
  },
  {
    title: 'Análise Financeira',
    items: [
      { label: 'DRE Inteligente', href: '/dashboard/dre', icon: BarChart3, badge: 'Novo' },
      { label: 'Score Tributário', href: '/dashboard/score-tributario', icon: Trophy, badge: 'Novo' },
      { label: 'Oportunidades', href: '/dashboard/oportunidades', icon: Lightbulb, badge: 'Novo' },
    ]
  },
  {
    title: 'Conteúdo e IA',
    items: [
      { label: 'Notícias', href: '/noticias', icon: Newspaper, requiredPlan: 'BASICO' },
      { label: 'TribuBot', href: '/tribubot', icon: Bot, requiredPlan: 'BASICO', badge: 'IA' },
    ]
  },
  {
    title: 'Premium',
    items: [
      { label: 'Relatórios PDF', href: '/relatorios', icon: FileText, requiredPlan: 'PROFISSIONAL' },
      { label: 'Comunidade', href: '/comunidade', icon: Users, requiredPlan: 'PROFISSIONAL' },
      { label: 'Consultorias', href: '/consultorias', icon: Calendar, requiredPlan: 'PREMIUM' },
    ]
  },
  {
    title: 'Conta',
    items: [
      { label: 'Histórico', href: '/historico', icon: Clock },
      { label: 'Configurações', href: '/configuracoes', icon: Settings },
    ]
  },
];

const PLAN_HIERARCHY = {
  'FREE': 0,
  'BASICO': 1,
  'PROFISSIONAL': 2,
  'PREMIUM': 3,
};

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { profile } = useAuth();
  const currentPlan = profile?.plano || 'FREE';

  const hasAccess = (requiredPlan?: string) => {
    if (!requiredPlan) return true;
    const userLevel = PLAN_HIERARCHY[currentPlan as keyof typeof PLAN_HIERARCHY] || 0;
    const requiredLevel = PLAN_HIERARCHY[requiredPlan as keyof typeof PLAN_HIERARCHY] || 0;
    return userLevel >= requiredLevel;
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
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-5 h-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <img src={logoTributech} alt="TribuTech" className="h-8 w-auto" />
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto max-h-[calc(100vh-8rem)]">
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
        </nav>

        {/* Upgrade CTA */}
        {currentPlan === 'FREE' && (
          <div className="p-4 border-t border-border">
            <Link
              to="/#planos"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              Fazer upgrade
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
