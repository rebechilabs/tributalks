
# Corrigir Upload de PGDAS TXT

## Problema

O bucket de armazenamento `pgdas-files` não possui política de **INSERT** (upload). Apenas políticas de SELECT (leitura) e DELETE (exclusão) estão configuradas. Isso impede qualquer upload de arquivos PGDAS.

## Solução

Adicionar uma política de storage que permita aos usuários autenticados fazer upload de arquivos no bucket `pgdas-files`, dentro da pasta do próprio usuário.

## Detalhes Técnicos

**Migração SQL necessária:**

```sql
CREATE POLICY "Users can upload pgdas files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'pgdas-files'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
```

Essa política garante que cada usuário só pode fazer upload na sua própria pasta (identificada pelo `user.id`), seguindo o mesmo padrão das políticas de SELECT e DELETE já existentes.

**Nenhuma alteração de código é necessária** — o componente `PgdasUploader.tsx` já está correto e faz o upload para o caminho `{user.id}/{timestamp}_{filename}`.
