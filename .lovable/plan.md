
# Plano: Preparar TribuTalks para Integração com ERPs

## Visão Geral

Criar uma camada de integração nativa com ERPs que permitirá alimentar automaticamente todas as ferramentas do TribuTalks. A arquitetura será modular, permitindo conectar múltiplos ERPs (Omie, Bling, Conta Azul, Tiny, Sankhya, TOTVS) de forma plug-and-play.

---

## Mapeamento: Ferramentas vs Dados do ERP

| Ferramenta TribuTalks | Dados Necessários | Endpoints ERP |
|----------------------|-------------------|---------------|
| **DRE Inteligente** | Vendas, Custos, Despesas, Receitas financeiras | Contas do DRE, Contas a Pagar/Receber, Plano de Contas |
| **Radar de Créditos** | XMLs de NF-e (entrada e saída) | NF-e, Obter XML, Notas de Entrada |
| **Score Tributário** | Faturamento, Débitos, Regime tributário | Empresa, Financeiro, Configurações fiscais |
| **Calculadora RTC** | Produtos com NCM, Quantidade, Valor | Produtos, Tabela de Preços, NCM |
| **CBS/IBS & NCM** | Catálogo de produtos, NCMs, CFOPs das operações | Produtos, Natureza de Operações, NCM |
| **Perfil da Empresa** | CNPJ, CNAE, Faturamento, Setor, Regime | Dados da Empresa, Parâmetros fiscais |
| **Oportunidades** | Perfil completo + histórico de operações | Combinação de todos acima |
| **Painel Executivo** | KPIs consolidados de DRE, Score, Créditos | Agregação de tudo |

---

## Arquitetura Proposta

```text
┌─────────────────────────────────────────────────────────────────┐
│                    TRIBUTALKS FRONTEND                           │
│  (Dashboard de Integrações + Status de Sincronização)           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EDGE FUNCTION: erp-sync                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ERP Adapter Layer (Pattern: Strategy)                    │   │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────────────┐│   │
│  │  │  OMIE   │ │  BLING  │ │CONTAAZUL │ │ TINY / SANKHYA ││   │
│  │  └────┬────┘ └────┬────┘ └────┬─────┘ └────────┬────────┘│   │
│  │       └───────────┴───────────┴────────────────┘          │   │
│  │                         │                                  │   │
│  │              Unified Data Schema                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS SUPABASE                       │
│  erp_connections | erp_sync_logs | Tabelas existentes           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fase 1: Infraestrutura Base

### 1.1 Novas Tabelas no Banco

**Tabela `erp_connections`**
- `id`, `user_id`, `erp_type` (omie, bling, contaazul, tiny, sankhya, totvs)
- `credentials` (encrypted JSON com app_key, app_secret, token, etc.)
- `status` (active, inactive, error)
- `last_sync_at`, `next_sync_at`
- `sync_config` (quais módulos sincronizar, frequência)

**Tabela `erp_sync_logs`**
- `id`, `connection_id`, `sync_type` (nfe, financeiro, produtos, etc.)
- `status` (success, error), `records_synced`, `error_message`
- `started_at`, `completed_at`

### 1.2 Edge Function: `erp-connection`

Gerencia conexões:
- POST: Criar/atualizar conexão (valida credenciais)
- GET: Listar conexões do usuário
- DELETE: Remover conexão

### 1.3 Edge Function: `erp-sync`

Sincronização principal com adapters para cada ERP:
- Extrai dados do ERP via API
- Transforma para schema unificado
- Insere/atualiza tabelas existentes (xml_imports, company_profile, etc.)

---

## Fase 2: Adapters de ERP (Prioridade)

### 2.1 Adapter OMIE (Prioridade 1)
*Mais usado por PMEs brasileiras, API bem documentada*

**Dados a extrair:**
| Módulo OMIE | Endpoint | Destino TribuTalks |
|-------------|----------|-------------------|
| Clientes/Empresa | `/geral/empresas/` | `company_profile` |
| NF-e XML | `/vendas/nfe/` | `xml_imports` + `identified_credits` |
| DRE | `/financas/contasdre/` | `company_dre` |
| Produtos + NCM | `/produtos/` | `company_ncm_analysis` |
| Contas a Pagar | `/financas/contapagar/` | Alimenta DRE automaticamente |
| Contas a Receber | `/financas/contareceber/` | Alimenta DRE automaticamente |

### 2.2 Adapter BLING (Prioridade 2)
*Popular em e-commerce, API v3 moderna*

**Dados a extrair:**
| Módulo BLING | Endpoint | Destino TribuTalks |
|--------------|----------|-------------------|
| NF-e | `/nfe` | `xml_imports` |
| Produtos | `/produtos` | `company_ncm_analysis` |
| Financeiro | `/contasapagar`, `/contasareceber` | `company_dre` |
| Empresa | `/empresas` | `company_profile` |

### 2.3 Adapter Conta Azul (Prioridade 3)
*Foco em microempresas*

### 2.4 Adapters Tiny/Sankhya/TOTVS (Fase posterior)

---

## Fase 3: Interface do Usuário

### 3.1 Página: `/dashboard/integracoes`

**Componentes:**
1. **Lista de ERPs disponíveis** com cards visuais
2. **Wizard de conexão** por ERP (credenciais específicas)
3. **Status de sincronização** (última sync, próxima, erros)
4. **Configuração de sync** (quais módulos, frequência)
5. **Logs de sincronização** com filtros

### 3.2 Indicadores nas Ferramentas

Em cada ferramenta alimentada por ERP:
- Badge "🔄 Dados do [ERP]" indicando origem
- Data da última sincronização
- Botão "Sincronizar agora"

---

## Fase 4: Automações

### 4.1 Sincronização Periódica
- Cron job (via Supabase scheduled functions ou n8n)
- Frequência configurável por módulo

### 4.2 Webhooks (onde disponível)
- Bling e Tiny suportam webhooks
- Sincronização em tempo real para NF-e

### 4.3 Triggers Automáticos
Quando dados do ERP chegam:
1. XMLs → Dispara `analyze-credits`
2. Produtos → Dispara `analyze-ncm-from-xmls`
3. Financeiro → Atualiza DRE e Score

---

## Entregáveis por Sprint

### Sprint 1 (Fundação) ✅ CONCLUÍDA
- [x] Tabelas `erp_connections` e `erp_sync_logs`
- [x] Edge Function `erp-connection` (CRUD)
- [x] Página `/dashboard/integracoes` (UI completa com wizard)

### Sprint 2 (Omie)
- [ ] Adapter Omie completo
- [ ] Edge Function `erp-sync` com adapter Omie
- [ ] Wizard de conexão Omie
- [ ] Sync de NF-e e Produtos

### Sprint 3 (Omie completo + Bling)
- [ ] Sync financeiro Omie → DRE
- [ ] Adapter Bling
- [ ] Indicadores "dados do ERP" nas ferramentas

### Sprint 4 (Automação)
- [ ] Sincronização periódica
- [ ] Webhooks Bling
- [ ] Triggers automáticos pós-sync

---

## Considerações Técnicas

1. **Segurança**: Credenciais criptografadas via Supabase Vault
2. **Rate Limiting**: Respeitar limites de cada API de ERP
3. **Idempotência**: Evitar duplicação de registros em syncs repetidas
4. **Auditoria**: Logs detalhados para troubleshooting
5. **Fallback**: Se API do ERP falhar, manter dados anteriores

---

## Próximos Passos

1. Aprovar este plano
2. Criar as tabelas de infraestrutura
3. Implementar a página de integrações
4. Desenvolver o primeiro adapter (Omie)
5. Testar end-to-end com conta real

Deseja que eu comece pela Sprint 1 (infraestrutura base)?
