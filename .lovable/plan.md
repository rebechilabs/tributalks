

# Ajustar Texto da Clara na Intro

## Resumo

Alterar a mensagem da Clara na Etapa 1 para usar a frase "antes preciso lhe fazer algumas perguntas" em vez de "preciso confirmar X dados que estao faltando".

## Alteracao

### Arquivo: `src/components/planejar/StepIntro.tsx`

Linha 113-115 -- trocar o texto do `claraText` quando ha perguntas pendentes:

**De:**
> "Ola! Sou a Clara, sua assistente tributaria. Vou analisar o perfil da sua empresa e encontrar oportunidades de economia fiscal. Antes, preciso confirmar X dados que estao faltando."

**Para:**
> "Ola! Sou a Clara, sua assistente tributaria. Vou analisar o perfil da sua empresa e encontrar oportunidades de economia fiscal. Antes, preciso lhe fazer algumas perguntas."

O texto do botao tambem sera ajustado de "Responder X perguntas e gerar analise" para "Responder perguntas e gerar analise", removendo o contador numerico para manter consistencia com o tom mais natural.

