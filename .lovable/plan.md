
# Plano de Blindagem do Backend - TribuTalks

## Diagnóstico de Segurança

A varredura identificou **11 vulnerabilidades**, sendo **3 CRÍTICAS** que exigem ação imediata:

| Severidade | Problema | Tabela Afetada | Risco |
|------------|----------|----------------|-------|
| **CRÍTICO** | Dados de inteligência de negócios públicos | `sector_benchmarks` | Concorrentes podem roubar benchmarks proprietários |
| **CRÍTICO** | Estratégias tributárias expostas | `tax_opportunities` (61 registros) | Concorrentes podem copiar metodologia de consultoria |
| **CRÍTICO** | Webhooks Stripe bloqueados | `subscription_events` | Pagamentos não serão registrados |
| ALERTA | Timeline da reforma exposta | `prazos_reforma` | Análises proprietárias expostas |
| ALERTA | Cache de IA sem políticas | `clara_cache` | Inacessível para usuários legítimos |
| ALERTA | Calculadoras públicas | `calculators` | Metadados de ferramentas expostos |
| ALERTA | Políticas sempre-true detectadas | Múltiplas | Políticas permissivas demais |
| ALERTA | Extensões no schema public | N/A | Risco de SQL injection |
| INFO | RLS sem políticas | `clara_cache` | Tabela inacessível |
| INFO | Formulário sem rate limiting | `contatos` | Vulnerável a spam |
| ALERTA | Leaked Password Protection | Auth | Senhas vazadas não bloqueadas |

---

## Correções a Implementar

### FASE 1: Correções Críticas (Bloqueio de Dados Sensíveis)

#### 1.1 Proteger `tax_opportunities` (61 estratégias tributárias)
```sql
-- Remover política pública
DROP POLICY IF EXISTS "Opportunities are readable" ON public.tax_opportunities;

-- Permitir apenas autenticados
CREATE POLICY "Authenticated users can read opportunities"
  ON public.tax_opportunities FOR SELECT
  TO authenticated
  USING (true);
```

#### 1.2 Proteger `sector_benchmarks` (10 benchmarks de mercado)
```sql
-- Remover política pública
DROP POLICY IF EXISTS "Benchmarks are readable by authenticated" ON public.sector_benchmarks;

-- Permitir apenas autenticados
CREATE POLICY "Authenticated users can read benchmarks"
  ON public.sector_benchmarks FOR SELECT
  TO authenticated
  USING (true);
```

#### 1.3 Corrigir `subscription_events` (Stripe bloqueado)
```sql
-- Remover política quebrada
DROP POLICY IF EXISTS "Only service role can insert subscription events" ON public.subscription_events;

-- Permitir apenas service_role inserir
CREATE POLICY "Service role can insert subscription events"
  ON public.subscription_events FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
```

---

### FASE 2: Proteção de Propriedade Intelectual

#### 2.1 Restringir `prazos_reforma`
```sql
-- Alterar de público para autenticado
DROP POLICY IF EXISTS "Authenticated users can view active prazos" ON public.prazos_reforma;

CREATE POLICY "Authenticated users can view active prazos"
  ON public.prazos_reforma FOR SELECT
  TO authenticated
  USING (ativo = true);
```

#### 2.2 Configurar `clara_cache` (Cache da IA)
```sql
-- Adicionar políticas para que edge functions possam usar
CREATE POLICY "Service role full access to cache"
  ON public.clara_cache FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

#### 2.3 Restringir `calculators`
```sql
DROP POLICY IF EXISTS "Calculadoras são públicas para leitura" ON public.calculators;

CREATE POLICY "Authenticated users can read calculators"
  ON public.calculators FOR SELECT
  TO authenticated
  USING (true);
```

---

### FASE 3: Hardening Adicional

#### 3.1 Extensões - Mover do schema public
```sql
-- Nota: Isso requer cuidado pois pode quebrar funcionalidades
-- Recomendo verificar quais extensões estão no public primeiro
-- antes de movê-las para o schema extensions
```

---

## Resumo das Alterações SQL

```sql
-- =============================================
-- FASE 1: CORREÇÕES CRÍTICAS
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

-- 1.3 subscription_events: Permitir service_role
DROP POLICY IF EXISTS "Only service role can insert subscription events" ON public.subscription_events;
CREATE POLICY "Service role can insert subscription events"
  ON public.subscription_events FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- =============================================
-- FASE 2: PROPRIEDADE INTELECTUAL
-- =============================================

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
```

---

## Impacto nas Funcionalidades

| Mudança | Antes | Depois | Impacto no Usuário |
|---------|-------|--------|-------------------|
| `tax_opportunities` | Público | Autenticado | Visitantes não veem oportunidades (correto) |
| `sector_benchmarks` | Público | Autenticado | Benchmarks só após login (correto) |
| `subscription_events` | Bloqueado | Service Role | Stripe funciona corretamente |
| `prazos_reforma` | Público | Autenticado | Timeline só após login |
| `clara_cache` | Sem acesso | Service Role | Clara AI funciona |
| `calculators` | Público | Autenticado | Lista só após login |

---

## Itens Pendentes (Ação Manual Necessária)

### Leaked Password Protection
Este recurso precisa ser ativado via suporte Lovable:
- **Project ID:** `rhhzsmupixdhurricppk`
- **Ação:** Solicitar ativação de "Leaked Password Protection" no Supabase Auth

### Rate Limiting no Formulário de Contato
O formulário `/contato` aceita inserts públicos (intencional para captação). Recomendo:
- Adicionar reCAPTCHA v3 no frontend
- Ou implementar rate limiting na edge function

---

## Verificação Pós-Implementação

Após aplicar as migrações, executar nova varredura de segurança para confirmar que:
- ✅ Tabelas sensíveis restritas a autenticados
- ✅ Stripe webhooks funcionando
- ✅ Cache da Clara AI operacional
- ✅ Sem políticas `USING (true)` para roles `public`
