

# Reconciliar Migraciao com Codebase Existente

## Problema Identificado

A migracao que voce quer rodar usa nomes de colunas **diferentes** dos que o codigo ja implementa. Se rodar a migracao sem ajustar o codigo, tudo vai quebrar:

| Migracao quer criar | Codigo ja usa | Status no banco |
|---------------------|---------------|-----------------|
| `setor_primario` | `setor` | `setor` ja existe |
| `macro_segmento` | `segmento` | `segmento` ja existe |
| `operacao_tags` | `tags_operacao` | `tags_operacao` ja existe |
| `folha_faixa` | nao existe no codigo | nao existe |
| `setor_secundario` | nao existe no codigo | nao existe |
| `applicability` (JSONB) | nao existe | nao existe |

Alem disso, os `UPDATE` na migracao referenciam `titulo` mas a coluna real e `name`.

## Opcao Recomendada: Adaptar a migracao aos nomes ja usados

Em vez de renomear tudo no codigo (6+ arquivos, edge function, etc.), adaptar a migracao para usar os nomes que ja existem (`setor`, `segmento`, `tags_operacao`). Adicionar apenas o que falta.

## Plano de Execucao

### 1. Migracao SQL Corrigida

Apenas o que ainda nao existe no banco:

```text
-- Colunas novas que faltam
ALTER TABLE company_profile
  ADD COLUMN IF NOT EXISTS setor_secundario TEXT,
  ADD COLUMN IF NOT EXISTS folha_faixa TEXT
    CHECK (folha_faixa IN ('lt_10','10_a_20','20_a_28','gt_28'));

-- applicability em tax_opportunities
ALTER TABLE tax_opportunities
  ADD COLUMN IF NOT EXISTS applicability JSONB DEFAULT '{}';

-- Trigger: inferir segmento (macro) a partir do setor
CREATE OR REPLACE FUNCTION public.infer_macro_segmento()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.setor IN ('servicos_profissionais','tecnologia_saas',
    'corretagem_seguros','educacao','saude',
    'logistica_transporte','imobiliario') THEN
    NEW.segmento := 'servicos';
  ELSIF NEW.setor IN ('ecommerce','varejo_fisico',
    'distribuicao_atacado','alimentacao_bares_restaurantes') THEN
    NEW.segmento := 'comercio';
  ELSIF NEW.setor IN ('industria_alimentos_bebidas',
    'industria_metal_mecanica','agro','construcao_incorporacao') THEN
    NEW.segmento := 'industria';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_infer_macro ON company_profile;
CREATE TRIGGER trg_infer_macro
  BEFORE INSERT OR UPDATE OF setor ON company_profile
  FOR EACH ROW EXECUTE FUNCTION public.infer_macro_segmento();

-- Indices
CREATE INDEX IF NOT EXISTS idx_tax_opp_applicability
  ON tax_opportunities USING GIN (applicability);
CREATE INDEX IF NOT EXISTS idx_company_profile_setor
  ON company_profile (setor);
CREATE INDEX IF NOT EXISTS idx_company_profile_regime
  ON company_profile (regime_tributario);
CREATE INDEX IF NOT EXISTS idx_company_profile_tags
  ON company_profile USING GIN (tags_operacao);
```

### 2. Preencher applicability (UPDATE com `name` em vez de `titulo`)

Os UPDATE precisam usar `name` (coluna real) em vez de `titulo`:

```text
UPDATE tax_opportunities SET applicability = '...'
WHERE name ILIKE '%regime%';
-- etc.
```

Aplicar os mesmos blocos da sua migracao, trocando `titulo` por `name`.

### 3. Adicionar `folha_faixa` ao codigo

Adicionar `folha_faixa` como campo exploratorio em `StepQuestions.tsx` e ao `EXPLORATORY_KEYS` em `PlanejarFlow.tsx`.

### 4. Atualizar Edge Function

Adicionar `folha_faixa` e `setor_secundario` ao `CompanyProfile` interface. Opcionalmente usar `applicability` como filtro pre-matching.

## Resumo de Alteracoes

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| Migracao SQL | DB | `folha_faixa`, `setor_secundario`, `applicability`, trigger, indices |
| UPDATE tax_opportunities | DB (data) | Preencher applicability usando `name` |
| `StepQuestions.tsx` | Frontend | Adicionar pergunta `folha_faixa` |
| `PlanejarFlow.tsx` | Frontend | Adicionar `folha_faixa` ao EXPLORATORY_KEYS |
| Edge Function | Backend | Campos novos na interface + uso de applicability |

