

# Redesign do Radar de Creditos - Fluxo Guiado em 3 Passos

## Resumo

Substituir a interface atual com 7 abas por um fluxo linear de 3 passos que guia o usuario desde a selecao do regime tributario ate a visualizacao dos resultados.

## Arquitetura

A pagina `AnaliseNotasFiscais.tsx` (896 linhas) sera refatorada para um componente orquestrador leve que gerencia o passo atual e renderiza o componente do passo ativo.

### Novos arquivos

```
src/components/radar/
  RadarStepper.tsx          -- Indicador visual de passos (1 -> 2 -> 3) no topo
  RegimeSelector.tsx        -- Passo 1: selecao de regime com 3 cards
  DocumentUploadStep.tsx    -- Passo 2: uploads especificos por regime
  AnalysisStep.tsx          -- Passo 3: progresso + resultados
  regimeConfig.ts           -- Configuracao de documentos e checklist por regime
```

### Arquivo editado

```
src/pages/AnaliseNotasFiscais.tsx  -- Refatorado para orquestrador de 3 passos
```

---

## Detalhamento dos Passos

### Passo 1 - Selecao de Regime (`RegimeSelector.tsx`)

Tres cards selecionaveis lado a lado:

| Regime | Descricao | Icone |
|---|---|---|
| Simples Nacional | "Regime unificado com DAS mensal" | Building |
| Lucro Presumido | "Tributacao sobre receita presumida" | TrendingUp |
| Lucro Real | "Tributacao sobre lucro efetivo - maior potencial de creditos" | Target |

- Pre-selecao automatica: buscar na tabela `dre_reports` o campo `tax_regime` do usuario logado. Se existir, pre-selecionar o card correspondente.
- Card selecionado ganha borda `border-primary` e fundo `bg-primary/5`
- Botao "Proximo" habilitado somente apos selecao

### Passo 2 - Upload de Documentos (`DocumentUploadStep.tsx`)

Exibe documentos especificos para o regime selecionado, definidos em `regimeConfig.ts`:

**Simples Nacional:**
- XMLs de NF-e (obrigatorio)
- DAS (opcional - recomendado)
- PGDAS-D (opcional - recomendado)
- Texto auxiliar sobre creditos limitados, bitributacao, DAS a maior, CFOP incorreto, DIFAL

**Lucro Presumido:**
- XMLs de NF-e (obrigatorio)
- SPED EFD-ICMS/IPI (obrigatorio)
- DCTF (recomendado)
- Texto auxiliar sobre ICMS insumos, IPI, IRPJ/CSLL, IRRF, DIFAL

**Lucro Real:**
- XMLs de NF-e (obrigatorio)
- SPED EFD-ICMS/IPI (obrigatorio)
- SPED EFD-Contribuicoes (obrigatorio)
- SPED ECD (recomendado)
- SPED ECF (recomendado)
- DCTF (recomendado)
- Texto auxiliar sobre creditos PIS/COFINS nao-cumulativo, ICMS integral, IPI, prescricao 5 anos, CBS/IBS 2027

Cada tipo de documento tera:
- Area de drag-and-drop individual
- Indicador de status: check verde (enviado), circulo vazio (pendente), raio (recomendado)
- Asterisco (*) nos obrigatorios
- Botoes Voltar e Proximo (habilitado quando pelo menos 1 obrigatorio foi enviado)

Os uploaders existentes (`SpedUploader`, `DctfUploader`, `PgdasUploader`) serao reutilizados internamente. A area de upload de XMLs reutilizara a logica existente de drag-and-drop e `processChunk`.

### Passo 3 - Analise (`AnalysisStep.tsx`)

Duas fases:

**Fase A - Em andamento:**
- Barra de progresso (reutiliza `ImportProgressBar`)
- Checklist animado especifico do regime (items aparecem com checkmark conforme progridem)
- Ex Simples: Bitributacao, DAS a maior, CFOP incorreta, DIFAL
- Ex Lucro Real: PIS/COFINS nao-cumulativo, ICMS insumos, IPI, IRPJ/CSLL, IRRF, prescricao, duplicidades, CBS/IBS 2027

**Fase B - Concluido:**
- Card de resumo com: valor total de creditos, quantidade de oportunidades, nivel de risco
- Botao "Ver detalhes completos" que renderiza o `CreditRadar` existente (sem alteracao) abaixo
- Botao "Voltar" para reiniciar o fluxo

### Indicador de Passos (`RadarStepper.tsx`)

Componente no topo da pagina com 3 circulos conectados por linha:
- Passo atual: circulo preenchido `bg-primary` com numero branco
- Passo concluido: circulo verde com checkmark
- Passo futuro: circulo `bg-muted` com numero cinza
- Labels: "Regime" / "Documentos" / "Analise"

---

## Secao tecnica

### Estado do fluxo

O componente principal gerenciara:
- `currentStep: 1 | 2 | 3`
- `selectedRegime: 'simples' | 'presumido' | 'real' | null`
- `uploadedDocs: Record<string, { status: 'pending' | 'uploaded' | 'recommended' }>`

### Reutilizacao de logica existente

- Toda a logica de upload/processamento de XMLs (funcoes `processChunk`, `uploadAndProcess`, etc) sera extraida para um hook `useXmlProcessing` ou mantida no componente principal
- Os componentes `CreditRadar`, `ExposureProjection`, `SavingsSummaryCard` continuam sendo usados na fase de resultados
- Os uploaders SPED, DCTF, PGDAS continuam funcionando internamente

### Configuracao de regime (`regimeConfig.ts`)

Objeto tipado com a estrutura de documentos, textos auxiliares e checklist de analise para cada regime, evitando hardcode nos componentes.

### O que NAO muda

- Logica de backend (Edge Functions)
- Tabelas do banco de dados
- Componentes de creditos (`CreditRadar`, `IdentifiedCreditsTable`, etc)
- Componentes de upload (`SpedUploader`, `DctfUploader`, `PgdasUploader`)
- Botoes da landing page
- Configuracoes do Stripe
- Logica de trial de 7 dias
- Rotas existentes

