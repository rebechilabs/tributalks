

## Problem Analysis

The ISS SUP opportunity is not being found because of a data mismatch between the company profile and the matching criteria:

- **ISS_SUP_001 requires**: `vende_servicos: true`, `segmento: servicos`, `regime_tributario` in `[lucro_presumido, lucro_real]`
- **Company profile has**: `segmento: servicos`, `setor: servicos_profissionais`, `regime_tributario: presumido` -- but `vende_servicos: false` and `percentual_servicos: 0`

A law firm (ADVOGADOS ASSOCIADOS) clearly sells services, but the profile field was never populated correctly. The matching engine treats all `criterios` as required (`isRequired = true`), so `vende_servicos: false` causes an immediate disqualification.

## Solution (two-part fix)

### 1. Infer `vende_servicos` from sector in the matching engine

In the `getDerivedValues()` function inside `match-opportunities/index.ts`, add logic to automatically derive `vende_servicos = true` when the company's `segmento` is `servicos` (and similarly, `vende_produtos = true` when segmento is `comercio` or `industria`). This prevents data entry gaps from blocking obvious matches.

### 2. Fix the existing company profile data

Run a one-time database update to set `vende_servicos = true` and `percentual_servicos = 100` for companies in the `servicos` segment that currently have `vende_servicos = false` (like the law firm in question).

---

### Technical Details

**Edge function change** (`supabase/functions/match-opportunities/index.ts`):

In the `getDerivedValues` function (~line 255), add sector-based inference:

```typescript
// Infer vende_servicos/vende_produtos from segmento when not explicitly set
if (profile.segmento === 'servicos' && !profile.vende_servicos) {
  derived.vende_servicos = true;
}
if ((profile.segmento === 'comercio' || profile.segmento === 'industria') && !profile.vende_produtos) {
  derived.vende_produtos = true;
}
```

**Database fix** (migration):

```sql
UPDATE company_profile
SET vende_servicos = true,
    percentual_servicos = CASE WHEN percentual_servicos = 0 THEN 100 ELSE percentual_servicos END
WHERE segmento = 'servicos'
  AND (vende_servicos IS NULL OR vende_servicos = false);
```

This ensures both existing profiles are corrected and future matching works even if the field is not explicitly set.
