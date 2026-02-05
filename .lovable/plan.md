

# Plano: Correção da Página "Configure seu ambiente"

## Problemas Identificados

### 1. Erro de forwardRef nos Componentes
Os logs mostram que `Setup` e `CompanySetupCard` estão recebendo refs do React Router, mas não estão preparados para isso:
```
Warning: Function components cannot be given refs.
Check the render method of `App`.
    at Setup
```

### 2. Chamada Fantasma no useCnpjLookup
O hook `useCnpjLookup` faz uma chamada inútil ao `supabase.functions.invoke` (linhas 78-86) que não usa o resultado, e depois faz a chamada correta via `fetch`. Isso causa comportamento inconsistente.

### 3. Formulário de Empresa sem Auto-lookup
O `CompanySetupForm` requer que o usuário clique no botão "Buscar" manualmente. O auto-preenchimento só ocorre após clicar.

## Arquivos a Modificar

| Arquivo | Problema | Solução |
|---------|----------|---------|
| `src/hooks/useCnpjLookup.ts` | Chamada fantasma antes do fetch real | Remover linhas 78-86 (invoke desnecessário) |
| `src/components/setup/CompanySetupCard.tsx` | Não suporta forwardRef | Adicionar forwardRef wrapper |
| `src/components/setup/CompanySetupForm.tsx` | Sem auto-lookup quando 14 dígitos | Adicionar auto-lookup quando CNPJ completo |

## Correções Detalhadas

### 1. Corrigir useCnpjLookup.ts

**Antes (problema):**
```typescript
try {
  // Chamada inútil que não usa o resultado
  const { data: response, error: fnError } = await supabase.functions.invoke(
    'gov-data-api',
    { body: null, headers: {...} }
  );

  // Depois faz fetch direto
  const functionUrl = ...
  const res = await fetch(functionUrl, {...});
```

**Depois (corrigido):**
```typescript
try {
  const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gov-data-api/cnpj/${cleanedCnpj}`;
  
  const res = await fetch(functionUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
    },
  });
```

### 2. Adicionar forwardRef ao CompanySetupCard

```typescript
import React, { forwardRef } from "react";

export const CompanySetupCard = forwardRef<HTMLDivElement, CompanySetupCardProps>(
  ({ company, isPrimary, onEdit, onRemove, onSetPrimary }, ref) => {
    // ... resto do componente
    return (
      <Card ref={ref} className={...}>
```

### 3. Auto-lookup no CompanySetupForm

Adicionar useEffect que dispara lookup automaticamente quando CNPJ atinge 14 dígitos:

```typescript
// Auto-lookup when CNPJ is complete
useEffect(() => {
  const cleanCnpj = cnpj.replace(/\D/g, '');
  if (cleanCnpj.length === 14 && !cnpjData && !cnpjLoading && !isAutoFilled) {
    handleLookup();
  }
}, [cnpj]);
```

## Fluxo Corrigido

```text
1. Usuário digita CNPJ
2. Quando completa 14 dígitos → auto-lookup dispara
3. Dados da empresa preenchem automaticamente:
   - Razão Social (bloqueado)
   - Nome Fantasia (editável)
   - Regime Tributário (sugerido, editável)
4. Usuário clica "Adicionar Empresa"
5. Empresa salva com sucesso
6. Usuário pode continuar para "Boas-vindas"
```

## Resultado Esperado

- Os campos serão preenchidos automaticamente ao digitar o CNPJ completo
- O botão "Buscar" ainda funciona como alternativa manual
- Sem erros de console sobre refs
- Salvamento funciona corretamente

