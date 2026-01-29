

# Programa de Indicação TribuTech

## Resumo Executivo

Implementação de um sistema completo de indicação (referral) onde **todos os usuários** podem indicar novos assinantes e receber **desconto na mensalidade** após o indicado permanecer **30 dias como assinante ativo**.

---

## Fluxo do Programa

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLUXO DE INDICAÇÃO                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. INDICADOR gera link único                                           │
│         ↓                                                               │
│  2. INDICADO clica no link → cadastro com código                        │
│         ↓                                                               │
│  3. INDICADO assina plano pago                                          │
│         ↓                                                               │
│  4. Sistema aguarda 30 dias                                             │
│         ↓                                                               │
│  5. Se ainda ativo → INDICADOR ganha desconto                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementação

### 1. Banco de Dados

Criar duas novas tabelas para gerenciar o programa:

**Tabela: `referral_codes`**
- Armazena o código único de cada usuário
- Gerado automaticamente no primeiro acesso à página de indicação

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| user_id | uuid | Referência ao usuário |
| code | text | Código único (ex: ABC123XY) |
| total_referrals | integer | Total de indicações feitas |
| successful_referrals | integer | Indicações que geraram recompensa |
| created_at | timestamp | Data de criação |

**Tabela: `referrals`**
- Rastreia cada indicação individualmente
- Controla o ciclo de vida da recompensa

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| referrer_id | uuid | Quem indicou |
| referred_id | uuid | Quem foi indicado |
| referral_code | text | Código usado |
| status | text | pending / qualified / rewarded / expired |
| referred_at | timestamp | Data do cadastro |
| subscription_started_at | timestamp | Quando assinou plano pago |
| qualified_at | timestamp | Quando completou 30 dias |
| reward_applied_at | timestamp | Quando desconto foi aplicado |
| discount_percentage | integer | Porcentagem do desconto (5-20%) |

---

### 2. Regras de Negócio

**Desconto progressivo por indicações bem-sucedidas:**
- 1 indicação: 5% de desconto na mensalidade
- 3 indicações: 10% de desconto
- 5 indicações: 15% de desconto
- 10+ indicações: 20% de desconto (máximo)

**Validações:**
- Usuário não pode se auto-indicar
- Cada e-mail só pode ser indicado uma vez
- Desconto acumulativo até o limite de 20%
- Indicado precisa ter plano pago (Navigator ou Professional)

---

### 3. Interface do Usuário

**Nova página: `/indicar` (Programa de Indicação)**

Seções da página:
1. **Meu código de indicação** - Com botão de copiar e compartilhar
2. **Link de convite** - URL pronta para compartilhar
3. **Minhas indicações** - Tabela com status de cada indicação
4. **Meus benefícios** - Desconto atual e próximo nível

**Componentes visuais:**
- Card com código destacado e ícones de compartilhamento (WhatsApp, LinkedIn, E-mail)
- Barra de progresso para próximo nível de desconto
- Lista de indicações com status visual (pendente, qualificado, recompensado)

---

### 4. Alterações no Cadastro

Modificar a página `/cadastro` para:
- Aceitar parâmetro `?ref=CODIGO` na URL
- Armazenar o código de referência durante o cadastro
- Exibir mensagem "Indicado por um amigo!" quando código válido

---

### 5. Backend - Edge Function

**Nova função: `process-referral-rewards`**

Responsável por:
- Verificar indicações que completaram 30 dias
- Marcar como "qualified" as elegíveis
- Aplicar cupom de desconto no Stripe
- Atualizar status para "rewarded"

Será executada via cron job diariamente às 06:00 (Brasília).

---

### 6. Integração com Stripe

**Criar cupons de desconto:**
- REFERRAL_5 (5% off recorrente)
- REFERRAL_10 (10% off recorrente)
- REFERRAL_15 (15% off recorrente)
- REFERRAL_20 (20% off recorrente)

O webhook do Stripe será atualizado para:
- Registrar `subscription_started_at` quando indicado assina
- Notificar quando assinatura é cancelada (invalida indicação pendente)

---

### 7. Notificações

Enviar e-mails (via Resend) em momentos-chave:
- Quando indicado se cadastra → Indicador recebe "Sua indicação se cadastrou!"
- Quando indicado assina → "Falta pouco! Aguarde 30 dias."
- Quando qualifica → "Parabéns! Você ganhou X% de desconto!"

---

### 8. Menu de Navegação

Adicionar item no Sidebar/MobileNav:
- Ícone: Users (ou Gift)
- Label: "Indicar Amigos"
- Rota: `/indicar`
- Badge: Número de indicações pendentes (opcional)

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/Indicar.tsx` | Criar |
| `src/components/referral/ReferralCard.tsx` | Criar |
| `src/components/referral/ReferralList.tsx` | Criar |
| `src/components/referral/ShareButtons.tsx` | Criar |
| `src/hooks/useReferral.ts` | Criar |
| `supabase/functions/process-referral-rewards/index.ts` | Criar |
| `supabase/functions/stripe-webhook/index.ts` | Modificar |
| `src/pages/Cadastro.tsx` | Modificar |
| `src/components/dashboard/Sidebar.tsx` | Modificar |
| `src/components/dashboard/MobileNav.tsx` | Modificar |
| `src/App.tsx` | Modificar (nova rota) |

---

## Detalhes Técnicos

### Geração do Código Único
```typescript
// Formato: 8 caracteres alfanuméricos
// Exemplo: TRIB7X2K
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'TRIB' + Array.from(
    { length: 4 }, 
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}
```

### Cálculo de Dias para Qualificação
```typescript
const QUALIFICATION_DAYS = 30;

function isQualified(subscriptionStartedAt: Date): boolean {
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - subscriptionStartedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays >= QUALIFICATION_DAYS;
}
```

### RLS Policies
- Usuários só veem seus próprios códigos e indicações
- Inserção de referral apenas pelo sistema (service role)
- Atualização de status apenas via Edge Function

---

## Cronograma Sugerido

1. **Fase 1**: Banco de dados e RLS
2. **Fase 2**: Hook useReferral e componentes
3. **Fase 3**: Página /indicar
4. **Fase 4**: Alteração no cadastro
5. **Fase 5**: Edge Function e cron job
6. **Fase 6**: Integração Stripe (cupons)
7. **Fase 7**: Testes e ajustes

