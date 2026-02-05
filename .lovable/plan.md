
# Plano: Corrigir CTA da Seção RTC Calculator

## Objetivo
Alterar o botão "Experimente Grátis" na seção da Calculadora RTC para direcionar ao checkout do **plano Professional** no Stripe, em vez de `/cadastro`.

## Alteração Necessária

| Arquivo | Alteração |
|---------|-----------|
| `src/components/landing/RTCCalculatorSection.tsx` | Substituir `onClick={() => navigate("/cadastro")}` por link direto para Stripe Professional |

## Mudança Específica

**Antes:**
```tsx
<Button
  size="lg"
  onClick={() => navigate("/cadastro")}
>
  Experimente Grátis
</Button>
```

**Depois:**
```tsx
<a href={CONFIG.PAYMENT_LINKS.PROFESSIONAL_MENSAL} target="_blank" rel="noopener noreferrer">
  <Button size="lg">
    Experimente Grátis
  </Button>
</a>
```

## Detalhes Técnicos
- Importar `CONFIG` de `@/config/site`
- Remover import do `useNavigate` (se não for mais necessário)
- Link destino: `https://buy.stripe.com/3cIeV6ezM2rc2vx52Cbo40g` (Professional mensal com 7 dias grátis)

## Alinhamento com Estratégia
Conforme a memória `landing-page-cta-strategy`, o botão "Conhecer Suíte Margem Ativa" direciona especificamente para o plano Professional — esta alteração segue a mesma lógica para a seção da calculadora oficial.
