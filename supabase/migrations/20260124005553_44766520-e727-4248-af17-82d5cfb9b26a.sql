-- Tabela principal de DREs
CREATE TABLE public.company_dre (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- Período
  period_type TEXT NOT NULL DEFAULT 'monthly',
  period_month INT,
  period_quarter INT,
  period_year INT NOT NULL,

  -- RECEITAS (dados simples do usuário)
  input_vendas_produtos DECIMAL(15,2) DEFAULT 0,
  input_vendas_servicos DECIMAL(15,2) DEFAULT 0,
  input_outras_receitas DECIMAL(15,2) DEFAULT 0,
  input_devolucoes DECIMAL(15,2) DEFAULT 0,
  input_descontos_concedidos DECIMAL(15,2) DEFAULT 0,

  -- CUSTOS (dados simples)
  input_custo_mercadorias DECIMAL(15,2) DEFAULT 0,
  input_custo_materiais DECIMAL(15,2) DEFAULT 0,
  input_custo_mao_obra_direta DECIMAL(15,2) DEFAULT 0,
  input_custo_servicos_terceiros DECIMAL(15,2) DEFAULT 0,

  -- DESPESAS OPERACIONAIS (linguagem simples)
  input_salarios_encargos DECIMAL(15,2) DEFAULT 0,
  input_prolabore DECIMAL(15,2) DEFAULT 0,
  input_aluguel DECIMAL(15,2) DEFAULT 0,
  input_energia_agua_internet DECIMAL(15,2) DEFAULT 0,
  input_marketing_publicidade DECIMAL(15,2) DEFAULT 0,
  input_software_assinaturas DECIMAL(15,2) DEFAULT 0,
  input_contador_juridico DECIMAL(15,2) DEFAULT 0,
  input_viagens_refeicoes DECIMAL(15,2) DEFAULT 0,
  input_manutencao_equipamentos DECIMAL(15,2) DEFAULT 0,
  input_frete_logistica DECIMAL(15,2) DEFAULT 0,
  input_outras_despesas DECIMAL(15,2) DEFAULT 0,

  -- FINANCEIRO
  input_juros_pagos DECIMAL(15,2) DEFAULT 0,
  input_juros_recebidos DECIMAL(15,2) DEFAULT 0,
  input_tarifas_bancarias DECIMAL(15,2) DEFAULT 0,
  input_multas_pagas DECIMAL(15,2) DEFAULT 0,

  -- IMPOSTOS
  input_impostos_sobre_vendas DECIMAL(15,2) DEFAULT 0,
  input_regime_tributario TEXT DEFAULT 'presumido',
  input_calcular_impostos_auto BOOLEAN DEFAULT true,

  -- CAMPOS CALCULADOS (DRE FORMAL)
  calc_receita_bruta DECIMAL(15,2) DEFAULT 0,
  calc_deducoes_receita DECIMAL(15,2) DEFAULT 0,
  calc_receita_liquida DECIMAL(15,2) DEFAULT 0,
  calc_custo_produtos_vendidos DECIMAL(15,2) DEFAULT 0,
  calc_lucro_bruto DECIMAL(15,2) DEFAULT 0,
  calc_margem_bruta DECIMAL(5,2) DEFAULT 0,
  calc_despesas_operacionais_total DECIMAL(15,2) DEFAULT 0,
  calc_resultado_operacional DECIMAL(15,2) DEFAULT 0,
  calc_margem_operacional DECIMAL(5,2) DEFAULT 0,
  calc_resultado_financeiro DECIMAL(15,2) DEFAULT 0,
  calc_resultado_antes_ir DECIMAL(15,2) DEFAULT 0,
  calc_impostos_sobre_lucro DECIMAL(15,2) DEFAULT 0,
  calc_lucro_liquido DECIMAL(15,2) DEFAULT 0,
  calc_margem_liquida DECIMAL(5,2) DEFAULT 0,
  calc_ebitda DECIMAL(15,2) DEFAULT 0,
  calc_ebitda_margin DECIMAL(5,2) DEFAULT 0,
  calc_ponto_equilibrio DECIMAL(15,2) DEFAULT 0,

  -- DIAGNÓSTICO
  health_score INT DEFAULT 0,
  health_status TEXT DEFAULT 'pending',
  diagnostics JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,

  -- COMPARATIVO REFORMA
  reforma_impostos_atuais DECIMAL(15,2) DEFAULT 0,
  reforma_impostos_novos DECIMAL(15,2) DEFAULT 0,
  reforma_impacto_lucro DECIMAL(15,2) DEFAULT 0,
  reforma_impacto_percentual DECIMAL(5,2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Benchmarks por setor
CREATE TABLE public.sector_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnae_code TEXT NOT NULL,
  cnae_description TEXT,
  sector_name TEXT NOT NULL,
  company_size TEXT DEFAULT 'small',
  avg_margem_bruta DECIMAL(5,2) DEFAULT 0,
  avg_margem_operacional DECIMAL(5,2) DEFAULT 0,
  avg_margem_liquida DECIMAL(5,2) DEFAULT 0,
  avg_ebitda_margin DECIMAL(5,2) DEFAULT 0,
  typical_custo_folha_percent DECIMAL(5,2) DEFAULT 0,
  typical_custo_aluguel_percent DECIMAL(5,2) DEFAULT 0,
  source TEXT,
  year INT DEFAULT 2024,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_company_dre_user_id ON public.company_dre(user_id);
CREATE INDEX idx_company_dre_period ON public.company_dre(period_year, period_month);
CREATE INDEX idx_sector_benchmarks_cnae ON public.sector_benchmarks(cnae_code);

-- Enable RLS
ALTER TABLE public.company_dre ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sector_benchmarks ENABLE ROW LEVEL SECURITY;

-- RLS para company_dre
CREATE POLICY "Users can view own DREs" ON public.company_dre 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own DREs" ON public.company_dre 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own DREs" ON public.company_dre 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own DREs" ON public.company_dre 
FOR DELETE USING (auth.uid() = user_id);

-- RLS para sector_benchmarks (leitura pública)
CREATE POLICY "Benchmarks are readable by authenticated" ON public.sector_benchmarks 
FOR SELECT USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_company_dre_updated_at
  BEFORE UPDATE ON public.company_dre
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir benchmarks iniciais
INSERT INTO public.sector_benchmarks (cnae_code, cnae_description, sector_name, company_size,
  avg_margem_bruta, avg_margem_operacional, avg_margem_liquida, avg_ebitda_margin,
  typical_custo_folha_percent, typical_custo_aluguel_percent, source, year) VALUES
('4751-2', 'Comércio varejista de equipamentos de informática', 'Varejo Tech', 'small', 25.0, 8.0, 5.0, 10.0, 15.0, 8.0, 'SEBRAE', 2024),
('6201-5', 'Desenvolvimento de programas de computador', 'Tecnologia', 'small', 65.0, 25.0, 18.0, 28.0, 45.0, 5.0, 'SEBRAE', 2024),
('5611-2', 'Restaurantes e similares', 'Alimentação', 'small', 35.0, 10.0, 5.0, 12.0, 30.0, 12.0, 'SEBRAE', 2024),
('4781-4', 'Comércio varejista de artigos de vestuário', 'Moda', 'small', 50.0, 12.0, 6.0, 14.0, 18.0, 10.0, 'SEBRAE', 2024),
('6911-7', 'Atividades jurídicas', 'Serviços Profissionais', 'small', 70.0, 30.0, 22.0, 32.0, 40.0, 8.0, 'SEBRAE', 2024),
('4711-3', 'Comércio varejista - minimercados', 'Varejo Alimentar', 'small', 22.0, 5.0, 3.0, 7.0, 20.0, 6.0, 'SEBRAE', 2024),
('4530-7', 'Comércio de peças automotivas', 'Autopeças', 'small', 28.0, 10.0, 6.0, 12.0, 18.0, 7.0, 'SEBRAE', 2024),
('8630-5', 'Atividade médica ambulatorial', 'Saúde', 'small', 55.0, 20.0, 15.0, 25.0, 35.0, 10.0, 'SEBRAE', 2024),
('8599-6', 'Atividades de ensino', 'Educação', 'small', 60.0, 18.0, 12.0, 22.0, 50.0, 12.0, 'SEBRAE', 2024),
('4520-0', 'Manutenção de veículos automotores', 'Serviços Automotivos', 'small', 45.0, 15.0, 10.0, 18.0, 30.0, 8.0, 'SEBRAE', 2024);