

# Dossie Tributario + Perguntas Exploratorias Contextuais

## Resumo

Duas entregas principais: (1) Perguntas exploratorias de Camada 2 baseadas no perfil da empresa, e (2) Dossie Tributario com sheet lateral de 4 abas e exportacao em PDF.

---

## Parte 1 -- Migracao SQL

Adicionar 8 colunas text em `company_profile` para armazenar respostas das perguntas exploratorias:

```text
folha_acima_28pct       -- Simples + Servicos: folha > 28%?
tem_st_icms             -- Simples + Comercio: tem ST ICMS?
creditos_pis_cofins_pendentes  -- Presumido: creditos PIS/COFINS?
usa_jcp                 -- Lucro Real: usa JCP?
creditos_icms_exportacao       -- Exporta: creditos ICMS?
usa_ret                 -- Construcao: usa RET?
conhece_imunidade_issqn        -- Saude: imunidade ISSQN?
conhece_pep_sp          -- UF=SP: conhece PEP?
```

Todas as demais colunas necessarias (municipio_sede, tem_estoque, tem_ecommerce, descricao_atividade, etc.) ja existem na tabela.

---

## Parte 2 -- Perguntas Exploratorias (Camada 2)

### StepQuestions.tsx

Adicionar 8 perguntas condicionais apos as perguntas obrigatorias, com logica `condition` baseada no perfil:

| Pergunta | Condicao | Campo |
|----------|----------|-------|
| Folha > 28% do faturamento? | Simples + Servicos | folha_acima_28pct |
| Tem substituicao tributaria ICMS? | Simples + Comercio | tem_st_icms |
| Creditos PIS/COFINS pendentes? | Presumido | creditos_pis_cofins_pendentes |
| Usa JCP? | Lucro Real | usa_jcp |
| Acumula creditos ICMS exportacao? | Exporta | creditos_icms_exportacao |
| Usa RET? | Construcao | usa_ret |
| Conhece imunidade ISSQN? | Saude | conhece_imunidade_issqn |
| Conhece PEP do ICMS em SP? | UF = SP | conhece_pep_sp |

Maximo 4 perguntas exploratorias por sessao (filtrar as que se aplicam, pegar as primeiras 4). Todas tipo `grid` com opcoes Sim/Nao/Nao sei.

### PlanejarFlow.tsx

Adicionar as 8 novas chaves ao `QUALITATIVE_KEYS` ou criar um novo array `EXPLORATORY_KEYS`. O `convertBooleanFields` nao se aplica pois sao text (sim/nao/nao_sei).

---

## Parte 3 -- Dossie Tributario

### Expandir OpportunityData

Adicionar ao interface `OpportunityData` em `OpportunityCard.tsx`:

```text
match_reasons?: string[]
match_score?: number
category?: string
subcategory?: string
base_legal?: string
base_legal_resumo?: string
tributos_afetados?: string[]
tempo_implementacao?: string
tempo_retorno?: string
risco_fiscal?: string
risco_descricao?: string
requer_contador?: boolean
requer_advogado?: boolean
missing_criteria?: string[]
```

Todos esses campos ja sao retornados pela Edge Function `match-opportunities` (confirmado no codigo). Se algum campo vier null/undefined, o Dossie mostra placeholder "Em breve" em vez de espaco vazio.

### OpportunityCard.tsx -- clicavel

Adicionar prop `onClick?: () => void`. Quando presente, card mostra `cursor-pointer` e chama onClick ao clicar.

### Novo: DossieTributario.tsx

Sheet lateral (slide-in da direita) usando `Sheet` + `SheetContent` do shadcn. Largura `max-w-2xl` no desktop, fullscreen no mobile.

4 abas usando `Tabs` do shadcn:

**Aba 1 -- Visao Geral**
- Titulo + economia estimada (grande, verde)
- "O que e" -- campo `description`
- "Por que voce se qualifica" -- montado a partir de `match_reasons[]` + dados do perfil (regime, setor, faturamento)
- Indicador de urgencia: verde (sem reforma), ambar (reforma pode afetar), vermelho (janela curta)

**Aba 2 -- Base Legal**
- `base_legal` e `base_legal_resumo`
- `tributos_afetados` como badges
- `risco_fiscal` + `risco_descricao`
- Bloco "Impacto da Reforma" se `futuro_reforma` ou `status_lc_224_2025` presente (visual roxo)

**Aba 3 -- Como Implementar**
- `complexidade` como badge
- `tempo_implementacao` e `tempo_retorno`
- `requer_contador` / `requer_advogado` como checklist
- `risco_descricao` como cuidados

**Aba 4 -- Leve para seu Especialista**
- Briefing em texto plano montado dinamicamente
- Botao "Copiar briefing" (clipboard API)
- Botao "Exportar PDF"

Campos nao preenchidos mostram: "Em breve -- estamos complementando esta informacao."

### Novo: BriefingExport.tsx

Funcao `generateBriefingPdf()` usando jsPDF (ja instalado no projeto). Reutiliza as cores e padroes de `src/lib/pdf/TribuTalksPdfColors.ts`:
- Cabecalho com logo TribuTalks
- Cores: azul marinho #003366 / dourado #EFA219
- Rodape com disclaimer
- Conteudo: titulo, empresa, oportunidade, economia, base legal, reforma, proximos passos, documentos

### StepResults.tsx

Adicionar estado `selectedOpp` para controlar qual oportunidade tem o Dossie aberto. Passar `onClick` para cada `OpportunityCard`. Renderizar `DossieTributario` como Sheet controlado.

Passar `companyProfile` como prop para personalizar textos do Dossie (razao social, CNPJ, regime, setor).

---

## Arquivos

| Arquivo | Acao |
|---------|------|
| Migracao SQL | 8 novas colunas text |
| `StepQuestions.tsx` | 8 perguntas condicionais Camada 2 com limite de 4 |
| `PlanejarFlow.tsx` | Novas chaves exploratorias, passar companyProfile ao StepResults |
| `OpportunityCard.tsx` | Expandir interface, adicionar onClick |
| `StepResults.tsx` | Estado do dossie, renderizar Sheet, receber companyProfile |
| `DossieTributario.tsx` | **Novo** -- Sheet com 4 abas |
| `BriefingExport.tsx` | **Novo** -- Geracao do PDF com jsPDF |

### Nenhuma alteracao na Edge Function

Todos os dados necessarios ja sao retornados pelo `match-opportunities` (confirmado: `match_reasons`, `base_legal`, `base_legal_resumo`, `tempo_implementacao`, `tempo_retorno`, `risco_fiscal`, `risco_descricao`, `requer_contador`, `requer_advogado`, `tributos_afetados` estao todos no payload de resposta).

