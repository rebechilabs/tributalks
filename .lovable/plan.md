

# Transformar /dashboard/planejar em Fluxo Guiado pela Clara AI

## Resumo

Substituir os 2 cards estaticos da pagina `PlanejarPage.tsx` (que ja existe) por um fluxo interativo em 4 etapas guiado pela Clara AI. O conteudo interno muda, mas o `DashboardLayout` e a estrutura da rota permanecem intactos.

## Correcoes aplicadas

1. **Arquivo**: `src/pages/dashboard/PlanejarPage.tsx` ja existe e sera **modificado** (nao criado do zero). A rota `/dashboard/planejar` ja aponta para ele em `App.tsx`.
2. **Faturamento**: Input numerico livre (sem faixas pre-definidas), pois `match-opportunities` usa o valor exato para calcular economia.
3. **Fallback**: Se `match-opportunities` falhar ou demorar mais de 15 segundos, exibir 3 oportunidades genericas baseadas no regime tributario da empresa.

---

## Etapas do Fluxo

### Etapa 1 -- Intro

- Balao da Clara (icone Sparkles, fundo muted, estilo chat) com efeito de digitacao (typewriter via useState + setInterval)
- Tabela com 7 campos da empresa vindos de `company_profile`: regime tributario, setor, faturamento anual, numero de funcionarios, estado (UF), exportacao, importacao
- Campos preenchidos: badge verde com valor
- Campos faltantes: fundo ambar, icone AlertTriangle
- Se houver campos faltantes: aviso + botao "Responder X perguntas e gerar analise"
- Se tudo preenchido: botao "Gerar analise agora" (pula Etapa 2)

### Etapa 2 -- Perguntas (condicional)

So aparece se faltar algum dos 5 campos obrigatorios: `regime_tributario`, `setor`, `faturamento_anual`, `num_funcionarios`, `uf_sede`

Cada pergunta e um card individual com progress bar no topo (ex: "Pergunta 2 de 4"). Respostas via grid de botoes estilizados, **exceto faturamento que usa input numerico livre**.

Opcoes:
- **regime_tributario**: Simples Nacional, Lucro Presumido, Lucro Real
- **setor**: Comercio, Industria, Servicos, Tecnologia, Saude, Educacao, Agronegocio, Construcao
- **faturamento_anual**: Input numerico livre com mascara de moeda (R$)
- **num_funcionarios**: Faixas 0-9, 10-49, 50-99, 100-499, 500+
- **uf_sede**: Grid com 27 UFs brasileiras

Ao responder tudo, salva via `supabase.from('company_profile').update(...)` e avanca.

### Etapa 3 -- Processando

Animacao com 5 steps sequenciais (delay visual de ~1.5s cada):
1. "Analisando perfil tributario"
2. "Consultando base de oportunidades"
3. "Calculando economia estimada"
4. "Verificando impacto da Reforma Tributaria"
5. "Priorizando recomendacoes"

Em paralelo, chama `match-opportunities` via `supabase.functions.invoke()`.

**Fallback**: Se a Edge Function retornar erro ou timeout (15s), exibir 3 oportunidades genericas baseadas no regime tributario:
- Simples: Revisao de Enquadramento, Exclusao de ICMS-ST, Fator R
- Presumido: Revisao de Aliquota Presumida, Creditos de PIS/COFINS, Planejamento de Pro-labore
- Real: Creditos de PIS/COFINS, Incentivos Fiscais de P&D, Revisao de IRPJ/CSLL

Quando a resposta chega E todos os steps visuais completaram, avanca para Etapa 4.

### Etapa 4 -- Resultados

- Balao da Clara resumindo a economia total estimada (min-max)
- 3 cards rankeados por: impacto (alto > medio > baixo), depois complexidade (baixa > media > alta)
- Cada card mostra: titulo, descricao curta, economia estimada min/max por ano, badge de impacto, badge de complexidade
- Se a oportunidade tiver `futuro_reforma` ou `status_lc_224_2025` preenchido (campos confirmados na tabela `tax_opportunities`): tag "Reforma 2026" com icone Zap + bloco roxo com `descricao_reforma` ou `descricao_lc_224_2025`
- Botao "Ver todas as X oportunidades" navega para `/dashboard/planejar/oportunidades`

---

## Detalhes Tecnicos

### Novos Arquivos

| Arquivo | Descricao |
|---------|-----------|
| `src/components/planejar/PlanejarFlow.tsx` | Componente principal com state machine (step 1-4) |
| `src/components/planejar/StepIntro.tsx` | Etapa 1: Intro da Clara + tabela de dados |
| `src/components/planejar/StepQuestions.tsx` | Etapa 2: Perguntas com grid de botoes |
| `src/components/planejar/StepProcessing.tsx` | Etapa 3: Animacao de processamento |
| `src/components/planejar/StepResults.tsx` | Etapa 4: Top 3 oportunidades + resumo |
| `src/components/planejar/ClaraMessage.tsx` | Balao da Clara com typewriter |
| `src/components/planejar/OpportunityCard.tsx` | Card individual de oportunidade |

### Arquivo Modificado

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/dashboard/PlanejarPage.tsx` | Substituir conteudo interno pelos novos componentes, manter DashboardLayout |

### Hooks e Contextos Utilizados

- `useAuth()` de `src/hooks/useAuth.tsx` -- obter user
- `useCompany()` de `src/contexts/CompanyContext.tsx` -- obter currentCompany
- `useQuery` do TanStack -- fetch do company_profile completo
- `supabase.functions.invoke('match-opportunities')` -- gerar oportunidades

### Dados da Empresa (Query)

```text
SELECT * FROM company_profile 
WHERE company_id = :currentCompany.id   -- se disponivel
   OR user_id = :user.id               -- fallback
LIMIT 1
```

### Resposta do match-opportunities (ja implementado)

A Edge Function retorna: `total_opportunities`, `economia_anual_min/max`, `quick_wins`, `high_impact`, e array `opportunities[]` com `name`, `description`, `economia_anual_min/max`, `complexidade`, `alto_impacto`, `match_score`, `tributos_afetados`, etc.

Os campos de Reforma (`futuro_reforma`, `descricao_reforma`, `status_lc_224_2025`, `descricao_lc_224_2025`) estao na tabela `tax_opportunities` mas **nao sao retornados** pela Edge Function atual. Sera necessario adicionar esses 4 campos ao objeto `opportunity` no response do `match-opportunities`.

### Ranking dos Resultados

```text
1. alto_impacto = true primeiro
2. complexidade: baixa (1) > media (2) > alta (3)
3. economia_anual_max DESC
Pegar top 3 apos ordenacao.
```

### Fallback Generico (estrutura)

```text
{
  name: "Oportunidade genérica",
  description: "Descrição padrão",
  economia_anual_min: 0,
  economia_anual_max: 0,
  complexidade: "media",
  alto_impacto: false,
  is_fallback: true   // flag para indicar que não é resultado real
}
```

### Nenhuma Migracao de Banco Necessaria

Todos os campos necessarios ja existem nas tabelas `company_profile` e `tax_opportunities`.

### Alteracao na Edge Function match-opportunities

Adicionar ao response os campos de Reforma Tributaria que ja existem em `tax_opportunities` mas nao sao retornados:
- `futuro_reforma`
- `descricao_reforma`
- `status_lc_224_2025`
- `descricao_lc_224_2025`

