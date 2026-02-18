-- Drop the functional unique index
DROP INDEX IF EXISTS public.company_dre_user_period_unique;

-- Set default for period_month and make it NOT NULL  
UPDATE public.company_dre SET period_month = 0 WHERE period_month IS NULL;
ALTER TABLE public.company_dre ALTER COLUMN period_month SET DEFAULT 0;
ALTER TABLE public.company_dre ALTER COLUMN period_month SET NOT NULL;

-- Create a standard unique constraint (not functional)
ALTER TABLE public.company_dre ADD CONSTRAINT company_dre_user_period_unique UNIQUE (user_id, period_type, period_year, period_month);