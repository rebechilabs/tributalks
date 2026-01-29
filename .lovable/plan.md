
# Plano: Reload Automático do PWA

## Objetivo
Quando uma nova versão do app for publicada, a página será recarregada automaticamente sem que o usuário precise fechar e reabrir a aba.

## Como Funciona Hoje
O PWA está configurado com `registerType: "autoUpdate"` no Vite, mas não existe código que monitore atualizações nem que force o reload. O Service Worker detecta a nova versão, mas aguarda o fechamento de todas as abas para ativar.

## Solucao

### 1. Criar Hook de Registro do PWA
Criar um componente que utilize o hook `useRegisterSW` do `vite-plugin-pwa/react` para:
- Detectar quando há uma nova versão (`needRefresh`)
- Chamar `updateServiceWorker()` automaticamente
- Forçar `window.location.reload()` para aplicar a atualização

### 2. Integrar no App Principal
Adicionar o componente no `main.tsx` para garantir que rode em todas as páginas desde o início da aplicação.

---

## Detalhes Tecnicos

### Arquivo: `src/components/PWAUpdater.tsx` (novo)
```typescript
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
      // Atualiza o Service Worker e recarrega
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  return null; // Componente invisivel
}
```

### Arquivo: `src/main.tsx` (modificar)
```typescript
import { PWAUpdater } from './components/PWAUpdater';

createRoot(document.getElementById("root")!).render(
  <>
    <PWAUpdater />
    <App />
  </>
);
```

### Arquivo: `src/vite-env.d.ts` (adicionar tipagem)
```typescript
/// <reference types="vite-plugin-pwa/react" />
```

---

## Comportamento Final
1. Usuario esta usando o app
2. Voce publica uma atualizacao
3. Em ate 1 minuto, o Service Worker detecta a nova versao
4. O app recarrega automaticamente
5. Usuario ve a versao atualizada sem precisar fechar a aba

