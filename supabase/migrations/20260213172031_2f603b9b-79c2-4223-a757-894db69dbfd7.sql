
-- Tabela de repartição tributária do Simples Nacional (LC 123/2006)
CREATE TABLE IF NOT EXISTS public.simples_tax_distribution (
  anexo text NOT NULL,
  faixa integer NOT NULL,
  aliquota_nominal numeric NOT NULL,
  deducao numeric NOT NULL DEFAULT 0,
  receita_min numeric NOT NULL,
  receita_max numeric NOT NULL,
  irpj numeric NOT NULL,
  csll numeric NOT NULL,
  cofins numeric NOT NULL,
  pis numeric NOT NULL,
  cpp numeric NOT NULL,
  icms numeric NOT NULL DEFAULT 0,
  iss numeric NOT NULL DEFAULT 0,
  PRIMARY KEY (anexo, faixa)
);

-- Anexo I - Comércio
INSERT INTO public.simples_tax_distribution VALUES
  ('I',1,4.00,0,0,180000,5.50,3.50,12.74,2.76,41.50,34.00,0),
  ('I',2,7.30,5940,180000.01,360000,5.50,3.50,12.74,2.76,41.50,34.00,0),
  ('I',3,9.50,13860,360000.01,720000,5.50,3.50,12.74,2.76,42.00,33.50,0),
  ('I',4,10.70,22500,720000.01,1800000,5.50,3.50,12.74,2.76,41.50,34.00,0),
  ('I',5,14.30,87300,1800000.01,3600000,5.50,3.50,12.74,2.76,42.00,33.50,0),
  ('I',6,19.00,378000,3600000.01,4800000,13.50,10.00,28.27,6.13,42.10,0,0);

-- Anexo II - Indústria
INSERT INTO public.simples_tax_distribution VALUES
  ('II',1,4.50,0,0,180000,5.50,3.50,11.51,2.49,37.50,32.00,0),
  ('II',2,7.80,5940,180000.01,360000,5.50,3.50,11.51,2.49,37.50,32.00,0),
  ('II',3,10.00,13860,360000.01,720000,5.50,3.50,11.51,2.49,37.50,32.00,0),
  ('II',4,11.20,22500,720000.01,1800000,5.50,3.50,11.51,2.49,37.50,32.00,0),
  ('II',5,14.70,85500,1800000.01,3600000,5.50,3.50,11.51,2.49,37.50,32.00,0),
  ('II',6,30.00,720000,3600000.01,4800000,8.50,7.50,20.96,4.54,23.50,35.00,0);

-- Anexo III - Serviços (receitas do art. 25-A, §1º, III e V)
INSERT INTO public.simples_tax_distribution VALUES
  ('III',1,6.00,0,0,180000,4.00,3.50,12.82,2.78,43.40,0,33.50),
  ('III',2,11.20,9360,180000.01,360000,4.00,3.50,14.05,3.05,43.40,0,32.00),
  ('III',3,13.50,17640,360000.01,720000,4.00,3.50,13.64,2.96,43.40,0,32.50),
  ('III',4,16.00,35640,720000.01,1800000,4.00,3.50,13.64,2.96,43.40,0,32.50),
  ('III',5,21.00,125640,1800000.01,3600000,4.00,3.50,12.82,2.78,43.40,0,33.50),
  ('III',6,33.00,648000,3600000.01,4800000,35.00,15.00,16.03,3.47,30.50,0,0);

-- Anexo IV - Serviços (construção, vigilância, limpeza)
INSERT INTO public.simples_tax_distribution VALUES
  ('IV',1,4.50,0,0,180000,18.80,15.20,17.67,3.83,44.50,0,0),
  ('IV',2,9.00,8100,180000.01,360000,19.80,15.20,20.55,4.45,40.00,0,0),
  ('IV',3,10.20,12420,360000.01,720000,20.80,15.20,19.73,4.27,40.00,0,0),
  ('IV',4,14.00,39780,720000.01,1800000,17.80,19.20,18.90,4.10,40.00,0,0),
  ('IV',5,22.00,183780,1800000.01,3600000,18.80,19.20,18.08,3.92,40.00,0,0),
  ('IV',6,33.00,828000,3600000.01,4800000,53.50,21.50,20.55,4.45,0,0,0);

-- Anexo V - Serviços (tecnologia, engenharia, publicidade)
INSERT INTO public.simples_tax_distribution VALUES
  ('V',1,15.50,0,0,180000,25.00,15.00,14.10,3.05,28.85,0,14.00),
  ('V',2,18.00,4500,180000.01,360000,23.00,15.00,14.10,3.05,27.85,0,17.00),
  ('V',3,19.50,9900,360000.01,720000,24.00,15.00,14.92,3.23,23.85,0,19.00),
  ('V',4,20.50,17100,720000.01,1800000,21.00,15.00,15.74,3.41,23.85,0,21.00),
  ('V',5,23.00,62100,1800000.01,3600000,23.00,12.50,14.10,3.05,23.85,0,23.50),
  ('V',6,30.50,540000,3600000.01,4800000,35.00,15.50,16.44,3.56,29.50,0,0)
ON CONFLICT (anexo, faixa) DO NOTHING;

-- RLS: leitura pública (dados legislativos)
ALTER TABLE public.simples_tax_distribution ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all_simples_tax" ON public.simples_tax_distribution FOR SELECT USING (true);
