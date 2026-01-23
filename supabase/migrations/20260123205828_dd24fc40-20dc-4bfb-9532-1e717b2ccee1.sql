-- =====================================================
-- TABELA: consultorias
-- Agendamentos de consultoria (Premium)
-- =====================================================
CREATE TABLE public.consultorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  calendly_event_id TEXT,
  calendly_event_uri TEXT,
  
  data_agendada TIMESTAMPTZ,
  duracao_minutos INT DEFAULT 30,
  especialista TEXT,
  tema TEXT,
  
  status TEXT DEFAULT 'AGENDADA' CHECK (status IN ('AGENDADA', 'REALIZADA', 'CANCELADA', 'NO_SHOW')),
  notas TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_consultorias_user ON public.consultorias(user_id);
CREATE INDEX idx_consultorias_data ON public.consultorias(data_agendada);
CREATE INDEX idx_consultorias_status ON public.consultorias(status);

-- Enable RLS
ALTER TABLE public.consultorias ENABLE ROW LEVEL SECURITY;

-- Políticas para consultorias
CREATE POLICY "Users can view own consultorias" ON public.consultorias
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consultorias" ON public.consultorias
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consultorias" ON public.consultorias
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER consultorias_updated_at
  BEFORE UPDATE ON public.consultorias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- TABELA: subscription_events
-- Log de eventos de assinatura (webhooks do Stripe)
-- =====================================================
CREATE TABLE public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  stripe_event_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB,
  
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_subscription_events_user ON public.subscription_events(user_id);
CREATE INDEX idx_subscription_events_type ON public.subscription_events(event_type);
CREATE INDEX idx_subscription_events_stripe_id ON public.subscription_events(stripe_event_id);

-- Enable RLS (service role only)
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Apenas service role pode acessar (via edge functions)
-- Não criar políticas públicas pois este é um log interno

-- =====================================================
-- Adicionar campos extras ao profiles se não existirem
-- =====================================================
DO $$ 
BEGIN
  -- Adicionar stripe_subscription_id se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'stripe_subscription_id') THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_subscription_id TEXT;
  END IF;

  -- Adicionar subscription_status se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'subscription_status') THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
  END IF;

  -- Adicionar subscription_period_end se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'subscription_period_end') THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_period_end TIMESTAMPTZ;
  END IF;

  -- Adicionar notif_novidades se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'notif_novidades') THEN
    ALTER TABLE public.profiles ADD COLUMN notif_novidades BOOLEAN DEFAULT true;
  END IF;

  -- Adicionar notif_legislacao se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'notif_legislacao') THEN
    ALTER TABLE public.profiles ADD COLUMN notif_legislacao BOOLEAN DEFAULT true;
  END IF;

  -- Adicionar notif_consultorias se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'notif_consultorias') THEN
    ALTER TABLE public.profiles ADD COLUMN notif_consultorias BOOLEAN DEFAULT true;
  END IF;
END $$;