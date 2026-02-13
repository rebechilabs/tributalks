
-- Tabela de NCMs monofásicos (dados legislativos)
CREATE TABLE IF NOT EXISTS public.monophasic_ncms (
  ncm_prefix text PRIMARY KEY,
  category text NOT NULL,
  legal_basis text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  valid_from date DEFAULT '2000-01-01',
  valid_until date DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- Popular com NCMs monofásicos conhecidos
INSERT INTO public.monophasic_ncms (ncm_prefix, category, legal_basis, description) VALUES
  ('2710', 'Combustíveis', 'Lei 11.116/2005', 'Óleos de petróleo'),
  ('2207', 'Combustíveis', 'Lei 11.116/2005', 'Álcool etílico'),
  ('3003', 'Medicamentos', 'Lei 10.147/2000', 'Medicamentos (mistura)'),
  ('3004', 'Medicamentos', 'Lei 10.147/2000', 'Medicamentos (dose)'),
  ('3303', 'Cosméticos', 'Lei 10.147/2000', 'Perfumes'),
  ('3304', 'Cosméticos', 'Lei 10.147/2000', 'Maquiagem e cuidados da pele'),
  ('3305', 'Cosméticos', 'Lei 10.147/2000', 'Preparações capilares'),
  ('3306', 'Higiene', 'Lei 10.147/2000', 'Preparações para higiene bucal'),
  ('3307', 'Higiene', 'Lei 10.147/2000', 'Desodorantes e sais de banho'),
  ('2201', 'Bebidas', 'Lei 13.097/2015', 'Águas minerais'),
  ('2202', 'Bebidas', 'Lei 13.097/2015', 'Bebidas não alcoólicas'),
  ('2203', 'Bebidas', 'Lei 13.097/2015', 'Cervejas'),
  ('2204', 'Bebidas', 'Lei 13.097/2015', 'Vinhos'),
  ('8708', 'Autopeças', 'Lei 10.485/2002', 'Peças para veículos'),
  ('4011', 'Autopeças', 'Lei 10.485/2002', 'Pneus novos'),
  ('8507', 'Autopeças', 'Lei 10.485/2002', 'Baterias'),
  ('8433', 'Máq.Agrícolas', 'Lei 10.485/2002', 'Máquinas agrícolas'),
  ('8701', 'Máq.Agrícolas', 'Lei 10.485/2002', 'Tratores')
ON CONFLICT (ncm_prefix) DO NOTHING;

-- RLS: leitura pública (dados legislativos)
ALTER TABLE public.monophasic_ncms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all_monophasic_ncms" ON public.monophasic_ncms FOR SELECT USING (true);
