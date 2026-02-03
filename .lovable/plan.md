
# Plano: Correção da URL de Autorização OAuth Conta Azul

## Problema Identificado

Consultando a documentação oficial da API Conta Azul (https://developers.contaazul.com/requestingcode), descobri que o código está usando o **endpoint errado** para a autorização:

### Código Atual (ERRADO):
```typescript
// supabase/functions/contaazul-oauth/index.ts - Linha 102
const authUrl = `https://auth.contaazul.com/oauth2/authorize?${authParams.toString()}`;
```

### Documentação Oficial da Conta Azul:
```
https://auth.contaazul.com/login?response_type=code&client_id=SEU_CLIENT_ID&redirect_uri=...&state=...&scope=openid+profile+aws.cognito.signin.user.admin
```

### Diferenças Críticas:

| Aspecto | Código Atual | Documentação Oficial |
|---------|--------------|---------------------|
| Endpoint | `/oauth2/authorize` | `/login` |
| Scope | `openid profile ...` (espaços) | `openid+profile+...` (com +) |

## Solução Proposta

### Alteração no Arquivo `supabase/functions/contaazul-oauth/index.ts`

**Linhas 91-102:**

```typescript
// ANTES (errado)
const scopes = 'openid profile aws.cognito.signin.user.admin';

const authParams = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: scopes,
  state: state,
});

const authUrl = `https://auth.contaazul.com/oauth2/authorize?${authParams.toString()}`;

// DEPOIS (correto conforme documentação)
// API Conta Azul v2 - Scope deve usar + como separador (não URLSearchParams que codifica espaços)
const authUrl = `https://auth.contaazul.com/login?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=openid+profile+aws.cognito.signin.user.admin`;
```

## Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/contaazul-oauth/index.ts` | Linhas 91-102: Trocar endpoint `/oauth2/authorize` por `/login` e construir URL manualmente com scope usando `+` como separador |

## Resultado Esperado

Após a correção:
1. A URL de autorização será `https://auth.contaazul.com/login?...` (correto)
2. O scope terá `+` como separador em vez de `%20`
3. O erro `invalid_request` será eliminado
4. O fluxo OAuth funcionará corretamente

## Seção Técnica

A diferença está no endpoint de autorização:
- **Cognito genérico** usa `/oauth2/authorize`
- **Conta Azul** customizou e usa `/login`

Além disso, o `URLSearchParams` codifica espaços como `%20` ou `+` dependendo do contexto, mas a Conta Azul espera literalmente `+` no scope.
