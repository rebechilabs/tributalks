

# Plano: Proteção Máxima do Sistema TribuTalks

## Análise de Segurança Atual

Após inspeção completa do código e configurações, identifiquei os seguintes pontos:

### O Que Já Está Bem Protegido
| Componente | Status |
|------------|--------|
| RLS em todas as tabelas | Implementado corretamente |
| Função `has_role()` SECURITY DEFINER | Configurada |
| Autenticação em Edge Functions principais | Clara, ERP-Sync, Process-XML, Analyze-Credits |
| Roles separadas em tabela dedicada (`user_roles`) | Padrão seguro |
| Validação de token via `getUser()` | Implementado |
| Stripe webhook com verificação de assinatura | Ativo |

### Vulnerabilidades Identificadas (Prioridade por Risco)

| Prioridade | Vulnerabilidade | Risco |
|------------|-----------------|-------|
| CRÍTICA | Credenciais ERP armazenadas em texto plano (JSONB) | Alto - Vazamento de senhas de ERPs |
| ALTA | Mensagens de erro verbosas em edge functions | Médio - Reconhecimento para ataques |
| ALTA | Leaked Password Protection desativada | Médio - Senhas comprometidas |
| MÉDIA | Formulário de contato sem rate limiting | Médio - Spam/DoS |
| MÉDIA | Regras de crédito público expondo algoritmos proprietários | Baixo - Propriedade intelectual |
| BAIXA | Extensão em schema público | Baixo - Boa prática |

---

## Implementação - 5 Camadas de Proteção

### 1. Criptografia de Credenciais ERP (CRÍTICO)

**Arquivo:** `supabase/functions/erp-sync/index.ts`

Criar funções de encrypt/decrypt para proteger credenciais usando AES-GCM nativo do Deno.

**Nova Secret necessária:** `ERP_ENCRYPTION_KEY` (32 caracteres)

### 2. Sanitização de Mensagens de Erro

**Arquivos afetados:**
- `supabase/functions/clara-assistant/index.ts`
- `supabase/functions/process-xml-batch/index.ts`
- `supabase/functions/erp-sync/index.ts`
- `supabase/functions/analyze-credits/index.ts`

Substituir mensagens de erro verbosas por mensagens genéricas, mantendo logs internos para debugging.

### 3. Rate Limiting no Formulário de Contato

**Arquivo:** `supabase/functions/send-contact-email/index.ts`

Limitar a 3 submissões por IP a cada 10 minutos para evitar spam/DoS.

### 4. Restringir Acesso às Regras de Crédito

**Migration SQL:** Tornar `credit_rules` acessível apenas para usuários autenticados.

### 5. Validação de Input no Contato

**Arquivo:** `supabase/functions/send-contact-email/index.ts`

Adicionar sanitização rigorosa e validação de email.

---

## Arquivos a Modificar

| Arquivo | Alterações |
|---------|------------|
| `supabase/functions/clara-assistant/index.ts` | Sanitizar mensagens de erro |
| `supabase/functions/process-xml-batch/index.ts` | Sanitizar mensagens de erro |
| `supabase/functions/erp-sync/index.ts` | Criptografia de credenciais + sanitizar erros |
| `supabase/functions/send-contact-email/index.ts` | Rate limiting + validação de input |
| `supabase/functions/analyze-credits/index.ts` | Sanitizar mensagens de erro |
| **Nova secret:** `ERP_ENCRYPTION_KEY` | Chave de 32 caracteres para AES-256 |
| **Migration SQL** | Restringir credit_rules a authenticated |

---

## Resultado Esperado

Após implementação:

- Credenciais de ERP criptografadas em repouso
- Zero vazamento de informações técnicas para usuários
- Proteção contra spam no formulário de contato
- Algoritmos proprietários protegidos
- Validação rigorosa de todos os inputs

---

## Seção Técnica

### Criptografia AES-GCM para Credenciais ERP

```text
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE CRIPTOGRAFIA                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Credenciais JSON  ──► AES-GCM Encrypt ──► Base64 String   │
│       (input)              (key)              (stored)      │
│                                                             │
│  Base64 String ──► AES-GCM Decrypt ──► Credenciais JSON    │
│    (stored)            (key)              (output)          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Padrão de Sanitização de Erros

```text
ANTES (vulnerável):
  catch (e) → return { error: e.message }  // Expõe stack trace

DEPOIS (seguro):
  catch (e) → console.error(e)             // Log interno
            → return { error: "Erro genérico" }  // Resposta segura
```

### Rate Limiting

```text
┌─────────────────────────────────────────┐
│  IP Request → Check Map → Allow/Deny   │
│                                         │
│  Limite: 3 requests / 10 minutos / IP  │
│  Status 429 se exceder                  │
└─────────────────────────────────────────┘
```

---

## Prioridade de Implementação

1. **Imediato:** Sanitização de mensagens de erro (todas as edge functions)
2. **Curto prazo:** Rate limiting e validação no contato
3. **Médio prazo:** Criptografia de credenciais ERP (requer migration de dados existentes)
4. **Paralelo:** Solicitar Leaked Password Protection ao suporte

