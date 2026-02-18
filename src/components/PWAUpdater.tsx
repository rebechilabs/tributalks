import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function PWAUpdater() {
  const [showNotification, setShowNotification] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Check for updates every 15 seconds for faster detection
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 15 * 1000);
      }
    },
    onNeedRefresh() {
      setShowNotification(true);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowNotification(true);
    }
  }, [needRefresh]);

  // Listen for SW controller change to auto-reload
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleControllerChange = () => {
      // New SW took control — reload to get fresh content
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      await updateServiceWorker(true);
      // controllerchange listener will handle the reload
    } catch (error) {
      // Fallback: force reload if SW update fails
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    // Re-show after 5 minutes if still needed
    setTimeout(() => {
      if (needRefresh) {
        setShowNotification(true);
      }
    }, 5 * 60 * 1000);
  };

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[95%] max-w-lg"
        >
          <div className="relative bg-gradient-to-r from-primary/95 via-primary to-primary/95 text-primary-foreground rounded-xl shadow-2xl border border-primary-foreground/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            
            <div className="relative p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center"
                  >
                    <Sparkles className="w-6 h-6" />
                  </motion.div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1">
                    Nova versão disponível! 🚀
                  </h3>
                  <p className="text-sm text-primary-foreground/90 mb-3">
                    Uma atualização com melhorias e correções está pronta. 
                    Atualize agora para ter a melhor experiência.
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      size="sm"
                      className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold shadow-lg"
                    >
                      {isUpdating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Atualizando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Atualizar agora
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      variant="ghost"
                      size="sm"
                      className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      Depois
                    </Button>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-primary-foreground/10 transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5 text-primary-foreground/70" />
                </button>
              </div>
            </div>

            {isUpdating && (
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3 }}
                className="h-1 bg-primary-foreground/30"
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
