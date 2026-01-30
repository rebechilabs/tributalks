import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, X, Home, Scale, Wallet, FileText, Users, Calendar, 
  Clock, Settings, Lock, Sparkles, Newspaper, Calculator,
  Target, BarChart3, Trophy, Lightbulb, LayoutDashboard, MapPin, 
  Briefcase, ClipboardCheck, Gift, Route, FileSearch, Plug
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import logoTributalks from "@/assets/logo-tributalks.png";
import { cn } from "@/lib/utils";
import { NewsletterForm } from "@/components/common/NewsletterForm";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPlan?: 'STARTER' | 'NAVIGATOR' | 'PROFESSIONAL' | 'ENTERPRISE';
  badge?: string;
}

interface NavGroup {
  title: string;
  stepNumber?: number;
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
    title: 'Etapa 1: Entender',
    stepNumber: 1,
    items: [
      { label: 'Score Tributário', href: '/dashboard/score-tributario', icon: Trophy },
      { label: 'Clara AI', href: '/tribubot', icon: Sparkles, badge: 'IA' },
    ]
  },
  {
    title: 'Etapa 2: Simular',
    stepNumber: 2,
    items: [
      { label: 'Split Payment', href: '/calculadora/split-payment', icon: Wallet },
      { label: 'Comparativo de Regimes', href: '/calculadora/comparativo-regimes', icon: Scale },
      { label: 'Calculadora RTC', href: '/calculadora/rtc', icon: Calculator, badge: 'NCM' },
      { label: 'Calculadora Serviços', href: '/calculadora/servicos', icon: Briefcase, requiredPlan: 'NAVIGATOR', badge: 'NBS' },
    ]
  },
  {
    title: 'Etapa 3: Diagnosticar',
    stepNumber: 3,
    items: [
      { label: 'DRE Inteligente', href: '/dashboard/dre', icon: BarChart3, requiredPlan: 'PROFESSIONAL' },
      { label: 'Análise de Créditos', href: '/dashboard/analise-notas', icon: FileText, requiredPlan: 'PROFESSIONAL' },
      { label: 'Oportunidades Fiscais', href: '/dashboard/oportunidades', icon: Lightbulb, requiredPlan: 'PROFESSIONAL' },
      { label: 'Suíte Margem Ativa', href: '/dashboard/margem-ativa', icon: Target, requiredPlan: 'PROFESSIONAL' },
    ]
  },
  {
    title: 'Etapa 4: Comandar',
    stepNumber: 4,
    items: [
      { label: 'NEXUS', href: '/dashboard/nexus', icon: LayoutDashboard, requiredPlan: 'PROFESSIONAL', badge: 'Novo' },
      { label: 'Painel Executivo', href: '/dashboard/executivo', icon: LayoutDashboard, requiredPlan: 'ENTERPRISE' },
    ]
  },
  {
    title: 'GPS da Reforma',
    items: [
      { label: 'Timeline 2026-2033', href: '/dashboard/timeline-reforma', icon: MapPin },
      { label: 'Notícias da Reforma', href: '/noticias', icon: Newspaper, requiredPlan: 'NAVIGATOR' },
      { label: 'Checklist de Prontidão', href: '/dashboard/checklist-reforma', icon: ClipboardCheck, requiredPlan: 'NAVIGATOR' },
    ]
  },
  {
    title: 'IA e Documentos',
    items: [
      { label: 'Analisador de Documentos', href: '/dashboard/analisador-documentos', icon: FileSearch, requiredPlan: 'NAVIGATOR' },
      { label: 'Workflows', href: '/dashboard/workflows', icon: Route, requiredPlan: 'NAVIGATOR' },
      { label: 'Comunidade', href: '/comunidade', icon: Users, requiredPlan: 'NAVIGATOR' },
      { label: 'Indicar Amigos', href: '/indicar', icon: Gift, badge: 'Novo' },
    ]
  },
  {
    title: 'Integrações',
    items: [
      { label: 'Conectar ERP', href: '/dashboard/integracoes', icon: Plug, requiredPlan: 'PROFESSIONAL' },
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

// Mapeamento de planos legados para novos
const LEGACY_PLAN_MAP: Record<string, string> = {
  'FREE': 'STARTER',
  'BASICO': 'NAVIGATOR',
  'PROFISSIONAL': 'PROFESSIONAL',
  'PREMIUM': 'ENTERPRISE',
  'STARTER': 'STARTER',
  'NAVIGATOR': 'NAVIGATOR',
  'PROFESSIONAL': 'PROFESSIONAL',
  'ENTERPRISE': 'ENTERPRISE',
};

const PLAN_HIERARCHY: Record<string, number> = {
  'STARTER': 0,
  'NAVIGATOR': 1,
  'PROFESSIONAL': 2,
  'ENTERPRISE': 3,
};

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { profile } = useAuth();
  const rawPlan = profile?.plano || 'STARTER';
  const currentPlan = LEGACY_PLAN_MAP[rawPlan] || 'STARTER';

  const hasAccess = (requiredPlan?: string) => {
    if (!requiredPlan) return true;
    const userLevel = PLAN_HIERARCHY[currentPlan] || 0;
    const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 0;
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
          <img src={logoTributalks} alt="TribuTalks" className="h-8 w-auto" />
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
                  <div className="flex items-center gap-2 px-3 py-2">
                    {group.stepNumber && (
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                        {group.stepNumber}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.stepNumber ? group.title.replace(/Etapa \d: /, '') : group.title}
                    </span>
                  </div>
                </>
              )}
              {/* Group Items */}
              <div className="space-y-1">
                {group.items.map(renderNavItem)}
              </div>
              
              {/* Newsletter após o grupo "IA e Documentos" */}
              {group.title === 'IA e Documentos' && (
                <div className="mt-2 mx-1 p-2 rounded-lg bg-muted/30 border border-border/50">
                  <NewsletterForm variant="compact" />
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Upgrade CTA */}
        {currentPlan === 'STARTER' && (
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
