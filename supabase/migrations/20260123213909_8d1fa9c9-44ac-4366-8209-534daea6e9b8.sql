-- Drop old constraint and create new one with all valid plan values
ALTER TABLE profiles DROP CONSTRAINT profiles_plano_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_plano_check 
  CHECK (plano IN ('FREE', 'BASICO', 'PROFISSIONAL', 'PREMIUM'));