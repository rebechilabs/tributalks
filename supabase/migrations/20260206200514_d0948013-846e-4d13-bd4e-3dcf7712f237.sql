-- Fix company_dre RLS policies to use authenticated role instead of public
-- This prevents anonymous access to financial data

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own DREs" ON public.company_dre;
DROP POLICY IF EXISTS "Users can insert own DREs" ON public.company_dre;
DROP POLICY IF EXISTS "Users can update own DREs" ON public.company_dre;
DROP POLICY IF EXISTS "Users can delete own DREs" ON public.company_dre;

-- Recreate policies with authenticated role
CREATE POLICY "Users can view own DREs" 
ON public.company_dre 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own DREs" 
ON public.company_dre 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own DREs" 
ON public.company_dre 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own DREs" 
ON public.company_dre 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Add admin access policy for company_dre
CREATE POLICY "Admins can view all DREs" 
ON public.company_dre 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));