-- =============================================
-- BLINDAGEM DO BACKEND - TribuTalks
-- Fase 1: Correções Críticas + Fase 2: Propriedade Intelectual
-- =============================================

-- 1.1 tax_opportunities: Restringir a autenticados
DROP POLICY IF EXISTS "Opportunities are readable" ON public.tax_opportunities;
CREATE POLICY "Authenticated users can read opportunities"
  ON public.tax_opportunities FOR SELECT
  TO authenticated
  USING (true);

-- 1.2 sector_benchmarks: Restringir a autenticados  
DROP POLICY IF EXISTS "Benchmarks are readable by authenticated" ON public.sector_benchmarks;
CREATE POLICY "Authenticated users can read benchmarks"
  ON public.sector_benchmarks FOR SELECT
  TO authenticated
  USING (true);

-- 1.3 subscription_events: Permitir service_role inserir
DROP POLICY IF EXISTS "Only service role can insert subscription events" ON public.subscription_events;
CREATE POLICY "Service role can insert subscription events"
  ON public.subscription_events FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- 2.1 prazos_reforma: Restringir a autenticados
DROP POLICY IF EXISTS "Authenticated users can view active prazos" ON public.prazos_reforma;
CREATE POLICY "Authenticated users can view active prazos"
  ON public.prazos_reforma FOR SELECT
  TO authenticated
  USING (ativo = true);

-- 2.2 clara_cache: Service role full access
CREATE POLICY "Service role full access to cache"
  ON public.clara_cache FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 2.3 calculators: Restringir a autenticados
DROP POLICY IF EXISTS "Calculadoras são públicas para leitura" ON public.calculators;
CREATE POLICY "Authenticated users can read calculators"
  ON public.calculators FOR SELECT
  TO authenticated
  USING (true);