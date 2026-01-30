
# Plano: Correção de Segurança - Erros Verbosos + Ignorar Avisos Informativos

## Resumo

Vou executar duas ações:
1. **Ignorar avisos informativos** que já possuem proteção adequada via RLS
2. **Corrigir mensagens de erro verbosas** em edge functions que podem expor detalhes internos

---

## Parte 1: Ignorar Avisos Informativos

Estes avisos serão marcados como "ignorados" com justificativa documentada:

| Aviso | Justificativa para Ignorar |
|-------|---------------------------|
| Complete Financial Statements Could Be Exposed | Tabela `company_dre` possui RLS `auth.uid() = user_id` |
| Tax Planning Strategy Could Be Stolen | Tabela `tax_score` possui RLS `auth.uid() = user_id` |
| Supplier Network Could Be Stolen | Tabela `suppliers` possui RLS `auth.uid() = user_id` |
| Customer Contact Information Could Be Stolen | Tabela `contatos` restrita a admin-only (SELECT/UPDATE requer `has_role('admin')`) |

---

## Parte 2: Corrigir Erros Verbosos

### Problema Atual
As edge functions expõem detalhes internos de erro:
```typescript
JSON.stringify({ error: 'Internal server error', details: String(error) })
JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" })
```

Isso pode revelar caminhos de arquivos, estrutura de banco, detalhes de API, etc.

### Solução
Padronizar resposta de erro genérica para o cliente, mantendo log interno:
```typescript
console.error('Detalhe do erro:', error); // Log interno (visível apenas no servidor)
return new Response(
  JSON.stringify({ error: 'Ocorreu um erro ao processar sua solicitação' }),
  { status: 500, headers: corsHeaders }
);
```

### Edge Functions a Corrigir

| Arquivo | Linha | Alteração |
|---------|-------|-----------|
| `process-dre/index.ts` | 243 | Remover `details: String(error)` |
| `analyze-document/index.ts` | 255 | Usar mensagem genérica |
| `send-executive-report/index.ts` | 437 | Usar mensagem genérica |
| `check-expiring-benefits/index.ts` | 206-210 | Usar mensagem genérica |
| `check-achievements/index.ts` | 256-258 | Usar mensagem genérica |
| `analyze-ncm-from-xmls/index.ts` | 496-498 | Usar mensagem genérica |
| `gov-data-api/index.ts` | 420-422 | Usar mensagem genérica |
| `generate-executive-report/index.ts` | 530 | Usar mensagem genérica |
| `fetch-news/index.ts` | 218 | Usar mensagem genérica |
| `check-platform-inactivity/index.ts` | 108-110 | Usar mensagem genérica |
| `cross-analyze-fiscal/index.ts` | 256-258 | Usar mensagem genérica |
| `erp-auto-sync/index.ts` | 206-209 | Usar mensagem genérica |
| `check-score-recalculation/index.ts` | 76-79 | Usar mensagem genérica |

### Padrão a Seguir

Cada catch block será alterado de:
```typescript
catch (error) {
  console.error('Error:', error);
  return new Response(
    JSON.stringify({ error: error instanceof Error ? error.message : 'Erro' }),
    { status: 500, headers: corsHeaders }
  );
}
```

Para:
```typescript
catch (error) {
  console.error('Error:', error); // Mantém log interno
  return new Response(
    JSON.stringify({ error: 'Ocorreu um erro ao processar sua solicitação.' }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

---

## Resultado Esperado

Após implementação:
- 4 avisos de segurança serão marcados como ignorados com justificativa
- 13 edge functions terão mensagens de erro genéricas
- Logs internos continuam disponíveis para debug
- Nenhuma informação sensível será exposta aos clientes
- O warning "Verbose Error Messages" será removido do scan de segurança
