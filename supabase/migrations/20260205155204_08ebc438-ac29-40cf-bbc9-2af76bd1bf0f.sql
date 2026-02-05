-- Criar tabela pgdas_arquivos
CREATE TABLE public.pgdas_arquivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
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

-- Política de storage para upload
CREATE POLICY "Users can upload own pgdas files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pgdas-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política de storage para leitura
CREATE POLICY "Users can read own pgdas files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'pgdas-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política de storage para delete
CREATE POLICY "Users can delete own pgdas files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pgdas-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);