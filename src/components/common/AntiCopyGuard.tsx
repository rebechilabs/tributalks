import { useEffect, useRef, type ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

interface AntiCopyGuardProps {
  children: ReactNode;
  /** If true, disables all protections (useful for elements with their own copy button) */
  allowCopy?: boolean;
  className?: string;
}

/**
 * Wrapper that applies friction-based anti-copy protections to sensitive content.
 * Blocks: text selection, right-click, Ctrl+C/Cmd+C, Ctrl+A.
 * 
 * Note: This is NOT DRM — a technical user can always use DevTools.
 * The goal is to prevent casual/mass copying.
 */
export function AntiCopyGuard({ children, allowCopy = false, className = "" }: AntiCopyGuardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (allowCopy) return;

    const el = ref.current;
    if (!el) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({
        title: "Conteúdo protegido",
        description: "Este conteúdo é exclusivo da plataforma TribuTalks.",
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && (e.key === "c" || e.key === "C" || e.key === "a" || e.key === "A")) {
        e.preventDefault();
        toast({
          title: "Conteúdo protegido",
          description: "Use os botões da plataforma para compartilhar.",
        });
      }
    };

    el.addEventListener("contextmenu", handleContextMenu);
    el.addEventListener("keydown", handleKeyDown);

    return () => {
      el.removeEventListener("contextmenu", handleContextMenu);
      el.removeEventListener("keydown", handleKeyDown);
    };
  }, [allowCopy]);

  if (allowCopy) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
