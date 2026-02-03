-- Adicionar unique constraint na tabela company_dre
-- Permite upsert correto por período (user_id, period_type, period_year, period_month)
-- NOTA: period_month pode ser NULL para período anual, então precisamos de um unique index parcial

-- Primeiro, verificar se já existe dados duplicados e limpar se necessário
DELETE FROM company_dre a 
USING company_dre b 
WHERE a.id < b.id 
  AND a.user_id = b.user_id 
  AND a.period_type = b.period_type 
  AND a.period_year = b.period_year 
  AND COALESCE(a.period_month, 0) = COALESCE(b.period_month, 0);

-- Criar unique constraint que trata NULLs corretamente
CREATE UNIQUE INDEX IF NOT EXISTS company_dre_user_period_unique 
ON company_dre (user_id, period_type, period_year, COALESCE(period_month, 0));