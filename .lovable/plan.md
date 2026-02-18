

## Adicionar disclaimer abaixo do subtitulo no MargemAtivaHeader

### O que sera feito
Adicionar um paragrafo de disclaimer logo abaixo da frase "Proteja sua margem na transicao da Reforma Tributaria" no componente `MargemAtivaHeader`.

### Arquivo
`src/components/margem-ativa/MargemAtivaHeader.tsx` — linha 75, apos o `<p>` existente

### Alteracao
Inserir um novo `<p>` com o texto:

> Para analisar seus fornecedores e calcular o impacto da Reforma Tributaria na sua margem, precisamos das suas notas fiscais de compra em formato XML. E simples: importe os XMLs uma vez e tudo aparece automaticamente aqui.

Estilizado com `text-sm text-muted-foreground mt-2` para manter consistencia visual com o subtitulo acima.

### Sobre o MotivationalBanner duplicado
O mesmo texto ja existe no `MotivationalBanner` (componente com botao de fechar) na pagina `MargemAtiva.tsx`. Apos confirmar que o disclaimer fixo no header e o desejado, podemos remover o banner duplicado se preferir.

