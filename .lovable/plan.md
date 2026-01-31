

# Correção: Depoimentos e Social Proof

## O Problema Identificado

Você está apontando uma questão crítica: **depoimentos com nomes completos fictícios podem ser enganosos ou até ilegais** (publicidade enganosa). Mesmo com iniciais, ainda podem parecer depoimentos reais.

## Estado Atual no Código

O código já usa iniciais (C.M., F.L., R.A.), mas falta clareza de que são **exemplos ilustrativos baseados em casos reais**.

## Opções de Solução

### Opção A: Manter Iniciais + Adicionar Disclaimer

Adicionar texto pequeno abaixo dos depoimentos:
```
*Resultados representativos baseados em casos reais. 
Nomes alterados para preservar confidencialidade.
```

### Opção B: Transformar em "Casos de Sucesso" Anônimos

Remover nomes completamente e focar nas métricas:

| Antes | Depois |
|-------|--------|
| C.M., CFO, Logística | **Empresa de Logística** (R$ 8M/ano) |
| F.L., CFO, Tecnologia | **Empresa de Tecnologia** (R$ 15M/ano) |
| R.A., Dir. Financeiro | **Indústria** (R$ 42M/ano) |

### Opção C: Usar Métricas Agregadas (Mais Seguro)

Substituir depoimentos individuais por dados agregados:
- "1.500+ empresas identificaram média de R$ 47k em créditos"
- "ROI médio de 12x no primeiro ano"
- "93% dos usuários recomendam"

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `HeroSection.tsx` | Linhas 99-109 - ajustar card de social proof |
| `SocialProofSection.tsx` | Linhas 3-37 - ajustar dados dos testimonials |
| `TestimonialsSection.tsx` | Linhas 3-25 - ajustar dados dos testimonials |

## Recomendação

**Opção A + B combinadas**: Manter o formato atual com iniciais, mas:
1. Mudar de "C.M." para apenas setor/porte
2. Adicionar disclaimer: "*Casos ilustrativos baseados em resultados reais de clientes."

## Implementação Proposta

### HeroSection.tsx (linhas 97-109)

```tsx
// Remover nome individual, focar em setor/resultado
<div className="flex items-center gap-3 mb-4">
  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
    <TrendingUp className="w-6 h-6 text-primary" />
  </div>
  <div>
    <strong className="text-foreground">Empresa de Logística</strong>
    <p className="text-sm text-muted-foreground">Faturamento R$ 8M/ano</p>
  </div>
</div>
```

### SocialProofSection.tsx

```tsx
const testimonials = [
  {
    sector: "Logística",
    revenue: "R$ 8M/ano",
    // Remover "name: C.M."
    ...
  }
];

// Adicionar ao final da seção:
<p className="text-xs text-muted-foreground text-center mt-8">
  *Casos ilustrativos baseados em resultados reais. 
  Valores podem variar conforme perfil da empresa.
</p>
```

### TestimonialsSection.tsx

Mesma abordagem: remover iniciais, manter apenas cargo/setor, adicionar disclaimer.

## Resultado Final

- Sem nomes que pareçam pessoas reais
- Foco nos resultados e setores
- Disclaimer legal protege a empresa
- Credibilidade mantida através de métricas agregadas

