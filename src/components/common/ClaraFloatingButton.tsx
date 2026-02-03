import { useState, useEffect } from "react";
import { MessageCircle, X, Sparkles, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClaraFloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
  pendingActionsCount?: number;
  onActionsClick?: () => void;
}

export function ClaraFloatingButton({ 
  isOpen, 
  onClick, 
  pendingActionsCount = 0,
  onActionsClick 
}: ClaraFloatingButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Show tooltip after a delay when not open
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setShowTooltip(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowTooltip(false);
    }
  }, [isOpen]);

  // Hide tooltip after a while
  useEffect(() => {
    if (showTooltip && !isOpen) {
      const timer = setTimeout(() => setShowTooltip(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip, isOpen]);

  return (
    <div className="relative">
      {/* Pending Actions Badge - always visible if there are pending actions */}
      {pendingActionsCount > 0 && !isOpen && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onActionsClick?.();
          }}
          className={cn(
            "absolute -top-2 -left-12 flex items-center gap-1.5",
            "bg-destructive text-destructive-foreground",
            "px-2.5 py-1 rounded-full text-xs font-medium",
            "shadow-lg shadow-destructive/30",
            "hover:scale-105 hover:shadow-xl transition-all duration-200",
            "animate-pulse"
          )}
        >
          <Bot className="h-3 w-3" />
          {pendingActionsCount} ação{pendingActionsCount > 1 ? 'ões' : ''}
        </button>
      )}

      {/* Elegant Tooltip */}
      <div
        className={cn(
          "absolute bottom-full right-0 mb-4 transition-all duration-500 ease-out",
          showTooltip && !isOpen && !isHovered && pendingActionsCount === 0
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        )}
      >
        <div className="relative">
          {/* Glass card tooltip */}
          <div className="bg-card/95 backdrop-blur-sm border border-primary/20 rounded-2xl px-5 py-3 shadow-xl shadow-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Precisa de ajuda?
                </p>
                <p className="text-xs text-muted-foreground">
                  Clique para falar com a Clara
                </p>
              </div>
            </div>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-card/95 border-r border-b border-primary/20 rotate-45 transform origin-center" />
        </div>
      </div>

      {/* Main Button Container */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group relative flex items-center justify-center",
          "w-16 h-16 rounded-full",
          "transition-all duration-300 ease-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isOpen
            ? "bg-muted hover:bg-muted/80"
            : "bg-gradient-to-br from-primary via-primary to-primary/80 hover:shadow-2xl hover:shadow-primary/40 hover:scale-110"
        )}
        aria-label={isOpen ? "Fechar Clara" : "Falar com a Clara"}
      >
        {/* Animated background rings */}
        {!isOpen && (
          <>
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            <span 
              className={cn(
                "absolute inset-[-4px] rounded-full border-2 border-primary/40",
                "transition-all duration-300",
                isHovered ? "scale-110 opacity-100" : "scale-100 opacity-60"
              )}
            />
            <span 
              className={cn(
                "absolute inset-[-8px] rounded-full border border-primary/20",
                "transition-all duration-500",
                isHovered ? "scale-110 opacity-100" : "scale-100 opacity-40"
              )}
            />
          </>
        )}

        {/* Icon */}
        <span
          className={cn(
            "relative z-10 transition-all duration-300",
            isOpen ? "rotate-0" : "rotate-0",
            !isOpen && "group-hover:scale-110"
          )}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-muted-foreground" />
          ) : (
            <MessageCircle className="w-7 h-7 text-primary-foreground drop-shadow-sm" />
          )}
        </span>

        {/* Online indicator */}
        {!isOpen && (
          <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-success border-2 border-background" />
          </span>
        )}
      </button>

      {/* Hover label */}
      <div
        className={cn(
          "absolute right-full mr-4 top-1/2 -translate-y-1/2",
          "bg-foreground text-background px-3 py-1.5 rounded-lg text-sm font-medium",
          "whitespace-nowrap shadow-lg",
          "transition-all duration-200",
          isHovered && !isOpen
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-2 pointer-events-none"
        )}
      >
        Falar com a Clara
        <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-foreground" />
      </div>
    </div>
  );
}
