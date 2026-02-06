import { useEffect, useState } from "react";
import { WifiOff, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Hide banner after a short delay when coming back online
      setTimeout(() => setShowBanner(false), 2000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      setDismissed(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set initial state
    if (!navigator.onLine) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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
