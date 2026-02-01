
# Plano: Atualizar CTA da Seção "3 Passos"

## Objetivo
Alinhar o botão da seção "Como Funciona" com a estratégia de conversão direta para o Stripe (trial de 7 dias do plano Starter), mantendo consistência com os outros CTAs principais da Landing Page.

## Alteração

### Arquivo: `src/components/landing/HowItWorksSection.tsx`

**Mudanças:**
1. Importar `CONFIG` de `@/config/site`
2. Substituir o componente `<Link>` por uma tag `<a>` com link externo
3. Atualizar o texto do botão

**De:**
```tsx
<Link to="/cadastro">
  <Button ...>
    Começar Meu Diagnóstico Gratuito
    <ArrowRight ... />
  </Button>
</Link>
```

**Para:**
```tsx
<a 
  href={CONFIG.PAYMENT_LINKS.STARTER_MENSAL} 
  target="_blank" 
  rel="noopener noreferrer"
>
  <Button ...>
    Verifique a Saúde da Sua Empresa
    <ArrowRight ... />
  </Button>
</a>
```

## Resultado
O botão direcionará o usuário diretamente para o checkout do Stripe com trial gratuito de 7 dias, seguindo a mesma estratégia já implementada no Hero e na CTASection.
