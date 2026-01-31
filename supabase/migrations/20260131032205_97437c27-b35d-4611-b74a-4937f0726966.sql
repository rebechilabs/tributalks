-- Tabela para armazenar resultados de diagnóstico rápido
CREATE TABLE public.diagnostic_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'complete' CHECK (status IN ('complete', 'partial', 'error')),
  source TEXT NOT NULL DEFAULT 'xml' CHECK (source IN ('xml', 'erp')),
  
  -- Resultados da análise
  credits_total NUMERIC DEFAULT 0,
  credits_items JSONB DEFAULT '[]'::jsonb,
  
  cashflow_risk TEXT CHECK (cashflow_risk IN ('low', 'medium', 'high')),
  cashflow_impact_q2_2027 NUMERIC DEFAULT 0,
  
  margin_current NUMERIC DEFAULT 0,
  margin_projected NUMERIC DEFAULT 0,
  margin_delta_pp NUMERIC DEFAULT 0,
  
  insights JSONB DEFAULT '[]'::jsonb,
  processing_time_ms INTEGER DEFAULT 0,
  
  -- Metadados
  xmls_processed INTEGER DEFAULT 0,
  erp_connection_id UUID REFERENCES erp_connections(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.diagnostic_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own diagnostic results"
ON public.diagnostic_results FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnostic results"
ON public.diagnostic_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnostic results"
ON public.diagnostic_results FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diagnostic results"
ON public.diagnostic_results FOR DELETE
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_diagnostic_results_user ON diagnostic_results(user_id);
CREATE INDEX idx_diagnostic_results_expires ON diagnostic_results(expires_at);

-- Trigger para updated_at
CREATE TRIGGER update_diagnostic_results_updated_at
BEFORE UPDATE ON public.diagnostic_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();