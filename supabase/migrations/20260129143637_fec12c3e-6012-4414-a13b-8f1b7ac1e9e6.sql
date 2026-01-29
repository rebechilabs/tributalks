-- Função para incrementar contador de indicações
CREATE OR REPLACE FUNCTION public.increment_referral_count(referrer_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.referral_codes
  SET 
    total_referrals = total_referrals + 1,
    updated_at = now()
  WHERE user_id = referrer_user_id;
END;
$$;