
# Estimativa de Valuation com Impacto do Compliance

## Visão Geral

A TribuTech será a **primeira plataforma tributária do Brasil** a conectar compliance fiscal diretamente ao valuation da empresa. Esta funcionalidade exclusiva do plano Professional mostra ao CEO/CFO quanto vale sua empresa hoje e quanto mais valeria com um score tributário melhor.

## Modelo de Cálculo

### Fórmula Híbrida
```text
┌─────────────────────────────────────────────────────────────────┐
│  VALUATION = (EBITDA × Múltiplo Setor) + Ajuste Compliance      │
│                                                                   │
│  Múltiplo Setor: Buscado da tabela sector_benchmarks por CNAE   │
│  Ajuste Compliance: Baseado no Tax Score (0-1000 pontos)        │
└─────────────────────────────────────────────────────────────────┘
```

### Ajuste de Compliance por Score
| Score (0-1000) | Grade | Ajuste Múltiplo | Impacto M&A |
|----------------|-------|-----------------|-------------|
| 900-1000       | A+/A  | +15%            | Premium - Due Diligence limpa |
| 750-899        | B     | +5%             | Confiável - Risco baixo |
| 600-749        | C     | 0% (base)       | Neutro |
| 400-599        | D     | -15%            | Desconto - Passivos ocultos |
| 0-399          | E     | -30%            | Severo - Alto risco |

### Múltiplos por Setor (já temos na tabela sector_benchmarks)
- Tecnologia (6201-5): ~7.0x EBITDA
- Serviços Profissionais (6911-7): ~4.8x EBITDA
- Saúde (8630-5): ~5.5x EBITDA
- Varejo (4751-2, 4711-3): ~3.5-4.5x EBITDA

## Implementacao

### 1. Novo Card: ExecutiveValuationCard.tsx
Criar componente que exibe:
- **Valuation Atual** (faixa min-max)
- **Múltiplo do Setor** usado como base
- **Ajuste de Compliance** aplicado (positivo ou negativo)
- **Potencial de Valorização**: Quanto a empresa valeria se melhorasse o score
- **CTA**: "Melhorar Score = Aumentar Valuation"

### 2. Atualizar useExecutiveData.ts
Adicionar nova interface e lógica:
```text
ValuationData {
  valuationMin: number
  valuationMax: number
  multiploBase: number
  ajusteCompliance: number
  ajustePercentual: number
  potencialMelhoria: number // valor adicional se score subir para A
  hasData: boolean
  sectorName: string
}
```

Lógica:
1. Buscar EBITDA da tabela company_dre
2. Buscar setor do company_profile ou profiles.cnae
3. Buscar múltiplo da sector_benchmarks
4. Calcular ajuste baseado no tax_score.score_total
5. Retornar faixa de valuation (±20% para incerteza)

### 3. Integrar no Painel Executivo
Adicionar o card após o bloco de Impacto da Reforma:
```text
┌────────────────────────────────────────────────┐
│  Termômetro Tributário                         │
├────────────────────────────────────────────────┤
│  Projetos Prioritários                         │
├─────────────────────┬──────────────────────────┤
│  Impacto Reforma    │  Riscos de Autuação      │
├─────────────────────┴──────────────────────────┤
│  ★ ESTIMATIVA DE VALUATION (NOVO)              │
├────────────────────────────────────────────────┤
│  NCM/CFOP Analysis                             │
└────────────────────────────────────────────────┘
```

### 4. Atualizar Landing Page

#### 4.1 Nova Feature na FeaturesSection
Adicionar card destacado:
```typescript
{
  icon: TrendingUp,
  title: "Impacto no Valuation",
  description: "Veja como seu compliance tributário afeta o valor da sua empresa em cenários de M&A.",
  badge: "EXCLUSIVO",
  badgeVariant: "default"
}
```

#### 4.2 Destaque no PricingSection
Adicionar nova feature no plano Professional:
```typescript
{ text: "Estimativa de Valuation com impacto do compliance", included: true }
```

#### 4.3 Nova Seção "Compliance = Valuation" (antes do Pricing)
Criar seção impactante mostrando:
- Estatística: "Empresas com score A+ valem até 15% mais em M&A"
- Visual: Gráfico/barra comparando valuation por grade
- CTA: "Descubra quanto vale sua empresa"

## Layout do Card de Valuation

```text
┌─────────────────────────────────────────────────────────────────┐
│  💰 ESTIMATIVA DE VALUATION DA EMPRESA                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────┐  ┌─────────────────────────┐│
│  │  Valuation Atual                │  │  Múltiplo Aplicado      ││
│  │  R$ 8.5M — R$ 12.8M             │  │  5.2x EBITDA            ││
│  │  Setor: Tecnologia              │  │  (+15% compliance A)    ││
│  └─────────────────────────────────┘  └─────────────────────────┘│
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  📈 Potencial de Valorização                                 ││
│  │  Se seu score subir de B (780) para A (900):                 ││
│  │  Valuation adicional: +R$ 1.2M a +R$ 1.8M                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ⚠️ Estimativa baseada em múltiplos de mercado e compliance.    │
│     Não substitui avaliação profissional para M&A.              │
│                                                                   │
│  [Melhorar meu Score →]  [Baixar relatório PDF]                  │
└─────────────────────────────────────────────────────────────────┘
```

## Arquivos a Criar/Modificar

### Criar
1. `src/components/executive/ExecutiveValuationCard.tsx` - Novo card de valuation
2. `src/components/landing/ValuationImpactSection.tsx` - Nova seção na LP

### Modificar
1. `src/hooks/useExecutiveData.ts` - Adicionar ValuationData e lógica de cálculo
2. `src/pages/PainelExecutivo.tsx` - Incluir o novo card
3. `src/components/executive/index.ts` - Exportar novo componente
4. `src/components/landing/PricingSection.tsx` - Adicionar feature ao Professional
5. `src/components/landing/FeaturesSection.tsx` - Adicionar card de Valuation
6. `src/pages/Index.tsx` - Incluir ValuationImpactSection

## Consideracoes de Negocio

### Disclaimer Obrigatório
Exibir em todos os contextos:
> "Estimativa indicativa baseada em múltiplos de mercado. Não constitui avaliação formal. Para transações de M&A, consulte especialistas certificados."

### Dados Necessários para Calcular
- EBITDA (via company_dre)
- Setor/CNAE (via company_profile ou profiles)
- Tax Score (via tax_score)

Se algum dado faltar, mostrar CTA para preencher.

### Proposta de Valor
Esta feature transforma o Score Tributário de "apenas um número" para "impacto real no valor da empresa", criando urgência para melhorar compliance e justificando o investimento no plano Professional.
