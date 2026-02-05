-- =====================================================
-- MIGRAÇÃO DE SEGURANÇA - CORREÇÃO DE POLÍTICAS RLS
-- =====================================================

-- 1. Corrigir policy de contatos (INSERT)
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contatos;

CREATE POLICY "Public can submit contact form with validation"
ON public.contatos FOR INSERT
TO anon, authenticated
WITH CHECK (
  nome IS NOT NULL AND 
  nome <> '' AND 
  email IS NOT NULL AND 
  email <> '' AND
  assunto IS NOT NULL AND
  mensagem IS NOT NULL
);

-- 2. Corrigir policy de clara_embeddings_cache
DROP POLICY IF EXISTS "Service role can manage embeddings cache" ON public.clara_embeddings_cache;

CREATE POLICY "Service role only can manage embeddings cache"
ON public.clara_embeddings_cache FOR ALL
TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 3. Corrigir policy de referrals (prevenir auto-referral)
DROP POLICY IF EXISTS "Users can insert referrals for themselves as referred" ON public.referrals;

CREATE POLICY "Users can only insert referrals as referred party"
ON public.referrals FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = referred_id AND
  auth.uid() <> referrer_id
);

-- 4. Adicionar policy de DELETE em referral_codes (se não existir)
DROP POLICY IF EXISTS "Users can delete own referral code" ON public.referral_codes;

CREATE POLICY "Users can delete own referral code"
ON public.referral_codes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);