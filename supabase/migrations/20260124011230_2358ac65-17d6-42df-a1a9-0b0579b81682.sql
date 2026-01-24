-- Tabela principal do Score Tributário
CREATE TABLE public.tax_score (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Score geral (0-1000)
  score_total INT DEFAULT 0,
  score_grade TEXT DEFAULT 'E',
  score_status TEXT DEFAULT 'pending',
  
  -- Scores por dimensão (0-100 cada)
  score_conformidade INT DEFAULT 0,
  score_eficiencia INT DEFAULT 0,
  score_risco INT DEFAULT 0,
  score_documentacao INT DEFAULT 0,
  score_gestao INT DEFAULT 0,
  
  -- Respostas manuais dos cards
  resp_situacao_fiscal TEXT,
  resp_certidoes TEXT,
  resp_obrigacoes TEXT,
  resp_controles TEXT,
  
  -- Dados automáticos (snapshot)
  auto_regime_tributario TEXT,
  auto_xmls_importados INT DEFAULT 0,
  auto_xmls_periodo_inicio DATE,
  auto_xmls_periodo_fim DATE,
  auto_dre_preenchido BOOLEAN DEFAULT false,
  auto_creditos_identificados DECIMAL(15,2) DEFAULT 0,
  auto_comparativo_realizado BOOLEAN DEFAULT false,
  
  -- Impacto financeiro calculado
  economia_potencial DECIMAL(15,2) DEFAULT 0,
  risco_autuacao DECIMAL(15,2) DEFAULT 0,
  creditos_nao_aproveitados DECIMAL(15,2) DEFAULT 0,
  
  -- Progresso
  cards_completos INT DEFAULT 0,
  cards_total INT DEFAULT 8,
  
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de histórico de scores
CREATE TABLE public.tax_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  score_total INT NOT NULL,
  score_grade TEXT NOT NULL,
  score_conformidade INT,
  score_eficiencia INT,
  score_risco INT,
  score_documentacao INT,
  score_gestao INT,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de ações recomendadas
CREATE TABLE public.score_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_code TEXT NOT NULL,
  action_title TEXT NOT NULL,
  action_description TEXT,
  points_gain INT DEFAULT 0,
  economia_estimada DECIMAL(15,2) DEFAULT 0,
  priority INT DEFAULT 3,
  status TEXT DEFAULT 'pending',
  link_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tax_score_user ON public.tax_score(user_id);
CREATE INDEX idx_tax_score_history_user ON public.tax_score_history(user_id);
CREATE INDEX idx_score_actions_user_status ON public.score_actions(user_id, status);

-- RLS tax_score
ALTER TABLE public.tax_score ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tax score" 
ON public.tax_score FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tax score" 
ON public.tax_score FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tax score" 
ON public.tax_score FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tax score" 
ON public.tax_score FOR DELETE 
USING (auth.uid() = user_id);

-- RLS tax_score_history
ALTER TABLE public.tax_score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own score history" 
ON public.tax_score_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own score history" 
ON public.tax_score_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own score history" 
ON public.tax_score_history FOR DELETE 
USING (auth.uid() = user_id);

-- RLS score_actions
ALTER TABLE public.score_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own score actions" 
ON public.score_actions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own score actions" 
ON public.score_actions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own score actions" 
ON public.score_actions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own score actions" 
ON public.score_actions FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_tax_score_updated_at
BEFORE UPDATE ON public.tax_score
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();