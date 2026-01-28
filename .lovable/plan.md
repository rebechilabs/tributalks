

# Plano: Implementar Sincronização Automática de ERPs

## Resumo Executivo

Criar um sistema de sincronização automática que executa a cada 24 horas para todas as conexões de ERP ativas, sincronizando NF-e, Produtos e Financeiro sem intervenção manual do usuário.

---

## 1. Arquitetura da Solução

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Cron Job (pg_cron + pg_net)                   │
│                    Executa a cada 24 horas                       │
├─────────────────────────────────────────────────────────────────┤
│                    erp-auto-sync Edge Function                   │
│  - Busca todas conexões ativas com auto_sync = true              │
│  - Executa sync para cada uma sequencialmente                    │
│  - Atualiza next_sync_at após conclusão                          │
├─────────────────────────────────────────────────────────────────┤
│                    erp-sync Edge Function                        │
│  (Reutiliza adapters existentes)                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Nova Edge Function: `erp-auto-sync`

### Objetivo
Endpoint dedicado para ser chamado pelo cron job, que processa todas as conexões ativas automaticamente.

### Fluxo de Execução
1. Valida que a requisição vem do cron (Bearer token do anon key)
2. Busca todas as conexões com `status = 'active'` e `sync_config.auto_sync = true`
3. Para cada conexão:
   - Cria log de sync com `sync_type = 'auto'`
   - Chama a lógica do `erp-sync` internamente
   - Atualiza `last_sync_at` e `next_sync_at`
   - Trata erros individualmente (falha em uma não afeta outras)
4. Retorna resumo de execução

### Estrutura do Arquivo

**Arquivo:** `supabase/functions/erp-auto-sync/index.ts`

```typescript
// Pseudo-código do fluxo
Deno.serve(async (req) => {
  // 1. Buscar conexões ativas
  const { data: connections } = await supabase
    .from('erp_connections')
    .select('*')
    .eq('status', 'active')
    .filter('sync_config->>auto_sync', 'eq', 'true');

  const results = [];
  
  for (const connection of connections) {
    try {
      // 2. Executar sync
      const result = await syncConnection(connection);
      
      // 3. Atualizar timestamps
      await supabase
        .from('erp_connections')
        .update({
          last_sync_at: new Date().toISOString(),
          next_sync_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', connection.id);
      
      results.push({ id: connection.id, success: true });
    } catch (error) {
      results.push({ id: connection.id, success: false, error: error.message });
    }
  }

  return Response.json({ processed: results.length, results });
});
```

---

## 3. Configurar Cron Job no Supabase

### Extensões Necessárias
- `pg_cron` - Para agendar jobs
- `pg_net` - Para fazer requisições HTTP

### SQL para Criar o Cron Job

```sql
-- Habilitar extensões (se necessário)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar cron job para rodar a cada 24 horas (meia-noite)
SELECT cron.schedule(
  'erp-auto-sync-daily',
  '0 0 * * *',  -- Todos os dias à meia-noite UTC (21h Brasília)
  $$
  SELECT
    net.http_post(
      url := 'https://rhhzsmupixdhurricppk.supabase.co/functions/v1/erp-auto-sync',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoaHpzbXVwaXhkaHVycmljcHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTQxMjMsImV4cCI6MjA4NDc3MDEyM30.YNT52SQJMynb9Lf9i_Tv74Wau5OJ7nPleJQpxV3901o"}'::jsonb,
      body := '{"source": "cron"}'::jsonb
    ) AS request_id;
  $$
);
```

---

## 4. Atualizar UI para Mostrar Status de Auto-Sync

### Modificações no `ERPConnectionCard.tsx`

**Adicionar indicador visual:**
- Badge mostrando se auto-sync está ativo
- Próxima sincronização agendada (`next_sync_at`)
- Checkbox para ativar/desativar auto-sync

```typescript
// Exemplo de UI
{connection.sync_config.auto_sync && (
  <Badge variant="outline" className="gap-1">
    <Clock className="h-3 w-3" />
    Próxima: {formatNextSync(connection.next_sync_at)}
  </Badge>
)}
```

---

## 5. Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `supabase/functions/erp-auto-sync/index.ts` | CRIAR | Edge function para sincronização automática |
| `supabase/config.toml` | MODIFICAR | Adicionar config do erp-auto-sync |
| `src/components/integrations/ERPConnectionCard.tsx` | MODIFICAR | Mostrar status de auto-sync e próxima execução |
| SQL (via insert tool) | EXECUTAR | Criar cron job no pg_cron |

---

## 6. Tratamento de Erros

**Erros são isolados por conexão:**
- Se a conexão A falhar, a B e C continuam
- Cada erro é logado em `erp_sync_logs`
- Status da conexão é atualizado para `error` se falhar
- E-mail de alerta pode ser enviado (futuro)

**Retry automático:**
- Se falhar, tenta novamente na próxima execução (24h)
- Erros de autenticação marcam conexão como `error` para revisão manual

---

## 7. Segurança

- Cron job usa anon key (não expõe service role)
- Edge function valida origem da requisição
- Credenciais nunca são expostas em logs
- Rate limiting respeitado por adapter

---

## 8. Monitoramento

**Campos já existentes na tabela `erp_connections`:**
- `last_sync_at` - Última sincronização
- `next_sync_at` - Próxima sincronização agendada
- `status` - active/inactive/error
- `status_message` - Mensagem de erro se houver

**Logs detalhados em `erp_sync_logs`:**
- `sync_type` = 'auto' para diferenciar de manual
- `started_at`, `completed_at`
- `records_synced`, `records_failed`

---

## Entregáveis

1. **Edge Function `erp-auto-sync`** - Orquestrador de sincronização automática
2. **Cron Job configurado** - Execução diária à meia-noite
3. **UI atualizada** - Indicadores visuais de auto-sync e próxima execução
4. **Logs de auditoria** - Distinção entre sync manual e automático

---

## Cronograma de Sincronização

| Horário (UTC) | Horário (Brasília) | Ação |
|---------------|---------------------|------|
| 00:00 | 21:00 | Execução do cron job |
| 00:01-00:30 | 21:01-21:30 | Processamento das conexões |
| Após sync | - | `next_sync_at` = T+24h |

---

## Dados Sincronizados

Para cada conexão ativa, o sync automático processa:

1. **NF-e** (últimos 90 dias)
   - Importa para `xml_imports`
   - Dispara `analyze-credits`

2. **Produtos/NCM**
   - Atualiza `company_ncm_analysis`
   - Dispara `analyze-ncm-from-xmls`

3. **Financeiro (DRE)**
   - Atualiza `company_dre`
   - Dispara `calculate-tax-score`

4. **Perfil da Empresa**
   - Atualiza `company_profile`
   - Dispara `match-opportunities`

