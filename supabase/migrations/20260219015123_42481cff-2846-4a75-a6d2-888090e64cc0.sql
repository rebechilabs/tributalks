
-- Colunas novas que faltam
ALTER TABLE company_profile
  ADD COLUMN IF NOT EXISTS setor_secundario TEXT,
  ADD COLUMN IF NOT EXISTS folha_faixa TEXT
    CHECK (folha_faixa IN ('lt_10','10_a_20','20_a_28','gt_28'));

-- applicability em tax_opportunities
ALTER TABLE tax_opportunities
  ADD COLUMN IF NOT EXISTS applicability JSONB DEFAULT '{}';

-- Trigger: inferir segmento (macro) a partir do setor
CREATE OR REPLACE FUNCTION public.infer_macro_segmento()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.setor IN ('servicos_profissionais','tecnologia_saas',
    'corretagem_seguros','educacao','saude',
    'logistica_transporte','imobiliario') THEN
    NEW.segmento := 'servicos';
  ELSIF NEW.setor IN ('ecommerce','varejo_fisico',
    'distribuicao_atacado','alimentacao_bares_restaurantes') THEN
    NEW.segmento := 'comercio';
  ELSIF NEW.setor IN ('industria_alimentos_bebidas',
    'industria_metal_mecanica','agro','construcao_incorporacao') THEN
    NEW.segmento := 'industria';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_infer_macro ON company_profile;
CREATE TRIGGER trg_infer_macro
  BEFORE INSERT OR UPDATE OF setor ON company_profile
  FOR EACH ROW EXECUTE FUNCTION public.infer_macro_segmento();

-- Indices
CREATE INDEX IF NOT EXISTS idx_tax_opp_applicability
  ON tax_opportunities USING GIN (applicability);
CREATE INDEX IF NOT EXISTS idx_company_profile_setor
  ON company_profile (setor);
CREATE INDEX IF NOT EXISTS idx_company_profile_regime
  ON company_profile (regime_tributario);
CREATE INDEX IF NOT EXISTS idx_company_profile_tags
  ON company_profile USING GIN (tags_operacao);
