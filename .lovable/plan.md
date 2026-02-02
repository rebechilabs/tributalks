
# Plano de Correção da Integração Conta Azul

## Resumo do Problema

A cliente Stephanie (stephanie@rebechisilva.com.br) conectou o Conta Azul e todos os módulos falharam devido a dois problemas técnicos:

1. **Token OAuth expirado**: O Conta Azul usa tokens de acesso válidos por apenas **1 hora**. O sistema atual não possui mecanismo de renovação automática (refresh token).

2. **Erro no enum `sync_type`**: O código usa `'manual'` como valor, mas o banco de dados só aceita: `nfe`, `nfse`, `produtos`, `financeiro`, `empresa`, `full`.

---

## Solução Proposta

### 1. Adicionar suporte a Refresh Token para Conta Azul

**Arquivos a modificar:**
- `supabase/functions/erp-sync/index.ts`
- `supabase/functions/erp-connection/index.ts`

**Lógica:**
- Antes de fazer qualquer requisição à API do Conta Azul, verificar se o token ainda é válido
- Se a requisição falhar com `invalid_token`, chamar automaticamente o endpoint de refresh:
  ```
  POST https://auth.contaazul.com/oauth2/token
  Authorization: Basic BASE64(client_id:client_secret)
  Content-Type: application/x-www-form-urlencoded
  
  grant_type=refresh_token
  refresh_token=REFRESH_TOKEN_ATUAL
  ```
- Atualizar as credenciais salvas com o novo `access_token` e `refresh_token`

---

### 2. Corrigir o enum `sync_type`

**Arquivo a modificar:**
- `supabase/functions/erp-sync/index.ts` (linha 1235)

**Alteração:**
```typescript
// ANTES
sync_type: 'manual',

// DEPOIS  
sync_type: 'full',
```

---

### 3. Corrigir o enum no `erp-auto-sync`

**Arquivo a modificar:**
- `supabase/functions/erp-auto-sync/index.ts` (linha 66)

**Alteração:**
```typescript
// ANTES
sync_type: 'auto',

// DEPOIS
sync_type: 'full',
```

---

### 4. Melhorar mensagens de erro para o usuário

Quando o token expirar, exibir uma mensagem clara pedindo reconexão:
- "Sua autorização do Conta Azul expirou. Por favor, reconecte sua conta."

---

## Detalhes Técnicos

### Fluxo de Refresh Token (ContaAzulAdapter)

```text
┌──────────────────────────────────────────────────────────────────┐
│                    FLUXO DE SINCRONIZAÇÃO                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Requisição à API do Conta Azul                               │
│         │                                                        │
│         ▼                                                        │
│  2. Resposta = 401 / invalid_token?                              │
│         │                                                        │
│    ┌────┴────┐                                                   │
│    │   SIM   │──► 3. Chamar refresh token endpoint               │
│    └─────────┘         │                                         │
│         │              ▼                                         │
│         │         4. Atualizar credenciais no banco              │
│         │              │                                         │
│         │              ▼                                         │
│         │         5. Retry da requisição original                │
│         │                                                        │
│    ┌────┴────┐                                                   │
│    │   NÃO   │──► Continuar normalmente                          │
│    └─────────┘                                                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Estrutura de Credenciais Conta Azul (após correção)

```typescript
interface ContaAzulCredentials {
  client_id: string;
  client_secret: string;
  access_token: string;
  refresh_token: string;
  expires_at?: number; // timestamp de expiração
}
```

### Método `refreshContaAzulToken`

```typescript
async function refreshContaAzulToken(
  credentials: ContaAzulCredentials,
  supabase: SupabaseClient,
  connectionId: string
): Promise<string> {
  const auth = btoa(`${credentials.client_id}:${credentials.client_secret}`);
  
  const response = await fetch('https://auth.contaazul.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: credentials.refresh_token,
    }),
  });

  if (!response.ok) {
    throw new Error('Refresh token expirado. Reconecte o Conta Azul.');
  }

  const data = await response.json();
  
  // Atualizar credenciais encriptadas no banco
  const newCredentials = {
    ...credentials,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  };
  
  await supabase
    .from('erp_connections')
    .update({ credentials: await encryptCredentials(newCredentials) })
    .eq('id', connectionId);

  return data.access_token;
}
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/erp-sync/index.ts` | Adicionar lógica de refresh token para ContaAzulAdapter + corrigir enum `sync_type` |
| `supabase/functions/erp-auto-sync/index.ts` | Corrigir enum `sync_type` de 'auto' para 'full' |
| `supabase/functions/erp-connection/index.ts` | Solicitar `refresh_token` na conexão inicial do Conta Azul |

---

## Migração de Banco de Dados

Adicionar o valor `auto` ao enum `erp_sync_type` para manter compatibilidade futura:

```sql
ALTER TYPE erp_sync_type ADD VALUE IF NOT EXISTS 'auto';
ALTER TYPE erp_sync_type ADD VALUE IF NOT EXISTS 'manual';
```

---

## Resultado Esperado

Após a implementação:

1. A sincronização do Conta Azul funcionará automaticamente, renovando tokens quando necessário
2. Nenhum erro de enum no log de sincronização  
3. A cliente Stephanie poderá usar a plataforma normalmente após reconectar (apenas uma vez)
4. Sincronizações futuras não exigirão intervenção manual

---

## Passos de Implementação

1. Migração de banco: adicionar valores ao enum
2. Atualizar `erp-sync` com lógica de refresh token e correção de enum
3. Atualizar `erp-auto-sync` com correção de enum
4. Deploy das edge functions
5. Testar a sincronização com a conta da Stephanie
