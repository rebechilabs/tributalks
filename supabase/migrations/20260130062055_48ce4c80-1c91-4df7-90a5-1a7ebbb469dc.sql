-- Create table for DCTF declarations (header)
CREATE TABLE public.dctf_declaracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cnpj TEXT NOT NULL,
  razao_social TEXT,
  periodo_apuracao TEXT NOT NULL,
  ano_calendario INTEGER NOT NULL,
  mes_referencia INTEGER,
  tipo_declaracao TEXT,
  retificadora BOOLEAN DEFAULT false,
  arquivo_nome TEXT,
  status TEXT DEFAULT 'processado',
  total_debitos_declarados NUMERIC(15,2) DEFAULT 0,
  total_creditos_vinculados NUMERIC(15,2) DEFAULT 0,
  total_pagamentos NUMERIC(15,2) DEFAULT 0,
  gap_identificado NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for DCTF debits details
CREATE TABLE public.dctf_debitos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dctf_id UUID NOT NULL REFERENCES public.dctf_declaracoes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  codigo_receita TEXT NOT NULL,
  descricao_tributo TEXT,
  periodo_apuracao TEXT,
  valor_principal NUMERIC(15,2) DEFAULT 0,
  valor_multa NUMERIC(15,2) DEFAULT 0,
  valor_juros NUMERIC(15,2) DEFAULT 0,
  valor_total NUMERIC(15,2) DEFAULT 0,
  credito_vinculado NUMERIC(15,2) DEFAULT 0,
  pagamento_vinculado NUMERIC(15,2) DEFAULT 0,
  saldo_devedor NUMERIC(15,2) DEFAULT 0,
  status_quitacao TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dctf_declaracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dctf_debitos ENABLE ROW LEVEL SECURITY;

-- RLS policies for dctf_declaracoes
CREATE POLICY "Users can view own DCTF declarations"
  ON public.dctf_declaracoes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own DCTF declarations"
  ON public.dctf_declaracoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own DCTF declarations"
  ON public.dctf_declaracoes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own DCTF declarations"
  ON public.dctf_declaracoes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for dctf_debitos
CREATE POLICY "Users can view own DCTF debits"
  ON public.dctf_debitos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own DCTF debits"
  ON public.dctf_debitos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own DCTF debits"
  ON public.dctf_debitos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own DCTF debits"
  ON public.dctf_debitos FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_dctf_declaracoes_user ON public.dctf_declaracoes(user_id);
CREATE INDEX idx_dctf_declaracoes_cnpj ON public.dctf_declaracoes(cnpj);
CREATE INDEX idx_dctf_declaracoes_periodo ON public.dctf_declaracoes(ano_calendario, mes_referencia);
CREATE INDEX idx_dctf_debitos_dctf ON public.dctf_debitos(dctf_id);
CREATE INDEX idx_dctf_debitos_user ON public.dctf_debitos(user_id);
CREATE INDEX idx_dctf_debitos_codigo ON public.dctf_debitos(codigo_receita);

-- Trigger for updated_at
CREATE TRIGGER update_dctf_declaracoes_updated_at
  BEFORE UPDATE ON public.dctf_declaracoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();