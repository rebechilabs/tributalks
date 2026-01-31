

# Integração RTC + Destaque Suíte Margem Ativa (ATUALIZADO)

## Correção Importante: Nomenclatura Temporal

Estamos em **janeiro de 2026** (fase de testes). A nomenclatura do comparativo precisa refletir isso:

| Antes (ERRADO) | Depois (CORRETO) |
|----------------|------------------|
| "Hoje (2025)" | **"Regime Atual"** |
| "2026+ (Reforma)" | **"2027+ (CBS/IBS Pleno)"** |

### Contexto da Timeline:
- **2026**: Teste com alíquotas simbólicas (CBS 0,9% + IBS 0,1%)
- **2027**: CBS 8,8% substitui PIS/COFINS
- **2029-2033**: IBS substitui gradualmente ICMS/ISS
- **2033**: Regime pleno com CBS+IBS (~26,5%)

---

## Parte 1: Integração com RTC (Alíquotas Reais)

### Arquitetura da Integração

```text
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ PriceGuardForm  │ ──▶ │ Edge Function    │ ──▶ │ API Receita Federal │
│                 │     │ (calculate-rtc)  │     │ piloto-cbs.tributos │
│ NCM + Município │     │                  │     │ .gov.br             │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
```

### 1.1 Componente Visual: Comparativo Antes/Depois (CORRIGIDO)

```text
┌─────────────────────────────────────────────────────────────────┐
│                   SIMULAÇÃO DE IMPACTO                          │
│                                                                 │
│  ┌─────────────────────────┐  ┌───────────────────────────────┐ │
│  │ REGIME ATUAL            │  │ 2027+ (CBS/IBS Pleno)         │ │
│  │ PIS/COFINS + ICMS       │  │ Alíquotas Reais por NCM       │ │
│  ├─────────────────────────┤  ├───────────────────────────────┤ │
│  │ Preço: R$ 100,00        │  │ Preço Necessário: R$ 108,50   │ │
│  │ PIS/COFINS: 9,25%       │  │ CBS: 8,8% ← API RTC           │ │
│  │ ICMS: 18%               │  │ IBS: 17,7% ← API RTC          │ │
│  │ Carga Total: ~27%       │  │ Carga Total: 26,5%            │ │
│  │ Margem: 18%             │  │ Margem: 18% (protegida) ✓     │ │
│  └─────────────────────────┘  └───────────────────────────────┘ │
│                                                                 │
│  ⚡ Variação de Preço: +8,5% para manter margem                 │
│  📊 Créditos estimados: R$ 12.400/ano com novo regime           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 🏷️ Alíquotas da Receita Federal (NCM 8471.30.19)        │   │
│  │    Fonte: piloto-cbs.tributos.gov.br                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

### 1.2 Alterações no PriceGuardForm

**Arquivo:** `src/components/margem-ativa/priceguard/PriceGuardForm.tsx`

**Mudanças:**
1. Adicionar campo de município (usando `useMunicipios` existente)
2. Botão "Buscar Alíquota RTC" que chama a edge function
3. Exibir badge "Alíquotas Oficiais" quando dados vêm da API
4. Fallback para alíquota padrão (26,5%) se NCM não encontrado

**Novo estado a adicionar:**
```tsx
const [rtcRates, setRtcRates] = useState<{
  cbs: number;
  ibsUf: number;
  ibsMun: number;
  is: number;
  fonte: 'api_rtc' | 'manual' | 'estimativa';
} | null>(null);
```

**Lógica de busca:**
```tsx
const fetchRtcRates = async (ncm: string, municipioIbge: number) => {
  const { data, error } = await supabase.functions.invoke('calculate-rtc', {
    body: { ncm, municipio_codigo_ibge: municipioIbge }
  });
  
  if (!error && data) {
    setRtcRates({
      cbs: data.aliquotas?.cbs || 8.8,
      ibsUf: data.aliquotas?.ibs_uf || 8.85,
      ibsMun: data.aliquotas?.ibs_mun || 8.85,
      is: data.aliquotas?.is || 0,
      fonte: 'api_rtc'
    });
  }
};
```

---

### 1.3 Novo Componente: PriceComparisonCard

**Arquivo:** `src/components/margem-ativa/priceguard/PriceComparisonCard.tsx` (NOVO)

Props:
```tsx
interface PriceComparisonProps {
  precoAtual: number;
  preco2027: number;
  regimeAtual: {
    pisCofins: number;
    icms: number;
  };
  regime2027: {
    cbs: number;
    ibsUf: number;
    ibsMun: number;
    is: number;
  };
  margem: number;
  fonte: 'api_rtc' | 'manual' | 'estimativa';
  ncm?: string;
}
```

Visual:
- Duas colunas lado a lado com cores distintas
- Coluna esquerda: "Regime Atual" (cinza/neutro)
- Coluna direita: "2027+ (CBS/IBS)" (verde/destaque)
- Badge "Alíquotas da Receita Federal" quando fonte = 'api_rtc'
- Indicador de variação de preço com seta e porcentagem

---

### 1.4 Alterações no OMC-AI

**Arquivo:** `src/components/margem-ativa/omc/SupplierAnalysisCard.tsx`

**Mudança na linha 66:**
```tsx
// Antes
const aliquotaMaxima = 26.5;

// Depois - buscar alíquota específica se NCM disponível
const aliquotaMaxima = supplierNcmRate || 26.5;
```

Adicionar prop opcional para NCM do fornecedor quando disponível via XMLs importados.

---

## Parte 2: Destaque na Landing Page

### 2.1 Nova Seção: MarginProtectionSection

**Arquivo:** `src/components/landing/MarginProtectionSection.tsx` (NOVO)

Posição: após ROICalculatorSection, antes de IntegrationsSection

```text
┌──────────────────────────────────────────────────────────────────┐
│  🛡️ PROTEJA SUA MARGEM NA TRANSIÇÃO                             │
│                                                                  │
│  ┌────────────────┐  ─▶  ┌────────────────┐  ─▶  ┌────────────┐  │
│  │ Regime Atual   │      │ 2027+          │      │ Resultado  │  │
│  │ R$ 100,00      │      │ CBS/IBS 26,5%  │      │ Margem     │  │
│  │ PIS+ICMS ~27%  │      │ R$ 108,50      │      │ PROTEGIDA  │  │
│  └────────────────┘      └────────────────┘      └────────────┘  │
│                                                                  │
│  Com a Suíte Margem Ativa você:                                  │
│  ✓ Simula preços com alíquotas REAIS da Receita Federal          │
│  ✓ Identifica fornecedores que vazam margem (OMC-AI)             │
│  ✓ Calcula o preço exato para manter seu EBITDA (PriceGuard)     │
│                                                                  │
│            [Conhecer Suíte Margem Ativa]                         │
│                                                                  │
│            Badge: "EXCLUSIVO PLANO PROFESSIONAL"                 │
└──────────────────────────────────────────────────────────────────┘
```

Animação: transição visual entre os 3 cards ao fazer scroll.

---

### 2.2 Atualizar Index.tsx

**Arquivo:** `src/pages/Index.tsx`

Adicionar import e seção:
```tsx
import { MarginProtectionSection } from "@/components/landing/MarginProtectionSection";

// Ordem das seções
<ROICalculatorSection />
<MarginProtectionSection /> {/* NOVA */}
<IntegrationsSection />
```

---

### 2.3 Atualizar FeaturesSection

**Arquivo:** `src/components/landing/FeaturesSection.tsx`

Adicionar card de destaque:
```tsx
{
  icon: Shield,
  title: "Suíte Margem Ativa 2026",
  description: "Simule preços pós-reforma com alíquotas reais. Proteja sua margem antes que seja tarde.",
  badge: "NOVO",
}
```

---

## Parte 3: Destaque no Plano Professional

### 3.1 Atualizar PricingSection

**Arquivo:** `src/components/landing/PricingSection.tsx`

Destacar a Suíte como feature principal:
```tsx
// Feature principal
{ 
  text: "Suíte Margem Ativa 2026", 
  included: true,
  limitText: "(Alíquotas RTC integradas)"
},

// Sub-itens detalhados
{ text: "OMC-AI (Análise de Fornecedores)", included: true, isSubItem: true },
{ text: "PriceGuard (Simulação de Preços)", included: true, isSubItem: true },
{ text: "Dashboard Executivo de Margem", included: true, isSubItem: true },
```

---

## Parte 4: Cache de Alíquotas (Performance)

### Nova Tabela: rtc_rate_cache

```sql
CREATE TABLE rtc_rate_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ncm TEXT NOT NULL,
  municipio_ibge INTEGER NOT NULL,
  uf TEXT NOT NULL,
  aliquota_cbs NUMERIC DEFAULT 0,
  aliquota_ibs_uf NUMERIC DEFAULT 0,
  aliquota_ibs_mun NUMERIC DEFAULT 0,
  aliquota_is NUMERIC DEFAULT 0,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  UNIQUE(ncm, municipio_ibge)
);

-- RLS: Leitura pública para autenticados
ALTER TABLE rtc_rate_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read cache" ON rtc_rate_cache
  FOR SELECT USING (auth.role() = 'authenticated');
```

**Benefícios:**
- Evita chamadas repetidas à API da Receita
- Acelera simulações de múltiplos produtos
- Cache expira em 24h para manter dados atualizados

---

## Resumo de Arquivos

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `PriceGuardForm.tsx` | MODIFICAR | Campo município, busca RTC, estados para alíquotas |
| `PriceComparisonCard.tsx` | CRIAR | Visual "Regime Atual vs 2027+" |
| `SupplierAnalysisCard.tsx` | MODIFICAR | Suporte a alíquota específica por NCM |
| `MarginProtectionSection.tsx` | CRIAR | Nova seção destaque na LP |
| `Index.tsx` | MODIFICAR | Adicionar MarginProtectionSection |
| `FeaturesSection.tsx` | MODIFICAR | Card Suíte Margem Ativa |
| `PricingSection.tsx` | MODIFICAR | Destacar no Professional |
| Migration SQL | CRIAR | Tabela rtc_rate_cache |

---

## Resultado Esperado

### Para o Usuário (Dashboard):
- Informa NCM + Município → recebe alíquotas reais da Receita Federal
- Visualiza comparativo claro: **Regime Atual** vs **2027+ (CBS/IBS)**
- Badge "Alíquotas Oficiais" garante credibilidade
- Sabe exatamente: "Preciso aumentar X% para manter minha margem"

### Para Visitante (Landing Page):
- Nova seção visual demonstra valor da ferramenta
- Card de destaque em Features
- Suíte detalhada no plano Professional

### Timeline Correta no Visual:
- ✓ "Regime Atual (PIS/COFINS + ICMS)"
- ✓ "2027+ (CBS/IBS Pleno)"
- ✓ Sem referência a "2025" ou "Hoje (2025)"

