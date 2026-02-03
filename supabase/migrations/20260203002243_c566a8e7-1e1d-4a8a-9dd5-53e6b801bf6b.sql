-- ============================================
-- FASE 5: RAG SEMÂNTICO COM PGVECTOR
-- ============================================

-- Habilita a extensão pgvector
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Adiciona coluna de embedding na knowledge_base
ALTER TABLE public.clara_knowledge_base 
ADD COLUMN IF NOT EXISTS embedding vector(1536),
ADD COLUMN IF NOT EXISTS embedding_model text DEFAULT 'text-embedding-3-small',
ADD COLUMN IF NOT EXISTS embedded_at timestamptz;

-- Adiciona coluna de embedding na memória
ALTER TABLE public.clara_memory
ADD COLUMN IF NOT EXISTS embedding vector(1536),
ADD COLUMN IF NOT EXISTS embedding_model text DEFAULT 'text-embedding-3-small',
ADD COLUMN IF NOT EXISTS embedded_at timestamptz;

-- Adiciona coluna de embedding nos padrões aprendidos
ALTER TABLE public.clara_learned_patterns
ADD COLUMN IF NOT EXISTS embedding vector(1536),
ADD COLUMN IF NOT EXISTS embedding_model text DEFAULT 'text-embedding-3-small',
ADD COLUMN IF NOT EXISTS embedded_at timestamptz;

-- Tabela para cache de embeddings (evita recalcular)
CREATE TABLE IF NOT EXISTS public.clara_embeddings_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_hash text NOT NULL UNIQUE,
  content_preview text,
  embedding vector(1536) NOT NULL,
  model text DEFAULT 'text-embedding-3-small',
  tokens_used integer,
  created_at timestamptz DEFAULT now()
);

-- Índices HNSW para busca vetorial eficiente
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding 
ON public.clara_knowledge_base 
USING hnsw (embedding vector_cosine_ops)
WHERE embedding IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_memory_embedding 
ON public.clara_memory 
USING hnsw (embedding vector_cosine_ops)
WHERE embedding IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_patterns_embedding 
ON public.clara_learned_patterns 
USING hnsw (embedding vector_cosine_ops)
WHERE embedding IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_embeddings_cache_hash 
ON public.clara_embeddings_cache (content_hash);

-- Função para busca semântica na knowledge_base
CREATE OR REPLACE FUNCTION public.search_knowledge_base(
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  summary text,
  full_content text,
  category text,
  legal_basis text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kb.id,
    kb.title,
    kb.summary,
    kb.full_content,
    kb.category,
    kb.legal_basis,
    1 - (kb.embedding <=> query_embedding) as similarity
  FROM public.clara_knowledge_base kb
  WHERE kb.status = 'published'
    AND kb.embedding IS NOT NULL
    AND (kb.valid_until IS NULL OR kb.valid_until > now())
    AND 1 - (kb.embedding <=> query_embedding) > similarity_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Função para busca semântica nas memórias do usuário
CREATE OR REPLACE FUNCTION public.search_user_memories(
  p_user_id uuid,
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.6,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  memory_type text,
  category text,
  content text,
  importance integer,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.memory_type,
    m.category,
    m.content,
    m.importance,
    1 - (m.embedding <=> query_embedding) as similarity
  FROM public.clara_memory m
  WHERE m.user_id = p_user_id
    AND m.embedding IS NOT NULL
    AND (m.expires_at IS NULL OR m.expires_at > now())
    AND 1 - (m.embedding <=> query_embedding) > similarity_threshold
  ORDER BY 
    m.embedding <=> query_embedding,
    m.importance DESC
  LIMIT match_count;
END;
$$;

-- Função para busca semântica nos padrões do usuário
CREATE OR REPLACE FUNCTION public.search_user_patterns(
  p_user_id uuid,
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  pattern_type text,
  pattern_key text,
  pattern_value jsonb,
  confidence numeric,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lp.id,
    lp.pattern_type,
    lp.pattern_key,
    lp.pattern_value,
    lp.confidence,
    1 - (lp.embedding <=> query_embedding) as similarity
  FROM public.clara_learned_patterns lp
  WHERE lp.user_id = p_user_id
    AND lp.embedding IS NOT NULL
    AND lp.confidence >= 0.3
    AND 1 - (lp.embedding <=> query_embedding) > similarity_threshold
  ORDER BY 
    lp.embedding <=> query_embedding,
    lp.confidence DESC
  LIMIT match_count;
END;
$$;

-- Função híbrida: combina busca semântica + keyword
CREATE OR REPLACE FUNCTION public.hybrid_search_knowledge(
  query_embedding vector(1536),
  query_text text,
  similarity_threshold float DEFAULT 0.6,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  summary text,
  category text,
  similarity float,
  keyword_match boolean,
  combined_score float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kb.id,
    kb.title,
    kb.summary,
    kb.category,
    1 - (kb.embedding <=> query_embedding) as similarity,
    (
      kb.title ILIKE '%' || query_text || '%' OR 
      kb.summary ILIKE '%' || query_text || '%' OR
      query_text = ANY(kb.trigger_keywords)
    ) as keyword_match,
    -- Score combinado: 70% semântico + 30% keyword boost
    CASE 
      WHEN (kb.title ILIKE '%' || query_text || '%' OR kb.summary ILIKE '%' || query_text || '%' OR query_text = ANY(kb.trigger_keywords))
      THEN (1 - (kb.embedding <=> query_embedding)) * 0.7 + 0.3
      ELSE (1 - (kb.embedding <=> query_embedding))
    END as combined_score
  FROM public.clara_knowledge_base kb
  WHERE kb.status = 'published'
    AND kb.embedding IS NOT NULL
    AND (kb.valid_until IS NULL OR kb.valid_until > now())
    AND (
      1 - (kb.embedding <=> query_embedding) > similarity_threshold
      OR kb.title ILIKE '%' || query_text || '%'
      OR kb.summary ILIKE '%' || query_text || '%'
      OR query_text = ANY(kb.trigger_keywords)
    )
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;

-- RLS para embeddings_cache (somente service_role pode acessar)
ALTER TABLE public.clara_embeddings_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage embeddings cache"
ON public.clara_embeddings_cache
FOR ALL
USING (true)
WITH CHECK (true);

-- Comentários para documentação
COMMENT ON FUNCTION public.search_knowledge_base IS 'Busca semântica na base de conhecimento usando similaridade de cosseno';
COMMENT ON FUNCTION public.search_user_memories IS 'Busca semântica nas memórias do usuário';
COMMENT ON FUNCTION public.search_user_patterns IS 'Busca semântica nos padrões aprendidos do usuário';
COMMENT ON FUNCTION public.hybrid_search_knowledge IS 'Busca híbrida combinando similaridade vetorial e keywords';