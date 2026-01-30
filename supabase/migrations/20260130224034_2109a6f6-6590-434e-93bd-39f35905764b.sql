-- Create table to store pending plan grants for users who haven't signed up yet
CREATE TABLE IF NOT EXISTS public.pending_plan_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  plano text NOT NULL DEFAULT 'PROFESSIONAL',
  plano_expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  applied_at timestamp with time zone DEFAULT NULL,
  applied_to_user_id uuid DEFAULT NULL
);

-- Enable RLS
ALTER TABLE public.pending_plan_grants ENABLE ROW LEVEL SECURITY;

-- Only admins can manage pending grants
CREATE POLICY "Only admins can manage pending grants"
  ON public.pending_plan_grants
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Update handle_new_user function to check for pending grants
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  pending_grant RECORD;
BEGIN
  -- Check if there's a pending plan grant for this email
  SELECT * INTO pending_grant 
  FROM public.pending_plan_grants 
  WHERE email = NEW.email 
    AND applied_at IS NULL
    AND plano_expires_at > now()
  LIMIT 1;

  IF pending_grant.id IS NOT NULL THEN
    -- Insert profile with the granted plan
    INSERT INTO public.profiles (user_id, email, plano, plano_expires_at)
    VALUES (NEW.id, NEW.email, pending_grant.plano, pending_grant.plano_expires_at);
    
    -- Mark the grant as applied
    UPDATE public.pending_plan_grants 
    SET applied_at = now(), applied_to_user_id = NEW.id
    WHERE id = pending_grant.id;
  ELSE
    -- Normal profile creation
    INSERT INTO public.profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Insert the pending emails
INSERT INTO public.pending_plan_grants (email, plano, plano_expires_at) VALUES
  ('victor@rebechisilva.com.br', 'PROFESSIONAL', '2026-03-02 23:59:59-03:00'),
  ('mike.martiniano1@gmail.com', 'PROFESSIONAL', '2026-03-02 23:59:59-03:00'),
  ('m.martiniano@lifleg.com', 'PROFESSIONAL', '2026-03-02 23:59:59-03:00'),
  ('danilo@rebechisilva.com.br', 'PROFESSIONAL', '2026-03-02 23:59:59-03:00'),
  ('tamires@rebechisilva.com.br', 'PROFESSIONAL', '2026-03-02 23:59:59-03:00'),
  ('patricia@rebechisilva.com.br', 'PROFESSIONAL', '2026-03-02 23:59:59-03:00'),
  ('lilian@rebechisilva.com.br', 'PROFESSIONAL', '2026-03-02 23:59:59-03:00'),
  ('moreirawebmaster@gmail.com', 'PROFESSIONAL', '2026-03-02 23:59:59-03:00'),
  ('william@weinova.com.br', 'PROFESSIONAL', '2026-03-02 23:59:59-03:00')
ON CONFLICT (email) DO UPDATE SET
  plano = EXCLUDED.plano,
  plano_expires_at = EXCLUDED.plano_expires_at;