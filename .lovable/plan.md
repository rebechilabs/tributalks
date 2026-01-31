

# Correção: Fluxo de Redirecionamento Após Pagamento

## Problema Identificado

Quando você completa uma compra no Mercado Pago:
1. O Mercado Pago redireciona de volta para o site
2. A página de confirmação tenta ir para o Dashboard
3. O Dashboard verifica se o onboarding está completo
4. Se o perfil ainda não atualizou (race condition), você é mandado de volta para onboarding/cadastro

**Causa raiz**: O sistema não espera o perfil atualizar antes de redirecionar.

## Solução Proposta

### 1. Tornar a página de confirmação inteligente
A página `/pagamento/confirmacao` precisa:
- Verificar se o usuário está logado
- Atualizar o perfil do banco antes de redirecionar
- Aguardar a sincronização antes de ir para o Dashboard

### 2. Evitar redirect para dashboard sem onboarding
Se o usuário veio do pagamento mas ainda não fez onboarding, direcionar para onboarding primeiro.

## Alterações Necessárias

### Arquivo 1: src/pages/PagamentoConfirmacao.tsx

Adicionar verificação de autenticação e refresh do perfil:

```typescript
// Adicionar imports
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

// Dentro do componente:
const { user, profile, loading, refreshProfile } = useAuth();

// Efeito para refresh do perfil quando chegar na página
useEffect(() => {
  if (user && !loading) {
    // Força atualização do perfil para pegar mudanças do webhook
    refreshProfile();
  }
}, [user, loading]);

// Modificar a lógica de redirect
useEffect(() => {
  if (config.redirectDelay) {
    // ... countdown logic existente ...
    
    // No momento do redirect, verificar onboarding
    const targetUrl = profile?.onboarding_complete 
      ? "/dashboard" 
      : "/onboarding";
    navigate(targetUrl);
  }
}, [config.redirectDelay, navigate, profile]);
```

### Arquivo 2: src/components/ProtectedRoute.tsx

Adicionar tratamento especial para usuários vindos de pagamento:

```typescript
// Se usuário veio da página de pagamento, dar tempo para o perfil sincronizar
if (requireOnboarding && !profile) {
  // Aguardar perfil carregar antes de decidir redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
```

### Arquivo 3: src/hooks/useAuth.tsx

Melhorar a função `refreshProfile` para forçar uma nova busca:

```typescript
const refreshProfile = async () => {
  if (user) {
    // Pequeno delay para dar tempo ao webhook processar
    await new Promise(resolve => setTimeout(resolve, 500));
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  }
};
```

## Fluxo Corrigido

```text
Usuário no Mercado Pago
         ↓
    Completa pagamento
         ↓
    Webhook processa (background)
         ↓
    Redirect → /pagamento/confirmacao?status=approved
         ↓
    Página chama refreshProfile()
         ↓
    Aguarda perfil atualizar
         ↓
    Verifica onboarding_complete?
         ↓
    ┌──── SIM ────┐     ┌──── NÃO ────┐
    ↓             ↓     ↓             ↓
/dashboard    /onboarding
```

## Comportamento Esperado

- Após pagar, você vê a tela de confirmação
- O sistema atualiza seus dados automaticamente
- Você é redirecionado para o lugar certo (dashboard se já fez onboarding, ou onboarding se ainda não fez)
- Sem loops de redirecionamento

## Seção Técnica

### PagamentoConfirmacao.tsx - Mudanças completas:

```typescript
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
// ... outros imports

export default function PagamentoConfirmacao() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh profile when arriving at page to get latest data from webhook
  useEffect(() => {
    const doRefresh = async () => {
      if (user && !loading && !isRefreshing) {
        setIsRefreshing(true);
        await refreshProfile();
        setIsRefreshing(false);
      }
    };
    doRefresh();
  }, [user, loading]);

  // Auto-redirect countdown - só começa após refresh
  useEffect(() => {
    if (config.redirectDelay && !loading && !isRefreshing) {
      // ... countdown logic ...
      
      // Determina destino baseado no estado do perfil
      const targetUrl = profile?.onboarding_complete 
        ? "/dashboard" 
        : "/onboarding";
      navigate(targetUrl);
    }
  }, [config.redirectDelay, navigate, profile, loading, isRefreshing]);

  // Loading state enquanto verifica
  if (loading || isRefreshing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ... resto do componente
}
```

### ProtectedRoute.tsx - Aguardar perfil:

```typescript
// Após verificar loading, antes de verificar onboarding:
if (requireOnboarding && profile === null && user) {
  // Profile ainda carregando, aguardar
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    </div>
  );
}
```

