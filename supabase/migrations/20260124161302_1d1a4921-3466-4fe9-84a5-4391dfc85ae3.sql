-- Adicionar coluna para armazenar CFOPs relacionados e tipo de operação
ALTER TABLE public.company_ncm_analysis 
ADD COLUMN IF NOT EXISTS cfops_frequentes text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tipo_operacao text DEFAULT 'misto',
ADD COLUMN IF NOT EXISTS qtd_operacoes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS alerta_cfop text;