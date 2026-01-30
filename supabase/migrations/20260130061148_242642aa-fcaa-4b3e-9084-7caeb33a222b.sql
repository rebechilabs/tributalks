-- Fix 1: Ensure contatos table SELECT is restricted to admins only
-- Drop and recreate the policy to ensure it's correctly configured
DROP POLICY IF EXISTS "Only admins can view contacts" ON public.contatos;

CREATE POLICY "Only admins can view contacts" 
ON public.contatos 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Restrict pilulas_reforma to authenticated users only (already is, but ensure policy is correct)
-- The current policy allows authenticated users to view active pilulas, which is intentional
-- But let's ensure it requires authentication explicitly
DROP POLICY IF EXISTS "Authenticated users can view active pilulas" ON public.pilulas_reforma;

CREATE POLICY "Authenticated users can view active pilulas" 
ON public.pilulas_reforma 
FOR SELECT 
TO authenticated
USING (ativo = true);