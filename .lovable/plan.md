
# Plano: Corrigir Acesso ao Painel Executivo para Plano Enterprise

## Problema Identificado

O componente `PainelExecutivo.tsx` usa uma hierarquia de planos **duplicada e desatualizada** que não reconhece o plano `ENTERPRISE`. Isso faz com que usuários Enterprise vejam o prompt de upgrade mesmo tendo acesso total.

**Código problemático (linhas 20-31):**
```typescript
const PLAN_HIERARCHY = {
  'FREE': 0,
  'BASICO': 1,
  'PROFISSIONAL': 2,
  'PREMIUM': 3,  // ENTERPRISE não existe aqui!
};
// ...
const userLevel = PLAN_HIERARCHY[currentPlan] || 0; // ENTERPRISE retorna 0!
```

## Solução

Substituir a lógica duplicada pelo hook `usePlanAccess()` que já existe e tem a hierarquia correta com mapeamento de planos legados.

---

## Mudanças Técnicas

### Arquivo: `src/pages/PainelExecutivo.tsx`

**1. Remover hierarquia duplicada (linhas 20-25)**

Excluir completamente:
```typescript
const PLAN_HIERARCHY = {
  'FREE': 0,
  'BASICO': 1,
  'PROFISSIONAL': 2,
  'PREMIUM': 3,
};
```

**2. Substituir import do useAuth pelo usePlanAccess**

Antes:
```typescript
import { useAuth } from "@/hooks/useAuth";
```

Depois:
```typescript
import { useAuth } from "@/hooks/useAuth";
import { usePlanAccess } from "@/hooks/useFeatureAccess";
```

**3. Simplificar lógica de acesso**

Antes:
```typescript
const { user, profile } = useAuth();
const currentPlan = profile?.plano || 'FREE';
const userLevel = PLAN_HIERARCHY[currentPlan as keyof typeof PLAN_HIERARCHY] || 0;
const hasPremiumAccess = userLevel >= PLAN_HIERARCHY['PREMIUM'];
```

Depois:
```typescript
const { user, profile } = useAuth();
const { isProfessional } = usePlanAccess();
const hasPremiumAccess = isProfessional; // Professional+ tem acesso
```

**Nota:** Segundo a matriz de planos, o Painel Executivo é para `PROFESSIONAL+` (não apenas PREMIUM/ENTERPRISE). O hook `usePlanAccess` já trata corretamente isso.

---

## Hierarquia Correta (já existe em useFeatureAccess.ts)

```typescript
const LEGACY_PLAN_MAP = {
  'FREE': 'FREE',
  'BASICO': 'NAVIGATOR',
  'PROFISSIONAL': 'PROFESSIONAL',
  'PREMIUM': 'ENTERPRISE',     // ← Mapeia legado
  'NAVIGATOR': 'NAVIGATOR',
  'PROFESSIONAL': 'PROFESSIONAL',
  'ENTERPRISE': 'ENTERPRISE',  // ← Seu plano!
};

const PLAN_HIERARCHY = {
  'FREE': 0,
  'NAVIGATOR': 1,
  'PROFESSIONAL': 2,
  'ENTERPRISE': 3,  // ← Reconhece ENTERPRISE
};
```

---

## Resultado Esperado

| Plano | Antes | Depois |
|-------|-------|--------|
| FREE | Bloqueado | Bloqueado |
| NAVIGATOR | Bloqueado | Bloqueado |
| PROFESSIONAL | Bloqueado | **Acesso total** |
| ENTERPRISE | **Bloqueado (BUG)** | **Acesso total** |

---

## Verificação Pós-Implementação

1. Acessar `/dashboard/executivo` com usuário ENTERPRISE
2. Confirmar que o painel completo é exibido (Termômetro, Projetos, etc.)
3. Testar geração de relatórios PDF e Clara AI
