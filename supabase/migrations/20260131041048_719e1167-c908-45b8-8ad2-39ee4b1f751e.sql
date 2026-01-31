-- Dropar constraint antigo e criar novo com STARTER
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_plano_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_plano_check 
CHECK (plano IN ('FREE', 'STARTER', 'NAVIGATOR', 'PROFESSIONAL', 'ENTERPRISE'));