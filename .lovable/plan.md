

# Correção: Carregamento Lento do Perfil

## Problema Identificado

Após preencher todas as informações no perfil, a página demora porque:

1. **O hook `useAuth` aguarda 500ms artificialmente** no `refreshProfile` 
2. **Componentes fazem queries independentes**:
   - `AchievementList` → busca todos os achievements do usuário
   - `NotificationBell` → busca notificações 
3. **`StreakDisplay` não recebe dados** - foi refatorado para props, mas a página de Perfil não passa dados

### Fluxo Atual (Problema)

```text
Usuário clica "Salvar"
        ↓
    Atualiza profiles no banco (OK)
        ↓
    Chama refreshProfile()
        ↓
    Aguarda 500ms (DESNECESSÁRIO!)
        ↓
    Busca perfil do banco
        ↓
    AchievementList faz sua query
    NotificationBell faz sua query
        ↓
    Página finalmente carrega
```

## Solução

### 1. Remover delay artificial no refreshProfile

O delay de 500ms foi adicionado para o fluxo de pagamento, mas não é necessário no contexto do perfil:

```typescript
// src/hooks/useAuth.tsx
// ANTES:
const refreshProfile = async () => {
  if (user) {
    await new Promise(resolve => setTimeout(resolve, 500)); // ← REMOVER
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  }
};

// DEPOIS:
const refreshProfile = async () => {
  if (user) {
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  }
};
```

### 2. Criar hook leve para página de Perfil

Criar um `useProfilePageData` que busca apenas os dados essenciais para a página de perfil:

```typescript
// src/hooks/useProfilePageData.ts
export function useProfilePageData() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profile-page-data', user?.id],
    queryFn: async () => {
      const [achievements, streakData] = await Promise.all([
        supabase.from("user_achievements").select("*").eq("user_id", userId),
        supabase.from("profiles")
          .select("current_streak, longest_streak, last_access_date")
          .eq("user_id", userId)
          .maybeSingle()
      ]);
      
      return { achievements: achievements.data || [], streakData: streakData.data };
    },
    enabled: !!user?.id,
    staleTime: 60000,
  });
}
```

### 3. Atualizar página de Perfil

Usar o novo hook e passar dados via props:

```typescript
// src/pages/Perfil.tsx
const { data: pageData, isLoading: pageLoading } = useProfilePageData();

// Passar dados para componentes
<AchievementListOptimized achievements={pageData?.achievements} />
<StreakDisplay streakData={pageData?.streakData} showLongest />
```

### 4. Criar versão otimizada de AchievementList

Criar `AchievementListOptimized` que recebe dados via props em vez de buscar internamente.

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useAuth.tsx` | Remover delay de 500ms do refreshProfile |
| `src/hooks/useProfilePageData.ts` | **Criar** - Hook consolidado para página de perfil |
| `src/pages/Perfil.tsx` | Usar novo hook e passar dados via props |
| `src/components/achievements/AchievementList.tsx` | Aceitar achievements via props (opcional, com fallback) |

## Benefícios Esperados

| Métrica | Antes | Depois |
|---------|-------|--------|
| Delay artificial | 500ms | 0ms |
| Queries ao salvar | 3+ | 1 |
| Tempo de "Salvando..." | ~2s | ~500ms |

## Fluxo Corrigido

```text
Usuário clica "Salvar"
        ↓
    Atualiza profiles (imediato)
        ↓
    refreshProfile() sem delay
        ↓
    Dados do cache do React Query são usados
        ↓
    Toast de sucesso (instantâneo)
```

