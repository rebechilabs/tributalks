
# Melhorias de UX: DRE Inteligente e Comparativo de Regimes

## Problema 1 -- Abas da DRE clicaveis

**Arquivo:** `src/components/dre/DREWizard.tsx` (linhas 362-373)

Atualmente as abas (Suas Vendas, Custos, Despesas, Financeiro, Impostos, Produtos) sao apenas `div` sem interacao. A correcao:

- Adicionar `onClick={() => setCurrentStep(step.id)}` em cada aba
- Adicionar `cursor-pointer` na classe do container da aba
- Adicionar efeito `hover:bg-muted/50` para feedback visual
- Manter o check verde nas abas ja completadas (ja existe)
- Botoes Proximo/Voltar continuam funcionando normalmente

**Mudanca no codigo:** Apenas a `div` da aba (linha 366) precisa de `onClick` e classes CSS extras. Nenhuma logica adicional necessaria -- o `setCurrentStep` ja existe e funciona.

## Problema 2 -- Validacao visivel no Comparativo de Regimes

**Arquivo:** `src/components/simpronto/SimprontoWizard.tsx`

Atualmente o botao "Proximo" e desabilitado quando `faturamento_anual` esta zerado, mas nao ha mensagem explicativa. O usuario nao entende por que nao consegue avancar.

Correcoes:

1. **Adicionar estado de validacao:** `const [showErrors, setShowErrors] = useState(false)`

2. **Trocar o comportamento do botao "Proximo":** Em vez de `disabled={!isStep1Valid()}`, o botao fica sempre habilitado. Ao clicar:
   - Se valido: avanca para step 2
   - Se invalido: seta `setShowErrors(true)` e faz scroll para o primeiro campo com erro

3. **Mostrar mensagens de erro:** Abaixo dos campos obrigatorios (Faturamento Anual, Folha de Pagamento), quando `showErrors` e `true` e o valor e 0 ou vazio:
   - Texto vermelho: "Este campo e obrigatorio"
   - Borda vermelha no input: `border-destructive`

4. **Scroll automatico:** Usar `document.getElementById('faturamento_anual')?.scrollIntoView({ behavior: 'smooth' })` para o primeiro campo invalido

5. **Limpar erros:** Quando o usuario digita em um campo com erro, a mensagem desaparece para aquele campo

## Resumo de arquivos alterados

| Arquivo | Alteracao |
|---|---|
| `src/components/dre/DREWizard.tsx` | Adicionar onClick + cursor-pointer + hover nas abas |
| `src/components/simpronto/SimprontoWizard.tsx` | Adicionar validacao visual com mensagens de erro |

## O que NAO sera alterado
- Botoes da landing page
- Configuracoes do Stripe
- Logica de trial de 7 dias
- Nenhum outro modulo
