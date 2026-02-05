-- Adicionar coluna despesas_operacionais na tabela simpronto_simulations
ALTER TABLE public.simpronto_simulations 
ADD COLUMN IF NOT EXISTS despesas_operacionais numeric DEFAULT 0;