
# Correção: Validação Robusta no Onboarding

## O Que Estava Errado

O problema ocorreu porque a validação `canProceed()` usa verificação truthy simples (`formData.regime`) que pode falhar em edge cases. Quando o formulário é submetido com valor inválido, o banco rejeita por violar o CHECK constraint.

## Solução: Validação Explícita de Valores

Vou fortalecer a validação para garantir que **somente valores válidos** sejam aceitos:

### Arquivo: `src/pages/Onboarding.tsx`

**1. Criar constantes com valores válidos:**

```typescript
const REGIMES_VALIDOS = ['SIMPLES', 'PRESUMIDO', 'REAL'] as const;
const SETORES_VALIDOS = ['industria', 'comercio', 'servicos', 'tecnologia', 'outro'] as const;
```

**2. Atualizar `canProceed()` com validação explícita:**

```typescript
const canProceed = () => {
  switch (step) {
    case 1:
      return formData.empresa.trim() !== '' && formData.estado !== '';
    case 2:
      return formData.faturamento_mensal !== '';
    case 3:
      // Garante que regime é um dos valores válidos
      return REGIMES_VALIDOS.includes(formData.regime as any);
    case 4:
      // Garante que setor é um dos valores válidos  
      return SETORES_VALIDOS.includes(formData.setor as any);
    default:
      return true;
  }
};
```

**3. Adicionar validação extra no `handleSubmit` como safety net:**

```typescript
const handleSubmit = async () => {
  if (!user) return;
  
  // Validação de segurança antes de enviar
  if (!REGIMES_VALIDOS.includes(formData.regime as any)) {
    toast({
      title: "Regime inválido",
      description: "Por favor, selecione um regime tributário válido.",
      variant: "destructive",
    });
    setStep(3);
    return;
  }
  
  if (!SETORES_VALIDOS.includes(formData.setor as any)) {
    toast({
      title: "Setor inválido", 
      description: "Por favor, selecione um setor válido.",
      variant: "destructive",
    });
    setStep(4);
    return;
  }
  
  setIsLoading(true);
  // ... resto do código de submit
};
```

## Resultado

- O botão "Próximo" só fica habilitado com valores válidos
- Validação dupla (client-side + antes do submit) previne qualquer bypass
- Se algo der errado, mensagem clara e redirecionamento para o passo correto
- Zero chance de enviar strings vazias ou valores inválidos ao banco

## Detalhes Técnicos

**Constraints do banco que serão respeitados:**
- `regime`: CHECK `(regime = ANY (ARRAY['SIMPLES', 'PRESUMIDO', 'REAL']))`
- `setor`: CHECK `(setor = ANY (ARRAY['industria', 'comercio', 'servicos', 'tecnologia', 'outro']))`

**Arquivos modificados:** 1
- `src/pages/Onboarding.tsx`
