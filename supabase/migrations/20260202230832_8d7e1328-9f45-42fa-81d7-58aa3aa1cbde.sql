-- ============================================
-- ARQUITETURA AI-FIRST: MEMÓRIA + FEEDBACK + INSIGHTS
-- (Embeddings serão adicionados incrementalmente)
-- ============================================

-- 1. MEMÓRIA DE LONGO PRAZO POR EMPRESA
-- Clara lembra decisões, contexto e preferências
CREATE TABLE public.clara_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  memory_type text NOT NULL DEFAULT 'context', -- 'context', 'decision', 'preference', 'insight'
  category text NOT NULL DEFAULT 'geral', -- 'fiscal', 'reforma', 'dre', 'creditos', etc.
  content text NOT NULL,
  importance integer NOT NULL DEFAULT 5, -- 1-10, usado para priorizar recall
  source_screen text, -- de onde veio essa memória
  source_conversation_id uuid, -- conversa que gerou
  metadata jsonb DEFAULT '{}'::jsonb,
  expires_at timestamptz, -- algumas memórias são temporárias
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_clara_memory_user ON public.clara_memory(user_id);
CREATE INDEX idx_clara_memory_type ON public.clara_memory(memory_type);
CREATE INDEX idx_clara_memory_category ON public.clara_memory(category);
CREATE INDEX idx_clara_memory_importance ON public.clara_memory(importance DESC);

ALTER TABLE public.clara_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memories"
  ON public.clara_memory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage memories"
  ON public.clara_memory FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 2. HISTÓRICO DE CONVERSAS (para contexto contínuo)
CREATE TABLE public.clara_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id text NOT NULL, -- agrupa mensagens da mesma sessão
  role text NOT NULL, -- 'user' ou 'assistant'
  content text NOT NULL,
  screen_context text, -- tela onde a conversa aconteceu
  tools_used text[], -- ferramentas que Clara usou
  tokens_used integer DEFAULT 0,
  model_used text DEFAULT 'gemini-3-flash',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_clara_conversations_user ON public.clara_conversations(user_id);
CREATE INDEX idx_clara_conversations_session ON public.clara_conversations(session_id);
CREATE INDEX idx_clara_conversations_created ON public.clara_conversations(created_at DESC);

ALTER TABLE public.clara_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON public.clara_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.clara_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage conversations"
  ON public.clara_conversations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 3. FEEDBACK PARA APRENDIZADO FUTURO
-- Base para fine-tuning quando escalar
CREATE TABLE public.clara_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  conversation_id uuid,
  message_content text NOT NULL, -- a pergunta do usuário
  response_content text NOT NULL, -- a resposta da Clara
  rating text NOT NULL, -- 'positive', 'negative', 'neutral'
  feedback_text text, -- comentário opcional do usuário
  category text, -- 'precisao', 'clareza', 'utilidade', 'tom'
  context_screen text,
  model_used text,
  metadata jsonb DEFAULT '{}'::jsonb,
  reviewed_at timestamptz, -- para revisão manual
  reviewed_by uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_clara_feedback_user ON public.clara_feedback(user_id);
CREATE INDEX idx_clara_feedback_rating ON public.clara_feedback(rating);
CREATE INDEX idx_clara_feedback_created ON public.clara_feedback(created_at DESC);

ALTER TABLE public.clara_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON public.clara_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON public.clara_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage feedback"
  ON public.clara_feedback FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 4. INSIGHTS PROATIVOS (Clara detecta e sugere)
CREATE TABLE public.clara_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  insight_type text NOT NULL, -- 'alert', 'recommendation', 'opportunity', 'risk'
  priority text NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  title text NOT NULL,
  description text NOT NULL,
  action_cta text, -- texto do botão de ação
  action_route text, -- rota para onde direcionar
  source_data jsonb, -- dados que geraram o insight
  trigger_condition text, -- condição que disparou
  dismissed_at timestamptz,
  acted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_clara_insights_user ON public.clara_insights(user_id);
CREATE INDEX idx_clara_insights_type ON public.clara_insights(insight_type);
CREATE INDEX idx_clara_insights_priority ON public.clara_insights(priority);
CREATE INDEX idx_clara_insights_active ON public.clara_insights(user_id) 
  WHERE dismissed_at IS NULL AND acted_at IS NULL;

ALTER TABLE public.clara_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
  ON public.clara_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON public.clara_insights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage insights"
  ON public.clara_insights FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 5. FUNÇÃO PARA OBTER ÚLTIMAS CONVERSAS DO USUÁRIO
CREATE OR REPLACE FUNCTION public.get_recent_conversations(
  p_user_id uuid,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  session_id text,
  role text,
  content text,
  screen_context text,
  created_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id,
    c.session_id,
    c.role,
    c.content,
    c.screen_context,
    c.created_at
  FROM clara_conversations c
  WHERE c.user_id = p_user_id
  ORDER BY c.created_at DESC
  LIMIT p_limit;
$$;

-- 6. FUNÇÃO PARA BUSCAR MEMÓRIAS POR CATEGORIA
CREATE OR REPLACE FUNCTION public.get_user_memories(
  p_user_id uuid,
  p_category text DEFAULT NULL,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  memory_type text,
  category text,
  content text,
  importance integer,
  source_screen text,
  created_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    m.id,
    m.memory_type,
    m.category,
    m.content,
    m.importance,
    m.source_screen,
    m.created_at
  FROM clara_memory m
  WHERE m.user_id = p_user_id
    AND (m.expires_at IS NULL OR m.expires_at > now())
    AND (p_category IS NULL OR m.category = p_category)
  ORDER BY m.importance DESC, m.created_at DESC
  LIMIT p_limit;
$$;