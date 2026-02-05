-- Adicionar company_id às tabelas de histórico
ALTER TABLE simulations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_profile(id) ON DELETE SET NULL;
ALTER TABLE tax_calculations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_profile(id) ON DELETE SET NULL;
ALTER TABLE tax_score_history ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_profile(id) ON DELETE SET NULL;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_simulations_company ON simulations(company_id);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_company ON tax_calculations(company_id);
CREATE INDEX IF NOT EXISTS idx_tax_score_history_company ON tax_score_history(company_id);