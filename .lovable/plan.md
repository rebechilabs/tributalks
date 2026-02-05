
# Plano: Adicionar Seção da Calculadora RTC na Landing Page

## Por que é importante?

A integração com a **API oficial do Governo (piloto-cbs.tributos.gov.br)** é um diferencial competitivo enorme que gera confiança instantânea. O logo Gov.br e a menção "Powered by Receita Federal" são elementos de prova social governamental que pouquíssimos concorrentes têm.

## O que já existe

O componente `RTCCalculatorSection.tsx` já está pronto com:
- Badge verde "Integração Oficial" com animação pulse
- Título "Calculadora Oficial da Reforma Tributária"
- 4 benefícios: Cálculo Preciso, Tempo Real, Histórico, Exportação PDF
- Logo Gov.br com link para página oficial da Receita Federal
- "Powered by Receita Federal"
- CTA "Experimente Grátis"

## Alteração Necessária

Apenas **1 arquivo** precisa ser modificado:

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Index.tsx` | Importar e adicionar `RTCCalculatorSection` |

## Posicionamento Sugerido

```text
Hero
↓
ProblemSection
↓
DemoSection
↓
RTCCalculatorSection  ← NOVA POSIÇÃO (após demo, antes da Clara)
↓
ClaraSection
↓
NewPricingSection
↓
TestimonialsSection
↓
SecuritySection
```

A seção ficará logo após o demo interativo, reforçando que a ferramenta usa **dados oficiais do governo** antes de apresentar a IA Clara e os planos.

## Impacto Visual

- O logo Gov.br aparecerá com destaque na LP
- Badge verde "Integração Oficial" com pulse chama atenção
- Reforça credibilidade antes da seção de preços
- Não altera nenhuma outra seção existente
