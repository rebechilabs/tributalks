

# Integracao Completa do Motor de Calculo para Simples Nacional

## Diagnostico Confirmado

**Bug critico (linha 276 da edge function):**
```text
const isSimplesNacional = companyContext.regime === 'simples_nacional'
```
O banco de dados armazena o regime como `'SIMPLES'` (12 usuarios), `'PRESUMIDO'` (5), `'REAL'` (1) e `null` (1). A comparacao com `'simples_nacional'` **nunca** retorna `true`, fazendo todas as 24 regras de Lucro Real rodarem para empresas do Simples.

**Dados incompletos no banco:**
- `monophasic_ncms`: 18 registros (faltam ~60 NCMs do Prompt 2)
- `simples_tax_distribution`: Anexo I faixa 4 tem `icms: 34.00`, mas o valor oficial (LC 123/2006) e `33.50`
- NCM `3306` presente no banco, mas **excluido expressamente** da Lei 10.147/2000

**Colunas ausentes na tabela `profiles`:**
- Nao existem colunas `rbt12` nem `anexo`. Esses dados vem da tabela `pgdas_arquivos` (ja implementado).

---

## Plano de Implementacao

### Etapa 1 -- Criar 4 arquivos de referencia em `src/data/`

Criar os seguintes arquivos TypeScript exatamente como especificado nos Prompts 1 a 4:

1. **`src/data/simples-nacional-tabelas.ts`** -- Tabelas dos Anexos I-V com interfaces `FaixaSimples`, `ReparticaoTributos`, `AnexoSimples`, constante `SIMPLES_NACIONAL`, e funcoes `calcularAliquotaEfetiva()` e `calcularParcelaTributo()`

2. **`src/data/ncms-monofasicos.ts`** -- Lista completa de NCMs monofasicos com 5 categorias (Medicamentos, Higiene/Cosmeticos, Veiculos/Autopecas, Bebidas, Combustiveis), exclusoes expressas (3306, 3003.90.56, 3004.90.46), e funcao `verificarNcmMonofasico()`

3. **`src/data/codigos-fiscais.ts`** -- Tabelas CSOSN (10 codigos) e CST PIS/COFINS (11 codigos de saida), com funcoes `isMonofasicoPorCst()`, `isIcmsRecolhidoPorST()`, `devePayIcmsNoDas()`

4. **`src/data/cfops.ts`** -- CFOPs de saida (5102, 5405, 5403, 5101, 6102, 6405) e entrada (1102, 1403, 2102, 2403), com funcoes `isCfopSaidaComST()`, `isCfopEntradaComST()`

### Etapa 2 -- Criar motor de calculo em `src/lib/`

**`src/lib/simples-nacional-rules.ts`** -- Conteudo exato do Prompt 5, com:
- Tipos `ItemNfe`, `DadosPgdas`, `CreditoIdentificado`, `ResultadoAnalise`
- Lista `REGRAS_BLOQUEADAS_SIMPLES` (15 regras)
- Funcao `calcularCreditoMonofasico()` (regra SIMPLES_MONO_001)
- Funcao `calcularCreditoIcmsST()` (regra SIMPLES_ICMS_ST_001)
- Funcao principal `analisarCreditosSimplesNacional()`

### Etapa 3 -- Corrigir a edge function `analyze-credits/index.ts`

**3a. Corrigir deteccao do regime (linha 266-276):**

Adicionar fallback para buscar regime da tabela `profiles` e normalizar a comparacao:

```text
// Buscar regime do perfil como fallback
const { data: userProfile } = await supabaseAdmin
  .from('profiles')
  .select('regime, cnae, setor')
  .eq('user_id', userId)
  .maybeSingle()

// Normalizar regime: 'SIMPLES' -> 'simples', etc.
const rawRegime = profile?.regime_tributario || userProfile?.regime || ''
const normalizedRegime = rawRegime.toString().toLowerCase().trim()

// Corrigir deteccao:
const isSimplesNacional = normalizedRegime.startsWith('simples')
```

**3b. Adicionar CFOP 6405 na deteccao de ICMS-ST (linha 422):**

Atualmente: `cfop === '5405' || cfop === '6404'`
Correto: `cfop === '5405' || cfop === '6405'` (6404 e outro CFOP)

**3c. Adicionar mais regras bloqueadas (linhas 185-191):**

Adicionar as regras faltantes: `PIS_COFINS_004`, `PIS_COFINS_005`, `PIS_COFINS_006`, `PIS_COFINS_009`, e `ICMS_ST_002`

**3d. Usar CNAE do profiles como fallback:**

Se `company_profile.cnae_principal` for null, usar `userProfile?.cnae`

### Etapa 4 -- Corrigir dados no banco de dados

**4a. Corrigir reparticao do Anexo I (faixas 4 e 5):**

Os valores oficiais da LC 123/2006 para Anexo I sao:
- Faixas 3, 4, 5: CPP = 42.00, ICMS = 33.50
- Faixas 1, 2: CPP = 41.50, ICMS = 34.00

O banco tem faixa 4 com ICMS = 34.00, deve ser 33.50.

```text
UPDATE simples_tax_distribution 
SET icms = 33.50, cpp = 42.00 
WHERE anexo = 'I' AND faixa = 4;
```

**4b. Remover NCM excluido:**

```text
DELETE FROM monophasic_ncms WHERE ncm_prefix = '3306';
```

**4c. Inserir NCMs faltantes (~60 registros):**

Inserir NCMs de:
- Medicamentos: 3001, 3002.10, 3002.90, 3005.10.10, 3006.10, 3006.20, 3006.30, 3006.40, 3006.60
- Higiene: 3401.11, 3401.19, 3401.20, 3401.30, 9603.21.00
- Veiculos: 8701, 8702, 8703, 8704, 8705, 8706, 8716.20.00
- Autopecas detalhadas: 4009, 4010, 6813, 7007, 7009, 8407, 8408, 8409, 8413, 8414, 8421, 8483, 8511, 8512, 8527, 8539, 8544, 8707
- Maquinas agricolas: 8424, 8432, 8433, 8434, 8435, 8436, 8437
- Bebidas adicionais: 2106.90.10, 2202.91.00, 2202.99
- Combustiveis adicionais: 2713

### Etapa 5 -- Deploy e validacao

Fazer deploy da edge function `analyze-credits` apos todas as alteracoes.

---

## Resultado Esperado

| Tributo | Antes (errado) | Depois (correto) |
|---------|----------------|------------------|
| PIS/COFINS | R$ 12.991,39 | ~R$ 4.596 |
| ICMS | R$ 14.241,84 | ~R$ 640 |
| ICMS-ST | R$ 359,38 | R$ 0 (absorvido acima) |
| IPI | R$ 658,46 | R$ 0 |
| **TOTAL** | **R$ 28.251,08** | **~R$ 5.236** |

A correcao principal e que `isSimplesNacional` passara a ser `true` para os 12 usuarios com regime `SIMPLES`, ativando as regras corretas (SIMPLES_MONO_001 e SIMPLES_ICMS_ST_001) e bloqueando as 15+ regras de Lucro Real que geravam falsos positivos.

