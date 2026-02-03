-- Tabela para configurações dinâmicas de prompts da Clara
CREATE TABLE public.clara_prompt_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_type TEXT NOT NULL,
  content JSONB NOT NULL,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para busca rápida
CREATE INDEX idx_prompt_configs_type ON public.clara_prompt_configs(config_type);
CREATE INDEX idx_prompt_configs_key ON public.clara_prompt_configs(config_key);
CREATE INDEX idx_prompt_configs_status ON public.clara_prompt_configs(status);

-- RLS
ALTER TABLE public.clara_prompt_configs ENABLE ROW LEVEL SECURITY;

-- Leitura pública de configs ativas
CREATE POLICY "Public read active configs"
  ON public.clara_prompt_configs FOR SELECT
  USING (status = 'active');

-- Admins podem gerenciar
CREATE POLICY "Admins can manage configs"
  ON public.clara_prompt_configs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para updated_at
CREATE TRIGGER update_clara_prompt_configs_updated_at
  BEFORE UPDATE ON public.clara_prompt_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela para rastrear jornada AI do usuário
CREATE TABLE public.user_ai_journey (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  priority TEXT,
  tool_plan JSONB DEFAULT '[]',
  completed_tools TEXT[] DEFAULT '{}',
  tool_results JSONB DEFAULT '{}',
  welcome_seen_at TIMESTAMPTZ,
  last_activity TIMESTAMPTZ DEFAULT now(),
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para user_ai_journey
ALTER TABLE public.user_ai_journey ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own journey"
  ON public.user_ai_journey FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_user_ai_journey_updated_at
  BEFORE UPDATE ON public.user_ai_journey
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();