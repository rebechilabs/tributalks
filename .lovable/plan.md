
# Correcao Visual: Espacamento Excessivo na Landing Page

## Problema

A landing page tem dois problemas de espacamento:
1. O arquivo `src/App.css` contem estilos padrao do Vite (`#root { max-width: 1280px; padding: 2rem }`) que adicionam padding desnecessario e restringem o layout
2. As secoes usam `py-20 md:py-32` (128px de padding em cada lado no desktop), criando 256px de espaco total entre conteudos -- excessivo para uma landing page moderna

## O que sera feito

### 1. Limpar `src/App.css`
Remover os estilos padrao do Vite no `#root` (max-width, padding, text-align) e classes nao utilizadas (`.logo`, `.card`, `.read-the-docs`). Essas regras sao sobras do template inicial e nao sao usadas pelo app.

### 2. Reduzir padding vertical das secoes da landing page
Padronizar o espacamento em `py-16 md:py-20` (maximo ~80px por lado no desktop), respeitando o limite solicitado de 80px entre secoes:

| Componente | Antes | Depois |
|---|---|---|
| ProblemSection | `pt-10 pb-20 md:pb-32` | `pt-10 pb-16 md:pb-20` |
| DemoSection | `py-20 md:py-32` | `py-16 md:py-20` |
| ClaraSection | `py-20 md:py-32` | `py-16 md:py-20` |
| NewPricingSection | `py-20 md:py-32` | `py-16 md:py-20` |
| TestimonialsSection | `py-20 md:py-32` | `py-16 md:py-20` |
| SecuritySection | `py-20 md:py-32` | `py-16 md:py-20` |

A RTCCalculatorSection ja usa `py-16 md:py-24` e sera ajustada para `py-16 md:py-20` por consistencia.

### 3. Reduzir espaco no footer CTA
O CTA final dentro do `NewFooter` usa `py-16 md:py-24`. Sera reduzido para `py-12 md:py-16` para manter proporcao.

## O que NAO muda
- Botoes CTA ("Comece seus 7 dias gratis") -- mantidos intactos
- Configuracoes do Stripe
- Logica de trial de 7 dias
- Hero section (layout e imagem de fundo)
- Footer (links, legal disclaimer, powered by)
- Responsividade mobile -- ajustes respeitam breakpoints

## Secao tecnica

### Arquivos editados
- `src/App.css` -- Remover regras `#root`, `.logo`, `.card`, `.read-the-docs`
- `src/components/landing/ProblemSection.tsx` -- Linha 25: `pb-20 md:pb-32` para `pb-16 md:pb-20`
- `src/components/landing/DemoSection.tsx` -- Linha 11: `py-20 md:py-32` para `py-16 md:py-20`
- `src/components/landing/RTCCalculatorSection.tsx` -- Linha 31: `py-16 md:py-24` para `py-16 md:py-20`
- `src/components/landing/ClaraSection.tsx` -- Linha 20: `py-20 md:py-32` para `py-16 md:py-20`
- `src/components/landing/NewPricingSection.tsx` -- Linha 90: `py-20 md:py-32` para `py-16 md:py-20`
- `src/components/landing/TestimonialsSection.tsx` -- Linha 27: `py-20 md:py-32` para `py-16 md:py-20`
- `src/components/landing/SecuritySection.tsx` -- Linha 22: `py-20 md:py-32` para `py-16 md:py-20`
- `src/components/landing/NewFooter.tsx` -- Linha 19: `py-16 md:py-24` para `py-12 md:py-16`
