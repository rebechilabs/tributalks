import { useEffect, useState, useCallback } from "react";
import { WifiOff, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true); // Assume online by default
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Actually verify connectivity with a real request
  const checkConnectivity = useCallback(async () => {
    try {
      const response = await fetch('/version.json?t=' + Date.now(), { 
        method: 'HEAD',
        cache: 'no-store' 
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const handleOnline = async () => {
      const reallyOnline = await checkConnectivity();
      if (!mounted) return;
      if (reallyOnline) {
        setIsOnline(true);
        setTimeout(() => setShowBanner(false), 2000);
      }
    };
    
    const handleOffline = async () => {
      // Double-check with a real request before showing the banner
      const reallyOnline = await checkConnectivity();
      if (!mounted) return;
      if (!reallyOnline) {
        setIsOnline(false);
        setShowBanner(true);
        setDismissed(false);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check - only show banner if truly offline
    if (!navigator.onLine) {
      checkConnectivity().then((online) => {
        if (!mounted) return;
        if (!online) {
          setShowBanner(true);
          setIsOnline(false);
        }
      });
    }

    return () => {
      mounted = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkConnectivity]);

  if (!showBanner || dismissed) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300",
        isOnline 
          ? "bg-success text-success-foreground" 
          : "bg-destructive text-destructive-foreground"
      )}
      role="alert"
      aria-live="polite"
    >
      {!isOnline && (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
          <button
            onClick={() => setDismissed(true)}
            className="ml-2 p-1 hover:bg-white/20 rounded-sm transition-colors"
            aria-label="Fechar aviso"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      )}
      {isOnline && (
        <span>Conexão restaurada!</span>
      )}
    </div>
  );
}
