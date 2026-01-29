
# Plano: Adicionar Selo "Pagamento Seguro via Stripe"

## Objetivo
Reforçar a confiança do usuário no momento da decisão de compra, destacando que os pagamentos são processados pelo Stripe - uma das plataformas de pagamento mais seguras do mundo.

---

## Alterações

### 1. Atualizar TrustBadges (src/components/landing/TrustBadges.tsx)

Adicionar um novo badge ao array existente:

```tsx
{
  icon: <CreditCard className="w-5 h-5" />,
  title: "Pagamento Seguro",
  description: "Processado via Stripe",
}
```

O grid de badges passará de 4 para 5 itens, reorganizando para uma exibição visualmente equilibrada.

---

### 2. Ajustar layout do grid

Mudar de `grid-cols-4` para `grid-cols-5` no desktop ou usar um layout alternativo que acomode 5 badges de forma elegante (por exemplo, 3+2 ou centralizado).

---

## Resultado Visual

A seção de planos exibirá 5 selos de confiança:

| Selo | Descrição |
|------|-----------|
| Criptografia de Ponta | SSL/TLS 256-bit |
| 100% Conforme LGPD | Lei 13.709/2018 |
| Nuvem Segura | Infraestrutura AWS |
| Dados Protegidos | Backup diário |
| **Pagamento Seguro** | **Processado via Stripe** |

---

## Impacto Esperado

- Maior confiança no checkout
- Redução de abandono nos botões de assinatura
- Alinhamento com as melhores práticas de conversão SaaS

---

## Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/components/landing/TrustBadges.tsx` | Adicionar badge de pagamento + ajustar grid |
