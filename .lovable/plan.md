
# Liberar Suíte Margem Ativa para Professional e Enterprise

## Objetivo
Alterar o controle de acesso da **Suíte Margem Ativa 2026** para que usuários dos planos **Professional** e **Enterprise** tenham acesso à funcionalidade.

---

## Alterações Necessárias

### 1. Sidebar Desktop
**Arquivo:** `src/components/dashboard/Sidebar.tsx`

- Alterar o `requiredPlan` do item "Suíte Margem Ativa" de `'ENTERPRISE'` para `'PROFESSIONAL'`
- Isso permitirá que usuários Professional e Enterprise vejam e acessem o menu

### 2. Menu Mobile
**Arquivo:** `src/components/dashboard/MobileNav.tsx`

- Adicionar o item "Suíte Margem Ativa" ao grupo de navegação móvel
- Configurar com `requiredPlan: 'PROFESSIONAL'` para consistência com desktop

---

## Impacto

| Plano | Antes | Depois |
|-------|-------|--------|
| Free | Bloqueado | Bloqueado |
| Navigator | Bloqueado | Bloqueado |
| Professional | Bloqueado | **Liberado** |
| Enterprise | Liberado | Liberado |

---

## Detalhes Técnicos

A hierarquia de planos já está configurada corretamente no sistema:
```
FREE (0) < NAVIGATOR (1) < PROFESSIONAL (2) < ENTERPRISE (3)
```

Ao definir `requiredPlan: 'PROFESSIONAL'`, a função `hasAccess()` automaticamente concede acesso para Professional (nível 2) e Enterprise (nível 3).

Não são necessárias alterações no hook `useFeatureAccess` nem na página `MargemAtiva.tsx`, pois o controle de acesso é feito exclusivamente pela navegação.
