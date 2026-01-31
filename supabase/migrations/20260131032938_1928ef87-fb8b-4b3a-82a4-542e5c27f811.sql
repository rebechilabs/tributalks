-- ============================================
-- Tabela: clara_cache
-- Cache inteligente com TTL por categoria
-- ============================================

CREATE TABLE public.clara_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT UNIQUE NOT NULL,
  query_normalized TEXT NOT NULL,
  response TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'definition',
  ttl_days INTEGER NOT NULL DEFAULT 7,
  requires_validation BOOLEAN DEFAULT false,
  hit_count INTEGER DEFAULT 1,
  model_used TEXT DEFAULT 'claude-sonnet-4',
  tokens_saved INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_clara_cache_hash ON public.clara_cache(query_hash);
CREATE INDEX idx_clara_cache_category ON public.clara_cache(category);
CREATE INDEX idx_clara_cache_created ON public.clara_cache(created_at);

-- RLS: Apenas service role pode gerenciar o cache (Edge Functions)
ALTER TABLE public.clara_cache ENABLE ROW LEVEL SECURITY;

-- Política: Somente service role (Edge Functions) podem acessar
-- Não precisa de políticas RLS pois é gerenciado apenas por Edge Functions com service role

-- Trigger para atualizar updated_at
CREATE TRIGGER update_clara_cache_updated_at
  BEFORE UPDATE ON public.clara_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE public.clara_cache IS 'Cache de respostas da Clara AI com TTL inteligente por categoria';
COMMENT ON COLUMN public.clara_cache.query_hash IS 'Hash SHA-256 da query normalizada para lookup rápido';
COMMENT ON COLUMN public.clara_cache.category IS 'Categoria: definition (90d), aliquot (7d), deadline (1d), procedure (30d)';
COMMENT ON COLUMN public.clara_cache.ttl_days IS 'Time-to-live em dias baseado na categoria';
COMMENT ON COLUMN public.clara_cache.requires_validation IS 'Se true, pode exigir validação adicional (ex: alíquotas)';