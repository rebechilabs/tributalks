
# Plano de Correção: Loop de Refresh Infinito no Fluxo de Autenticação

## Diagnóstico do Problema

Após análise detalhada dos logs do backend e do código, identifiquei que o site publicado (tributechai.lovable.app) está fazendo chamadas `/user` a cada 2-7 segundos, confirmando um **loop de refresh infinito**.

**Causa Raiz:** 
Existe um conflito entre múltiplos pontos de redirecionamento que não coordenam entre si, resultando em um ciclo infinito:

1. `Login.tsx` verifica sessão → se existe, redireciona via `window.location.href`
2. `ProtectedRoute.tsx` verifica sessão novamente → pode redirecionar para login ou onboarding
3. `Onboarding.tsx` verifica profile → se onboarding completo, redireciona para dashboard
4. Cada redirecionamento via `window.location.href` causa reload completo da página
5. O ciclo recomeça

---

## Solução Proposta

### 1. Remover Verificação de Sessão no Login.tsx

**Arquivo:** `src/pages/Login.tsx`

A página de login NÃO deve verificar sessão existente no mount. Essa responsabilidade deve ser do router/auth provider. Se o usuário tentar acessar `/login` já autenticado, o React Router deve lidar com isso através de uma rota condicional.

**Mudança:**
- Remover o `useEffect` que verifica sessão existente (linhas 23-77)
- Iniciar `pageState` como `'ready'` em vez de `'checking'`
- Manter apenas o fluxo de login normal

### 2. Criar Rota Pública Condicional no App.tsx

**Arquivo:** `src/App.tsx`

Criar um componente `PublicRoute` que redireciona usuários autenticados para o dashboard, evitando que acessem login/cadastro quando já logados.

**Mudança:**
- Criar componente `PublicRoute` que verifica auth e redireciona se já logado
- Envolver rotas `/login` e `/cadastro` com `PublicRoute`

### 3. Simplificar ProtectedRoute

**Arquivo:** `src/components/ProtectedRoute.tsx`

O ProtectedRoute atual tem um bug: usa `authState` dentro do timeout mas não está nas dependências. Também faz verificações de sessão que podem conflitar com o AuthProvider.

**Mudança:**
- Usar `useAuth()` do hook global em vez de verificar sessão diretamente
- Remover verificação redundante de sessão
- Corrigir a closure do timeout

### 4. Consolidar Lógica de Redirecionamento no Onboarding

**Arquivo:** `src/pages/Onboarding.tsx`

Remover o redirecionamento via `window.location.href` e usar React Router para navegação, evitando reloads de página inteira.

**Mudança:**
- Usar `navigate('/dashboard', { replace: true })` em vez de `window.location.href`
- Adicionar flag para prevenir redirecionamentos duplos

---

## Implementação Detalhada

### Passo 1: Criar PublicRoute Component

```text
Novo arquivo: src/components/PublicRoute.tsx

- Verifica se usuário está autenticado via useAuth()
- Se autenticado, redireciona para /dashboard
- Se não, renderiza children normalmente
- Mostra loading enquanto verifica
```

### Passo 2: Atualizar App.tsx

```text
- Importar PublicRoute
- Envolver rotas /login e /cadastro com PublicRoute
```

### Passo 3: Simplificar Login.tsx

```text
- Remover useEffect de verificação de sessão
- Iniciar pageState como 'ready'
- Manter apenas lógica de submissão de login
- Usar navigate() para redirecionamento pós-login
```

### Passo 4: Refatorar ProtectedRoute.tsx

```text
- Usar useAuth() hook global
- Simplificar lógica de verificação
- Usar Navigate do React Router em vez de window.location
```

### Passo 5: Atualizar Onboarding.tsx

```text
- Substituir window.location.href por navigate()
- Adicionar flag isRedirecting para prevenir loops
```

---

## Resultado Esperado

1. **Sem loops de refresh**: Navegação via React Router não causa reload de página
2. **Fluxo unidirecional**: Cada componente tem responsabilidade clara
3. **Estado centralizado**: useAuth() é a única fonte de verdade
4. **Experiência fluida**: Transições instantâneas sem piscar tela

---

## Detalhes Técnicos

### Arquivos a serem modificados:
1. `src/components/PublicRoute.tsx` (novo)
2. `src/App.tsx`
3. `src/pages/Login.tsx`
4. `src/components/ProtectedRoute.tsx`
5. `src/pages/Onboarding.tsx`

### Fluxo corrigido:

```text
Usuário acessa /login
      ↓
PublicRoute verifica auth
      ↓
Se autenticado? → Navigate para /dashboard
      ↓ (se não)
Mostra formulário de login
      ↓ (após login)
navigate() para /dashboard ou /onboarding
      ↓
ProtectedRoute verifica (já tem sessão)
      ↓
Renderiza página
```

### Considerações:
- Todas as navegações usarão React Router (`navigate()` ou `<Navigate>`)
- `window.location.href` será removido dos fluxos de auth (exceto OAuth callbacks)
- O AuthProvider permanece como fonte única de verdade para estado de auth
