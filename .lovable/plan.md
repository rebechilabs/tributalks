
# Plano: Upload de PGDAS em Lote

## O que é PGDAS?
O PGDAS-D (Programa Gerador do Documento de Arrecadação do Simples Nacional) é o documento onde empresas do Simples Nacional declaram sua receita bruta mensal e calculam os tributos devidos.

---

## O que será criado

### 1. Nova aba "PGDAS" na página de Análise de Créditos
Adicionar uma 7ª aba entre "DCTF" e "Cruzamento" para upload em lote de arquivos PGDAS.

### 2. Tabela `pgdas_arquivos` no banco de dados
Para armazenar os arquivos processados:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único |
| user_id | uuid | Usuário proprietário |
| cnpj | text | CNPJ da empresa |
| razao_social | text | Nome da empresa |
| periodo_apuracao | date | Mês/ano de referência |
| receita_bruta | numeric | Receita bruta declarada |
| valor_devido | numeric | Valor do DAS devido |
| aliquota_efetiva | numeric | Alíquota calculada |
| anexo_simples | text | Anexo (I, II, III, IV, V) |
| arquivo_nome | text | Nome do arquivo original |
| arquivo_storage_path | text | Caminho no storage |
| status | text | pending, processing, completed, error |
| erro_mensagem | text | Mensagem de erro se houver |
| created_at | timestamptz | Data de criação |

### 3. Bucket de storage `pgdas-files`
Para armazenar os arquivos originais com RLS adequado.

### 4. Componente `PgdasUploader`
Seguindo o padrão do `SpedUploader`, com:
- Área de drag-and-drop
- Lista de arquivos com status
- Botão "Processar Todos"
- Indicador de progresso
- Resumo após processamento

### 5. Edge Function `process-pgdas`
Para processar os arquivos PGDAS e extrair:
- Período de apuração
- Receita bruta
- Valor do DAS
- Anexo do Simples Nacional
- Alíquota efetiva

---

## Arquivos a criar/modificar

| Arquivo | Ação |
|---------|------|
| `src/components/pgdas/PgdasUploader.tsx` | Criar componente de upload |
| `src/components/pgdas/index.ts` | Criar exportação |
| `src/pages/AnaliseNotasFiscais.tsx` | Adicionar nova aba PGDAS |
| `supabase/functions/process-pgdas/index.ts` | Criar edge function |
| Migração SQL | Criar tabela e bucket |

---

## Detalhes Técnicos

### Estrutura da TabsList (7 abas)
```
XMLs | SPED | DCTF | PGDAS | Cruzamento | Créditos | Exposição
```

### Validação de arquivos PGDAS
Aceitar arquivos que:
- Terminam em `.pdf` ou `.txt`
- Contêm "pgdas" ou "das" ou "simples" no nome

### Migração SQL
```sql
-- Criar tabela pgdas_arquivos
CREATE TABLE public.pgdas_arquivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cnpj TEXT,
  razao_social TEXT,
  periodo_apuracao DATE,
  receita_bruta NUMERIC(15,2) DEFAULT 0,
  valor_devido NUMERIC(15,2) DEFAULT 0,
  aliquota_efetiva NUMERIC(5,4) DEFAULT 0,
  anexo_simples TEXT,
  arquivo_nome TEXT NOT NULL,
  arquivo_storage_path TEXT,
  status TEXT DEFAULT 'pending',
  erro_mensagem TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.pgdas_arquivos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pgdas files"
ON public.pgdas_arquivos FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Bucket de storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pgdas-files', 'pgdas-files', false);

-- Política de storage
CREATE POLICY "Users can upload own pgdas files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pgdas-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can read own pgdas files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'pgdas-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Resultado Esperado
Nova aba "PGDAS" na página de Análise de Créditos, permitindo upload em lote de declarações do Simples Nacional, com processamento automático e extração de dados para análise fiscal consolidada.
