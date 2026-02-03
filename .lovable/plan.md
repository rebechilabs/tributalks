

# Plano de Correção: Sincronização Omie ERP - "Criptografia" 

## Problema Identificado

A sincronização está falhando com o erro:
```
"A chave de acesso não está preenchida ou não é válida"
```

### Causa Raiz

O campo `credentials` na tabela `erp_connections` é do tipo **JSONB**, e as credenciais criptografadas são armazenadas como uma **string JSON** (ex: `"YpPoD5+..."`).

Quando o código tenta descriptografar:
1. O Supabase retorna a string JSON com formatação adequada
2. A função `isEncryptedCredentials()` detecta corretamente que é uma string
3. **MAS** a função `atob()` pode falhar se a string Base64 contiver caracteres problemáticos após ser processada pelo JSONB

O log mostra que o Omie está recebendo credenciais vazias ou inválidas, indicando falha silenciosa na descriptografia.

## Solução Proposta

### 1. Melhorar Tratamento de Credenciais no `erp-sync`

Adicionar tratamento robusto para o formato JSONB e logging de diagnóstico:

**Arquivo**: `supabase/functions/erp-sync/index.ts`

```typescript
async function getDecryptedCredentials(storedCredentials: unknown): Promise<ERPCredentials> {
  console.log('[Decrypt] Raw credentials type:', typeof storedCredentials);
  console.log('[Decrypt] Raw credentials preview:', 
    typeof storedCredentials === 'string' 
      ? storedCredentials.slice(0, 30) + '...' 
      : JSON.stringify(storedCredentials).slice(0, 50));
  
  // Handle JSONB string (already parsed by Supabase client)
  let credentialString: string;
  
  if (typeof storedCredentials === 'string') {
    credentialString = storedCredentials;
  } else if (typeof storedCredentials === 'object' && storedCredentials !== null) {
    // Legacy format: plain JSON object - return directly
    console.log('[Decrypt] Using legacy plain object format');
    return storedCredentials as ERPCredentials;
  } else {
    throw new Error('Formato de credenciais inválido');
  }
  
  // Verify it looks like Base64 encrypted data
  if (credentialString.length < 30 || !/^[A-Za-z0-9+/=]+$/.test(credentialString.trim())) {
    console.error('[Decrypt] Invalid Base64 format');
    throw new Error('Credenciais em formato inválido');
  }
  
  try {
    const decrypted = await decryptCredentials(credentialString.trim());
    console.log('[Decrypt] Successfully decrypted, keys:', Object.keys(decrypted));
    return decrypted;
  } catch (error) {
    console.error('[Decrypt] Decryption failed:', error);
    throw new Error('Falha ao descriptografar credenciais');
  }
}
```

### 2. Validar Chave de Criptografia

Adicionar verificação explícita da `ERP_ENCRYPTION_KEY`:

```typescript
async function getEncryptionKey(): Promise<CryptoKey> {
  const keyString = Deno.env.get("ERP_ENCRYPTION_KEY");
  console.log('[Encrypt] Key exists:', !!keyString);
  console.log('[Encrypt] Key length:', keyString?.length || 0);
  
  if (!keyString || keyString.length < 32) {
    throw new Error("ERP_ENCRYPTION_KEY não configurada ou muito curta (mínimo 32 caracteres)");
  }
  // ... resto do código
}
```

### 3. Adicionar Verificação Antes de Chamar API

Validar que as credenciais descriptografadas contêm os campos esperados:

```typescript
// No OmieAdapter.syncEmpresa
async syncEmpresa(credentials: ERPCredentials): Promise<Record<string, unknown>> {
  if (!credentials.app_key || !credentials.app_secret) {
    console.error('[Omie] Missing credentials:', {
      hasAppKey: !!credentials.app_key,
      hasAppSecret: !!credentials.app_secret
    });
    throw new Error('Credenciais incompletas: app_key e app_secret são obrigatórios');
  }
  // ... resto do código
}
```

### 4. Aplicar Mesmo Padrão nos Outros Métodos

- `syncProdutos`
- `syncNFe`  
- `syncFinanceiro`

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/erp-sync/index.ts` | Melhorar `getDecryptedCredentials`, `getEncryptionKey`, e validações no `OmieAdapter` |

## Teste Após Implementação

1. Reimplantar a Edge Function `erp-sync`
2. Testar sincronização novamente
3. Verificar logs para diagnosticar se a descriptografia está funcionando

## Detalhes Técnicos

A chave `ERP_ENCRYPTION_KEY` já está configurada (confirmado via `fetch_secrets`). O problema está no processamento da string Base64 durante a descriptografia, possivelmente devido a:

1. Caracteres especiais na string Base64 (`+`, `/`, `=`)
2. Encoding/decoding incorreto entre o armazenamento e recuperação
3. Incompatibilidade entre a chave usada para criptografar vs descriptografar

