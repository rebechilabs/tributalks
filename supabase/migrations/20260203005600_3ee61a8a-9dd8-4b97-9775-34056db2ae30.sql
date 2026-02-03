-- =====================================================
-- KNOWLEDGE GRAPH TRIBUTÁRIO - Estrutura de Dados
-- =====================================================

-- Tipos de nós do grafo
CREATE TYPE public.kg_node_type AS ENUM (
  'ncm',           -- Código NCM de produto
  'nbs',           -- Código NBS de serviço
  'cfop',          -- Código de operação fiscal
  'regime',        -- Regime tributário (Simples, LP, LR)
  'beneficio',     -- Benefício fiscal
  'tributo',       -- Tipo de tributo (ICMS, IPI, PIS, etc)
  'fornecedor',    -- Fornecedor
  'estado',        -- UF
  'setor',         -- Setor econômico
  'aliquota'       -- Faixa de alíquota
);

-- Tipos de relacionamentos
CREATE TYPE public.kg_edge_type AS ENUM (
  'tributado_por',        -- NCM → Tributo
  'tem_beneficio',        -- NCM/Setor → Benefício
  'aplica_em',            -- Benefício → Estado/Regime
  'fornece',              -- Fornecedor → NCM
  'opera_com',            -- Fornecedor → CFOP
  'gera_credito',         -- CFOP → Tributo
  'impacta',              -- Benefício → Alíquota
  'pertence_a',           -- NCM → Setor
  'substitui',            -- Tributo antigo → Tributo novo (reforma)
  'depende_de',           -- Entidade → Entidade
  'conflita_com'          -- Benefício → Benefício
);

-- Tabela de nós do grafo
CREATE TABLE public.tax_knowledge_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type public.kg_node_type NOT NULL,
  code text NOT NULL, -- NCM, CFOP, UF, etc
  label text NOT NULL,
  description text,
  properties jsonb DEFAULT '{}'::jsonb, -- Propriedades específicas do tipo
  valid_from date DEFAULT CURRENT_DATE,
  valid_until date, -- NULL = vigente
  source text, -- Origem da informação (LC 214, Convênio, etc)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(node_type, code)
);

-- Tabela de arestas (relacionamentos)
CREATE TABLE public.tax_knowledge_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edge_type public.kg_edge_type NOT NULL,
  source_node_id uuid NOT NULL REFERENCES public.tax_knowledge_nodes(id) ON DELETE CASCADE,
  target_node_id uuid NOT NULL REFERENCES public.tax_knowledge_nodes(id) ON DELETE CASCADE,
  weight numeric DEFAULT 1.0, -- Força da relação (0-1)
  properties jsonb DEFAULT '{}'::jsonb, -- Metadados (alíquota, redução, etc)
  valid_from date DEFAULT CURRENT_DATE,
  valid_until date,
  source text,
  created_at timestamptz DEFAULT now(),
  
  -- Evita duplicatas
  UNIQUE(edge_type, source_node_id, target_node_id)
);

-- Tabela de impactos da reforma (cache de análise)
CREATE TABLE public.tax_reform_impacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  node_id uuid REFERENCES public.tax_knowledge_nodes(id),
  impact_type text NOT NULL, -- 'benefit_loss', 'rate_change', 'credit_gain'
  current_value numeric,
  projected_value numeric,
  delta_value numeric,
  effective_date date,
  analysis_date timestamptz DEFAULT now(),
  details jsonb DEFAULT '{}'::jsonb,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_kg_nodes_type ON public.tax_knowledge_nodes(node_type);
CREATE INDEX idx_kg_nodes_code ON public.tax_knowledge_nodes(code);
CREATE INDEX idx_kg_edges_source ON public.tax_knowledge_edges(source_node_id);
CREATE INDEX idx_kg_edges_target ON public.tax_knowledge_edges(target_node_id);
CREATE INDEX idx_kg_edges_type ON public.tax_knowledge_edges(edge_type);
CREATE INDEX idx_reform_impacts_user ON public.tax_reform_impacts(user_id);

-- RLS
ALTER TABLE public.tax_knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_knowledge_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_reform_impacts ENABLE ROW LEVEL SECURITY;

-- Nós e arestas são públicos para leitura (dados legislativos)
CREATE POLICY "Nodes are publicly readable"
  ON public.tax_knowledge_nodes FOR SELECT
  USING (true);

CREATE POLICY "Edges are publicly readable"
  ON public.tax_knowledge_edges FOR SELECT
  USING (true);

-- Apenas admins podem modificar o grafo
CREATE POLICY "Only admins can modify nodes"
  ON public.tax_knowledge_nodes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can modify edges"
  ON public.tax_knowledge_edges FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Impactos são privados por usuário
CREATE POLICY "Users can view own impacts"
  ON public.tax_reform_impacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own impacts"
  ON public.tax_reform_impacts FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNÇÕES DE TRAVERSAL DO GRAFO
-- =====================================================

-- Busca relacionamentos diretos de um nó
CREATE OR REPLACE FUNCTION public.get_node_relationships(
  p_node_code text,
  p_node_type public.kg_node_type,
  p_direction text DEFAULT 'both', -- 'outgoing', 'incoming', 'both'
  p_edge_types public.kg_edge_type[] DEFAULT NULL
)
RETURNS TABLE(
  relationship_id uuid,
  edge_type public.kg_edge_type,
  direction text,
  related_node_id uuid,
  related_node_type public.kg_node_type,
  related_node_code text,
  related_node_label text,
  weight numeric,
  properties jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH source_node AS (
    SELECT id FROM tax_knowledge_nodes 
    WHERE code = p_node_code AND node_type = p_node_type
    LIMIT 1
  )
  SELECT 
    e.id as relationship_id,
    e.edge_type,
    CASE WHEN e.source_node_id = sn.id THEN 'outgoing' ELSE 'incoming' END as direction,
    CASE WHEN e.source_node_id = sn.id THEN e.target_node_id ELSE e.source_node_id END as related_node_id,
    n.node_type as related_node_type,
    n.code as related_node_code,
    n.label as related_node_label,
    e.weight,
    e.properties
  FROM source_node sn
  JOIN tax_knowledge_edges e ON (
    (p_direction IN ('outgoing', 'both') AND e.source_node_id = sn.id)
    OR (p_direction IN ('incoming', 'both') AND e.target_node_id = sn.id)
  )
  JOIN tax_knowledge_nodes n ON n.id = CASE 
    WHEN e.source_node_id = sn.id THEN e.target_node_id 
    ELSE e.source_node_id 
  END
  WHERE (e.valid_until IS NULL OR e.valid_until > CURRENT_DATE)
    AND (n.valid_until IS NULL OR n.valid_until > CURRENT_DATE)
    AND (p_edge_types IS NULL OR e.edge_type = ANY(p_edge_types));
END;
$$;

-- Análise de impacto em cascata (BFS no grafo)
CREATE OR REPLACE FUNCTION public.analyze_cascade_impact(
  p_start_node_code text,
  p_start_node_type public.kg_node_type,
  p_max_depth integer DEFAULT 3
)
RETURNS TABLE(
  depth integer,
  path text[],
  node_id uuid,
  node_type public.kg_node_type,
  node_code text,
  node_label text,
  impact_weight numeric,
  edge_chain public.kg_edge_type[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE cascade AS (
    -- Nó inicial
    SELECT 
      0 as depth,
      ARRAY[n.code] as path,
      n.id as node_id,
      n.node_type,
      n.code as node_code,
      n.label as node_label,
      1.0::numeric as impact_weight,
      ARRAY[]::public.kg_edge_type[] as edge_chain
    FROM tax_knowledge_nodes n
    WHERE n.code = p_start_node_code AND n.node_type = p_start_node_type
    
    UNION ALL
    
    -- Expande recursivamente
    SELECT 
      c.depth + 1,
      c.path || n.code,
      n.id,
      n.node_type,
      n.code,
      n.label,
      c.impact_weight * e.weight,
      c.edge_chain || e.edge_type
    FROM cascade c
    JOIN tax_knowledge_edges e ON e.source_node_id = c.node_id
    JOIN tax_knowledge_nodes n ON n.id = e.target_node_id
    WHERE c.depth < p_max_depth
      AND NOT (n.code = ANY(c.path)) -- Evita ciclos
      AND (e.valid_until IS NULL OR e.valid_until > CURRENT_DATE)
      AND (n.valid_until IS NULL OR n.valid_until > CURRENT_DATE)
  )
  SELECT * FROM cascade
  WHERE depth > 0 -- Exclui nó inicial
  ORDER BY depth, impact_weight DESC;
END;
$$;

-- Busca caminhos entre dois nós
CREATE OR REPLACE FUNCTION public.find_relationship_path(
  p_from_code text,
  p_from_type public.kg_node_type,
  p_to_code text,
  p_to_type public.kg_node_type,
  p_max_depth integer DEFAULT 4
)
RETURNS TABLE(
  path_length integer,
  node_path text[],
  edge_path public.kg_edge_type[],
  total_weight numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE pathfinder AS (
    SELECT 
      0 as depth,
      ARRAY[n.code] as node_path,
      ARRAY[]::public.kg_edge_type[] as edge_path,
      1.0::numeric as total_weight,
      n.id as current_node_id
    FROM tax_knowledge_nodes n
    WHERE n.code = p_from_code AND n.node_type = p_from_type
    
    UNION ALL
    
    SELECT 
      pf.depth + 1,
      pf.node_path || n.code,
      pf.edge_path || e.edge_type,
      pf.total_weight * e.weight,
      n.id
    FROM pathfinder pf
    JOIN tax_knowledge_edges e ON e.source_node_id = pf.current_node_id
    JOIN tax_knowledge_nodes n ON n.id = e.target_node_id
    WHERE pf.depth < p_max_depth
      AND NOT (n.code = ANY(pf.node_path))
      AND (e.valid_until IS NULL OR e.valid_until > CURRENT_DATE)
  )
  SELECT 
    pf.depth,
    pf.node_path,
    pf.edge_path,
    pf.total_weight
  FROM pathfinder pf
  JOIN tax_knowledge_nodes target ON target.code = p_to_code AND target.node_type = p_to_type
  WHERE pf.current_node_id = target.id
  ORDER BY pf.depth, pf.total_weight DESC
  LIMIT 5;
END;
$$;

-- Seed inicial com dados estruturais da reforma
INSERT INTO public.tax_knowledge_nodes (node_type, code, label, description, properties, source) VALUES
-- Tributos
('tributo', 'ICMS', 'ICMS', 'Imposto sobre Circulação de Mercadorias e Serviços', '{"esfera": "estadual", "tipo": "indireto"}', 'CF/88'),
('tributo', 'IPI', 'IPI', 'Imposto sobre Produtos Industrializados', '{"esfera": "federal", "tipo": "indireto"}', 'CF/88'),
('tributo', 'PIS', 'PIS', 'Programa de Integração Social', '{"esfera": "federal", "tipo": "contribuicao"}', 'CF/88'),
('tributo', 'COFINS', 'COFINS', 'Contribuição para Financiamento da Seguridade Social', '{"esfera": "federal", "tipo": "contribuicao"}', 'CF/88'),
('tributo', 'ISS', 'ISS', 'Imposto Sobre Serviços', '{"esfera": "municipal", "tipo": "indireto"}', 'CF/88'),
('tributo', 'CBS', 'CBS', 'Contribuição sobre Bens e Serviços', '{"esfera": "federal", "tipo": "iva_dual", "aliquota_base": 8.8}', 'LC 214/2025'),
('tributo', 'IBS', 'IBS', 'Imposto sobre Bens e Serviços', '{"esfera": "estadual_municipal", "tipo": "iva_dual", "aliquota_base": 17.7}', 'LC 214/2025'),
('tributo', 'IS', 'IS', 'Imposto Seletivo', '{"esfera": "federal", "tipo": "seletivo", "finalidade": "extrafiscal"}', 'LC 214/2025'),

-- Regimes tributários
('regime', 'SIMPLES', 'Simples Nacional', 'Regime unificado para ME e EPP', '{"limite_anual": 4800000}', 'LC 123/2006'),
('regime', 'SIMPLES_HIBRIDO', 'Simples Híbrido', 'Simples com apuração separada IBS/CBS', '{"credito_transferivel": true}', 'LC 214/2025'),
('regime', 'LUCRO_PRESUMIDO', 'Lucro Presumido', 'Regime de presunção de lucro', '{"limite_anual": 78000000}', 'Lei 9.718/98'),
('regime', 'LUCRO_REAL', 'Lucro Real', 'Regime de apuração pelo lucro efetivo', '{"credito_integral": true}', 'Lei 9.718/98'),

-- Setores com tratamento diferenciado
('setor', 'SAUDE', 'Saúde', 'Serviços e produtos de saúde', '{"reducao_aliquota": 0.6}', 'LC 214/2025'),
('setor', 'EDUCACAO', 'Educação', 'Serviços educacionais', '{"reducao_aliquota": 0.6}', 'LC 214/2025'),
('setor', 'TRANSPORTE', 'Transporte Público', 'Transporte coletivo de passageiros', '{"reducao_aliquota": 0.6}', 'LC 214/2025'),
('setor', 'AGRO', 'Agropecuária', 'Produção agropecuária', '{"reducao_aliquota": 0.6}', 'LC 214/2025'),
('setor', 'CESTA_BASICA', 'Cesta Básica', 'Produtos da cesta básica nacional', '{"aliquota_zero": true}', 'LC 214/2025');

-- Relacionamentos de substituição (reforma)
INSERT INTO public.tax_knowledge_edges (edge_type, source_node_id, target_node_id, weight, properties, source)
SELECT 
  'substitui'::public.kg_edge_type,
  s.id,
  t.id,
  1.0,
  '{"transicao_inicio": "2026-01-01", "transicao_fim": "2033-01-01"}'::jsonb,
  'LC 214/2025'
FROM tax_knowledge_nodes s, tax_knowledge_nodes t
WHERE (s.code = 'PIS' AND t.code = 'CBS')
   OR (s.code = 'COFINS' AND t.code = 'CBS')
   OR (s.code = 'ICMS' AND t.code = 'IBS')
   OR (s.code = 'ISS' AND t.code = 'IBS');

-- Setores com benefícios
INSERT INTO public.tax_knowledge_edges (edge_type, source_node_id, target_node_id, weight, properties, source)
SELECT 
  'tem_beneficio'::public.kg_edge_type,
  setor.id,
  tributo.id,
  0.6, -- 60% de redução
  '{"tipo_beneficio": "reducao_aliquota", "percentual": 60}'::jsonb,
  'LC 214/2025'
FROM tax_knowledge_nodes setor, tax_knowledge_nodes tributo
WHERE setor.node_type = 'setor' 
  AND setor.code IN ('SAUDE', 'EDUCACAO', 'TRANSPORTE', 'AGRO')
  AND tributo.code IN ('CBS', 'IBS');

-- Cesta básica com alíquota zero
INSERT INTO public.tax_knowledge_edges (edge_type, source_node_id, target_node_id, weight, properties, source)
SELECT 
  'tem_beneficio'::public.kg_edge_type,
  setor.id,
  tributo.id,
  0.0, -- Alíquota zero
  '{"tipo_beneficio": "aliquota_zero", "percentual": 100}'::jsonb,
  'LC 214/2025'
FROM tax_knowledge_nodes setor, tax_knowledge_nodes tributo
WHERE setor.code = 'CESTA_BASICA'
  AND tributo.code IN ('CBS', 'IBS');
