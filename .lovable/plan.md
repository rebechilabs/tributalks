

# Plano: Implementação Final - Criptografia ERP + Hardening BD

## Resumo do Status Atual

### ✅ Já Implementado (Mensagem Anterior)
| Item | Status |
|------|--------|
| Sanitização de erros em `clara-assistant` | Concluído |
| Sanitização de erros em `analyze-credits` | Concluído |
| Sanitização de erros em `process-xml-batch` | Concluído |
| Sanitização de erros em `erp-sync` | Concluído |
| Rate limiting em `send-contact-email` | Concluído |
| Validação de input em `send-contact-email` | Concluído |
| Secret `ERP_ENCRYPTION_KEY` | Adicionada |

### ⏳ Pendente de Implementação
| Item | Descrição |
|------|-----------|
| Criptografia AES-GCM | Encrypt/decrypt de credenciais ERP |
| `erp-connection` | Criptografar ao salvar, sanitizar erros |
| `erp-sync` | Descriptografar ao usar credenciais |
| Migration SQL | Restringir `credit_rules` a usuários autenticados |

---

## Implementação Detalhada

### 1. Funções de Criptografia (Utilitário Compartilhado)

Criar funções helper para encrypt/decrypt usando Web Crypto API nativa do Deno:

```text
┌─────────────────────────────────────────────────────────────┐
│                    FUNÇÕES CRYPTO                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  encryptCredentials(data, key)                              │
│    → IV aleatório (12 bytes)                                │
│    → AES-256-GCM encrypt                                    │
│    → Retorna: base64(IV + ciphertext + authTag)             │
│                                                             │
│  decryptCredentials(encrypted, key)                         │
│    → Extrai IV, ciphertext, authTag                         │
│    → AES-256-GCM decrypt                                    │
│    → Retorna: objeto JSON original                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Modificações em `erp-connection/index.ts`

**Arquivo:** `supabase/functions/erp-connection/index.ts`

**Alterações:**
- Adicionar funções de criptografia
- Criptografar credenciais antes de salvar no banco (POST/PUT)
- Sanitizar mensagens de erro no catch final
- Manter validação de credenciais ANTES de criptografar

### 3. Modificações em `erp-sync/index.ts`

**Arquivo:** `supabase/functions/erp-sync/index.ts`

**Alterações:**
- Adicionar funções de descriptografia
- Descriptografar credenciais ao carregar conexão
- Verificar se credenciais estão criptografadas (compatibilidade retroativa)

### 4. Migration SQL - Hardening `credit_rules`

**Objetivo:** Remover acesso anônimo às regras de crédito (proteger algoritmos proprietários)

**SQL:**
```sql
-- Revogar acesso anônimo às regras de crédito
DROP POLICY IF EXISTS "Credit rules are readable by authenticated users" ON public.credit_rules;

-- Nova política: apenas usuários autenticados podem ler
CREATE POLICY "Credit rules readable by authenticated only"
  ON public.credit_rules
  FOR SELECT
  TO authenticated
  USING (true);

-- Garantir que anon não tem acesso
REVOKE ALL ON public.credit_rules FROM anon;
```

---

## Compatibilidade Retroativa

O sistema detecta automaticamente se as credenciais estão criptografadas:
- Se for string Base64 → descriptografa
- Se for objeto JSON → usa diretamente (credenciais antigas)

Isso permite que conexões existentes continuem funcionando até serem atualizadas.

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/erp-connection/index.ts` | Adicionar criptografia + sanitizar erros |
| `supabase/functions/erp-sync/index.ts` | Adicionar descriptografia |
| **Migration SQL** | Restringir `credit_rules` |

---

## Seção Técnica

### Formato de Dados Criptografados

```text
Base64 encoded:
┌────────────┬─────────────────────┬────────────┐
│  IV (12B)  │   Ciphertext (var)  │  Tag (16B) │
└────────────┴─────────────────────┴────────────┘
```

### Validação de Chave

A chave `ERP_ENCRYPTION_KEY` deve ter exatamente 32 caracteres (256 bits para AES-256).

### Fluxo de Conexão ERP

```text
┌─────────────────────────────────────────────────────────────┐
│              FLUXO DE CRIAÇÃO DE CONEXÃO                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Usuário envia credenciais (POST)                        │
│  2. Valida credenciais com API do ERP                       │
│  3. Se válidas → criptografa → salva no banco               │
│  4. Retorna sucesso (sem expor credenciais)                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              FLUXO DE SINCRONIZAÇÃO                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Carrega conexão do banco                                │
│  2. Descriptografa credenciais                              │
│  3. Usa credenciais para chamar API do ERP                  │
│  4. Processa dados e atualiza banco                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Resultado Final

Após esta implementação:

- Credenciais de ERP protegidas com AES-256-GCM
- Algoritmos de crédito protegidos de acesso anônimo
- Sistema retrocompatível com conexões existentes
- Zero informação técnica exposta em erros

