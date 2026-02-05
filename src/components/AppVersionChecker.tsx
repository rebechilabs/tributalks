import { useEffect, useState } from "react";
import { useAppVersion } from "@/hooks/useAppVersion";
import { RefreshCw, X } from "lucide-react";

export function AppVersionChecker() {
  const { updateAvailable } = useAppVersion();
  const [countdown, setCountdown] = useState(5);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!updateAvailable || dismissed) return;

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Force reload with cache bypass
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [updateAvailable, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    // Snooze for 5 minutes
    setTimeout(() => {
      setDismissed(false);
      setCountdown(5);
    }, 5 * 60 * 1000);
  };

  const handleUpdateNow = () => {
    window.location.reload();
  };

  if (!updateAvailable || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg animate-in slide-in-from-top duration-300">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <div className="absolute inset-0 animate-ping opacity-30">
              <RefreshCw className="h-5 w-5" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="font-medium">Nova versão disponível!</span>
            <span className="text-sm opacity-90">
              Atualizando em {countdown}s...
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpdateNow}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-md text-sm font-medium transition-colors"
          >
            Atualizar agora
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
            title="Lembrar depois"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-white/20">
        <div 
          className="h-full bg-white/60 transition-all duration-1000 ease-linear"
          style={{ width: `${(countdown / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
