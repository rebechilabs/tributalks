

# Correção: Erro "Cannot read properties of undefined"

## Problema Identificado
A função `formatarParaExibicao` na linha 82 chama `.replace()` em um valor que pode ser `undefined`. Isso acontece porque o campo `despesas_operacionais` foi adicionado recentemente e pode não estar definido corretamente em todos os casos.

## Solução
Adicionar validação na função para tratar valores `undefined` ou `null`:

```typescript
const formatarParaExibicao = (valor: string): string => {
  if (!valor) return '';  // Adicionar esta verificação
  const numero = valor.replace(/\D/g, '');
  if (!numero) return '';
  return new Intl.NumberFormat('pt-BR').format(parseInt(numero));
};
```

## Arquivo a Modificar
- `src/components/simpronto/SimprontoWizard.tsx` (linha 81-85)

## Impacto
- Correção simples de 1 linha
- Previne o crash quando qualquer campo de moeda tiver valor undefined

