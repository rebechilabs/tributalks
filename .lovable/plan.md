

# Fix: Ativar Rolagem Visível nas Conversas da Clara

## Problema Identificado

O `ScrollArea` do chat da Clara usa o componente Radix que, por padrão:
- Esconde a barra de rolagem até o hover
- Pode ter problemas em dispositivos touch
- O `Viewport` interno usa `overflow: hidden` que pode interferir em alguns casos

## Solução

Tornar a barra de rolagem **sempre visível** e garantir que o scroll funcione corretamente em todos os dispositivos.

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/common/FloatingAssistant.tsx` | Adicionar prop `scrollHideDelay={0}` e classes para manter scrollbar visível |
| `src/components/ui/scroll-area.tsx` | Ajustar estilos do Thumb para ser mais visível |

## Implementação Técnica

### 1. FloatingAssistant.tsx (linha 545)

```tsx
// Antes
<ScrollArea className="h-80 p-3" ref={scrollRef}>

// Depois
<ScrollArea className="h-80 p-3 [&_[data-radix-scroll-area-viewport]]:!overflow-y-auto" ref={scrollRef}>
```

Isso força o viewport interno a usar `overflow-y: auto` ao invés do comportamento padrão do Radix.

### 2. Alternativa: Modificar scroll-area.tsx

Adicionar classe para manter a scrollbar visível:

```tsx
// ScrollBar component - adicionar opacity padrão
className={cn(
  "flex touch-none select-none transition-colors",
  "opacity-100", // Sempre visível
  // ... resto do código
)}
```

E no Thumb:
```tsx
className="relative flex-1 rounded-full bg-primary/40 hover:bg-primary/60"
```

## Mudanças Específicas

1. Forçar `overflow-y: auto` no viewport interno usando seletor CSS
2. Tornar a scrollbar sempre visível (não só no hover)
3. Melhorar contraste visual da barra de rolagem
4. Garantir funcionamento em dispositivos touch

## Resultado Esperado

- Barra de rolagem sempre visível na área de mensagens
- Scroll suave e funcional em desktop e mobile
- Visual mais claro indicando que há conteúdo adicional

