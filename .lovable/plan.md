
# Plano: Atualizar LP com Oportunidades e Integrações Nativas

## Resumo Executivo

Atualizar a Landing Page para refletir o número real de oportunidades tributárias (61+) e criar uma nova seção destacando as integrações nativas com ERPs brasileiros.

---

## 1. Atualizar Número de Oportunidades (37 → 61+)

### Arquivos a Modificar

**`src/components/landing/FeaturesSection.tsx`** (linha 80)
```typescript
// DE:
description: "37+ benefícios fiscais por setor com match inteligente ao seu perfil de empresa."

// PARA:
description: "61+ benefícios fiscais por setor com match inteligente ao seu perfil de empresa."
```

**`src/components/landing/PricingSection.tsx`** (linha 88)
```typescript
// DE:
{ text: "37+ Oportunidades Fiscais", included: true }

// PARA:
{ text: "61+ Oportunidades Fiscais", included: true }
```

---

## 2. Nova Seção: Integrações Nativas

### Criar Componente `IntegrationsSection.tsx`

**Localização:** `src/components/landing/IntegrationsSection.tsx`

**Design:**
- Título: "Conecte seu ERP em minutos"
- Subtítulo: "Sincronização automática com os principais sistemas do Brasil"
- Grid com logos/cards dos ERPs suportados
- Destaque para os dados que são sincronizados

**ERPs a Exibir:**
| ERP | Status | Ícone |
|-----|--------|-------|
| Omie | Disponível | Logo oficial ou ícone genérico |
| Bling | Disponível | Logo oficial ou ícone genérico |
| Conta Azul | Em breve | Badge "Em breve" |
| Tiny/Olist | Em breve | Badge "Em breve" |
| Sankhya | Em breve | Badge "Em breve" |
| TOTVS | Em breve | Badge "Em breve" |

**Dados Sincronizados (bullets):**
- Notas Fiscais (NF-e, NFS-e, NFC-e)
- Produtos com NCM
- Contas a Pagar e Receber
- DRE e Financeiro
- Perfil da Empresa

### Estrutura do Componente

```typescript
// Layout proposto
<section className="py-24 bg-secondary">
  <Badge>Integrações Nativas</Badge>
  <h2>Conecte seu ERP em minutos</h2>
  <p>Sincronização automática com os principais sistemas do Brasil</p>
  
  <div className="grid md:grid-cols-3 lg:grid-cols-6">
    {/* Cards dos ERPs */}
  </div>
  
  <div className="mt-12">
    <h3>Dados sincronizados automaticamente:</h3>
    {/* Lista de dados */}
  </div>
</section>
```

---

## 3. Atualizar Estrutura da LP

### Modificar `src/pages/Index.tsx`

**Nova ordem das seções:**
1. Header
2. HeroSection
3. RTCCalculatorSection
4. FeaturesSection
5. **IntegrationsSection** ← NOVA
6. HowItWorksSection
7. TestimonialsSection
8. PricingSection
9. ComingSoonSection (atualizar para remover "Integração Contábil")
10. CredibilitySection
11. FAQSection
12. CTASection
13. Footer

---

## 4. Atualizar ComingSoonSection

### Remover "Integração Contábil" (já não é "coming soon")

**`src/components/landing/ComingSoonSection.tsx`**

```typescript
// Manter apenas:
const upcomingFeatures = [
  { icon: LineChart, label: "Dashboard Analytics", description: "KPIs e gráficos avançados" },
  { icon: Globe, label: "Multi-empresa", description: "Gerencie várias empresas" },
  { icon: Smartphone, label: "App Mobile", description: "iOS e Android nativo" },
];
```

---

## 5. Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/landing/IntegrationsSection.tsx` | CRIAR | Nova seção de integrações |
| `src/components/landing/FeaturesSection.tsx` | MODIFICAR | 37 → 61+ |
| `src/components/landing/PricingSection.tsx` | MODIFICAR | 37 → 61+ |
| `src/components/landing/ComingSoonSection.tsx` | MODIFICAR | Remover "Integração Contábil" |
| `src/pages/Index.tsx` | MODIFICAR | Adicionar IntegrationsSection |

---

## 6. Design da Seção de Integrações

**Visual:**
- Background: `bg-secondary` (contraste com seções adjacentes)
- Cards com efeito hover e borda `border-primary/50`
- Logos dos ERPs em grayscale, coloridos no hover
- Badge "Disponível" (verde) ou "Em breve" (amarelo/outline)

**Copy sugerido:**
```
# Conecte seu ERP em minutos

Importação automática de NF-e, produtos e financeiro.
Seus dados sempre atualizados, sem digitação manual.

[Grid de ERPs]

✓ Notas Fiscais (NF-e, NFS-e)    ✓ Produtos com NCM
✓ Contas a Pagar/Receber         ✓ DRE Automático
✓ Perfil da Empresa              ✓ Sincronização diária
```

---

## Entregáveis

1. **IntegrationsSection.tsx** - Componente completo com grid de ERPs
2. **FeaturesSection.tsx** - Número atualizado (61+)
3. **PricingSection.tsx** - Número atualizado (61+)
4. **ComingSoonSection.tsx** - Remover item duplicado
5. **Index.tsx** - Incluir nova seção

---

## Sobre Documentação dos ERPs

Sim, já tenho todas as informações técnicas necessárias para as integrações com base na pesquisa que você enviou:

- **Omie**: App Key + App Secret, endpoints para NF-e, DRE, NCM, Financeiro
- **Bling**: OAuth 2.0, API v3 moderna com Swagger
- **Conta Azul**: OAuth 2.0, REST/JSON
- **Tiny/Olist**: Token API, suporte a webhooks
- **Sankhya**: API Gateway com AppKey + Token
- **TOTVS**: Varia por produto (Protheus, RM, Datasul)

A infraestrutura de banco (tabelas `erp_connections` e `erp_sync_logs`) e a Edge Function `erp-connection` já foram criadas na Sprint 1.
