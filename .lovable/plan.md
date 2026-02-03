
# Atualização do Card "Preciso Monitorar" (Navigator)

## Objetivo
Substituir a lista de features técnicas por blocos de benefícios no card Navigator, seguindo o mesmo padrão visual do Starter.

## Blocos de Benefícios

1. "Tudo do Starter, com mais poder de análise e acompanhamento contínuo."
2. "Clara AI com 100 mensagens/dia para te guiar nas decisões do dia a dia."
3. "Fique por dentro das notícias da Reforma em tempo real e meça sua prontidão com o Checklist."
4. "Analise documentos fiscais com IA e siga Workflows Guiados para organizar suas tarefas."
5. "Acesse a comunidade TribuTalks Connect e exporte relatórios em PDF."

---

## Detalhes Técnicos

**Arquivo:** `src/components/landing/JourneysSection.tsx`

1. Substituir o array `features` por `benefitBlocks` no objeto do plano Navigator (linhas 25-35)
2. Adicionar `trialBadge: "7 DIAS GRÁTIS"` (se aplicável)
3. Atualizar `ctaText` para "Testar 7 dias grátis"

**Estrutura:**
```typescript
{
  id: "navigator",
  icon: BarChart3,
  title: "Preciso Monitorar",
  description: '"Quero acompanhar mudanças e me preparar gradualmente."',
  benefitBlocks: [
    "Tudo do Starter, com mais poder de análise e acompanhamento contínuo.",
    "Clara AI com 100 mensagens/dia para te guiar nas decisões do dia a dia.",
    "Fique por dentro das notícias da Reforma em tempo real e meça sua prontidão com o Checklist.",
    "Analise documentos fiscais com IA e siga Workflows Guiados para organizar suas tarefas.",
    "Acesse a comunidade TribuTalks Connect e exporte relatórios em PDF."
  ],
  price: 1297,
  priceText: "/mês",
  ctaText: "Testar 7 dias grátis",
  trialBadge: "7 DIAS GRÁTIS",
  highlighted: false,
}
```

---

## Resultado Visual

O card "Preciso Monitorar" terá:
- Ícone + título + citação (mantidos)
- 5 blocos de benefícios com checkmarks verdes
- Badge "7 DIAS GRÁTIS" verde
- Preço R$ 1.297/mês
- Botão "Testar 7 dias grátis"
