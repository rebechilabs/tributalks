import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Lock, Sparkles, ChevronDown, ChevronRight, ArrowUpRight, Command
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadNotificationsByCategory } from "@/hooks/useUnreadNotificationsByCategory";
import { useClaraInsights } from "@/hooks/useClaraInsights";
import { getGroupForPath } from "@/hooks/useRouteInfo";
import logoTributalks from "@/assets/logo-tributalks.png";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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

// Map group titles to group keys for v2 navigation
const GROUP_TITLE_TO_KEY: Record<string, string> = {
  'Diagnóstico': 'diagnostico',
  'Comando': 'comando',
  'Simuladores': 'simuladores',
  'PIT': 'pit',
  'Central Inteligente': 'central',
  'Diagnóstico Avançado': 'avancado',
  'Integrações': 'integracoes',
  'Ferramentas Pro': 'avancado',
  // New V2 module groups
  'ENTENDER MEU NEGÓCIO': 'entender',
  'RECUPERAR CRÉDITOS': 'recuperar',
  'PRECIFICAÇÃO': 'precificacao',
  'COMANDAR': 'comandar',
  'CONEXÃO & COMUNICAÇÃO': 'conexao',
};

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { counts: unreadCounts } = useUnreadNotificationsByCategory();
  const { unreadCount: claraInsightsCount } = useClaraInsights();
  const activeItemRef = useRef<HTMLAnchorElement>(null);
  
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
      // Find the group title that matches this key
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

  // Scroll to active item when sidebar loads
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [location.pathname]);

  // Map categories to menu items for notification badges
  const getUnreadForRoute = (href: string): number => {
    if (href === '/noticias') return unreadCounts.reforma;
    if (href === '/indicar') return unreadCounts.indicacao;
    if (href === '/dashboard/oportunidades' || href === '/dashboard/recuperar/oportunidades') return unreadCounts.geral;
    return 0;
  };

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleClaraShortcut = () => {
    window.dispatchEvent(new CustomEvent("openClaraFreeChat"));
  };

  const renderNavItem = (item: MenuItem, isNested = false) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.href;
    const unreadCount = getUnreadForRoute(item.href);

    // Item bloqueado (locked) - redireciona para upgrade
    if (item.locked) {
      return (
        <button
          key={item.href}
          onClick={() => navigate(item.href)}
          className={cn(
            "flex items-center gap-3 w-full text-left rounded-lg transition-all",
            "px-3 py-2.5 text-muted-foreground/50 hover:text-muted-foreground/70 hover:bg-muted/50",
            "cursor-pointer group",
            isNested && "pl-10"
          )}
        >
          <Lock className="w-4 h-4 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-sm block truncate">{item.label}</span>
            {item.description && (
              <span className="text-xs text-muted-foreground/40 block truncate">{item.description}</span>
            )}
          </div>
          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      );
    }

    // Check if this is Clara AI item (has shortcut 'k')
    const isClaraItem = item.shortcut === 'k';
    const hasClaraInsights = isClaraItem && claraInsightsCount > 0;

    // Item em destaque (featured) - Clara AI ou NEXUS
    if (item.featured) {
      return (
        <Link
          key={item.href}
          to={item.href}
          ref={isActive ? activeItemRef : undefined}
          onClick={item.shortcut === 'k' ? (e) => { e.preventDefault(); handleClaraShortcut(); } : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-lg transition-all relative",
            "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent",
            "border-l-4 border-primary",
            "hover:from-primary/15 hover:via-primary/10",
            isActive && "ring-2 ring-primary/30 bg-primary/15"
          )}
        >
          <div className="relative">
            <div className={cn(
              "w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center",
              hasClaraInsights && "ring-2 ring-primary ring-offset-1 ring-offset-background"
            )}>
              <Icon className="w-4 h-4 text-primary" />
            </div>
            {/* Pulse indicator for Clara insights */}
            {hasClaraInsights && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
            {item.shortcut && !hasClaraInsights && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded bg-muted flex items-center justify-center">
                <Command className="w-2.5 h-2.5 text-muted-foreground" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{item.label}</span>
              {hasClaraInsights ? (
                <Badge 
                  variant="default"
                  className="text-[10px] px-1.5 py-0 bg-primary text-primary-foreground animate-pulse"
                >
                  {claraInsightsCount} {claraInsightsCount === 1 ? 'insight' : 'insights'}
                </Badge>
              ) : item.badge ? (
                <Badge 
                  variant={item.badgeVariant === 'success' ? 'default' : 'secondary'}
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    item.badgeVariant === 'success' && "bg-green-500/20 text-green-600 hover:bg-green-500/30"
                  )}
                >
                  {item.badge}
                </Badge>
              ) : null}
            </div>
            {item.description && (
              <span className="text-xs text-muted-foreground block truncate">
                {hasClaraInsights ? 'Clara tem sugestões para você!' : item.description}
              </span>
            )}
          </div>
        </Link>
      );
    }

    // Item normal - with enhanced active state
    return (
      <Link
        key={item.href}
        to={item.href}
        ref={isActive ? activeItemRef : undefined}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
          isActive
            ? "bg-primary/15 text-primary font-medium border-l-3 border-primary shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
          isNested && "pl-10"
        )}
      >
        {/* Active indicator dot */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
        )}
        <div className="relative shrink-0">
          <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
          )}
        </div>
        <span className="flex-1 text-sm truncate">{item.label}</span>
        {unreadCount > 0 ? (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 min-w-[20px] text-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        ) : item.badge ? (
          <Badge 
            variant="secondary"
            className={cn(
              "text-[10px] px-1.5 py-0",
              isActive && "bg-primary/20 text-primary"
            )}
          >
            {item.badge}
          </Badge>
        ) : null}
      </Link>
    );
  };

  const renderMenuGroup = (group: MenuGroup, index: number) => {
    const groupKey = GROUP_TITLE_TO_KEY[group.title] || '';
    const hasActiveItem = group.items.some(item => location.pathname === item.href);
    const isModulePage = group.moduleHref && location.pathname === group.moduleHref;
    const isExpanded = expandedGroups[group.title] ?? (!group.collapsible || hasActiveItem || isModulePage);

    // Grupo sem título (items no topo como Clara)
    if (!group.title) {
      return (
        <div key={`group-${index}`} className="space-y-1">
          {group.items.map(item => renderNavItem(item))}
        </div>
      );
    }

    // Grupo colapsável (módulos V2)
    if (group.collapsible) {
      // Add data-tour attribute for Conexão & Comunicação group
      const tourAttribute = groupKey === 'conexao' ? { 'data-tour': 'conexao-group' } : {};
      
      return (
        <Collapsible
          key={group.title}
          open={isExpanded}
          onOpenChange={() => toggleGroup(group.title)}
        >
          <div className="flex items-center" {...tourAttribute}>
            {/* Module title - clickable to go to module page */}
            {group.moduleHref ? (
              <Link
                to={group.moduleHref}
                className={cn(
                  "flex-1 flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 rounded-l-lg transition-colors",
                  (hasActiveItem || isModulePage) && "bg-muted/30"
                )}
              >
                <span className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  (hasActiveItem || isModulePage) ? "text-primary" : "text-muted-foreground"
                )}>
                  {group.title}
                </span>
                {(hasActiveItem || isModulePage) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            ) : (
              <span className={cn(
                "flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider",
                hasActiveItem ? "text-primary" : "text-muted-foreground"
              )}>
                {group.title}
              </span>
            )}
            
            {/* Collapse toggle */}
            <CollapsibleTrigger asChild>
              <button className={cn(
                "p-2 hover:bg-muted/50 rounded-r-lg transition-colors",
                (hasActiveItem || isModulePage) && "bg-muted/30"
              )}>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  isExpanded && "rotate-180"
                )} />
              </button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-1 mt-1">
            {group.items.map(item => renderNavItem(item, true))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    // Grupo normal (não colapsável)
    return (
      <div key={group.title} className="space-y-1">
        <div className={cn(
          "flex items-center gap-2 px-3 py-2",
          hasActiveItem && "bg-muted/30 rounded-lg"
        )}>
          <span className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            hasActiveItem ? "text-primary" : "text-muted-foreground"
          )}>
            {group.title}
          </span>
          {hasActiveItem && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          )}
        </div>
        {group.items.map(item => renderNavItem(item))}
      </div>
    );
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-card border-r border-border">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-border">
        <Link to="/dashboard/home" className="flex items-center gap-2">
          <img src={logoTributalks} alt="TribuTalks" className="h-16 w-auto" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
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

      {/* Plan Badge & Upgrade CTA */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="p-3 rounded-lg bg-muted">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Seu plano</span>
            <Badge variant="outline" className="text-xs font-medium">
              {PLAN_LABELS[currentPlan]}
            </Badge>
          </div>
          {upgradeCTA && (
            <Button
              asChild
              size="sm"
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Link to={upgradeCTA.href} className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {upgradeCTA.label}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
