

## Plano: Liberar Relatórios PDF para Navigator

### Objetivo
Alterar o plano mínimo da feature `relatorios_pdf` de **PROFESSIONAL** para **NAVIGATOR**, permitindo que usuários do plano Navigator gerem relatórios PDF profissionais.

---

### Alteração Necessária

**Arquivo**: `src/hooks/useFeatureAccess.ts`

**Linha 90** - Alterar:
```typescript
// DE:
relatorios_pdf: { minPlan: 'PROFESSIONAL' },

// PARA:
relatorios_pdf: { minPlan: 'NAVIGATOR' },
```

---

### Impacto

| Plano | Antes | Depois |
|-------|-------|--------|
| FREE | Bloqueado | Bloqueado |
| NAVIGATOR | Bloqueado | **Liberado** |
| PROFESSIONAL | Liberado | Liberado |
| ENTERPRISE | Liberado | Liberado |

---

### Componentes Afetados

Os seguintes componentes que utilizam `FeatureGate feature="relatorios_pdf"` passarão a exibir conteúdo desbloqueado para Navigator:

- Score Tributário (PDF)
- Radar de Créditos (PDF)
- Checklist da Reforma (PDF)
- DRE Inteligente (PDF)
- Relatórios Executivos

---

### Atualização na Landing Page (Opcional)

Se desejar atualizar a seção de planos para refletir essa mudança, será necessário adicionar "Relatórios PDF" na lista de features do plano Navigator em `src/components/landing/PricingSection.tsx`.

