
# Plano: Correção do Mapeamento de Planos Legados e Preços

## Problema Identificado

1. **Mapeamento Incorreto**: O plano legado `BASICO` está mapeando para `NAVIGATOR` quando deveria mapear para `STARTER`
2. **Preços Desatualizados**: Os preços em `PLAN_PRICES` não refletem os valores corretos

---

## Arquivo: `src/hooks/useFeatureAccess.ts`

### Correção 1: Mapeamento Legado (Linha 8)

| De | Para |
|----|------|
| `'BASICO': 'NAVIGATOR'` | `'BASICO': 'STARTER'` |

### Correção 2: Preços (Linhas 33-39)

| Plano | Atual | Correto |
|-------|-------|---------|
| FREE | R$ 0 | ✅ Mantém |
| STARTER | R$ 297/mês | ✅ Mantém |
| NAVIGATOR | R$ 1.997/mês | **R$ 697/mês** |
| PROFESSIONAL | R$ 2.997/mês | **R$ 1.997/mês** |
| ENTERPRISE | Sob consulta | ✅ Mantém |

---

## Código Atualizado

### LEGACY_PLAN_MAP (linha 6-15)
```typescript
const LEGACY_PLAN_MAP: Record<string, UserPlan> = {
  'FREE': 'FREE',
  'BASICO': 'STARTER',        // ← Corrigido
  'PROFISSIONAL': 'PROFESSIONAL',
  'PREMIUM': 'ENTERPRISE',
  'STARTER': 'STARTER',
  'NAVIGATOR': 'NAVIGATOR',
  'PROFESSIONAL': 'PROFESSIONAL',
  'ENTERPRISE': 'ENTERPRISE',
};
```

### PLAN_PRICES (linha 33-39)
```typescript
export const PLAN_PRICES: Record<UserPlan, string> = {
  'FREE': 'R$ 0',
  'STARTER': 'R$ 297/mês',
  'NAVIGATOR': 'R$ 697/mês',       // ← Corrigido
  'PROFESSIONAL': 'R$ 1.997/mês',  // ← Corrigido
  'ENTERPRISE': 'Sob consulta',
};
```

---

## Impacto

- Usuários com plano legado `BASICO` terão acesso correto às features do **STARTER** (não Navigator)
- Mensagens de upgrade exibirão os preços corretos em toda a aplicação
- Consistência com a Landing Page já corrigida
