

# Melhorar Deteccao de Atualizacao

## Problema Identificado

O sistema atual tem **dois mecanismos redundantes** de deteccao de atualizacao (`AppVersionChecker` + `PWAUpdater`), e ambos falham por motivos diferentes:

1. **`version.json` pode ser cacheado pelo Service Worker** - O Workbox cacheia arquivos estaticos, e mesmo com `cache: "no-store"` no fetch, o SW pode interceptar a requisicao antes.
2. **Em producao, os `console.log` sao removidos** (`esbuild.drop: ["console"]`), dificultando debug.
3. **O `AppVersionChecker` tem auto-reload agressivo** (5s countdown) que pode recarregar antes do usuario estar pronto.

## Solucao

### 1. Excluir `version.json` do cache do Service Worker

No `vite.config.ts`, adicionar `version.json` ao `navigateFallbackDenylist` e configurar o Workbox para nao cachear esse arquivo.

### 2. Unificar os mecanismos

Remover o `AppVersionChecker` (baseado em polling do `version.json`) e confiar apenas no `PWAUpdater` que usa o Service Worker nativo para detectar mudancas. O SW ja verifica atualizacoes a cada 30 segundos.

### 3. Melhorar o PWAUpdater

- Reduzir o intervalo de verificacao de 30s para 15s
- Adicionar `navigator.serviceWorker.addEventListener('controllerchange')` para detectar quando o novo SW assume controle
- Fazer auto-reload apos o usuario aceitar a atualizacao

### 4. Adicionar runtimeCaching para version.json com NetworkFirst

Configurar o Workbox para sempre buscar `version.json` da rede, garantindo que nunca seja servido do cache.

## Detalhes Tecnicos

### Arquivos a modificar:

1. **`vite.config.ts`** - Adicionar `version.json` ao `workbox.navigateFallbackDenylist` e excluir de `globPatterns`
2. **`src/components/PWAUpdater.tsx`** - Melhorar com `controllerchange` listener e intervalo menor (15s)
3. **`src/components/AppVersionChecker.tsx`** - Remover (redundante)
4. **`src/hooks/useAppVersion.ts`** - Remover (redundante)
5. **`src/main.tsx`** - Manter apenas `PWAUpdater`
6. **`src/App.tsx`** - Remover referencia ao `AppVersionChecker` se existir

### Mudanca no Workbox config:

```text
workbox: {
  globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
  // Excluir version.json do pre-cache
  globIgnores: ["**/version.json"],
  navigateFallbackDenylist: [/^\/version\.json/],
  ...
}
```

### Mudanca no PWAUpdater:

- Adicionar listener `controllerchange` para reload automatico quando novo SW ativa
- Reduzir polling para 15 segundos
- Manter a UI atual (banner com botao "Atualizar agora")

