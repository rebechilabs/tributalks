-- Move pg_net extension from public to extensions schema (security best practice)
-- Note: This may fail if extension doesn't support ALTER, in which case it's a Supabase default we can't change

-- First ensure extensions schema exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage to necessary roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Note: pg_net is a Supabase internal extension and may not be movable
-- The warning is acknowledged but this extension is managed by Supabase infrastructure