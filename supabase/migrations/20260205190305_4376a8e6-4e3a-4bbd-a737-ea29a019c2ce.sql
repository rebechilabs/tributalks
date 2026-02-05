-- Add Circle integration fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS circle_member_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS circle_invited_at TIMESTAMPTZ;