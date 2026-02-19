
# Corrigir CORS em Todas as Edge Functions

## Resumo

Substituir `Access-Control-Allow-Origin: *` por `https://tributalks.com.br` em todas as 49 Edge Functions + o arquivo compartilhado `_shared/cors.ts`. Tambem padronizar os `Access-Control-Allow-Headers` para incluir todos os headers necessarios do Supabase client.

## Escopo

**51 arquivos a modificar:**
- `supabase/functions/_shared/cors.ts` (arquivo compartilhado, nao importado por nenhuma funcao atualmente mas deve ser corrigido)
- 49 funcoes em `supabase/functions/*/index.ts` (todas com `"*"` atualmente, nenhuma ja tem o dominio correto)

**1 arquivo NAO modificado:**
- `supabase/functions/_shared/rate-limiter.ts` (nao contem CORS)

## Consideracao Importante: URLs de Preview

O dominio de preview do Lovable (`https://id-preview--*.lovable.app`) tambem faz chamadas as Edge Functions durante desenvolvimento. Ao restringir o CORS a apenas `https://tributalks.com.br`, as chamadas feitas a partir do preview do Lovable serao **bloqueadas pelo navegador**.

**Opcoes:**
1. **Restringir apenas ao dominio de producao** (`https://tributalks.com.br`) — mais seguro, mas o preview do Lovable nao funcionara para testar Edge Functions
2. **Permitir ambos os dominios** — usar logica dinamica que verifica o `Origin` header e responde com o dominio correspondente se estiver na lista permitida

**Recomendacao:** Usar a opcao 2 com validacao dinamica de Origin para nao quebrar o ambiente de desenvolvimento:

```text
const ALLOWED_ORIGINS = [
  "https://tributalks.com.br",
  "https://tributalks.lovable.app",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}
```

Se preferir a opcao 1 (apenas producao), basta confirmar e usaremos o valor fixo `https://tributalks.com.br`.

## Padrao de Headers

Todas as funcoes receberao o mesmo conjunto de `Access-Control-Allow-Headers`:
```text
authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version
```

Atualmente apenas 6 funcoes tem esses headers estendidos. As demais 43 serao atualizadas para incluir todos.

## Mudancas por Arquivo

### _shared/cors.ts
- Substituir `'*'` pelo dominio correto
- Headers ja estao completos

### 6 funcoes com headers estendidos (ja tem x-supabase-client-platform)
Apenas trocar `'*'` por `'https://tributalks.com.br'`:
- analyze-suppliers
- clara-assistant
- generate-executive-report
- invite-to-circle
- notify-new-subscriber
- subscribe-newsletter

### 43 funcoes com headers basicos
Trocar `'*'` por `'https://tributalks.com.br'` **E** adicionar os headers estendidos:
- analyze-credits
- analyze-document
- analyze-ncm-from-xmls
- calculate-rtc
- calculate-tax-score
- check-achievements
- check-expiring-benefits
- check-platform-inactivity
- check-score-recalculation
- contaazul-oauth
- cross-analyze-fiscal
- erp-auto-sync
- erp-connection
- erp-sync
- execute-autonomous-action
- export-tax-opportunities
- fetch-news
- generate-clara-insights
- generate-embeddings
- generate-roadmap
- gov-data-api
- match-opportunities
- memory-decay
- populate-embeddings
- process-autonomous-cron
- process-dctf
- process-dre
- process-news
- process-pgdas
- process-referral-rewards
- process-sped-contribuicoes
- process-xml-batch
- quick-diagnostic
- search-news
- semantic-search
- send-batch-executive-reports
- send-contact-email
- send-daily-metrics
- send-executive-report
- send-news-alerts
- send-weekly-digest
- stripe-webhook
- track-presence
- trigger-autonomous-actions

## O que NAO muda

- Nenhuma logica de negocio e alterada
- Nenhum handler, response body ou status code e modificado
- Apenas as constantes `corsHeaders` sao atualizadas

## Secao Tecnica

### Variacoes de formato no codigo atual

As funcoes usam 3 formatos ligeiramente diferentes de declaracao do corsHeaders:

1. **Formato padrao (maioria):**
```text
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, ...",
};
```

2. **Formato com quebra de linha no valor:**
```text
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, ...",
};
```

3. **Formato com aspas simples:**
```text
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '...',
};
```

Cada variacao sera tratada individualmente para garantir que a substituicao funcione corretamente.

### Funcoes com corsHeaders inline vs constante

Algumas funcoes usam `{ ...corsHeaders, "Content-Type": "application/json" }` nos responses — estas continuarao funcionando normalmente pois o spread operator pega o valor atualizado da constante.
