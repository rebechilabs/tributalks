
# Correcao: Isolamento de Creditos por Sessao de Importacao

## Problema Confirmado

| Dado | Valor |
|------|-------|
| Total de `identified_credits` | 716 |
| Com `xml_import_id` preenchido | **0 (100% NULL)** |
| Total de `xml_analysis` | 2.354 (cada xml_import gera ~7 registros duplicados) |
| `xml_imports` COMPLETED | 1.256 (1 por arquivo) |

O filtro por `import_id` **nao funciona** porque todos os 716 creditos tem `xml_import_id = NULL`.

### Causa raiz

`useReanalyzeCredits` chama `process-xml-batch` (que apenas reprocessa XMLs e salva em `xml_analysis`), mas desde que o auto-trigger foi removido, **nenhum credito novo e gerado**. Os 716 creditos existentes sao de execucoes anteriores onde `xml_import_id` nunca foi preenchido.

### Problema arquitetural: xml_imports e 1:1

Cada arquivo XML gera 1 registro em `xml_imports`. Nao existe conceito de "sessao/lote". Quando o usuario importa 21 arquivos, sao 21 registros separados. Selecionar 1 import_id no seletor mostra creditos de apenas 1 arquivo.

## Solucao em 5 passos

### 1. Adicionar coluna `batch_id` em `xml_imports` (migracao SQL)

Criar um campo para agrupar importacoes feitas no mesmo lote:

```sql
ALTER TABLE xml_imports ADD COLUMN IF NOT EXISTS batch_id TEXT;
```

Na logica de upload de XMLs, gerar um `batch_id` unico (UUID ou timestamp) para cada lote de arquivos importados juntos. Todos os arquivos enviados no mesmo upload compartilham o mesmo `batch_id`.

### 2. Refatorar `useReanalyzeCredits` -- chamar `analyze-credits` diretamente

O hook atualmente chama `process-xml-batch` (que so processa XMLs brutos). Deve ser refatorado para:

1. Buscar todos os `import_id`s do mesmo lote (usando `batch_id` ou agrupamento por timestamp)
2. Buscar `xml_analysis.raw_data` para esses import_ids (dados ja parseados)
3. Converter `raw_data` para o formato `parsed_xmls` esperado por `analyze-credits`
4. Chamar `analyze-credits` diretamente com `xml_import_id` = primeiro import do lote
5. `analyze-credits` limpa creditos anteriores com esse `xml_import_id` e insere novos

```typescript
// Fluxo correto:
const { data: analyses } = await supabase
  .from('xml_analysis')
  .select('raw_data, import_id')
  .in('import_id', batchImportIds);

const parsedXmls = analyses.map(a => convertRawData(a.raw_data));

await supabase.functions.invoke('analyze-credits', {
  body: { 
    parsed_xmls: parsedXmls,
    xml_import_id: batchImportIds[0],  // referencia do lote
    user_id: user.id  // para chamadas internas
  }
});
```

### 3. Atualizar `useXmlImportSessions` -- agrupar por lote

Em vez de listar 1.256 registros individuais, agrupar por `batch_id` ou por intervalo de tempo (5 minutos):

```typescript
// Agrupar imports feitos no mesmo intervalo de 5 minutos
const sessions = groupByTimeWindow(allImports, 5 * 60 * 1000);
// Resultado: [{batchDate: "17/02/2026 14:30", fileCount: 21, importIds: [...]}, ...]
```

O seletor mostrara: `"17/02/2026 14:30 - 21 arquivos"` em vez de 1.256 items individuais.

### 4. Atualizar `useIdentifiedCredits` -- filtrar por lista de import_ids

Aceitar uma lista de `import_ids` (do lote) em vez de um unico `importId`:

```typescript
// Filtrar por multiplos import_ids do mesmo lote
query = query.in('xml_import_id', batchImportIds);
```

### 5. Limpar dados inconsistentes

Deletar os 716 creditos com `xml_import_id = NULL` (dados inconsistentes de execucoes anteriores):

```sql
DELETE FROM identified_credits 
WHERE user_id = '37307539-3b5a-452e-afdd-201965336fba' 
AND xml_import_id IS NULL;
```

Depois re-analisar com o fluxo corrigido para gerar creditos limpos e vinculados.

## Sequencia de Implementacao

1. Migracao SQL: adicionar `batch_id` em `xml_imports`
2. Atualizar logica de upload para gerar `batch_id`
3. Criar funcao de agrupamento retroativo (agrupar imports existentes por timestamp)
4. Refatorar `useXmlImportSessions` com agrupamento por lote
5. Refatorar `useReanalyzeCredits` para chamar `analyze-credits` diretamente
6. Atualizar `useIdentifiedCredits` e `useIdentifiedCreditsSummary` para filtrar por lista de import_ids
7. Atualizar `CreditRadar` para passar lista de import_ids em vez de id unico
8. Limpar dados inconsistentes e re-analisar

## Resultado

- Cada lote de importacao tera sua analise isolada
- Creditos vinculados a import_ids reais (nunca NULL)
- Seletor mostra lotes ("21 arquivos em 17/02") em vez de 1.256 items
- Re-analise limpa e recria creditos sem duplicatas
