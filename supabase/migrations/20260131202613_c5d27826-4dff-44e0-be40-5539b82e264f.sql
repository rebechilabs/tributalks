-- Tabela para catálogo de produtos/serviços do usuário
CREATE TABLE public.user_product_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Tipo: produto (NCM) ou serviço (NBS)
  tipo TEXT NOT NULL DEFAULT 'produto',
  
  -- Para produtos
  ncm_code TEXT,
  ncm_descricao TEXT,
  
  -- Para serviços (categoria do CalculadoraNBS)
  nbs_categoria TEXT,
  
  -- Nome dado pelo usuário
  nome TEXT NOT NULL,
  
  -- Percentual da receita (opcional)
  percentual_receita NUMERIC DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.user_product_catalog ENABLE ROW LEVEL SECURITY;

-- Políticas separadas por operação
CREATE POLICY "Users can view own catalog"
  ON public.user_product_catalog
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own catalog"
  ON public.user_product_catalog
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own catalog"
  ON public.user_product_catalog
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own catalog"
  ON public.user_product_catalog
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes para performance
CREATE INDEX idx_user_product_catalog_user_id ON public.user_product_catalog(user_id);
CREATE INDEX idx_user_product_catalog_tipo ON public.user_product_catalog(tipo);

-- Trigger para updated_at
CREATE TRIGGER update_user_product_catalog_updated_at
  BEFORE UPDATE ON public.user_product_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();