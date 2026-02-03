

# Plano: Corrigir Endpoints Financeiros da API Conta Azul v2

## Problema Identificado

Os endpoints de Contas a Receber e Contas a Pagar estão usando método HTTP e caminho incorretos:

| Módulo | Atual (ERRADO) | Correto (Documentação) |
|--------|----------------|------------------------|
| Contas a Receber | `POST /v1/financeiro/eventos-financeiros/contas-a-receber/buscar` | `GET /v1/financeiro/eventos-financeiros/contas-a-receber` |
| Contas a Pagar | `POST /v1/financeiro/eventos-financeiros/contas-a-pagar/buscar` | `GET /v1/financeiro/eventos-financeiros/contas-a-pagar` |

## Problemas Específicos

1. Método HTTP errado: `POST` em vez de `GET`
2. Caminho incorreto: inclui `/buscar` no final (não existe)
3. Parâmetros enviados no body JSON em vez de query string
4. Faltam parâmetros obrigatórios: `data_vencimento_de` e `data_vencimento_ate`

## Alterações Necessárias

### Arquivo: `supabase/functions/erp-sync/index.ts`

#### 1. Corrigir Contas a Receber (linhas 1019-1043)

```typescript
// DE (ERRADO):
const recebivelResponse = await this.makeRequest(
  '/v1/financeiro/eventos-financeiros/contas-a-receber/buscar', 
  credentials,
  'POST',
  { pagina: 1, tamanho_pagina: 200 }
);

// PARA (CORRETO):
const dataFinal = new Date().toISOString().split('T')[0];
const dataInicial = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const recebivelResponse = await this.makeRequest(
  `/v1/financeiro/eventos-financeiros/contas-a-receber?data_vencimento_de=${dataInicial}&data_vencimento_ate=${dataFinal}&pagina=1&tamanho_pagina=200`, 
  credentials,
  'GET'
);
```

#### 2. Corrigir Contas a Pagar (linhas 1048-1072)

```typescript
// DE (ERRADO):
const pagavelResponse = await this.makeRequest(
  '/v1/financeiro/eventos-financeiros/contas-a-pagar/buscar', 
  credentials,
  'POST',
  { pagina: 1, tamanho_pagina: 200 }
);

// PARA (CORRETO):
const dataFinal = new Date().toISOString().split('T')[0];
const dataInicial = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const pagavelResponse = await this.makeRequest(
  `/v1/financeiro/eventos-financeiros/contas-a-pagar?data_vencimento_de=${dataInicial}&data_vencimento_ate=${dataFinal}&pagina=1&tamanho_pagina=200`, 
  credentials,
  'GET'
);
```

#### 3. Atualizar comentários de documentação

Corrigir os comentários nas linhas 1019 e 1048 para refletir o método correto:

```typescript
// API v2: GET /v1/financeiro/eventos-financeiros/contas-a-receber (com query params)
// API v2: GET /v1/financeiro/eventos-financeiros/contas-a-pagar (com query params)
```

## Resumo das Correções

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Método HTTP | POST | GET |
| Caminho (Receber) | `.../contas-a-receber/buscar` | `.../contas-a-receber` |
| Caminho (Pagar) | `.../contas-a-pagar/buscar` | `.../contas-a-pagar` |
| Parâmetros | Body JSON | Query String |
| Filtro de Data | Ausente | `data_vencimento_de` + `data_vencimento_ate` (365 dias) |

## Seção Técnica

### Exemplo de Chamada Correta

```text
GET https://api-v2.contaazul.com/v1/financeiro/eventos-financeiros/contas-a-receber
    ?data_vencimento_de=2025-02-03
    &data_vencimento_ate=2026-02-03
    &pagina=1
    &tamanho_pagina=200

Headers:
  Authorization: Bearer {access_token}
  Accept: application/json
```

### Parâmetros Obrigatórios

| Parâmetro | Tipo | Formato | Descrição |
|-----------|------|---------|-----------|
| `data_vencimento_de` | date | YYYY-MM-DD | Data inicial do filtro (OBRIGATÓRIO) |
| `data_vencimento_ate` | date | YYYY-MM-DD | Data final do filtro (OBRIGATÓRIO) |
| `pagina` | number | inteiro | Página da paginação (default: 1) |
| `tamanho_pagina` | number | inteiro | Itens por página (default: 10) |

## Resultado Esperado

Após as correções:
1. O módulo Financeiro sincronizará corretamente
2. Serão importados dados de contas a receber e a pagar dos últimos 365 dias
3. A mensagem "Alguns módulos falharam" será substituída por "Sincronização concluída"
4. Os dados financeiros alimentarão o DRE Inteligente e Score Tributário

