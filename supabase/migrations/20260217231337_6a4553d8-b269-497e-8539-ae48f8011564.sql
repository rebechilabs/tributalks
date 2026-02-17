
-- Archive table for identified credits before re-analysis
CREATE TABLE public.identified_credits_archive (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_credit_id UUID NOT NULL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_reason TEXT NOT NULL DEFAULT 'reanalysis',
  nfe_key TEXT,
  nfe_number TEXT,
  nfe_date TIMESTAMPTZ,
  supplier_cnpj TEXT,
  supplier_name TEXT,
  original_tax_value NUMERIC,
  credit_not_used NUMERIC,
  potential_recovery NUMERIC,
  ncm_code TEXT,
  product_description TEXT,
  cfop TEXT,
  cst TEXT,
  confidence_score NUMERIC,
  confidence_level TEXT,
  status TEXT,
  rule_id UUID,
  xml_import_id UUID,
  user_id UUID NOT NULL,
  original_created_at TIMESTAMPTZ
);

ALTER TABLE public.identified_credits_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own archived credits"
ON public.identified_credits_archive FOR SELECT
USING (auth.uid() = user_id);

CREATE INDEX idx_credits_archive_user ON identified_credits_archive(user_id);
CREATE INDEX idx_credits_archive_import ON identified_credits_archive(xml_import_id);
