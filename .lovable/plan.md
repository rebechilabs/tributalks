

# Plano: Correção Definitiva do OAuth Callback para Conta Azul

## Diagnóstico Confirmado

Analisando os logs e o código-fonte, identifiquei que o arquivo `src/pages/OAuthCallback.tsx` **não foi atualizado** conforme o plano aprovado anteriormente. O problema persiste porque:

### Código Atual (com problema) - Linhas 70-82:
```typescript
const response = await supabase.functions.invoke('contaazul-oauth', {
  method: 'POST',
  body: {
    code,
    redirect_uri: `${window.location.origin}/oauth/callback`, // PROBLEMA 1: URL dinâmica
    state,
    stored_state: storedState,
    connection_name: connectionName,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});
// PROBLEMA 2: Não inclui action=exchange
```

### Evidências nos Logs:
Os logs mostram que a Edge Function `contaazul-oauth` gera URLs de autorização corretamente, mas **nunca recebe uma chamada com `action=exchange`** - por isso retorna erro 400 "Ação não suportada".

---

## Solução: Atualizar `OAuthCallback.tsx`

### Alteração Necessária

Substituir a chamada `supabase.functions.invoke()` por `fetch()` direto com:
1. URL fixa de produção: `https://tributechai.lovable.app/oauth/callback`
2. Query parameter: `action=exchange`

### Código Corrigido (Linhas 69-94):

```typescript
// Exchange code for tokens via edge function - usando fetch direto para incluir action parameter
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

// Clear stored state
sessionStorage.removeItem('contaazul_oauth_state');
sessionStorage.removeItem('contaazul_connection_name');

if (!response.ok) {
  throw new Error(data.error || 'Falha ao trocar código por tokens');
}

if (!data.success) {
  throw new Error(data.error || 'Resposta inválida do servidor');
}

setStatus('success');
setMessage(data.message || 'Conta Azul conectado com sucesso!');
```

---

## Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/OAuthCallback.tsx` | Substituir `supabase.functions.invoke()` por `fetch()` com `action=exchange` e URL fixa de produção |

---

## Resultado Esperado

Após a correção:
1. A requisição incluirá `?action=exchange` na URL (evita erro 400)
2. O `redirect_uri` será sempre `https://tributechai.lovable.app/oauth/callback` (corresponde ao cadastro no Portal Conta Azul)
3. O fluxo OAuth funcionará corretamente em qualquer ambiente (preview ou produção)

---

## Verificação Pós-Implementação

1. Publicar as alterações
2. Acessar https://tributechai.lovable.app/integracoes
3. Clicar em "Conectar" no card Conta Azul
4. Autorizar no portal Conta Azul
5. Verificar redirecionamento de volta e mensagem de sucesso

