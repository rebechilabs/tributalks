import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, X, Lock, Sparkles, ChevronDown, ArrowUpRight, Command
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { getGroupForPath } from "@/hooks/useRouteInfo";
import logoTributalks from "@/assets/logo-tributalks.png";
import { cn } from "@/lib/utils";
import {
  MenuElement,
  MenuGroup,
  MenuItem,
  PlanType,
  LEGACY_PLAN_MAP,
  PLAN_LABELS,
  getMenuForPlan,
  getUpgradeCTA,
} from "@/data/menuConfig";

function isMenuGroup(element: MenuElement): element is MenuGroup {
  return 'items' in element;
}

// Map group titles to group keys
const GROUP_TITLE_TO_KEY: Record<string, string> = {
  'Diagnóstico': 'diagnostico',
  'Comando': 'comando',
  'Simuladores': 'simuladores',
  'PIT': 'pit',
  'Central Inteligente': 'central',
  'Diagnóstico Avançado': 'avancado',
  'Integrações': 'integracoes',
  'Ferramentas Pro': 'avancado',
  'ENTENDER MEU NEGÓCIO': 'entender',
  'RECUPERAR CRÉDITOS': 'recuperar',
  'PRECIFICAÇÃO': 'precificacao',
  'COMANDAR': 'comandar',
  'CONEXÃO & COMUNICAÇÃO': 'conexao',
};

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const rawPlan = profile?.plano || 'STARTER';
  const currentPlan = (LEGACY_PLAN_MAP[rawPlan] || 'STARTER') as PlanType;
  const menuElements = getMenuForPlan(currentPlan);
  const upgradeCTA = getUpgradeCTA(currentPlan);

  // Get current group from path
  const currentGroupKey = getGroupForPath(location.pathname);

  // Initialize expanded groups - auto-expand the group containing current route
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (currentGroupKey) {
      for (const [title, key] of Object.entries(GROUP_TITLE_TO_KEY)) {
        if (key === currentGroupKey) {
          initial[title] = true;
        }
      }
    }
    return initial;
  });

  // Auto-expand group when route changes
  useEffect(() => {
    if (currentGroupKey) {
      for (const [title, key] of Object.entries(GROUP_TITLE_TO_KEY)) {
        if (key === currentGroupKey) {
          setExpandedGroups(prev => ({ ...prev, [title]: true }));
        }
      }
    }
  }, [currentGroupKey]);

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleClaraShortcut = () => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("openClaraFreeChat"));
  };

  const renderNavItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.href;

    // Item bloqueado
    if (item.locked) {
      return (
        <button
          key={item.href}
          onClick={() => { setOpen(false); navigate(item.href); }}
          className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-muted-foreground/50 hover:bg-muted/50 group"
        >
          <Lock className="w-4 h-4 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-sm block truncate">{item.label}</span>
            {item.description && (
              <span className="text-xs text-muted-foreground/40 block truncate">{item.description}</span>
            )}
          </div>
          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
        </button>
      );
    }

    // Item featured (Clara AI)
    if (item.featured) {
      return (
        <button
          key={item.href}
          onClick={item.shortcut === 'k' ? handleClaraShortcut : () => { setOpen(false); navigate(item.href); }}
          className={cn(
            "flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg",
            "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent",
            "border-l-4 border-primary",
            isActive && "ring-2 ring-primary/30"
          )}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            {item.shortcut && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded bg-muted flex items-center justify-center">
                <Command className="w-2.5 h-2.5 text-muted-foreground" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{item.label}</span>
              {item.badge && (
                <Badge 
                  variant="secondary"
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    item.badgeVariant === 'success' && "bg-green-500/20 text-green-600"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </div>
            {item.description && (
              <span className="text-xs text-muted-foreground block truncate">{item.description}</span>
            )}
          </div>
        </button>
      );
    }

    // Item normal - with enhanced active state
    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
          isActive
            ? "bg-primary/15 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        {/* Active indicator */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
        )}
        <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-primary")} />
        <span className="flex-1 text-sm truncate">{item.label}</span>
        {item.badge && (
          <Badge 
            variant="secondary" 
            className={cn(
              "text-[10px] px-1.5 py-0",
              isActive && "bg-primary/20 text-primary"
            )}
          >
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  const renderMenuGroup = (group: MenuGroup, index: number) => {
    const hasActiveItem = group.items.some(item => location.pathname === item.href);
    const isExpanded = expandedGroups[group.title] ?? (!group.collapsible || hasActiveItem);

    if (!group.title) {
      return (
        <div key={`group-${index}`} className="space-y-1">
          {group.items.map(item => renderNavItem(item))}
        </div>
      );
    }

    if (group.collapsible) {
      return (
        <Collapsible
          key={group.title}
          open={isExpanded}
          onOpenChange={() => toggleGroup(group.title)}
        >
          <CollapsibleTrigger asChild>
            <button className={cn(
              "flex items-center gap-2 px-3 py-2 w-full text-left rounded-lg",
              hasActiveItem && "bg-muted/30"
            )}>
              <span className={cn(
                "text-xs font-semibold uppercase tracking-wider flex-1",
                hasActiveItem ? "text-primary" : "text-muted-foreground"
              )}>
                {group.title}
              </span>
              {hasActiveItem && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1" />
              )}
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                isExpanded && "rotate-180"
              )} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {group.items.map(item => renderNavItem(item))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <div key={group.title} className="space-y-1">
        <div className={cn(
          "px-3 py-2 rounded-lg",
          hasActiveItem && "bg-muted/30"
        )}>
          <span className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            hasActiveItem ? "text-primary" : "text-muted-foreground"
          )}>
            {group.title}
          </span>
        </div>
        {group.items.map(item => renderNavItem(item))}
      </div>
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
        <div className="h-20 flex items-center justify-between px-4 border-b border-border">
          <img src={logoTributalks} alt="TribuTalks" className="h-16 w-auto" />
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto max-h-[calc(100vh-10rem)] space-y-2">
          {menuElements.map((element, index) => {
            if ('type' in element && element.type === 'divider') {
              return <Separator key={`divider-${index}`} className="my-3" />;
            }
            if (isMenuGroup(element)) {
              return renderMenuGroup(element, index);
            }
            return null;
          })}
        </nav>

        {/* Upgrade CTA */}
        <div className="p-4 border-t border-border space-y-3">

          {/* Plan & Upgrade */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Plano: {PLAN_LABELS[currentPlan]}</span>
            {upgradeCTA && (
              <Button asChild size="sm" variant="default" className="h-7 text-xs">
                <Link to={upgradeCTA.href} onClick={() => setOpen(false)}>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Upgrade
                </Link>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
