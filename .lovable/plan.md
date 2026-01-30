

# Plano de Correção: Reconhecimento de Voz na DRE Inteligente

## Problema Identificado

Analisando o código e os logs do console, encontrei **dois bugs críticos**:

### 1. Erro de Ref no TooltipTrigger
O console mostra: *"Function components cannot be given refs"*
- O ícone `HelpCircle` do Lucide é um componente funcional que não aceita `ref`
- O `TooltipTrigger asChild` tenta passar uma ref para o filho, causando erro

### 2. Conflito de Instância do Reconhecimento de Voz
O hook `useSpeechRecognition` tem um problema de arquitetura:
- Cada campo (Vendas, Serviços, etc.) cria sua própria instância do hook
- Porém, o navegador só permite **uma sessão de reconhecimento de voz ativa por vez**
- Quando você clica no microfone de um campo, ele pode interferir com outro

## Solução Proposta

### Etapa 1: Corrigir o erro de ref no tooltip
Envolver o `HelpCircle` em um `<span>` que pode receber refs:

```tsx
<TooltipTrigger asChild>
  <span className="cursor-help">
    <HelpCircle className="h-4 w-4 text-muted-foreground" />
  </span>
</TooltipTrigger>
```

### Etapa 2: Refatorar o hook para criar instância por chamada
Mover a criação do `SpeechRecognition` para dentro de `startListening`:

```tsx
const startListening = useCallback(() => {
  // Criar nova instância a cada chamada
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionAPI) return;
  
  const recognition = new SpeechRecognitionAPI();
  // Configurar e iniciar...
}, []);
```

### Etapa 3: Adicionar gerenciamento de estado robusto
- Limpar qualquer sessão anterior antes de iniciar nova
- Garantir que o transcript seja processado corretamente por campo

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/dre/VoiceCurrencyInput.tsx` | Corrigir TooltipTrigger para usar span wrapper |
| `src/hooks/useSpeechRecognition.ts` | Refatorar para criar instância por sessão (não no mount) |

## Impacto

Após as correções:
- Cada campo poderá ditar valores independentemente
- Não haverá mais warnings no console
- O ditado número a número funcionará conforme esperado (ex: "cinco zero zero" → 500)

