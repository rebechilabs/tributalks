

# Plano: Tornar Cards de Jornada Clicáveis

## Situação Atual

| Elemento | Comportamento |
|----------|---------------|
| Card inteiro | Não clicável |
| Botão "Plano X →" | Leva ao Stripe ✅ |

O usuário espera que clicar em qualquer parte do card leve ao checkout do Stripe.

---

## Alteração Proposta

### Arquivo: `src/components/landing/JourneysSection.tsx`

**Transformar o container do card em um link clicável**

Vou envolver todo o card com uma tag `<a>` que aponta para o link do Stripe, mantendo o visual atual mas tornando toda a área clicável.

**1. Alterar o container do card (linhas 82-168)**

```tsx
// ANTES
<div
  key={journey.id}
  className={`relative bg-card rounded-xl p-6 md:p-8 border-2 transition-all duration-300 ${...}`}
>
  {/* conteúdo */}
</div>

// DEPOIS
<a
  key={journey.id}
  href={journey.link}
  target="_blank"
  rel="noopener noreferrer"
  className={`relative bg-card rounded-xl p-6 md:p-8 border-2 transition-all duration-300 block cursor-pointer hover:shadow-lg ${...}`}
>
  {/* conteúdo */}
</a>
```

**2. Manter o botão interno (opcional visual)**

O botão continuará visível como elemento de UI, mas toda a área do card será clicável.

---

## Resultado Final

Após a alteração:
- ✅ Clicar em **qualquer parte** do card leva ao Stripe
- ✅ O botão continua visível como indicador de ação
- ✅ Efeito hover no card inteiro (shadow)
- ✅ Abre em nova aba

---

## Resumo das Alterações

| Arquivo | Modificação |
|---------|-------------|
| `JourneysSection.tsx` | Trocar `<div>` por `<a>` no container do card |
| **Total** | 1 alteração em 1 arquivo |

