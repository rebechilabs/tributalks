
-- company_profile: restringir a authenticated
DROP POLICY IF EXISTS "Users can view own profile" ON public.company_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.company_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON public.company_profile;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.company_profile;

CREATE POLICY "Users can view own profile"
ON public.company_profile FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.company_profile FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.company_profile FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
ON public.company_profile FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- tax_opportunities: admin policy restringir a authenticated
DROP POLICY IF EXISTS "Only admins can manage opportunities" ON public.tax_opportunities;

CREATE POLICY "Only admins can manage opportunities"
ON public.tax_opportunities FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Bloquear explicitamente acesso anonimo
CREATE POLICY "Deny anon access to company_profile"
ON public.company_profile AS RESTRICTIVE FOR ALL
TO anon
USING (false);

CREATE POLICY "Deny anon access to tax_opportunities"
ON public.tax_opportunities AS RESTRICTIVE FOR ALL
TO anon
USING (false);
