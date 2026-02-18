

# Plano: Corrigir erro de importacao dinamica e DRE zerada

## Problema identificado

Ha dois problemas ocorrendo simultaneamente:

1. **Erro de importacao dinamica do HomePage.tsx**: O Vite nao consegue recarregar o modulo apos edicicoes recentes (HMR corrompido). O codigo do arquivo esta correto, mas o cache esta obsoleto.

2. **Receita Bruta mostrando R$ 0,00**: Os valores visiveis na tela ("150.000", "80.000", "5.000", "3.000", "2.000") correspondem exatamente aos textos de exemplo (placeholders) dos campos. Quando o Vite recarrega o componente via HMR, o estado React e reinicializado para zero, mas o texto exibido nos campos pode permanecer, causando confusao.

## Solucao

### 1. Adicionar mecanismo de retry no carregamento dinamico de paginas

Modificar o `LazyRoute` no `App.tsx` para tentar recarregar o modulo automaticamente caso o primeiro carregamento falhe, eliminando o erro de "Failed to fetch dynamically imported module".

### 2. Melhorar a experiencia visual do DRE Wizard

Tornar os placeholders mais distintos dos valores reais para evitar confusao:
- Alterar os placeholders para incluir formato mais claro (ex: "0,00" em vez de "150.000")
- Ou remover os placeholders numericos que confundem com valores reais

## Detalhes tecnicos

### Arquivo: `src/App.tsx`
- Criar uma funcao `lazyWithRetry` que envolve `React.lazy()` com logica de retry (ate 3 tentativas com recarga forcada do modulo)
- Aplicar essa funcao a todos os imports dinamicos de paginas

### Arquivo: `src/components/dre/VoiceCurrencyInput.tsx`
- Alterar os placeholders para "0,00" (padrao) para nao confundir com valores reais
- Ja esta correto como `placeholder = '0,00'` no componente, mas os chamadores em `DREWizard.tsx` estao passando valores como "150.000"

### Arquivo: `src/components/dre/DREWizard.tsx`
- Remover os props `placeholder` customizados dos campos de vendas e deducoes que estao causando confusao visual ("150.000", "80.000", "5.000", "3.000", "2.000")
- Os campos usarao o placeholder padrao "0,00" do componente VoiceCurrencyInput

