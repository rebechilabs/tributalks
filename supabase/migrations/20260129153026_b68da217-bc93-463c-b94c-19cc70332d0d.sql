-- Fix security issue: add search_path to SECURITY DEFINER-style function
-- This prevents potential search_path injection attacks

ALTER FUNCTION public.update_org_seats_updated_at()
SET search_path = public;