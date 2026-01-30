-- Create table for SPED x DCTF cross-reference analysis
CREATE TABLE public.fiscal_cross_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  periodo_referencia TEXT NOT NULL,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  
  -- SPED data
  sped_id UUID REFERENCES public.sped_contribuicoes(id) ON DELETE SET NULL,
  sped_pis_credito NUMERIC(15,2) DEFAULT 0,
  sped_pis_debito NUMERIC(15,2) DEFAULT 0,
  sped_cofins_credito NUMERIC(15,2) DEFAULT 0,
  sped_cofins_debito NUMERIC(15,2) DEFAULT 0,
  
  -- DCTF data
  dctf_id UUID REFERENCES public.dctf_declaracoes(id) ON DELETE SET NULL,
  dctf_pis_declarado NUMERIC(15,2) DEFAULT 0,
  dctf_cofins_declarado NUMERIC(15,2) DEFAULT 0,
  dctf_irpj_declarado NUMERIC(15,2) DEFAULT 0,
  dctf_csll_declarado NUMERIC(15,2) DEFAULT 0,
  
  -- Divergences found
  divergencia_pis NUMERIC(15,2) DEFAULT 0,
  divergencia_cofins NUMERIC(15,2) DEFAULT 0,
  divergencia_total NUMERIC(15,2) DEFAULT 0,
  
  -- Analysis status
  status TEXT DEFAULT 'pendente',
  nivel_risco TEXT DEFAULT 'baixo',
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fiscal_cross_analysis ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own cross analysis"
  ON public.fiscal_cross_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cross analysis"
  ON public.fiscal_cross_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cross analysis"
  ON public.fiscal_cross_analysis FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cross analysis"
  ON public.fiscal_cross_analysis FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_fiscal_cross_user ON public.fiscal_cross_analysis(user_id);
CREATE INDEX idx_fiscal_cross_periodo ON public.fiscal_cross_analysis(ano, mes);
CREATE INDEX idx_fiscal_cross_risco ON public.fiscal_cross_analysis(nivel_risco);

-- Trigger for updated_at
CREATE TRIGGER update_fiscal_cross_updated_at
  BEFORE UPDATE ON public.fiscal_cross_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();