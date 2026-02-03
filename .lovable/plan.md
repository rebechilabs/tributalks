
# Plano: Adicionar Link Stripe para Plano Professional Anual

## Objetivo
Atualizar o link do Stripe para o plano Professional anual com o novo link fornecido pelo usuário.

---

## Alteração Necessária

### Arquivo: `src/config/site.ts`

**O que será alterado:**
- Linha 12: Substituir o link atual do `PROFESSIONAL_ANUAL` pelo novo link fornecido

**De:**
```typescript
PROFESSIONAL_ANUAL: "https://buy.stripe.com/3cI9AM3V89TEgmn2Uubo406",
```

**Para:**
```typescript
PROFESSIONAL_ANUAL: "https://buy.stripe.com/bJe5kwcrE7Lw6LNdz8bo40c",
```

---

## Impacto

O novo link será automaticamente utilizado em:
1. **PricingSection** (seção de planos) - quando o toggle "Anual" estiver ativo
2. **JourneysSection** - caso seja adicionado suporte a plano anual futuramente

---

## Detalhes Técnicos

| Aspecto | Detalhe |
|---------|---------|
| Arquivo modificado | `src/config/site.ts` |
| Linhas afetadas | 1 linha (linha 12) |
| Risco | Baixo - apenas atualização de URL |
| Testes necessários | Verificar botão "Assinar Professional" com toggle anual ativo |
