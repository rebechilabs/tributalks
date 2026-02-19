
ALTER TABLE public.company_profile
  ADD COLUMN IF NOT EXISTS num_socios text,
  ADD COLUMN IF NOT EXISTS socios_outras_empresas text,
  ADD COLUMN IF NOT EXISTS distribuicao_lucros text;
