-- Atualizar check constraint para permitir novos tipos de agentes
ALTER TABLE public.clara_agents DROP CONSTRAINT IF EXISTS clara_agents_agent_type_check;
ALTER TABLE public.clara_agents ADD CONSTRAINT clara_agents_agent_type_check 
  CHECK (agent_type IN ('orchestrator', 'fiscal', 'margin', 'compliance', 'onboarding', 'support', 'upgrade'));

-- Inserir novos agentes (Onboarding + Suporte)
INSERT INTO public.clara_agents (agent_type, name, description, capabilities, trigger_conditions, status)
VALUES 
(
  'onboarding',
  'Agente Onboarding',
  'Recebe novos usuários, configura perfil e cria plano personalizado de ferramentas',
  '["profile_setup", "smart_prefill", "tool_recommendation", "guided_walkthrough"]',
  '["user_first_login", "welcome_page", "profile_incomplete"]',
  'active'
),
(
  'support',
  'Agente Suporte',
  'Ajuda durante preenchimento de formulários e explica resultados',
  '["form_assistance", "result_explanation", "field_validation", "contextual_tips"]',
  '["form_focus", "help_button", "result_generated", "user_stuck"]',
  'active'
);

-- Inserir PLAN_RESPONSES como dados dinâmicos
INSERT INTO public.clara_prompt_configs (config_key, config_type, content, priority) VALUES
(
  'plan_response:FREE',
  'plan_response',
  '{"greeting": "Oi! Para conversar comigo e explorar todas as ferramentas, você precisa de um plano ativo.", "cta": "upgrade", "tools": [], "message": "Que tal conhecer nossos planos? Posso te ajudar a escolher o melhor para sua empresa!"}',
  0
),
(
  'plan_response:STARTER',
  'plan_response',
  '{"greeting": "Oi! Vou te ajudar a entender sua situação tributária.", "tools": ["score", "rtc", "split", "comparativo"], "cnpjs": 1, "simulations": 5, "message": "Comece pelo Score Tributário para ter uma visão geral da sua empresa!"}',
  10
),
(
  'plan_response:NAVIGATOR',
  'plan_response',
  '{"greeting": "Ótimo! Você tem acesso a ferramentas avançadas de análise.", "tools": ["score", "rtc", "split", "comparativo", "dre", "checklist", "timeline"], "cnpjs": 3, "phases": ["diagnostico", "analise", "planejamento"], "message": "Vamos começar seu diagnóstico completo!"}',
  20
),
(
  'plan_response:PROFESSIONAL',
  'plan_response',
  '{"greeting": "Perfeito! Você tem acesso completo às ferramentas profissionais.", "tools": ["score", "rtc", "split", "comparativo", "dre", "checklist", "timeline", "radar", "margem", "nexus", "omc"], "cnpjs": 6, "workflows": true, "nexus": true, "message": "O NEXUS é seu centro de comando - vamos começar por lá!"}',
  30
),
(
  'plan_response:ENTERPRISE',
  'plan_response',
  '{"greeting": "Excelente! Você tem acesso Enterprise com recursos exclusivos.", "tools": ["score", "rtc", "split", "comparativo", "dre", "checklist", "timeline", "radar", "margem", "nexus", "omc", "executive"], "cnpjs": "unlimited", "workflows": true, "nexus": true, "legal_access": true, "multi_cnpj": true, "message": "Sua equipe tem acesso a todos os recursos. Vamos configurar!"}',
  40
);