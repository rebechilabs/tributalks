
# Integração Conta Azul - Configuração Correta

## Endpoints da API (Documentação Oficial)

Após verificação da documentação oficial da Conta Azul, os endpoints corretos são:

| Operação | Endpoint |
|----------|----------|
| **Autorização** | `https://api.contaazul.com/auth/authorize` |
| **Token** | `https://api.contaazul.com/oauth2/token` |
| **API Base** | `https://api.contaazul.com/v1/...` |

## Scopes Disponíveis

O scope deve incluir os módulos que a aplicação precisa acessar:

```
offline sales purchases products customers suppliers fiscal-invoices bank-accounts treasury
```

- `offline` - Necessário para obter refresh_token
- `sales` - Acesso a vendas, clientes, produtos, serviços, contratos

## Fluxo OAuth 2.0

1. **Autorização**: Redirecionar usuário para `api.contaazul.com/auth/authorize`
2. **Callback**: Receber `code` e `state` na redirect_uri
3. **Token Exchange**: POST para `api.contaazul.com/oauth2/token` com Basic Auth
4. **Uso**: Header `Authorization: Bearer {access_token}`
5. **Refresh**: POST para token endpoint com `grant_type=refresh_token`

## Validade dos Tokens

| Token | Validade |
|-------|----------|
| `authorization_code` | 3 minutos |
| `access_token` | 1 hora (3600s) |
| `refresh_token` | 5 anos |

## Rate Limiting

- 600 chamadas/minuto por conta conectada
- ~10 requisições/segundo

## Requisitos para Funcionamento

1. Credenciais (`client_id`, `client_secret`) do Portal de Desenvolvedores
2. URL de redirecionamento configurada: `https://tributechai.lovable.app/oauth/callback`
3. Secret `ERP_ENCRYPTION_KEY` para criptografar tokens

## Referência

- Documentação oficial: https://developers.contaazul.com
- Autenticação: https://developers.contaazul.com/auth
