

# Correcao do Motor de Calculo do Radar de Creditos (Simples Nacional)

## Problema Identificado

O calculo atual na Edge Function `analyze-credits` esta incorreto por dois motivos:

1. **PIS e COFINS sao calculados juntos** (como um unico credito "PIS/COFINS") em vez de serem separados
2. **A base indevida de PIS/COFINS inclui apenas produtos monofasicos**, mas deveria incluir tambem produtos com ST (ambos ja tiveram PIS/COFINS recolhidos anteriormente na cadeia)
3. **O calculo e feito item a item** (`valorItem * aliquotaEfetiva * parcelaPisCofins`), em vez de usar a formula proporcional correta baseada nos valores absolutos do PGDAS

### Formula Correta (confirmada com os dados do banco)

Os dados de reparticao no PGDAS ja estao em valores absolutos (R$):
- PIS_pago = R$ 538,75 | COFINS_pago = R$ 2.486,85 | ICMS_pago = R$ 6.636,80

```text
PIS indevido    = PIS_pago    x (fat_mono + fat_ST) / fat_total
COFINS indevido = COFINS_pago x (fat_mono + fat_ST) / fat_total
ICMS-ST indevido = ICMS_pago  x fat_ST / fat_total
```

## O que sera alterado

Apenas 2 arquivos. Nenhuma mudanca visual, de layout ou fluxo de upload.

### 1. Edge Function `analyze-credits` (supabase/functions/analyze-credits/index.ts)

**Secao Simples Nacional (linhas ~414-520)** — substituir a logica item-a-item pela logica agregada:

- Manter o loop de XMLs, mas apenas para **somar** `faturamentoMonofasico` e `faturamentoST` (sem criar creditos individuais por item)
- Apos o loop, buscar os dados de PGDAS do periodo (reparticao em R$, receita_bruta)
- Se houver multiplos PGDAS (multiplos meses), agrupar os XMLs por mes e calcular por periodo
- Aplicar a formula proporcional para gerar **3 creditos separados** por periodo:
  - Credito PIS (rule_id: SIMPLES_MONO_001, product_description explicita "PIS")
  - Credito COFINS (rule_id: SIMPLES_MONO_001, product_description explicita "COFINS")
  - Credito ICMS-ST (rule_id: SIMPLES_ICMS_ST_001)
- Threshold de R$ 0,01 para evitar creditos insignificantes

### 2. Logica frontend `src/lib/simples-nacional-rules.ts`

Atualizar para alinhar com a nova formula (este arquivo e usado para calculos rapidos no frontend):
- Separar PIS e COFINS em creditos distintos
- Incluir faturamento ST na base indevida de PIS/COFINS
- Usar a mesma formula proporcional

## Detalhes Tecnicos

### Pseudocodigo da nova logica no analyze-credits

```text
// 1. Iterar XMLs apenas para somar receitas
faturamentoMonofasico = 0
faturamentoST = 0
faturamentoTotal = 0

para cada xml em parsed_xmls:
  para cada item em xml.itens:
    se nao e operacao de saida: pular
    faturamentoTotal += item.valor_item
    se item e monofasico (NCM ou CST): faturamentoMonofasico += item.valor_item
    se item e ST (CSOSN 500 ou CFOP 5405/6405/5403/6403): faturamentoST += item.valor_item

// 2. Buscar dados PGDAS (ja disponivel: latestPgdas)
reparticao = pgdas.dados_completos.reparticao  // valores em R$
fatTotal = pgdas.receita_bruta OU faturamentoTotal (fallback)

// 3. Guardar: evitar divisao por zero
se fatTotal == 0: retornar []

// 4. Calcular creditos proporcionais
baseIndevidaPisCofins = faturamentoMonofasico + faturamentoST

pisIndevido    = reparticao.pis    * (baseIndevidaPisCofins / fatTotal)
cofinsIndevido = reparticao.cofins * (baseIndevidaPisCofins / fatTotal)
icmsStIndevido = reparticao.icms   * (faturamentoST / fatTotal)

// 5. Inserir 3 creditos (se > 0.01)
```

### Tratamento multi-periodo

Quando ha PGDAS de multiplos meses, os XMLs serao somados como um unico periodo (ja que o batch de XMLs geralmente corresponde a um mes ou trimestre). O `faturamentoTotal` dos XMLs sera comparado com o `receita_bruta` do PGDAS para validacao.

Se houver multiplos PGDAS, usar o mais recente (comportamento atual mantido).

### Tabela de validacao integrada

Os valores esperados serao verificados contra:
- Out/24: PIS R$ 184,03 | COFINS R$ 849,47 | ICMS-ST R$ 308,62
- Nov/24: PIS R$ 289,90 | COFINS R$ 1.338,15 | ICMS-ST R$ 134,11
- Dez/24: PIS R$ 344,47 | COFINS R$ 1.590,04 | ICMS-ST R$ 196,88
- Total 3 meses: R$ 5.235,67

### Nao sera alterado

- Fluxo de upload de arquivos
- Layout/componentes visuais
- Logica de Lucro Real/Presumido (secao separada no analyze-credits)
- Parsing do PGDAS (process-pgdas)
- Tabelas do banco de dados (schema)
- Sistema de batch processing e append_mode

