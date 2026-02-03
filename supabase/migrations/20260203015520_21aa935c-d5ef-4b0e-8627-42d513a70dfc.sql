-- ============================================
-- ADAPTIVE ROADMAP - Jornadas Personalizadas
-- ============================================

-- Tabela principal para roadmaps personalizados
CREATE TABLE public.clara_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Contexto da sessão (perguntas respondidas)
  user_priority TEXT, -- 'caixa', 'margem', 'compliance', 'crescimento', 'explorar'
  time_available TEXT, -- '5min', '15min', '30min', '1h+'
  urgent_concern TEXT, -- texto livre do usuário
  decision_style TEXT, -- 'dados_profundos', 'resumo_executivo', 'so_o_essencial'
  
  -- Roadmap gerado pela IA
  session_goal TEXT, -- ex: "Proteger seu caixa nos próximos 30 dias"
  steps JSONB DEFAULT '[]'::jsonb, -- array de steps com tool, action, why, priority, status
  estimated_total_time INTEGER, -- minutos totais estimados
  
  -- Tracking de progresso
  completed_steps TEXT[] DEFAULT '{}',
  skipped_steps TEXT[] DEFAULT '{}',
  time_spent INTEGER DEFAULT 0, -- minutos reais gastos
  
  -- Avaliação e aprendizado
  effectiveness_score DECIMAL(3,2), -- 0-1, baseado em completion rate
  user_feedback TEXT, -- 'util', 'nao_relevante', 'muito_complexo'
  feedback_text TEXT, -- comentário opcional
  
  -- Metadados
  data_signals JSONB, -- dados reais usados para gerar (score, créditos, etc)
  model_used TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_clara_roadmaps_user_date ON public.clara_roadmaps(user_id, session_date DESC);
CREATE INDEX idx_clara_roadmaps_effectiveness ON public.clara_roadmaps(user_id, effectiveness_score DESC);

-- RLS
ALTER TABLE public.clara_roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roadmaps"
  ON public.clara_roadmaps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own roadmaps"
  ON public.clara_roadmaps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps"
  ON public.clara_roadmaps FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_clara_roadmaps_updated_at
  BEFORE UPDATE ON public.clara_roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- TABELA: Preferências de Onboarding do Usuário
-- (Armazena respostas do questionário inicial)
-- ============================================

CREATE TABLE public.user_session_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Perfil base (preenchido uma vez, atualizado periodicamente)
  business_stage TEXT, -- 'sobrevivencia', 'estabilidade', 'crescimento', 'escala'
  main_pain TEXT, -- 'caixa_curto', 'margem_apertada', 'medo_fiscal', 'planejamento_reforma'
  decision_style TEXT DEFAULT 'resumo_executivo', -- 'dados_profundos', 'resumo_executivo', 'so_o_essencial'
  
  -- Nível de sofisticação (1-10, calculado pela IA)
  sophistication_level INTEGER DEFAULT 3,
  
  -- Preferências aprendidas
  preferred_tools TEXT[] DEFAULT '{}',
  learning_pattern TEXT DEFAULT 'guided', -- 'hands_on', 'guided', 'autonomous'
  avg_session_duration INTEGER, -- minutos médios por sessão
  
  -- Controles
  roadmap_enabled BOOLEAN DEFAULT true, -- usuário pode desativar
  show_welcome_modal BOOLEAN DEFAULT true, -- mostra modal no login
  last_session_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.user_session_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON public.user_session_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_user_session_preferences_updated_at
  BEFORE UPDATE ON public.user_session_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FUNÇÃO: Calcular efetividade do roadmap
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_roadmap_effectiveness(p_roadmap_id UUID)
RETURNS DECIMAL(3,2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total_steps INTEGER;
  v_completed INTEGER;
  v_skipped INTEGER;
  v_effectiveness DECIMAL(3,2);
BEGIN
  SELECT 
    jsonb_array_length(steps),
    array_length(completed_steps, 1),
    array_length(skipped_steps, 1)
  INTO v_total_steps, v_completed, v_skipped
  FROM clara_roadmaps
  WHERE id = p_roadmap_id;
  
  IF v_total_steps = 0 THEN
    RETURN 0;
  END IF;
  
  -- Effectiveness = completed / total, penalizado por skipped
  v_completed := COALESCE(v_completed, 0);
  v_skipped := COALESCE(v_skipped, 0);
  
  v_effectiveness := (v_completed::DECIMAL / v_total_steps) * (1 - (v_skipped::DECIMAL / v_total_steps * 0.3));
  
  -- Atualiza a tabela
  UPDATE clara_roadmaps
  SET effectiveness_score = v_effectiveness
  WHERE id = p_roadmap_id;
  
  RETURN v_effectiveness;
END;
$$;

-- ============================================
-- FUNÇÃO: Atualizar sophistication_level
-- ============================================

CREATE OR REPLACE FUNCTION public.update_user_sophistication(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_avg_effectiveness DECIMAL;
  v_total_sessions INTEGER;
  v_tools_used INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Calcular baseado em histórico
  SELECT 
    AVG(effectiveness_score),
    COUNT(*)
  INTO v_avg_effectiveness, v_total_sessions
  FROM clara_roadmaps
  WHERE user_id = p_user_id
    AND effectiveness_score IS NOT NULL
    AND created_at > NOW() - INTERVAL '30 days';
  
  -- Quantas ferramentas diferentes o usuário já usou
  SELECT COUNT(DISTINCT tool)
  INTO v_tools_used
  FROM (
    SELECT unnest(completed_steps) as tool
    FROM clara_roadmaps
    WHERE user_id = p_user_id
  ) t;
  
  -- Cálculo do nível (1-10)
  -- Base: 3, +1 por cada 5 sessões, +1 por cada 0.2 de effectiveness média, +1 por cada 3 ferramentas
  v_new_level := LEAST(10, GREATEST(1,
    3 + 
    (v_total_sessions / 5) +
    ((COALESCE(v_avg_effectiveness, 0) * 5)::INTEGER) +
    (v_tools_used / 3)
  ));
  
  -- Atualizar preferências
  UPDATE user_session_preferences
  SET sophistication_level = v_new_level, updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN v_new_level;
END;
$$;