

# Melhorar clareza do seletor Produtos/Servicos no catalogo do DRE

## Problema
O RadioGroup atual entre "Produtos (NCM)" e "Servicos (NBS)" da a impressao de que o usuario deve escolher um OU outro. Na verdade, ele pode adicionar ambos os tipos na mesma lista.

## Solucao

### 1. Adicionar texto explicativo abaixo do RadioGroup
Incluir uma mensagem como: "Voce pode adicionar produtos e servicos na mesma lista. Selecione o tipo e adicione quantos itens quiser de cada."

### 2. Trocar o label "O que voce vende?" por algo mais claro
Novo label: "Que tipo de item deseja adicionar agora?"
Isso deixa claro que e uma selecao temporaria, nao uma escolha definitiva.

### 3. Mostrar indicadores visuais na lista de itens
Quando ja houver itens de ambos os tipos na lista, exibir um resumo acima dela:
"X produto(s) e Y servico(s) adicionados"

## Mudancas tecnicas

### `src/components/dre/ProductCatalogStep.tsx`

**Linha 122** - Trocar o label:
- De: `O que voce vende?`
- Para: `Que tipo de item deseja adicionar agora?`

**Apos linha 143 (fechamento do RadioGroup)** - Adicionar texto explicativo:
```typescript
<p className="text-xs text-muted-foreground flex items-center gap-1">
  <Package className="w-3 h-3 inline" />
  +
  <Briefcase className="w-3 h-3 inline" />
  Voce pode adicionar produtos e servicos na mesma lista.
</p>
```

**Linha 264 (label dos itens adicionados)** - Melhorar o resumo:
Substituir o label generico por um que mostra a contagem por tipo:
```typescript
const prodCount = items.filter(i => i.tipo === 'produto').length;
const servCount = items.filter(i => i.tipo === 'servico').length;

// Exibir: "2 produto(s) e 1 servico(s) adicionados"
```

## O que NAO muda
- O comportamento do RadioGroup continua o mesmo (alterna campos do formulario)
- A estrutura de dados permanece identica
- Nenhuma alteracao no banco de dados

