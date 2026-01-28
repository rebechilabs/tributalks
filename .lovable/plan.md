
# Plano: Integração de APIs Públicas Governamentais

## Resumo Executivo

Implementar integração com APIs públicas gratuitas (BrasilAPI, IBGE, Portal da Transparência) para enriquecer automaticamente dados de empresas, validar códigos tributários e buscar municípios em tempo real, alimentando Onboarding, Calculadora RTC, Perfil de Empresa e Análise de NCM.

---

## 1. Arquitetura da Solução

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                       Edge Function: gov-data-api                        │
│  Endpoint unificado para consultas a APIs públicas governamentais        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   /cnpj/{cnpj}      → BrasilAPI + OpenCNPJ (fallback)                   │
│   /cep/{cep}        → BrasilAPI CEP                                      │
│   /ncm/{codigo}     → BrasilAPI NCM (validação)                         │
│   /ibge/municipios  → BrasilAPI IBGE (lista completa)                   │
│   /bancos           → BrasilAPI Bancos                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        ┌───────────────────────┐       ┌───────────────────────┐
        │  Onboarding.tsx       │       │  PerfilEmpresa.tsx    │
        │  - Auto-fill CNPJ     │       │  - Enriquecimento     │
        │  - Valida CEP sede    │       │  - Dados CNAE         │
        └───────────────────────┘       └───────────────────────┘
                    │                               │
                    ▼                               ▼
        ┌───────────────────────┐       ┌───────────────────────┐
        │  TaxCalculatorForm    │       │  ERPSync              │
        │  - Municípios IBGE    │       │  - Valida CNPJ        │
        │  - Valida NCM         │       │  - Fornecedores       │
        └───────────────────────┘       └───────────────────────┘
```

---

## 2. APIs Gratuitas a Integrar

| API | Endpoint Base | Uso na Plataforma | Autenticação |
|-----|---------------|-------------------|--------------|
| **CNPJ** | `brasilapi.com.br/api/cnpj/v1/` | Auto-fill onboarding, validação fornecedores | Nenhuma |
| **CEP** | `brasilapi.com.br/api/cep/v2/` | Endereço sede empresa, validação entregas | Nenhuma |
| **NCM** | `brasilapi.com.br/api/ncm/v1/` | Validação códigos fiscais na calculadora | Nenhuma |
| **IBGE Municípios** | `brasilapi.com.br/api/ibge/municipios/v1/` | Lista completa de municípios por UF | Nenhuma |
| **Bancos** | `brasilapi.com.br/api/banks/v1` | Validação dados bancários (futuro) | Nenhuma |
| **Feriados** | `brasilapi.com.br/api/feriados/v1/` | Cálculo prazos fiscais | Nenhuma |

---

## 3. Edge Function: `gov-data-api`

### Estrutura do Arquivo

**Arquivo:** `supabase/functions/gov-data-api/index.ts`

### Endpoints Implementados

```typescript
// Roteamento por path
switch (path) {
  case '/cnpj':     // Consulta dados da empresa por CNPJ
  case '/cep':      // Busca endereço por CEP
  case '/ncm':      // Valida e retorna descrição NCM
  case '/municipios': // Lista municípios por UF
  case '/bancos':   // Lista bancos brasileiros
  case '/feriados': // Lista feriados nacionais
}
```

### Funcionalidades de cada Endpoint

**CNPJ (`/cnpj/{cnpj}`):**
- Consulta BrasilAPI como fonte primária
- Fallback para OpenCNPJ se BrasilAPI falhar
- Retorna: razão social, nome fantasia, CNAE, endereço, situação

**NCM (`/ncm/{codigo}`):**
- Valida código NCM de 8 dígitos
- Retorna descrição completa do produto
- Indica se código é válido para cálculo RTC

**Municípios (`/municipios/{uf}`):**
- Lista TODOS os municípios de uma UF (não só capitais)
- Retorna código IBGE para uso na calculadora
- Cache de 24h para performance

---

## 4. Modificações no Frontend

### 4.1 Onboarding com Auto-Fill CNPJ

**Arquivo:** `src/pages/Onboarding.tsx`

**Mudanças:**
- Adicionar campo CNPJ no Step 1 (antes do nome da empresa)
- Botão "Buscar" ao lado do campo CNPJ
- Auto-preenchimento de: empresa, estado, CNAE
- Indicador de loading durante busca
- Mensagem de erro se CNPJ inválido/não encontrado

```typescript
// Novo fluxo Step 1
1. Usuário digita CNPJ
2. Clica "Buscar" ou Enter
3. Sistema consulta gov-data-api/cnpj
4. Preenche automaticamente:
   - Nome da empresa (razão social)
   - Estado (UF)
   - CNAE principal
   - Nome fantasia
```

### 4.2 Calculadora RTC com Municípios Dinâmicos

**Arquivo:** `src/components/rtc/TaxCalculatorForm.tsx`

**Mudanças:**
- Remover lista estática `MUNICIPIOS_PRINCIPAIS`
- Buscar municípios dinamicamente ao selecionar UF
- Adicionar campo de busca/filtro nos municípios
- Validação de NCM em tempo real (opcional)

```typescript
// Novo comportamento
1. Usuário seleciona UF
2. Sistema busca gov-data-api/municipios/{uf}
3. Dropdown mostra TODOS os municípios
4. Campo de busca para filtrar por nome
5. Código IBGE correto enviado para API RTC
```

### 4.3 Perfil Empresa com Enriquecimento

**Arquivo:** `src/pages/PerfilEmpresa.tsx`

**Mudanças:**
- Opção de buscar dados por CNPJ a qualquer momento
- Preencher campos automaticamente do company_profile
- Validar CEP da sede

---

## 5. Componentes Auxiliares

### 5.1 Hook: `useCnpjLookup`

**Arquivo:** `src/hooks/useCnpjLookup.ts`

```typescript
export function useCnpjLookup() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<CnpjData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const lookup = async (cnpj: string) => { ... };
  
  return { lookup, isLoading, data, error };
}
```

### 5.2 Hook: `useMunicipios`

**Arquivo:** `src/hooks/useMunicipios.ts`

```typescript
export function useMunicipios(uf: string) {
  // Busca municípios quando UF muda
  // Cache local com React Query
  // Retorna lista para dropdown
}
```

### 5.3 Componente: `CnpjInput`

**Arquivo:** `src/components/common/CnpjInput.tsx`

- Input com máscara XX.XXX.XXX/XXXX-XX
- Botão de busca integrado
- Estados de loading/erro
- Callback com dados da empresa

---

## 6. Fluxo de Dados

```text
┌─────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Frontend   │────▶│  gov-data-api   │────▶│  BrasilAPI       │
│  (hook)     │◀────│  (Edge Func)    │◀────│  (Público)       │
└─────────────┘     └─────────────────┘     └──────────────────┘
       │                                            │
       ▼                                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Dados Retornados                          │
├─────────────────────────────────────────────────────────────┤
│  CNPJ: razao_social, nome_fantasia, cnae_fiscal,            │
│        uf, municipio, situacao_cadastral, porte             │
│                                                              │
│  Município: codigo_ibge, nome, uf (lista completa)          │
│                                                              │
│  NCM: codigo, descricao, unidade, aliquota_estimada         │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `supabase/functions/gov-data-api/index.ts` | CRIAR | Edge function unificada |
| `supabase/config.toml` | MODIFICAR | Adicionar config gov-data-api |
| `src/hooks/useCnpjLookup.ts` | CRIAR | Hook para consulta CNPJ |
| `src/hooks/useMunicipios.ts` | CRIAR | Hook para listar municípios |
| `src/components/common/CnpjInput.tsx` | CRIAR | Componente de input CNPJ |
| `src/pages/Onboarding.tsx` | MODIFICAR | Adicionar auto-fill CNPJ |
| `src/components/rtc/TaxCalculatorForm.tsx` | MODIFICAR | Municípios dinâmicos |
| `src/components/rtc/rtcConstants.ts` | MODIFICAR | Remover lista estática |

---

## 8. Cache e Performance

**Estratégia de Cache:**

| Endpoint | Cache | Motivo |
|----------|-------|--------|
| CNPJ | Sem cache | Dados podem mudar |
| Municípios | 24 horas | Lista raramente muda |
| NCM | 7 dias | Tabela estável |
| Bancos | 7 dias | Lista estável |

**Implementação:**
- Municípios: Cache em `sessionStorage` no frontend
- NCM: Cache em `sessionStorage` (já implementado)
- Edge Function: Headers `Cache-Control` apropriados

---

## 9. Tratamento de Erros

| Cenário | Comportamento |
|---------|---------------|
| CNPJ não encontrado | Mensagem amigável + permite preenchimento manual |
| BrasilAPI offline | Fallback para OpenCNPJ / CNPJ.ws |
| NCM inválido | Alerta mas não bloqueia cálculo |
| Timeout | Retry automático (1x) + mensagem |

---

## 10. Validações

**CNPJ:**
- Formato: 14 dígitos numéricos
- Dígitos verificadores válidos
- Não aceita CNPJs zerados ou sequenciais

**CEP:**
- Formato: 8 dígitos numéricos
- Validação de range (01000-000 a 99999-999)

**NCM:**
- Exatamente 8 dígitos
- Diferenciação de NBS (9 dígitos)

---

## 11. Entregáveis

1. **Edge Function `gov-data-api`** - Consultas unificadas a APIs públicas
2. **Hook `useCnpjLookup`** - Busca e cache de dados CNPJ
3. **Hook `useMunicipios`** - Lista dinâmica de municípios
4. **Componente `CnpjInput`** - Input reutilizável com busca
5. **Onboarding aprimorado** - Auto-fill via CNPJ
6. **Calculadora RTC aprimorada** - Municípios dinâmicos

---

## 12. Seção Técnica

### Estrutura da Edge Function

```typescript
// supabase/functions/gov-data-api/index.ts
const BRASIL_API_BASE = 'https://brasilapi.com.br/api';

// Endpoints
async function lookupCnpj(cnpj: string) {
  const response = await fetch(`${BRASIL_API_BASE}/cnpj/v1/${cnpj}`);
  if (!response.ok) {
    // Fallback to OpenCNPJ
    return await lookupCnpjFallback(cnpj);
  }
  return await response.json();
}

async function getMunicipios(uf: string) {
  const response = await fetch(`${BRASIL_API_BASE}/ibge/municipios/v1/${uf}`);
  return await response.json();
}

async function validateNcm(codigo: string) {
  const response = await fetch(`${BRASIL_API_BASE}/ncm/v1/${codigo}`);
  return await response.json();
}
```

### Formato de Resposta CNPJ

```json
{
  "cnpj": "00000000000191",
  "razao_social": "BANCO DO BRASIL SA",
  "nome_fantasia": "BANCO DO BRASIL",
  "cnae_fiscal": 6422100,
  "cnae_fiscal_descricao": "Bancos múltiplos",
  "uf": "DF",
  "municipio": "BRASILIA",
  "situacao_cadastral": "ATIVA",
  "porte": "DEMAIS"
}
```

### Formato de Resposta Municípios

```json
[
  { "nome": "São Paulo", "codigo_ibge": "3550308" },
  { "nome": "Guarulhos", "codigo_ibge": "3518800" }
]
```
