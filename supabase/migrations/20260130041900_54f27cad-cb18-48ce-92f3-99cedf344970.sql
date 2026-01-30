-- =============================================
-- ONDA 3: Gamificação e Onboarding
-- =============================================

-- 1. Tabela de conquistas do usuário
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_code TEXT NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_code)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can insert (for edge functions)
CREATE POLICY "Service can insert achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (true);

-- 2. Adicionar campos de streak em profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS last_access_date DATE,
  ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;

-- 3. Tabela de progresso do onboarding
CREATE TABLE public.user_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  tour_completed BOOLEAN DEFAULT false,
  first_mission_completed BOOLEAN DEFAULT false,
  checklist_items JSONB DEFAULT '{"score": false, "simulation": false, "timeline": false, "profile": false}'::jsonb,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own onboarding"
  ON public.user_onboarding_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding"
  ON public.user_onboarding_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding"
  ON public.user_onboarding_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Trigger para updated_at
CREATE TRIGGER update_user_onboarding_progress_updated_at
  BEFORE UPDATE ON public.user_onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Índices para performance
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_code ON public.user_achievements(achievement_code);
CREATE INDEX idx_user_onboarding_user_id ON public.user_onboarding_progress(user_id);