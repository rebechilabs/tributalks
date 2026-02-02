-- Remover política permissiva
DROP POLICY IF EXISTS "Authenticated users can read active knowledge" ON public.clara_knowledge_base;

-- Recriar com verificação de autenticação obrigatória
CREATE POLICY "Authenticated users can read active knowledge"
ON public.clara_knowledge_base
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND status = 'active'
);

-- Garantir que não há acesso anônimo
CREATE POLICY "Deny anonymous access"
ON public.clara_knowledge_base
FOR ALL
TO anon
USING (false)
WITH CHECK (false);