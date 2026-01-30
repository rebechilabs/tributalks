
# Plano de Implementação: PriceGuard 2026

## Visão Geral

O **PriceGuard 2026** é um simulador de elasticidade de margem que calcula o preço de venda necessário para cada produto/serviço manter o mesmo lucro líquido após a Reforma Tributária (CBS/IBS).

**Diferencial competitivo:** Único no mercado que integra DRE (financeiro) + Radar de Créditos (fiscal) + RTC (alíquotas oficiais) para calcular o "Ponto de Equilíbrio de Margem" por SKU.

---

## Arquitetura Técnica

### Componentes Existentes Reutilizados

```text
┌──────────────────────────────────────────────────────────────────┐
│                      PriceGuard 2026                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ DRE         │  │ Radar de    │  │ Calculadora │              │
│  │ Inteligente │  │ Créditos    │  │ RTC         │              │
│  │             │  │             │  │             │              │
│  │ - Margem    │  │ - Créditos  │  │ - Alíquotas │              │
│  │   bruta     │  │   por NCM   │  │   CBS/IBS   │              │
│  │ - CPV       │  │ - Insumos   │  │ - NCM/NBS   │              │
│  │ - Despesas  │  │             │  │             │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│                   ┌──────▼──────┐                                │
│                   │  Engine de  │                                │
│                   │  Gross-Up   │                                │
│                   │  Reverso    │                                │
│                   └──────┬──────┘                                │
│                          │                                       │
│         ┌────────────────┼────────────────┐                      │
│         │                │                │                      │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐              │
│  │ Preço 2026  │  │ Gap de      │  │ Análise de  │              │
│  │ Necessário  │  │ Eficiência  │  │ Competitivi-│              │
│  │             │  │             │  │ dade        │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

1. **Entrada de Produtos** (3 opções):
   - Importação automática dos NCMs já catalogados (`company_ncm_analysis`)
   - Upload de planilha Excel com SKUs
   - Entrada manual de itens

2. **Cruzamento de Dados:**
   - Para cada NCM → buscar alíquota CBS/IBS via `calculate-rtc`
   - Para cada NCM → buscar crédito estimado de insumos via `identified_credits`
   - Para cada produto → calcular custo proporcional via DRE

3. **Cálculo de Gross-Up Reverso:**
   - Preço2025 = input do usuário
   - AlíquotaAtual = calculada pelo DRE (PIS/COFINS/ICMS/ISS)
   - AlíquotaNova = CBS + IBS (via API oficial)
   - CréditoInsumo = estimado do Radar
   - **PreçoNovo = CustoLíquido / (1 - AlíquotaNova) / (1 - MargemDesejada)**

4. **Saída:**
   - Tabela de preços 2026 por SKU
   - Gap de eficiência (se preço sobe demais)
   - Análise de sensibilidade (cenários pessimista/otimista)

---

## Banco de Dados

### Nova Tabela: `price_simulations`

```sql
CREATE TABLE price_simulations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Identificação do produto
  sku_code TEXT,
  product_name TEXT NOT NULL,
  ncm_code TEXT,
  nbs_code TEXT,
  
  -- Preços e custos atuais (2025)
  preco_atual NUMERIC DEFAULT 0,
  custo_unitario NUMERIC DEFAULT 0,
  despesa_proporcional NUMERIC DEFAULT 0,
  margem_atual_percent NUMERIC DEFAULT 0,
  
  -- Alíquotas atuais
  aliquota_pis_cofins NUMERIC DEFAULT 0,
  aliquota_icms NUMERIC DEFAULT 0,
  aliquota_iss NUMERIC DEFAULT 0,
  aliquota_ipi NUMERIC DEFAULT 0,
  
  -- Alíquotas 2026 (CBS/IBS)
  aliquota_cbs NUMERIC DEFAULT 0,
  aliquota_ibs_uf NUMERIC DEFAULT 0,
  aliquota_ibs_mun NUMERIC DEFAULT 0,
  aliquota_is NUMERIC DEFAULT 0,
  
  -- Créditos de insumo
  credito_insumo_estimado NUMERIC DEFAULT 0,
  credito_fonte TEXT, -- 'radar', 'estimativa', 'manual'
  
  -- Resultados calculados
  preco_2026_necessario NUMERIC,
  variacao_preco_percent NUMERIC,
  margem_2026_mantida NUMERIC,
  lucro_unitario_atual NUMERIC,
  lucro_unitario_2026 NUMERIC,
  
  -- Análise de competitividade
  preco_concorrente NUMERIC,
  gap_competitivo_percent NUMERIC,
  recomendacao TEXT,
  
  -- Cenários
  cenario_pessimista JSONB,
  cenario_otimista JSONB,
  
  -- Metadata
  simulation_batch_id UUID,
  data_quality TEXT DEFAULT 'C', -- A, B, C
  
  CONSTRAINT unique_user_sku UNIQUE (user_id, sku_code)
);

-- RLS
ALTER TABLE price_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own simulations" 
  ON price_simulations FOR ALL 
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_price_simulations_user ON price_simulations(user_id);
CREATE INDEX idx_price_simulations_ncm ON price_simulations(ncm_code);
```

---

## Edge Function: `calculate-price-guard`

### Lógica Principal

```typescript
// Fórmula de Gross-Up Reverso
function calculatePriceGuard(input: PriceGuardInput): PriceGuardResult {
  const {
    custoUnitario,
    despesaProporcional,
    margemDesejada,
    aliquotaCBS,
    aliquotaIBSUf,
    aliquotaIBSMun,
    aliquotaIS,
    creditoInsumo,
    precoAtual
  } = input;

  // Alíquota total CBS/IBS
  const aliquotaTotal = aliquotaCBS + aliquotaIBSUf + aliquotaIBSMun + aliquotaIS;
  
  // Custo líquido = Custo + Despesa - Crédito de insumo
  const custoLiquido = custoUnitario + despesaProporcional - creditoInsumo;
  
  // Preço necessário para manter margem
  // P = C / (1 - t) / (1 - m)
  // Onde: t = alíquota, m = margem desejada
  const fatorTributario = 1 - (aliquotaTotal / 100);
  const fatorMargem = 1 - (margemDesejada / 100);
  
  const precoNecessario = custoLiquido / fatorTributario / fatorMargem;
  
  // Variação percentual
  const variacaoPercent = ((precoNecessario - precoAtual) / precoAtual) * 100;
  
  // Lucro unitário comparativo
  const lucroAtual = precoAtual * (margemDesejada / 100);
  const lucro2026 = precoNecessario * fatorTributario * (margemDesejada / 100);
  
  return {
    precoNecessario,
    variacaoPercent,
    lucroAtual,
    lucro2026,
    aliquotaTotal,
    custoLiquido
  };
}
```

### Integração com API RTC

```typescript
// Buscar alíquotas oficiais para o NCM
async function fetchTaxRates(ncm: string, uf: string, municipio: number) {
  const response = await fetch(
    'https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/calculadora/regime-geral',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        versao: '1.0.0',
        municipio,
        uf,
        itens: [{
          numero: 1,
          ncm: ncm.replace(/\D/g, ''),
          quantidade: 1,
          unidade: 'UN',
          cst: '000',
          baseCalculo: 100 // Base de R$ 100 para cálculo percentual
        }]
      })
    }
  );
  
  const data = await response.json();
  
  // Extrair alíquotas do retorno
  const tribCalc = data.objetos?.[0]?.tribCalc?.IBSCBS?.gIBSCBS || {};
  
  return {
    aliquotaCBS: parseFloat(tribCalc.gCBS?.pCBS || '8.8'),
    aliquotaIBSUf: parseFloat(tribCalc.gIBSUF?.pIBSUF || '8.85'),
    aliquotaIBSMun: parseFloat(tribCalc.gIBSMun?.pIBSMun || '8.85'),
    aliquotaIS: parseFloat(data.objetos?.[0]?.tribCalc?.IS?.gIS?.pIS || '0')
  };
}
```

---

## Componentes de UI

### 1. Página Principal: `/dashboard/priceguard`

```text
┌────────────────────────────────────────────────────────────────┐
│  🛡️ PriceGuard 2026 - Simulador de Preços                     │
│  Proteja sua margem na transição da Reforma Tributária        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Resumo do Impacto                                        │  │
│  │ ┌───────────────┬───────────────┬───────────────┐        │  │
│  │ │ 📦 45 SKUs    │ 📈 +8,2%      │ 💰 -R$ 45k    │        │  │
│  │ │ Simulados     │ Aumento Médio │ Gap Anual     │        │  │
│  │ └───────────────┴───────────────┴───────────────┘        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  [📥 Importar NCMs do Catálogo] [📊 Nova Simulação Manual]     │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Tabela de Simulações                                     │  │
│  │ ┌──────────┬────────┬────────┬─────────┬────────┬─────┐  │  │
│  │ │ SKU      │ NCM    │ Preço  │ Preço   │ Varia- │ Gap │  │  │
│  │ │          │        │ Atual  │ 2026    │ ção    │     │  │  │
│  │ ├──────────┼────────┼────────┼─────────┼────────┼─────┤  │  │
│  │ │ PROD-001 │ 6910.. │ R$ 150 │ R$ 162  │ +8,1%  │ 3%  │  │  │
│  │ │ PROD-002 │ 8471.. │ R$ 500 │ R$ 548  │ +9,6%  │ -   │  │  │
│  │ │ SERV-001 │ 123..  │ R$ 200 │ R$ 218  │ +9,0%  │ 5%  │  │  │
│  │ └──────────┴────────┴────────┴─────────┴────────┴─────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  [📄 Exportar Tabela de Preços 2026]                           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 2. Modal de Simulação Detalhada

```text
┌──────────────────────────────────────────────────────────────┐
│  Simulação: PROD-001 - Cerâmica Industrial                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  NCM: 69101100 │ UF: SP │ Município: São Paulo               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Dados Atuais (2025)               Projeção 2026        │  │
│  │ ─────────────────────             ─────────────────    │  │
│  │ Preço de Venda: R$ 150,00         R$ 162,15 (+8,1%)    │  │
│  │ Custo Unitário: R$ 80,00          R$ 80,00             │  │
│  │ Alíquota Total: 9,25% (PIS/COF)   26,5% (CBS/IBS)      │  │
│  │ Crédito Insumo: -                 R$ 12,50             │  │
│  │ ─────────────────────             ─────────────────    │  │
│  │ Margem Líquida: 18%               18% (mantida)        │  │
│  │ Lucro Unitário: R$ 27,00          R$ 29,19             │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ⚠️ Análise de Competitividade                               │
│  Preço do concorrente: R$ [______]                          │
│  Se o mercado só suporta +5%, você tem um gap de 3,1% para  │
│  buscar em eficiência operacional ou renegociação com       │
│  fornecedores (veja o OMC-AI).                              │
│                                                              │
│  [🔄 Recalcular] [💾 Salvar] [📄 Gerar PDF Executivo]        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 3. Análise de Sensibilidade

```text
┌─────────────────────────────────────────────────────────────┐
│  📊 Análise de Sensibilidade - PROD-001                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  "E se a alíquota de IBS for diferente?"                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         │ IBS 15%  │ IBS 17.7% │ IBS 20%  │ IBS 22% │    │
│  │─────────┼──────────┼───────────┼──────────┼─────────│    │
│  │ Preço   │ R$ 155   │ R$ 162    │ R$ 168   │ R$ 175  │    │
│  │ Variação│ +3,3%    │ +8,1%     │ +12,0%   │ +16,7%  │    │
│  │ Gap     │ OK       │ 3%        │ 7%       │ 12%     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  💡 Clara sugere:                                           │
│  "Se a alíquota de IBS ficar acima de 20%, considere        │
│   renegociar fornecedores via OMC-AI para compensar."       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Roadmap de Implementação (4 Meses)

### Mês 1: Fundação

**Semana 1-2: Banco de Dados e Edge Function**
- Criar tabela `price_simulations`
- Desenvolver Edge Function `calculate-price-guard`
- Integrar com API RTC existente

**Semana 3-4: UI Básica**
- Página principal `/dashboard/priceguard`
- Formulário de entrada manual de produto
- Exibição de resultado básico

### Mês 2: Integração com Módulos Existentes

**Semana 1-2: Conexão com DRE**
- Puxar margem bruta e CPV do DRE mais recente
- Calcular despesa proporcional automaticamente
- Usar regime tributário para alíquotas atuais

**Semana 3-4: Conexão com Radar**
- Buscar créditos de insumo por NCM
- Estimar crédito quando não disponível
- Indicador de qualidade do dado

### Mês 3: Interface Avançada

**Semana 1-2: Importação em Lote**
- Importar NCMs de `company_ncm_analysis`
- Upload de Excel com lista de SKUs
- Processamento em batch via Edge Function

**Semana 3-4: Análise de Competitividade**
- Campo para preço do concorrente
- Cálculo de gap de eficiência
- Integração com OMC-AI (CTA para otimizar compras)

### Mês 4: Relatórios e Polish

**Semana 1-2: Análise de Sensibilidade**
- Cenários pessimista/otimista
- Slider de alíquotas
- Gráfico de impacto

**Semana 3-4: Exportação e Lançamento**
- Gerador de PDF "Tabela de Preços 2026"
- Relatório executivo para o Board
- Onboarding guiado
- Testes alpha com 5 clientes

---

## Arquivos a Criar

### Frontend
- `src/pages/calculadora/PriceGuard.tsx` - Página principal
- `src/components/priceguard/PriceGuardForm.tsx` - Formulário de entrada
- `src/components/priceguard/PriceGuardResults.tsx` - Exibição de resultados
- `src/components/priceguard/PriceSimulationTable.tsx` - Tabela de simulações
- `src/components/priceguard/SensitivityAnalysis.tsx` - Gráfico de sensibilidade
- `src/components/priceguard/PriceGuardPdf.tsx` - Gerador de relatório PDF
- `src/hooks/usePriceGuard.ts` - Hook de gerenciamento de estado

### Backend
- `supabase/functions/calculate-price-guard/index.ts` - Engine de cálculo
- `supabase/migrations/xxx_create_price_simulations.sql` - Tabela

### Rotas
- Adicionar rota `/dashboard/priceguard` em `App.tsx`
- Adicionar item no menu lateral em `Sidebar.tsx`

---

## Monetização

**Preço Sugerido:** R$ 4.500/mês (add-on Enterprise)

**Justificativa:**
- Erro de 2% no repasse de preços em empresa de R$ 10M/ano = R$ 200k de prejuízo
- O software se paga em 1 mês de uso

**Perfil de Cliente:**
- Indústrias com centenas de SKUs
- Varejistas com contratos de longo prazo
- Empresas B2B com tabelas de preço fixo

---

## Próximos Passos Após Aprovação

1. Criar migração SQL para tabela `price_simulations`
2. Desenvolver Edge Function `calculate-price-guard`
3. Implementar página básica com formulário manual
4. Conectar com DRE e Radar existentes
5. Testar com dados reais de um cliente beta
