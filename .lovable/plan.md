

# Importacao de NCMs em Lote no Catalogo de Produtos

## Problema
Hoje, para cadastrar NCMs no catalogo de produtos/servicos do DRE, o usuario precisa adicionar um por um manualmente. Na pratica, empresas trabalham com dezenas ou centenas de NCMs ao mesmo tempo.

## Solucao

Adicionar duas formas de importacao em lote:

### 1. Importar dos XMLs ja processados
Se o usuario ja importou XMLs na plataforma, os NCMs ja estao analisados na tabela `company_ncm_analysis`. Um botao "Importar dos meus XMLs" busca esses NCMs e permite selecionar quais adicionar ao catalogo, ja com nome do produto e percentual de receita preenchidos.

### 2. Colar lista de NCMs
Um campo de texto onde o usuario cola varios codigos NCM separados por virgula, ponto-e-virgula ou quebra de linha (ex: `8471.30.19, 0901.21.00, 6109.10.00`). O sistema valida cada codigo contra a API governamental e adiciona todos de uma vez.

## Mudancas tecnicas

### `src/components/dre/ProductCatalogStep.tsx`
- Adicionar botao "Importar em lote" ao lado do formulario individual
- Ao clicar, abrir modal com duas abas: "Dos meus XMLs" e "Colar codigos"

### Novo: `src/components/dre/NCMBatchImportModal.tsx`
Modal com duas abas:

**Aba 1 - Dos meus XMLs:**
- Consulta `company_ncm_analysis` do usuario
- Lista NCMs encontrados com checkboxes para selecao
- Botao "Adicionar selecionados" que converte em `ProductCatalogItem[]`

**Aba 2 - Colar codigos:**
- Textarea para colar NCMs (separados por virgula, ponto-e-virgula ou linha)
- Botao "Validar" que consulta a API de NCMs e exibe os resultados
- Usuario confirma quais adicionar
- Percentual de receita pode ser distribuido igualmente ou preenchido depois

### Fluxo visual

```text
+------------------------------------------+
|  Importar NCMs em Lote                   |
|  [Dos meus XMLs] [Colar codigos]         |
|                                          |
|  Aba XMLs:                               |
|  [x] 8471.30.19 - Notebook       (12%)  |
|  [x] 0901.21.00 - Cafe torrado   (8%)   |
|  [ ] 6109.10.00 - Camiseta       (5%)   |
|                                          |
|  [Adicionar 2 selecionados]              |
+------------------------------------------+
```

## O que NAO muda
- O formulario individual continua funcionando normalmente
- A estrutura de `ProductCatalogItem` permanece a mesma
- Nenhuma tabela nova no banco de dados

