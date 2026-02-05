-- Remove a constraint UNIQUE que impede múltiplas empresas por usuário
-- Isso permite que um usuário tenha múltiplas empresas conforme o sistema multi-CNPJ
ALTER TABLE public.company_profile 
DROP CONSTRAINT company_profile_user_id_key;