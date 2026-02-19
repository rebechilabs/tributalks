
# Evolucao do Planejar: Setores Detalhados, Tags de Operacao e Perguntas por Setor

## Contexto

O fluxo Planejar ja esta implementado com as 4 etapas, Clara AI, Dossie, Briefing PDF, e triagem clinica. Este plano aborda os gaps remanescentes do spec original:

1. Selecao de setor em dois passos (macro -> 15 setores especificos)
2. Tags de operacao com multi-selecao e defaults por setor
3. Banco de perguntas exploratorias por setor (sectorQuestionBank.ts)
4. Injecao frontend de revisao de regime (Simples >= 2M)
5. Atualizacao da reforma tag para mostrar "2026" ou "2027" conforme contexto

## Mapeamento de Campos

Campos existentes na base que serao reaproveitados:
- `setor` (text) -> armazenara o setor detalhado (ex: `tecnologia_saas`)
- `segmento` (text) -> armazenara o macro_segmento (ex: `servicos`)

Campo novo necessario:
- `tags_operacao` (text[]) -> array de tags como `tem_icms`, `tem_iss`, `multi_uf`, etc.

## 1. Migracao SQL

Adicionar coluna `tags_operacao` ao `company_profile`:

```text
ALTER TABLE public.company_profile ADD COLUMN IF NOT EXISTS tags_operacao text[] DEFAULT '{}';
```

## 2. Criar `src/data/sectorQuestionBank.ts`

Arquivo novo com:

- Mapeamento `MACRO_TO_SECTORS`: 3 macros (servicos, comercio, industria), cada um com seus setores especificos
- Mapeamento `SECTOR_DEFAULT_TAGS`: tags pre-marcadas por setor (ex: `tecnologia_saas` -> `['tem_iss']`)
- Mapeamento `SECTOR_QUESTIONS`: ate 4 perguntas exploratorias por setor, com campos `text`, `roi`, `maps_to`, `adds_tag`, `type`, `options`

Setores implementados (conforme spec):
- Servicos (7): servicos_profissionais, tecnologia_saas, logistica_transporte, corretagem_seguros, educacao, saude, imobiliario
- Comercio (4): ecommerce, varejo_fisico, distribuicao_atacado, alimentacao_bares_restaurantes
- Industria (4): construcao_incorporacao, agro, industria_alimentos_bebidas, industria_metal_mecanica

As perguntas exploratórias seguirao o formato do spec com ROI badges e `maps_to`/`adds_tag` para integrar com o perfil.

## 3. Atualizar StepQuestions.tsx

### 3a. Selecao de setor em dois passos

Substituir a pergunta atual de `setor` (grid unica com 8 opcoes) por um fluxo de 2 perguntas:

1. **macro_segmento** (key: `segmento`): grid com 3 chips — Servicos, Comercio, Industria
2. **setor_primario** (key: `setor`): grid com os setores do macro selecionado (5-7 opcoes)

A segunda pergunta usa `condition` para so aparecer apos o macro ser selecionado.

### 3b. Tags de operacao (multi-selecao)

Adicionar uma nova pergunta especial do tipo `multi_toggle` apos a selecao de setor:

- Key: `tags_operacao`
- Opcoes: "ICMS", "ISS", "ST", "Importo", "Exporto", "Multi-UF", "Alto volume NF", "Grupo economico"
- Pre-selecionar defaults do setor escolhido (via `SECTOR_DEFAULT_TAGS`)
- Implementar novo tipo de input `multi_toggle` com botoes toggle que podem ser selecionados/deselecionados

### 3c. Perguntas exploratorias por setor

Substituir o sistema atual (regime-based) por setor-based usando `SECTOR_QUESTIONS`. O fluxo:

1. Verificar o setor selecionado (do answers ou existingProfile)
2. Buscar perguntas de `SECTOR_QUESTIONS[setor]`
3. Filtrar as que ainda nao foram respondidas
4. Limitar a 4 perguntas
5. Exibir com ROI badge

Manter as perguntas exploratorias regime-based existentes (margem_liquida_faixa, mix_b2b, etc.) como fallback para setores sem perguntas especificas.

## 4. Atualizar PlanejarFlow.tsx

### 4a. Injecao de revisao de regime no frontend

Antes de exibir resultados, verificar:

```text
if regime === 'simples' && faturamento >= 2000000:
  injetar oportunidade "Revisao de Regime Tributario" no topo
  se faturamento >= 3600000: marcar urgency = 'alta'
```

Isso complementa a triagem clinica do backend com um gatilho frontend imediato.

### 4b. Salvar tags_operacao

Atualizar `convertBooleanFields` (ou criar logica separada) para salvar `tags_operacao` como array de strings na base.

### 4c. Salvar segmento (macro)

Garantir que ao salvar as respostas, o campo `segmento` receba o macro selecionado.

## 5. Atualizar StepIntro.tsx

Adicionar campo `tags_operacao` na tabela de dados da empresa (exibir como badges).

## 6. Atualizar OpportunityCard.tsx

Atualizar a tag de reforma para mostrar "Reforma 2026" ou "Reforma 2027" conforme o valor de `futuro_reforma`:
- `futuro_reforma` contendo "2027" -> "Reforma 2027"
- Caso contrario -> "Reforma 2026" (comportamento atual)

## 7. Atualizar Edge Function

Adicionar `tags_operacao` ao `CompanyProfile` interface para que as tags possam ser usadas nos criterios de matching.

## Resumo de alteracoes

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| Migracao SQL | DB | Adicionar coluna `tags_operacao text[]` |
| `src/data/sectorQuestionBank.ts` | Novo | Macros, setores, defaults, perguntas por setor |
| `src/components/planejar/StepQuestions.tsx` | Refactor | Selecao 2-step, multi-toggle tags, perguntas por setor |
| `src/components/planejar/PlanejarFlow.tsx` | Editar | Injecao regime review, salvar tags/segmento |
| `src/components/planejar/StepIntro.tsx` | Editar | Exibir tags_operacao |
| `src/components/planejar/OpportunityCard.tsx` | Editar | Tag reforma 2026/2027 dinamica |
| `supabase/functions/match-opportunities/index.ts` | Editar | Interface tags_operacao |
