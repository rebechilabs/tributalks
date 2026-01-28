
# Plano: Implementar Integrações Completas com ERPs

## Resumo Executivo

Implementar os adapters de sincronização para todos os 6 ERPs suportados (Omie, Bling, Conta Azul, Tiny, Sankhya, TOTVS), criando uma Edge Function `erp-sync` robusta com arquitetura modular que permitirá alimentar automaticamente todas as ferramentas do TribuTalks.

---

## 1. Arquitetura da Solução

```text
┌─────────────────────────────────────────────────────────────────┐
│                       erp-sync Edge Function                     │
├─────────────────────────────────────────────────────────────────┤
│  Orchestrator Layer                                              │
│  - Recebe connection_id e módulos a sincronizar                  │
│  - Gerencia logs e status                                        │
│  - Dispara triggers pós-sync                                     │
├─────────────────────────────────────────────────────────────────┤
│  Adapter Layer (Strategy Pattern)                                │
│  ┌──────────┬──────────┬────────────┬──────┬─────────┬───────┐  │
│  │   OMIE   │  BLING   │ CONTA AZUL │ TINY │ SANKHYA │ TOTVS │  │
│  └──────────┴──────────┴────────────┴──────┴─────────┴───────┘  │
├─────────────────────────────────────────────────────────────────┤
│  Unified Data Transformer                                        │
│  - Normaliza dados para schema TribuTalks                        │
│  - Valida e sanitiza inputs                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Edge Function: `erp-sync`

### 2.1 Estrutura do Arquivo

**Arquivo:** `supabase/functions/erp-sync/index.ts`

**Endpoints:**
- `POST /` - Executa sincronização manual
- `GET /?connection_id=xxx` - Status da última sync

**Fluxo de Execução:**
1. Valida autenticação e busca conexão no banco
2. Seleciona adapter baseado no `erp_type`
3. Executa módulos configurados (nfe, produtos, financeiro, empresa)
4. Salva dados normalizados nas tabelas existentes
5. Atualiza logs e status da conexão
6. Dispara triggers automáticos (analyze-credits, match-opportunities)

---

## 3. Adapters por ERP

### 3.1 Adapter OMIE

**API Base:** `https://app.omie.com.br/api/v1/`
**Autenticação:** App Key + App Secret em cada requisição

| Módulo | Endpoint Omie | Método API | Tabela Destino |
|--------|---------------|------------|----------------|
| Empresa | `/geral/empresas/` | `ListarEmpresas` | `company_profile` |
| Produtos | `/geral/produtos/` | `ListarProdutos` | `company_ncm_analysis` |
| NF-e | `/produtos/nfconsultar/` | `ListarNF` | `xml_imports` → `identified_credits` |
| Contas a Pagar | `/financas/contapagar/` | `ListarContasPagar` | `company_dre` (despesas) |
| Contas a Receber | `/financas/contareceber/` | `ListarContasReceber` | `company_dre` (receitas) |
| DRE | `/geral/dre/` | `ListarDRE` | Referência para categorias |

**Estrutura da Requisição Omie:**
```json
{
  "call": "ListarNF",
  "app_key": "{{app_key}}",
  "app_secret": "{{app_secret}}",
  "param": [{
    "pagina": 1,
    "registros_por_pagina": 50,
    "apenas_importado_api": "N"
  }]
}
```

---

### 3.2 Adapter BLING

**API Base:** `https://api.bling.com.br/Api/v3/`
**Autenticação:** Bearer Token (OAuth 2.0)

| Módulo | Endpoint Bling | Método HTTP | Tabela Destino |
|--------|----------------|-------------|----------------|
| Empresa | `/empresas` | GET | `company_profile` |
| Produtos | `/produtos` | GET | `company_ncm_analysis` |
| NF-e | `/nfe` | GET | `xml_imports` → `identified_credits` |
| Contas a Pagar | `/contas/pagar` | GET | `company_dre` (despesas) |
| Contas a Receber | `/contas/receber` | GET | `company_dre` (receitas) |

**Headers Bling:**
```javascript
headers: {
  "Authorization": "Bearer {{access_token}}",
  "Accept": "application/json"
}
```

---

### 3.3 Adapter CONTA AZUL

**API Base:** `https://api.contaazul.com/v1/`
**Autenticação:** OAuth 2.0 (Client ID + Secret + Access Token)

| Módulo | Endpoint | Método HTTP | Tabela Destino |
|--------|----------|-------------|----------------|
| Empresa | `/companies` | GET | `company_profile` |
| Produtos | `/products` | GET | `company_ncm_analysis` |
| Vendas | `/sales` | GET | `company_dre` |
| Compras | `/purchases` | GET | `company_dre` |

---

### 3.4 Adapter TINY

**API Base:** `https://api.tiny.com.br/api2/`
**Autenticação:** Token API em query string

| Módulo | Endpoint | Tabela Destino |
|--------|----------|----------------|
| Produtos | `produtos.pesquisa.php` | `company_ncm_analysis` |
| Notas Fiscais | `notas.fiscais.pesquisa.php` | `xml_imports` |
| Pedidos | `pedidos.pesquisa.php` | Referência |
| Contas a Pagar | `contas.pagar.pesquisa.php` | `company_dre` |
| Contas a Receber | `contas.receber.pesquisa.php` | `company_dre` |

**Formato Tiny:**
```
GET /api2/produtos.pesquisa.php?token={{token}}&formato=json&pesquisa=
```

---

### 3.5 Adapter SANKHYA

**API Base:** `https://api.sankhya.com.br/gateway/v1/`
**Autenticação:** App Key + Sankhya ID + Token

| Módulo | Endpoint | Tabela Destino |
|--------|----------|----------------|
| Empresa | `/mge/service.sbr?serviceName=CRUDServiceProvider.loadRecords&entityName=Empresa` | `company_profile` |
| Produtos | `/mge/service.sbr?serviceName=CRUDServiceProvider.loadRecords&entityName=Produto` | `company_ncm_analysis` |
| NF-e | `/mge/service.sbr?serviceName=SelecaoDocumentoSP.consultarDocumentos` | `xml_imports` |
| Financeiro | `/mge/service.sbr?serviceName=CRUDServiceProvider.loadRecords&entityName=MovimentacaoFinanceira` | `company_dre` |

---

### 3.6 Adapter TOTVS

**API Base:** Variável por produto (Protheus, RM, Datasul)
**Autenticação:** Username + Password (Basic Auth ou API Key)

| Módulo | Endpoint Protheus | Tabela Destino |
|--------|-------------------|----------------|
| Empresa | `api/framework/v1/environment` | `company_profile` |
| Produtos | `api/retaguarda/v1/products` | `company_ncm_analysis` |
| NF-e | `api/fiscal/v1/invoices` | `xml_imports` |
| Financeiro | `api/financeiro/v1/movements` | `company_dre` |

---

## 4. Transformação de Dados

### 4.1 Schema Unificado para Produtos/NCM

```typescript
interface UnifiedProduct {
  ncm_code: string;          // NCM de 8 dígitos
  product_name: string;      // Descrição do produto
  cfops_frequentes: string[]; // CFOPs mais usados
  tipo_operacao: string;     // entrada | saida | misto
  qtd_operacoes: number;     // Quantidade de operações
  revenue_percentage: number; // % do faturamento
}
```

### 4.2 Schema Unificado para DRE

```typescript
interface UnifiedFinancial {
  tipo: 'receita' | 'despesa';
  categoria: string;
  valor: number;
  data: string;
  descricao: string;
}
```

---

## 5. Triggers Automáticos Pós-Sync

Após cada sincronização bem-sucedida:

1. **Módulo NF-e:**
   - Dispara `analyze-credits` para identificar créditos
   - Atualiza `identified_credits`

2. **Módulo Produtos:**
   - Dispara `analyze-ncm-from-xmls` para classificação tributária
   - Atualiza `company_ncm_analysis`

3. **Módulo Financeiro:**
   - Recalcula DRE automático
   - Dispara `calculate-tax-score` para atualizar Score

4. **Módulo Empresa:**
   - Atualiza `company_profile`
   - Dispara `match-opportunities` para novas oportunidades

---

## 6. Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `supabase/functions/erp-sync/index.ts` | CRIAR | Edge function principal |
| `supabase/config.toml` | MODIFICAR | Adicionar config do erp-sync |
| `src/components/integrations/ERPConnectionCard.tsx` | MODIFICAR | Adicionar botão "Sincronizar Agora" |
| `src/pages/Integracoes.tsx` | MODIFICAR | Adicionar funcionalidade de sync manual |
| `src/components/landing/IntegrationsSection.tsx` | MODIFICAR | Marcar ERPs como disponíveis após implementação |

---

## 7. Configuração de Rate Limiting

| ERP | Limite | Estratégia |
|-----|--------|------------|
| Omie | 60 req/min | Delay entre páginas |
| Bling | 3 req/seg | Throttle com intervalo |
| Conta Azul | 100 req/min | Batch requests |
| Tiny | 30 req/min | Queue com delay |
| Sankhya | Sem limite documentado | Monitorar erros 429 |
| TOTVS | Variável | Respeitar X-Rate-Limit header |

---

## 8. Tratamento de Erros

```typescript
interface SyncError {
  code: string;
  message: string;
  retryable: boolean;
  module: string;
}

// Erros comuns e ações
const ERROR_HANDLERS = {
  'AUTH_FAILED': { retryable: false, action: 'Verificar credenciais' },
  'RATE_LIMITED': { retryable: true, action: 'Aguardar e tentar novamente' },
  'NETWORK_ERROR': { retryable: true, action: 'Retry com backoff' },
  'INVALID_DATA': { retryable: false, action: 'Log e pular registro' },
};
```

---

## 9. Fluxo de Implementação

```text
Fase 1 (Este PR):
├── Criar erp-sync Edge Function
├── Implementar Adapter Omie (completo)
├── Implementar Adapter Bling (completo)
├── Implementar Adapter Tiny (completo)
├── Implementar Adapter Conta Azul (completo)
├── Implementar Adapter Sankhya (básico)
├── Implementar Adapter TOTVS (básico)
├── Adicionar botão Sync na UI
└── Atualizar LP com ERPs disponíveis

Fase 2 (Futuro):
├── Webhooks para Bling e Tiny
├── Sincronização automática agendada
└── Dashboard de monitoramento avançado
```

---

## 10. Segurança

- Credenciais armazenadas criptografadas no campo `credentials` (JSONB)
- Validação de credenciais antes de salvar
- Logs de auditoria em `erp_sync_logs`
- RLS garantindo isolamento por usuário
- Sem exposição de tokens em logs

---

## Entregáveis

1. **Edge Function `erp-sync`** com 6 adapters completos
2. **UI atualizada** com botão de sincronização manual
3. **Landing Page** atualizada com ERPs disponíveis
4. **Logs detalhados** de cada sincronização
5. **Triggers automáticos** para análises pós-sync
