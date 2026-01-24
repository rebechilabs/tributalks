-- =====================================================
-- PERFIL COMPLETO DA EMPRESA
-- =====================================================

CREATE TABLE public.company_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- IDENTIFICAÇÃO
  cnpj_principal TEXT,
  razao_social TEXT,
  nome_fantasia TEXT,
  
  -- CLASSIFICAÇÃO DO NEGÓCIO
  cnae_principal TEXT,
  cnae_secundarios TEXT[] DEFAULT '{}',
  descricao_atividade TEXT,
  
  -- SETOR (seleção simples)
  setor TEXT, -- 'tecnologia', 'industria', 'comercio', 'servicos', 'saude', 'agro'
  segmento TEXT,
  
  -- PORTE
  porte TEXT, -- 'mei', 'micro', 'pequena', 'media', 'grande'
  faturamento_anual DECIMAL(15,2),
  faturamento_mensal_medio DECIMAL(15,2),
  num_funcionarios INT,
  
  -- ESTRUTURA SOCIETÁRIA
  qtd_cnpjs INT DEFAULT 1,
  cnpjs_grupo TEXT[] DEFAULT '{}',
  tem_filiais BOOLEAN DEFAULT false,
  qtd_filiais INT DEFAULT 0,
  tem_holding BOOLEAN DEFAULT false,
  tipo_societario TEXT,
  
  -- REGIME TRIBUTÁRIO
  regime_tributario TEXT, -- 'simples', 'presumido', 'real', 'misto'
  regimes_no_grupo TEXT[] DEFAULT '{}',
  
  -- OPERAÇÕES DE VENDA
  vende_produtos BOOLEAN DEFAULT false,
  vende_servicos BOOLEAN DEFAULT false,
  percentual_produtos DECIMAL(5,2) DEFAULT 0,
  percentual_servicos DECIMAL(5,2) DEFAULT 0,
  
  -- TIPOS DE CLIENTE
  vende_pf BOOLEAN DEFAULT false,
  vende_pj BOOLEAN DEFAULT false,
  vende_governo BOOLEAN DEFAULT false,
  percentual_pf DECIMAL(5,2) DEFAULT 0,
  percentual_pj DECIMAL(5,2) DEFAULT 0,
  percentual_governo DECIMAL(5,2) DEFAULT 0,
  
  -- OPERAÇÕES ESPECIAIS
  exporta_produtos BOOLEAN DEFAULT false,
  exporta_servicos BOOLEAN DEFAULT false,
  importa_produtos BOOLEAN DEFAULT false,
  importa_insumos BOOLEAN DEFAULT false,
  percentual_exportacao DECIMAL(5,2) DEFAULT 0,
  percentual_importacao DECIMAL(5,2) DEFAULT 0,
  
  -- CANAIS DE VENDA
  tem_loja_fisica BOOLEAN DEFAULT false,
  tem_ecommerce BOOLEAN DEFAULT false,
  tem_marketplace BOOLEAN DEFAULT false,
  vende_whatsapp_social BOOLEAN DEFAULT false,
  
  -- LOCALIZAÇÃO E ABRANGÊNCIA
  uf_sede TEXT,
  municipio_sede TEXT,
  opera_outros_estados BOOLEAN DEFAULT false,
  ufs_operacao TEXT[] DEFAULT '{}',
  opera_todo_brasil BOOLEAN DEFAULT false,
  
  -- CARACTERÍSTICAS ESPECIAIS
  tem_atividade_pd BOOLEAN DEFAULT false,
  investe_em_inovacao BOOLEAN DEFAULT false,
  tem_patentes BOOLEAN DEFAULT false,
  zona_franca BOOLEAN DEFAULT false,
  area_livre_comercio BOOLEAN DEFAULT false,
  zona_especial TEXT,
  
  -- PRODUTOS ESPECÍFICOS
  vende_combustiveis BOOLEAN DEFAULT false,
  vende_bebidas BOOLEAN DEFAULT false,
  vende_cigarros BOOLEAN DEFAULT false,
  vende_cosmeticos BOOLEAN DEFAULT false,
  vende_farmacos BOOLEAN DEFAULT false,
  vende_automoveis BOOLEAN DEFAULT false,
  vende_autopecas BOOLEAN DEFAULT false,
  vende_pneus BOOLEAN DEFAULT false,
  vende_eletronicos BOOLEAN DEFAULT false,
  tem_produtos_monofasicos BOOLEAN DEFAULT false,
  
  -- ATIVIDADES MISTAS
  tem_atividades_mistas BOOLEAN DEFAULT false,
  atividades_diferentes_tributacao BOOLEAN DEFAULT false,
  
  -- FOLHA DE PAGAMENTO
  folha_mensal DECIMAL(15,2),
  folha_percentual_faturamento DECIMAL(5,2),
  tem_muitos_socios BOOLEAN DEFAULT false,
  
  -- METADATA
  perfil_completo BOOLEAN DEFAULT false,
  etapa_atual INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- =====================================================
-- BASE DE OPORTUNIDADES TRIBUTÁRIAS
-- =====================================================

CREATE TABLE public.tax_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- IDENTIFICAÇÃO
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_simples TEXT NOT NULL,
  description TEXT,
  description_ceo TEXT,
  
  -- CATEGORIZAÇÃO
  category TEXT, -- 'monofasico', 'incentivo', 'isencao', 'reducao', 'credito', 'planejamento', 'regime_especial', 'segregacao'
  subcategory TEXT,
  tipo_tributo TEXT, -- 'federal', 'estadual', 'municipal', 'todos'
  tributos_afetados TEXT[] DEFAULT '{}',
  
  -- CRITÉRIOS DE ELEGIBILIDADE
  criterios JSONB NOT NULL DEFAULT '{}',
  criterios_obrigatorios JSONB DEFAULT '{}',
  criterios_pontuacao JSONB DEFAULT '{}',
  
  -- BENEFÍCIO
  economia_tipo TEXT, -- 'percentual', 'valor_fixo', 'variavel', 'caso_a_caso'
  economia_percentual_min DECIMAL(5,2),
  economia_percentual_max DECIMAL(5,2),
  economia_base TEXT,
  economia_descricao_simples TEXT,
  
  -- IMPLEMENTAÇÃO
  complexidade TEXT, -- 'muito_baixa', 'baixa', 'media', 'alta', 'muito_alta'
  tempo_implementacao TEXT,
  tempo_retorno TEXT,
  requer_contador BOOLEAN DEFAULT true,
  requer_advogado BOOLEAN DEFAULT false,
  requer_sistema BOOLEAN DEFAULT false,
  requer_certificacao BOOLEAN DEFAULT false,
  
  -- RISCO
  risco_fiscal TEXT, -- 'nenhum', 'baixo', 'medio', 'alto'
  risco_descricao TEXT,
  
  -- FUNDAMENTAÇÃO
  base_legal TEXT,
  base_legal_resumo TEXT,
  link_legislacao TEXT,
  validade_ate DATE,
  
  -- EXEMPLOS
  exemplo_pratico TEXT,
  casos_sucesso JSONB DEFAULT '[]',
  faq JSONB DEFAULT '[]',
  
  -- STATUS
  is_active BOOLEAN DEFAULT true,
  destaque BOOLEAN DEFAULT false,
  novo BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- OPORTUNIDADES IDENTIFICADAS POR EMPRESA
-- =====================================================

CREATE TABLE public.company_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.tax_opportunities(id) ON DELETE CASCADE,
  
  -- MATCH
  match_score INT DEFAULT 0,
  match_reasons TEXT[] DEFAULT '{}',
  missing_criteria TEXT[] DEFAULT '{}',
  
  -- ECONOMIA CALCULADA
  economia_mensal_min DECIMAL(15,2) DEFAULT 0,
  economia_mensal_max DECIMAL(15,2) DEFAULT 0,
  economia_anual_min DECIMAL(15,2) DEFAULT 0,
  economia_anual_max DECIMAL(15,2) DEFAULT 0,
  
  -- PRIORIZAÇÃO
  prioridade INT DEFAULT 3,
  quick_win BOOLEAN DEFAULT false,
  alto_impacto BOOLEAN DEFAULT false,
  
  -- STATUS DO USUÁRIO
  status TEXT DEFAULT 'nova', -- 'nova', 'interessado', 'analisando', 'implementando', 'ativa', 'descartada'
  motivo_descarte TEXT,
  
  -- NOTAS
  notas_usuario TEXT,
  notas_contador TEXT,
  
  -- IMPLEMENTAÇÃO
  data_inicio_implementacao DATE,
  data_conclusao DATE,
  economia_real_mensal DECIMAL(15,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, opportunity_id)
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_opportunities ENABLE ROW LEVEL SECURITY;

-- Company Profile
CREATE POLICY "Users can view own profile" ON public.company_profile FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.company_profile FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.company_profile FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON public.company_profile FOR DELETE USING (auth.uid() = user_id);

-- Tax Opportunities (readable by all authenticated)
CREATE POLICY "Opportunities are readable" ON public.tax_opportunities FOR SELECT USING (true);
CREATE POLICY "Only admins can manage opportunities" ON public.tax_opportunities FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Company Opportunities
CREATE POLICY "Users can view own opportunities" ON public.company_opportunities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own opportunities" ON public.company_opportunities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own opportunities" ON public.company_opportunities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own opportunities" ON public.company_opportunities FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_company_profile_user ON public.company_profile(user_id);
CREATE INDEX idx_company_profile_setor ON public.company_profile(setor);
CREATE INDEX idx_company_profile_regime ON public.company_profile(regime_tributario);

CREATE INDEX idx_tax_opp_category ON public.tax_opportunities(category);
CREATE INDEX idx_tax_opp_tributo ON public.tax_opportunities(tipo_tributo);
CREATE INDEX idx_tax_opp_active ON public.tax_opportunities(is_active);
CREATE INDEX idx_tax_opp_criterios ON public.tax_opportunities USING GIN(criterios);

CREATE INDEX idx_company_opp_user ON public.company_opportunities(user_id);
CREATE INDEX idx_company_opp_status ON public.company_opportunities(status);
CREATE INDEX idx_company_opp_prioridade ON public.company_opportunities(prioridade);

-- =====================================================
-- TRIGGER UPDATED_AT
-- =====================================================

CREATE TRIGGER update_company_profile_updated_at
BEFORE UPDATE ON public.company_profile
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_opportunities_updated_at
BEFORE UPDATE ON public.tax_opportunities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_opportunities_updated_at
BEFORE UPDATE ON public.company_opportunities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INSERIR OPORTUNIDADES
-- =====================================================

INSERT INTO public.tax_opportunities (code, name, name_simples, description_ceo, category, tipo_tributo, tributos_afetados, criterios, economia_tipo, economia_percentual_min, economia_percentual_max, economia_base, economia_descricao_simples, complexidade, tempo_implementacao, risco_fiscal, base_legal_resumo) VALUES

-- PRODUTOS MONOFÁSICOS
('MONO_001', 
 'PIS/COFINS Monofásico - Combustíveis',
 'Economia em Combustíveis',
 'Se você vende combustíveis, o PIS/COFINS já foi pago na refinaria. Muitas empresas pagam de novo por erro. Você pode estar pagando imposto duplicado.',
 'monofasico', 'federal', ARRAY['PIS', 'COFINS'],
 '{"vende_combustiveis": true}',
 'percentual', 3.00, 9.25, 'faturamento_combustiveis',
 'Economia de 3% a 9% no faturamento de combustíveis',
 'baixa', '1-2 semanas', 'nenhum',
 'Lei 10.147/00 - Tributação concentrada na origem'),

('MONO_002',
 'PIS/COFINS Monofásico - Bebidas Frias',
 'Economia em Bebidas',
 'Cervejas, refrigerantes e águas têm PIS/COFINS pago pela indústria. Se você revende, não precisa pagar de novo. Muitos supermercados e bares pagam errado.',
 'monofasico', 'federal', ARRAY['PIS', 'COFINS'],
 '{"vende_bebidas": true, "setor_in": ["comercio", "alimentacao"]}',
 'percentual', 3.00, 9.25, 'faturamento_bebidas',
 'Economia de 3% a 9% no faturamento de bebidas',
 'baixa', '1-2 semanas', 'nenhum',
 'Lei 10.833/03 Art. 58-A a 58-U'),

('MONO_003',
 'PIS/COFINS Monofásico - Cosméticos e Higiene',
 'Economia em Cosméticos',
 'Perfumes, maquiagem, xampus e produtos de higiene têm tributação na indústria. Farmácias e lojas de cosméticos frequentemente pagam imposto duplicado.',
 'monofasico', 'federal', ARRAY['PIS', 'COFINS'],
 '{"vende_cosmeticos": true}',
 'percentual', 3.00, 9.25, 'faturamento_cosmeticos',
 'Economia de 3% a 9% no faturamento de cosméticos',
 'baixa', '1-2 semanas', 'nenhum',
 'Lei 10.147/00'),

('MONO_004',
 'PIS/COFINS Monofásico - Farmacêuticos',
 'Economia em Medicamentos',
 'Medicamentos têm PIS/COFINS pago pelos laboratórios. Farmácias e distribuidores não precisam pagar novamente na revenda.',
 'monofasico', 'federal', ARRAY['PIS', 'COFINS'],
 '{"vende_farmacos": true}',
 'percentual', 2.10, 9.90, 'faturamento_farmacos',
 'Economia de 2% a 10% no faturamento de medicamentos',
 'baixa', '1-2 semanas', 'nenhum',
 'Lei 10.147/00 - Lista positiva/negativa'),

('MONO_005',
 'PIS/COFINS Monofásico - Autopeças',
 'Economia em Autopeças',
 'Peças automotivas têm tributação concentrada. Lojas de autopeças e oficinas podem estar pagando imposto a mais.',
 'monofasico', 'federal', ARRAY['PIS', 'COFINS'],
 '{"vende_autopecas": true}',
 'percentual', 1.65, 7.60, 'faturamento_autopecas',
 'Economia de 1,6% a 7,6% no faturamento de autopeças',
 'baixa', '1-2 semanas', 'nenhum',
 'Lei 10.485/02'),

('MONO_006',
 'PIS/COFINS Monofásico - Pneus',
 'Economia em Pneus',
 'Pneus novos têm PIS/COFINS recolhido pelo fabricante. Revendedores não precisam tributar novamente.',
 'monofasico', 'federal', ARRAY['PIS', 'COFINS'],
 '{"vende_pneus": true}',
 'percentual', 2.00, 9.50, 'faturamento_pneus',
 'Economia de 2% a 9,5% no faturamento de pneus',
 'baixa', '1-2 semanas', 'nenhum',
 'Lei 10.485/02'),

-- SEGREGAÇÃO DE RECEITAS
('SEGREG_001',
 'Segregação de Receitas - Comércio + Serviço',
 'Separar Vendas de Serviços',
 'Se sua empresa vende produtos E presta serviços, cada um pode ter tributação diferente. Misturar tudo pode fazer você pagar mais imposto.',
 'segregacao', 'todos', ARRAY['PIS', 'COFINS', 'ICMS', 'ISS', 'IRPJ', 'CSLL'],
 '{"tem_atividades_mistas": true, "vende_produtos": true, "vende_servicos": true}',
 'variavel', 5.00, 30.00, 'faturamento_total',
 'Economia de 5% a 30% dependendo do mix de produtos/serviços',
 'media', '1-2 meses', 'baixo',
 'Correta classificação das receitas por natureza'),

('SEGREG_002',
 'Segregação por NCM no Simples',
 'Separar Produtos no Simples',
 'No Simples Nacional, produtos diferentes podem ter alíquotas diferentes. Separar corretamente pode reduzir seu DAS.',
 'segregacao', 'federal', ARRAY['DAS'],
 '{"regime_tributario": "simples", "vende_produtos": true, "tem_produtos_monofasicos": true}',
 'percentual', 2.00, 8.00, 'das',
 'Economia de 2% a 8% no DAS mensal',
 'baixa', '2-4 semanas', 'nenhum',
 'LC 123/06 - Segregação de receitas'),

-- REGIMES ESPECIAIS
('REGIME_001',
 'Simples Nacional - Fator R',
 'Pagar Menos no Simples (Serviços)',
 'Se sua folha de pagamento é alta (mais de 28% do faturamento), você pode pagar menos imposto usando o Fator R. Isso move você para uma tabela mais barata.',
 'regime_especial', 'federal', ARRAY['DAS'],
 '{"regime_tributario": "simples", "vende_servicos": true, "folha_percentual_faturamento_min": 28}',
 'percentual', 15.00, 40.00, 'das_servicos',
 'Economia de 15% a 40% no imposto sobre serviços',
 'baixa', '1 mês', 'nenhum',
 'LC 123/06 - Anexo III vs Anexo V'),

('REGIME_002',
 'Lucro Presumido - Serviços 16%',
 'Base Reduzida para Serviços',
 'Alguns serviços podem usar base de 16% em vez de 32% no Lucro Presumido. Isso corta seu IRPJ/CSLL pela metade.',
 'regime_especial', 'federal', ARRAY['IRPJ', 'CSLL'],
 '{"regime_tributario": "presumido", "vende_servicos": true}',
 'percentual', 40.00, 50.00, 'irpj_csll',
 'Economia de até 50% no IRPJ e CSLL',
 'media', '1-2 meses', 'baixo',
 'RIR/2018 Art. 591 - Serviços hospitalares e transporte'),

('REGIME_003',
 'Equiparação Hospitalar',
 'Clínicas como Hospitais',
 'Clínicas médicas organizadas como sociedade empresária podem ser equiparadas a hospitais e pagar menos imposto.',
 'regime_especial', 'federal', ARRAY['IRPJ', 'CSLL'],
 '{"setor": "saude", "regime_tributario": "presumido"}',
 'percentual', 40.00, 50.00, 'irpj_csll',
 'Economia de até 50% no IRPJ e CSLL',
 'alta', '2-3 meses', 'medio',
 'Lei 9.249/95 Art. 15 §1º III-a'),

-- GRUPOS EMPRESARIAIS
('GRUPO_001',
 'Planejamento Intercompany',
 'Otimizar Impostos do Grupo',
 'Com mais de um CNPJ, você pode organizar as operações entre as empresas para pagar menos imposto no total. É legal e muito usado por grandes empresas.',
 'planejamento', 'todos', ARRAY['IRPJ', 'CSLL', 'PIS', 'COFINS', 'ICMS', 'ISS'],
 '{"qtd_cnpjs_min": 2}',
 'variavel', 10.00, 35.00, 'tributos_grupo',
 'Economia de 10% a 35% nos tributos totais do grupo',
 'alta', '3-6 meses', 'baixo',
 'Planejamento tributário lícito'),

('GRUPO_002',
 'Holding Patrimonial',
 'Proteger e Economizar com Holding',
 'Uma holding pode proteger seu patrimônio e ainda reduzir impostos sobre aluguéis, dividendos e venda de bens.',
 'planejamento', 'federal', ARRAY['IRPJ', 'CSLL', 'ITBI', 'ITCMD'],
 '{"qtd_cnpjs_min": 2, "tem_holding": true}',
 'variavel', 15.00, 40.00, 'rendimentos_patrimoniais',
 'Economia de 15% a 40% em tributação patrimonial',
 'alta', '3-6 meses', 'baixo',
 'Planejamento sucessório e patrimonial'),

('GRUPO_003',
 'Cisão de Atividades',
 'Separar Empresa por Atividade',
 'Às vezes vale a pena separar atividades em CNPJs diferentes. Por exemplo: comércio no Simples e serviços no Presumido.',
 'planejamento', 'todos', ARRAY['DAS', 'IRPJ', 'CSLL', 'PIS', 'COFINS'],
 '{"tem_atividades_mistas": true, "faturamento_anual_min": 1000000}',
 'variavel', 10.00, 30.00, 'tributos_totais',
 'Economia de 10% a 30% nos tributos totais',
 'alta', '2-4 meses', 'baixo',
 'Reorganização societária'),

-- INCENTIVOS FISCAIS
('INCENT_001',
 'Lei do Bem - P&D',
 'Desconto por Investir em Inovação',
 'Se sua empresa desenvolve tecnologia, produtos novos ou melhora processos, você pode deduzir até 100% desses gastos do imposto de renda.',
 'incentivo', 'federal', ARRAY['IRPJ', 'CSLL'],
 '{"tem_atividade_pd": true, "regime_tributario": "real"}',
 'percentual', 20.00, 34.00, 'gastos_pd',
 'Economia de 20% a 34% sobre gastos com P&D',
 'alta', '3-6 meses', 'baixo',
 'Lei 11.196/05 - Incentivos à inovação'),

('INCENT_002',
 'Lei de Informática',
 'Desconto para Fabricantes de Tech',
 'Empresas que fabricam produtos de informática no Brasil podem ter redução de até 80% no IPI.',
 'incentivo', 'federal', ARRAY['IPI'],
 '{"setor": "tecnologia", "vende_eletronicos": true}',
 'percentual', 80.00, 95.00, 'ipi',
 'Redução de até 95% no IPI',
 'alta', '6+ meses', 'baixo',
 'Lei 8.248/91'),

('INCENT_003',
 'SUDENE/SUDAM',
 '75% de Desconto no IRPJ',
 'Empresas no Norte e Nordeste podem ter 75% de redução no IRPJ por até 10 anos.',
 'incentivo', 'federal', ARRAY['IRPJ'],
 '{"uf_in": ["AC","AM","AP","PA","RO","RR","TO","AL","BA","CE","MA","PB","PE","PI","RN","SE"], "regime_tributario": "real"}',
 'percentual', 75.00, 75.00, 'irpj',
 'Redução de 75% no IRPJ',
 'alta', '6+ meses', 'nenhum',
 'Lei 9.532/97'),

-- EXPORTAÇÃO
('EXPORT_001',
 'Isenção ISS Exportação',
 'Zero ISS em Serviços para Exterior',
 'Se você presta serviços para clientes no exterior, não precisa pagar ISS. Muitas empresas pagam por não saber.',
 'isencao', 'municipal', ARRAY['ISS'],
 '{"exporta_servicos": true}',
 'percentual', 100.00, 100.00, 'iss_exportacao',
 'Economia de 100% do ISS sobre exportações',
 'baixa', '1-2 semanas', 'nenhum',
 'LC 116/03 Art. 2º'),

('EXPORT_002',
 'Créditos Acumulados PIS/COFINS',
 'Recuperar Créditos de Exportação',
 'Exportadores acumulam créditos de PIS/COFINS que podem ser ressarcidos em dinheiro ou compensados com outros impostos.',
 'credito', 'federal', ARRAY['PIS', 'COFINS'],
 '{"exporta_produtos": true, "regime_tributario": "real"}',
 'variavel', NULL, NULL, 'creditos_acumulados',
 'Recuperação de créditos acumulados',
 'media', '2-4 meses', 'nenhum',
 'Lei 10.637/02 Art. 5º'),

('EXPORT_003',
 'REINTEGRA',
 'Bônus para Exportadores',
 'Exportadores de produtos industrializados podem receber de volta até 3% do valor exportado.',
 'credito', 'federal', ARRAY['PIS', 'COFINS', 'IPI'],
 '{"exporta_produtos": true, "setor": "industria"}',
 'percentual', 0.10, 3.00, 'faturamento_exportacao',
 'Crédito de 0,1% a 3% sobre exportações',
 'media', '2-3 meses', 'nenhum',
 'Lei 13.043/14');