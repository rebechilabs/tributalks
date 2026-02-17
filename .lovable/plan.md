

# Correção Crítica: Isolamento de Análise por Sessão de Importação

## Resumo do Problema

Atualmente, ao clicar "Identificar Créditos", o sistema reprocessa TODOS os XMLs do usuário (até 500), misturando dados de importações diferentes e gerando duplicatas. Não há filtro por importação na exibição nem na análise.

## Diagnóstico Técnico

Pontos confirmados na análise do código:

1. **`identified_credits`** ja tem a coluna `xml_import_id` (FK para `xml_imports`) -- nenhuma migração de schema necessária
2. **`analyze-credits`** ja recebe `xml_import_id` e salva nos créditos inseridos, mas NAO limpa créditos anteriores antes de inserir (causa duplicatas)
3. **`process-xml-batch`** chama `analyze-credits` automaticamente ao final (linhas 606-617) -- precisa ser removido
4. **`useReanalyzeCredits`** busca TODOS os imports COMPLETED e reprocessa tudo em lote
5. **`useIdentifiedCredits`** e `useIdentifiedCreditsSummary`** buscam créditos apenas por `user_id`, sem filtro de import
6. **`CreditRadar`** não tem seletor de importação

## Alterações Planejadas

### 1. Edge Function `analyze-credits` -- Limpar antes de inserir

Antes de inserir novos créditos (linha ~492), adicionar DELETE dos créditos existentes para o mesmo `xml_import_id`:

```sql
DELETE FROM identified_credits 
WHERE user_id = :userId AND xml_import_id = :xmlImportId
```

Isso permite re-análise sem duplicatas.

### 2. Edge Function `process-xml-batch` -- Remover auto-análise

Remover o bloco (linhas 606-618) que chama `triggerCreditAnalysis` automaticamente. O usuário controlará quando rodar a análise via botão "Identificar Créditos".

### 3. Hook `useReanalyzeCredits` -- Escopo por importação

Refatorar para aceitar um `importId` opcional:
- Se `importId` fornecido: buscar apenas XMLs daquela importação, chamar `analyze-credits` com esse ID
- Se não fornecido (compatibilidade): usar a importação mais recente

### 4. Hooks `useIdentifiedCredits` e `useIdentifiedCreditsSummary` -- Filtro por importação

Adicionar parâmetro `importId` opcional:
- Quando fornecido, filtrar por `.eq('xml_import_id', importId)`
- Quando não fornecido, buscar todos (comportamento atual como fallback)

### 5. Novo hook `useXmlImportSessions` 

Criar hook para listar importações do usuário com metadados (data, quantidade de arquivos, status), para alimentar o seletor.

### 6. Componente `CreditRadar` -- Seletor de importação

Adicionar um `Select` no header que lista as importações disponíveis:

```
[ Importação: 17/02/2026 - 21 arquivos ]
```

- Ao selecionar uma importação, os hooks recebem o `importId` e filtram automaticamente
- O botão "Identificar Créditos" analisa apenas a importação selecionada
- Default: importação mais recente

## Sequência de Implementação

1. Editar `analyze-credits` (DELETE antes de INSERT)
2. Editar `process-xml-batch` (remover auto-análise)
3. Deploy das duas edge functions
4. Criar hook `useXmlImportSessions`
5. Refatorar `useReanalyzeCredits` com `importId`
6. Refatorar `useIdentifiedCredits` e `useIdentifiedCreditsSummary` com `importId`
7. Atualizar `CreditRadar` com seletor e passagem de `importId`

## Resultado Esperado

- Cada importação terá sua análise isolada
- Re-análise limpa créditos anteriores da mesma importação (sem duplicatas)
- Usuário pode alternar entre importações para comparar resultados
- Mudança de regime não contamina análises anteriores

