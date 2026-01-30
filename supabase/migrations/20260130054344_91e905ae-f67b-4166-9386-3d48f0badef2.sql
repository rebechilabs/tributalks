-- =============================================
-- SUÍTE MARGEM ATIVA 2026 - SCHEMA COMPLETO
-- =============================================

-- Tabela 1: suppliers (Consolidação de Fornecedores)
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cnpj TEXT NOT NULL,
  razao_social TEXT,
  regime_tributario TEXT DEFAULT 'desconhecido' CHECK (regime_tributario IN ('simples', 'presumido', 'real', 'mei', 'desconhecido')),
  regime_confianca TEXT DEFAULT 'low' CHECK (regime_confianca IN ('high', 'medium', 'low')),
  total_compras_12m NUMERIC DEFAULT 0,
  qtd_notas_12m INTEGER DEFAULT 0,
  ncms_frequentes TEXT[] DEFAULT '{}',
  uf TEXT,
  municipio TEXT,
  cnae_principal TEXT,
  aliquota_credito_estimada NUMERIC DEFAULT 0,
  custo_efetivo_score INTEGER DEFAULT 50 CHECK (custo_efetivo_score >= 0 AND custo_efetivo_score <= 100),
  classificacao TEXT DEFAULT 'pendente' CHECK (classificacao IN ('manter', 'renegociar', 'substituir', 'pendente')),
  ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_user_supplier UNIQUE (user_id, cnpj)
);

-- Tabela 2: supplier_analysis (Análise Detalhada por Fornecedor)
CREATE TABLE public.supplier_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  valor_nominal_total NUMERIC DEFAULT 0,
  valor_tributos_pagos NUMERIC DEFAULT 0,
  credito_aproveitado_atual NUMERIC DEFAULT 0,
  credito_potencial_2026 NUMERIC DEFAULT 0,
  gap_credito NUMERIC DEFAULT 0,
  custo_efetivo_liquido NUMERIC DEFAULT 0,
  preco_indiferenca NUMERIC DEFAULT 0,
  recomendacao TEXT DEFAULT 'pendente' CHECK (recomendacao IN ('manter', 'renegociar_5', 'renegociar_10', 'renegociar_15', 'renegociar_20', 'substituir', 'pendente')),
  notas_analise TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'analisado', 'acao_tomada', 'descartado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela 3: margin_dashboard (Consolidação Executiva)
CREATE TABLE public.margin_dashboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  periodo_referencia DATE NOT NULL,
  -- OMC-AI (Compras)
  total_compras_analisado NUMERIC DEFAULT 0,
  gap_credito_total NUMERIC DEFAULT 0,
  economia_potencial_renegociacao NUMERIC DEFAULT 0,
  fornecedores_criticos INTEGER DEFAULT 0,
  fornecedores_analisados INTEGER DEFAULT 0,
  -- PriceGuard (Vendas)
  skus_simulados INTEGER DEFAULT 0,
  variacao_media_preco NUMERIC DEFAULT 0,
  gap_competitivo_medio NUMERIC DEFAULT 0,
  risco_perda_margem NUMERIC DEFAULT 0,
  -- Consolidado
  impacto_ebitda_anual_min NUMERIC DEFAULT 0,
  impacto_ebitda_anual_max NUMERIC DEFAULT 0,
  score_prontidao INTEGER DEFAULT 0 CHECK (score_prontidao >= 0 AND score_prontidao <= 100),
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_user_periodo UNIQUE (user_id, periodo_referencia)
);

-- Adicionar campos faltantes na tabela price_simulations existente
ALTER TABLE public.price_simulations 
ADD COLUMN IF NOT EXISTS uf TEXT DEFAULT 'SP',
ADD COLUMN IF NOT EXISTS municipio_codigo INTEGER,
ADD COLUMN IF NOT EXISTS municipio_nome TEXT;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.margin_dashboard ENABLE ROW LEVEL SECURITY;

-- Suppliers policies
CREATE POLICY "Users can view own suppliers" ON public.suppliers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suppliers" ON public.suppliers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suppliers" ON public.suppliers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own suppliers" ON public.suppliers
  FOR DELETE USING (auth.uid() = user_id);

-- Supplier Analysis policies
CREATE POLICY "Users can view own supplier analysis" ON public.supplier_analysis
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own supplier analysis" ON public.supplier_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supplier analysis" ON public.supplier_analysis
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own supplier analysis" ON public.supplier_analysis
  FOR DELETE USING (auth.uid() = user_id);

-- Margin Dashboard policies
CREATE POLICY "Users can view own margin dashboard" ON public.margin_dashboard
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own margin dashboard" ON public.margin_dashboard
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own margin dashboard" ON public.margin_dashboard
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own margin dashboard" ON public.margin_dashboard
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_suppliers_user_id ON public.suppliers(user_id);
CREATE INDEX idx_suppliers_cnpj ON public.suppliers(cnpj);
CREATE INDEX idx_suppliers_classificacao ON public.suppliers(classificacao);
CREATE INDEX idx_supplier_analysis_user_id ON public.supplier_analysis(user_id);
CREATE INDEX idx_supplier_analysis_supplier_id ON public.supplier_analysis(supplier_id);
CREATE INDEX idx_supplier_analysis_status ON public.supplier_analysis(status);
CREATE INDEX idx_margin_dashboard_user_id ON public.margin_dashboard(user_id);
CREATE INDEX idx_margin_dashboard_periodo ON public.margin_dashboard(periodo_referencia);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_supplier_analysis_updated_at
  BEFORE UPDATE ON public.supplier_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_margin_dashboard_updated_at
  BEFORE UPDATE ON public.margin_dashboard
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();