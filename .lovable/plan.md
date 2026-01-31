
# Corrigir Links dos Planos para Stripe

## Problema Identificado

Os botões de planos estão redirecionando para `/cadastro?plan=...` em vez de links Stripe. Para usuários já logados, o `PublicRoute` intercepta e redireciona para o dashboard.

---

## Correções Necessárias

### 1. Arquivo: `src/config/site.ts`

**Linha 11** - Corrigir `PROFESSIONAL_MENSAL` para usar link Stripe:

```typescript
// Antes
PROFESSIONAL_MENSAL: "/cadastro?plan=professional",

// Depois
PROFESSIONAL_MENSAL: "https://buy.stripe.com/LINK_DO_STRIPE_PROFESSIONAL_MENSAL",
```

> **Ação necessária**: Você precisa fornecer o link correto do Stripe para o Professional Mensal, pois só você tem acesso ao painel Stripe.

---

### 2. Arquivo: `src/components/landing/JourneysSection.tsx`

**Problema**: Esta seção usa links internos hardcoded em vez dos links do CONFIG.

**Solução**: Importar CONFIG e usar os links Stripe corretos.

**Mudanças**:
1. Importar `CONFIG` de `@/config/site`
2. Atualizar cada journey para usar os links do Stripe
3. Adicionar lógica para abrir links externos em nova aba

```typescript
import { CONFIG } from "@/config/site";

const journeys = [
  {
    id: "starter",
    // ... outras props
    link: CONFIG.PAYMENT_LINKS.STARTER_MENSAL,  // Link Stripe
  },
  {
    id: "navigator",
    // ... outras props
    link: CONFIG.PAYMENT_LINKS.NAVIGATOR_MENSAL,  // Link Stripe
  },
  {
    id: "professional",
    // ... outras props
    link: CONFIG.PAYMENT_LINKS.PROFESSIONAL_MENSAL,  // Link Stripe
  },
];
```

4. Atualizar o botão para abrir links externos:

```tsx
{journey.link.startsWith("http") ? (
  <a href={journey.link} target="_blank" rel="noopener noreferrer">
    <Button ...>{journey.ctaText}</Button>
  </a>
) : (
  <Link to={journey.link}>
    <Button ...>{journey.ctaText}</Button>
  </Link>
)}
```

---

## Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| `src/config/site.ts` | Corrigir `PROFESSIONAL_MENSAL` com link Stripe real |
| `src/components/landing/JourneysSection.tsx` | Usar links do CONFIG + abrir externos em nova aba |

---

## Resultado Esperado

- Todos os botões de planos abrirão o Stripe checkout diretamente
- Funciona para visitantes E usuários já logados
- Consistência entre `JourneysSection` e `PricingSection`
