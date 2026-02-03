-- ============================================
-- CLARA AI-FIRST: Sistema de Agentes Especializados
-- ============================================

-- 1. Expandir clara_memory para padrões aprendidos
ALTER TABLE public.clara_memory 
ADD COLUMN IF NOT EXISTS learned_pattern jsonb DEFAULT null,
ADD COLUMN IF NOT EXISTS decision_context text DEFAULT null,
ADD COLUMN IF NOT EXISTS confidence_score numeric DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS times_reinforced integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_used_at timestamptz DEFAULT null;

-- 2. Tabela de Agentes Especializados
CREATE TABLE IF NOT EXISTS public.clara_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type text NOT NULL CHECK (agent_type IN ('fiscal', 'margin', 'compliance', 'orchestrator')),
  name text NOT NULL,
  description text,
  capabilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  priority_rules jsonb DEFAULT '[]'::jsonb,
  trigger_conditions jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'testing')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inserir agentes padrão
INSERT INTO public.clara_agents (agent_type, name, description, capabilities, priority_rules, trigger_conditions) VALUES
('orchestrator', 'Clara Central', 'Orquestradora principal que coordena os agentes especializados', 
  '["route_queries", "aggregate_insights", "manage_context", "coordinate_actions"]'::jsonb,
  '["user_explicit_request", "urgent_alerts", "scheduled_actions"]'::jsonb,
  '[]'::jsonb
),
('fiscal', 'Agente Fiscal', 'Especialista em créditos, NCM, compliance tributário e obrigações acessórias',
  '["analyze_credits", "validate_ncm", "check_compliance", "monitor_deadlines", "review_dctf", "analyze_sped"]'::jsonb,
  '["credit_recovery", "compliance_risk", "deadline_proximity"]'::jsonb,
  '["xml_imported", "dctf_uploaded", "sped_uploaded", "score_below_threshold"]'::jsonb
),
('margin', 'Agente Margem', 'Especialista em DRE, pricing, margem de contribuição e análise de fornecedores',
  '["analyze_dre", "simulate_pricing", "monitor_margin", "evaluate_suppliers", "forecast_cashflow"]'::jsonb,
  '["margin_erosion", "pricing_opportunity", "supplier_risk"]'::jsonb,
  '["dre_updated", "margin_drop_detected", "price_change_detected"]'::jsonb
),
('compliance', 'Agente Compliance', 'Especialista em prazos, obrigações da reforma e adequação regulatória',
  '["track_deadlines", "monitor_reform_changes", "assess_readiness", "generate_checklists", "alert_expirations"]'::jsonb,
  '["deadline_imminent", "law_change", "certification_expiry"]'::jsonb,
  '["deadline_approaching", "reform_news_published", "benefit_expiring"]'::jsonb
)
ON CONFLICT DO NOTHING;

-- 3. Tabela de Ações Autônomas
CREATE TABLE IF NOT EXISTS public.clara_autonomous_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agent_id uuid REFERENCES public.clara_agents(id),
  agent_type text NOT NULL,
  action_type text NOT NULL,
  trigger_event text NOT NULL,
  trigger_data jsonb DEFAULT '{}'::jsonb,
  action_payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'executed', 'rejected', 'failed')),
  requires_approval boolean DEFAULT false,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  executed_at timestamptz,
  result jsonb,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- 4. Tabela de Decisões do Usuário (para aprendizado)
CREATE TABLE IF NOT EXISTS public.clara_user_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  decision_type text NOT NULL,
  context jsonb NOT NULL,
  options_presented jsonb,
  option_chosen text,
  outcome_feedback text CHECK (outcome_feedback IN ('positive', 'negative', 'neutral', null)),
  agent_type text,
  created_at timestamptz DEFAULT now()
);

-- 5. Tabela de Padrões Aprendidos (agregado por usuário)
CREATE TABLE IF NOT EXISTS public.clara_learned_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pattern_type text NOT NULL,
  pattern_key text NOT NULL,
  pattern_value jsonb NOT NULL,
  confidence numeric DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  times_observed integer DEFAULT 1,
  last_observed_at timestamptz DEFAULT now(),
  decay_rate numeric DEFAULT 0.1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, pattern_type, pattern_key)
);

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_autonomous_actions_user_status ON public.clara_autonomous_actions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_autonomous_actions_priority ON public.clara_autonomous_actions(priority, created_at);
CREATE INDEX IF NOT EXISTS idx_user_decisions_user ON public.clara_user_decisions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_learned_patterns_user ON public.clara_learned_patterns(user_id, pattern_type);
CREATE INDEX IF NOT EXISTS idx_clara_memory_learned ON public.clara_memory(user_id, memory_type) WHERE learned_pattern IS NOT NULL;

-- 7. RLS Policies para novas tabelas
ALTER TABLE public.clara_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clara_autonomous_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clara_user_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clara_learned_patterns ENABLE ROW LEVEL SECURITY;

-- Agents são públicos para leitura
CREATE POLICY "Authenticated can read agents" ON public.clara_agents
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Autonomous actions - usuário vê e gerencia as suas
CREATE POLICY "Users can view own autonomous actions" ON public.clara_autonomous_actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own autonomous actions" ON public.clara_autonomous_actions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage autonomous actions" ON public.clara_autonomous_actions
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- User decisions - usuário vê as suas
CREATE POLICY "Users can view own decisions" ON public.clara_user_decisions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decisions" ON public.clara_user_decisions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage decisions" ON public.clara_user_decisions
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Learned patterns - usuário vê os seus
CREATE POLICY "Users can view own patterns" ON public.clara_learned_patterns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage patterns" ON public.clara_learned_patterns
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 8. Função para registrar e aprender com decisões
CREATE OR REPLACE FUNCTION public.record_user_decision(
  p_user_id uuid,
  p_decision_type text,
  p_context jsonb,
  p_options jsonb DEFAULT null,
  p_chosen text DEFAULT null,
  p_agent_type text DEFAULT null
) RETURNS uuid AS $$
DECLARE
  v_decision_id uuid;
  v_pattern_key text;
BEGIN
  -- Registra a decisão
  INSERT INTO public.clara_user_decisions (user_id, decision_type, context, options_presented, option_chosen, agent_type)
  VALUES (p_user_id, p_decision_type, p_context, p_options, p_chosen, p_agent_type)
  RETURNING id INTO v_decision_id;
  
  -- Atualiza ou cria padrão aprendido
  v_pattern_key := p_decision_type || ':' || COALESCE(p_chosen, 'no_choice');
  
  INSERT INTO public.clara_learned_patterns (user_id, pattern_type, pattern_key, pattern_value, times_observed, last_observed_at)
  VALUES (p_user_id, 'decision', v_pattern_key, p_context, 1, now())
  ON CONFLICT (user_id, pattern_type, pattern_key) 
  DO UPDATE SET 
    times_observed = clara_learned_patterns.times_observed + 1,
    confidence = LEAST(0.95, clara_learned_patterns.confidence + 0.05),
    last_observed_at = now(),
    updated_at = now();
  
  RETURN v_decision_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Função para buscar padrões relevantes do usuário
CREATE OR REPLACE FUNCTION public.get_user_patterns(
  p_user_id uuid,
  p_pattern_type text DEFAULT null,
  p_min_confidence numeric DEFAULT 0.3,
  p_limit integer DEFAULT 50
) RETURNS TABLE (
  pattern_type text,
  pattern_key text,
  pattern_value jsonb,
  confidence numeric,
  times_observed integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lp.pattern_type,
    lp.pattern_key,
    lp.pattern_value,
    lp.confidence,
    lp.times_observed
  FROM public.clara_learned_patterns lp
  WHERE lp.user_id = p_user_id
    AND lp.confidence >= p_min_confidence
    AND (p_pattern_type IS NULL OR lp.pattern_type = p_pattern_type)
  ORDER BY lp.confidence DESC, lp.times_observed DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. Função para criar ação autônoma
CREATE OR REPLACE FUNCTION public.create_autonomous_action(
  p_user_id uuid,
  p_agent_type text,
  p_action_type text,
  p_trigger_event text,
  p_trigger_data jsonb,
  p_action_payload jsonb,
  p_requires_approval boolean DEFAULT false,
  p_priority text DEFAULT 'medium'
) RETURNS uuid AS $$
DECLARE
  v_action_id uuid;
  v_agent_id uuid;
BEGIN
  -- Busca o agent_id
  SELECT id INTO v_agent_id FROM public.clara_agents WHERE agent_type = p_agent_type LIMIT 1;
  
  INSERT INTO public.clara_autonomous_actions (
    user_id, agent_id, agent_type, action_type, trigger_event, 
    trigger_data, action_payload, requires_approval, priority
  )
  VALUES (
    p_user_id, v_agent_id, p_agent_type, p_action_type, p_trigger_event,
    p_trigger_data, p_action_payload, p_requires_approval, p_priority
  )
  RETURNING id INTO v_action_id;
  
  RETURN v_action_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;