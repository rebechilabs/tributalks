import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { 
  Home, Scale, Wallet, FileText, Users, Calendar, 
  Clock, Settings, Newspaper, Calculator, Target, 
  BarChart3, Trophy, Lightbulb, LayoutDashboard,
  MapPin, Briefcase, ClipboardCheck, Plug, Gift, Route, 
  FileSearch, HelpCircle, User, Bell, Sparkles, BookOpen
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface BreadcrumbItem {
  path: string;
  label: string;
}

export interface RelatedPage {
  path: string;
  label: string;
  icon: LucideIcon;
}

export interface RouteInfo {
  path: string;
  label: string;
  group?: string;
  groupLabel?: string;
  breadcrumb: BreadcrumbItem[];
  relatedPages: RelatedPage[];
  isRoot: boolean;
}

interface RouteDefinition {
  label: string;
  group?: string;
  groupLabel?: string;
  parent?: string;
  relatedPaths?: string[];
  icon?: LucideIcon;
}

// Complete route map with hierarchy
const ROUTE_MAP: Record<string, RouteDefinition> = {
  // Root
  '/dashboard': { 
    label: 'Dashboard', 
    group: 'diagnostico',
    groupLabel: 'Diagnóstico',
    icon: Home 
  },
  
  // Diagnóstico
  '/dashboard/score-tributario': { 
    label: 'Score Tributário', 
    group: 'diagnostico',
    groupLabel: 'Diagnóstico',
    parent: '/dashboard',
    relatedPaths: ['/dashboard/nexus', '/dashboard'],
    icon: Trophy
  },
  '/dashboard/nexus': { 
    label: 'NEXUS', 
    group: 'comando',
    groupLabel: 'Comando',
    parent: '/dashboard',
    relatedPaths: ['/dashboard/score-tributario', '/dashboard/analise-notas'],
    icon: LayoutDashboard
  },
  
  // Simuladores
  '/calculadora/rtc': { 
    label: 'Calculadora RTC', 
    group: 'simuladores',
    groupLabel: 'Simuladores',
    parent: '/dashboard',
    relatedPaths: ['/calculadora/servicos', '/calculadora/split-payment'],
    icon: Calculator
  },
  '/calculadora/servicos': { 
    label: 'Calculadora NBS', 
    group: 'simuladores',
    groupLabel: 'Simuladores',
    parent: '/dashboard',
    relatedPaths: ['/calculadora/rtc', '/calculadora/split-payment'],
    icon: Briefcase
  },
  '/calculadora/split-payment': { 
    label: 'Split Payment', 
    group: 'simuladores',
    groupLabel: 'Simuladores',
    parent: '/dashboard',
    relatedPaths: ['/calculadora/rtc', '/calculadora/comparativo-regimes'],
    icon: Wallet
  },
  '/calculadora/comparativo-regimes': { 
    label: 'Comparativo de Regimes', 
    group: 'simuladores',
    groupLabel: 'Simuladores',
    parent: '/dashboard',
    relatedPaths: ['/calculadora/rtc', '/calculadora/split-payment'],
    icon: Scale
  },
  
  // PIT (Reforma)
  '/dashboard/timeline-reforma': { 
    label: 'Timeline 2026-2033', 
    group: 'pit',
    groupLabel: 'PIT',
    parent: '/dashboard',
    relatedPaths: ['/noticias', '/dashboard/checklist-reforma'],
    icon: MapPin
  },
  '/noticias': { 
    label: 'Notícias da Reforma', 
    group: 'pit',
    groupLabel: 'PIT',
    parent: '/dashboard',
    relatedPaths: ['/dashboard/timeline-reforma', '/dashboard/checklist-reforma'],
    icon: Newspaper
  },
  '/dashboard/checklist-reforma': { 
    label: 'Checklist de Prontidão', 
    group: 'pit',
    groupLabel: 'PIT',
    parent: '/dashboard',
    relatedPaths: ['/dashboard/timeline-reforma', '/noticias'],
    icon: ClipboardCheck
  },
  
  // Central Inteligente
  '/dashboard/analisador-documentos': { 
    label: 'Analisador de Documentos', 
    group: 'central',
    groupLabel: 'Central Inteligente',
    parent: '/dashboard',
    relatedPaths: ['/dashboard/workflows', '/clara-ai'],
    icon: FileSearch
  },
  '/dashboard/workflows': { 
    label: 'Workflows Guiados', 
    group: 'central',
    groupLabel: 'Central Inteligente',
    parent: '/dashboard',
    relatedPaths: ['/dashboard/analisador-documentos', '/comunidade'],
    icon: Route
  },
  '/comunidade': { 
    label: 'Comunidade', 
    group: 'central',
    groupLabel: 'Central Inteligente',
    parent: '/dashboard',
    relatedPaths: ['/dashboard/workflows', '/indicar'],
    icon: Users
  },
  '/clara-ai': { 
    label: 'Clara AI', 
    group: 'central',
    groupLabel: 'Central Inteligente',
    parent: '/dashboard',
    icon: Sparkles
  },
  
  // Diagnóstico Avançado
  '/dashboard/analise-notas': { 
    label: 'Radar de Créditos', 
    group: 'avancado',
    groupLabel: 'Diagnóstico Avançado',
    parent: '/dashboard',
    relatedPaths: ['/dashboard/dre', '/dashboard/oportunidades'],
    icon: FileText
  },
  '/dashboard/dre': { 
    label: 'DRE Inteligente', 
    group: 'avancado',
    groupLabel: 'Diagnóstico Avançado',
    parent: '/dashboard',
    relatedPaths: ['/dashboard/analise-notas', '/dashboard/margem-ativa'],
    icon: BarChart3
  },
  '/dashboard/oportunidades': { 
    label: 'Oportunidades Fiscais', 
    group: 'avancado',
    groupLabel: 'Diagnóstico Avançado',
    parent: '/dashboard',
    relatedPaths: ['/dashboard/analise-notas', '/dashboard/dre'],
    icon: Lightbulb
  },
  '/dashboard/margem-ativa': { 
    label: 'Margem Ativa', 
    group: 'avancado',
    groupLabel: 'Diagnóstico Avançado',
    parent: '/dashboard',
    relatedPaths: ['/dashboard/dre', '/dashboard/oportunidades'],
    icon: Target
  },
  
  // Integrações
  '/dashboard/integracoes': { 
    label: 'Integrações ERP', 
    group: 'integracoes',
    groupLabel: 'Integrações',
    parent: '/dashboard',
    icon: Plug
  },
  
  // Configurações e Perfil
  '/configuracoes': { 
    label: 'Configurações', 
    parent: '/dashboard',
    icon: Settings
  },
  '/perfil': { 
    label: 'Meu Perfil', 
    parent: '/dashboard',
    icon: User
  },
  '/perfil-empresa': { 
    label: 'Perfil da Empresa', 
    parent: '/dashboard',
    icon: Briefcase
  },
  '/indicar': { 
    label: 'Indique e Ganhe', 
    parent: '/dashboard',
    relatedPaths: ['/comunidade'],
    icon: Gift
  },
  '/ajuda': { 
    label: 'Ajuda', 
    parent: '/dashboard',
    icon: HelpCircle
  },
  '/casos': { 
    label: 'Estudos de Caso', 
    parent: '/dashboard',
    relatedPaths: ['/comunidade'],
    icon: BookOpen
  },
  '/upgrade': { 
    label: 'Upgrade de Plano', 
    parent: '/dashboard',
    icon: Sparkles
  },
  
  // Admin
  '/admin': { 
    label: 'Painel Admin', 
    parent: '/dashboard',
    icon: Settings
  },
  '/admin/usuarios': { 
    label: 'Gestão de Usuários', 
    parent: '/dashboard',
    icon: Users
  },
  '/admin/pilulas': { 
    label: 'Pílulas da Reforma', 
    parent: '/dashboard',
    icon: Newspaper
  },
  '/admin/noticias': { 
    label: 'Admin Notícias', 
    parent: '/dashboard',
    icon: Newspaper
  },
  '/admin/prazos': { 
    label: 'Prazos e Calendário', 
    parent: '/dashboard',
    icon: Calendar
  },
  '/admin/monitoramento': { 
    label: 'Monitoramento', 
    parent: '/dashboard',
    icon: BarChart3
  },
};

// Group to paths mapping for auto-expand
export const GROUP_PATHS: Record<string, string[]> = {
  diagnostico: ['/dashboard', '/dashboard/score-tributario'],
  comando: ['/dashboard/nexus'],
  simuladores: ['/calculadora/rtc', '/calculadora/servicos', '/calculadora/split-payment', '/calculadora/comparativo-regimes'],
  pit: ['/dashboard/timeline-reforma', '/noticias', '/dashboard/checklist-reforma'],
  central: ['/dashboard/analisador-documentos', '/dashboard/workflows', '/comunidade', '/clara-ai'],
  avancado: ['/dashboard/analise-notas', '/dashboard/dre', '/dashboard/oportunidades', '/dashboard/margem-ativa'],
  integracoes: ['/dashboard/integracoes'],
};

export function useRouteInfo(): RouteInfo {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return useMemo(() => {
    const routeDef = ROUTE_MAP[currentPath];
    
    // Default fallback for unknown routes
    if (!routeDef) {
      return {
        path: currentPath,
        label: 'Página',
        breadcrumb: [{ path: '/dashboard', label: 'Dashboard' }],
        relatedPages: [],
        isRoot: false,
      };
    }
    
    // Build breadcrumb chain
    const breadcrumb: BreadcrumbItem[] = [];
    let current: string | undefined = currentPath;
    const visited = new Set<string>();
    
    while (current && !visited.has(current)) {
      visited.add(current);
      const def = ROUTE_MAP[current];
      if (def) {
        breadcrumb.unshift({ path: current, label: def.label });
        current = def.parent;
      } else {
        break;
      }
    }
    
    // Add Dashboard if not already in chain
    if (breadcrumb.length === 0 || breadcrumb[0].path !== '/dashboard') {
      breadcrumb.unshift({ path: '/dashboard', label: 'Dashboard' });
    }
    
    // Build related pages
    const relatedPages: RelatedPage[] = (routeDef.relatedPaths || [])
      .map(path => {
        const def = ROUTE_MAP[path];
        if (!def) return null;
        return {
          path,
          label: def.label,
          icon: def.icon || Home,
        };
      })
      .filter((p): p is RelatedPage => p !== null)
      .slice(0, 3); // Max 3 related pages
    
    return {
      path: currentPath,
      label: routeDef.label,
      group: routeDef.group,
      groupLabel: routeDef.groupLabel,
      breadcrumb,
      relatedPages,
      isRoot: currentPath === '/dashboard',
    };
  }, [currentPath]);
}

// Helper to check if current path is in a group
export function isPathInGroup(path: string, groupKey: string): boolean {
  const groupPaths = GROUP_PATHS[groupKey];
  return groupPaths?.includes(path) ?? false;
}

// Get the group key for a given path
export function getGroupForPath(path: string): string | undefined {
  for (const [groupKey, paths] of Object.entries(GROUP_PATHS)) {
    if (paths.includes(path)) {
      return groupKey;
    }
  }
  return undefined;
}
