-- ======================================================
-- MIGRAÇÃO DE SEGURANÇA - CORREÇÃO DE VULNERABILIDADES
-- ======================================================

-- 1. Corrigir policy de INSERT em notifications (muito permissiva)
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;

CREATE POLICY "Authenticated users can insert own notifications" 
ON public.notifications FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 2. Remover policy permissiva de achievements
DROP POLICY IF EXISTS "Service can insert achievements" ON public.user_achievements;

-- 3. Remover lookup público de referral codes
DROP POLICY IF EXISTS "Anyone can lookup referral codes by code" ON public.referral_codes;

-- 4. Criar função segura para validar códigos de indicação (via RPC)
CREATE OR REPLACE FUNCTION public.validate_referral_code(code_to_check text)
RETURNS TABLE(valid boolean, referrer_id uuid) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    EXISTS(SELECT 1 FROM referral_codes WHERE code = UPPER(code_to_check)) as valid,
    (SELECT user_id FROM referral_codes WHERE code = UPPER(code_to_check) LIMIT 1) as referrer_id;
$$;

-- 5. Garantir que função é acessível para anônimos (necessário no cadastro)
GRANT EXECUTE ON FUNCTION public.validate_referral_code(text) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_referral_code(text) TO authenticated;