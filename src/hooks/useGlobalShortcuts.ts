import { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface ShortcutDefinition {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

/**
 * Hook global para atalhos de teclado do dashboard
 * Funciona em qualquer página autenticada
 */
export function useGlobalShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();

  const openClara = useCallback(() => {
    window.dispatchEvent(new CustomEvent("openClaraFreeChat"));
  }, []);

  const openHelp = useCallback(() => {
    window.dispatchEvent(new CustomEvent("openHelpDialog"));
  }, []);

  const shortcuts: ShortcutDefinition[] = [
    // Cmd/Ctrl + K - Abrir Clara AI
    {
      key: "k",
      metaKey: true,
      action: openClara,
      description: "Abrir Clara AI",
    },
    {
      key: "k",
      ctrlKey: true,
      action: openClara,
      description: "Abrir Clara AI",
    },
    // Cmd/Ctrl + D - Ir para Dashboard/Home
    {
      key: "d",
      metaKey: true,
      action: () => navigate("/dashboard/home"),
      description: "Ir para Dashboard",
    },
    {
      key: "d",
      ctrlKey: true,
      action: () => navigate("/dashboard/home"),
      description: "Ir para Dashboard",
    },
    // Cmd/Ctrl + Shift + N - Nova análise (DRE)
    {
      key: "n",
      metaKey: true,
      shiftKey: true,
      action: () => navigate("/dashboard/entender/dre"),
      description: "Nova análise DRE",
    },
    {
      key: "n",
      ctrlKey: true,
      shiftKey: true,
      action: () => navigate("/dashboard/entender/dre"),
      description: "Nova análise DRE",
    },
    // Cmd/Ctrl + Shift + S - Ir para Score Tributário
    {
      key: "s",
      metaKey: true,
      shiftKey: true,
      action: () => navigate("/dashboard/entender/score"),
      description: "Abrir Score Tributário",
    },
    {
      key: "s",
      ctrlKey: true,
      shiftKey: true,
      action: () => navigate("/dashboard/entender/score"),
      description: "Abrir Score Tributário",
    },
    // Cmd/Ctrl + / - Abrir ajuda
    {
      key: "/",
      metaKey: true,
      action: openHelp,
      description: "Abrir ajuda",
    },
    {
      key: "/",
      ctrlKey: true,
      action: openHelp,
      description: "Abrir ajuda",
    },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorar quando digitando em inputs/textareas (exceto para atalhos globais como Cmd+K)
      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const metaMatches = shortcut.metaKey ? event.metaKey : !event.metaKey;
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;

        // Atalhos globais que funcionam mesmo em inputs
        const isGlobalShortcut = 
          shortcut.key.toLowerCase() === "k" || 
          shortcut.key === "/";

        if (keyMatches && metaMatches && ctrlMatches && shiftMatches) {
          if (isGlobalShortcut || !isInputFocused) {
            event.preventDefault();
            shortcut.action();
            return;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, location.pathname]);

  return { shortcuts };
}

/**
 * Helper para exibir lista de atalhos disponíveis
 */
export function getShortcutsList() {
  return [
    { keys: ["⌘", "K"], description: "Abrir Clara AI" },
    { keys: ["⌘", "D"], description: "Ir para Dashboard" },
    { keys: ["⌘", "⇧", "N"], description: "Nova análise DRE" },
    { keys: ["⌘", "⇧", "S"], description: "Score Tributário" },
    { keys: ["⌘", "/"], description: "Ajuda e atalhos" },
  ];
}
