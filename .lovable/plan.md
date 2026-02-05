
# Plano: Corrigir SPED Contribuições

## Problemas Identificados

| Problema | Descrição |
|----------|-----------|
| Validação inconsistente | `handleFileSelect` não valida arquivos como o `handleDrop` faz |
| Falta invalidação do cache | Após processar arquivos, a query `sped-contribuicoes` não é invalidada |
| Dados não aparecem | Mesmo se salvos no banco, a lista não atualiza automaticamente |

## Solução

### 1. Corrigir `handleFileSelect` para validar arquivos
Aplicar a mesma correção feita no PgdasUploader:
- Filtrar arquivos válidos antes de adicionar
- Mostrar toast quando arquivos são ignorados

### 2. Adicionar invalidação do React Query
Após processar com sucesso um arquivo:
- Invalidar a query `sped-contribuicoes` para atualizar a lista
- Invalidar `sped-items` se necessário

### 3. Flexibilizar validação de arquivos
Aceitar qualquer arquivo `.txt` sem exigir "sped" ou "efd" no nome:
- Arquivos SPED podem vir com nomes genéricos do portal da Receita
- O parser na edge function validará o conteúdo real do arquivo

---

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/sped/SpedUploader.tsx` | Corrigir validação e adicionar invalidação de cache |

---

## Código Atual

```typescript
// Linha 38-43: Validação que exige termos específicos
const isValidSpedFile = (file: File): boolean => {
  const name = file.name.toLowerCase();
  return name.endsWith(".txt") || name.includes("sped") || name.includes("efd");
};

// Linha 84-89: handleFileSelect sem validação
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files) {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);  // ← Não valida!
  }
};

// Linha 217-223: Sem invalidação de cache após sucesso
toast({
  title: "SPED processado com sucesso",
  ...
});
```

## Código Corrigido

```typescript
// Imports adicionais
import { useQueryClient } from "@tanstack/react-query";

// Validação flexível - aceita qualquer .txt
const isValidSpedFile = (file: File): boolean => {
  const name = file.name.toLowerCase();
  return name.endsWith(".txt");
};

// Dentro do componente
const queryClient = useQueryClient();

// handleFileSelect com validação
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files) {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(isValidSpedFile);
    const invalidCount = selectedFiles.length - validFiles.length;

    if (invalidCount > 0) {
      toast({
        title: `${invalidCount} arquivo(s) ignorado(s)`,
        description: "Apenas arquivos .txt são aceitos",
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      addFiles(validFiles);
    }
  }
};

// Após processamento bem-sucedido, invalidar cache
toast({
  title: "SPED processado com sucesso",
  ...
});

// Invalidar queries para atualizar lista
queryClient.invalidateQueries({ queryKey: ["sped-contribuicoes"] });
queryClient.invalidateQueries({ queryKey: ["sped-items"] });
```

---

## Atualizar texto de ajuda

Alterar a mensagem de validação de:
> "Apenas arquivos .txt ou com 'sped'/'efd' no nome são aceitos"

Para:
> "Apenas arquivos .txt são aceitos"

---

## Resultado Esperado
- Validação consistente entre arrastar e clicar para selecionar
- Arquivos processados aparecem imediatamente na lista após processamento
- Qualquer arquivo .txt pode ser enviado (o conteúdo será validado no servidor)
