

# Complementos ao Radar de Creditos — Simples Nacional

## Visao Geral

O motor de creditos ja tem a logica base para Simples Nacional funcionando (regras `SIMPLES_MONO_001` e `SIMPLES_ICMS_ST_001`, filtragem por regime, funcao `getSimplesTaxDistribution`). Porem, existem 5 lacunas criticas que precisam ser preenchidas para que o sistema seja robusto e confiavel.

---

## 1. Tabela de NCMs Monofasicos no Banco de Dados

**Problema:** A lista de NCMs monofasicos esta hardcoded em 3 arquivos diferentes (`analyze-credits`, `process-xml-batch`, `MonophasicAlert.tsx`), com duplicacao e risco de inconsistencia. Faltam NCMs importantes.

**Solucao:** Criar tabela `monophasic_ncms` no banco com:
- `ncm_prefix` (text, PK) — ex: "3303", "2202"
- `category` (text) — ex: "Cosmeticos", "Bebidas"
- `legal_basis` (text) — ex: "Lei 10.147/2000"
- `description` (text) — descricao do grupo
- `is_active` (boolean, default true)
- `valid_from` / `valid_until` (date) — vigencia

Popular com os NCMs atuais mais adicionar os faltantes (farmacos, higiene pessoal, maquinas agricolas, etc.).

Atualizar `analyze-credits/index.ts` e `process-xml-batch/index.ts` para consultar essa tabela ao inves de usar listas hardcoded.

## 2. Tabela de Reparticao por Faixa e Anexo

**Problema:** A funcao `getSimplesTaxDistribution()` so cobre Anexos I e II (12 combinacoes de 36 possiveis). Anexos III, IV, V e VI estao faltando completamente.

**Solucao:** Criar tabela `simples_tax_distribution` com:
- `anexo` (text) — I a V (VI foi extinto, incorporado ao V)
- `faixa` (integer) — 1 a 6
- `irpj`, `csll`, `cofins`, `pis`, `cpp`, `icms`, `iss` (numeric) — percentuais de reparticao
- `aliquota_nominal` (numeric)
- `deducao` (numeric)
- `receita_min` / `receita_max` (numeric) — faixas de RBT12
- PK composta: (`anexo`, `faixa`)

Popular com todas as 30 combinacoes (5 anexos x 6 faixas, conforme LC 123/2006).

Atualizar `getSimplesTaxDistribution()` para consultar o banco ao inves de switch/case hardcoded. Os dados serao passados no `companyContext` para evitar queries adicionais durante a analise.

## 3. Calculo Automatico de RBT12 e Faixa

**Problema:** O sistema depende do campo `rbt12` no `dados_completos` do PGDAS, mas se o usuario subir 12 meses de PGDAS, o sistema deveria inferir o RBT12 somando as receitas brutas.

**Solucao:** Na edge function `analyze-credits`, antes de determinar a faixa:

1. Buscar todos os PGDAS do usuario dos ultimos 12 meses
2. Somar `receita_bruta` de cada periodo
3. Se o RBT12 calculado for > 0, usa-lo. Senao, usar o do `dados_completos`
4. Determinar faixa automaticamente via `detectFaixaFromRBT12()`
5. Salvar o RBT12 calculado no `dados_completos` do PGDAS mais recente para cache

Tambem atualizar `detectAnexoFromCNAE()` para usar o campo `anexo_simples` da tabela `pgdas_arquivos` quando disponivel (mais confiavel que inferir pelo CNAE).

## 4. Atividades Mistas (Multiplos Anexos)

**Problema:** Algumas empresas do Simples tem receitas em mais de um anexo (ex: comercio no Anexo I + servicos no Anexo III). A reparticao de tributos e diferente para cada anexo.

**Solucao:** Ajustar a logica do `analyze-credits`:

1. Verificar o campo `tem_atividades_mistas` no `company_profile` (ja existe na tabela)
2. Se mista, buscar os CNAEs secundarios (`cnae_secundarios`) e mapear cada um para seu anexo
3. Para cada item de saida, determinar o anexo correto baseado no CNAE da atividade
4. Aplicar a reparticao de tributos correspondente ao anexo daquele item

Como simplificacao inicial: se a empresa tem atividades mistas, usar o anexo do PGDAS como default e permitir que o usuario ajuste manualmente (campo `anexo_override` por NCM ou CFOP seria uma evolucao futura).

## 5. Testes Automatizados com Dados Ficticios

**Problema:** Nao existem testes unitarios para o motor de creditos. Qualquer alteracao pode quebrar os calculos sem deteccao.

**Solucao:** Criar testes Deno para a edge function `analyze-credits`:

**Arquivo:** `supabase/functions/analyze-credits/index.test.ts`

Cenarios de teste com os dados ficticios do caso controlado:

- **Teste 1 — Simples Nacional Comercio:** Validar que IPI = R$ 0 (regra desabilitada)
- **Teste 2 — PIS/COFINS Monofasico:** Receita monofasica R$ 303.812 x 9,76% x 15,50% ≈ R$ 4.596
- **Teste 3 — ICMS-ST Segregacao:** Receita ST ~R$ 19.275 x 9,76% x 34% ≈ R$ 640
- **Teste 4 — Lucro Real:** Validar que regras padrao (IPI_001, ICMS_001, etc.) funcionam normalmente
- **Teste 5 — Funcoes auxiliares:** `detectFaixaFromRBT12`, `detectAnexoFromCNAE`, `isMonophasicNCM`
- **Teste 6 — Reparticao por faixa:** Validar que todas as 30 combinacoes retornam valores corretos

Os testes usarao dados mockados (sem chamadas ao banco real) para velocidade e confiabilidade.

---

## Detalhes Tecnicos

### Migracoes SQL

**Migracao 1 — Tabela `monophasic_ncms`:**

```text
CREATE TABLE monophasic_ncms (
  ncm_prefix text PRIMARY KEY,
  category text NOT NULL,
  legal_basis text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  valid_from date DEFAULT '2000-01-01',
  valid_until date DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- Popular com ~20 prefixos NCM conhecidos
INSERT INTO monophasic_ncms VALUES
  ('2710', 'Combustiveis', 'Lei 11.116/2005', 'Oleos de petroleo'),
  ('2207', 'Combustiveis', 'Lei 11.116/2005', 'Alcool etilico'),
  ('3003', 'Medicamentos', 'Lei 10.147/2000', 'Medicamentos (mistura)'),
  ('3004', 'Medicamentos', 'Lei 10.147/2000', 'Medicamentos (dose)'),
  ('3303', 'Cosmeticos', 'Lei 10.147/2000', 'Perfumes'),
  ('3304', 'Cosmeticos', 'Lei 10.147/2000', 'Maquiagem e cuidados da pele'),
  ('3305', 'Cosmeticos', 'Lei 10.147/2000', 'Preparacoes capilares'),
  ('3306', 'Higiene', 'Lei 10.147/2000', 'Preparacoes para higiene bucal'),
  ('3307', 'Higiene', 'Lei 10.147/2000', 'Desodorantes e sais de banho'),
  ('2201', 'Bebidas', 'Lei 13.097/2015', 'Aguas minerais'),
  ('2202', 'Bebidas', 'Lei 13.097/2015', 'Bebidas nao alcoolicas'),
  ('2203', 'Bebidas', 'Lei 13.097/2015', 'Cervejas'),
  ('2204', 'Bebidas', 'Lei 13.097/2015', 'Vinhos'),
  ('8708', 'Autopecas', 'Lei 10.485/2002', 'Pecas para veiculos'),
  ('4011', 'Autopecas', 'Lei 10.485/2002', 'Pneus novos'),
  ('8507', 'Autopecas', 'Lei 10.485/2002', 'Baterias'),
  ('8433', 'Maq.Agricolas', 'Lei 10.485/2002', 'Maquinas agricolas'),
  ('8701', 'Maq.Agricolas', 'Lei 10.485/2002', 'Tratores');

-- RLS: leitura publica (dados legislativos)
ALTER TABLE monophasic_ncms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all" ON monophasic_ncms FOR SELECT USING (true);
```

**Migracao 2 — Tabela `simples_tax_distribution`:**

```text
CREATE TABLE simples_tax_distribution (
  anexo text NOT NULL,
  faixa integer NOT NULL,
  aliquota_nominal numeric NOT NULL,
  deducao numeric NOT NULL DEFAULT 0,
  receita_min numeric NOT NULL,
  receita_max numeric NOT NULL,
  irpj numeric NOT NULL,
  csll numeric NOT NULL,
  cofins numeric NOT NULL,
  pis numeric NOT NULL,
  cpp numeric NOT NULL,
  icms numeric NOT NULL DEFAULT 0,
  iss numeric NOT NULL DEFAULT 0,
  PRIMARY KEY (anexo, faixa)
);

-- Popular com 30 combinacoes (5 anexos x 6 faixas)
-- Exemplo Anexo I completo:
INSERT INTO simples_tax_distribution VALUES
  ('I',1,4.00,0,0,180000,5.50,3.50,12.74,2.76,41.50,34.00,0),
  ('I',2,7.30,5940,180000.01,360000,5.50,3.50,12.74,2.76,41.50,34.00,0),
  ('I',3,9.50,13860,360000.01,720000,5.50,3.50,12.74,2.76,42.00,33.50,0),
  ('I',4,10.70,22500,720000.01,1800000,5.50,3.50,12.74,2.76,41.50,34.00,0),
  ('I',5,14.30,87300,1800000.01,3600000,5.50,3.50,12.74,2.76,42.00,33.50,0),
  ('I',6,19.00,378000,3600000.01,4800000,13.50,10.00,28.27,6.13,42.10,0,0);
  -- (+ Anexos II a V com mesma estrutura)

ALTER TABLE simples_tax_distribution ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all" ON simples_tax_distribution FOR SELECT USING (true);
```

### Edge Function `analyze-credits/index.ts`

Mudancas principais:

1. **Buscar NCMs monofasicos do banco** no inicio (uma query), substituindo `isMonophasicNCM()` hardcoded
2. **Buscar reparticao do banco** substituindo `getSimplesTaxDistribution()` hardcoded
3. **Calcular RBT12** somando receitas dos ultimos 12 PGDAS
4. **Logar faixa/anexo calculados** para debug

### Testes Deno

```text
Arquivo: supabase/functions/analyze-credits/index.test.ts

- Testa funcoes auxiliares puras (detectFaixaFromRBT12, detectAnexoFromCNAE)
- Testa cenario Simples Nacional com XMLs mockados
- Valida que IPI = 0 para Simples comercio
- Valida calculo PIS/COFINS monofasico ≈ R$ 4.596
- Valida calculo ICMS-ST ≈ R$ 640
```

---

## Sequencia de Implementacao

1. Criar migracao com tabela `monophasic_ncms` (com dados)
2. Criar migracao com tabela `simples_tax_distribution` (com dados dos 5 anexos)
3. Atualizar `analyze-credits/index.ts` para consultar as novas tabelas + calcular RBT12
4. Adicionar tratamento basico de atividades mistas
5. Criar testes unitarios Deno
6. Deployar e testar com os dados ficticios

