
# Alterar CTA "Perguntar a Clara" para "Fale com o nosso time!"

## O que muda

No componente `CreditImplementationWorkflow.tsx`, o bloco CTA (linhas 240-261) sera atualizado:

- **Titulo**: de "Duvidas sobre o processo?" para "Duvidas sobre recuperacao?"
- **Descricao**: de "A Clara pode explicar cada etapa em detalhes" para "Nosso time esta esperando seu contato"
- **Botao**: de "Perguntar a Clara" (icone Sparkles) para "Fale com o nosso time!" -- abre o `EnterpriseModal`

## Detalhes tecnicos

1. **Importar** `EnterpriseModal` de `@/components/landing/EnterpriseModal` e adicionar state `enterpriseModalOpen`
2. **Remover** a prop `onAskClara` do componente (e a importacao de `Sparkles` se nao usada em outro lugar)
3. **Trocar textos** e botao conforme descrito
4. **Renderizar** `<EnterpriseModal />` controlado pelo state
5. Seguir o mesmo padrao ja usado em `SplitPayment.tsx`, `PricingSection.tsx` e `NewPricingSection.tsx`
