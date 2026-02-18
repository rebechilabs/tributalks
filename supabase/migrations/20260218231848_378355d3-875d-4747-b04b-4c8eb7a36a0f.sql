
ALTER TABLE company_profile
  ADD COLUMN IF NOT EXISTS tem_carteira_artesao          boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS artesanato_regional           boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mei_artesao                   boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS venda_direta_consumidor       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS participa_feiras              boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS exporta_artesanato            boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS usa_insumos_naturais          boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS compra_artesao_local          boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS compra_cooperativas           boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS revende_artesanato_regional   boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS loja_fisica_artesanato        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS vende_turistas                boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS exporta_revenda_artesanato    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS participa_feiras_revenda      boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN company_profile.tem_carteira_artesao        IS 'Possui Carteira Nacional do Artesão (PAB)';
COMMENT ON COLUMN company_profile.artesanato_regional         IS 'Produz artesanato regional/típico — Convênio ICMS 32/75';
COMMENT ON COLUMN company_profile.mei_artesao                 IS 'MEI com CNAE específico de artesanato';
COMMENT ON COLUMN company_profile.venda_direta_consumidor     IS 'Vende diretamente ao consumidor final (sem ST)';
COMMENT ON COLUMN company_profile.participa_feiras            IS 'Participa de feiras e exposições como produtor';
COMMENT ON COLUMN company_profile.exporta_artesanato          IS 'Exporta produtos artesanais (imunidade)';
COMMENT ON COLUMN company_profile.usa_insumos_naturais        IS 'Usa matérias-primas naturais/recicladas (isenção IPI)';
COMMENT ON COLUMN company_profile.compra_artesao_local        IS 'Compra de artesãos locais';
COMMENT ON COLUMN company_profile.compra_cooperativas         IS 'Compra de cooperativas de artesãos';
COMMENT ON COLUMN company_profile.revende_artesanato_regional IS 'Revende artesanato regional/típico';
COMMENT ON COLUMN company_profile.loja_fisica_artesanato      IS 'Tem loja física especializada em artesanato';
COMMENT ON COLUMN company_profile.vende_turistas              IS 'Vende para turistas (roteiros turísticos)';
COMMENT ON COLUMN company_profile.exporta_revenda_artesanato  IS 'Exporta artesanato revendido (imunidade)';
COMMENT ON COLUMN company_profile.participa_feiras_revenda    IS 'Participa de feiras como expositor/revendedor';
