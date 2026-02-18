

# Unificar fundo da RTCCalculatorSection para #1A1A1A

## Problema

A secao `RTCCalculatorSection` usa classes de tema do Tailwind (`bg-gradient-to-b from-background to-card/50`, `bg-card/80`) em vez de `#1A1A1A`, o que pode gerar uma cor de fundo diferente do restante da landing page.

## Alteracoes

### Arquivo: `src/components/landing/RTCCalculatorSection.tsx`

1. Trocar `bg-gradient-to-b from-background to-card/50` por `bg-[#1A1A1A]` na `<section>`
2. Trocar `bg-card/80` por `bg-[#1A1A1A]` nos cards de beneficios (mantendo border e backdrop-blur)
3. Trocar `bg-primary/10` nos icones — manter como esta (sao elementos internos decorativos, nao fundo de secao)

Nenhuma mudanca de estrutura ou conteudo.

