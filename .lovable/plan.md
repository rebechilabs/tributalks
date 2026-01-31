
# Correção: Remover Opção Anual dos Planos Navigator e Professional

## Problema Identificado
Os planos Navigator e Professional estão exibindo preços anuais calculados (R$ 1.081/mês e R$ 2.498/mês) quando o toggle "Anual" é selecionado, mas esses planos **não possuem** opção anual real no Mercado Pago. Isso pode confundir o usuário, pois ao clicar, será redirecionado para o plano mensal.

## Solução Proposta
Modificar a interface para que Navigator e Professional mostrem **apenas o preço mensal**, mesmo quando o toggle "Anual" estiver selecionado. A badge "2 meses grátis" só aparecerá para o plano Starter (que tem plano anual real).

## Alterações Necessárias

### 1. src/components/landing/PricingSection.tsx

**A. Adicionar propriedade `hasAnnual` ao tipo `Plan`:**
```typescript
interface Plan {
  // ... campos existentes
  hasAnnual?: boolean; // indica se o plano tem opção anual
}
```

**B. Marcar apenas Starter com `hasAnnual: true`:**
```typescript
{
  name: "STARTER",
  hasAnnual: true, // Starter tem plano anual
  // ...
}
```

**C. Ajustar lógica de exibição de preço:**
- Se `hasAnnual` for `false/undefined`, sempre mostrar preço mensal
- Se `hasAnnual` for `true`, seguir lógica atual do toggle

**D. Ajustar texto "cobrado anualmente":**
- Só exibir para planos com `hasAnnual: true`

**E. Opcional: Mostrar indicador visual**
- Adicionar texto discreto "(somente mensal)" abaixo do preço para Navigator e Professional quando toggle anual estiver ativo

## Comportamento Esperado Após Correção

| Plano | Toggle Mensal | Toggle Anual |
|-------|--------------|--------------|
| Starter | R$ 397/mês | R$ 331/mês (R$ 3.970/ano) |
| Navigator | R$ 1.297/mês | R$ 1.297/mês *(somente mensal)* |
| Professional | R$ 2.997/mês | R$ 2.997/mês *(somente mensal)* |
| Enterprise | Sob consulta | Sob consulta |

## Seção Técnica

### Mudanças no tipo Plan (linhas 17-31):
```typescript
interface Plan {
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  highlighted?: boolean;
  popular?: boolean;
  isEnterprise?: boolean;
  trialDays?: number;
  hasAnnual?: boolean; // NOVO: indica disponibilidade de plano anual
  features: PlanFeature[];
  ctaText: string;
  linkMonthly: string;
  linkAnnual: string;
  cnpjLimit: string;
}
```

### Atualização dos planos (linhas 33-123):
```typescript
// STARTER - adicionar hasAnnual: true
{
  name: "STARTER",
  hasAnnual: true,
  // ... resto igual
}

// NAVIGATOR - remover priceAnnual (ou deixar 0)
{
  name: "NAVIGATOR",
  priceAnnual: 0, // Sem plano anual
  // ... resto igual
}

// PROFESSIONAL - remover priceAnnual (ou deixar 0)
{
  name: "PROFESSIONAL",
  priceAnnual: 0, // Sem plano anual
  // ... resto igual
}
```

### Lógica de exibição de preço (linhas 175-181):
```typescript
// Verificar se plano tem opção anual disponível
const effectiveBillingPeriod = plan.hasAnnual ? billingPeriod : "mensal";
const price = effectiveBillingPeriod === "mensal" 
  ? plan.priceMonthly 
  : plan.priceAnnual;
const link = effectiveBillingPeriod === "mensal" 
  ? plan.linkMonthly 
  : plan.linkAnnual;
```

### Exibição do preço (linhas 229-240):
```typescript
<span className="text-3xl md:text-4xl font-bold text-foreground">
  R${effectiveBillingPeriod === "mensal" 
    ? price.toLocaleString('pt-BR') 
    : Math.round(price / 12).toLocaleString('pt-BR')}
</span>
<span className="text-muted-foreground text-sm">/mês</span>

{/* Mostrar "cobrado anualmente" apenas para planos com anual */}
{effectiveBillingPeriod === "anual" && price > 0 && (
  <p className="text-xs text-muted-foreground mt-1">
    R${price.toLocaleString('pt-BR')} cobrado anualmente
  </p>
)}

{/* Indicador "somente mensal" quando toggle anual está ativo mas plano não tem anual */}
{billingPeriod === "anual" && !plan.hasAnnual && !plan.isEnterprise && (
  <p className="text-xs text-muted-foreground/70 mt-1 italic">
    (disponível apenas mensal)
  </p>
)}
```

## Impacto Visual
- Quando usuário selecionar "Anual", apenas Starter mostrará desconto
- Navigator e Professional manterão preço mensal com indicação discreta
- Badge "2 meses grátis" continua aparecendo (Starter aproveita)
- Fluxo de checkout fica transparente (usuário sabe o que está contratando)
