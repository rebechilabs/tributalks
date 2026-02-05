-- Adicionar campos de controle de fluxo ao profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS setup_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS welcome_seen BOOLEAN DEFAULT false;

-- Adicionar campos editáveis na company_profile
ALTER TABLE public.company_profile
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.setup_complete IS 'Indica se o usuário completou o setup inicial de empresas';
COMMENT ON COLUMN public.profiles.welcome_seen IS 'Indica se o usuário viu a tela de boas-vindas';
COMMENT ON COLUMN public.company_profile.is_active IS 'Indica se a empresa está ativa no sistema';