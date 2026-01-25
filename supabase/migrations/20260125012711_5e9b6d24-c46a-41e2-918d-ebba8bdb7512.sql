-- Pílulas diárias da reforma tributária
CREATE TABLE public.pilulas_reforma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(100) NOT NULL,
  conteudo TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('fato', 'conceito', 'prazo', 'dica', 'alerta')) DEFAULT 'dica',
  data_exibicao DATE, -- NULL = rotação automática
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Prazos do calendário da reforma 2026-2033
CREATE TABLE public.prazos_reforma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  data_prazo DATE NOT NULL,
  tipo TEXT CHECK (tipo IN ('obrigacao', 'transicao', 'extincao', 'inicio')) DEFAULT 'transicao',
  afeta_regimes TEXT[] DEFAULT '{}',
  afeta_setores TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pilulas_reforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prazos_reforma ENABLE ROW LEVEL SECURITY;

-- Pílulas: leitura pública para autenticados, admin gerencia
CREATE POLICY "Authenticated users can view active pilulas"
ON public.pilulas_reforma FOR SELECT
USING (ativo = true);

CREATE POLICY "Admins can manage pilulas"
ON public.pilulas_reforma FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Prazos: leitura pública para autenticados, admin gerencia
CREATE POLICY "Authenticated users can view active prazos"
ON public.prazos_reforma FOR SELECT
USING (ativo = true);

CREATE POLICY "Admins can manage prazos"
ON public.prazos_reforma FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para updated_at nas pílulas
CREATE TRIGGER update_pilulas_reforma_updated_at
BEFORE UPDATE ON public.pilulas_reforma
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais: pílulas de exemplo
INSERT INTO public.pilulas_reforma (titulo, conteudo, tipo, data_exibicao, ativo) VALUES
('CBS substitui PIS/COFINS', 'A partir de 2027, a Contribuição sobre Bens e Serviços (CBS) substituirá PIS e COFINS com alíquota unificada de 8,8%.', 'fato', NULL, true),
('Split Payment obrigatório', 'O Split Payment será obrigatório para operações B2B, dividindo automaticamente o valor do imposto no momento do pagamento.', 'conceito', NULL, true),
('Crédito amplo e imediato', 'Diferente do modelo atual, todos os créditos de CBS/IBS serão amplos e apropriados imediatamente, sem restrições setoriais.', 'dica', NULL, true),
('Transição até 2033', 'ICMS e ISS serão extintos gradualmente entre 2029 e 2032, com coexistência dos sistemas durante a transição.', 'prazo', NULL, true),
('Imposto Seletivo', 'Produtos prejudiciais à saúde e meio ambiente terão alíquotas adicionais do Imposto Seletivo (IS) sobre CBS/IBS.', 'alerta', NULL, true);

-- Inserir dados iniciais: prazos da reforma
INSERT INTO public.prazos_reforma (titulo, descricao, data_prazo, tipo, afeta_regimes, afeta_setores, ativo) VALUES
('Início da fase de testes CBS/IBS', 'Período de adaptação com alíquota de teste de 0,9% para CBS e 0,1% para IBS.', '2026-01-01', 'inicio', ARRAY['simples', 'presumido', 'real'], ARRAY['comercio', 'servicos', 'industria'], true),
('CBS entra em vigor', 'Contribuição sobre Bens e Serviços substitui PIS/COFINS com alíquota de 8,8%.', '2027-01-01', 'transicao', ARRAY['presumido', 'real'], ARRAY['comercio', 'servicos', 'industria'], true),
('Início da transição ICMS/ISS', 'Começa a redução gradual de ICMS e ISS com entrada proporcional do IBS.', '2029-01-01', 'transicao', ARRAY['simples', 'presumido', 'real'], ARRAY['comercio', 'servicos', 'industria'], true),
('Extinção completa ICMS/ISS', 'ICMS e ISS são completamente extintos. IBS assume 100% da tributação estadual/municipal.', '2033-01-01', 'extincao', ARRAY['simples', 'presumido', 'real'], ARRAY['comercio', 'servicos', 'industria'], true),
('Obrigatoriedade Split Payment B2B', 'Todas as operações B2B devem utilizar Split Payment para recolhimento automático de CBS/IBS.', '2027-07-01', 'obrigacao', ARRAY['presumido', 'real'], ARRAY['comercio', 'industria'], true),
('Adaptação ERP obrigatória', 'Sistemas fiscais devem estar adaptados para emissão com novos campos de CBS/IBS.', '2026-07-01', 'obrigacao', ARRAY['simples', 'presumido', 'real'], ARRAY['comercio', 'servicos', 'industria'], true);