
-- Adicionar 8 colunas text para perguntas exploratórias da Camada 2
ALTER TABLE public.company_profile ADD COLUMN IF NOT EXISTS folha_acima_28pct text;
ALTER TABLE public.company_profile ADD COLUMN IF NOT EXISTS tem_st_icms text;
ALTER TABLE public.company_profile ADD COLUMN IF NOT EXISTS creditos_pis_cofins_pendentes text;
ALTER TABLE public.company_profile ADD COLUMN IF NOT EXISTS usa_jcp text;
ALTER TABLE public.company_profile ADD COLUMN IF NOT EXISTS creditos_icms_exportacao text;
ALTER TABLE public.company_profile ADD COLUMN IF NOT EXISTS usa_ret text;
ALTER TABLE public.company_profile ADD COLUMN IF NOT EXISTS conhece_imunidade_issqn text;
ALTER TABLE public.company_profile ADD COLUMN IF NOT EXISTS conhece_pep_sp text;
