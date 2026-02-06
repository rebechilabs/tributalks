
# Plano de Correções e Melhorias - TribuTalks

## Resumo Executivo

Este plano aborda as correções de segurança, performance e experiência do usuário solicitadas. Após análise detalhada do código atual, identifiquei que **muitas das melhorias sugeridas já estão implementadas**. O plano foca nas lacunas reais que precisam ser preenchidas.

---

## Situação Atual vs. Solicitado

| Item | Status Atual | Ação Necessária |
|------|--------------|-----------------|
| RLS em todas as tabelas | 77 tabelas com RLS ativo | Nenhuma |
| Rate Limiting | Implementado em `_shared/rate-limiter.ts` | Nenhuma |
| Validação com Zod | Parcialmente implementado | Expandir para formulários |
| Edge Functions para dados | 50+ funções existentes | Criar API layer centralizada |
| Consultas diretas ao Supabase | 104 ocorrências em 10 arquivos | Migrar gradualmente |
| Code Splitting (lazy loading) | Não implementado | Implementar |
| Otimização de chunks no Vite | Não configurado | Adicionar configuração |
| Remover console.log em produção | Não configurado | Adicionar ao build |
| Skeleton loading | Implementado em 27 componentes | Expandir para mais páginas |
| Atalhos de teclado | Implementado (`useKeyboardShortcuts`) | Adicionar mais atalhos |
| Indicador de conexão offline | Não implementado | Criar componente |
| Logs de auditoria | Não implementado | Criar tabela e triggers |
| Acessibilidade (a11y) | Parcialmente implementado | Melhorar |

---

## Fase 1: Performance (Prioridade Alta)

### 1.1 Code Splitting com React.lazy

Modificar `src/App.tsx` para usar lazy loading nas páginas do dashboard:

```text
Arquivo: src/App.tsx

Adicionar imports:
- import { lazy, Suspense } from 'react'
- import { LoadingSpinner } from '@/components/ui/loading-spinner'

Converter imports estáticos para lazy:
- const HomePage = lazy(() => import('./pages/dashboard/HomePage'))
- const DRE = lazy(() => import('./pages/DRE'))
- const ScoreTributario = lazy(() => import('./pages/ScoreTributario'))
- const AnaliseNotasFiscais = lazy(() => import('./pages/AnaliseNotasFiscais'))
- const Nexus = lazy(() => import('./pages/Nexus'))
- const MargemAtiva = lazy(() => import('./pages/dashboard/MargemAtiva'))
- const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
- (e demais 30+ páginas do dashboard)

Envolver rotas com Suspense:
<Route path="/dashboard/home" element={
  <Suspense fallback={<LoadingSpinner />}>
    <ProtectedRoute><HomePage /></ProtectedRoute>
  </Suspense>
} />
```

### 1.2 Otimização de Chunks no Vite

Modificar `vite.config.ts`:

```typescript
// Adicionar ao build config
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-ui': [
          '@radix-ui/react-dialog',
          '@radix-ui/react-dropdown-menu',
          '@radix-ui/react-tooltip',
          '@radix-ui/react-tabs',
          '@radix-ui/react-select',
        ],
        'vendor-charts': ['recharts'],
        'vendor-supabase': ['@supabase/supabase-js'],
        'vendor-pdf': ['jspdf'],
        'vendor-animation': ['framer-motion'],
      },
    },
  },
  chunkSizeWarningLimit: 500,
},
esbuild: {
  drop: ['console', 'debugger'], // Remove em produção
},
```

### 1.3 Criar LoadingSpinner Component

Novo arquivo `src/components/ui/loading-spinner.tsx`:

```typescript
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center min-h-[200px]", className)}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
```

---

## Fase 2: Experiência do Usuário (UX)

### 2.1 Indicador de Conexão Offline

Novo arquivo `src/components/ConnectionStatus.tsx`:

```typescript
// Hook + componente para detectar status de conexão
// Exibe banner fixo quando offline
// Usa navigator.onLine + event listeners
// Estilo: banner vermelho no topo da tela
```

Integrar no `App.tsx` como componente global.

### 2.2 Expandir Atalhos de Teclado Globais

Modificar `src/hooks/useKeyboardShortcuts.ts`:

Adicionar novos atalhos:
- `Cmd/Ctrl + D` - Ir para Dashboard
- `Cmd/Ctrl + N` - Nova análise
- `Cmd/Ctrl + S` - Abrir Score Tributário
- `Cmd/Ctrl + /` - Abrir ajuda

Criar hook `useGlobalShortcuts` que é usado no componente raiz.

### 2.3 Melhorar Feedback Visual com Toast

Já existe `sonner` configurado. Garantir uso consistente:
- Todas as mutações mostram toast de progresso
- Erros mostram toast com ação de retry
- Sucesso mostra toast com link para recurso criado

---

## Fase 3: Segurança (Manutenção)

### 3.1 API Layer Centralizada (Gradual)

Criar `src/lib/api/index.ts`:

```typescript
// Funções helper para chamar Edge Functions
// Centraliza autenticação e tratamento de erros
// Permite migração gradual das consultas diretas

export async function callEdgeFunction<T>(
  functionName: string,
  options?: { method?: string; body?: any }
): Promise<T> {
  const session = await supabase.auth.getSession();
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
    {
      method: options?.method || 'POST',
      headers: {
        Authorization: `Bearer ${session.data.session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    }
  );
  
  if (!response.ok) {
    throw new Error(await response.text());
  }
  
  return response.json();
}
```

### 3.2 Logs de Auditoria (Opcional - Fase Futura)

Criar tabela `audit_logs` via migração SQL:

```sql
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function + apply to sensitive tables
```

**Nota**: Isso adiciona overhead ao banco. Recomendado apenas para tabelas críticas como `company_profile`, `tax_score`, `identified_credits`.

---

## Fase 4: Acessibilidade

### 4.1 Skip Links

Adicionar ao layout principal:

```html
<a href="#main-content" className="sr-only focus:not-sr-only ...">
  Pular para o conteúdo principal
</a>
```

### 4.2 ARIA Labels

Revisar componentes de navegação para incluir:
- `aria-label` em todos os botões de ícone
- `role="navigation"` no sidebar
- `role="main"` no conteúdo principal
- `aria-current="page"` no item de menu ativo

### 4.3 Contraste

Verificar e ajustar `tailwind.config.ts`:
- `--muted-foreground` de 63.9% para 70% (melhor contraste)
- Garantir tamanho mínimo de fonte 16px em textos importantes

---

## Cronograma de Implementação

| Fase | Prioridade | Estimativa | Impacto |
|------|------------|------------|---------|
| 1.1 Code Splitting | Alta | 2-3h | Bundle 50% menor |
| 1.2 Vite Optimization | Alta | 30min | Build otimizado |
| 1.3 LoadingSpinner | Alta | 15min | UX durante lazy load |
| 2.1 Connection Status | Média | 1h | UX offline |
| 2.2 Atalhos expandidos | Média | 1h | Power users |
| 3.1 API Layer | Baixa | Gradual | Manutenibilidade |
| 3.2 Audit Logs | Baixa | 2h | Compliance |
| 4.x Acessibilidade | Média | 2h | Inclusão |

---

## O Que JÁ Está Implementado (Não Requer Ação)

1. **RLS em todas as tabelas** - 77 tabelas protegidas com 234 políticas
2. **Rate Limiting** - Sistema completo em `_shared/rate-limiter.ts` com tiers por plano
3. **Autenticação manual em Edge Functions** - Padrão `verify_jwt=false` com `getClaims()`
4. **Skeleton loading** - 27 componentes já usam
5. **Atalho Cmd+K para Clara** - Implementado em `useKeyboardShortcuts.ts`
6. **Validação de entrada** - Presente em formulários principais
7. **Sanitização HTML** - DOMPurify configurado no ClaraAI
8. **SECURITY DEFINER com search_path** - Todas as funções seguras
9. **PWA com Service Worker** - Configurado no Vite

---

## Detalhes Técnicos

### Estrutura de Arquivos a Criar

```
src/
├── components/
│   ├── ui/
│   │   └── loading-spinner.tsx (NOVO)
│   └── ConnectionStatus.tsx (NOVO)
├── lib/
│   └── api/
│       └── index.ts (NOVO)
└── hooks/
    └── useGlobalShortcuts.ts (NOVO)
```

### Arquivos a Modificar

```
vite.config.ts - Adicionar otimizações de build
src/App.tsx - Implementar lazy loading + ConnectionStatus
src/hooks/useKeyboardShortcuts.ts - Expandir atalhos
```

---

## Recomendação

Sugiro implementar na seguinte ordem:
1. **Fase 1 (Performance)** - Impacto imediato no bundle e tempo de carregamento
2. **Fase 2.1 (Connection Status)** - Melhoria de UX simples e valiosa
3. **Fase 4 (Acessibilidade)** - Conformidade e inclusão
4. **Fases 2.2 e 3** - Melhorias incrementais

O sistema de segurança já está robusto. A prioridade deve ser performance e UX.
