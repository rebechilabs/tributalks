
# Plano de Correção: Migração para Nova API do Conta Azul

## Diagnóstico do Problema

Após investigação detalhada da documentação oficial do Conta Azul, identifiquei a **causa raiz** do problema:

A integração está usando a **API Legada** do Conta Azul, que foi **oficialmente descontinuada em 5 de novembro de 2025**. Por isso, todas as requisições estão sendo rejeitadas com `invalid_request`.

A documentação de migração oficial confirma:
> "A API legada foi descontinuada e não será mais possível utilizá-la."

---

## Comparação: API Legada vs Nova API

| Aspecto | Implementação Atual (Legada) | Nova API (Correto) |
|---------|------------------------------|---------------------|
| URL de Autorização | `api.contaazul.com/auth/authorize` | `auth.contaazul.com/login` |
| URL de Token | `api.contaazul.com/oauth2/token` | `auth.contaazul.com/oauth2/token` |
| URL da API | `api.contaazul.com/v1/...` | `api-v2.contaazul.com/v1/...` |
| Scope | `offline sales purchases...` | `openid+profile+aws.cognito.signin.user.admin` |
| Credenciais | client_id/secret antigos | Novas credenciais do Portal |

---

## Correções Necessárias

### 1. Atualizar Endpoint de Autorização

**Arquivo:** `supabase/functions/contaazul-oauth/index.ts`

**Linha 98 - De:**
```typescript
const authUrl = `https://api.contaazul.com/auth/authorize?${authParams}`;
```

**Para:**
```typescript
const authUrl = `https://auth.contaazul.com/login?${authParams}`;
```

### 2. Corrigir o Scope (Parâmetro Fixo)

**Arquivo:** `supabase/functions/contaazul-oauth/index.ts`

**Linhas 90-96 - De:**
```typescript
const authParams = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: 'offline sales purchases products customers suppliers fiscal-invoices bank-accounts treasury',
  state: state,
});
```

**Para:**
```typescript
const authParams = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: 'openid profile aws.cognito.signin.user.admin',
  state: state,
});
```

### 3. Atualizar Endpoint de Token

**Arquivo:** `supabase/functions/contaazul-oauth/index.ts`

**Linha 176 - De:**
```typescript
const tokenResponse = await fetch('https://api.contaazul.com/oauth2/token', {
```

**Para:**
```typescript
const tokenResponse = await fetch('https://auth.contaazul.com/oauth2/token', {
```

### 4. Atualizar Endpoint de Validação (API v2)

**Arquivo:** `supabase/functions/contaazul-oauth/index.ts`

**Linha 212 - De:**
```typescript
const validateResponse = await fetch('https://api.contaazul.com/v1/companies', {
```

**Para:**
```typescript
const validateResponse = await fetch('https://api-v2.contaazul.com/v1/empresas', {
```

---

## Ação Necessária pelo Usuário

**Antes de testar a integração, é necessário:**

1. Acessar o **novo Portal do Desenvolvedor**: https://developers.contaazul.com
2. Criar uma **nova aplicação** no portal
3. Obter as **novas credenciais** (`client_id` e `client_secret`)
4. Atualizar os secrets no projeto:
   - `CONTAAZUL_CLIENT_ID` (novo valor)
   - `CONTAAZUL_CLIENT_SECRET` (novo valor)
5. Configurar a URL de redirecionamento: `https://tributechai.lovable.app/oauth/callback`

A documentação oficial confirma que as **credenciais antigas não são compatíveis** com a nova API.

---

## Resumo das Mudanças de Código

```text
supabase/functions/contaazul-oauth/index.ts
├── Linha 94: Corrigir scope para 'openid profile aws.cognito.signin.user.admin'
├── Linha 98: Alterar URL de autorização para auth.contaazul.com/login
├── Linha 176: Alterar URL de token para auth.contaazul.com/oauth2/token
└── Linha 212: Alterar URL da API para api-v2.contaazul.com
```

---

## Impacto e Riscos

- **Risco:** Baixo - apenas URLs e parâmetros são alterados
- **Dependência:** Novas credenciais precisam ser geradas pelo usuário
- **Compatibilidade:** A nova API tem endpoints diferentes para alguns recursos

---

## Próximos Passos Após Implementação

1. Usuário gera novas credenciais no Portal do Desenvolvedor
2. Usuário atualiza os secrets do projeto
3. Deploy da edge function atualizada
4. Teste de conexão em `/integracoes`
5. Validação do fluxo completo OAuth
