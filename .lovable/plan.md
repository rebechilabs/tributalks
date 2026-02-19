

# Triagem Clinica: Revisao de Regime Tributario (REV_REGIME_001)

## Escopo

Implementar a regra deterministica de "triagem clinica" para Revisao de Regime Tributario, incluindo: inserir o registro na base `tax_opportunities`, adicionar 3 novos campos ao `company_profile` para as perguntas exploratórias, atualizar a Edge Function para aplicar `engine_overrides` (priority boost + urgencia), e adicionar 4 novas perguntas exploratórias no frontend.

## 1. Migracao de banco (3 acoes)

### 1a. Novos campos em `company_profile`

Os campos `margem_liquida_faixa`, `mix_b2b_faixa`, e `alto_volume_compras_nfe` nao existem. Precisam ser criados para alimentar os criterios de matching:

```text
ALTER TABLE company_profile ADD COLUMN margem_liquida_faixa text;
ALTER TABLE company_profile ADD COLUMN mix_b2b_faixa text;
ALTER TABLE company_profile ADD COLUMN alto_volume_compras_nfe boolean DEFAULT false;
```

### 1b. Inserir REV_REGIME_001 em `tax_opportunities`

INSERT com todos os campos do JSON fornecido, mapeados para as colunas existentes. Os campos `engine_overrides`, `explainability_template`, e `implementation_template` vao no JSONB de `criterios_pontuacao` (ou campos dedicados se existirem). Na pratica:

- `criterios` recebe o bloco `always_include_when` (adaptado ao formato existente de matching)
- `criterios_obrigatorios` fica vazio (nenhum criterio eliminatorio rigido -- a regra e "always include when")
- `criterios_pontuacao` recebe `engine_overrides` como campo adicional para o boost
- Campos padrao: `complexidade = 'baixa'`, `risco_fiscal = 'baixo'`, `requer_contador = true`, `futuro_reforma = 'reforma_2027'`, etc.

### 1c. Valores dos campos especiais

- `economia_percentual_min/max` = NULL (impacto via proxy label "alto")
- `futuro_reforma` = 'reforma_2027'
- `descricao_reforma` = '2026 e fase de testes; 2027 marca vigencia plena da CBS e mudanca relevante na tributacao do consumo.'
- `status_lc_224_2025` = 'EC 132/2023, LC 214/2025'

## 2. Edge Function -- engine_overrides + triagem clinica

**Arquivo**: `supabase/functions/match-opportunities/index.ts`

### 2a. Adicionar campos ao CompanyProfile interface

```text
margem_liquida_faixa?: string;
mix_b2b_faixa?: string;
alto_volume_compras_nfe?: boolean;
```

### 2b. Nova funcao `applyEngineOverrides`

Apos o `evaluateOpportunity` retornar `eligible = true`, verificar se a oportunidade tem `engine_overrides` no campo `criterios_pontuacao`. Se sim, avaliar cada `priority_boost.when` contra o perfil. Quando um trigger bater:

- Somar `match_score_boost` ao score
- Setar `impact_label` e `urgency` no payload de resposta
- Adicionar `warnings` como match_reasons extras

Logica simplificada:

```text
for each boost in engine_overrides.priority_boost:
  if evaluateWhenClause(boost.when, profile):
    match.match_score += boost.match_score_boost
    match.impact_label = boost.impact_label
    match.urgency = boost.urgency
    break  // aplicar apenas o primeiro boost que bater (maior prioridade)
```

### 2c. Triagem clinica inline

A funcao `evaluateOpportunity` ja cobre criterios do tipo `regime_tributario = simples` + `faturamento >= X`. A novidade e o campo `criterios.always_include_when` que funciona como OR entre blocos (qualquer bloco que bater torna elegivel).

Implementar no inicio de `evaluateOpportunity`:

```text
if criterios.always_include_when exists:
  for each rule in always_include_when:
    if matchesRule(rule, profile):
      eligible = true, score = 40 (base), reasons = [explain]
      break
  if none matched: return not eligible
```

### 2d. Adicionar `impact_label` e `urgency` ao payload de resposta

Nos campos do objeto retornado (linhas ~893-926), adicionar:

```text
impact_label: m.impact_label ?? m.opportunity.impact_label_default ?? null,
urgency: m.urgency ?? null,
```

## 3. Frontend -- Perguntas exploratórias novas

**Arquivo**: `src/components/planejar/StepQuestions.tsx`

Adicionar 3 novas perguntas exploratórias (max 4 ja e respeitado pelo slice):

| Pergunta | Key | Condicao | ROI Hint |
|----------|-----|----------|----------|
| Qual a faixa da sua margem liquida? | `margem_liquida_faixa` | regime = presumido OU lucro_real | Direciona Presumido x Real |
| Seu mix de vendas e mais B2B ou B2C? | `mix_b2b_faixa` | regime = presumido | Direciona impacto de credito/repasse |
| Volume alto de compras com NF-e? | `alto_volume_compras_nfe` | regime = presumido | Direciona viabilidade Lucro Real |

Cada pergunta com opcoes grid e `roiHint`.

## 4. Frontend -- OpportunityCard urgencia tag

**Arquivo**: `src/components/planejar/OpportunityCard.tsx`

Adicionar suporte ao campo `urgency` no `OpportunityData` interface. Quando `urgency = 'alta'`, exibir badge vermelho "URGENTE" ao lado do titulo, alem da tag "Reforma 2027" que ja funciona via `futuro_reforma`.

## 5. PlanejarFlow -- Adicionar novos campos ao fluxo

**Arquivo**: `src/components/planejar/PlanejarFlow.tsx`

Adicionar `margem_liquida_faixa`, `mix_b2b_faixa`, `alto_volume_compras_nfe` ao `EXPLORATORY_KEYS` para que aparecam como campos faltantes quando aplicavel.

## Resumo de alteracoes

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| Migracao SQL | DB | 3 colunas em company_profile + INSERT REV_REGIME_001 |
| `supabase/functions/match-opportunities/index.ts` | Edge Function | always_include_when + engine_overrides + novos campos interface |
| `src/components/planejar/StepQuestions.tsx` | Frontend | 3 perguntas exploratórias novas |
| `src/components/planejar/OpportunityCard.tsx` | Frontend | Campo urgency + badge |
| `src/components/planejar/PlanejarFlow.tsx` | Frontend | Novos keys exploratorios |

