
# Plano: Corrigir Desconexão do Conta Azul e Sincronização de Contas

## Situação Atual

### Diagnóstico Completo
A usuária **Stephanie** possui **duas contas** no sistema:

| Email | Plano | Conexão Conta Azul |
|-------|-------|-------------------|
| `stephanie@rebechisilva.com.br` | PROFESSIONAL | ❌ Não tem |
| `rebechi.ste@gmail.com` | ENTERPRISE | ✅ Tem (com erro) |

Quando ela acessa pelo email corporativo, não vê a conexão porque ela pertence à outra conta.

### Bugs Encontrados
1. **Bug de DELETE**: O frontend envia o ID no `body`, mas a Edge Function espera no `query parameter` - desconexão sempre falha
2. **Inconsistência OAuth**: O callback pode ter criado a conexão na conta errada se ela estava logada com email diferente

---

## Solução Proposta

### Etapa 1: Corrigir Bug do DELETE na Edge Function
Modificar a função para aceitar o ID tanto do body quanto do query parameter.

**Arquivo:** `supabase/functions/erp-connection/index.ts`

```typescript
// DELETE - Remove connection
if (req.method === "DELETE") {
  // Support both query param and body for backwards compatibility
  let deleteConnectionId = connectionId;
  
  if (!deleteConnectionId) {
    try {
      const body = await req.json();
      deleteConnectionId = body.id;
    } catch {
      // No body provided
    }
  }
  
  if (!deleteConnectionId) {
    return new Response(
      JSON.stringify({ error: "ID da conexão é obrigatório" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data, error } = await supabase
    .from("erp_connections")
    .delete()
    .eq("id", deleteConnectionId)
    .eq("user_id", userId)
    .select("id");

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return new Response(
      JSON.stringify({ error: "Conexão não encontrada ou você não tem permissão" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: "Conexão removida com sucesso" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

### Etapa 2: Ação Administrativa Imediata
Deletar a conexão problemática diretamente via SQL (ação única de admin).

```sql
-- Deletar a conexão Conta Azul com erro
DELETE FROM erp_connections 
WHERE id = '6a71f33f-2aa4-49f8-9857-323c812f6ebf';
```

### Etapa 3: Adicionar Logs no OAuth Callback
Melhorar a rastreabilidade do fluxo OAuth para debugar problemas futuros.

**Arquivo:** `supabase/functions/contaazul-oauth/index.ts`

Adicionar logs estruturados em pontos críticos:
- Início do exchange de tokens
- Resultado da chamada à API Conta Azul
- Antes/depois de salvar no banco
- Erros com contexto

---

## Ação Imediata Recomendada

Para resolver o problema da Stephanie **agora**:

1. **Deletar a conexão via banco** (já que o DELETE da UI não funciona):
   - Conexão ID: `6a71f33f-2aa4-49f8-9857-323c812f6ebf`

2. **Orientar a Stephanie** a:
   - Fazer login com `rebechi.ste@gmail.com` (onde está a conexão)
   - Ou reconectar o Conta Azul usando `stephanie@rebechisilva.com.br`

3. **Consolidar contas** (opcional):
   - Considerar se as duas contas deveriam ser uma só

---

## Detalhes Técnicos

### Por que o DELETE falha?

```text
Frontend (Integracoes.tsx:157-160)
┌─────────────────────────────────────────┐
│ supabase.functions.invoke("erp-conn", { │
│   method: "DELETE",                     │
│   body: { id: connectionId }  ← Envia   │
│ })                              no body │
└─────────────────────────────────────────┘
                  ▼
Edge Function (erp-connection:444-450)
┌─────────────────────────────────────────┐
│ const connectionId =                    │
│   url.searchParams.get("id") ← Espera   │
│                         query parameter │
│                                         │
│ if (!connectionId) → ERRO 400           │
└─────────────────────────────────────────┘
```

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/erp-connection/index.ts` | Aceitar ID do body no DELETE |
| `supabase/functions/contaazul-oauth/index.ts` | Adicionar logs estruturados |

---

## Resultado Esperado

Após as correções:
- ✅ Botão "Remover" funcionará corretamente
- ✅ Logs permitirão debugar problemas OAuth futuros
- ✅ Stephanie poderá desconectar e reconectar normalmente
