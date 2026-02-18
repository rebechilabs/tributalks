

## Substituir emoji 🎯 por icone no disclaimer

### Arquivo
`src/components/margem-ativa/MargemAtivaHeader.tsx` — linha 79

### Alteracao
Remover o emoji `🎯` do final do texto e substituir por um icone `Target` do Lucide React, inline ao lado do texto.

- Importar `Target` de `lucide-react`
- Remover o emoji do texto
- Adicionar `<Target className="shrink-0 w-4 h-4 text-warning inline-block ml-1" />` ao final da frase

