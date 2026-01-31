-- =============================================
-- HARDENING FINAL DE RLS - TribuTalks
-- Corrigir políticas que ainda permitem acesso sem autenticação
-- =============================================

-- 1. noticias_tributarias: Exigir autenticação para ler notícias
DROP POLICY IF EXISTS "Authenticated users can view published news" ON public.noticias_tributarias;
CREATE POLICY "Authenticated users can view published news"
  ON public.noticias_tributarias FOR SELECT
  TO authenticated
  USING (publicado = true);

-- 2. pilulas_reforma: Garantir que só autenticados veem
DROP POLICY IF EXISTS "Authenticated users can view active pilulas" ON public.pilulas_reforma;
CREATE POLICY "Authenticated users can view active pilulas"
  ON public.pilulas_reforma FOR SELECT
  TO authenticated
  USING (ativo = true);

-- 3. rtc_rate_cache: Restringir a autenticados
DROP POLICY IF EXISTS "Authenticated users can read rtc cache" ON public.rtc_rate_cache;
CREATE POLICY "Authenticated users can read rtc cache"
  ON public.rtc_rate_cache FOR SELECT
  TO authenticated
  USING (true);

-- 4. Permitir service_role inserir no rtc_rate_cache (para edge functions)
CREATE POLICY "Service role can manage rtc cache"
  ON public.rtc_rate_cache FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 5. credit_rules: Já está correto mas vamos garantir TO authenticated
DROP POLICY IF EXISTS "Credit rules readable by authenticated only" ON public.credit_rules;
CREATE POLICY "Credit rules readable by authenticated only"
  ON public.credit_rules FOR SELECT
  TO authenticated
  USING (true);

-- 6. sector_benchmarks: Garantir TO authenticated
DROP POLICY IF EXISTS "Authenticated users can read benchmarks" ON public.sector_benchmarks;
CREATE POLICY "Authenticated users can read benchmarks"
  ON public.sector_benchmarks FOR SELECT
  TO authenticated
  USING (true);

-- 7. tax_opportunities: Garantir TO authenticated
DROP POLICY IF EXISTS "Authenticated users can read opportunities" ON public.tax_opportunities;
CREATE POLICY "Authenticated users can read opportunities"
  ON public.tax_opportunities FOR SELECT
  TO authenticated
  USING (true);

-- 8. calculators: Garantir TO authenticated
DROP POLICY IF EXISTS "Authenticated users can read calculators" ON public.calculators;
CREATE POLICY "Authenticated users can read calculators"
  ON public.calculators FOR SELECT
  TO authenticated
  USING (true);

-- 9. prazos_reforma: Garantir TO authenticated
DROP POLICY IF EXISTS "Authenticated users can view active prazos" ON public.prazos_reforma;
CREATE POLICY "Authenticated users can view active prazos"
  ON public.prazos_reforma FOR SELECT
  TO authenticated
  USING (ativo = true);