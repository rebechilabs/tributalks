
-- Add new columns for clinical screening questions
ALTER TABLE public.company_profile ADD COLUMN IF NOT EXISTS margem_liquida_faixa text;
ALTER TABLE public.company_profile ADD COLUMN IF NOT EXISTS mix_b2b_faixa text;
ALTER TABLE public.company_profile ADD COLUMN IF NOT EXISTS alto_volume_compras_nfe boolean DEFAULT false;
