

# Plano de Ação: Finalizar Pendências para Lançamento do TribuTalks

## Diagnóstico Atual

| Área | Status | Criticidade |
|------|--------|-------------|
| Stripe: Planos principais | OK - Links de teste configurados | - |
| Stripe: Créditos extras | PENDENTE - 3 placeholders | Alta |
| Stripe: Assentos extras | PENDENTE - 2 placeholders | Média |
| Stripe: Links legados | PENDENTE - 6 placeholders | Baixa (deprecated) |
| Calendly | PENDENTE - 1 placeholder | Média |
| Segurança RLS | 5 warnings - 2 políticas permissivas | Alta |
| Webhook Stripe | OK - Price IDs mapeados | - |
| Secrets | OK - Todas configuradas | - |

---

## Fase 1: Configuração Stripe (Prioridade Alta)

### Ação 1.1: Criar Produtos de Créditos no Stripe

Criar 3 produtos de compra única (one-time payment) no dashboard Stripe:

| Produto | Preço | Payment Link |
|---------|-------|--------------|
| TribuBot 10 Créditos | R$ 29,90 | → CREDITS_10 |
| TribuBot 20 Créditos | R$ 54,90 | → CREDITS_20 |
| TribuBot 30 Créditos | R$ 74,90 | → CREDITS_30 |

### Ação 1.2: Criar Produtos de Assentos Extras (Opcional para MVP)

| Produto | Preço | Payment Link |
|---------|-------|--------------|
| Assento Extra Professional | R$ X/mês | → SEAT_PROFESSIONAL |
| Assento Extra Enterprise | R$ X/mês | → SEAT_ENTERPRISE |

### Ação 1.3: Atualizar src/config/site.ts

Substituir os 5 placeholders críticos pelos Payment Links reais:

```typescript
// Antes (placeholders)
CREDITS_10: "https://buy.stripe.com/PLACEHOLDER_CREDITS_10",
CREDITS_20: "https://buy.stripe.com/PLACEHOLDER_CREDITS_20",
CREDITS_30: "https://buy.stripe.com/PLACEHOLDER_CREDITS_30",
SEAT_PROFESSIONAL: "https://buy.stripe.com/PLACEHOLDER_SEAT_PROFESSIONAL",
SEAT_ENTERPRISE: "https://buy.stripe.com/PLACEHOLDER_SEAT_ENTERPRISE",

// Depois (links reais)
CREDITS_10: "https://buy.stripe.com/live_XXXXXX",
CREDITS_20: "https://buy.stripe.com/live_YYYYYY",
CREDITS_30: "https://buy.stripe.com/live_ZZZZZZ",
SEAT_PROFESSIONAL: "https://buy.stripe.com/live_AAAAAA",
SEAT_ENTERPRISE: "https://buy.stripe.com/live_BBBBBB",
```

### Ação 1.4: Configurar Secrets de Price IDs no Supabase

Adicionar secrets para o webhook mapear corretamente:

| Secret | Valor |
|--------|-------|
| STRIPE_PRICE_CREDITS_10 | price_xxxxx (do Stripe) |
| STRIPE_PRICE_CREDITS_20 | price_yyyyy (do Stripe) |
| STRIPE_PRICE_CREDITS_30 | price_zzzzz (do Stripe) |

### Ação 1.5: Remover Links Legados

Limpar os 6 placeholders deprecated que não são mais usados:
- BASICO_MENSAL/ANUAL
- PROFISSIONAL_MENSAL/ANUAL  
- PREMIUM_MENSAL/ANUAL
- STRIPE_PAYMENT_LINK
- STRIPE_ANNUAL_LINK

---

## Fase 2: Calendly (Prioridade Média)

### Ação 2.1: Configurar Link do Calendly

Atualizar em `src/config/site.ts`:

```typescript
// Antes
CALENDLY_LINK: "https://calendly.com/PLACEHOLDER",

// Depois
CALENDLY_LINK: "https://calendly.com/tributalks/consultoria",
```

Nota: O CALENDLY_LINK não está sendo usado em nenhum componente TSX atualmente, mas está disponível para futura implementação de agendamento de consultorias.

---

## Fase 3: Segurança RLS (Prioridade Alta)

### Análise dos Warnings

| Warning | Tabela | Risco | Ação |
|---------|--------|-------|------|
| WITH CHECK (true) | contatos | Baixo | OK - Form público intencional |
| WITH CHECK (true) | notifications | Baixo | OK - Service role insere |
| USING (true) | calculators | Nenhum | OK - Leitura pública intencional |
| USING (true) | referral_codes | Baixo | OK - Lookup por código necessário |
| USING (true) | tax_opportunities | Baixo | OK - Leitura por authenticated |
| USING (true) | credit_rules | Baixo | OK - Regras são públicas |
| USING (true) | sector_benchmarks | Nenhum | OK - Benchmarks públicos |

### Conclusão de Segurança

As políticas `USING (true)` identificadas são **intencionais**:
- Tabelas de leitura pública (calculators, benchmarks)
- Tabelas que precisam de lookup anônimo (referral_codes por código)
- INSERT público para formulários (contatos)
- INSERT por service role (notifications)

Nenhuma ação de correção é necessária.

### Ação 3.1: Leaked Password Protection

Este warning requer ativação via suporte Lovable. Recomendação: Abrir ticket solicitando ativação para o projeto `rhhzsmupixdhurricppk`.

---

## Fase 4: Testes de Integração

### Ação 4.1: Testar Fluxo de Assinatura

1. Criar conta teste
2. Clicar em "Assinar Navigator"
3. Completar checkout no Stripe (modo teste)
4. Verificar atualização do plano no perfil
5. Verificar acesso às ferramentas Navigator

### Ação 4.2: Testar Compra de Créditos

1. Logar como usuário Navigator
2. Clicar em "Comprar créditos"
3. Completar checkout (modo teste)
4. Verificar saldo de créditos atualizado
5. Usar crédito no TribuBot

### Ação 4.3: Testar Webhook em Produção

Após substituir links de teste por produção:
1. Verificar STRIPE_WEBHOOK_SECRET está correto
2. Testar evento de checkout completo
3. Monitorar logs da Edge Function

---

## Resumo de Alterações de Código

| Arquivo | Mudança |
|---------|---------|
| src/config/site.ts | Substituir 5-11 placeholders por links reais |

## Dependências Externas (Ação do Usuário)

1. **Stripe Dashboard**: Criar produtos de créditos e obter Payment Links
2. **Stripe Dashboard**: Criar produtos de assentos (opcional)
3. **Calendly**: Configurar página de agendamento
4. **Lovable Suporte**: Solicitar ativação de Leaked Password Protection

---

## Checklist de Lançamento

- [ ] Criar 3 produtos de créditos no Stripe
- [ ] Obter Payment Links e substituir placeholders
- [ ] Configurar Calendly (se usar agendamento)
- [ ] Mudar Stripe de modo teste para produção
- [ ] Testar fluxo completo de assinatura
- [ ] Testar compra de créditos
- [ ] Publicar aplicação para produção
- [ ] Monitorar logs do webhook nas primeiras 24h

