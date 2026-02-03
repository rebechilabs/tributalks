# TribuTalks — Documentação Completa para Empresário/Dev

## Resumo Executivo

O TribuTalks é uma **plataforma SaaS de inteligência tributária AI-Native** voltada para CEOs e CFOs de empresas com faturamento acima de R$ 1 milhão/mês. A plataforma ajuda empresas a se prepararem para a **Reforma Tributária brasileira** (2026-2033), oferecendo simuladores, diagnósticos, IA assistente com memória evolutiva, agentes especializados e comunidade.

### Diferenciais AI-Native

| Característica | Implementação |
|----------------|---------------|
| **Agentes Especializados** | 3 agentes (Fiscal, Margem, Compliance) com routing inteligente |
| **Memória Evolutiva** | Clara aprende padrões e preferências de cada usuário |
| **Ações Autônomas** | Sistema de triggers que executa tarefas automaticamente |
| **Feedback Loop** | Coleta thumbs up/down para fine-tuning futuro |
| **Insights Proativos** | Sistema detecta problemas e gera alertas automáticos |
| **Contexto Rico** | Dados reais do usuário (DRE, Score, créditos) injetados no prompt |
| **Aprendizado Contínuo** | Cada interação alimenta base de treinamento proprietária |

---

# PARTE 1: VISÃO DO EMPRESÁRIO

## Proposta de Valor

| Problema | Solução TribuTalks |
|----------|-------------------|
| Reforma Tributária complexa (EC 132/2023, LC 214/2025) | Plataforma com timeline, calculadoras e alertas |
| Falta de visibilidade sobre impacto no caixa | NEXUS: 8 KPIs em tempo real |
| Créditos tributários não aproveitados | Radar de Créditos (24 regras automatizadas) |
| Precificação sem considerar novos impostos | PriceGuard com gross-up reverso |
| Dúvidas tributárias fora do horário comercial | Clara AI 24/7 com agentes especializados |

---

## Planos e Preços

| Plano | Preço | CNPJs | Usuários | Destaques |
|-------|-------|-------|----------|-----------|
| **STARTER** | R$ 397/mês | 1 | 1 | Clara AI (30 msgs/dia), Score, Split Payment, Calculadora RTC |
| **NAVIGATOR** | R$ 1.297/mês | 2 | 2 | + Notícias, Timeline, Workflows, Comunidade Circle |
| **PROFESSIONAL** | R$ 2.997/mês | 5 | 4 | + XMLs, Radar Créditos, DRE, NEXUS, 61+ Oportunidades, ERP |
| **ENTERPRISE** | Sob consulta | ∞ | ∞ | + Consultoria jurídica (Rebechi & Silva), White Label, API |

---

## Ferramentas por Categoria

### Etapa 1: ENTENDER
| Ferramenta | Descrição | Plano Mínimo |
|------------|-----------|--------------|
| Score Tributário | Avalia saúde fiscal em 11 perguntas (nota A+ a E) | FREE |
| Timeline 2026-2033 | Calendário de marcos da Reforma | FREE |
| Notícias da Reforma | Feed curado + "Pílula do Dia" | NAVIGATOR |

### Etapa 2: SIMULAR
| Ferramenta | Descrição | Plano Mínimo |
|------------|-----------|--------------|
| Simulador Split Payment | Impacto no fluxo de caixa | FREE |
| Comparativo de Regimes | Simples vs Presumido vs Real | FREE |
| Calculadora RTC (NCM) | CBS + IBS + IS por produto | FREE |
| Calculadora NBS (Serviços) | Novos tributos para serviços | NAVIGATOR |

### Etapa 3: DIAGNOSTICAR
| Ferramenta | Descrição | Plano Mínimo |
|------------|-----------|--------------|
| DRE Inteligente | Demonstrativo + impacto da Reforma no lucro | PROFESSIONAL |
| Radar de Créditos | 24 regras que identificam créditos em XMLs | PROFESSIONAL |
| Motor de Oportunidades | 61+ incentivos fiscais mapeados | PROFESSIONAL |
| Suite Margem Ativa | OMC-AI (compras) + PriceGuard (vendas) | PROFESSIONAL |

### Etapa 4: COMANDAR
| Ferramenta | Descrição | Plano Mínimo |
|------------|-----------|--------------|
| NEXUS | 8 KPIs consolidados + insights automáticos | PROFESSIONAL |
| Painel Executivo | Relatórios PDF + consultoria jurídica | ENTERPRISE |

### EXTRAS
| Ferramenta | Descrição | Plano Mínimo |
|------------|-----------|--------------|
| Clara AI | Copiloto tributário com agentes especializados | STARTER |
| Analisador de Documentos | IA analisa contratos | NAVIGATOR |
| Workflows Guiados | Jornadas estruturadas (4 roteiros) | NAVIGATOR |
| Comunidade Circle | Network + fóruns + lives | NAVIGATOR |
| Checklist da Reforma | Avalia prontidão operacional | NAVIGATOR |

---

## Sistema de Notificações

| Tipo | Descrição |
|------|-----------|
| Sino no Header | Contador de não lidas + lista de notificações |
| Categorias | geral, reforma, indicacao, sistema |
| Realtime | Sincronização instantânea via WebSocket |
| E-mails | Apenas métricas diárias (admin) e contatos diretos |

---

## Clara AI — Sistema de Agentes Especializados

A Clara utiliza uma arquitetura AI-Native com 3 agentes especializados que colaboram:

### Agentes

| Agente | Domínio | Capabilities |
|--------|---------|--------------|
| **Fiscal** | Créditos, NCM, obrigações | Análise de créditos, classificação NCM, compliance fiscal |
| **Margem** | DRE, pricing, custos | Proteção de margem, simulação de preços, análise de custos |
| **Compliance** | Prazos, reforma, regulatório | Monitoramento de deadlines, alertas de mudanças, adequação |

### Routing Inteligente

O sistema usa keyword scoring + análise de contexto de tela para rotear automaticamente:

```
Usuário: "Qual o impacto do CBS na minha margem?"
           ↓
Router: Detecta "CBS" (fiscal) + "margem" (margin)
           ↓
Agente Selecionado: MarginAgent (margem tem prioridade pelo contexto)
```

### Insights Proativos

| Tipo | Exemplos |
|------|----------|
| **Alertas** | Score abaixo de 50, margem crítica |
| **Recomendações** | Recalcular Score após 30 dias, importar mais XMLs |
| **Oportunidades** | Créditos acima de R$ 10k identificados |
| **Riscos** | Impacto negativo da Reforma na margem |

Os insights aparecem no Dashboard com CTAs diretos para ação.

---

## Programa de Indicação

| Indicações Qualificadas | Desconto |
|-------------------------|----------|
| 1+ | 5% |
| 3+ | 10% |
| 5+ | 15% |
| 10+ | 20% |

- Código único no formato `TRIBXXXX`
- Link de indicação para `/cadastro?ref=CODIGO`
- Status: pending → qualified (30 dias pagos) → rewarded

---

## Comunidade e Acessos

| Plano | Acesso |
|-------|--------|
| NAVIGATOR | Grupo de WhatsApp |
| PROFESSIONAL+ | Circle (Inteligência Tributária Connect) |

Ao assinar Professional, o usuário recebe automaticamente:
- E-mail de boas-vindas via Resend
- Link pessoal para entrar na comunidade Circle
- Tag `professional_subscriber` no Beehiiv (para automações)

---

## Newsletter (Beehiiv)

- **Tributalks News**: Newsletter semanal com curadoria de notícias
- Tags: `professional_subscriber` para automação de boas-vindas
- Integração via API Beehiiv no webhook de assinatura

---

## Onboarding e Gamificação

### First Mission
- Missão inicial personalizada por regime tributário
- Simples Nacional, Presumido ou Real têm fluxos diferentes

### Guided Tour
- 5 etapas visuais via `react-joyride`
- Apresenta Clara, ferramentas principais e comunidade

### Achievements (14 badges)
- Sistema de conquistas por uso de ferramentas
- Streaks diários de acesso

### Onboarding Checklist
- Aparece nos primeiros 7 dias
- Guia para completar perfil, score, DRE, etc.

---

## Roadmap 2026+

| Feature | Status |
|---------|--------|
| Agentes Especializados (Fiscal, Margem, Compliance) | ✅ Implementado |
| Memória Evolutiva | ✅ Implementado |
| Ações Autônomas | ✅ Implementado |
| Fine-tuning da Clara com dados coletados | Em coleta |
| Embeddings vetoriais (busca semântica) | Planejado |
| App Mobile (iOS/Android) | Planejado |
| Orquestração MCP | Planejado |

---

# PARTE 2: VISÃO TÉCNICA (DEV)

## Stack Tecnológico

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + Vite + TypeScript |
| Estilização | Tailwind CSS + shadcn/ui |
| Estado | TanStack Query + Context API |
| Backend | Supabase (Lovable Cloud) |
| Edge Functions | Deno (Supabase Functions) |
| AI | Claude Sonnet 4 + Gemini 2.5 Flash via Lovable AI |
| Pagamentos | Stripe (subscriptions + one-off) |
| E-mail | Resend (transacional) + Beehiiv (newsletter) |
| Comunidade | Circle.so |
| PWA | vite-plugin-pwa |

---

## Arquitetura AI-Native (v6)

### Diagrama Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLARA AI SYSTEM                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    ORQUESTRADOR CENTRAL                            │ │
│  │                                                                     │ │
│  │     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │ │
│  │     │ FISCAL AGENT │ │ MARGIN AGENT │ │ COMPLIANCE   │            │ │
│  │     │              │ │              │ │ AGENT        │            │ │
│  │     │ • Créditos   │ │ • DRE        │ │ • Prazos     │            │ │
│  │     │ • NCM        │ │ • Pricing    │ │ • Reforma    │            │ │
│  │     │ • Compliance │ │ • Custos     │ │ • Adequação  │            │ │
│  │     └──────┬───────┘ └──────┬───────┘ └──────┬───────┘            │ │
│  │            │                │                │                     │ │
│  │            └────────────────┼────────────────┘                     │ │
│  │                             │                                      │ │
│  │                     ┌───────▼───────┐                              │ │
│  │                     │    ROUTER     │                              │ │
│  │                     │ (keyword +    │                              │ │
│  │                     │  context)     │                              │ │
│  │                     └───────────────┘                              │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     MEMÓRIA EVOLUTIVA                              │ │
│  │                                                                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │ │
│  │  │ Preferências │  │   Padrões    │  │ Decisões do Usuário      │ │ │
│  │  │ (confidence) │  │  Detectados  │  │ (histórico)              │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘ │ │
│  │                                                                     │ │
│  │  Confidence Score: 0.1 → 0.95 (aumenta com reforço)               │ │
│  │  Decay Rate: Padrões antigos perdem relevância                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     AÇÕES AUTÔNOMAS                                │ │
│  │                                                                     │ │
│  │  Triggers:                                                          │ │
│  │  • xml_imported → analyze_credits (auto)                           │ │
│  │  • score_below_60 → compliance_alert (auto)                        │ │
│  │  • margin_drop_5pp → margin_alert (auto)                           │ │
│  │  • deadline_7_days → send_reminder (auto)                          │ │
│  │  • benefit_expiring → alert_expiration (auto)                      │ │
│  │                                                                     │ │
│  │  Status: pending → approved → executed                              │ │
│  │  Priority: low | medium | high | urgent                             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tabelas AI-Native

| Tabela | Descrição | Uso |
|--------|-----------|-----|
| `clara_agents` | Configuração dos agentes especializados | Capabilities, triggers, prioridades |
| `clara_autonomous_actions` | Fila de ações autônomas | Triggers, payloads, status, resultados |
| `clara_user_decisions` | Decisões do usuário rastreadas | Contexto, opções, escolha, feedback |
| `clara_learned_patterns` | Padrões aprendidos por usuário | Tipo, valor, confidence, decay |
| `clara_memory` | Memórias de longo prazo | Contexto, importância, reforços |
| `clara_conversations` | Histórico de todas as conversas | Continuidade de contexto |
| `clara_feedback` | Avaliações 👍👎 das respostas | Base para fine-tuning |
| `clara_insights` | Insights proativos gerados | Alertas automáticos |
| `clara_knowledge_base` | Base de conhecimento jurídico | RAG / Injeção de contexto |
| `clara_cache` | Cache de respostas frequentes | Economia de tokens |

### Hooks AI-Native

```typescript
// src/hooks/clara/index.ts

// Agentes Especializados
export { useClaraAgents, useFiscalAgent, useMarginAgent, useComplianceAgent } from './useClaraAgents';

// Memória Evolutiva e Aprendizado
export { useClaraLearning, useClaraContextMemory } from './useClaraLearning';

// Ações Autônomas
export { useClaraAutonomousActions, AUTO_TRIGGERS } from './useClaraAutonomousActions';
```

### Componentes AI-Native

```typescript
// src/components/clara/index.ts

export { ClaraAgentBadge } from './ClaraAgentBadge';           // Badge do agente ativo
export { ClaraAutonomousActionCard } from './ClaraAutonomousActionCard';  // Card de ação
export { ClaraAutonomousPanel } from './ClaraAutonomousPanel';  // Painel de ações pendentes
export { ClaraFeedbackButtons } from './ClaraFeedbackButtons';  // Thumbs up/down
export { ClaraInsightCard } from './ClaraInsightCard';          // Card de insight
export { ClaraInsightsPanel } from './ClaraInsightsPanel';      // Painel de insights
```

### Sistema de Agentes

```typescript
// Tipos de Agentes
type AgentType = 'fiscal' | 'margin' | 'compliance' | 'general';

// Interface do Agente
interface ClaraAgent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  capabilities: string[];
  triggerConditions: Record<string, unknown>;
  priorityRules: Record<string, unknown>;
  status: 'active' | 'inactive' | 'learning';
}

// Routing
const routeQuery = (query: string, screenContext?: string): AgentType => {
  // 1. Conta keywords de cada domínio
  // 2. Considera contexto de tela
  // 3. Retorna agente com maior score
};
```

### Sistema de Memória Evolutiva

```typescript
// Padrão Aprendido
interface LearnedPattern {
  id: string;
  userId: string;
  patternType: 'preference' | 'behavior' | 'decision' | 'context';
  patternKey: string;
  patternValue: Record<string, unknown>;
  confidence: number;        // 0.1 a 0.95
  timesObserved: number;
  decayRate: number;         // Quanto perde por dia sem uso
  lastObservedAt: Date;
}

// Ajuste de Confidence
const adjustConfidence = (current: number, positive: boolean): number => {
  const delta = positive ? 0.1 : -0.15;
  return Math.max(0.1, Math.min(0.95, current + delta));
};
```

### Sistema de Ações Autônomas

```typescript
// Triggers Disponíveis
const AUTO_TRIGGERS = {
  'xml_imported': {
    event: 'xml_imported',
    agentType: 'fiscal',
    actionType: 'analyze_credits',
    requiresApproval: false,
    priority: 'medium',
  },
  'score_below_60': {
    event: 'score_below_threshold',
    agentType: 'fiscal',
    actionType: 'generate_compliance_alert',
    requiresApproval: false,
    priority: 'high',
  },
  'margin_drop_5pp': {
    event: 'margin_drop_detected',
    agentType: 'margin',
    actionType: 'generate_margin_alert',
    requiresApproval: false,
    priority: 'high',
  },
  // ... mais triggers
};

// Status Flow
// pending → approved → executed
// pending → rejected
// approved → failed
```

### Fluxo de Dados (Data Flywheel)

```
Usuário interage com plataforma
        ↓
Sistema detecta eventos (XML importado, DRE atualizado, etc.)
        ↓
AUTO_TRIGGERS disparam ações autônomas
        ↓
Agente especializado processa a tarefa
        ↓
Sistema aprende com resultado:
├── clara_learned_patterns (padrões detectados)
├── clara_user_decisions (escolhas do usuário)
└── clara_memory (contexto importante)
        ↓
Clara se torna mais inteligente e personalizada
```

---

## Estrutura de Arquivos

```text
src/
├── components/
│   ├── ui/                    # shadcn/ui (50+ componentes)
│   ├── landing/               # Página de vendas
│   ├── dashboard/             # Layout + cards do dashboard
│   ├── clara/                 # Componentes AI-Native
│   │   ├── ClaraAgentBadge.tsx        # Badge do agente ativo
│   │   ├── ClaraAutonomousActionCard.tsx  # Card de ação autônoma
│   │   ├── ClaraAutonomousPanel.tsx   # Painel de ações pendentes
│   │   ├── ClaraFeedbackButtons.tsx   # Thumbs up/down
│   │   ├── ClaraInsightCard.tsx       # Card de insight
│   │   └── ClaraInsightsPanel.tsx     # Painel de insights
│   ├── nexus/                 # NEXUS Command Center
│   ├── credits/               # Radar de Créditos
│   ├── dre/                   # DRE Inteligente
│   ├── onboarding/            # FirstMission, GuidedTour, Checklist
│   ├── achievements/          # Badges e Streaks
│   ├── referral/              # Programa de Indicação
│   └── common/                # Componentes compartilhados
├── pages/
│   ├── Dashboard.tsx          # Home logada (com InsightsPanel)
│   ├── Nexus.tsx              # Centro de Comando
│   ├── ClaraAI.tsx            # Interface Clara AI (com Feedback)
│   ├── Indicar.tsx            # Programa de Indicação
│   ├── calculadora/           # Calculadoras (RTC, NBS, Split)
│   └── admin/
│       ├── AdminDashboard.tsx     # Painel admin principal
│       ├── AdminTrainingData.tsx  # Training Data Center
│       └── ...
├── hooks/
│   ├── useAuth.tsx            # Autenticação + perfil
│   ├── clara/                 # Hooks AI-Native
│   │   ├── index.ts           # Exports centralizados
│   │   ├── useClaraAgents.ts  # Agentes especializados + routing
│   │   ├── useClaraLearning.ts    # Memória evolutiva + padrões
│   │   └── useClaraAutonomousActions.ts  # Ações autônomas
│   ├── useClaraMemory.ts      # Memória + feedback + insights
│   ├── useClaraContext.ts     # Contexto de navegação
│   ├── useNexusData.ts        # 8 KPIs do NEXUS
│   ├── useReferral.ts         # Sistema de indicação
│   ├── useNotifications.ts    # Notificações realtime
│   ├── useAchievements.ts     # Sistema de badges
│   └── useFeatureAccess.ts    # Controle de acesso por plano
├── data/
│   ├── toolsManual.ts         # Base de conhecimento (18 ferramentas)
│   └── checklistReformaItems.ts
├── config/
│   └── site.ts                # Links Stripe, contatos
└── integrations/
    └── supabase/
        ├── client.ts          # Cliente Supabase
        └── types.ts           # Tipos gerados automaticamente
```

---

## Supabase Functions (Edge Functions)

| Função | Descrição |
|--------|-----------|
| `clara-assistant` | Orquestra Clara AI (Claude/Gemini) + salva conversas + extrai memórias |
| `generate-clara-insights` | Analisa dados e gera insights proativos |
| `stripe-webhook` | Processa assinaturas Stripe + envia e-mail welcome |
| `calculate-rtc` | Calcula CBS/IBS/IS via API Gov |
| `calculate-tax-score` | Gera score tributário (0-1000) |
| `analyze-credits` | Identifica créditos em XMLs |
| `process-xml-batch` | Processa lote de XMLs |
| `process-dre` | Calcula DRE + impacto reforma |
| `match-opportunities` | Matching perfil × 61 oportunidades |
| `erp-sync` | Sincroniza Omie, Bling, Conta Azul |
| `send-executive-report` | Gera relatório PDF executivo |
| `fetch-news` | Busca notícias de fontes tributárias |
| `process-referral-rewards` | Aplica descontos de indicação |
| `subscribe-newsletter` | Integra Beehiiv |

---

## Tabelas Supabase (Principais)

### Core
| Tabela | Descrição |
|--------|-----------|
| `profiles` | Usuários + plano + stripe/mp IDs |
| `company_profile` | Perfil completo da empresa (100+ campos) |
| `company_dre` | DREs + cálculos + impacto reforma |
| `tax_score` | Score tributário + dimensões |

### AI-Native
| Tabela | Descrição |
|--------|-----------|
| `clara_agents` | Configuração dos agentes especializados |
| `clara_autonomous_actions` | Fila de ações autônomas com triggers |
| `clara_user_decisions` | Decisões rastreadas para aprendizado |
| `clara_learned_patterns` | Padrões aprendidos (preferências, comportamentos) |
| `clara_memory` | Memórias de longo prazo (contexto, decisões, preferências) |
| `clara_conversations` | Histórico de conversas (user + assistant) |
| `clara_feedback` | Avaliações de respostas (positive, negative, neutral) |
| `clara_insights` | Insights proativos (alertas, recomendações, riscos) |
| `clara_knowledge_base` | Base de conhecimento jurídico/fiscal |
| `clara_cache` | Cache de respostas frequentes |

### Operacional
| Tabela | Descrição |
|--------|-----------|
| `identified_credits` | Créditos encontrados nos XMLs |
| `company_opportunities` | Match usuário × oportunidades |
| `notifications` | Sistema de notificações |
| `referral_codes` | Códigos de indicação |
| `referrals` | Registro de indicações |
| `erp_connections` | Conexões com ERPs |
| `erp_sync_logs` | Logs de sincronização |

---

## Clara AI — Prompt Architecture

### Componentes do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLARA AI SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │ KNOWLEDGE CORE   │    │ DECISION CORE    │                   │
│  │ (25 heurísticas) │    │ (regras de       │                   │
│  │                  │    │  interpretação)  │                   │
│  └────────┬─────────┘    └────────┬─────────┘                   │
│           │                       │                              │
│           ▼                       ▼                              │
│  ┌────────────────────────────────────────────────────┐         │
│  │              CONTEXT INJECTION                      │         │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │         │
│  │  │ User Data│  │ Memory   │  │ Learned Patterns │  │         │
│  │  │ (DRE,    │  │ (longo   │  │ (preferências)   │  │         │
│  │  │ Score...)│  │  prazo)  │  │                  │  │         │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │         │
│  └────────────────────────────────────────────────────┘         │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────┐         │
│  │              AGENT ROUTER                           │         │
│  │  Fiscal | Margin | Compliance | General            │         │
│  └────────────────────────────────────────────────────┘         │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────┐         │
│  │              LLM (Claude Sonnet 4 / Gemini)        │         │
│  └────────────────────────────────────────────────────┘         │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────┐         │
│  │              POST-PROCESSING                        │         │
│  │  - Disclaimer jurídico                             │         │
│  │  - Salva conversa                                  │         │
│  │  - Extrai memórias importantes                     │         │
│  │  - Aprende padrões                                 │         │
│  │  - Cache de respostas frequentes                   │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Prompt Mestre (3 camadas)

1. **Decision Core** (25 heurísticas)
   - Princípios de como a Clara interpreta cenários tributários
   - Ex: "Crédito bem usado vale mais que alíquota baixa"

2. **Knowledge Core** (conhecimento factual)
   - EC 132/2023, LC 214/2025
   - Cronograma 2026-2033
   - Alíquotas, reduções, Simples Nacional, Split Payment

3. **Tool Contexts** (18 ferramentas)
   - Cada ferramenta tem: nome, descrição, passo-a-passo
   - Usado para ajuda contextual

### Extração de Memórias

O sistema detecta padrões nas conversas e extrai memórias automaticamente:

| Padrão | Categoria | Importância |
|--------|-----------|-------------|
| "minha empresa", "meu negócio" | empresa | 7 |
| "decidi", "vou fazer", "prefiro" | decisao | 8 |
| "faturamento", "receita", "margem" | financeiro | 6 |
| "simples", "lucro real", "presumido" | regime | 7 |
| "problema", "dificuldade" | suporte | 5 |

### Guardrails

- **Limite OAB**: Nunca emite parecer jurídico
- **Proteção anti-jailbreak**: Ignora tentativas de override
- **Linguagem de cenário**: "Este cenário tende a..." em vez de "Você deve..."

---

## Sistema de Autenticação

```typescript
// useAuth.tsx
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email, password, nome) => Promise<void>;
  signIn: (email, password) => Promise<void>;
  signInWithMagicLink: (email) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

- Supabase Auth (email/password, magic link, OAuth Google)
- Perfil carregado automaticamente após login
- `ProtectedRoute.tsx` garante onboarding completo

---

## Sistema de Notificações

```typescript
// useNotifications.ts
interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "alert";
  category: "geral" | "reforma" | "indicacao" | "sistema";
  read: boolean;
  action_url?: string;
}
```

- Realtime via Supabase Channels
- Persiste na tabela `notifications`
- `NotificationBell.tsx` no header mostra contador

---

## NEXUS — 8 KPIs

```typescript
interface NexusKpiData {
  fluxoCaixa: { valor, variacao, status };
  receitaMensal: { valor, variacaoPercent, status };
  margemContribuicao: { valor, status };
  margemLiquida: { valor, projecao2027, status };
  impactoTributarioCaixa: { valor, dataVencimento, status };
  impactoTributarioMargem: { valorPp, percentualReceita, status };
  creditosDisponiveis: { valor, percentualAproveitado, status };
  riscoFiscal: { score, nivel, status };
}
```

- Status: `success` (verde) | `warning` (amarelo) | `danger` (vermelho)
- Insights automáticos baseados em cruzamento de KPIs

---

## Integrações ERP

| ERP | Módulos Sincronizados |
|-----|----------------------|
| Omie | NF-e, Produtos, Financeiro, Empresa |
| Bling | NF-e, Produtos |
| Conta Azul | NF-e, Financeiro |
| Tiny | NF-e, Produtos |
| Sankhya | NF-e, Financeiro |
| TOTVS | NF-e, Financeiro |

- Padrão Strategy na Edge Function `erp-sync`
- Normaliza dados para schema unificado
- Auto-sync configurável (frequência em horas)

---

## Webhooks e Pagamentos

### Stripe

```typescript
// stripe-webhook/index.ts
// Eventos tratados:
// - checkout.session.completed → ativa plano + envia welcome email
// - customer.subscription.updated → atualiza plano
// - customer.subscription.deleted → desativa plano

// Welcome Email (Professional):
await sendProfessionalWelcomeEmail(payerEmail);
// Envia via Resend com link Circle
```

---

## Variáveis de Ambiente

| Variável | Uso |
|----------|-----|
| `VITE_SUPABASE_URL` | URL do Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave pública |
| `RESEND_API_KEY` | Envio de e-mails |
| `BEEHIIV_API_KEY` | Newsletter |
| `STRIPE_SECRET_KEY` | Pagamentos (via Lovable Stripe connector) |
| `LOVABLE_API_KEY` | IA (Clara AI) |

---

## RLS (Row Level Security)

Todas as tabelas de usuário têm RLS ativo:

```sql
-- Exemplo: profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## Logs e Monitoramento

| Tabela | Descrição |
|--------|-----------|
| `erp_sync_logs` | Logs de sincronização ERP |
| `executive_report_logs` | Envios de relatório executivo |
| `stripe_subscription_events` | Eventos do Stripe |
| `credit_usage` | Uso de créditos Clara AI |
| `clara_conversations` | Histórico de interações Clara |
| `clara_feedback` | Avaliações de qualidade |
| `clara_autonomous_actions` | Ações executadas automaticamente |

---

## PWA

- Configurado via `vite-plugin-pwa`
- Ícones: `/pwa-192x192.png`, `/pwa-512x512.png`
- Service worker para cache e offline
- Componente `PWAUpdater.tsx` para notificar atualizações

---

## Performance

- **useDashboardData**: Requisição única batch para dados do dashboard
- **TanStack Query**: Cache e refetch inteligente
- **Lazy loading**: Componentes pesados carregados sob demanda
- **Realtime seletivo**: Apenas tabelas críticas (notifications)
- **Clara Cache**: Respostas frequentes cacheadas por categoria

---

## Arquivos de Configuração

| Arquivo | Descrição |
|---------|-----------|
| `tailwind.config.ts` | Tema customizado + variáveis CSS |
| `vite.config.ts` | Build config + PWA |
| `supabase/config.toml` | Configuração Supabase |
| `src/config/site.ts` | Links de pagamento + contatos |

---

## Testes

- `vitest` configurado
- Testes de Edge Functions via `supabase--test-edge-functions`
- Arquivos de teste em `src/test/` e `*_test.ts`

---

## Deploy

- **Frontend**: Lovable (auto-deploy no commit)
- **Backend**: Lovable Cloud (Edge Functions auto-deploy)
- **Domínio Live**: `https://tributechai.lovable.app`
- **Preview**: `https://id-preview--*.lovable.app`

---

## Notas Técnicas - Referências Legadas

### Tabela tributbot_messages
A tabela `tributbot_messages` no banco de dados mantém o nome original por razões de compatibilidade. 
Esta tabela armazena o histórico de mensagens da Clara AI. O nome interno não afeta a experiência do usuário.

### Feature Key
A feature key `clara_ai` substituiu `tribubot` em:
- `src/hooks/useFeatureAccess.ts`
- `src/hooks/useUserCredits.ts`

Novos registros usam `clara_ai`, mas registros históricos podem conter `tribubot`.

### Redirect Legado
A rota `/tribubot` redireciona automaticamente para `/clara-ai` para manter compatibilidade com links antigos.

---

## Estratégia AI-Native: Roadmap

### Fase 1: Coleta de Dados ✅
- [x] Tabelas de memória, feedback e conversas
- [x] Botões de thumbs up/down no chat
- [x] Extração automática de memórias
- [x] Painel admin Training Data Center
- [x] Export JSONL para fine-tuning

### Fase 2: Agentes Especializados ✅
- [x] FiscalAgent (créditos, NCM, compliance)
- [x] MarginAgent (DRE, pricing, custos)
- [x] ComplianceAgent (prazos, reforma, adequação)
- [x] Router inteligente (keyword + context)
- [x] UI ClaraAgentBadge

### Fase 3: Memória Evolutiva ✅
- [x] Tabela clara_learned_patterns
- [x] Tracking de decisões do usuário
- [x] Sistema de confidence (0.1 → 0.95)
- [x] Decay de relevância
- [x] Hook useClaraLearning

### Fase 4: Ações Autônomas ✅
- [x] Tabela clara_autonomous_actions
- [x] Sistema de triggers (AUTO_TRIGGERS)
- [x] Fila de aprovação para ações de alto impacto
- [x] Status flow (pending → approved → executed)
- [x] UI ClaraAutonomousPanel

### Fase 5: RAG Semântico (Próximo)
- [ ] Habilitar pgvector para embeddings
- [ ] Embeddings da knowledge_base
- [ ] Busca semântica em memórias
- [ ] Threshold de similaridade configurável

### Fase 6: Fine-Tuning
- [ ] Atingir 100+ feedbacks positivos
- [ ] Curar dataset (remover ruído)
- [ ] Fine-tune modelo especializado
- [ ] A/B test vs modelo base

### Fase 7: Orquestração MCP
- [ ] Model Context Protocol
- [ ] Integração cross-tool
- [ ] Clara controla ERPs e ferramentas externas
- [ ] UI "invisível" (auditoria apenas)
