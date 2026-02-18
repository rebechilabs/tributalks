

# Correcao: Dados do PGDAS nao chegam ao motor de creditos

## Diagnostico real (diferente do que parecia)

O problema NAO e que os dados do PGDAS nao sao enviados pelo hook. A edge function `analyze-credits` ja busca os dados do PGDAS diretamente do banco (linhas 296-304). O verdadeiro problema e um **filtro de data que exclui todos os registros**.

### Evidencia dos logs

```
[analyze-credits] Regime raw: 'simples', normalized: 'simples', Simples: true, 
  CNAE: 1091101, Aliquota: 0, RBT12: 0, Mistas: false

[analyze-credits] Simples: sem dados de reparticao no PGDAS ou faturamento zero. 
  reparticao=false, fatTotalRef=0
```

### Por que RBT12=0 e reparticao=false?

A edge function faz:

```typescript
const twelveMonthsAgo = new Date()
twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
// Resultado: 2025-02-18

const { data: pgdasRecords } = await supabaseAdmin
  .from('pgdas_arquivos')
  .select(...)
  .eq('user_id', userId)
  .gte('periodo_apuracao', twelveMonthsAgo.toISOString().split('T')[0])
  // Filtra: periodo_apuracao >= '2025-02-18'
```

Mas os dados no banco sao de **2024** (periodo_apuracao: 2024-10, 2024-11, 2024-12). O filtro `>= 2025-02-18` exclui TODOS os registros, resultando em `latestPgdas = null`.

### Dados existem e estao corretos

```
pgdas_arquivos (ultimos 3 registros):
- periodo: 2024-12, receita_bruta: 200000, reparticao: {pis: 538.75, cofins: 2486.85, icms: 6636.80, ...}
- periodo: 2024-11, receita_bruta: 200000, reparticao: idem
- periodo: 2024-10, receita_bruta: 200000, reparticao: idem
```

## Plano de correcao

### Arquivo 1: `supabase/functions/analyze-credits/index.ts`

**Correcao A** — Ampliar janela de busca do PGDAS de 12 para 60 meses. Se a empresa tem PGDAS de periodos anteriores, eles ainda sao validos para calcular a reparticao. A janela de 12 meses so faz sentido para RBT12, nao para encontrar o ultimo PGDAS disponivel.

Linhas 296-304: Mudar a busca para usar uma janela mais ampla e, separadamente, buscar o PGDAS mais recente independente da data.

```typescript
// Buscar PGDAS mais recente (sem filtro de data) para reparticao
const { data: latestPgdasRecord } = await supabaseAdmin
  .from('pgdas_arquivos')
  .select('aliquota_efetiva, dados_completos, periodo_apuracao, anexo_simples, receita_bruta')
  .eq('user_id', userId)
  .order('periodo_apuracao', { ascending: false })
  .limit(1)
  .maybeSingle()

// Buscar PGDAS dos ultimos 60 meses para calculo de RBT12
const sixtyMonthsAgo = new Date()
sixtyMonthsAgo.setMonth(sixtyMonthsAgo.getMonth() - 60)

const { data: pgdasRecords } = await supabaseAdmin
  .from('pgdas_arquivos')
  .select('aliquota_efetiva, dados_completos, periodo_apuracao, anexo_simples, receita_bruta')
  .eq('user_id', userId)
  .gte('periodo_apuracao', sixtyMonthsAgo.toISOString().split('T')[0])
  .order('periodo_apuracao', { ascending: false })
```

Linha 306: Usar `latestPgdasRecord` ao inves de `pgdasRecords?.[0]`.

**Correcao B** — Tambem aceitar `pgdas_data` enviado pelo hook como override (para compatibilidade futura). Se o payload incluir `pgdas_data`, usar esses valores em vez de buscar no banco.

### Arquivo 2: `src/hooks/useReanalyzeCredits.ts`

**Correcao C** — Parar de engolir erros silenciosamente (linhas 121-125):

```typescript
// ANTES
if (response.error) {
  console.error(`Batch ${i / BATCH_SIZE + 1} error:`, response.error);
}

// DEPOIS
if (response.error) {
  console.error(`Batch ${i / BATCH_SIZE + 1} error:`, response.error);
  toast.error(`Erro no lote ${i / BATCH_SIZE + 1}: ${response.error.message || 'Erro desconhecido'}`);
  break;
}
```

## O que NAO precisa mudar

- O hook NAO precisa buscar `pgdas_imports` (essa tabela nao existe)
- O hook NAO precisa enviar dados do PGDAS no payload — a edge function ja busca direto do banco, so precisa do filtro de data corrigido
- A logica de calculo de creditos (proporcional por reparticao) ja esta correta
- As regras SIMPLES_MONO_001 e SIMPLES_ICMS_ST_001 ja estao implementadas

## Resultado esperado

Com a janela de busca corrigida, a edge function vai encontrar os registros de 2024, extrair a reparticao (`pis: 538.75, cofins: 2486.85, icms: 6636.80`) e calcular os creditos proporcionais sobre a receita de produtos monofasicos e com ST.

