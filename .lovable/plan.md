

# Plano: Tratamento de Redirecionamento pós-Mercado Pago

## Resumo

Atualmente, quando um usuário completa ou tenta fazer um pagamento via Mercado Pago, ele é redirecionado de volta para a plataforma. No entanto, **não há nenhum tratamento** no código para:

1. Detectar que o usuário veio de um checkout do Mercado Pago
2. Mostrar mensagem de confirmação/status do pagamento
3. Lidar com pagamentos pendentes, aprovados ou recusados

## Situação Atual

**Configuração recomendada no Mercado Pago:**
- URL de sucesso/pendente: `https://tributechai.lovable.app/dashboard`
- URL de falha: `https://tributechai.lovable.app/#planos`

**O que acontece hoje:**
- O usuário volta para `/dashboard` ou `/#planos` sem nenhum feedback visual
- O webhook processa o pagamento em background e atualiza o plano
- Pode haver um "delay" entre o redirecionamento e a ativação do plano

## Mudanças Propostas

### 1. Criar página de confirmação de pagamento

Nova rota `/pagamento/confirmacao` que:
- Lê os parâmetros que o Mercado Pago envia na URL (`collection_status`, `payment_id`, `status`, etc.)
- Mostra mensagem apropriada baseada no status:
  - **Aprovado**: "🎉 Pagamento confirmado! Seu plano já está ativo"
  - **Pendente**: "⏳ Pagamento em processamento. Você receberá uma notificação quando for aprovado"
  - **Recusado**: "❌ Pagamento não aprovado. Tente novamente ou escolha outro método"
- Redireciona automaticamente para o Dashboard após alguns segundos

### 2. Atualizar configuração do Mercado Pago

As URLs de redirecionamento devem ser alteradas para:
- **Sucesso**: `https://tributechai.lovable.app/pagamento/confirmacao`
- **Pendente**: `https://tributechai.lovable.app/pagamento/confirmacao`
- **Falha**: `https://tributechai.lovable.app/pagamento/confirmacao`

Assim, todos os cenários passam pela página de confirmação que mostra o status correto.

### 3. Atualizar Dashboard para detectar plano recém-ativado

O Dashboard mostrará um banner de boas-vindas quando detectar que o usuário acabou de ter o plano ativado (verificando timestamp da assinatura vs. agora).

---

## Detalhes Técnicos

### Arquivos a criar

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/PagamentoConfirmacao.tsx` | Página que recebe o redirecionamento do Mercado Pago |

### Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `src/App.tsx` | Adicionar rota `/pagamento/confirmacao` |
| `src/pages/Dashboard.tsx` | Adicionar banner de boas-vindas para novo assinante |

### Parâmetros que o Mercado Pago envia

Quando redirecionado, a URL contém:

```
?collection_id=1234567890
&collection_status=approved
&payment_id=1234567890
&status=approved
&external_reference=...
&payment_type=credit_card
&merchant_order_id=...
&preference_id=...
&site_id=MLB
&processing_mode=aggregator
```

### Lógica da página de confirmação

```text
┌─────────────────────────────────────────────┐
│  Usuário redirecionado do Mercado Pago      │
│  URL: /pagamento/confirmacao?status=...     │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
         ┌───────────────┐
         │ Ler parâmetro │
         │    status     │
         └───────┬───────┘
                 │
     ┌───────────┼───────────┐
     │           │           │
     ▼           ▼           ▼
 approved     pending     rejected
     │           │           │
     ▼           ▼           ▼
 Sucesso!    Pendente    Falhou
 Plano       Aguarde     Tente
 ativo!      confirmação novamente
     │           │           │
     ▼           ▼           ▼
 Redireciona Redireciona Botão
 Dashboard   Dashboard   "Tentar
 (3s)        (5s)        novamente"
```

---

## Resultado Esperado

1. **Usuário completa pagamento** → Mercado Pago redireciona para `/pagamento/confirmacao?status=approved`
2. **Página mostra**: "🎉 Pagamento aprovado! Bem-vindo ao plano PROFESSIONAL!"
3. **Após 3 segundos** → Redireciona automaticamente para o Dashboard
4. **No Dashboard**: Usuário vê seu plano atualizado

Para pagamentos pendentes (PIX, boleto):
1. **Usuário gera boleto/PIX** → Mercado Pago redireciona com `status=pending`
2. **Página mostra**: "⏳ Seu pagamento está sendo processado..."
3. **Webhook processa** quando o pagamento for confirmado → Plano é ativado + notificação

