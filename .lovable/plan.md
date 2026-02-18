
# Correcao: Datas Duplicadas no Grafico de Evolucao do Score

## Problema

O eixo X do grafico usa formato "dd/MM", causando labels repetidos quando ha multiplas avaliacoes no mesmo dia (ex: "23/01, 23/01, 26/01, 26/01").

## Solucao

Editar apenas `src/components/score/ScoreHistoryChart.tsx` com as seguintes mudancas:

### 1. Agrupar por dia e manter apenas a ultima avaliacao

Antes de formatar os dados para o grafico, agrupar as entradas por data (dia) e manter apenas a mais recente de cada dia. Isso elimina duplicatas na raiz.

```
// Agrupar por dia, manter ultima avaliacao
const latestPerDay = Map<string, entry> -> ultimo de cada "YYYY-MM-DD"
```

### 2. Formato adaptativo no eixo X

Calcular a diferenca em dias entre a primeira e ultima avaliacao:

- Menos de 7 dias: formato "dd/MM HH:mm"
- 7 a 30 dias: formato "dd/MM"
- Mais de 30 dias: formato "dd MMM" (ex: "23 Jan")

### 3. Garantir labels unicos consecutivos

Apos formatar, verificar se ha labels consecutivos iguais. Se houver, adicionar horario ao segundo para diferenciar.

## Secao tecnica

### Arquivo editado
- `src/components/score/ScoreHistoryChart.tsx`

### Logica detalhada

1. Apos o fetch dos dados (`history`), criar um `Map` agrupando por `format(date, 'yyyy-MM-dd')`. Para cada chave, manter apenas a entrada com `calculated_at` mais recente.

2. Substituir `history` pelo array filtrado antes de gerar `chartData`.

3. Calcular `daySpan = differenceInDays(lastDate, firstDate)` usando `date-fns` (ja importado).

4. Escolher formato de data baseado no `daySpan`:
   - `daySpan < 7` -> "dd/MM HH:mm"
   - `daySpan <= 30` -> "dd/MM"
   - `daySpan > 30` -> "dd MMM"

5. Apos formatar, iterar pelo array e se `chartData[i].date === chartData[i-1].date`, adicionar horario ao label duplicado.

### O que NAO muda
- Query ao banco (continua buscando 12 entradas)
- Tooltip (continua mostrando data completa)
- Calculo de tendencia (continua usando os 2 ultimos do array original)
- Logica de calculo do Score
- Landing page, Stripe, trial
