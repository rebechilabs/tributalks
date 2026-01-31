

# Plano de Implementação Atualizado: 3 Prioridades Estratégicas
## Incorporando Alertas Críticos do Consultor

---

## Resumo Executivo

Este plano implementa as 3 mudanças estratégicas validadas, com os 4 alertas críticos do consultor incorporados como requisitos obrigatórios.

| Prioridade | Feature | Esforço | Impacto | Sprint |
|------------|---------|---------|---------|--------|
| 1 | NEXUS como Primeira Tela | P (3-5h) | Altíssimo | 1 |
| 2 | Diagnóstico Rápido | M (2 sprints) | Crítico | 2-3 |
| 3 | Clara com Cache Inteligente | M (1-2 sprints) | Alto | 4 |

**ROI Projetado:** R$ 1,15M em 12 meses (economia IA + aumento conversão + redução churn)

---

## Sprint 1: NEXUS como Primeira Tela (Dias 1-7)

### Objetivo
Usuários Professional e Enterprise acessam diretamente o NEXUS ao fazer login, vendo valor executivo em 5 segundos.

### Arquivos a Modificar

**1. `src/components/ProtectedRoute.tsx`**
- Adicionar função `getDefaultRoute(profile)` que retorna rota baseada no plano
- Lógica de redirect condicional após verificar onboarding completo

```
Plano           → Rota Padrão
---------------------------------
PROFESSIONAL    → /dashboard/nexus
ENTERPRISE      → /dashboard/nexus
NAVIGATOR       → /dashboard (educacional)
STARTER         → /dashboard/score-tributario
FREE            → /dashboard (upsell)
null/undefined  → /dashboard (fallback seguro)
```

**2. `src/pages/Nexus.tsx`**
- Ajustar prompt de "dados faltantes" para ser mais amigável na primeira visita
- Adicionar CTA contextual com estimativa de tempo: "Preencher dados agora (5 min)"
- Melhorar o card de alerta com linguagem de valor, não de cobrança

### Critérios de Sucesso
- [ ] Redirect funciona para todos os 5 tipos de plano
- [ ] Fallback seguro se `profile.plano` for null/undefined
- [ ] NEXUS carrega em menos de 3s (mesmo vazio)
- [ ] Prompt de dados faltantes é amigável, não intimidador

### Risco: Zero
É apenas um redirect condicional. Fallback para `/dashboard` garante que ninguém fica preso.

---

## Sprint 2-3: Diagnóstico Rápido (Dias 8-28)

### Objetivo
Novo usuário vê resultado de diagnóstico com dados reais em menos de **2 minutos** (não 60s - conforme alerta do consultor).

### ALERTA INCORPORADO: Promessa Realista
> "Prometa menos de 2 minutos, entregue em 60s quando possível."

### Arquivos a Criar

**1. Novo Componente: `src/components/onboarding/QuickDiagnosticModal.tsx`**

Características obrigatórias (conforme alerta do consultor):
- **Modal verdadeiramente obrigatório**: Usar propriedades do Radix Dialog para bloquear fechamento
  - `onOpenChange={() => {}}` - ignora tentativas de fechar
  - `onEscapeKeyDown={(e) => e.preventDefault()}` - bloqueia ESC
  - `onPointerDownOutside={(e) => e.preventDefault()}` - bloqueia click fora
  - Sem botão X no header
- **Único escape**: Botão "Pular por enquanto" que salva `diagnostic_pending = true`
- **Feedback contínuo** com mensagens progressivas (reutilizar padrão de `ImportProgressBar.tsx`):
  ```
  0s:  "Iniciando análise..."
  10s: "Processando notas fiscais..."
  30s: "Identificando créditos tributários..."
  50s: "Calculando impacto na margem..."
  70s: "Gerando insights finais..."
  90s: "Quase lá! Preparando seu painel..."
  ```
- **Validação pré-processamento**: Verificar XMLs antes de processar
  - Extensão .xml válida
  - Tamanho máximo 500KB por arquivo
  - Mínimo 3 arquivos para diagnóstico completo
  - Feedback imediato de erros

**2. Nova Edge Function: `supabase/functions/quick-diagnostic/index.ts`**

Arquitetura de timeout (conforme alerta do consultor):
- **Hard timeout de 85s** (permite até 90s com buffer para resposta)
- Execução paralela com `Promise.all`:
  - `analyzeCredits()` - timeout individual de 25s
  - `projectCashflow()` - timeout individual de 30s
  - `calculateMarginImpact()` - timeout individual de 25s
- **Resultado parcial garantido**: Se alguma análise falhar ou timeout, retorna o que conseguiu
- Usar `Promise.race` para garantir resposta dentro do timeout

```typescript
// Estrutura do retorno
interface DiagnosticResult {
  status: 'complete' | 'partial' | 'error';
  credits?: { total: number; items: CreditItem[] };
  cashflow?: { risk: 'low' | 'medium' | 'high'; impact_q2_2027: number };
  margin?: { current: number; projected: number; delta_pp: number };
  insights: string[];
  processing_time_ms: number;
}
```

**3. Nova tabela Supabase: `diagnostic_results`**
- Armazenar resultados para não reprocessar
- Campos: user_id, result_json, source (xml/erp), created_at
- TTL de 7 dias antes de expirar e sugerir re-análise

### Fluxo de Integração

**Arquivo: `src/pages/Onboarding.tsx`**
- Após `handleSubmit` bem-sucedido:
  - Setar `localStorage.setItem('needs_quick_diagnostic', 'true')`
  - Redirect para rota apropriada (NEXUS para Professional, Dashboard para outros)

**Arquivo: `src/pages/Nexus.tsx` e `src/pages/Dashboard.tsx`**
- No mount, verificar flag `needs_quick_diagnostic`
- Se true, abrir `QuickDiagnosticModal` automaticamente
- Após completar ou pular, remover flag
- Se usuário pulou anteriormente (`diagnostic_pending = true`), mostrar banner persistente

### Critérios de Sucesso
- [ ] 80%+ dos usuários completam diagnóstico
- [ ] Time-to-value médio de 90 segundos
- [ ] Modal não pode ser fechado sem interação explícita
- [ ] Resultado parcial funciona mesmo com timeout
- [ ] Validação de XMLs evita processamento desnecessário

---

## Sprint 4: Clara com Cache Inteligente (Dias 29-42)

### Objetivo
Reduzir custo de IA em 60%+ mantendo qualidade de resposta, com validação de cache para evitar informações desatualizadas.

### ALERTAS INCORPORADOS

**1. Cache com TTL Inteligente por Categoria**
> "Um erro em alíquota pode custar milhões pro cliente"

**2. Teste A/B de Qualidade Gemini vs Sonnet**
> "Economia segura: 45%, qualidade garantida"

### Nova Tabela Supabase: `clara_cache`

```sql
CREATE TABLE clara_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT UNIQUE NOT NULL,
  query_normalized TEXT NOT NULL,
  response TEXT NOT NULL,
  category TEXT NOT NULL, -- 'definition', 'aliquot', 'deadline', 'procedure'
  ttl_days INTEGER NOT NULL DEFAULT 7,
  requires_validation BOOLEAN DEFAULT false,
  hit_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Disclaimer obrigatório
  generated_at_label TEXT GENERATED ALWAYS AS (
    '[Resposta gerada em ' || TO_CHAR(created_at, 'DD/MM/YYYY') || '. Legislação pode ter mudado.]'
  ) STORED
);

CREATE INDEX idx_clara_cache_hash ON clara_cache(query_hash);
CREATE INDEX idx_clara_cache_category ON clara_cache(category);
```

**TTL por Categoria (conforme alerta):**
| Categoria | TTL | Requer Validação | Exemplo |
|-----------|-----|------------------|---------|
| definition | 90 dias | Não | "O que é CBS?" |
| aliquot | 7 dias | Sim | "Qual alíquota de IBS?" |
| deadline | 1 dia | Sim | "Quando entra Split Payment?" |
| procedure | 30 dias | Não | "Como importar XMLs?" |
| calculation | **Nunca cachear** | - | Qualquer cálculo personalizado |

### Modificação: `supabase/functions/clara-assistant/index.ts`

**Nova função: `classifyQueryComplexity()`**
```typescript
type QueryComplexity = 'cache' | 'simple' | 'complex';

function classifyQueryComplexity(message: string, context: UserContext): QueryComplexity {
  const lowerMessage = message.toLowerCase();
  
  // NUNCA CACHEAR: queries com contexto pessoal
  const personalPatterns = [/meu|minha|nossa empresa/i, /considerando|baseado|dado que/i];
  if (personalPatterns.some(p => p.test(message)) || context.hasDRE || context.hasXML) {
    return 'complex';
  }
  
  // FAQ patterns (cache)
  const faqPatterns = [
    /^o que (é|são)/i,
    /^qual (a|o)? (alíquota|prazo|data)/i,
    /^quando (começa|entra|inicia)/i,
    /^quem (pode|deve)/i,
    /^como funciona/i,
    /^pode explicar/i,
  ];
  
  if (message.length < 100 && faqPatterns.some(p => p.test(message))) {
    return 'cache';
  }
  
  // Complex signals
  const complexSignals = [
    message.length > 200,
    /cenário|simul|compar|estrat|analis/i.test(message),
    message.includes('?') && message.split('?').length > 2, // múltiplas perguntas
  ];
  
  if (complexSignals.filter(Boolean).length >= 2) {
    return 'complex';
  }
  
  return 'simple';
}
```

**Nova função: `getCategoryFromQuery()`**
```typescript
function getCategoryFromQuery(query: string): CacheCategory {
  if (/alíquota|percentual|taxa/i.test(query)) return 'aliquot';
  if (/prazo|data|quando|até/i.test(query)) return 'deadline';
  if (/o que é|significa|definição/i.test(query)) return 'definition';
  if (/como|passo|procedimento/i.test(query)) return 'procedure';
  return 'definition'; // default mais seguro
}
```

**Nova função: `shouldInvalidateCache()`**
```typescript
async function shouldInvalidateCache(entry: CacheEntry): Promise<boolean> {
  const ageMs = Date.now() - new Date(entry.created_at).getTime();
  const maxAgeMs = entry.ttl_days * 24 * 60 * 60 * 1000;
  
  if (ageMs > maxAgeMs) return true;
  
  if (entry.requires_validation && entry.category === 'aliquot') {
    // Futura integração: checar atualizações legislativas
    // Por ora, invalidar se mais de 7 dias para alíquotas
    return ageMs > 7 * 24 * 60 * 60 * 1000;
  }
  
  return false;
}
```

**Lógica de Roteamento Atualizada:**
```typescript
// Fluxo principal
const complexity = classifyQueryComplexity(message, userContext);

switch(complexity) {
  case 'cache':
    const cached = await getCachedResponse(message);
    if (cached && !await shouldInvalidateCache(cached)) {
      // Adicionar disclaimer de data
      return cached.response + '\n\n' + cached.generated_at_label;
    }
    // Fallback para simple se não tem cache
    
  case 'simple':
    // Usar Lovable AI com google/gemini-2.5-flash (mais barato)
    // Custo: ~R$ 0,30 por query
    // Salvar no cache após resposta
    
  case 'complex':
    // Usar Claude Sonnet 4 (modelo atual)
    // Custo: ~R$ 3,00 por query
    // NÃO salvar no cache (resposta personalizada)
}
```

### ALERTA INCORPORADO: Teste A/B de Qualidade

Antes de commit definitivo no Gemini para queries simples:
1. Durante 14 dias, rotear 50% para Gemini, 50% para Sonnet
2. Medir:
   - NPS por grupo
   - Taxa de follow-up (usuário perguntou de novo?)
   - Thumbs up/down se implementado
3. Critério: Se NPS cai mais de 5 pontos com Gemini, manter Sonnet para todo resto

### Cache Warm-Up Inicial

Script para popular cache com 100 FAQs comuns antes do lançamento:
- Fonte: histórico de conversas com Clara
- Fonte: perguntas do TribuTalks Podcast
- Fonte: FAQs do blog e lives

### Projeção de Economia

| Cenário | Custo/usuário/mês | Economia vs Atual |
|---------|-------------------|-------------------|
| Atual (100% Sonnet) | R$ 36 | - |
| Conservador (cache + teste A/B) | R$ 18 | 50% |
| Otimista (cache + Gemini validado) | R$ 12 | 67% |

---

## Sprint 5: Validação e Ajustes (Dias 43-50)

### Dashboard de Monitoramento

Criar painel admin para acompanhar as 3 mudanças:

```
┌────────────────────────────────────────┐
│ NEXUS FIRST - Últimos 7 dias          │
├────────────────────────────────────────┤
│ Professional → NEXUS primeiro: 87%    │
│ Tempo até primeira ação: 23s          │
│ vs. grupo controle: +67% engagement   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ DIAGNÓSTICO RÁPIDO - Últimos 7 dias   │
├────────────────────────────────────────┤
│ Taxa de conclusão: 73%                │
│ Tempo médio: 78s                      │
│ Upload XML: 65% | Conexão ERP: 35%    │
│ Taxa de "Pular": 27%                  │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ CLARA CACHE - Últimos 7 dias          │
├────────────────────────────────────────┤
│ Hit rate: 42%                         │
│ Cache: 42% | Gemini: 31% | Sonnet: 27%│
│ Custo/usuário: R$ 14,20/mês           │
│ Economia vs. baseline: 61%            │
└────────────────────────────────────────┘
```

### Entrevistas com Usuários
- 5 entrevistas com Professional ativos (D7 pós-onboarding)
- Foco: "Qual foi seu momento 'aha'?" e "O que ainda não está claro?"

---

## Checklist Pré-Lançamento

### Sprint 1 (NEXUS First)
- [ ] Testado redirect para todos os 5 planos
- [ ] Fallback funciona se plano = null
- [ ] NEXUS carrega em menos de 3s
- [ ] Prompt "dados faltantes" é amigável

### Sprint 2-3 (Diagnóstico Rápido)
- [ ] Modal não pode ser fechado sem interação explícita
- [ ] Validação de XMLs antes de processar
- [ ] Timeout de 85s testado com dados reais
- [ ] Resultado parcial gera NEXUS utilizável
- [ ] Feedback progressivo a cada 10-20s
- [ ] Flag `diagnostic_pending` persiste corretamente

### Sprint 4 (Clara Cache)
- [ ] Tabela `clara_cache` criada com TTL por categoria
- [ ] Classificador testado com 50+ queries reais
- [ ] Disclaimer de data aparece em respostas de cache
- [ ] Teste A/B Gemini vs Sonnet configurado
- [ ] Cache warm-up com 100 FAQs populado

---

## Métricas de Sucesso (45 dias)

| Métrica | Baseline | Meta |
|---------|----------|------|
| Time-to-Value | ~5 min | < 2 min |
| Engagement D1 | N/A | +40% |
| Conversão Trial→Pago | N/A | +25% |
| Custo IA/usuário | R$ 36/mês | < R$ 18/mês |
| NPS | N/A | > 50 |

---

## Impacto Financeiro Projetado (12 meses)

| Métrica | Valor |
|---------|-------|
| Economia IA | R$ 613k/ano |
| Receita adicional (conversão) | R$ 400k/ano |
| Receita retida (churn) | R$ 137k/ano |
| **Total** | **R$ 1,15M/ano** |

**ROI: 14x sobre investimento de ~R$ 80k (300h dev)**

