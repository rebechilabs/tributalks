

# Correcao de Autenticacao na Edge Function send-executive-report

## Problema

A Edge Function `send-executive-report/index.ts` nao valida o token de autenticacao do usuario. Qualquer requisicao com um `userId` arbitrario no body pode disparar o envio de relatorios, expondo dados sensiveis e permitindo uso nao autorizado do servico de email.

## Correcao

Adicionar validacao Bearer token logo apos o bloco OPTIONS, antes de processar o body da requisicao.

### Mudancas no arquivo `supabase/functions/send-executive-report/index.ts`

1. Apos a linha 283 (fim do bloco OPTIONS), inserir:
   - Validacao do header `Authorization` (Bearer token)
   - Criacao de cliente Supabase com anon key para validar o token via `getUser()`
   - Retorno 401 se token invalido ou ausente
   - Parse do body (`await req.json()`) antes da validacao de `userId`
   - Comparacao `body.userId !== user.id` retornando 403 se divergente

2. Substituir a linha 292:
   - De: `const { userId, ... } = await req.json() as ReportRequest;`
   - Para: `const { userId, ... } = body;` (body ja foi parseado na etapa de autenticacao)

### O que NAO muda

- Nenhuma outra logica do arquivo e alterada
- Template de email, envio via Resend, logs — tudo permanece identico
- Nenhum outro arquivo e modificado

## Secao Tecnica

### Fluxo apos a correcao

```text
Request -> OPTIONS check -> Bearer token check (401) -> getUser() (401) -> userId match (403) -> processamento normal
```

### Detalhes

- Usa `supabase.auth.getUser(token)` para validar o JWT contra o servidor de autenticacao
- Cliente criado com `SUPABASE_ANON_KEY` (nao service role) para validacao de auth
- O cliente `supabase` com service role key continua sendo usado para operacoes de banco (profiles, logs)
- Garante que o usuario autenticado so pode enviar relatorios para si mesmo (previne IDOR)

