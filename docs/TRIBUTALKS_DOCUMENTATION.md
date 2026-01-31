# TribuTalks — Documentação Completa para Empresário/Dev

## Resumo Executivo

O TribuTalks é uma **plataforma SaaS de inteligência tributária** voltada para CEOs e CFOs de empresas com faturamento acima de R$ 1 milhão/mês. A plataforma ajuda empresas a se prepararem para a **Reforma Tributária brasileira** (2026-2033), oferecendo simuladores, diagnósticos, IA assistente e comunidade.

---

# PARTE 1: VISÃO DO EMPRESÁRIO

## Proposta de Valor

| Problema | Solução TribuTalks |
|----------|-------------------|
| Reforma Tributária complexa (EC 132/2023, LC 214/2025) | Plataforma com timeline, calculadoras e alertas |
| Falta de visibilidade sobre impacto no caixa | NEXUS: 8 KPIs em tempo real |
| Créditos tributários não aproveitados | Radar de Créditos (24 regras automatizadas) |
| Precificação sem considerar novos impostos | PriceGuard com gross-up reverso |
| Dúvidas tributárias fora do horário comercial | Clara AI 24/7 |

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
| Clara AI | Copiloto de decisão tributária | STARTER |
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
| Dashboard Analytics (KPIs avançados) | Planejado |
| Multi-empresa (gestão de grupo) | Planejado |
| App Mobile (iOS/Android) | Planejado |

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
| AI | Claude Sonnet 4 via Lovable AI |
| Pagamentos | Mercado Pago (subscriptions) |
| E-mail | Resend (transacional) + Beehiiv (newsletter) |
| Comunidade | Circle.so |
| PWA | vite-plugin-pwa |

---

## Estrutura de Arquivos

```text
src/
├── components/
│   ├── ui/                    # shadcn/ui (50+ componentes)
│   ├── landing/               # Página de vendas
│   ├── dashboard/             # Layout + cards do dashboard
│   ├── nexus/                 # NEXUS Command Center
│   ├── credits/               # Radar de Créditos
│   ├── dre/                   # DRE Inteligente
│   ├── onboarding/            # FirstMission, GuidedTour, Checklist
│   ├── achievements/          # Badges e Streaks
│   ├── referral/              # Programa de Indicação
│   └── common/                # Componentes compartilhados
├── pages/
│   ├── Dashboard.tsx          # Home logada
│   ├── Nexus.tsx              # Centro de Comando
│   ├── ClaraAI.tsx            # Interface Clara AI (Copiloto Tributário)
│   ├── Indicar.tsx            # Programa de Indicação
│   ├── calculadora/           # Calculadoras (RTC, NBS, Split)
│   └── admin/                 # Painel administrativo
├── hooks/
│   ├── useAuth.tsx            # Autenticação + perfil
│   ├── useNexusData.ts        # 8 KPIs do NEXUS
│   ├── useReferral.ts         # Sistema de indicação
│   ├── useNotifications.ts    # Notificações realtime
│   ├── useAchievements.ts     # Sistema de badges
│   └── useFeatureAccess.ts    # Controle de acesso por plano
├── data/
│   ├── toolsManual.ts         # Base de conhecimento (18 ferramentas)
│   └── checklistReformaItems.ts
├── config/
│   └── site.ts                # Links Mercado Pago, contatos
└── integrations/
    └── supabase/
        ├── client.ts          # Cliente Supabase
        └── types.ts           # Tipos gerados automaticamente
```

---

## Supabase Functions (Edge Functions)

| Função | Descrição |
|--------|-----------|
| `clara-assistant` | Orquestra Clara AI (Claude Sonnet 4) |
| `mercadopago-webhook` | Processa assinaturas + envia e-mail welcome |
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

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Usuários + plano + stripe/mp IDs |
| `company_profile` | Perfil completo da empresa (100+ campos) |
| `company_dre` | DREs + cálculos + impacto reforma |
| `tax_score` | Score tributário + dimensões |
| `identified_credits` | Créditos encontrados nos XMLs |
| `company_opportunities` | Match usuário × oportunidades |
| `notifications` | Sistema de notificações |
| `referral_codes` | Códigos de indicação |
| `referrals` | Registro de indicações |
| `erp_connections` | Conexões com ERPs |
| `erp_sync_logs` | Logs de sincronização |

---

## Clara AI — Arquitetura v4

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

### Fluxo de Resposta

```text
Mensagem do usuário
       ↓
Detecta tópico (TOPIC_KEYWORDS)
       ↓
Verifica escopo do plano (PLAN_TOOL_SCOPE)
       ↓
Se fora do escopo → resposta educada de upgrade
       ↓
Se simples (saudação) → usa CLARA_CORE_SLIM
Se complexa → usa CLARA_CORE_FULL
       ↓
Adiciona disclaimer jurídico (se necessário)
       ↓
Streaming SSE para frontend
```

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

### Mercado Pago

```typescript
// mercadopago-webhook/index.ts
// Eventos tratados:
// - subscription.authorized → ativa plano + envia welcome email
// - subscription.cancelled → desativa plano

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
| `MERCADOPAGO_ACCESS_TOKEN` | Pagamentos |
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
| `mp_subscription_events` | Eventos do Mercado Pago |
| `credit_usage` | Uso de créditos Clara AI |

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

Este documento cobre tanto a **visão de negócio** (ferramentas, planos, jornadas) quanto a **visão técnica** (arquitetura, código, integrações) do TribuTalks.
