

# Alinhar Planejar com Documento Revisado

## Gaps Identificados

Comparando o documento revisado com a implementacao atual, existem 4 gaps principais:

### 1. Campo "Municipio" ausente
O documento pede municipio como campo obrigatorio na intro e nas perguntas. Nao existe na tabela `company_profile` nem no codigo.

### 2. num_funcionarios como input numerico livre
O documento especifica "input numerico livre, nao faixas". Hoje usa grid com faixas (0-9, 10-49, etc.).

### 3. Caso B -- Zero resultados com retry inteligente
O documento diz: "A Clara NAO exibe 'nao encontrei nada' e NAO diz 'complete seu perfil'." Hoje o `StepResults` mostra exatamente essa mensagem. O fluxo correto e:
- Se matching retorna zero, voltar para perguntas complementares
- Perguntar: municipio, tem_exportacao, tem_importacao, tem_estoque, opera_ecommerce, atividade_principal
- Rodar matching novamente
- Se ainda zero, exibir fallback generico (sem mensagem negativa)

### 4. Campos complementares ausentes no banco
`tem_estoque`, `opera_ecommerce`, `atividade_principal` e `municipio` nao existem na tabela `company_profile`.

---

## Alteracoes

### Migracao SQL
Adicionar 4 colunas a `company_profile`:
- `municipio` (text)
- `tem_estoque` (text)
- `opera_ecommerce` (text)
- `atividade_principal` (text)

### StepIntro.tsx
- Adicionar campo "Municipio" na tabela de dados (entre UF e Exportacao)
- editType: text input simples

### StepQuestions.tsx
- Adicionar pergunta de municipio (type: 'text' -- novo tipo, input de texto livre)
- Mudar `num_funcionarios` de grid para input numerico livre (reutilizar padrao do currency, sem R$)
- Adicionar novo tipo 'number' para input numerico simples

### PlanejarFlow.tsx -- Logica de retry (principal mudanca)

Hoje o fluxo e linear: intro -> questions -> processing -> results.

Novo fluxo com retry:

```text
intro -> questions -> processing -> [match retornou opps?]
                                      SIM -> results
                                      NAO -> complementary_questions -> processing_retry -> results (com fallback se zero)
```

Novo step na state machine: `'complementary'`

- Quando o matching retorna zero oportunidades (sucesso com array vazio), o flow vai para step `complementary` em vez de `results`
- Clara exibe: "Preciso de mais alguns dados para encontrar as oportunidades certas para voce."
- Pergunta campos complementares que ainda nao foram preenchidos: municipio, tem_exportacao (como exporta_produtos), tem_importacao (como importa_produtos), tem_estoque, opera_ecommerce, atividade_principal
- Salva respostas e roda matching novamente
- Se ainda zero, exibe as 3 oportunidades fallback baseadas em regime + setor (sem mensagem negativa)

### StepResults.tsx
- Remover a mensagem "Nao encontrei oportunidades especificas..." 
- Quando exibir fallback (totalCount === 0 mas com opportunities), Clara diz algo como: "Com base no perfil da sua empresa, identifiquei essas oportunidades que podem se aplicar ao seu caso:"
- Nunca exibir mensagem de "complete seu perfil"
- Remover o texto "* Estimativa generica -- complete seu perfil" do OpportunityCard quando is_fallback

### OpportunityCard.tsx
- Remover o texto de fallback "complete seu perfil para valores personalizados"

---

## Arquivos Modificados

| Arquivo | Alteracao |
|---------|-----------|
| Migracao SQL | 4 novas colunas |
| `StepIntro.tsx` | Adicionar campo municipio |
| `StepQuestions.tsx` | Adicionar pergunta municipio, mudar num_funcionarios para input numerico, adicionar tipo 'number' e 'text' |
| `PlanejarFlow.tsx` | Novo step 'complementary', logica de retry quando zero resultados, perguntas complementares |
| `StepResults.tsx` | Remover mensagem negativa, ajustar texto da Clara para fallback |
| `OpportunityCard.tsx` | Remover texto "complete seu perfil" |

