
# Ajuste dos Planos Anuais Navigator e Professional

## Resumo

Os planos anuais do **NAVIGATOR** e **PROFESSIONAL** não serão oferecidos por enquanto. Vou ajustar a configuração e a interface para refletir isso corretamente.

---

## O que será feito

### 1. Atualizar Configuração (`src/config/site.ts`)
- Comentar os links anuais como "Não disponível" em vez de apontar para `/cadastro`
- Redirecionar para o link mensal como fallback

### 2. Ajustar Seção de Preços (`src/components/landing/PricingSection.tsx`)
- Quando o usuário selecionar **Anual** para Navigator ou Professional:
  - Usar o **link mensal** como fallback
  - Ou exibir um aviso de "Disponível apenas no plano mensal"

---

## Comportamento esperado

| Plano | Mensal | Anual |
|-------|--------|-------|
| **STARTER** | Link Mercado Pago | Link Mercado Pago |
| **NAVIGATOR** | Link Mercado Pago | Usa link mensal (fallback) |
| **PROFESSIONAL** | Link Mercado Pago | Usa link mensal (fallback) |
| **ENTERPRISE** | WhatsApp | WhatsApp |

---

## Detalhes técnicos

**Arquivo:** `src/config/site.ts`
```typescript
// Navigator - Apenas mensal disponível por enquanto
NAVIGATOR_MENSAL: "https://www.mercadopago.com.br/subscriptions/checkout?...",
NAVIGATOR_ANUAL: "", // Não disponível - usar mensal

// Professional - Apenas mensal disponível por enquanto  
PROFESSIONAL_MENSAL: "https://www.mercadopago.com.br/subscriptions/checkout?...",
PROFESSIONAL_ANUAL: "", // Não disponível - usar mensal
```

**Arquivo:** `src/components/landing/PricingSection.tsx`
- Adicionar lógica para fallback: se `linkAnnual` estiver vazio, usar `linkMonthly`
- O toggle "Anual" continuará funcionando normalmente para Starter

---

## Tempo estimado
~5 minutos
