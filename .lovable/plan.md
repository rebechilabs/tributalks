
# Plano de Atualização de Preços

## Resumo
Atualização dos valores dos planos Navigator e Professional em toda a aplicação.

---

## Alterações de Preço

| Plano | Preço Anterior | Novo Preço | Anual Anterior | Novo Anual |
|-------|----------------|------------|----------------|------------|
| Navigator | R$ 697/mês | R$ 1.997/mês | R$ 6.970/ano | R$ 19.970/ano |
| Professional | R$ 1.997/mês | R$ 2.997/mês | R$ 19.970/ano | R$ 29.970/ano |

---

## Arquivos a Modificar

### 1. `src/components/landing/PricingSection.tsx`
Atualizar os valores numéricos nas definições dos planos:
- Linha 58: `priceMonthly: 697` → `priceMonthly: 1997`
- Linha 59: `priceAnnual: 6970` → `priceAnnual: 19970`
- Linha 81: `priceMonthly: 1997` → `priceMonthly: 2997`
- Linha 82: `priceAnnual: 19970` → `priceAnnual: 29970`

### 2. `src/config/site.ts`
Atualizar comentários de documentação:
- Linha 6: `// Navigator - R$697/mês ou R$6.970/ano` → `// Navigator - R$1.997/mês ou R$19.970/ano`
- Adicionar comentário atualizado para Professional se existir

### 3. `src/hooks/useFeatureAccess.ts`
Atualizar strings de display:
- Linha 36: `'NAVIGATOR': 'R$ 697/mês'` → `'NAVIGATOR': 'R$ 1.997/mês'`
- Linha 37: `'PROFESSIONAL': 'R$ 1.997/mês'` → `'PROFESSIONAL': 'R$ 2.997/mês'`

### 4. `supabase/functions/clara-assistant/index.ts`
Atualizar mensagem de upsell da Clara:
- Linha 457: `Navigator (R$ 697/mês)` → `Navigator (R$ 1.997/mês)`
- Linha 458: `Professional (R$ 1.997/mês)` → `Professional (R$ 2.997/mês)`

### 5. `src/pages/NoticiasReforma.tsx`
Atualizar CTA de upgrade:
- Linha 311: `Upgrade para Navigator — R$ 697/mês` → `Upgrade para Navigator — R$ 1.997/mês`

---

## Impacto

- **Landing Page**: Reflete novos preços na seção de planos
- **Clara AI**: Mensagens de upgrade mostram valores corretos
- **Hooks de Acesso**: Mensagens de gate/upgrade consistentes
- **Páginas Internas**: CTAs de upgrade atualizados

---

## Observação Importante

Os **Payment Links do Stripe** precisarão ser atualizados no dashboard do Stripe com os novos preços. Os links atuais em `src/config/site.ts` continuarão funcionando, mas os valores cobrados devem ser ajustados diretamente no Stripe para refletir:
- Navigator Mensal: R$ 1.997
- Navigator Anual: R$ 19.970
- Professional Mensal: R$ 2.997
- Professional Anual: R$ 29.970
