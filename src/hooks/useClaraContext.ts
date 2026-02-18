import { useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

/**
 * Interface para contexto completo de navegação e resultados da Clara
 * Enviado em TODA requisição para dar visibilidade total à Clara
 */
export interface ClaraNavigationContext {
  // Identificação de onde o usuário está
  currentScreen: string;
  currentScreenLabel: string;
  
  // Última ação executada
  lastAction?: {
    type: string;
    timestamp: string;
    data?: Record<string, unknown>;
  };
  
  // Resultado que acabou de ser gerado
  lastResult?: {
    tool: string;
    output: Record<string, unknown>;
    timestamp: string;
  };
  
  // Histórico da sessão (últimas 5 telas)
  userJourney: string[];
  
  // Ferramentas já usadas na sessão
  toolsUsedThisSession: string[];
}

// Mapeamento de rotas para identificadores de tela
const ROUTE_SCREEN_MAP: Record<string, { id: string; label: string }> = {
  "/dashboard": { id: "dashboard", label: "Painel Principal" },
  "/dashboard/score-tributario": { id: "score-tributario", label: "Score Tributário" },
  "/dashboard/importar-xmls": { id: "importar-xmls", label: "Importador de XMLs" },
  "/dashboard/radar-creditos": { id: "radar-creditos", label: "Radar de Créditos" },
  "/dashboard/dre": { id: "dre", label: "DRE Inteligente" },
  "/dashboard/oportunidades": { id: "oportunidades", label: "Oportunidades Tributárias" },
  "/dashboard/planejar/oportunidades": { id: "oportunidades", label: "Oportunidades Tributárias" },
  "/dashboard/noticias": { id: "noticias-reforma", label: "Notícias da Reforma" },
  "/dashboard/timeline": { id: "timeline-reforma", label: "Timeline 2026-2033" },
  "/dashboard/painel-executivo": { id: "painel-executivo", label: "Painel Executivo" },
  "/dashboard/perfil-empresa": { id: "perfil-empresa", label: "Perfil da Empresa" },
  "/dashboard/nexus": { id: "nexus", label: "NEXUS" },
  "/dashboard/margem-ativa": { id: "margem-ativa", label: "Margem Ativa" },
  "/dashboard/integracoes": { id: "integracoes", label: "Integrações ERP" },
  "/calculadora/rtc": { id: "calculadora-rtc", label: "Calculadora RTC" },
  "/calculadora/split-payment": { id: "split-payment", label: "Simulador Split Payment" },
  "/calculadora/comparativo-regimes": { id: "comparativo-regimes", label: "Comparativo de Regimes" },
  "/calculadora/nbs": { id: "calculadora-nbs", label: "Calculadora NBS" },
  "/clara-ai": { id: "clara-ai", label: "Clara AI" },
  "/dashboard/workflows": { id: "workflows", label: "Workflows Guiados" },
  "/dashboard/comunidade": { id: "comunidade", label: "Comunidade" },
  "/dashboard/historico": { id: "historico", label: "Histórico" },
  "/dashboard/analisador-documentos": { id: "analisador-documentos", label: "Analisador de Documentos" },
};

// Storage keys
const JOURNEY_KEY = "clara_user_journey";
const TOOLS_USED_KEY = "clara_tools_used";
const LAST_ACTION_KEY = "clara_last_action";
const LAST_RESULT_KEY = "clara_last_result";

/**
 * Hook principal para gerenciar o contexto da Clara
 * Rastreia navegação, ações e resultados em toda a sessão
 */
export function useClaraContext() {
  const location = useLocation();
  const [context, setContext] = useState<ClaraNavigationContext>(() => {
    const screenInfo = ROUTE_SCREEN_MAP[location.pathname] || { id: "unknown", label: "Página" };
    return {
      currentScreen: screenInfo.id,
      currentScreenLabel: screenInfo.label,
      userJourney: JSON.parse(sessionStorage.getItem(JOURNEY_KEY) || "[]"),
      toolsUsedThisSession: JSON.parse(sessionStorage.getItem(TOOLS_USED_KEY) || "[]"),
      lastAction: JSON.parse(sessionStorage.getItem(LAST_ACTION_KEY) || "null"),
      lastResult: JSON.parse(sessionStorage.getItem(LAST_RESULT_KEY) || "null"),
    };
  });

  // Atualiza tela atual quando navegação muda
  useEffect(() => {
    const screenInfo = ROUTE_SCREEN_MAP[location.pathname] || { id: "unknown", label: "Página" };
    
    setContext(prev => {
      // Adiciona ao histórico de jornada (máx 5)
      const newJourney = [screenInfo.id, ...prev.userJourney.filter(s => s !== screenInfo.id)].slice(0, 5);
      sessionStorage.setItem(JOURNEY_KEY, JSON.stringify(newJourney));
      
      return {
        ...prev,
        currentScreen: screenInfo.id,
        currentScreenLabel: screenInfo.label,
        userJourney: newJourney,
      };
    });
  }, [location.pathname]);

  // Registra uma ação do usuário
  const trackAction = useCallback((type: string, data?: Record<string, unknown>) => {
    const action = {
      type,
      timestamp: new Date().toISOString(),
      data,
    };
    sessionStorage.setItem(LAST_ACTION_KEY, JSON.stringify(action));
    
    setContext(prev => ({
      ...prev,
      lastAction: action,
    }));
  }, []);

  // Registra um resultado de ferramenta
  const trackResult = useCallback((tool: string, output: Record<string, unknown>) => {
    const result = {
      tool,
      output,
      timestamp: new Date().toISOString(),
    };
    sessionStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));
    
    // Adiciona à lista de ferramentas usadas
    const toolsUsed = JSON.parse(sessionStorage.getItem(TOOLS_USED_KEY) || "[]");
    if (!toolsUsed.includes(tool)) {
      const newToolsUsed = [...toolsUsed, tool];
      sessionStorage.setItem(TOOLS_USED_KEY, JSON.stringify(newToolsUsed));
      
      setContext(prev => ({
        ...prev,
        lastResult: result,
        toolsUsedThisSession: newToolsUsed,
      }));
    } else {
      setContext(prev => ({
        ...prev,
        lastResult: result,
      }));
    }
  }, []);

  // Limpa memória de sessão (para novo início)
  const clearSession = useCallback(() => {
    sessionStorage.removeItem(JOURNEY_KEY);
    sessionStorage.removeItem(TOOLS_USED_KEY);
    sessionStorage.removeItem(LAST_ACTION_KEY);
    sessionStorage.removeItem(LAST_RESULT_KEY);
    
    setContext({
      currentScreen: context.currentScreen,
      currentScreenLabel: context.currentScreenLabel,
      userJourney: [],
      toolsUsedThisSession: [],
    });
  }, [context.currentScreen, context.currentScreenLabel]);

  return {
    context,
    trackAction,
    trackResult,
    clearSession,
  };
}

/**
 * Formata o contexto para envio ao backend
 */
export function formatContextForAPI(ctx: ClaraNavigationContext): Record<string, unknown> {
  return {
    screen: ctx.currentScreen,
    screenLabel: ctx.currentScreenLabel,
    journey: ctx.userJourney,
    toolsUsed: ctx.toolsUsedThisSession,
    lastAction: ctx.lastAction,
    lastResult: ctx.lastResult,
  };
}
