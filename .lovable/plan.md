

# Melhorar clareza do campo "% da Receita" no catálogo de produtos/serviços

## Problema

Na última etapa do DRE (ProductCatalogStep), o campo "% da Receita" aparece isolado ao lado do botão "Adicionar", sem contexto suficiente. O usuário não entende o que deve preencher ali.

## Solução

Tornar o campo mais descritivo e contextualizado:

1. **Trocar o label** de "% da Receita" para "Quanto representa do faturamento?"
2. **Adicionar um texto auxiliar (placeholder)** mais claro: "Ex: 30" ao invés de "0"
3. **Adicionar tooltip** explicativo: "Informe o percentual aproximado que este item representa do seu faturamento total. Ex: se metade da receita vem deste produto, coloque 50."
4. **Mover o campo para sua própria linha**, abaixo dos campos de nome/NCM/NBS e acima do botão Adicionar, dando mais destaque e separando-o visualmente

## Mudanças técnicas

### `src/components/dre/ProductCatalogStep.tsx`
- Separar o campo de percentual do botão "Adicionar" — cada um em sua própria linha
- Atualizar o label para "Quanto representa do faturamento? (%)"
- Adicionar placeholder "Ex: 30"
- Adicionar um tooltip com ícone de ajuda (HelpCircle) explicando o que preencher
- Manter o botão "Adicionar" em largura total abaixo do campo

