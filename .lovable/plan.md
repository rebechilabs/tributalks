
# Plano: Corrigir Endpoints da API Conta Azul

## Diagnóstico do Problema

Os logs da Edge Function `erp-sync` revelam que **TODOS os 4 módulos falharam** com o mesmo erro:

```
"A URL informada não corresponde a um recurso da API. Verifique a URL e os exemplos da documentação."
```

### Causa Raiz
O código está usando endpoints **incorretos** para a API v2 do Conta Azul:

| Módulo | Endpoint Atual (ERRADO) | Endpoint Correto (API v2) |
|--------|-------------------------|---------------------------|
| Empresa | `/companies` | `/v1/empresa` |
| Produtos | `/products?size=200` | `/v1/produto/busca` |
| NF-e/Vendas | `/sales?size=200` | `/v1/venda/busca` |
| Financeiro | `/purchases?size=200` | `/v1/compra/busca` |

### URL Base
O código usa `https://api-v2.contaazul.com/v1`, mas deveria ser apenas `https://api-v2.contaazul.com` (sem o `/v1` no final, pois cada endpoint já inclui `/v1/`).

## Alterações Necessárias

### 1. Arquivo: `supabase/functions/erp-sync/index.ts`

#### 1.1 Corrigir URL Base (linha 772)
```typescript
// DE:
private baseUrl = 'https://api-v2.contaazul.com/v1';

// PARA:
private baseUrl = 'https://api-v2.contaazul.com';
```

#### 1.2 Corrigir Endpoint Empresa (linha 893)
```typescript
// DE:
const data = await this.makeRequest('/companies', credentials);

// PARA:
const data = await this.makeRequest('/v1/empresa', credentials);
```

#### 1.3 Corrigir Endpoint Produtos (linha 917)
```typescript
// DE:
const data = await this.makeRequest('/products?size=200', credentials);

// PARA:
const data = await this.makeRequest('/v1/produto/busca?limite=200', credentials);
```

#### 1.4 Corrigir Endpoint Vendas/NF-e (linha 944)
```typescript
// DE:
const data = await this.makeRequest('/sales?size=200', credentials);

// PARA:
const data = await this.makeRequest('/v1/venda/busca?limite=200', credentials);
```

#### 1.5 Corrigir Endpoints Financeiro (linhas 978, 998)
```typescript
// DE:
const sales = await this.makeRequest('/sales?size=200', credentials);
const purchases = await this.makeRequest('/purchases?size=200', credentials);

// PARA:
const sales = await this.makeRequest('/v1/venda/busca?limite=200', credentials);
const purchases = await this.makeRequest('/v1/compra/busca?limite=200', credentials);
```

#### 1.6 Atualizar Parsing das Respostas
Os campos retornados pela API v2 também precisam de ajuste:

```typescript
// Empresa - campos da API v2
razao_social: data.razao_social,
cnpj_principal: data.cnpj,
nome_fantasia: data.nome_fantasia,

// Produtos - campos da API v2
ncm_code: produto.ncm || '00000000',
product_name: produto.descricao || produto.codigo,

// Vendas - campos da API v2
nfe_number: venda.numero?.toString() || '',
nfe_date: venda.data_emissao || new Date().toISOString(),
valor_total: venda.valor_total || 0,
```

### 2. Adicionar Logs Detalhados

Para facilitar debug futuro, adicionar logs antes de cada chamada de API:

```typescript
console.log(`[ContaAzul] Requesting: ${this.baseUrl}${endpoint}`);
console.log(`[ContaAzul] Response status: ${response.status}`);
```

## Seção Técnica

### Mapeamento Completo de Endpoints

```text
┌─────────────────────┬────────────────────────────────┬──────────────────────────────────┐
│ Funcionalidade      │ API v1 (antiga)                │ API v2 (atual)                   │
├─────────────────────┼────────────────────────────────┼──────────────────────────────────┤
│ Base URL            │ https://api.contaazul.com/v1   │ https://api-v2.contaazul.com     │
├─────────────────────┼────────────────────────────────┼──────────────────────────────────┤
│ Empresa             │ /companies                     │ /v1/empresa                      │
│ Produtos            │ /products                      │ /v1/produto/busca                │
│ Vendas              │ /sales                         │ /v1/venda/busca                  │
│ Compras             │ /purchases                     │ /v1/compra/busca                 │
│ Clientes            │ /customers                     │ /v1/cliente/busca                │
│ Fornecedores        │ /suppliers                     │ /v1/fornecedor/busca             │
│ NFS-e               │ N/A                            │ /v1/nfs-e/busca                  │
└─────────────────────┴────────────────────────────────┴──────────────────────────────────┘
```

### Parâmetros de Paginação

| API v1 | API v2 |
|--------|--------|
| `?size=200` | `?limite=200` |
| `?page=1` | `?pagina=1` |

### Campos de Resposta Alterados

```text
API v1 → API v2
─────────────────────
name → razao_social
federalTaxNumber → cnpj
tradingName → nome_fantasia
number → numero
emission → data_emissao
total → valor_total
customer.name → cliente.nome
```

## Resultado Esperado

Após a implementação:
- Os 4 módulos (Empresa, Produtos, NF-e, Financeiro) sincronizarão corretamente
- A mensagem "Alguns módulos falharam" será substituída por "Sincronização concluída"
- Os dados do Conta Azul alimentarão o Radar de Créditos, DRE e Score Tributário
