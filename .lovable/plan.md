
# Plano: Corrigir Problemas no PgdasUploader

## Problemas Identificados

| Problema | Descrição |
|----------|-----------|
| Validação inconsistente | `handleFileSelect` não valida arquivos, diferente do `handleDrop` |
| Filtro muito restritivo | Exige "pgdas", "das" ou "simples" no nome, mas isso pode rejeitar arquivos válidos |
| Palavra "das" problemática | Aceita qualquer arquivo com "das" no nome (ex: "planilha**das**.txt") |

## Solução Proposta

### 1. Unificar Validação de Arquivos
Fazer `handleFileSelect` usar a mesma validação que `handleDrop`.

### 2. Flexibilizar a Validação
Aceitar qualquer arquivo `.pdf` ou `.txt` sem exigir palavras específicas no nome:
- Arquivos PGDAS podem vir com nomes genéricos do portal da Receita Federal
- O processamento real validará o conteúdo do arquivo

### 3. Adicionar Validação de Tipo MIME (opcional)
Verificar que o arquivo é realmente PDF ou texto.

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/pgdas/PgdasUploader.tsx` | Corrigir validação de arquivos |

---

## Código Atual (Problema)

```typescript
// Linha 40-46: Validação muito restritiva
const isValidPgdasFile = (file: File): boolean => {
  const name = file.name.toLowerCase();
  return (
    (name.endsWith(".pdf") || name.endsWith(".txt")) &&
    (name.includes("pgdas") || name.includes("das") || name.includes("simples"))
  );
};

// Linha 87-92: Não usa validação!
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files) {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);  // ← Não valida!
  }
};
```

## Código Corrigido

```typescript
// Validação flexível - aceita .pdf e .txt sem exigir nome específico
const isValidPgdasFile = (file: File): boolean => {
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || name.endsWith(".txt");
};

// handleFileSelect agora usa validação
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files) {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(isValidPgdasFile);
    const invalidCount = selectedFiles.length - validFiles.length;

    if (invalidCount > 0) {
      toast({
        title: `${invalidCount} arquivo(s) ignorado(s)`,
        description: "Apenas arquivos .pdf ou .txt são aceitos",
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      addFiles(validFiles);
    }
  }
};
```

---

## Atualizar Texto de Ajuda

Remover a instrução "Nome do arquivo deve conter: pgdas, das ou simples" já que não será mais necessário.

---

## Resultado Esperado
- Usuário pode fazer upload de qualquer arquivo `.pdf` ou `.txt`
- Validação consistente entre arrastar e clicar para selecionar
- Mensagens de erro claras quando arquivos são rejeitados
