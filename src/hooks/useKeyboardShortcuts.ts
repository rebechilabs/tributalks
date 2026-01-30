import { useEffect } from "react";

interface ShortcutConfig {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  callback: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs/textareas
      const target = event.target as HTMLElement;
      const isInputFocused = 
        target.tagName === "INPUT" || 
        target.tagName === "TEXTAREA" || 
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const metaMatches = shortcut.metaKey ? event.metaKey : true;
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey : true;
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;

        // Special handling for Cmd/Ctrl+K - should work even in inputs
        const isGlobalShortcut = shortcut.key.toLowerCase() === "k" && (shortcut.metaKey || shortcut.ctrlKey);

        if (keyMatches && metaMatches && ctrlMatches && shiftMatches) {
          if (isGlobalShortcut || !isInputFocused) {
            event.preventDefault();
            shortcut.callback();
            return;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

// Utility hook specifically for Clara's Cmd+K shortcut
export function useClaraShortcut() {
  useKeyboardShortcuts([
    {
      key: "k",
      metaKey: true,
      callback: () => {
        window.dispatchEvent(new CustomEvent("openClaraFreeChat"));
      },
      description: "Abrir Clara AI",
    },
    {
      key: "k",
      ctrlKey: true,
      callback: () => {
        window.dispatchEvent(new CustomEvent("openClaraFreeChat"));
      },
      description: "Abrir Clara AI",
    },
  ]);
}
