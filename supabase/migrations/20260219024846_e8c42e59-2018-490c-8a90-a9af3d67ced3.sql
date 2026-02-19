
-- Add company_id column with FK CASCADE to 15 tables

ALTER TABLE public.identified_credits ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profile(id) ON DELETE CASCADE;
ALTER TABLE public.credit_analysis_summary ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profile(id) ON DELETE CASCADE;
ALTER TABLE public.xml_imports ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profile(id) ON DELETE CASCADE;
ALTER TABLE public.fiscal_cross_analysis ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profile(id) ON DELETE CASCADE;
ALTER TABLE public.dctf_debitos ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profile(id) ON DELETE CASCADE;
ALTER TABLE public.dctf_declaracoes ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profile(id) ON DELETE CASCADE;
ALTER TABLE public.sped_contribuicoes ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profile(id) ON DELETE CASCADE;
ALTER TABLE public.company_ncm_analysis ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profile(id) ON DELETE CASCADE;
ALTER TABLE public.company_opportunities ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profile(id) ON DELETE CASCADE;
ALTER TABLE public.company_dre ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profile(id) ON DELETE CASCADE;
ALTER TABLE public.price_simulations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profile(id) ON DELETE CASCADE;
ALTER TABLE public.margin_dashboard ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profile(id) ON DELETE CASCADE;
ALTER TABLE public.erp_sync_logs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profile(id) ON DELETE CASCADE;
ALTER TABLE public.erp_connections ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profile(id) ON DELETE CASCADE;
ALTER TABLE public.erp_checklist ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profile(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_identified_credits_company_id ON public.identified_credits(company_id);
CREATE INDEX IF NOT EXISTS idx_credit_analysis_summary_company_id ON public.credit_analysis_summary(company_id);
CREATE INDEX IF NOT EXISTS idx_xml_imports_company_id ON public.xml_imports(company_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_cross_analysis_company_id ON public.fiscal_cross_analysis(company_id);
CREATE INDEX IF NOT EXISTS idx_dctf_debitos_company_id ON public.dctf_debitos(company_id);
CREATE INDEX IF NOT EXISTS idx_dctf_declaracoes_company_id ON public.dctf_declaracoes(company_id);
CREATE INDEX IF NOT EXISTS idx_sped_contribuicoes_company_id ON public.sped_contribuicoes(company_id);
CREATE INDEX IF NOT EXISTS idx_company_ncm_analysis_company_id ON public.company_ncm_analysis(company_id);
CREATE INDEX IF NOT EXISTS idx_company_opportunities_company_id ON public.company_opportunities(company_id);
CREATE INDEX IF NOT EXISTS idx_company_dre_company_id ON public.company_dre(company_id);
CREATE INDEX IF NOT EXISTS idx_price_simulations_company_id ON public.price_simulations(company_id);
CREATE INDEX IF NOT EXISTS idx_margin_dashboard_company_id ON public.margin_dashboard(company_id);
CREATE INDEX IF NOT EXISTS idx_erp_sync_logs_company_id ON public.erp_sync_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_erp_connections_company_id ON public.erp_connections(company_id);
CREATE INDEX IF NOT EXISTS idx_erp_checklist_company_id ON public.erp_checklist(company_id);

-- Backfill: assign company_id from each user's first company_profile
UPDATE public.identified_credits t SET company_id = (SELECT cp.id FROM public.company_profile cp WHERE cp.user_id = t.user_id ORDER BY cp.created_at ASC LIMIT 1) WHERE t.company_id IS NULL;
UPDATE public.credit_analysis_summary t SET company_id = (SELECT cp.id FROM public.company_profile cp WHERE cp.user_id = t.user_id ORDER BY cp.created_at ASC LIMIT 1) WHERE t.company_id IS NULL;
UPDATE public.xml_imports t SET company_id = (SELECT cp.id FROM public.company_profile cp WHERE cp.user_id = t.user_id ORDER BY cp.created_at ASC LIMIT 1) WHERE t.company_id IS NULL;
UPDATE public.fiscal_cross_analysis t SET company_id = (SELECT cp.id FROM public.company_profile cp WHERE cp.user_id = t.user_id ORDER BY cp.created_at ASC LIMIT 1) WHERE t.company_id IS NULL;
UPDATE public.dctf_debitos t SET company_id = (SELECT cp.id FROM public.company_profile cp WHERE cp.user_id = t.user_id ORDER BY cp.created_at ASC LIMIT 1) WHERE t.company_id IS NULL;
UPDATE public.dctf_declaracoes t SET company_id = (SELECT cp.id FROM public.company_profile cp WHERE cp.user_id = t.user_id ORDER BY cp.created_at ASC LIMIT 1) WHERE t.company_id IS NULL;
UPDATE public.sped_contribuicoes t SET company_id = (SELECT cp.id FROM public.company_profile cp WHERE cp.user_id = t.user_id ORDER BY cp.created_at ASC LIMIT 1) WHERE t.company_id IS NULL;
UPDATE public.company_ncm_analysis t SET company_id = (SELECT cp.id FROM public.company_profile cp WHERE cp.user_id = t.user_id ORDER BY cp.created_at ASC LIMIT 1) WHERE t.company_id IS NULL;
UPDATE public.company_opportunities t SET company_id = (SELECT cp.id FROM public.company_profile cp WHERE cp.user_id = t.user_id ORDER BY cp.created_at ASC LIMIT 1) WHERE t.company_id IS NULL;
UPDATE public.company_dre t SET company_id = (SELECT cp.id FROM public.company_profile cp WHERE cp.user_id = t.user_id ORDER BY cp.created_at ASC LIMIT 1) WHERE t.company_id IS NULL;
UPDATE public.price_simulations t SET company_id = (SELECT cp.id FROM public.company_profile cp WHERE cp.user_id = t.user_id ORDER BY cp.created_at ASC LIMIT 1) WHERE t.company_id IS NULL;
UPDATE public.margin_dashboard t SET company_id = (SELECT cp.id FROM public.company_profile cp WHERE cp.user_id = t.user_id ORDER BY cp.created_at ASC LIMIT 1) WHERE t.company_id IS NULL;
UPDATE public.erp_sync_logs t SET company_id = (SELECT cp.id FROM public.company_profile cp WHERE cp.user_id = t.user_id ORDER BY cp.created_at ASC LIMIT 1) WHERE t.company_id IS NULL;
UPDATE public.erp_connections t SET company_id = (SELECT cp.id FROM public.company_profile cp WHERE cp.user_id = t.user_id ORDER BY cp.created_at ASC LIMIT 1) WHERE t.company_id IS NULL;
UPDATE public.erp_checklist t SET company_id = (SELECT cp.id FROM public.company_profile cp WHERE cp.user_id = t.user_id ORDER BY cp.created_at ASC LIMIT 1) WHERE t.company_id IS NULL;
