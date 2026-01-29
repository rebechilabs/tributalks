-- Tabela de códigos de indicação (cada usuário tem um código único)
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  successful_referrals INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_referral_codes_user UNIQUE (user_id)
);

-- Tabela de indicações individuais
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'rewarded', 'expired', 'cancelled')),
  referred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  subscription_started_at TIMESTAMP WITH TIME ZONE,
  qualified_at TIMESTAMP WITH TIME ZONE,
  reward_applied_at TIMESTAMP WITH TIME ZONE,
  discount_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_referrals_referrer FOREIGN KEY (referrer_id) REFERENCES public.referral_codes(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_referrals_code FOREIGN KEY (referral_code) REFERENCES public.referral_codes(code) ON DELETE CASCADE,
  CONSTRAINT uq_referrals_referred UNIQUE (referred_id)
);

-- Índices para performance
CREATE INDEX idx_referral_codes_user ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies para referral_codes
CREATE POLICY "Users can view own referral code"
  ON public.referral_codes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral code"
  ON public.referral_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referral code"
  ON public.referral_codes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy para permitir lookup público do código (necessário para validar no cadastro)
CREATE POLICY "Anyone can lookup referral codes by code"
  ON public.referral_codes
  FOR SELECT
  USING (true);

-- RLS Policies para referrals
CREATE POLICY "Users can view referrals where they are the referrer"
  ON public.referrals
  FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view their own referred record"
  ON public.referrals
  FOR SELECT
  USING (auth.uid() = referred_id);

CREATE POLICY "Users can insert referrals for themselves as referred"
  ON public.referrals
  FOR INSERT
  WITH CHECK (auth.uid() = referred_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_referral_codes_updated_at
  BEFORE UPDATE ON public.referral_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();