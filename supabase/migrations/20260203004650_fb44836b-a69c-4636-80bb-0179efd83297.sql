-- ============================================
-- FUNÇÕES PARA MEMÓRIA EVOLUTIVA
-- ============================================

-- Aplica decay a padrões não usados recentemente
-- Decay rate é aplicado proporcionalmente aos dias de inatividade
CREATE OR REPLACE FUNCTION public.apply_pattern_decay()
RETURNS TABLE(
  patterns_decayed integer,
  patterns_removed integer,
  avg_confidence_before numeric,
  avg_confidence_after numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_decayed integer := 0;
  v_removed integer := 0;
  v_avg_before numeric;
  v_avg_after numeric;
BEGIN
  -- Calcula média antes
  SELECT AVG(confidence) INTO v_avg_before FROM clara_learned_patterns;
  
  -- Aplica decay baseado em dias sem uso
  -- Formula: new_confidence = confidence * (1 - decay_rate * days_inactive)
  -- Mínimo de confidence = 0.1
  WITH decay_calc AS (
    UPDATE clara_learned_patterns
    SET 
      confidence = GREATEST(0.1, 
        confidence * (1 - COALESCE(decay_rate, 0.1) * 
          EXTRACT(DAY FROM (now() - COALESCE(last_observed_at, created_at)))::numeric / 30
        )
      ),
      updated_at = now()
    WHERE 
      last_observed_at < now() - interval '7 days'
      AND confidence > 0.15
    RETURNING id
  )
  SELECT COUNT(*) INTO v_decayed FROM decay_calc;
  
  -- Remove padrões com confiança muito baixa e sem uso por 90 dias
  WITH removed AS (
    DELETE FROM clara_learned_patterns
    WHERE 
      confidence <= 0.15
      AND last_observed_at < now() - interval '90 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_removed FROM removed;
  
  -- Calcula média depois
  SELECT AVG(confidence) INTO v_avg_after FROM clara_learned_patterns;
  
  RETURN QUERY SELECT v_decayed, v_removed, v_avg_before, v_avg_after;
END;
$function$;

-- Aplica decay a memórias não utilizadas
CREATE OR REPLACE FUNCTION public.apply_memory_decay()
RETURNS TABLE(
  memories_decayed integer,
  memories_expired integer,
  avg_importance_before numeric,
  avg_importance_after numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_decayed integer := 0;
  v_expired integer := 0;
  v_avg_before numeric;
  v_avg_after numeric;
BEGIN
  -- Calcula média antes
  SELECT AVG(importance) INTO v_avg_before FROM clara_memory WHERE expires_at IS NULL OR expires_at > now();
  
  -- Reduz importância de memórias não usadas há mais de 30 dias
  WITH decay_calc AS (
    UPDATE clara_memory
    SET 
      importance = GREATEST(1, importance - 1),
      confidence_score = GREATEST(0.1, COALESCE(confidence_score, 0.5) - 0.05),
      updated_at = now()
    WHERE 
      (last_used_at IS NULL AND created_at < now() - interval '30 days')
      OR (last_used_at < now() - interval '30 days')
    RETURNING id
  )
  SELECT COUNT(*) INTO v_decayed FROM decay_calc;
  
  -- Marca memórias de baixa importância como expiradas (se não tiverem padrão aprendido)
  WITH expired AS (
    UPDATE clara_memory
    SET expires_at = now()
    WHERE 
      importance <= 1
      AND (last_used_at IS NULL OR last_used_at < now() - interval '60 days')
      AND learned_pattern IS NULL
      AND expires_at IS NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO v_expired FROM expired;
  
  -- Calcula média depois
  SELECT AVG(importance) INTO v_avg_after FROM clara_memory WHERE expires_at IS NULL OR expires_at > now();
  
  RETURN QUERY SELECT v_decayed, v_expired, v_avg_before, v_avg_after;
END;
$function$;

-- Reforça um padrão (aumenta confiança e times_observed)
CREATE OR REPLACE FUNCTION public.reinforce_pattern(
  p_user_id uuid,
  p_pattern_type text,
  p_pattern_key text,
  p_boost numeric DEFAULT 0.1
)
RETURNS TABLE(
  pattern_id uuid,
  new_confidence numeric,
  new_times_observed integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_id uuid;
  v_conf numeric;
  v_times integer;
BEGIN
  UPDATE clara_learned_patterns
  SET 
    confidence = LEAST(0.99, COALESCE(confidence, 0.5) + p_boost),
    times_observed = COALESCE(times_observed, 0) + 1,
    last_observed_at = now(),
    updated_at = now()
  WHERE 
    user_id = p_user_id
    AND pattern_type = p_pattern_type
    AND pattern_key = p_pattern_key
  RETURNING id, confidence, times_observed INTO v_id, v_conf, v_times;
  
  IF v_id IS NULL THEN
    -- Padrão não existe, cria novo
    INSERT INTO clara_learned_patterns (user_id, pattern_type, pattern_key, pattern_value, confidence, times_observed)
    VALUES (p_user_id, p_pattern_type, p_pattern_key, '{}'::jsonb, 0.5, 1)
    RETURNING id, confidence, times_observed INTO v_id, v_conf, v_times;
  END IF;
  
  RETURN QUERY SELECT v_id, v_conf, v_times;
END;
$function$;

-- Obtém estatísticas de memória evolutiva para um usuário
CREATE OR REPLACE FUNCTION public.get_memory_stats(p_user_id uuid)
RETURNS TABLE(
  total_patterns integer,
  active_patterns integer,
  high_confidence_patterns integer,
  total_memories integer,
  active_memories integer,
  avg_pattern_confidence numeric,
  avg_memory_importance numeric,
  oldest_pattern_days integer,
  most_used_pattern_key text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH pattern_stats AS (
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE confidence > 0.3) as active,
      COUNT(*) FILTER (WHERE confidence > 0.7) as high_conf,
      AVG(confidence) as avg_conf,
      MAX(EXTRACT(DAY FROM (now() - created_at)))::integer as oldest_days
    FROM clara_learned_patterns
    WHERE user_id = p_user_id
  ),
  memory_stats AS (
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE expires_at IS NULL OR expires_at > now()) as active,
      AVG(importance) as avg_imp
    FROM clara_memory
    WHERE user_id = p_user_id
  ),
  top_pattern AS (
    SELECT pattern_key
    FROM clara_learned_patterns
    WHERE user_id = p_user_id
    ORDER BY times_observed DESC, confidence DESC
    LIMIT 1
  )
  SELECT 
    ps.total::integer,
    ps.active::integer,
    ps.high_conf::integer,
    ms.total::integer,
    ms.active::integer,
    ROUND(ps.avg_conf, 3),
    ROUND(ms.avg_imp, 2),
    COALESCE(ps.oldest_days, 0),
    COALESCE(tp.pattern_key, 'none')
  FROM pattern_stats ps, memory_stats ms, top_pattern tp;
END;
$function$;