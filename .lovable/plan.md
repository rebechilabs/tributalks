

# Plano: Corrigir Endpoints da API Conta Azul v2

## Problema Identificado

Os endpoints da API Conta Azul no arquivo `erp-sync/index.ts` estão incorretos, usando paths e parâmetros que não correspondem à documentação oficial da API v2.

## Endpoints a Corrigir

| Módulo | Atual (ERRADO) | Correto (Documentação) |
|--------|----------------|------------------------|
| Produtos | `/v1/produto/busca?limite=200` | `/v1/produtos?pagina=1&tamanho_pagina=200` |
| Vendas | `/v1/venda/busca?limite=200` | `/v1/venda/busca` (com body POST ou params corretos) |
| Notas Fiscais | (não implementado) | `/v1/notas-fiscais?data_inicial=...&data_final=...&pagina=1&tamanho_pagina=200` |
| Contas a Receber | `/v1/venda/busca` | `/v1/financeiro/eventos-financeiros/contas-a-receber/buscar` |
| Contas a Pagar | `/v1/compra/busca` | `/v1/financeiro/eventos-financeiros/contas-a-pagar/buscar` |
| Empresa | `/v1/empresa` | `/v1/empresa` (OK) |

## Alterações Necessárias

### Arquivo: `supabase/functions/erp-sync/index.ts`

#### 1. Corrigir `syncProdutos` (linha ~926)
```typescript
// DE:
const response = await this.makeRequest('/v1/produto/busca?limite=200', credentials);

// PARA:
const response = await this.makeRequest('/v1/produtos?pagina=1&tamanho_pagina=200', credentials);
```

#### 2. Corrigir `syncNFe` (linha ~959)
```typescript
// DE:
const response = await this.makeRequest('/v1/venda/busca?limite=200', credentials);

// PARA:
// Usar endpoint de notas fiscais com filtro de data
const dataFinal = new Date().toISOString().split('T')[0];
const dataInicial = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const response = await this.makeRequest(
  `/v1/notas-fiscais?data_inicial=${dataInicial}&data_final=${dataFinal}&pagina=1&tamanho_pagina=200`, 
  credentials
);
```

#### 3. Corrigir `syncFinanceiro` - Receitas (linha ~1001)
```typescript
// DE:
const salesResponse = await this.makeRequest('/v1/venda/busca?limite=200', credentials);

// PARA:
const salesResponse = await this.makeRequest(
  '/v1/financeiro/eventos-financeiros/contas-a-receber/buscar', 
  credentials, 
  'POST'
);
```

#### 4. Corrigir `syncFinanceiro` - Despesas (linha ~1026)
```typescript
// DE:
const purchasesResponse = await this.makeRequest('/v1/compra/busca?limite=200', credentials);

// PARA:
const purchasesResponse = await this.makeRequest(
  '/v1/financeiro/eventos-financeiros/contas-a-pagar/buscar', 
  credentials, 
  'POST'
);
```

#### 5. Atualizar método `makeRequest` para suportar POST

O método `makeRequest` precisa ser modificado para aceitar requisições POST (necessárias para os endpoints financeiros):

```typescript
private async makeRequest(
  endpoint: string, 
  credentials: ERPCredentials, 
  method: 'GET' | 'POST' = 'GET',
  body?: Record<string, unknown>,
  retryCount = 0
): Promise<any> {
  const fullUrl = `${this.baseUrl}${endpoint}`;
  console.log(`[ContaAzul] ${method} ${fullUrl}`);
  
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${credentials.access_token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  };
  
  if (method === 'POST' && body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(fullUrl, options);
  console.log(`[ContaAzul] Response status: ${response.status}`);
  // ... resto da lógica
}
```

#### 6. Adicionar logs detalhados por módulo

Adicionar logs específicos para identificar qual módulo falhou:

```typescript
console.log(`[ContaAzul] MÓDULO: ${moduleName}`);
console.log(`[ContaAzul] Endpoint: ${fullUrl}`);
console.log(`[ContaAzul] Method: ${method}`);
console.log(`[ContaAzul] Status: ${response.status}`);
if (!response.ok) {
  const errorBody = await response.text();
  console.error(`[ContaAzul] ERRO no módulo ${moduleName}: HTTP ${response.status} - ${errorBody}`);
}
```

## Parâmetros de Paginação Corretos

| Parâmetro Atual | Parâmetro Correto |
|-----------------|-------------------|
| `limite` | `tamanho_pagina` |
| `page` | `pagina` |

## Resultado Esperado

Após as correções:
1. Todos os 4 módulos sincronizarão corretamente
2. Os logs mostrarão qual endpoint específico está sendo chamado
3. Erros serão exibidos com o código HTTP e mensagem detalhada
4. A mensagem "Alguns módulos falharam" será substituída por "Sincronização concluída"

## Ordem de Implementação

1. Modificar `makeRequest` para suportar POST
2. Corrigir endpoint de Produtos
3. Corrigir endpoint de Notas Fiscais  
4. Corrigir endpoints Financeiros (Contas a Receber/Pagar)
5. Adicionar logs detalhados
6. Testar cada módulo individualmente

