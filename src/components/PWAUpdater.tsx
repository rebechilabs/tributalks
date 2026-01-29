import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function PWAUpdater() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Verifica atualizações a cada 1 minuto
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 1000);
      }
    },
  });

  useEffect(() => {
    if (needRefresh) {
      // Atualiza o Service Worker e recarrega automaticamente
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  return null; // Componente invisível
}
