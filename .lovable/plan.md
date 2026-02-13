
# Corrigir botão "Carregar XML" que não funciona

## Problema

O botão "Carregar XML" dentro da área de upload usa `e.stopPropagation()` para evitar que o clique se propague ao `div` pai, mas nao executa nenhuma ação propria. Ou seja, o clique e interceptado e descartado.

## Solucao

Alterar o `onClick` do botao para abrir o seletor de arquivos diretamente, mantendo o `stopPropagation` para evitar dupla abertura do dialog.

## Detalhes Tecnicos

**Arquivo:** `src/pages/AnaliseNotasFiscais.tsx`
**Linhas:** 630-637

**De:**
```tsx
<Button
  variant="outline"
  size="sm"
  onClick={(e) => e.stopPropagation()}
>
  <Upload className="mr-2 h-4 w-4" />
  Carregar XML
</Button>
```

**Para:**
```tsx
<Button
  variant="outline"
  size="sm"
  onClick={(e) => {
    e.stopPropagation();
    document.getElementById('file-input')?.click();
  }}
>
  <Upload className="mr-2 h-4 w-4" />
  Carregar XML
</Button>
```

O `stopPropagation` continua necessario para que o clique nao dispare tambem o `onClick` do div pai (que faz a mesma coisa), evitando abrir o dialog de arquivos duas vezes.
