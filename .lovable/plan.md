
## Plano: Exibir Newsletter para Usuários Enterprise

### Problema Identificado
O formulário de newsletter está corretamente integrado no sidebar (linha 233-236 de `Sidebar.tsx`), porém **não aparece** porque você está logado com uma conta do plano **ENTERPRISE**.

A lógica atual em `NewsletterForm.tsx` (linha 42-44) oculta o formulário para usuários Enterprise:
```typescript
if (user && isEnterprise) {
  return null;
}
```

### Solução Proposta
Remover a restrição que oculta o formulário para usuários Enterprise, permitindo que todos os planos vejam a newsletter no sidebar.

### Alteração Necessária

**Arquivo**: `src/components/common/NewsletterForm.tsx`

**Linhas 42-44** - Remover:
```typescript
// REMOVER ESTE BLOCO:
if (user && isEnterprise) {
  return null;
}
```

### Impacto

| Plano | Antes | Depois |
|-------|-------|--------|
| FREE | Visível | Visível |
| NAVIGATOR | Visível | Visível |
| PROFESSIONAL | Visível | Visível |
| ENTERPRISE | **Oculto** | **Visível** |

### Localização no Sidebar
Após a alteração, o formulário aparecerá:
- Abaixo do menu de navegação (Histórico/Configurações)
- Acima do badge "Seu plano"
- Com fundo destacado (`bg-muted/30`)
