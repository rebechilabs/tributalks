

# Remover bloco CTA "Perguntar a Clara" do CreditRadar

## O que sera removido

No arquivo `src/components/credits/CreditRadar.tsx`, linhas 366-387, o bloco CTA que contem:
- "Duvidas sobre recuperacao?"
- "A Clara pode explicar cada credito e o processo de recuperacao."
- Botao "Perguntar a Clara"

Este bloco e redundante pois ja existe o CTA "Fale com o nosso time!" dentro da aba de Workflow (CreditImplementationWorkflow).

## Detalhes tecnicos

- **Arquivo**: `src/components/credits/CreditRadar.tsx`
- **Acao**: Remover linhas 366-387 (o Card inteiro do CTA)
- Nenhum outro arquivo sera alterado

