
# Simplificar Layout do Split Payment

## Objetivo
Tornar a pagina Split Payment mais direta e focada no resultado numerico, removendo textos explicativos desnecessarios.

## Mudancas (arquivo unico: `src/pages/calculadora/SplitPayment.tsx`)

### 1. Subtitulo do header (linha 334-336)
Substituir "Calcule a retencao de caixa com base nas aliquotas oficiais da LC 214/2025 e Manual RTC." por:
**"Descubra quanto o Split Payment vai reter do seu faturamento a partir de 2027."**

### 2. Cenario de Simulacao (linhas 354-386)
Remover o Card com icone AlertTriangle e texto explicativo. Substituir por dois botoes simples lado a lado com `mb-6`, sem card wrapper nem texto descritivo abaixo.

### 3. Bloco Por Dentro vs Por Fora (linhas 388-431)
Manter o label "Simples Nacional: como voce vai recolher IBS/CBS?" e os dois botoes de selecao. Remover:
- O paragrafo explicativo "A LC 214/2025 permite duas formas..."
- Os dois cards explicativos grid (linhas 421-428) com os textos "Por Dentro: IBS/CBS no DAS..." e "Por Fora (Hibrido): IBS/CBS separados..."

### 4. Secao "Seus Dados" (linhas 433-535)
Envolver todo o conteudo do Card num Collapsible fechado por padrao:
- Remover o Card/CardHeader/CardContent wrapper
- Usar Collapsible com defaultOpen={false}
- CollapsibleTrigger com icone ChevronDown e texto "Seus Dados (clique para ajustar)"
- Manter formulario e botao Calcular dentro do CollapsibleContent
- Mover o botao "Calcular Impacto" para **fora** do collapsible para que fique sempre visivel

### 5. Imports
- Adicionar: `Collapsible, CollapsibleTrigger, CollapsibleContent` de `@/components/ui/collapsible`
- Adicionar: `ChevronDown` do lucide-react

## Ordem visual resultante

1. Titulo + subtitulo curto
2. Toggle de cenario (2026 / 2027+) — botoes simples
3. Seletor Por Dentro / Por Fora (so botoes, sem cards) — visivel apenas para Simples
4. Botao Calcular (sempre visivel)
5. Resultado em destaque (quando calculado)
6. "Seus Dados" colapsado (accordion fechado)

## O que NAO muda

- Logica de calculo (funcao `calcularSplitPayment`)
- Auto-save de simulacao
- Secao de resultado
- CTA Professional
- Toast contextual
- TaxDisclaimer
