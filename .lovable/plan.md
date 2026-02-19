

# Adicionar Autenticacao Bearer Token em 8 Edge Functions

## Resumo

Adicionar validacao de autenticacao JWT em 8 Edge Functions que atualmente nao verificam a identidade do chamador. O mesmo padrao sera aplicado em todas.

## Analise por Funcao

Cada funcao tem particularidades em como (ou se) parseia o body. A tabela abaixo resume:

| Funcao | Parseia body? | Campo userId | Adaptacao necessaria |
|--------|:---:|:---:|---|
| check-achievements | Sim (`await req.json()`) | `user_id` | Substituir por `body`, checar `body.user_id` |
| quick-diagnostic | Sim (`await req.json()`) | `userId` | Substituir por `body`, checar `body.userId` |
| execute-autonomous-action | Sim (`body = await req.json()`) | Nenhum direto | Ja usa `body`, apenas inserir auth antes |
| trigger-autonomous-actions | Sim (`body = await req.json()`) | `user_id` | Ja usa `body`, inserir auth antes e checar `body.user_id` |
| memory-decay | Nao | Nenhum | Inserir auth, nao precisa parsear body |
| export-tax-opportunities | Nao | Nenhum | Inserir auth, nao precisa parsear body |
| process-referral-rewards | Nao | Nenhum | Inserir auth, nao precisa parsear body |
| process-pgdas | Sim (`await req.json()`) | Nenhum | Substituir por `body`, sem check de userId |

## Mudancas por Arquivo

### 1. check-achievements/index.ts
- Inserir bloco de auth apos OPTIONS (linha 121)
- Linha 128: substituir `const { user_id } = await req.json()` por `const { user_id } = body`
- Check de identidade usa `body.user_id` (campo com underscore)

### 2. quick-diagnostic/index.ts
- Inserir bloco de auth apos OPTIONS (linha 209)
- Linha 218: substituir `const { xmlPaths, userId }: DiagnosticRequest = await req.json()` por `const { xmlPaths, userId } = body as DiagnosticRequest`
- Check de identidade usa `body.userId` (camelCase)

### 3. execute-autonomous-action/index.ts
- Inserir bloco de auth apos OPTIONS (linha 241)
- Linha 248 ja usa `const body = await req.json()` — mover o parse para dentro do bloco de auth
- Sem check de userId (funcao usa `action_id`/`process_all`)

### 4. trigger-autonomous-actions/index.ts
- Inserir bloco de auth apos OPTIONS (linha 76)
- Linha 83 ja usa `const body = await req.json()` — mover o parse para dentro do bloco de auth
- Check de identidade usa `body.user_id`

### 5. memory-decay/index.ts
- Inserir bloco de auth apos OPTIONS (linha 26)
- Sem body parsing, sem check de userId (funcao administrativa)

### 6. export-tax-opportunities/index.ts
- Inserir bloco de auth apos OPTIONS (linha 11)
- Sem body parsing, sem check de userId (funcao de consulta)

### 7. process-referral-rewards/index.ts
- Inserir bloco de auth apos OPTIONS (linha 119)
- Sem body parsing, sem check de userId (funcao batch)

### 8. process-pgdas/index.ts
- Inserir bloco de auth apos OPTIONS (linha 201)
- Linha 209: substituir `const { pgdasId, storagePath } = await req.json()` por `const { pgdasId, storagePath } = body`
- Sem check de userId (body nao tem userId)

## Bloco de Auth Padrao

O bloco inserido em todas as funcoes:

```text
// Validar Bearer token
const authHeader = req.headers.get('Authorization');
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

const token = authHeader.replace('Bearer ', '');
const supabaseAuth = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
);

const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
if (authError || !user) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// (Apenas para funcoes com body contendo userId/user_id)
const body = await req.json();
if (body.userId && body.userId !== user.id) {
  return new Response(
    JSON.stringify({ error: 'Forbidden' }),
    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

Para funcoes que ja tem `const body = await req.json()`, o parse sera movido para dentro do bloco de auth. Para funcoes sem body (memory-decay, export-tax-opportunities, process-referral-rewards), o parse e o check de userId sao omitidos.

## O que NAO muda

- Nenhuma logica de negocio e alterada
- Nenhum layout ou resposta e modificado
- Nenhum outro arquivo e tocado
- O cliente `supabase` com service role key continua sendo usado para operacoes de banco

## Secao Tecnica

### Arquivos modificados

| Arquivo | Tipo de mudanca |
|---------|----------------|
| `supabase/functions/check-achievements/index.ts` | Auth + body refactor |
| `supabase/functions/quick-diagnostic/index.ts` | Auth + body refactor |
| `supabase/functions/execute-autonomous-action/index.ts` | Auth + body reorder |
| `supabase/functions/trigger-autonomous-actions/index.ts` | Auth + body reorder |
| `supabase/functions/memory-decay/index.ts` | Auth only |
| `supabase/functions/export-tax-opportunities/index.ts` | Auth only |
| `supabase/functions/process-referral-rewards/index.ts` | Auth only |
| `supabase/functions/process-pgdas/index.ts` | Auth + body refactor |

### Variacao no check de userId

- `check-achievements` e `trigger-autonomous-actions`: campo `user_id` (underscore)
- `quick-diagnostic`: campo `userId` (camelCase)
- Demais: sem campo userId no body — check omitido

