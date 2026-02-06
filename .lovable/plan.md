
# Plano: Atualizar URL do Typeform

## Resumo
Substituir a URL placeholder do Typeform pela URL real do formulário.

## Alteração

### Arquivo: `src/pages/Connect.tsx`

Atualizar a linha 22:

**De:**
```tsx
const typeformUrl = "https://form.typeform.com/to/PLACEHOLDER";
```

**Para:**
```tsx
const typeformUrl = "https://form.typeform.com/to/hJER83zj";
```

## Resultado
O formulário Typeform será carregado e exibido corretamente na seção de aplicação da landing page `/connect`.
