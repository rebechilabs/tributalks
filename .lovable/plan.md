

## Plano: Liberar Relatórios para o Plano Navigator

### Objetivo
Habilitar o acesso aos relatórios executivos (Clara AI Reports e PDF) para usuários do plano Navigator, que atualmente estão restritos ao plano Professional e superiores.

### Situação Atual
| Local | Estado | Necessita Mudança? |
|-------|--------|-------------------|
| `useFeatureAccess.ts` | `relatorios_pdf: { minPlan: 'NAVIGATOR' }` | Já correto |
| Edge Function | `allowedPlans = ["PROFESSIONAL", ...]` | **Sim** |
| Landing Page | Relatórios listados só no Professional | **Sim** |

### Alterações Necessárias

#### 1. Edge Function `generate-executive-report/index.ts`

Adicionar `NAVIGATOR` e `BASICO` (legado) à lista de planos permitidos na linha 354.

**De:**
```typescript
const allowedPlans = ["PROFESSIONAL", "PROFISSIONAL", "PREMIUM", "ENTERPRISE"];
```

**Para:**
```typescript
const allowedPlans = ["NAVIGATOR", "BASICO", "PROFESSIONAL", "PROFISSIONAL", "PREMIUM", "ENTERPRISE"];
```

#### 2. Landing Page `PricingSection.tsx`

Adicionar o item "Relatórios PDF Clara AI" na lista de features do plano Navigator (após linha 68).

**Adicionar:**
```typescript
{ text: "Relatórios PDF Clara AI", included: true },
```

### Estrutura Visual Final

```text
┌────────────────────────────────────────────────────────────┐
│ NAVIGATOR (R$ 697/mês)                                     │
│ ─────────────────────────────────────────────────────────  │
│ ✅ Clara AI (Copiloto) - 10 msgs/dia                       │
│ ✅ Score Tributário                                        │
│ ✅ Simulador Split Payment                                 │
│ ✅ Comparativo de Regimes                                  │
│ ✅ Calculadora RTC (CBS/IBS/IS)                            │
│ ✅ Calculadora NBS (Serviços)                              │
│ ✅ Newsletter Tributalks News                              │
│ ✅ Timeline 2026-2033                                      │
│ ✅ Feed de Notícias + Pílula do Dia                        │
│ ✅ Relatórios PDF Clara AI  ← NOVO                         │
└────────────────────────────────────────────────────────────┘
```

### Arquivos a Modificar

| Arquivo | Ação | Linhas |
|---------|------|--------|
| `supabase/functions/generate-executive-report/index.ts` | Adicionar NAVIGATOR aos planos permitidos | 354 |
| `src/components/landing/PricingSection.tsx` | Adicionar feature de relatórios | 68-69 |

### Detalhes Técnicos

**Edge Function:**
- A verificação de plano usa normalização para nomenclaturas legadas (`BASICO` → `NAVIGATOR`)
- Após a mudança, usuários Navigator terão acesso imediato aos 5 tipos de relatórios:
  - Relatório Executivo Mensal
  - Análise da DRE
  - Radar de Créditos
  - Impacto da Reforma
  - Mapa de Oportunidades

**Frontend:**
- O hook `useFeatureAccess` já tem `relatorios_pdf` configurado para `NAVIGATOR`
- O componente `ClaraReportGenerator` não precisa de alteração (usa a Edge Function)

