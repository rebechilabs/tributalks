

# Correção: fatTotalRef na edge function analyze-credits

## Problema
Na linha 529, `fatTotalRef` usa condicionalmente `pgdasMes.receita_bruta` quando disponível, em vez de sempre usar `faturamentoTotal` (soma dos XMLs do mês). Isso distorce as proporções de cálculo.

## Alteração
Uma única linha na edge function `supabase/functions/analyze-credits/index.ts`:

**Linha 527-529 (remover comentário e condicional):**
```text
// DE:
// [CORREÇÃO #1] fatTotalRef = receita_bruta do PGDAS do mês (faturamento total declarado),
// NÃO a soma dos XMLs processados (que são apenas uma amostra das NF-e)
const fatTotalRef = pgdasMes.receita_bruta > 0 ? pgdasMes.receita_bruta : faturamentoTotal

// PARA:
const fatTotalRef = faturamentoTotal
```

Nenhuma outra linha será alterada. Redeploy automático após a edição.

