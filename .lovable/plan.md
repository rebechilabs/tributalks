

# Plano: Atualizar botão do Hero Section para Trial Stripe

## Situação Atual

Existem 2 CTAs na Landing Page com comportamentos diferentes:

| Componente | Botão | Destino |
|------------|-------|---------|
| `HeroSection.tsx` (topo) | "Começar Diagnóstico Gratuito" | `/cadastro` |
| `CTASection.tsx` (final) | "Testar Grátis por 7 Dias" ✅ | Stripe Trial |

## Alteração Proposta

### Arquivo: `src/components/landing/HeroSection.tsx`

**1. Adicionar import do CONFIG (linha 4)**
```tsx
// ANTES
import logoHero from "@/assets/logo-tributalks-hero.jpg";

// DEPOIS
import logoHero from "@/assets/logo-tributalks-hero.jpg";
import { CONFIG } from "@/config/site";
```

**2. Alterar o botão principal (linhas 75-83)**
```tsx
// ANTES
<Link to="/cadastro">
  <Button
    size="lg"
    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-6 text-lg group"
  >
    Começar Diagnóstico Gratuito
    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
  </Button>
</Link>

// DEPOIS
<a href={CONFIG.PAYMENT_LINKS.STARTER_MENSAL} target="_blank" rel="noopener noreferrer">
  <Button
    size="lg"
    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-6 text-lg group"
  >
    Testar Grátis por 7 Dias
    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
  </Button>
</a>
```

---

## Resultado Final

Após a alteração, ambos os CTAs (topo e final da página) terão:
- **Texto**: "Testar Grátis por 7 Dias"
- **Destino**: Link Stripe para trial de 7 dias do plano Starter
- **Comportamento**: Abre em nova aba

---

## Resumo das Alterações

| Arquivo | Modificações |
|---------|-------------|
| `HeroSection.tsx` | Adicionar import CONFIG + Trocar Link/texto do botão |
| **Total** | 2 alterações em 1 arquivo |

