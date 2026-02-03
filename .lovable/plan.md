

# Atualização do Card "Preciso Entender" na Seção Jornadas

## Objetivo
Substituir a lista de features técnicas por um texto descritivo focado em benefícios no card do plano Starter.

## Mudança

**De (lista de features):**
- Clara AI (Assistente) - 30 msgs/dia
- Score da sua saúde fiscal
- Calculadoras oficiais (CBS/IBS/IS)
- Simulador Split Payment
- Timeline 2026-2033 detalhada

**Para (texto descritivo):**
> "O ponto de partida ideal para quem quer se preparar para a Reforma Tributária. Faça um diagnóstico completo da saúde fiscal da sua empresa com o Score Tributário, simule diferentes cenários com as calculadoras de Split Payment e comparativo de regimes, e acompanhe todos os prazos importantes na Timeline 2026-2033. Conte ainda com a Clara AI para tirar dúvidas do dia a dia e a newsletter Tributalks News para se manter atualizado."

---

## Detalhes Técnicos

**Arquivo:** `src/components/landing/JourneysSection.tsx`

1. **Adicionar novo campo `benefitText`** ao objeto do plano Starter (linhas 6-24)
2. **Remover array `features`** do Starter (ou manter vazio)
3. **Ajustar renderização do card** para exibir o texto descritivo ao invés da lista quando `benefitText` existir
4. **Manter badge "7 DIAS GRÁTIS"** no card (adicionar campo `trialDays: 7`)
5. **Atualizar CTA** para "Testar 7 dias grátis"

---

## Resultado Visual Esperado

O card "Preciso Entender" terá:
- Ícone + título + citação (mantidos)
- Parágrafo descritivo com os benefícios
- Badge "7 DIAS GRÁTIS" verde
- Preço R$ 397/mês
- Botão "Testar 7 dias grátis"

