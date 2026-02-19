ALTER TABLE public.company_profile
  ADD COLUMN IF NOT EXISTS desafio_principal text,
  ADD COLUMN IF NOT EXISTS descricao_operacao text,
  ADD COLUMN IF NOT EXISTS nivel_declaracao text;