-- ============================================================================
-- Hardening credit_rules: Remove anonymous access to protect proprietary algorithms
-- ============================================================================

-- Drop the existing permissive policy that allows any authenticated user
DROP POLICY IF EXISTS "Credit rules are readable by authenticated users" ON public.credit_rules;

-- Create new restrictive policy: only authenticated users can read
CREATE POLICY "Credit rules readable by authenticated only"
  ON public.credit_rules
  FOR SELECT
  TO authenticated
  USING (true);

-- Revoke all permissions from anonymous users
REVOKE ALL ON public.credit_rules FROM anon;