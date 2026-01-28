-- Adicionar colunas para status LC 224/2025 e Reforma Tributária
ALTER TABLE tax_opportunities 
ADD COLUMN IF NOT EXISTS status_lc_224_2025 text DEFAULT 'neutro',
ADD COLUMN IF NOT EXISTS descricao_lc_224_2025 text,
ADD COLUMN IF NOT EXISTS futuro_reforma text DEFAULT 'em_analise',
ADD COLUMN IF NOT EXISTS descricao_reforma text;

-- Comentários para documentação
COMMENT ON COLUMN tax_opportunities.status_lc_224_2025 IS 'Status após LC 224/2025: protegido, afetado, critico, neutro';
COMMENT ON COLUMN tax_opportunities.descricao_lc_224_2025 IS 'Descrição do impacto da LC 224/2025';
COMMENT ON COLUMN tax_opportunities.futuro_reforma IS 'Status pós-reforma: mantido, extinto, substituido, em_adaptacao';
COMMENT ON COLUMN tax_opportunities.descricao_reforma IS 'Descrição do futuro com a Reforma Tributária (CBS/IBS)';