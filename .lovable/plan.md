

# Adicionar 3 Novas Perguntas Qualitativas ao Fluxo da Clara

## Resumo

Adicionar 3 perguntas qualitativas ao fluxo de perguntas (Etapa 2) para entender melhor o contexto do usuario: **maior desafio tributario**, **como funciona a operacao** e **se declara 100% do faturamento**. Essas perguntas aparecem **apos** as perguntas obrigatorias ja existentes, sempre -- nao dependem de campos faltantes.

## Novas Perguntas

### 1. Maior desafio tributario (grid de opcoes)
Clara pergunta: "Qual e o maior desafio tributario que voce enfrenta hoje?"
Opcoes:
- Pago muito imposto
- Nao sei se estou no regime certo
- Medo de fiscalizacao
- Dificuldade com obrigacoes acessorias
- Falta de planejamento tributario
- Nao sei quanto pago de imposto

### 2. Descricao da operacao (texto livre)
Clara pergunta: "Me conta um pouco como funciona a operacao da sua empresa. O que voce vende, como entrega, quem sao seus clientes?"
Input: textarea com placeholder e botao Confirmar.

### 3. Declara 100% do faturamento (grid sim/nao)
Clara pergunta: "Sua empresa declara 100% do faturamento? Essa informacao e confidencial e nos ajuda a calibrar a analise."
Opcoes:
- Sim, 100%
- Quase tudo (acima de 80%)
- Parcialmente (50-80%)
- Prefiro nao responder

## O que muda

### 1. Migracao de banco: 3 novas colunas em `company_profile`

```sql
ALTER TABLE company_profile
  ADD COLUMN IF NOT EXISTS desafio_principal text,
  ADD COLUMN IF NOT EXISTS descricao_operacao text,
  ADD COLUMN IF NOT EXISTS nivel_declaracao text;
```

### 2. Novo tipo de pergunta: `textarea`

O componente `StepQuestions.tsx` hoje suporta 3 tipos: `grid`, `currency`, `uf`. Sera adicionado um quarto tipo `textarea` para a pergunta sobre operacao.

### 3. Logica de exibicao das novas perguntas

As 3 perguntas novas **sempre aparecem**, independentemente de estarem preenchidas ou nao na tabela (exceto se ja respondidas naquela sessao). Elas sao adicionadas apos as perguntas de campos faltantes na lista de `questions`.

### 4. Atualizacao do `PlanejarFlow.tsx`

- Incluir as 3 novas chaves (`desafio_principal`, `descricao_operacao`, `nivel_declaracao`) na lista de campos que serao salvos via `update`
- Ajustar o `missingFields` para sempre incluir essas 3 chaves qualitativas se estiverem vazias no perfil

### 5. Atualizacao do `StepIntro.tsx`

Nao adicionar essas perguntas a tabela de dados da intro -- elas nao sao "dados da empresa", sao perguntas qualitativas. O contador de "Responder X perguntas" deve incluir essas 3 quando nao preenchidas.

## Detalhes Tecnicos

### Arquivos Modificados

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/planejar/StepQuestions.tsx` | Adicionar 3 perguntas ao array `REQUIRED_FIELDS`, adicionar tipo `textarea` no render |
| `src/components/planejar/PlanejarFlow.tsx` | Incluir as 3 novas chaves na logica de `getMissingFields` e no `handleQuestionsComplete` |

### Estrutura da nova pergunta textarea

```text
{
  key: 'descricao_operacao',
  label: 'Operação',
  claraText: 'Me conta um pouco como funciona a operação da sua empresa...',
  type: 'textarea'
}
```

### Render do tipo textarea

Um `<textarea>` com 4 linhas, placeholder contextual, e botao "Confirmar" abaixo (similar ao currency). Avanca ao clicar Confirmar.

