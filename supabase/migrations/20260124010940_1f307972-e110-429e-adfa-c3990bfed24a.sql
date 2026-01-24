-- Adicionar campos para rastrear a origem do cálculo da reforma
ALTER TABLE public.company_dre 
ADD COLUMN IF NOT EXISTS reforma_source TEXT DEFAULT 'estimativa',
ADD COLUMN IF NOT EXISTS reforma_calculated_at TIMESTAMPTZ;

-- Adicionar comentários explicativos
COMMENT ON COLUMN public.company_dre.reforma_source IS 'Origem do cálculo: estimativa ou api_oficial';
COMMENT ON COLUMN public.company_dre.reforma_calculated_at IS 'Data/hora do cálculo via API oficial';