
# Adicionar contraste nos cards da landing page

## Objetivo
Trocar o `bg-[#1A1A1A]` dos cards internos por `bg-[#222222]`, criando uma sutil diferenca visual entre o fundo da pagina e os cards, mantendo a hierarquia visual.

## Cor escolhida
- Fundo da pagina: `#1A1A1A` (mantido)
- Cards internos: `#222222` (levemente mais claro, contraste sutil)

## Arquivos e alteracoes

### 1. `src/components/landing/ProblemSection.tsx`
- Cards de beneficios: `bg-[#1A1A1A]` → `bg-[#222222]`

### 2. `src/components/landing/RTCCalculatorSection.tsx`
- Cards de beneficios: `bg-[#1A1A1A]` → `bg-[#222222]`

### 3. `src/components/landing/TestimonialsSection.tsx`
- Cards de depoimentos: `bg-[#1A1A1A]` → `bg-[#222222]`

### 4. `src/components/landing/SecuritySection.tsx`
- Cards de seguranca e integracoes: `bg-[#1A1A1A]` → `bg-[#222222]`

### 5. `src/components/landing/NewPricingSection.tsx`
- Cards de planos: `bg-[#1A1A1A]` → `bg-[#222222]`
- Card enterprise: `bg-[#1A1A1A]` → `bg-[#222222]`
- Toggle de billing: manter `#1A1A1A` (elemento UI pequeno, nao e um card)

### 6. `src/components/landing/DemoSection.tsx`
- Container do video/demo: `bg-[#1A1A1A]` → `bg-[#222222]`

### 7. `src/components/landing/ClaraSection.tsx`
- Icones de agentes: `bg-[#1A1A1A]` → `bg-[#222222]`

### Nao alterar
- Fundo das `<section>` (permanecem `#1A1A1A`)
- Header e Footer (permanecem `#1A1A1A`)
- Toggle de billing no pricing (elemento pequeno)

Total: 7 arquivos, apenas substituicao de cor nos cards internos.
