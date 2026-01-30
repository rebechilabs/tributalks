
# Plano de Implementação: Suíte Margem Ativa 2026

## Visao Geral

A **Suite Margem Ativa 2026** e um centro de comando integrado para a transicao tributaria CBS/IBS, composto por dois modulos complementares que resolvem o problema de margem de ponta a ponta:

| Modulo | Foco | Problema Resolvido |
|--------|------|-------------------|
| **OMC-AI** | Compras | Fornecedores que parecem baratos mas "drenam" margem por falta de credito |
| **PriceGuard** | Vendas | Preco mal calculado que ou destrói margem ou perde competitividade |

**Diferencial Competitivo:** Unico no mercado que integra DRE (financeiro) + Radar de Creditos (fiscal) + RTC (aliquotas oficiais) + Historico de XMLs para calcular impacto real no EBITDA.

---

## Arquitetura Tecnica

```text
+------------------------------------------------------------------+
|                    Suite Margem Ativa 2026                        |
+------------------------------------------------------------------+
|                                                                   |
|  +---------------------------+  +-----------------------------+   |
|  |        OMC-AI             |  |        PriceGuard           |   |
|  |   (Inteligencia de       |  |   (Inteligencia de          |   |
|  |        Compras)           |  |         Vendas)             |   |
|  +-------------+-------------+  +-------------+---------------+   |
|                |                              |                   |
|  +-------------v------------------------------v---------------+   |
|  |              Motor de Calculo Unificado                    |   |
|  |  - Custo Efetivo Liquido (fornecedores)                    |   |
|  |  - Gross-Up Reverso (precos)                               |   |
|  |  - Projecao de Margem 2026                                 |   |
|  +-------------+------------------------------+---------------+   |
|                |                              |                   |
|  +-------------v--------------+  +------------v---------------+   |
|  | identified_credits        |  | company_dre                |   |
|  | (Radar de Creditos)       |  | (DRE Inteligente)          |   |
|  +---------------------------+  +-----------------------------+   |
|                                                                   |
|  +---------------------------+  +-----------------------------+   |
|  | company_ncm_analysis      |  | calculate-rtc              |   |
|  | (Catalogo NCM)            |  | (API RFB)                  |   |
|  +---------------------------+  +-----------------------------+   |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Banco de Dados

### Tabela 1: `suppliers` (Consolidacao de Fornecedores)

Nova tabela para agregar dados de fornecedores extraidos dos XMLs.

```sql
-- Campos principais
- id, user_id, cnpj, razao_social
- regime_tributario (simples, presumido, real, desconhecido)
- regime_confianca (high, medium, low) - nivel de certeza da classificacao
- total_compras_12m (valor total de compras nos ultimos 12 meses)
- qtd_notas_12m (quantidade de notas processadas)
- ncms_frequentes (array dos NCMs mais comprados)
- uf, municipio, cnae_principal
- aliquota_credito_estimada (0-26.5% baseado no regime)
- custo_efetivo_score (0-100, quanto maior, mais eficiente)
- classificacao (manter, renegociar, substituir)
- ultima_atualizacao, created_at
```

### Tabela 2: `supplier_analysis` (Analise Detalhada por Fornecedor)

Historico de analises do OMC-AI para cada fornecedor.

```sql
-- Campos principais
- id, user_id, supplier_id
- periodo_inicio, periodo_fim
- valor_nominal_total (soma das notas)
- valor_tributos_pagos (ICMS + PIS + COFINS)
- credito_aproveitado_atual
- credito_potencial_2026 (projecao CBS/IBS)
- gap_credito (diferenca = vazamento de margem)
- custo_efetivo_liquido
- preco_indiferenca (preco equivalente se fosse Lucro Real)
- recomendacao (manter, renegociar_X%, substituir)
- status (pendente, analisado, acao_tomada)
```

### Tabela 3: `price_simulations` (Simulacoes de Preco PriceGuard)

Tabela para armazenar simulacoes de precificacao por SKU/produto.

```sql
-- Campos principais
- id, user_id, created_at, updated_at
- sku_code, product_name, ncm_code, nbs_code
- uf, municipio_codigo, municipio_nome
-- Dados atuais (2025)
- preco_atual, custo_unitario, despesa_proporcional, margem_atual_percent
- aliquota_pis_cofins, aliquota_icms, aliquota_iss, aliquota_ipi
-- Aliquotas 2026 (CBS/IBS)
- aliquota_cbs, aliquota_ibs_uf, aliquota_ibs_mun, aliquota_is
-- Creditos de insumo
- credito_insumo_estimado, credito_fonte (radar, estimativa, manual)
-- Resultados calculados
- preco_2026_necessario, variacao_preco_percent
- margem_2026_mantida, lucro_unitario_atual, lucro_unitario_2026
-- Analise de competitividade
- preco_concorrente, gap_competitivo_percent, recomendacao
-- Cenarios
- cenario_pessimista (JSONB), cenario_otimista (JSONB)
-- Metadata
- simulation_batch_id, data_quality (A, B, C)
```

### Tabela 4: `margin_dashboard` (Consolidacao Executiva)

Visao consolidada do impacto no EBITDA para o Painel Executivo.

```sql
-- Campos principais
- id, user_id, periodo_referencia
-- OMC-AI (Compras)
- total_compras_analisado
- gap_credito_total (vazamento de margem identificado)
- economia_potencial_renegociacao
- fornecedores_criticos (qtd com gap > 10%)
-- PriceGuard (Vendas)
- skus_simulados
- variacao_media_preco
- gap_competitivo_medio
- risco_perda_margem
-- Consolidado
- impacto_ebitda_anual_min, impacto_ebitda_anual_max
- score_prontidao (0-100)
- created_at, updated_at
```

---

## Edge Functions

### 1. `analyze-suppliers` - Consolidador de Fornecedores

Processa os dados de `identified_credits` e `xml_analysis` para criar/atualizar o cadastro consolidado de fornecedores.

**Logica Principal:**
1. Agrupa `identified_credits` por `supplier_cnpj`
2. Calcula metricas agregadas (total compras, qtd notas, NCMs frequentes)
3. Classifica regime tributario usando heuristicas:
   - CST ICMS 101-103 -> Simples Nacional
   - Destaque de ICMS com credito -> Lucro Real/Presumido
   - Sem destaque -> Simples ou MEI
4. Calcula `aliquota_credito_estimada` baseado no regime
5. Persiste na tabela `suppliers`

### 2. `calculate-supplier-cost` - Motor OMC-AI

Calcula o Custo Efetivo Liquido e Preco de Indiferenca para cada fornecedor.

**Formula Principal:**
```
Custo Efetivo Liquido = Preco Nominal * (1 - Aliquota Credito)

Preco de Indiferenca = Preco Nominal Fornecedor B / (1 - Aliquota Credito B) * (1 - Aliquota Credito A)
```

**Exemplo:**
- Fornecedor A (Simples): R$ 10.000, credito 4% -> Custo Liquido = R$ 9.600
- Fornecedor B (Lucro Real): R$ 12.000, credito 26.5% -> Custo Liquido = R$ 8.820
- Fornecedor B e 8.1% mais barato apesar do preco nominal maior

### 3. `calculate-price-guard` - Motor PriceGuard

Calcula o preco de venda necessario para manter margem pos-reforma.

**Formula Gross-Up Reverso:**
```
Preco 2026 = (Custo Unitario + Despesa - Credito Insumo) / (1 - Aliquota Nova) / (1 - Margem Desejada)
```

**Integracao:**
- Puxa margem do `company_dre` mais recente
- Puxa creditos de insumo do `identified_credits`
- Busca aliquotas oficiais via `calculate-rtc`

### 4. `sync-margin-dashboard` - Consolidador Executivo

Agrega dados das duas ferramentas para o Painel Executivo.

---

## Componentes de UI

### Estrutura de Arquivos

```
src/
  pages/
    dashboard/
      MargemAtiva.tsx           # Hub da Suite (3 abas)
      
  components/
    margem-ativa/
      index.ts                  # Exports
      MargemAtivaHeader.tsx     # Header com KPIs consolidados
      
      # OMC-AI (Compras)
      omc/
        SupplierTable.tsx       # Lista de fornecedores
        SupplierAnalysisCard.tsx # Detalhe do fornecedor
        SupplierGapChart.tsx    # Grafico de gap por fornecedor
        IndifferentPriceModal.tsx # Calculadora de indiferenca
        SupplierRecommendations.tsx # Lista de acoes sugeridas
        
      # PriceGuard (Vendas)  
      priceguard/
        PriceGuardForm.tsx      # Formulario de entrada
        PriceGuardResults.tsx   # Resultados da simulacao
        PriceSimulationTable.tsx # Tabela de SKUs
        SensitivityChart.tsx    # Grafico de sensibilidade
        CompetitiveGapAlert.tsx # Alerta de gap
        
      # Dashboard Executivo
      executive/
        MarginImpactCard.tsx    # Impacto consolidado no EBITDA
        ActionPriorityList.tsx  # Lista de acoes priorizadas
        MarginPdfReport.tsx     # Gerador de PDF executivo
        
  hooks/
    useSupplierAnalysis.ts      # Dados de fornecedores
    usePriceGuard.ts            # Simulacoes de preco
    useMarginDashboard.ts       # Dados consolidados
```

### Tela Principal: Hub da Suite

```text
+------------------------------------------------------------------+
| Suite Margem Ativa 2026                                           |
| Proteja sua margem na transicao da Reforma Tributaria             |
+------------------------------------------------------------------+
| KPIs Consolidados                                                 |
| +------------------+ +------------------+ +--------------------+  |
| | Vazamento de     | | Variacao de      | | Impacto no         |  |
| | Credito          | | Preco Necessaria | | EBITDA Anual       |  |
| | R$ 245.000/ano   | | +8,2% medio      | | -R$ 180k a +R$ 95k |  |
| +------------------+ +------------------+ +--------------------+  |
+------------------------------------------------------------------+
| [OMC-AI Compras] [PriceGuard Vendas] [Dashboard Executivo]        |
+------------------------------------------------------------------+
|                                                                   |
| (Conteudo da aba selecionada)                                     |
|                                                                   |
+------------------------------------------------------------------+
```

### Aba 1: OMC-AI (Compras)

```text
+------------------------------------------------------------------+
| Analise de Fornecedores                   [Atualizar] [Exportar]  |
+------------------------------------------------------------------+
| Filtros: [Todos os regimes v] [Gap > 5% v] [Ordenar: Gap v]       |
+------------------------------------------------------------------+
| Fornecedor        | Regime    | Compras 12m | Gap      | Acao    |
|-------------------|-----------|-------------|----------|---------|
| Tech Solutions    | Simples   | R$ 180.000  | R$ 42.300| Subst.  |
| Office Express    | Presumido | R$ 95.000   | R$ 8.200 | Reneg.  |
| Logistica Agil    | Real      | R$ 320.000  | R$ 0     | Manter  |
+------------------------------------------------------------------+
|                                                                   |
| Detalhes: Tech Solutions Ltda                          [X]        |
| CNPJ: 12.345.678/0001-90 | Regime: Simples Nacional               |
| --------------------------------------------------------          |
| Preco Nominal Total:           R$ 180.000,00                      |
| Credito de IBS/CBS Estimado:   R$ 7.200,00 (4%)                   |
| Custo Efetivo Liquido:         R$ 172.800,00                      |
| --------------------------------------------------------          |
| Se fosse Lucro Real (26,5%):   R$ 132.300,00                      |
| GAP de Credito (vazamento):    R$ 40.500,00/ano                   |
| --------------------------------------------------------          |
| Preco de Indiferenca:                                             |
| "Para continuar competitivo, o fornecedor precisaria              |
|  reduzir o preco para R$ 147.000 (-18,3%)"                        |
| --------------------------------------------------------          |
| [Gerar Script de Renegociacao] [Buscar Alternativas]              |
+------------------------------------------------------------------+
```

### Aba 2: PriceGuard (Vendas)

```text
+------------------------------------------------------------------+
| Simulador de Precos 2026                  [Importar NCMs] [Novo]  |
+------------------------------------------------------------------+
| Resumo: 45 SKUs simulados | Variacao media: +8,2% | Gap: R$ 45k   |
+------------------------------------------------------------------+
| SKU      | NCM       | Preco Atual | Preco 2026 | Var.  | Gap    |
|----------|-----------|-------------|------------|-------|--------|
| PROD-001 | 69101100  | R$ 150,00   | R$ 162,15  | +8,1% | 3%     |
| PROD-002 | 84713012  | R$ 500,00   | R$ 548,00  | +9,6% | -      |
| SERV-001 | 1234567890| R$ 200,00   | R$ 218,00  | +9,0% | 5%     |
+------------------------------------------------------------------+
|                                                                   |
| Simulacao Detalhada: PROD-001                          [X]        |
| --------------------------------------------------------          |
|           ATUAL (2025)          |    PROJECAO 2026                |
| Preco de Venda: R$ 150,00       | R$ 162,15 (+8,1%)               |
| Custo Unitario: R$ 80,00        | R$ 80,00                        |
| Aliquota Total: 9,25% (PIS/COF) | 26,5% (CBS/IBS)                 |
| Credito Insumo: -               | R$ 12,50                        |
| --------------------------------------------------------          |
| Margem Liquida: 18%             | 18% (mantida)                   |
| Lucro Unitario: R$ 27,00        | R$ 29,19                        |
| --------------------------------------------------------          |
| Preco do concorrente: R$ [______]                                 |
| Se o mercado so suporta +5%, voce tem um gap de 3,1%              |
| para buscar em eficiencia (veja OMC-AI).                          |
| --------------------------------------------------------          |
| [Recalcular] [Salvar] [Gerar PDF]                                 |
+------------------------------------------------------------------+
```

### Aba 3: Dashboard Executivo

```text
+------------------------------------------------------------------+
| Impacto Consolidado no EBITDA               [Atualizar] [PDF]     |
+------------------------------------------------------------------+
|                                                                   |
| +-------------------------+  +-------------------------------+    |
| | VAZAMENTO DE MARGEM     |  | PROTECAO DE MARGEM            |    |
| | (Compras - OMC-AI)      |  | (Vendas - PriceGuard)         |    |
| |                         |  |                               |    |
| | Gap de Credito Total    |  | Variacao Media de Preco       |    |
| | R$ 245.000/ano          |  | +8,2%                         |    |
| |                         |  |                               |    |
| | Fornecedores Criticos   |  | SKUs em Risco Competitivo     |    |
| | 12 (gap > 10%)          |  | 8 (gap > 5%)                  |    |
| |                         |  |                               |    |
| | Economia Potencial      |  | Risco de Perda de Margem      |    |
| | R$ 180.000/ano          |  | R$ 95.000/ano                 |    |
| +-------------------------+  +-------------------------------+    |
|                                                                   |
| +-------------------------------------------------------------+  |
| | IMPACTO LIQUIDO NO EBITDA 2026                              |  |
| |                                                             |  |
| | Cenario Pessimista: -R$ 180.000 (sem acoes)                 |  |
| | Cenario Otimista:   +R$ 95.000 (acoes implementadas)        |  |
| | =========================================================== |  |
| | Delta: R$ 275.000 de valor capturavel                       |  |
| +-------------------------------------------------------------+  |
|                                                                   |
| Acoes Priorizadas:                                                |
| 1. Renegociar Tech Solutions (R$ 42k/ano) [Alta]                  |
| 2. Ajustar preco PROD-002 (+9,6%) [Media]                         |
| 3. Substituir Office Express (R$ 8k/ano) [Media]                  |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Roadmap de Implementacao (4 Meses)

### Mes 1: Fundacao e OMC-AI Basico

**Semana 1-2: Banco de Dados**
- Criar tabelas `suppliers`, `supplier_analysis`, `price_simulations`, `margin_dashboard`
- Configurar RLS policies
- Criar indices para performance

**Semana 3-4: OMC-AI Core**
- Edge Function `analyze-suppliers` (consolidador)
- Edge Function `calculate-supplier-cost` (motor de calculo)
- UI basica: `SupplierTable`, `SupplierAnalysisCard`
- Integrar com dados existentes de `identified_credits`

### Mes 2: PriceGuard Basico

**Semana 1-2: Motor de Calculo**
- Edge Function `calculate-price-guard`
- Integracao com API RTC existente
- Integracao com DRE para puxar margens

**Semana 3-4: UI PriceGuard**
- `PriceGuardForm` (entrada manual)
- `PriceGuardResults` (resultados)
- `PriceSimulationTable` (lista de SKUs)
- Importacao de NCMs do catalogo existente

### Mes 3: Integracao e Dashboard

**Semana 1-2: Hub da Suite**
- Pagina principal `MargemAtiva.tsx` com 3 abas
- `MargemAtivaHeader` com KPIs consolidados
- Edge Function `sync-margin-dashboard`

**Semana 3-4: Features Avancadas**
- `SensitivityChart` (analise de cenarios)
- `IndifferentPriceModal` (calculadora de indiferenca)
- `CompetitiveGapAlert` (alertas de gap)
- Conexao entre OMC-AI e PriceGuard (CTA cruzada)

### Mes 4: Polish e Lancamento

**Semana 1-2: Relatorios e Exportacao**
- `MarginPdfReport` (PDF executivo consolidado)
- Exportacao de tabela de precos 2026
- Script de renegociacao para fornecedores

**Semana 3-4: Testes e Lancamento**
- Testes alpha com 5 clientes
- Refinamento de UX
- Integracao com Painel Executivo existente
- Documentacao e onboarding

---

## Integracao com Navegacao

### Adicionar no Sidebar

```typescript
// Em navGroups, adicionar novo grupo "Margem Ativa"
{
  title: 'Margem Ativa',
  items: [
    { 
      label: 'Suite Margem Ativa', 
      href: '/dashboard/margem-ativa', 
      icon: TrendingUp, 
      requiredPlan: 'ENTERPRISE', 
      badge: 'Novo' 
    },
  ]
}
```

### Adicionar Rota no App.tsx

```typescript
import MargemAtiva from "./pages/dashboard/MargemAtiva";

// Dentro de Routes
<Route 
  path="/dashboard/margem-ativa" 
  element={
    <ProtectedRoute>
      <MargemAtiva />
    </ProtectedRoute>
  } 
/>
```

---

## Monetizacao

| Modelo | Preco | Justificativa |
|--------|-------|---------------|
| Add-on Premium | R$ 3.800/mes | Empresas que ja usam outras ferramentas |
| Pacote Full | R$ 5.500/mes | Suite completa + Painel Executivo |

**ROI para o Cliente:**
- Empresa com R$ 1M/mes em compras -> 1% de otimizacao = R$ 10.000/mes
- Erro de 2% em repasse de precos em empresa de R$ 10M/ano = R$ 200k de prejuizo
- O software se paga em menos de 1 mes

**Perfil de Cliente Ideal:**
- Faturamento: R$ 50M - R$ 200M/ano
- Regime: Lucro Real ou Presumido
- Setor: Varejo, Industria leve, Servicos
- Dor: Margens apertadas (3-10%) + Alto volume de fornecedores

---

## Pontos de Atencao Tecnicos

1. **Performance:** Agregacao de `identified_credits` pode ser pesada. Considerar materialized views ou cache.

2. **Classificacao de Regime:** A heuristica de CST/CSOSN tem ~80% de acuracia. Permitir correcao manual pelo usuario.

3. **Volatilidade de Aliquotas:** Aliquotas de IBS/CBS podem mudar ate 2026. Usar campos parametrizaveis com defaults.

4. **Integracao DRE:** Garantir que o DRE mais recente seja usado para calculos de margem.

5. **API RTC:** Rate limiting da API oficial. Implementar cache de aliquotas por NCM.

---

## Proximos Passos Apos Aprovacao

1. Criar migracao SQL para as 4 novas tabelas
2. Desenvolver Edge Function `analyze-suppliers`
3. Implementar UI basica do OMC-AI
4. Testar com dados reais de `identified_credits`
5. Iterar com feedback de usuarios beta
