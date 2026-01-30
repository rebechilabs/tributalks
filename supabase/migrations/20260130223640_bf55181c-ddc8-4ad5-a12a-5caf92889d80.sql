-- Add plano_expires_at column to profiles table for custom trial management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plano_expires_at timestamp with time zone DEFAULT NULL;