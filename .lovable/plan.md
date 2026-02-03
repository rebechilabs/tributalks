
# Plano: Atualização Completa da Integração OAuth 2.0 Conta Azul

## Diagnóstico do Problema

O erro **"Client does not exist - client_id=95398421"** indica que:
1. As credenciais atuais (`CONTAAZUL_CLIENT_ID` e `CONTAAZUL_CLIENT_SECRET`) armazenadas nos Supabase Secrets estão expiradas ou são inválidas
2. O client_id `95398421` não existe mais no Portal do Desenvolvedor do Conta Azul

## Credenciais Armazenadas

As credenciais estão nos **Supabase Secrets**:
- `CONTAAZUL_CLIENT_ID` - precisa ser atualizado com o novo valor
- `CONTAAZUL_CLIENT_SECRET` - precisa ser atualizado com o novo valor

## Ações Necessárias

### 1. Atualizar as Credenciais nos Supabase Secrets

Você precisará fornecer as novas credenciais obtidas no Portal do Desenvolvedor do Conta Azul para que eu possa solicitar a atualização:

| Secret | Valor Atual | Ação |
|--------|-------------|------|
| `CONTAAZUL_CLIENT_ID` | `95398421` (inválido) | Substituir pelo novo client_id |
| `CONTAAZUL_CLIENT_SECRET` | (valor antigo) | Substituir pelo novo secret |

### 2. Verificar Endpoints da API

De acordo com a mensagem do usuário, os endpoints corretos seriam:
- **Autorização**: `https://api.contaazul.com/auth/authorize`  
- **Token**: `https://api.contaazul.com/oauth2/token`

Porém, o código atual usa:
- **Autorização**: `https://auth.contaazul.com/login`
- **Token**: `https://auth.contaazul.com/oauth2/token`

Precisarei atualizar o código da Edge Function se a API v1 for a correta.

### 3. Confirmar Redirect URI

O redirect_uri está configurado como:
```
https://tributalks.com.br/oauth/callback
```

Mas a mensagem do usuário sugere:
```
https://tributalks.com.br/integracoes/contaazul/callback
```

Precisamos confirmar qual está cadastrado no Portal.

## Resumo das Alterações

| Componente | Arquivo/Local | Alteração |
|------------|---------------|-----------|
| Secrets | Supabase Secrets | Atualizar `CONTAAZUL_CLIENT_ID` e `CONTAAZUL_CLIENT_SECRET` |
| Endpoint de Autorização | `supabase/functions/contaazul-oauth/index.ts` | Possivelmente trocar de `auth.contaazul.com/login` para `api.contaazul.com/auth/authorize` |
| Endpoint de Token | `supabase/functions/contaazul-oauth/index.ts` | Possivelmente trocar de `auth.contaazul.com/oauth2/token` para `api.contaazul.com/oauth2/token` |
| Redirect URI | `ERPConnectionWizard.tsx` + `OAuthCallback.tsx` | Confirmar se precisa mudar para `/integracoes/contaazul/callback` |

## Próximos Passos

1. **Forneça as novas credenciais** - Eu solicitarei a atualização dos secrets via ferramenta
2. **Confirme a versão da API** - Você está usando API v1 (`api.contaazul.com`) ou v2 (`auth.contaazul.com`)?
3. **Confirme o redirect_uri exato** cadastrado no portal

## Seção Técnica

### Diferenças entre API v1 e v2

```text
┌─────────────────────┬───────────────────────────────────────┬────────────────────────────────────┐
│ Aspecto             │ API v1 (api.contaazul.com)            │ API v2 (auth.contaazul.com)        │
├─────────────────────┼───────────────────────────────────────┼────────────────────────────────────┤
│ URL Autorização     │ api.contaazul.com/auth/authorize      │ auth.contaazul.com/login           │
│ URL Token           │ api.contaazul.com/oauth2/token        │ auth.contaazul.com/oauth2/token    │
│ Scope               │ sales, accounting, etc                │ openid+profile+aws.cognito...      │
│ Credenciais         │ Portal antigo                         │ Novo Portal do Desenvolvedor       │
└─────────────────────┴───────────────────────────────────────┴────────────────────────────────────┘
```

### Fluxo OAuth 2.0 (após correções)

```text
Usuário → [Tributalks] → [Conta Azul Auth] → [Tributalks Callback] → [Token Exchange] → [Conexão Salva]
    │          │                │                    │                     │                 │
    │     1. Clica          2. Redireciona      3. Retorna           4. Troca code      5. Salva
    │     "Conectar"        com state           com code             por tokens         no banco
```
