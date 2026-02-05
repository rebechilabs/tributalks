

# Plano: Corrigir Problema de Upload e Processamento SPED

## Problema Identificado

Após análise detalhada, identifiquei que o arquivo SPED **nunca foi processado com sucesso**:

| Evidência | Status |
|-----------|--------|
| Bucket `sped-files` | Vazio (0 arquivos) |
| Tabela `sped_contribuicoes` | Vazia (0 registros) |
| Logs da edge function | Nenhuma chamada registrada |

**Possíveis causas:**
1. O upload para o storage falhou silenciosamente
2. O usuário adicionou o arquivo mas não clicou em "Processar"
3. Erro de permissão no storage bucket
4. Erro silencioso de validação (arquivo não termina em .txt ou não contém "sped" no nome)

---

## Solução Proposta

### 1. Melhorar Tratamento de Erros no SpedUploader
Adicionar logs e mensagens de erro mais claras em cada etapa do processo:
- Log no console antes e depois de cada operação
- Toast com erro específico se upload falhar
- Indicação visual clara do status

### 2. Validar Permissões do Storage Bucket
Verificar se o bucket `sped-files` tem políticas corretas para upload

### 3. Remover Restrição de Nome de Arquivo
Atualmente o código só aceita arquivos que:
- Terminam com `.txt` OU
- Contêm "sped" no nome (case insensitive)

Vou **flexibilizar** para aceitar mais formatos.

### 4. Adicionar Botão de Diagnóstico
Incluir opção para reprocessar arquivos com erro e mostrar logs detalhados

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/sped/SpedUploader.tsx` | Melhorar logs, flexibilizar validação de arquivos, mostrar erros detalhados |

---

## Sugestão Imediata

Enquanto aplico as correções, **tente fazer o upload novamente** do arquivo SPED e observe se aparece algum erro no console do navegador (F12 → Console).

---

## Detalhes Técnicos

### Código Atual (Problema)
```typescript
// Linha 57-59: Filtro muito restritivo
const droppedFiles = Array.from(e.dataTransfer.files).filter(
  (file) => file.name.endsWith(".txt") || file.name.toLowerCase().includes("sped")
);
```

### Código Corrigido
```typescript
// Aceitar .txt, .TXT, e arquivos com "sped" ou "efd" no nome
const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => {
  const name = file.name.toLowerCase();
  return name.endsWith(".txt") || name.includes("sped") || name.includes("efd");
});
```

### Logs Adicionais
```typescript
console.log("[SpedUploader] Iniciando upload para storage...");
console.log("[SpedUploader] Upload concluído, criando registro no banco...");
console.log("[SpedUploader] Registro criado, chamando edge function...");
```

