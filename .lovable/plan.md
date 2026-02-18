
# Correcao: XMLs chegam com itens vazios ao motor de creditos

## Causa raiz

Dois problemas encadeados impedem o calculo:

### Problema 1 — Campo "produtos" nao e mapeado no hook

O `raw_data` na tabela `xml_analysis` armazena os itens da NF-e no campo `produtos`. Porem o hook `useReanalyzeCredits.ts` (linha 87) tenta ler `raw.itens || raw.items`, que nao existem.

Dado real no banco:
```text
raw_data.produtos = [
  { ncm: "84181000", cfop: "1102", valorTotal: 15000, cst_pis: "01", ... },
  { ncm: "84181000", cfop: "1102", valorTotal: 12000, cst_pis: "01", ... }
]
```

O hook monta: `{ itens: [] }` — vazio.

### Problema 2 — Nomes de campos incompativeis na edge function

A edge function `analyze-credits` espera `item.valor_item`, mas o dado real e `valorTotal`. Tambem espera `item.cst_icms`, mas o dado e `cstIcms` (camelCase).

| Edge function espera | Dado real no banco |
|---|---|
| `item.valor_item` | `valorTotal` |
| `item.cst_pis` | `cst_pis` (ok) |
| `item.cst_icms` | `cst_icms` (ok, mas tambem `cstIcms`) |
| `item.csosn` | `csosn` (se existir) |

## Plano de correcao

### Arquivo 1: `src/hooks/useReanalyzeCredits.ts` (linha 87)

Adicionar `raw.produtos` ao mapeamento:

```typescript
itens: raw.itens || raw.items || raw.produtos || [],
```

### Arquivo 2: `supabase/functions/analyze-credits/index.ts` (linha 449)

Normalizar o campo de valor do item para aceitar ambos formatos:

```typescript
const valorItem = item.valor_item || item.valorTotal || item.valor_total || 0
```

Tambem normalizar CSOSN (linha 448):

```typescript
const csosn = item.csosn || item.cst_icms || item.cstIcms || ''
```

### Arquivo 2 (continuacao): Normalizar campo de itens na edge function (linha 443)

Para robustez, aceitar ambos os nomes:

```typescript
const items = xml.itens || xml.items || xml.produtos || []
```

## O que NAO muda

- Formula proporcional de calculo (ja esta correta)
- Busca de PGDAS (ja corrigida anteriormente)
- Estrutura das tabelas
- Layout da UI

## Resultado esperado

Com os campos mapeados corretamente, o motor vai:
1. Ler os produtos de cada XML
2. Classificar por NCM monofasico e CFOP com ST
3. Calcular fat_mono, fat_ST e fat_total
4. Aplicar a formula proporcional usando reparticao do PGDAS
5. Gravar creditos em `identified_credits`

Nota sobre o gabarito: Os valores finais dependem dos XMLs reais importados e dos NCMs que se encaixam na lista de monofasicos. O NCM 84181000 (geladeira) nao e monofasico, entao com os dados de teste atuais o resultado sera R$ 0. Para gerar os valores do gabarito (R$ 5.235,67), e necessario ter XMLs com NCMs monofasicos reais (ex: 22021000 bebidas, 30049099 medicamentos, 27101259 combustiveis).
