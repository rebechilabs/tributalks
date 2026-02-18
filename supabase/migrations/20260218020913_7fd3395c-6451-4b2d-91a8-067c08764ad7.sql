
-- Add DRE-derived financial fields to company_profile for cross-tool data sharing
ALTER TABLE public.company_profile
  ADD COLUMN IF NOT EXISTS receita_liquida_mensal numeric,
  ADD COLUMN IF NOT EXISTS margem_bruta_percentual numeric,
  ADD COLUMN IF NOT EXISTS compras_insumos_mensal numeric,
  ADD COLUMN IF NOT EXISTS prolabore_mensal numeric,
  ADD COLUMN IF NOT EXISTS dados_financeiros_origem text,
  ADD COLUMN IF NOT EXISTS dados_financeiros_atualizados_em timestamptz;
