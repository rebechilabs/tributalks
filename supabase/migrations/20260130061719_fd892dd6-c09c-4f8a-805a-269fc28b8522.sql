-- =============================================
-- SPED Contribuições - Schema para Radar de Créditos
-- =============================================

-- Tabela principal: header do arquivo SPED
CREATE TABLE public.sped_contribuicoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Dados do Bloco 0000 (Abertura)
  cnpj TEXT NOT NULL,
  razao_social TEXT,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  regime_apuracao TEXT, -- '1'=Não-cumulativo, '2'=Cumulativo
  tipo_escrituracao TEXT, -- '0'=Original, '1'=Retificadora
  
  -- Totais consolidados (Blocos M200/M600)
  total_credito_pis NUMERIC DEFAULT 0,
  total_debito_pis NUMERIC DEFAULT 0,
  total_pis_apurado NUMERIC DEFAULT 0,
  total_credito_cofins NUMERIC DEFAULT 0,
  total_debito_cofins NUMERIC DEFAULT 0,
  total_cofins_apurado NUMERIC DEFAULT 0,
  
  -- Metadados
  arquivo_nome TEXT,
  arquivo_storage_path TEXT,
  status TEXT DEFAULT 'processando', -- 'processando', 'concluido', 'erro'
  erro_mensagem TEXT,
  registros_processados INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de itens: detalhes por registro de crédito (Blocos M100/M500)
CREATE TABLE public.sped_contribuicoes_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sped_id UUID NOT NULL REFERENCES public.sped_contribuicoes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Identificação
  tipo_tributo TEXT NOT NULL, -- 'PIS' ou 'COFINS'
  bloco TEXT, -- 'M100', 'M500', etc.
  tipo_credito TEXT, -- Código do tipo de crédito
  tipo_credito_descricao TEXT,
  
  -- Valores
  base_calculo NUMERIC DEFAULT 0,
  aliquota NUMERIC DEFAULT 0,
  valor_credito NUMERIC DEFAULT 0,
  valor_credito_utilizado NUMERIC DEFAULT 0,
  saldo_credito NUMERIC DEFAULT 0,
  
  -- Origem do crédito
  natureza_credito TEXT, -- '01'=Aquisição bens revenda, '02'=Insumos, etc.
  origem_credito TEXT, -- Mercado interno, importação, etc.
  
  -- Para integração com Radar de Créditos
  potencial_recuperacao NUMERIC DEFAULT 0,
  observacao TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Storage bucket para arquivos SPED
INSERT INTO storage.buckets (id, name, public)
VALUES ('sped-files', 'sped-files', false)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- RLS Policies
-- =============================================

ALTER TABLE public.sped_contribuicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sped_contribuicoes_items ENABLE ROW LEVEL SECURITY;

-- Policies para sped_contribuicoes
CREATE POLICY "Users can view own SPED files"
ON public.sped_contribuicoes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SPED files"
ON public.sped_contribuicoes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SPED files"
ON public.sped_contribuicoes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own SPED files"
ON public.sped_contribuicoes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policies para sped_contribuicoes_items
CREATE POLICY "Users can view own SPED items"
ON public.sped_contribuicoes_items FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SPED items"
ON public.sped_contribuicoes_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own SPED items"
ON public.sped_contribuicoes_items FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Storage policies para sped-files bucket
CREATE POLICY "Users can upload own SPED files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'sped-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own SPED files in storage"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'sped-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own SPED files in storage"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'sped-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Índices para performance
CREATE INDEX idx_sped_contribuicoes_user_id ON public.sped_contribuicoes(user_id);
CREATE INDEX idx_sped_contribuicoes_periodo ON public.sped_contribuicoes(periodo_inicio, periodo_fim);
CREATE INDEX idx_sped_items_sped_id ON public.sped_contribuicoes_items(sped_id);
CREATE INDEX idx_sped_items_user_id ON public.sped_contribuicoes_items(user_id);

-- Trigger para updated_at
CREATE TRIGGER update_sped_contribuicoes_updated_at
BEFORE UPDATE ON public.sped_contribuicoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();