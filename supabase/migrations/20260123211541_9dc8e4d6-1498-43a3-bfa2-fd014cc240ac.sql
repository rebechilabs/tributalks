-- =====================================================
-- TABELA: noticias_tributarias
-- Feed de notícias tributárias atualizadas por IA
-- =====================================================
CREATE TABLE noticias_tributarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados da fonte
  fonte TEXT NOT NULL,
  fonte_url TEXT,
  titulo_original TEXT NOT NULL,
  conteudo_original TEXT,
  data_publicacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Classificação (gerada por IA)
  relevancia TEXT CHECK (relevancia IN ('ALTA', 'MEDIA', 'BAIXA')) DEFAULT 'MEDIA',
  categoria TEXT CHECK (categoria IN ('LEGISLACAO', 'DECISAO_JUDICIAL', 'ANALISE', 'NOTICIA')) DEFAULT 'NOTICIA',
  
  -- Filtros (gerados por IA)
  setores_afetados TEXT[] DEFAULT '{}',
  regimes_afetados TEXT[] DEFAULT '{}',
  tributos_relacionados TEXT[] DEFAULT '{}',
  
  -- Conteúdo enriquecido (gerado por IA)
  resumo_executivo TEXT,
  o_que_muda TEXT,
  quem_e_afetado TEXT,
  acao_recomendada TEXT,
  
  -- Metadata
  publicado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_noticias_data ON noticias_tributarias(data_publicacao DESC);
CREATE INDEX idx_noticias_relevancia ON noticias_tributarias(relevancia);
CREATE INDEX idx_noticias_publicado ON noticias_tributarias(publicado);
CREATE INDEX idx_noticias_setores ON noticias_tributarias USING GIN(setores_afetados);
CREATE INDEX idx_noticias_regimes ON noticias_tributarias USING GIN(regimes_afetados);

-- RLS - Notícias são públicas para leitura (por usuários autenticados)
ALTER TABLE noticias_tributarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view published news" ON noticias_tributarias
  FOR SELECT
  TO authenticated
  USING (publicado = true);

-- =====================================================
-- TABELA: alertas_configuracao (só Premium)
-- Configuração de alertas personalizados por e-mail
-- =====================================================
CREATE TABLE alertas_configuracao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  ativo BOOLEAN DEFAULT true,
  setores_filtro TEXT[] DEFAULT '{}',
  regimes_filtro TEXT[] DEFAULT '{}',
  relevancia_minima TEXT DEFAULT 'MEDIA' CHECK (relevancia_minima IN ('ALTA', 'MEDIA', 'BAIXA')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Índice
CREATE INDEX idx_alertas_user ON alertas_configuracao(user_id);

-- RLS
ALTER TABLE alertas_configuracao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alert config" ON alertas_configuracao
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alert config" ON alertas_configuracao
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alert config" ON alertas_configuracao
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER alertas_configuracao_updated_at
  BEFORE UPDATE ON alertas_configuracao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SEED: Inserir algumas notícias de exemplo
-- =====================================================
INSERT INTO noticias_tributarias (
  fonte, fonte_url, titulo_original, relevancia, categoria,
  setores_afetados, regimes_afetados, tributos_relacionados,
  resumo_executivo, o_que_muda, quem_e_afetado, acao_recomendada,
  publicado, data_publicacao
) VALUES
(
  'Receita Federal',
  'https://www.gov.br/receitafederal',
  'Receita publica IN sobre Split Payment',
  'ALTA',
  'LEGISLACAO',
  ARRAY['Serviços', 'Comércio', 'Indústria'],
  ARRAY['PRESUMIDO', 'REAL'],
  ARRAY['IBS', 'CBS'],
  'A Instrução Normativa regulamenta a retenção automática de tributos no momento do pagamento para empresas do Lucro Real e Presumido, com vigência a partir de janeiro de 2027.',
  'Tributos serão retidos automaticamente nas vendas para PJ. Alíquota de retenção: 28% (IBS + CBS). Prazo de adaptação: até 31/12/2026.',
  'Empresas do Lucro Presumido e Lucro Real. Vendas para pessoas jurídicas (B2B). Todos os setores.',
  '1. Revisar projeção de fluxo de caixa para 2027. 2. Simular impacto usando a calculadora de Split Payment. 3. Avaliar necessidade de capital de giro adicional.',
  true,
  NOW() - INTERVAL '2 hours'
),
(
  'STJ',
  'https://www.stj.jus.br',
  'STJ decide sobre creditamento de PIS/COFINS',
  'MEDIA',
  'DECISAO_JUDICIAL',
  ARRAY['Indústria', 'Serviços'],
  ARRAY['REAL'],
  ARRAY['PIS', 'COFINS'],
  'Decisão favorável aos contribuintes amplia conceito de insumos para fins de creditamento de PIS e COFINS.',
  'O conceito de insumo foi ampliado, permitindo o creditamento de mais itens. Empresas podem revisar seus créditos dos últimos 5 anos.',
  'Empresas do Lucro Real que utilizam créditos de PIS/COFINS. Principalmente indústrias e prestadores de serviços.',
  '1. Revisar os insumos utilizados na atividade. 2. Verificar possibilidade de recuperação de créditos. 3. Consultar especialista tributário.',
  true,
  NOW() - INTERVAL '5 hours'
),
(
  'Confaz',
  'https://www.confaz.fazenda.gov.br',
  'Confaz publica novos convênios de ICMS',
  'BAIXA',
  'LEGISLACAO',
  ARRAY['Comércio'],
  ARRAY['SIMPLES', 'PRESUMIDO', 'REAL'],
  ARRAY['ICMS'],
  'Alterações em benefícios fiscais para operações interestaduais de produtos eletrônicos.',
  'Novos convênios alteram alíquotas de ICMS para operações interestaduais. Benefícios para estados do Norte e Nordeste.',
  'Empresas que realizam vendas interestaduais. Comércio de produtos eletrônicos.',
  '1. Verificar impacto nas operações interestaduais. 2. Atualizar sistemas de faturamento se necessário.',
  true,
  NOW() - INTERVAL '8 hours'
);