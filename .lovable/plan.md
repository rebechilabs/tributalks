
# Atualização do Card "Preciso Decidir" (Professional)

## Objetivo
Substituir a lista de features técnicas por blocos de benefícios no card Professional, seguindo o mesmo padrão visual dos cards Starter e Navigator.

## Blocos de Benefícios (5 blocos)

1. **"Tudo do Navigator, com Clara AI ilimitada e poder total de decisão."**

2. **"Identifique créditos tributários com análise de XMLs, Radar de Créditos e 61+ oportunidades fiscais mapeadas."**

3. **"Controle sua rentabilidade com DRE Inteligente e a Suíte Margem Ativa 2026: OMC-AI, PriceGuard e Dashboard Executivo."**

4. **"Monitore tudo em tempo real no NEXUS, seu centro de comando com 8 KPIs executivos."**

5. **"Conecte seu ERP e exporte relatórios PDF profissionais prontos para apresentar."**

---

## Detalhes Técnicos

**Arquivo:** `src/components/landing/JourneysSection.tsx`

1. Substituir o array `features` (linhas 50-57) por `benefitBlocks` no objeto do plano Professional
2. Manter `badge: "MAIS POPULAR"` e `highlighted: true`
3. Manter `roi: "ROI médio: 10x nos primeiros 90 dias"`
4. Atualizar `ctaText` para "Começar Agora →" (ou manter "Plano Professional →")

**Estrutura proposta:**
```typescript
{
  id: "professional",
  icon: Gauge,
  title: "Preciso Decidir",
  description: '"Preciso tomar decisões informadas e proteger meu caixa AGORA."',
  benefitBlocks: [
    "Tudo do Navigator, com Clara AI ilimitada e poder total de decisão.",
    "Identifique créditos tributários com análise de XMLs, Radar de Créditos e 61+ oportunidades fiscais mapeadas.",
    "Controle sua rentabilidade com DRE Inteligente e a Suíte Margem Ativa 2026: OMC-AI, PriceGuard e Dashboard Executivo.",
    "Monitore tudo em tempo real no NEXUS, seu centro de comando com 8 KPIs executivos.",
    "Conecte seu ERP e exporte relatórios PDF profissionais prontos para apresentar."
  ],
  price: 2997,
  priceText: "/mês",
  ctaText: "Plano Professional →",
  link: CONFIG.PAYMENT_LINKS.PROFESSIONAL_MENSAL,
  highlighted: true,
  badge: "MAIS POPULAR",
  roi: "ROI médio: 10x nos primeiros 90 dias",
}
```

---

## Funcionalidades Cobertas nos Blocos

| Funcionalidade Original | Bloco |
|-------------------------|-------|
| Clara AI ilimitada | 1 |
| Tudo do Navigator + | 1 |
| Análise de Créditos (XMLs) | 2 |
| Radar de Créditos Tributários | 2 |
| 61+ Oportunidades Fiscais | 2 |
| DRE Inteligente | 3 |
| Suíte Margem Ativa 2026 | 3 |
| OMC-AI (Análise de Fornecedores) | 3 |
| PriceGuard (Simulação de Preços) | 3 |
| Dashboard Executivo de Margem | 3 |
| NEXUS (Centro de Comando) | 4 |
| Conectar ERP | 5 |
| Relatórios PDF Profissionais | 5 |

---

## Resultado Visual

O card "Preciso Decidir" terá:
- Ícone + título + citação (mantidos)
- Badge "MAIS POPULAR" azul (mantido)
- 5 blocos de benefícios com checkmarks verdes
- Preço R$ 2.997/mês
- Botão primário "Plano Professional →"
- Nota de ROI abaixo do botão (mantida)
