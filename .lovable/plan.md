
# Plano de Correção: Integração OAuth do Conta Azul

## Resumo do Problema

O erro `invalid_request` ocorre porque a aplicação está usando URLs de endpoints OAuth **incorretas** para o Conta Azul. A documentação oficial mostra endpoints diferentes dos que estão implementados.

## Correções Necessárias

### 1. Corrigir URL de Autorização

**Arquivo:** `supabase/functions/contaazul-oauth/index.ts`  
**Linha:** 98

| Antes (Incorreto) | Depois (Correto) |
|-------------------|------------------|
| `https://auth.contaazul.com/oauth2/authorize` | `https://api.contaazul.com/auth/authorize` |

### 2. Corrigir URL de Token

**Arquivo:** `supabase/functions/contaazul-oauth/index.ts`  
**Linha:** 176

| Antes (Incorreto) | Depois (Correto) |
|-------------------|------------------|
| `https://auth.contaazul.com/oauth2/token` | `https://api.contaazul.com/oauth2/token` |

## Validação dos Parâmetros

Os demais parâmetros estão corretos conforme a documentação:
- ✅ `client_id` - OK
- ✅ `redirect_uri` - OK
- ✅ `response_type: 'code'` - OK
- ✅ `scope` - OK (mas pode precisar usar apenas `sales` conforme documentação)
- ✅ `state` - OK (UUID válido)

## Observação sobre Scopes

A documentação antiga menciona apenas o scope `sales`. A implementação atual usa scopes mais amplos. Pode ser necessário verificar quais scopes estão habilitados no painel de desenvolvedor do Conta Azul.

---

## Detalhes Técnicos

### Mudanças no Código

```text
supabase/functions/contaazul-oauth/index.ts
├── Linha 98: Alterar URL de autorização
└── Linha 176: Alterar URL de token
```

### Impacto

- Baixo risco de efeitos colaterais
- Apenas URLs de endpoints são alteradas
- A lógica de processamento permanece a mesma

### Teste Pós-Implementação

Após as correções:
1. O usuário inicia a conexão em `/integracoes`
2. Sistema redireciona para `api.contaazul.com/auth/authorize`
3. Conta Azul redireciona de volta para `tributechai.lovable.app/oauth/callback`
4. Sistema troca o código por tokens em `api.contaazul.com/oauth2/token`
5. Conexão é salva e usuário vê confirmação de sucesso
