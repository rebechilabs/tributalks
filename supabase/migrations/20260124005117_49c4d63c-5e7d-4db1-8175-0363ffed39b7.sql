-- Regras de identificação de créditos recuperáveis
CREATE TABLE public.credit_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code TEXT NOT NULL UNIQUE,
  rule_name TEXT NOT NULL,
  description TEXT,
  tax_type TEXT NOT NULL,
  trigger_conditions JSONB NOT NULL,
  calculation_formula TEXT,
  confidence_level TEXT DEFAULT 'medium',
  legal_basis TEXT,
  recovery_window_years INT DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créditos identificados por análise
CREATE TABLE public.identified_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  xml_import_id UUID REFERENCES public.xml_imports(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.credit_rules(id),
  nfe_key TEXT,
  nfe_number TEXT,
  nfe_date DATE,
  supplier_cnpj TEXT,
  supplier_name TEXT,
  original_tax_value DECIMAL(15,2) DEFAULT 0,
  credit_not_used DECIMAL(15,2) DEFAULT 0,
  potential_recovery DECIMAL(15,2) DEFAULT 0,
  ncm_code TEXT,
  product_description TEXT,
  cfop TEXT,
  cst TEXT,
  confidence_score INT DEFAULT 0,
  confidence_level TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'identified',
  validated_by UUID,
  validated_at TIMESTAMPTZ,
  accountant_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumo consolidado por período
CREATE TABLE public.credit_analysis_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  analysis_date DATE DEFAULT CURRENT_DATE,
  period_start DATE,
  period_end DATE,
  pis_cofins_potential DECIMAL(15,2) DEFAULT 0,
  icms_potential DECIMAL(15,2) DEFAULT 0,
  icms_st_potential DECIMAL(15,2) DEFAULT 0,
  ipi_potential DECIMAL(15,2) DEFAULT 0,
  high_confidence_total DECIMAL(15,2) DEFAULT 0,
  medium_confidence_total DECIMAL(15,2) DEFAULT 0,
  low_confidence_total DECIMAL(15,2) DEFAULT 0,
  total_potential DECIMAL(15,2) DEFAULT 0,
  total_xmls_analyzed INT DEFAULT 0,
  credits_found_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_identified_credits_user_id ON public.identified_credits(user_id);
CREATE INDEX idx_identified_credits_confidence ON public.identified_credits(confidence_level);
CREATE INDEX idx_identified_credits_status ON public.identified_credits(status);
CREATE INDEX idx_credit_analysis_summary_user_id ON public.credit_analysis_summary(user_id);

-- Enable RLS
ALTER TABLE public.credit_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identified_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_analysis_summary ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para credit_rules (leitura pública, escrita admin)
CREATE POLICY "Credit rules are readable by authenticated users" 
ON public.credit_rules FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage credit rules" 
ON public.credit_rules FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Políticas RLS para identified_credits
CREATE POLICY "Users can view own identified credits" 
ON public.identified_credits FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own identified credits" 
ON public.identified_credits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own identified credits" 
ON public.identified_credits FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own identified credits" 
ON public.identified_credits FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para credit_analysis_summary
CREATE POLICY "Users can view own credit summaries" 
ON public.credit_analysis_summary FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit summaries" 
ON public.credit_analysis_summary FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own credit summaries" 
ON public.credit_analysis_summary FOR DELETE 
USING (auth.uid() = user_id);

-- Inserir regras iniciais de crédito
INSERT INTO public.credit_rules (rule_code, rule_name, description, tax_type, trigger_conditions, confidence_level, legal_basis) VALUES
('PIS_COFINS_001', 'Crédito PIS/COFINS não escriturado',
 'CST indica direito a crédito mas valor não foi aproveitado',
 'PIS/COFINS',
 '{"cst_in": ["50","51","52","53","54","55","56"], "credit_value_equals": 0}',
 'high',
 'Lei 10.637/02, Lei 10.833/03'),

('PIS_COFINS_002', 'Insumo sem crédito',
 'Compra de insumo para produção sem aproveitamento de crédito',
 'PIS/COFINS',
 '{"cfop_in": ["1101","1102","2101","2102"], "cst_in": ["70","71","72","73"]}',
 'medium',
 'Lei 10.637/02 Art. 3º'),

('PIS_COFINS_003', 'Energia elétrica industrial',
 'Crédito de energia elétrica para estabelecimento industrial',
 'PIS/COFINS',
 '{"cfop_in": ["1253","2253"], "activity_type": "industrial"}',
 'high',
 'Lei 10.637/02 Art. 3º, IX'),

('ICMS_001', 'ICMS não aproveitado em compra interestadual',
 'Compra interestadual com ICMS destacado não creditado',
 'ICMS',
 '{"cfop_starts": ["2"], "icms_value_gt": 0, "credit_icms_equals": 0}',
 'high',
 'LC 87/96 Art. 20'),

('ICMS_ST_001', 'ICMS-ST com MVA superior ao preço real',
 'Base de cálculo presumida maior que preço efetivo de venda',
 'ICMS-ST',
 '{"has_icms_st": true, "requires_sale_price_comparison": true}',
 'low',
 'LC 87/96 Art. 10'),

('IPI_001', 'Crédito IPI em insumo',
 'IPI de matéria-prima não creditado',
 'IPI',
 '{"has_ipi": true, "cfop_in": ["1101","2101"], "buyer_is_industrial": true}',
 'high',
 'RIPI Art. 225');