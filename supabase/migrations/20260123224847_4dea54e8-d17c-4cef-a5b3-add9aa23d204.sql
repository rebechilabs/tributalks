-- 1. Restringir SELECT na tabela contatos para apenas admins (via função de role)
-- Primeiro, criar o enum de roles se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
    END IF;
END $$;

-- Criar tabela de roles de usuário
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Criar função security definer para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Política: usuários podem ver suas próprias roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Remover política permissiva de contatos e adicionar SELECT restrito
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contatos;

-- Permitir INSERT público (formulário de contato)
CREATE POLICY "Anyone can submit contact form"
ON public.contatos
FOR INSERT
TO public
WITH CHECK (true);

-- SELECT apenas para admins
CREATE POLICY "Only admins can view contacts"
ON public.contatos
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- UPDATE apenas para admins (marcar como respondido)
CREATE POLICY "Only admins can update contacts"
ON public.contatos
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Adicionar políticas DELETE para conformidade LGPD/GDPR
-- Profiles: usuários podem deletar próprio perfil
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Consultorias: usuários podem cancelar próprias consultorias
CREATE POLICY "Users can delete own consultorias"
ON public.consultorias
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Alertas: usuários podem remover configurações de alerta
CREATE POLICY "Users can delete own alert config"
ON public.alertas_configuracao
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Tributbot messages: usuários podem deletar próprias mensagens (limpeza de histórico)
CREATE POLICY "Users can delete own messages"
ON public.tributbot_messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Restringir acesso a subscription_events - apenas admins ou próprio usuário
DROP POLICY IF EXISTS "Users can view own subscription events" ON public.subscription_events;

CREATE POLICY "Users can view own subscription events"
ON public.subscription_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));