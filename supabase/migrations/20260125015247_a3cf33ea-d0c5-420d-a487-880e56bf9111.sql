-- Adicionar campos faltantes na tabela prazos_reforma
ALTER TABLE public.prazos_reforma 
ADD COLUMN IF NOT EXISTS base_legal VARCHAR(200),
ADD COLUMN IF NOT EXISTS url_referencia TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Atualizar constraint de tipo para incluir 'prazo_final'
ALTER TABLE public.prazos_reforma 
DROP CONSTRAINT IF EXISTS prazos_reforma_tipo_check;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_prazos_reforma_data_ativo 
ON public.prazos_reforma(data_prazo ASC) 
WHERE ativo = true;

-- Criar trigger para updated_at
CREATE OR REPLACE TRIGGER update_prazos_reforma_updated_at
BEFORE UPDATE ON public.prazos_reforma
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Popular com dados iniciais (só insere se não existirem)
INSERT INTO public.prazos_reforma (titulo, descricao, data_prazo, tipo, afeta_regimes, afeta_setores, base_legal) 
SELECT * FROM (VALUES
  ('Início fase de testes CBS e IBS', 'Alíquotas simbólicas: CBS 0,9% + IBS 0,1%. Período para empresas se adaptarem ao novo sistema.', '2026-01-01'::date, 'inicio', ARRAY['presumido', 'real'], ARRAY['comercio', 'servicos', 'industria'], 'LC 214/2025, Art. 3°'),
  ('Obrigatório destacar CBS/IBS nas NF-e', 'Todas as Notas Fiscais Eletrônicas devem destacar os valores de CBS e IBS, mesmo que simbólicos.', '2026-01-01'::date, 'obrigacao', ARRAY['simples', 'presumido', 'real'], ARRAY['comercio', 'servicos', 'industria'], 'LC 214/2025, Art. 15'),
  ('Split Payment obrigatório para grandes empresas', 'Empresas com faturamento acima de R$ 50M devem implementar split payment nas vendas.', '2026-07-01'::date, 'obrigacao', ARRAY['presumido', 'real'], ARRAY['comercio', 'industria'], 'LC 214/2025, Art. 22'),
  ('Prazo Simples Nacional optar por migração', 'Empresas do Simples Nacional devem decidir se migram para o novo sistema em 2027 ou permanecem no regime atual.', '2026-09-30'::date, 'prazo_final', ARRAY['simples'], ARRAY['comercio', 'servicos', 'industria'], 'LC 214/2025, Art. 45'),
  ('Fim da fase de testes', 'Encerra o período de teste com alíquotas simbólicas. Sistema entra em operação plena em 2027.', '2026-12-31'::date, 'transicao', ARRAY['presumido', 'real'], ARRAY['comercio', 'servicos', 'industria'], 'LC 214/2025'),
  ('CBS entra em vigor com alíquota plena', 'CBS substitui integralmente PIS/COFINS com alíquota de 8,8%.', '2027-01-01'::date, 'inicio', ARRAY['presumido', 'real'], ARRAY['comercio', 'servicos', 'industria'], 'LC 214/2025, Art. 5°'),
  ('Extinção do PIS/COFINS', 'PIS e COFINS deixam de existir para empresas fora do Simples Nacional.', '2027-01-01'::date, 'extincao', ARRAY['presumido', 'real'], ARRAY['comercio', 'servicos', 'industria'], 'LC 214/2025, Art. 6°'),
  ('IBS inicia fase de transição (10%)', 'IBS começa a substituir ICMS e ISS, iniciando com 10% da alíquota final.', '2029-01-01'::date, 'inicio', ARRAY['presumido', 'real'], ARRAY['comercio', 'servicos', 'industria'], 'LC 214/2025, Art. 8°'),
  ('IBS aumenta para 20%', 'Segunda fase de transição do IBS.', '2030-01-01'::date, 'transicao', ARRAY['presumido', 'real'], ARRAY['comercio', 'servicos', 'industria'], 'LC 214/2025, Art. 8°'),
  ('IBS aumenta para 40%', 'Terceira fase de transição do IBS.', '2031-01-01'::date, 'transicao', ARRAY['presumido', 'real'], ARRAY['comercio', 'servicos', 'industria'], 'LC 214/2025, Art. 8°'),
  ('IBS aumenta para 70%', 'Quarta fase de transição do IBS.', '2032-01-01'::date, 'transicao', ARRAY['presumido', 'real'], ARRAY['comercio', 'servicos', 'industria'], 'LC 214/2025, Art. 8°'),
  ('IBS atinge 100% - Extinção ICMS e ISS', 'IBS substitui integralmente ICMS e ISS. Fim da transição tributária.', '2033-01-01'::date, 'extincao', ARRAY['simples', 'presumido', 'real'], ARRAY['comercio', 'servicos', 'industria'], 'LC 214/2025, Art. 9°')
) AS v(titulo, descricao, data_prazo, tipo, afeta_regimes, afeta_setores, base_legal)
WHERE NOT EXISTS (SELECT 1 FROM public.prazos_reforma WHERE titulo = v.titulo);