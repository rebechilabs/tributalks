-- Adicionar colunas de geolocalização na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country_code text,
ADD COLUMN IF NOT EXISTS country_name text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS last_seen_at timestamp with time zone DEFAULT now();

-- Criar tabela para tracking de presença online
CREATE TABLE IF NOT EXISTS public.user_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'away', 'offline')),
  last_active_at timestamp with time zone NOT NULL DEFAULT now(),
  page_path text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - usuários podem gerenciar sua própria presença
CREATE POLICY "Users can manage own presence"
ON public.user_presence
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todas as presenças
CREATE POLICY "Admins can view all presence"
ON public.user_presence
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Habilitar Realtime para a tabela de presença
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON public.user_presence(status);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_active ON public.user_presence(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country_code);