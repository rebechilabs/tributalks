
# Plano Definitivo: Corrigir Digitação nos Campos da DRE

## Causa Raiz Identificada

O problema está na **linha 113 do `DREWizard.tsx`**:

```tsx
const CurrencyInput = ({ label, field, tooltip, placeholder }) => {
  // ...
  return <VoiceCurrencyInput ... />
}
```

O `CurrencyInput` é definido **dentro do componente `DREWizard`** como uma função inline. Isso causa:

1. **Cada vez que o usuário digita** algo, o `formData` muda
2. O `DREWizard` faz re-render
3. O React **cria uma nova definição** de `CurrencyInput` (nova referência de função)
4. O React entende que é um **componente diferente** do anterior
5. O input é **desmontado e remontado**, perdendo o foco
6. O usuário precisa clicar de novo para continuar digitando

## Solução

**Remover o wrapper `CurrencyInput`** e usar `VoiceCurrencyInput` diretamente no JSX, passando as props inline.

Ou seja, trocar:
```tsx
<CurrencyInput label="Vendas de produtos" field="vendas_produtos" />
```

Por:
```tsx
<VoiceCurrencyInput 
  label="Vendas de produtos" 
  field="vendas_produtos" 
  value={formData.vendas_produtos}
  onChange={(value) => handleInputChange('vendas_produtos', value)}
/>
```

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/dre/DREWizard.tsx` | Remover a definição de `CurrencyInput` (linhas 113-126) e substituir todas as chamadas pelo componente real `VoiceCurrencyInput` com props explícitas |

## Por que isso resolve?

- O `VoiceCurrencyInput` é importado de um arquivo externo, então sua referência **nunca muda**
- Apenas as **props** mudam, não o componente em si
- O React vai **atualizar** o componente existente em vez de desmontar/remontar
- O **foco permanece** no input durante a digitação

## Resultado Esperado

Após a correção:
- Digitação contínua e fluida sem perda de foco
- Formatação automática aplicada ao sair do campo (onBlur)
- Sem necessidade de clicar múltiplas vezes
- Sem erros no console
