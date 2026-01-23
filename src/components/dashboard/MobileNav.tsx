import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, X, Home, Scale, Wallet, Bot, FileText, Users, Calendar, 
  Clock, Settings, Lock, Sparkles, Newspaper
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import logoTributech from "@/assets/logo-tributech.png";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPlan?: 'BASICO' | 'PROFISSIONAL' | 'PREMIUM';
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Notícias', href: '/noticias', icon: Newspaper, requiredPlan: 'BASICO' },
  { label: 'Comparativo de Regimes', href: '/calculadora/comparativo-regimes', icon: Scale },
  { label: 'Split Payment', href: '/calculadora/split-payment', icon: Wallet },
  { label: 'TribuBot', href: '/tribubot', icon: Bot, requiredPlan: 'BASICO' },
  { label: 'Relatórios PDF', href: '/relatorios', icon: FileText, requiredPlan: 'PROFISSIONAL' },
  { label: 'Comunidade', href: '/comunidade', icon: Users, requiredPlan: 'PROFISSIONAL' },
  { label: 'Consultorias', href: '/consultorias', icon: Calendar, requiredPlan: 'PREMIUM' },
  { label: 'Histórico', href: '/historico', icon: Clock },
  { label: 'Configurações', href: '/configuracoes', icon: Settings },
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
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
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
                  <span className="text-sm">{item.label}</span>
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
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
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
