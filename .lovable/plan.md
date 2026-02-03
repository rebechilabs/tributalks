
# Plano: Correção do Fluxo OAuth Conta Azul

## Problema Identificado

Dois problemas críticos impedem o funcionamento do OAuth Conta Azul:

### Problema 1: redirect_uri Inconsistente
O arquivo `OAuthCallback.tsx` usa `window.location.origin` para construir a redirect_uri durante a troca de tokens:

```typescript
redirect_uri: `${window.location.origin}/oauth/callback`
```

Isso causa falha quando:
- Usuário testa no preview (`id-preview--*.lovable.app`)
- URL enviada não corresponde ao cadastrado no Portal Conta Azul

### Problema 2: Parâmetro action Ausente
A chamada à Edge Function na linha 70 usa `method: 'POST'` mas não inclui `action=exchange`:

```typescript
const response = await supabase.functions.invoke('contaazul-oauth', {
  method: 'POST',
  body: { ... }
});
```

A Edge Function retorna erro 400 se `action` não for `authorize` ou `exchange`.

## Solução Proposta

### Alteração no Arquivo `src/pages/OAuthCallback.tsx`

**Linha 74:** Usar URL fixa de produção (igual ao ERPConnectionWizard)

```typescript
// Antes
redirect_uri: `${window.location.origin}/oauth/callback`,

// Depois  
redirect_uri: 'https://tributechai.lovable.app/oauth/callback',
```

**Linhas 69-82:** Adicionar `action=exchange` via query parameter

```typescript
// Usar fetch direto para incluir action parameter
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contaazul-oauth?action=exchange`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.session.access_token}`,
    },
    body: JSON.stringify({
      code,
      redirect_uri: 'https://tributechai.lovable.app/oauth/callback',
      state,
      stored_state: storedState,
      connection_name: connectionName,
    }),
  }
);

const data = await response.json();

if (!response.ok) {
  throw new Error(data.error || 'Falha ao trocar código por tokens');
}

if (!data.success) {
  throw new Error(data.error || 'Resposta inválida do servidor');
}
```

## Resumo das Alterações

| Arquivo | Linha | Alteração |
|---------|-------|-----------|
| `src/pages/OAuthCallback.tsx` | 69-82 | Trocar `supabase.functions.invoke` por `fetch` com `action=exchange` |
| `src/pages/OAuthCallback.tsx` | 74 | Usar URL fixa de produção |

## Resultado Esperado

Após a correção:
1. A requisição incluirá `action=exchange` (evita erro 400)
2. A `redirect_uri` será sempre `https://tributechai.lovable.app/oauth/callback` (evita mismatch com Conta Azul)
3. O fluxo OAuth funcionará corretamente em qualquer ambiente
