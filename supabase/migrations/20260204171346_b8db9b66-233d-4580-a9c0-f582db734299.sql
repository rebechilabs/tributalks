-- Criar tabela simpronto_simulations
CREATE TABLE public.simpronto_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Inputs
  faturamento_anual NUMERIC NOT NULL,
  folha_pagamento NUMERIC NOT NULL DEFAULT 0,
  cnae_principal TEXT,
  compras_insumos NUMERIC NOT NULL DEFAULT 0,
  margem_lucro NUMERIC NOT NULL,
  perfil_clientes TEXT NOT NULL CHECK (perfil_clientes IN ('B2B', 'B2C', 'MISTO')),
  
  -- Outputs (JSON para flexibilidade)
  resultados JSONB NOT NULL,
  regime_recomendado TEXT NOT NULL,
  economia_estimada NUMERIC,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.simpronto_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own simulations"
  ON public.simpronto_simulations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulations"
  ON public.simpronto_simulations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own simulations"
  ON public.simpronto_simulations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulations"
  ON public.simpronto_simulations FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_simpronto_user_id ON public.simpronto_simulations(user_id);
CREATE INDEX idx_simpronto_created_at ON public.simpronto_simulations(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_simpronto_updated_at
  BEFORE UPDATE ON public.simpronto_simulations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();