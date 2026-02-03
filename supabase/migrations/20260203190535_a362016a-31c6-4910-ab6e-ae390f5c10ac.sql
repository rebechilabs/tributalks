-- Adiciona policy para permitir service_role acessar credit_rules
CREATE POLICY "Service role can read credit_rules"
ON public.credit_rules
FOR SELECT
TO service_role
USING (true);

-- Também garantir que authenticated pode ler
DROP POLICY IF EXISTS "Credit rules readable by authenticated only" ON public.credit_rules;
CREATE POLICY "Credit rules readable by all authenticated"
ON public.credit_rules
FOR SELECT
TO authenticated
USING (true);