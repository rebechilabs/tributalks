

# Plano: Notificação Automática de Novo Nível de Desconto

## Objetivo

Criar uma notificação automática quando o usuário atinge um novo nível de desconto no programa de indicação (5% -> 10% -> 15% -> 20%).

---

## Análise do Sistema Atual

O sistema já possui:
- Edge Function `process-referral-rewards` que processa indicações
- Notificações quando indicação é qualificada
- Notificações quando recompensa é liberada
- **Falta**: Detecção de mudança de nível e notificação específica

### Níveis de Desconto
| Indicações | Desconto |
|------------|----------|
| 1+         | 5%       |
| 3+         | 10%      |
| 5+         | 15%      |
| 10+        | 20%      |

---

## Mudanças Propostas

### Arquivo: `supabase/functions/process-referral-rewards/index.ts`

#### 1. Adicionar função para detectar mudança de nível

```typescript
function getDiscountPercent(successfulReferrals: number): number {
  if (successfulReferrals >= 10) return 20;
  if (successfulReferrals >= 5) return 15;
  if (successfulReferrals >= 3) return 10;
  if (successfulReferrals >= 1) return 5;
  return 0;
}

function checkLevelUp(previousCount: number, newCount: number): { leveledUp: boolean; newPercent: number; previousPercent: number } {
  const previousPercent = getDiscountPercent(previousCount);
  const newPercent = getDiscountPercent(newCount);
  return {
    leveledUp: newPercent > previousPercent,
    newPercent,
    previousPercent,
  };
}
```

#### 2. Modificar o fluxo de processamento

Na seção onde incrementamos `successful_referrals` (aproximadamente linha 197-206), adicionar:

```typescript
const previousCount = codeData.successful_referrals || 0;
const successfulCount = previousCount + 1;

// Verifica se subiu de nível
const levelCheck = checkLevelUp(previousCount, successfulCount);

if (levelCheck.leveledUp) {
  // Notificação especial de novo nível
  await supabase.from("notifications").insert({
    user_id: referral.referrer_id,
    title: "🚀 Novo Nível Desbloqueado!",
    message: `Parabéns! Você subiu para ${levelCheck.newPercent}% de desconto! Continue indicando para aumentar ainda mais.`,
    type: "success",
    category: "indicacao",
    action_url: "/indicar",
  });
}
```

---

## Fluxo Visual

```text
┌──────────────────────────────────────────────────────────────┐
│                    PROCESSAMENTO DE INDICAÇÃO                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Indicação qualificada (30 dias)                          │
│     └─> Notificação: "Indicação qualificada!"                │
│                                                               │
│  2. Incrementa successful_referrals                          │
│     └─> Verifica: subiu de nível?                            │
│          │                                                    │
│          ├─> SIM: Notificação especial de novo nível         │
│          │        "🚀 Novo Nível Desbloqueado!"              │
│          │        "Você subiu para X% de desconto!"          │
│          │                                                    │
│          └─> NÃO: Continua normalmente                       │
│                                                               │
│  3. Aplica cupom no Stripe (se aplicável)                    │
│     └─> Notificação: "Recompensa liberada!"                  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Mensagens de Notificação por Nível

| Transição | Título | Mensagem |
|-----------|--------|----------|
| 0% -> 5%  | 🎉 Primeiro Desconto! | Parabéns! Você conquistou 5% de desconto na mensalidade! |
| 5% -> 10% | 🚀 Nível 2 Desbloqueado! | Você subiu para 10% de desconto! Continue indicando! |
| 10% -> 15% | ⭐ Nível 3 Desbloqueado! | Incrível! Agora você tem 15% de desconto! Faltam 5 para o máximo! |
| 15% -> 20% | 🏆 Nível Máximo! | Você atingiu o desconto máximo de 20%! Você é um embaixador top! |

---

## Detalhes Técnicos

### Modificação na Edge Function

**Localização**: `supabase/functions/process-referral-rewards/index.ts`

**Linhas afetadas**: ~190-260 (seção de processamento qualified -> rewarded)

**Lógica**:
1. Antes de incrementar, guardar o count anterior
2. Após incrementar, comparar os níveis de desconto
3. Se houve mudança, criar notificação com mensagem customizada por nível
4. Manter as notificações existentes de qualificação e recompensa

---

## Benefícios

- **Feedback imediato**: Usuário sabe quando subiu de nível
- **Gamificação reforçada**: Cada marco é celebrado
- **Incentivo a continuar**: Mensagens mostram progresso até o próximo nível
- **Sem duplicação**: Notificação de nível é distinta da notificação de recompensa

