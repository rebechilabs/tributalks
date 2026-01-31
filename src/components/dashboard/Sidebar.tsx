import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Lock, Sparkles, ChevronDown, ChevronRight, ArrowUpRight, Gift, Command
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadNotificationsByCategory } from "@/hooks/useUnreadNotificationsByCategory";
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

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { counts: unreadCounts } = useUnreadNotificationsByCategory();
  
  const rawPlan = profile?.plano || 'STARTER';
  const currentPlan = (LEGACY_PLAN_MAP[rawPlan] || 'STARTER') as PlanType;
  const menuElements = getMenuForPlan(currentPlan);
  const upgradeCTA = getUpgradeCTA(currentPlan);

  // State for collapsible groups
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Map categories to menu items for notification badges
  const getUnreadForRoute = (href: string): number => {
    if (href === '/noticias') return unreadCounts.reforma;
    if (href === '/indicar') return unreadCounts.indicacao;
    if (href === '/dashboard/oportunidades') return unreadCounts.geral;
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

    // Item em destaque (featured) - Clara AI ou NEXUS
    if (item.featured) {
      return (
        <Link
          key={item.href}
          to={item.href}
          onClick={item.shortcut === 'k' ? (e) => { e.preventDefault(); handleClaraShortcut(); } : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-lg transition-all",
            "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent",
            "border-l-4 border-primary",
            "hover:from-primary/15 hover:via-primary/10",
            isActive && "ring-1 ring-primary/20"
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
                  variant={item.badgeVariant === 'success' ? 'default' : 'secondary'}
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    item.badgeVariant === 'success' && "bg-green-500/20 text-green-600 hover:bg-green-500/30"
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
        </Link>
      );
    }

    // Item normal
    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
          isActive
            ? "bg-primary/10 text-primary border-l-2 border-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
          isNested && "pl-10"
        )}
      >
        <div className="relative shrink-0">
          <Icon className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
          )}
        </div>
        <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
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
    const isExpanded = expandedGroups[group.title] ?? !group.collapsible;

    // Grupo sem título (items no topo como Clara)
    if (!group.title) {
      return (
        <div key={`group-${index}`} className="space-y-1">
          {group.items.map(item => renderNavItem(item))}
        </div>
      );
    }

    // Grupo colapsável
    if (group.collapsible) {
      return (
        <Collapsible
          key={group.title}
          open={isExpanded}
          onOpenChange={() => toggleGroup(group.title)}
        >
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 w-full text-left group hover:bg-muted/50 rounded-lg transition-colors">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">
                {group.title}
              </span>
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

    // Grupo normal
    return (
      <div key={group.title} className="space-y-1">
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {group.title}
          </span>
        </div>
        {group.items.map(item => renderNavItem(item))}
      </div>
    );
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-card border-r border-border">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src={logoTributalks} alt="TribuTalks" className="h-8 w-auto" />
        </Link>
      </div>

      {/* Referral Highlight Card */}
      <div className="mx-3 mt-4 p-3 rounded-lg bg-gradient-to-br from-amber-500/20 via-primary/20 to-amber-500/10 border border-amber-500/30">
        <Link to="/indicar" className="block group">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-5 h-5 text-amber-500 animate-pulse" />
            <span className="text-sm font-bold text-foreground">Indique e Ganhe!</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500 text-white font-medium">
              Novo
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Ganhe até 20% de desconto na sua mensalidade
          </p>
          <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-md bg-amber-500 text-white text-xs font-semibold group-hover:bg-amber-600 transition-colors">
            <Sparkles className="w-3 h-3" />
            Indicar Agora
          </div>
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
