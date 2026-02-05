# TribuTalks — Documentação Completa para Empresário/Dev

> **Última atualização:** 5 de Fevereiro de 2026

## Visão Geral

**TribuTalks Inteligência Tributária** é uma plataforma SaaS focada em gestão tributária inteligente para empresas brasileiras. A plataforma oferece 36+ ferramentas organizadas em módulos para diagnóstico, recuperação de créditos, precificação e gestão estratégica.

**Stack Tecnológica:**
- Frontend: React 18 + TypeScript + Vite
- Styling: Tailwind CSS + shadcn/ui
- State: TanStack Query + React Context
- Backend: Lovable Cloud (Supabase)
- IA: Clara AI (GPT-5/Gemini via Lovable AI)
- Animações: Framer Motion
- PDF: jsPDF
- Tour: React Joyride

### Diferenciais AI-Native

| Característica | Implementação |
|----------------|---------------|
| **Agentes Especializados** | 3 agentes (Fiscal, Margem, Compliance) com routing inteligente |
| **Memória Evolutiva** | Clara aprende padrões e preferências de cada usuário |
| **Ações Autônomas** | Sistema de triggers que executa tarefas automaticamente |
| **Feedback Loop (RLHF)** | Coleta thumbs up/down para fine-tuning futuro |
| **Insights Proativos** | Sistema detecta problemas e gera alertas automáticos |
| **Contexto Rico** | Dados reais do usuário (DRE, Score, créditos) injetados no prompt |
| **RAG Híbrido** | Busca vetorial (70%) + keywords (30%) para máxima precisão |

---

# PARTE 1: VISÃO DO EMPRESÁRIO

## 1. Arquitetura de Autenticação e Onboarding

### 1.1 Fluxo Obrigatório de Onboarding

```text
Login/Cadastro → /setup (CNPJ obrigatório) → /welcome (prioridade) → /dashboard/home
```

**Etapas controladas por flags no perfil:**

| Flag | Descrição | Rota de Redirecionamento |
|------|-----------|--------------------------|
| `onboarding_complete` | Questionário inicial concluído | `/onboarding` |
| `setup_complete` | Nome + ≥1 CNPJ cadastrado | `/setup` |
| `welcome_seen` | Prioridade selecionada | `/welcome` |

**Componente:** `src/components/ProtectedRoute.tsx`

### 1.2 Página /setup

**Arquivo:** `src/pages/Setup.tsx`

Funcionalidades:
- Campo nome do usuário obrigatório
- Cadastro de CNPJs com limite por plano
- Auto-lookup via API da Receita Federal (gov-data-api)
- Preenchimento automático: Razão Social, Nome Fantasia, Regime, UF, CNAE

**Limites de CNPJs por plano:**

| Plano | Limite |
|-------|--------|
| FREE/STARTER | 1 CNPJ |
| NAVIGATOR | 2 CNPJs |
| PROFESSIONAL | 4 CNPJs |
| ENTERPRISE | Ilimitado |

### 1.3 Página /welcome

**Arquivo:** `src/pages/WelcomeAI.tsx`

- Se múltiplas empresas: seleção da empresa ativa
- Escolha de prioridade: Caixa, Margem, Compliance ou Crescimento
- Geração de plano personalizado de ferramentas

---

## 2. Sistema Multi-CNPJ

### 2.1 CompanyContext

**Arquivo:** `src/contexts/CompanyContext.tsx`

```typescript
interface Company {
  id: string;
  user_id: string;
  cnpj_principal: string | null;
  razao_social: string | null;
  nome_fantasia: string | null;
  regime_tributario: string | null;
  uf_sede: string | null;
  // ... outros campos
}

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company | null;
  setCurrentCompany: (company: Company) => void;
  addCompany: (company: Partial<Company>) => Promise<Company | null>;
  removeCompany: (companyId: string) => Promise<boolean>;
  updateCompany: (companyId: string, data: Partial<Company>) => Promise<boolean>;
  maxCompanies: number;
  canAddMore: boolean;
}
```

**Persistência:** `localStorage` com key `tributalks_current_company_id`

**Invalidação automática ao trocar empresa:**
- home-state
- dre
- tax-score
- credits

### 2.2 CNPJ Lookup

**Arquivo:** `src/hooks/useCnpjLookup.ts`

- Edge Function: `gov-data-api/cnpj/{cnpj}`
- Auto-lookup ao digitar 14 dígitos
- Inferência de regime tributário baseada em porte/capital

---

## 3. Tour Guiado (React Joyride)

**Arquivo:** `src/components/onboarding/GuidedTour.tsx`

### 3.1 Passos do Tour (6 etapas)

| Step | Target | Título | Descrição |
|------|--------|--------|-----------|
| 1 | `[data-tour="clara-card"]` | Conheça a Clara | Assistente IA tributária, comandos /resumo, atalho Ctrl+K |
| 2 | `[data-tour="score-link"]` | Score Tributário | Nota de A+ a D, comparação setorial |
| 3 | `[data-tour="calculators-group"]` | Calculadoras | Simuladores de impacto da reforma |
| 4 | `[data-tour="pit-group"]` | PIT | Notícias e prazos da reforma |
| 5 | `[data-tour="conexao-group"]` | Conexão & Comunicação | Notícias, Comunidade, Indique e Ganhe |
| 6 | `[data-tour="user-menu"]` | Seu Perfil | Perfil empresarial e conquistas |

### 3.2 Controle de Progresso

**Tabela:** `user_onboarding_progress`

```typescript
interface OnboardingProgress {
  tour_completed: boolean;
  first_mission_completed: boolean;
  checklist_items: {
    score: boolean;
    simulation: boolean;
    timeline: boolean;
    profile: boolean;
  };
}
```

**Hook:** `src/hooks/useOnboardingProgress.ts`

---

## 4. Planos e Preços

| Plano | Preço | CNPJs | Usuários | Destaques |
|-------|-------|-------|----------|-----------|
| **STARTER** | R$ 297/mês | 1 | 1 | Clara AI (30 msgs/dia), Score, Split Payment |
| **NAVIGATOR** | R$ 697/mês | 2 | 2 | + Notícias, Timeline, Workflows, Comunidade |
| **PROFESSIONAL** | R$ 1.997/mês | 4 | 4 | + XMLs, Radar Créditos, DRE, NEXUS, Margem Ativa |
| **ENTERPRISE** | Sob consulta | ∞ | ∞ | + White Label, API, Consultoria |

---

## 5. Controle de Acesso (Feature Gate)

**Arquivo:** `src/hooks/useFeatureAccess.ts`

### 5.1 Planos e Hierarquia

| Plano | Nível | Preço |
|-------|-------|-------|
| FREE | 0 | R$ 0 |
| STARTER | 1 | R$ 297/mês |
| NAVIGATOR | 2 | R$ 697/mês |
| PROFESSIONAL | 3 | R$ 1.997/mês |
| ENTERPRISE | 4 | Sob consulta |

### 5.2 Features por Plano

| Feature | Plano Mínimo |
|---------|--------------|
| score_tributario | FREE |
| split_payment | FREE |
| comparativo_regimes | FREE |
| simpronto | STARTER |
| dre_inteligente | STARTER |
| calculadora_rtc | STARTER |
| timeline_reforma | STARTER |
| clara_ai | STARTER (30 msg/dia) |
| importar_xmls | NAVIGATOR |
| radar_creditos | NAVIGATOR |
| oportunidades | NAVIGATOR |
| relatorios_pdf | NAVIGATOR |
| document_analyzer | NAVIGATOR |
| margem_ativa | PROFESSIONAL |
| nexus | PROFESSIONAL |
| erp_conexao | PROFESSIONAL |
| painel_executivo | ENTERPRISE |
| white_label | ENTERPRISE |

### 5.3 Limites da Clara AI

| Plano | Mensagens/dia |
|-------|---------------|
| FREE | 0 |
| STARTER | 30 |
| NAVIGATOR | 100 |
| PROFESSIONAL+ | Ilimitado |

---

## 6. Estrutura de Rotas

### 6.1 Rotas Públicas

| Rota | Página |
|------|--------|
| `/` | Landing Page (Index) |
| `/login` | Login |
| `/cadastro` | Cadastro |
| `/termos` | Termos de Uso |
| `/privacidade` | Política de Privacidade |
| `/casos` | Estudos de Caso |
| `/newsletter` | Newsletter Beehiiv |

### 6.2 Rotas Protegidas - Módulos

```text
/dashboard/home            → Smart Home (ponto de entrada universal)
/dashboard/entender        → Módulo ENTENDER
  ├── /dre                 → DRE Inteligente
  ├── /score               → Score Tributário
  └── /comparativo         → Comparativo de Regimes (Simpronto)
/dashboard/recuperar       → Módulo RECUPERAR
  ├── /radar               → Radar de Créditos (XMLs, SPED, DCTF, PGDAS)
  └── /oportunidades       → Oportunidades Fiscais (61+ regras)
/dashboard/precificacao    → Módulo PRECIFICAÇÃO
  ├── /margem              → Suíte Margem Ativa (OMC-AI + PriceGuard)
  ├── /split               → Calculadora Split Payment
  └── /priceguard          → Redireciona para /margem?tab=priceguard
/dashboard/comandar        → Módulo COMANDAR
  ├── /nexus               → Centro de Comando (4 KPIs)
  └── /valuation           → Valuation (3 metodologias)
/dashboard/conexao         → Módulo CONEXÃO
  ├── Notícias
  ├── Comunidade (Circle)
  └── Indique e Ganhe
```

### 6.3 Redirects Legados

| Rota Antiga | Rota Nova |
|-------------|-----------|
| `/dashboard/dre` | `/dashboard/entender/dre` |
| `/dashboard/score-tributario` | `/dashboard/entender/score` |
| `/calculadora/comparativo-regimes` | `/dashboard/entender/comparativo` |
| `/dashboard/analise-notas` | `/dashboard/recuperar/radar` |
| `/dashboard/margem-ativa` | `/dashboard/precificacao/margem` |
| `/dashboard/nexus` | `/dashboard/comandar/nexus` |

---

## 7. Ferramentas Principais

### 7.1 DRE Inteligente

**Arquivo:** `src/components/dre/DREWizard.tsx`

**Etapas do Wizard (6 passos):**
1. Suas Vendas (produtos, serviços, devoluções)
2. Custos (mercadorias, materiais, mão de obra)
3. Despesas (salários, aluguel, marketing, etc)
4. Financeiro (juros, tarifas, multas)
5. Impostos (regime tributário)
6. Produtos (opcional - catálogo NCM)

**Integração ERP:** Auto-preenchimento via `useERPDREData`

### 7.2 Score Tributário

**Arquivo:** `src/pages/ScoreTributario.tsx`

- Pontuação de 0-1000 pontos
- Graus: A+ (900+), A, B, C, D
- 5 dimensões: Conformidade, Eficiência, Risco, Documentação, Gestão
- Benchmark setorial
- Histórico mensal
- Ações recomendadas com economia estimada

### 7.3 Comparativo de Regimes (Simpronto)

**Arquivo:** `src/pages/dashboard/SimprontoPage.tsx`

**Dados de entrada:**
- Faturamento anual
- Folha de pagamento
- CNAE principal
- Compras/insumos
- Despesas operacionais (50 categorias detalhadas)
- Margem de lucro
- Perfil de clientes (B2B/B2C/Misto)

**Despesas Operacionais Detalhadas (8 categorias, 50 itens):**

| Categoria | Itens |
|-----------|-------|
| I. Produção e Prestação de Serviços | Matéria-prima, Produto intermediário, Embalagem primária/secundária, Energia elétrica, Energia térmica, Combustíveis, Água, Ferramentas, Industrialização |
| II. Logística e Transporte | Frete compra, Frete venda, Armazenagem, Paletes/contêineres, Seguro transporte |
| III. Manutenção e Reparos | Peças reposição, Manutenção preventiva/corretiva, Calibração, Software controle |
| IV. Qualidade e Conformidade | Testes qualidade, Certificações, Efluentes, Pragas, Licenciamento |
| V. Segurança e Saúde | EPIs, Uniformes, Exames médicos, Treinamentos NRs, Medicina trabalho |
| VI. Despesas com Pessoal | Vale-transporte, Vale-refeição, Seguro vida, Plano saúde |
| VII. Aluguéis e Arrendamento | Aluguel prédios/máquinas PJ, Leasing veículos, SaaS |
| VIII. Outras Despesas | Marketing, Comissões PJ, Limpeza, Vigilância, Royalties, Contabilidade, Depreciação, Taxas cartão, Telecom, Viagens |

**Componente:** `src/components/simpronto/DespesasOperacionaisSelector.tsx`
- Accordion expansível por categoria
- Checkbox para ativar despesa
- Input de valor (R$/ano) aparece ao marcar
- Campo personalizado para despesas não listadas
- Soma automática em tempo real
- Alerta de essencialidade para créditos

**Regimes comparados:**
- Simples Nacional (atual)
- Lucro Presumido
- Lucro Real
- Simples 2027 (dentro IBS/CBS)
- Simples 2027 (fora IBS/CBS)

### 7.4 Radar de Créditos

**Arquivo:** `src/pages/AnaliseNotasFiscais.tsx`

**Abas disponíveis:**
1. **Importar** - XMLs de NF-e/NFC-e (até 1000 arquivos)
2. **SPED** - Contribuições (blocos 0000/M100-M600)
3. **DCTF** - Declarações de débitos
4. **PGDAS** - Arquivos do Simples Nacional
5. **Cruzamento** - Análise cruzada fiscal
6. **Créditos** - Radar com 24 regras legislativas
7. **Exposição** - Projeção de risco

**Processamento:**
- Chunks de 20 arquivos
- 5 chunks paralelos
- Edge Function: `process-xml-batch`

**Tabelas envolvidas:**
- `xml_imports` - Uploads
- `xml_analysis` - Análise extraída
- `identified_credits` - Créditos identificados
- `credit_analysis_summary` - Resumo

### 7.5 Suíte Margem Ativa

**Arquivo:** `src/pages/dashboard/MargemAtiva.tsx`

**3 abas:**

| Aba | Descrição |
|-----|-----------|
| OMC-AI | Otimização de Mix de Compras - análise de fornecedores |
| PriceGuard | Simulador de precificação 2027 |
| Dashboard | Painel executivo de margens |

**PriceGuard:**
- Simulação de preço de venda
- Cálculo de margem com CBS/IBS
- Recomendação automática (Manter/Aumentar/Reduzir)
- Persistência em `price_simulations`

### 7.6 NEXUS (Centro de Comando)

**Arquivo:** `src/pages/Nexus.tsx`

**4 KPIs principais:**
1. DRE (receita, margem, lucro)
2. Score Tributário
3. Créditos identificados
4. Oportunidades

**Insights personalizados via Clara AI**

---

## 8. Relatórios PDF

### 8.1 Formatos Disponíveis

| Formato | Descrição |
|---------|-----------|
| Visual | Com gráficos e cores (tema escuro/claro) |
| Executivo | Texto limpo para CEO |
| Executivo Completo (v2) | 7 seções com tabelas, anexos de rastreabilidade |

### 8.2 Estrutura do Relatório v2

1. Capa
2. Sumário Executivo
3. Análise Detalhada por Tributo
4. Inconsistências Fiscais
5. Oportunidades/Quick Wins
6. Estatísticas
7. Anexos

**Arquivo:** `src/lib/pdf/ExecutiveReportV2Generator.ts`

### 8.3 Fallback de Dados

**Hook:** `src/hooks/useCreditReport.ts`

Lógica de fallback:
1. Prioriza `identified_credits` (processamento histórico)
2. Se vazio, usa `xml_analysis` (dados do upload)
3. Aplica fatores de recuperação conservadores

---

## 9. Clara AI

**Arquivo:** `src/pages/ClaraAI.tsx`

### 9.1 Funcionalidades

- Chat conversacional
- Comandos especiais: `/resumo`, `/diagnostico`
- Atalho global: `Ctrl+K`
- Feedback com botões de like/dislike
- Indicador de confiança (Alta/Média/Baixa)
- Sistema de créditos

### 9.2 Edge Functions

| Function | Descrição |
|----------|-----------|
| `clara-assistant` | Chat principal |
| `generate-clara-insights` | Insights automáticos |
| `semantic-search` | Busca em knowledge base |

### 9.3 Memória e Contexto

**Hook:** `src/hooks/useClaraConversation.ts`

- Histórico persistido em `clara_conversations`
- Memória de longo prazo em `clara_memory`
- Cache de embeddings em `clara_embeddings_cache`

### 9.4 Agentes Especializados

| Agente | Domínio | Capabilities |
|--------|---------|--------------|
| **Fiscal** | Créditos, NCM, obrigações | Análise de créditos, classificação NCM, compliance fiscal |
| **Margem** | DRE, pricing, custos | Proteção de margem, simulação de preços, análise de custos |
| **Compliance** | Prazos, reforma, regulatório | Monitoramento de deadlines, alertas de mudanças, adequação |

---

## 10. Landing Page

**Arquivo:** `src/pages/Index.tsx`

### 10.1 Seções

1. **Header** - Logo + CTA
2. **NewHeroSection** - Headline principal
3. **ProblemSection** - Dores do cliente
4. **DemoSection** - Botão para demo interativa
5. **RTCCalculatorSection** - Calculadora de RTC
6. **ClaraSection** - Apresentação da IA
7. **NewPricingSection** - 3 planos + Enterprise
8. **TestimonialsSection** - Depoimentos
9. **SecuritySection** - Badges de segurança
10. **NewFooter** - Links e contato

### 10.2 Demo Interativa

**Arquivo:** `src/components/landing/InteractiveDemo.tsx`

**5 passos animados:**

| Passo | Duração | Descrição |
|-------|---------|-----------|
| 1 | 5s | Upload de XMLs com progress bar |
| 2 | 7s | Score Tributário (gauge 0-72) |
| 3 | 7s | Radar identificando R$ 47k |
| 4 | 8s | Clara AI respondendo |
| 5 | Manual | Dashboard NEXUS com 4 KPIs |

Ao concluir: scroll para seção de preços.

---

## 11. Timeline da Reforma

**Arquivo:** `src/pages/TimelineReforma.tsx`

**Anos cobertos:** 2026-2033

| Ano | Fase | Descrição |
|-----|------|-----------|
| 2026 | Teste | CBS 0,9% + IBS 0,1% |
| 2027 | CBS Vigor | Split Payment obrigatório (jul) |
| 2028 | Consolidação | CBS estabiliza |
| 2029 | IBS Inicial | Transição estadual |
| 2030-2032 | Transição | Redução gradual ICMS/ISS |
| 2033 | Conclusão | Novo sistema pleno |

**Tabela:** `prazos_reforma`

---

# PARTE 2: VISÃO TÉCNICA (DEV)

## 12. Banco de Dados

### 12.1 Tabelas Principais (77 total)

**Usuários e Perfil:**
- `profiles` - Dados do usuário
- `company_profile` - Empresas (multi-CNPJ)
- `user_roles` - Permissões admin

**Tributário:**
- `tax_score` / `tax_score_history` - Pontuações
- `company_dre` - Demonstrativos financeiros
- `xml_imports` / `xml_analysis` - Notas fiscais
- `identified_credits` - Créditos identificados
- `credit_rules` - Regras de crédito (24)
- `tax_opportunities` - Oportunidades (61+)
- `simulations` / `simpronto_simulations` - Simulações

**IA (Clara):**
- `clara_conversations` - Histórico
- `clara_memory` - Memória persistente
- `clara_insights` - Insights gerados
- `clara_feedback` - Avaliações
- `clara_knowledge_base` - Base de conhecimento
- `tributbot_messages` - Mensagens (legado)

**Integrações:**
- `erp_connections` - Conexões ERP
- `erp_sync_logs` - Logs de sincronização

**Engajamento:**
- `user_achievements` - Conquistas
- `user_onboarding_progress` - Progresso onboarding
- `referrals` / `referral_codes` - Sistema de indicação
- `notifications` - Notificações

### 12.2 RLS (Row Level Security)

Todas as 77 tabelas possuem RLS ativado com políticas:
- `SELECT`: `auth.uid() = user_id`
- `INSERT`: `auth.uid() = user_id`
- `UPDATE`: `auth.uid() = user_id`
- `DELETE`: `auth.uid() = user_id`

**Exceção:** Tabelas admin usam `public.has_role(auth.uid(), 'admin')`

---

## 13. Edge Functions (48 funções)

### 13.1 Categorias

**Processamento de Documentos:**
- `process-xml-batch` - XMLs em lote
- `process-sped-contribuicoes` - SPED
- `process-dctf` - DCTF
- `process-pgdas` - PGDAS
- `analyze-document` - Documentos genéricos

**Cálculos:**
- `calculate-tax-score` - Score tributário
- `calculate-rtc` - Regime Tributário de Caixa
- `analyze-credits` - Créditos tributários
- `cross-analyze-fiscal` - Cruzamento fiscal
- `match-opportunities` - Match de oportunidades

**IA:**
- `clara-assistant` - Chat principal
- `generate-clara-insights` - Insights
- `generate-embeddings` - Vetores
- `semantic-search` - Busca semântica
- `quick-diagnostic` - Diagnóstico rápido

**Relatórios:**
- `generate-executive-report` - PDF executivo
- `send-executive-report` - Envio por email
- `send-batch-executive-reports` - Envio em lote

**Integrações:**
- `erp-connection` - Conexão ERP
- `erp-sync` - Sincronização
- `contaazul-oauth` - OAuth ContaAzul
- `gov-data-api` - API Receita Federal

**Notificações:**
- `send-news-alerts` - Alertas de notícias
- `send-weekly-digest` - Resumo semanal
- `fetch-news` - Busca notícias

---

## 14. Tipos TypeScript

### 14.1 Simpronto

**Arquivo:** `src/types/simpronto.ts`

```typescript
export type PerfilClientes = 'B2B' | 'B2C' | 'MISTO';

export type RegimeType = 
  | 'SIMPLES_NACIONAL'
  | 'LUCRO_PRESUMIDO'
  | 'LUCRO_REAL'
  | 'SIMPLES_2027_DENTRO'
  | 'SIMPLES_2027_FORA';

export interface SimprontoFormData {
  // Passo 1
  faturamento_anual: string;
  folha_pagamento: string;
  cnae_principal: string;
  
  // Passo 2
  compras_insumos: string;
  despesas_operacionais: string;
  despesas_detalhadas?: Record<string, number>; // { id_despesa: valor_anual }
  margem_lucro: string;
  perfil_clientes: PerfilClientes | '';
}
```

### 14.2 Despesas Operacionais

**Arquivo:** `src/types/despesasOperacionais.ts`

```typescript
export interface DespesaItem {
  id: string;
  nome: string;
}

export interface CategoriaDespesa {
  id: string;
  nome: string;
  items: DespesaItem[];
}

export const CATEGORIAS_DESPESAS: CategoriaDespesa[] = [
  {
    id: 'producao',
    nome: 'I. Produção e Prestação de Serviços',
    items: [
      { id: 'materia_prima', nome: 'Matéria-prima' },
      { id: 'produto_intermediario', nome: 'Produto intermediário' },
      // ... 50 itens total em 8 categorias
    ]
  },
  // ... outras 7 categorias
];
```

---

## 15. Configurações Globais

**Arquivo:** `src/config/site.ts`

```typescript
export const CONFIG = {
  PAYMENT_LINKS: {
    STARTER_MENSAL: "https://buy.stripe.com/...",
    STARTER_ANUAL: "https://buy.stripe.com/...",
    // ... demais planos
    CREDITS_30: "https://buy.stripe.com/...", // 30 créditos Clara
    CREDITS_50: "https://buy.stripe.com/...",
    CREDITS_100: "https://buy.stripe.com/...",
    SEAT_ADDITIONAL: "https://buy.stripe.com/...", // R$ 247/mês
  },
  CONTACT_EMAIL: "suporte@tributalks.com.br",
  WHATSAPP: "https://wa.me/5511914523971",
  CIRCLE_COMMUNITY: "https://tributalksconnect.circle.so",
  CALENDLY_LINK: "https://calendly.com/tributalks/consultoria",
};
```

---

## 16. Disclaimer Legal

Conforme Termos de Uso, a plataforma TribuTalks é de natureza **EXCLUSIVAMENTE EDUCATIVA E INFORMATIVA**:
- Cálculos e simulações não constituem parecer jurídico
- Clara AI não substitui consultoria contábil profissional
- Decisões críticas devem ser validadas por profissionais habilitados
- Créditos identificados requerem análise técnica para efetivação

---

## 17. Contatos e Links

| Recurso | Link |
|---------|------|
| Preview | https://id-preview--a0c5403f-32d5-4f40-a502-bb558f3296ac.lovable.app |
| Produção | https://tributechai.lovable.app |
| Suporte | suporte@tributalks.com.br |
| WhatsApp | +55 11 91452-3971 |
| Comunidade | https://tributalksconnect.circle.so |
| LinkedIn | https://linkedin.com/company/tributalks |
| YouTube | https://youtube.com/@tributalksnews |

---

## Changelog de Atualizações Recentes

| Data | Mudança |
|------|---------|
| 2026-02-05 | Documentação completamente atualizada |
| 2026-02-05 | Despesas Operacionais detalhadas (50 itens, 8 categorias) no Simpronto |
| 2026-02-05 | Campo personalizado para despesas não listadas |
| 2026-02-05 | PriceGuard removido badge "Em breve" e funcional |
| 2026-02-05 | Rota /priceguard redireciona para /margem?tab=priceguard |
| 2026-02-05 | Tour guiado inclui módulo Conexão & Comunicação |
| 2026-02-05 | Multi-CNPJ com limites por plano |
| 2026-02-05 | Setup obrigatório com auto-lookup CNPJ |
| 2026-02-05 | Fallback de dados no relatório PDF |
| 2026-02-05 | Newsletter renomeada para "Notícias" |
| 2026-02 | Stripe como gateway exclusivo (MercadoPago removido) |
