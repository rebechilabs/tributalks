
# Adicionar Comunidade Circle ao "Coming Soon" da Landing Page

## Objetivo
Indicar na Landing Page que uma comunidade exclusiva no Circle está a caminho, aumentando o valor percebido da assinatura sem prometer data específica.

## Alteração

### Arquivo: `src/components/landing/ComingSoonSection.tsx`

Adicionar novo item ao array `upcomingFeatures`:

```typescript
{
  icon: Users,
  label: "Comunidade Circle",
  description: "Networking exclusivo para CFOs",
}
```

E importar o ícone `Users` do lucide-react.

## Resultado Visual

A seção "E tem mais chegando..." passará de 3 para 4 cards:

| Dashboard Analytics | Multi-empresa | App Mobile | **Comunidade Circle** |
|---------------------|---------------|------------|------------------------|
| KPIs e gráficos     | Várias empresas | iOS/Android | Networking CFOs     |

## Impacto
- Zero breaking changes
- Apenas 2 linhas de código
- Reforça valor da assinatura
- Prepara terreno para migração futura do WhatsApp → Circle
