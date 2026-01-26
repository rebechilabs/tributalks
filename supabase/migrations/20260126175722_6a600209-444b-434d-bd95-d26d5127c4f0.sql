-- Remover constraint antigo de planos
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plano_check;

-- Adicionar novo constraint suportando ambos os formatos (legado e novo)
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plano_check 
CHECK (plano = ANY (ARRAY[
  -- Planos legados
  'FREE'::text, 'BASICO'::text, 'PROFISSIONAL'::text, 'PREMIUM'::text,
  -- Novos planos
  'NAVIGATOR'::text, 'PROFESSIONAL'::text, 'ENTERPRISE'::text
]));