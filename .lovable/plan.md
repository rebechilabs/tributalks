
# Evolucao: Clara AI Multi-Agente Inteligente

## Situacao Atual

A Clara ja possui uma arquitetura sofisticada com:
- Edge Function `clara-assistant` (2699 linhas) com orquestracao, RAG, cache, agentes (fiscal/margin/compliance), knowledge graph
- Roteamento por keywords no backend (`analyzeMessageForAgent`)
- Contexto completo do usuario (DRE, Score, creditos, oportunidades, integracoes)
- Frontend: `FloatingAssistant.tsx` como popup/card lateral com chat basico
- Hooks: `useClaraAgents`, `useClaraAgentIntegration`, `useSemanticSearch`, `useKnowledgeGraph`
- Modelos: Claude Sonnet 4 (complexo) + Gemini Flash (simples)

## O Que Muda

A evolucao foca em 3 pilares: (1) expandir agentes de 3 para 5, (2) transformar o chat de popup em painel lateral, (3) adicionar sugestoes contextuais e badge de agente.

---

## Fase 1: Expandir Agentes no Backend

### 1.1 Novos agentes no roteamento (`clara-assistant/index.ts`)

Atualizar `analyzeMessageForAgent()` para 5 agentes em vez de 3:

| Agente | Antigo | Novo |
|---|---|---|
| ENTENDER | `fiscal` (parcial) | `entender` - DRE, Score, Comparativo |
| PRECIFICAR | `margin` (parcial) | `precificar` - Preco, margem tributaria |
| RECUPERAR | `fiscal` (parcial) | `recuperar` - Creditos, XMLs, Radar |
| PLANEJAR | -- | `planejar` - Oportunidades, cenarios |
| COMANDAR | -- | `comandar` - Resumos, relatorios, KPIs |

A logica de roteamento sera por regex patterns expandidos:

- `entender`: dre, score, margem bruta, regime, comparativo, diagnostico, faturamento
- `precificar`: preco, cobrar, markup, margem ativa, aliquota no preco, split payment
- `recuperar`: credito, xml, radar, pis/cofins, recuperar, prescrever, compensacao
- `planejar`: oportunidade, cisao, filial, planejamento, economia, 2027, reforma impacto
- `comandar`: resumo, relatorio, pdf, alerta, kpi, executivo, contador

### 1.2 System prompts especializados por agente

Adicionar ao `formatAgentContextForPrompt()` instrucoes especificas:

- **Entender**: "Voce e especialista em diagnostico financeiro e tributario. Analise DRE, Score e regimes com dados reais."
- **Precificar**: "Voce e especialista em formacao de preco com carga tributaria. Simule impacto de impostos no preco."
- **Recuperar**: "Voce e especialista em recuperacao de creditos tributarios. Priorize por valor e urgencia de prescricao."
- **Planejar**: "Voce e especialista em planejamento tributario estrategico. Projete cenarios e calcule economia."
- **Comandar**: "Voce e especialista em visao executiva. Gere resumos cruzando dados de todos os modulos."

### 1.3 Temperature diferenciada por agente

No momento de chamar a API Claude/Gemini, ajustar temperature:

- `entender`: 0.3 (preciso)
- `precificar`: 0.3 (preciso)
- `recuperar`: 0.2 (factual)
- `planejar`: 0.5 (criativo para cenarios)
- `comandar`: 0.2 (relatorios factuais)

---

## Fase 2: Interface - Painel Lateral em vez de Popup

### 2.1 Novo componente `ClaraSidePanel.tsx`

Substituir o popup card do `FloatingAssistant.tsx` por um painel lateral deslizante:

- Ocupa ~380px de largura a direita (responsivo: 100% em mobile)
- Usa `framer-motion` (ja instalado) para animacao de slide-in/slide-out
- Dashboard continua visivel ao lado
- Botao flutuante permanece no canto inferior direito

### 2.2 Sugestoes contextuais no topo do chat

Baseado na rota atual (`ROUTE_TO_TOOL`), mostrar 2-3 chips de sugestao:

| Pagina | Sugestoes |
|---|---|
| DRE | "Como esta minha margem?" / "O que posso melhorar?" |
| Score | "Como melhorar meu score?" / "O que significa cada dimensao?" |
| Radar | "Encontrou creditos?" / "Tem algo prestes a prescrever?" |
| Oportunidades | "Quais oportunidades tenho?" / "Quanto posso economizar?" |
| Home | "Me da um resumo" / "Por onde comecar?" |

### 2.3 Badge de agente nas respostas

Quando a resposta vem de um agente especifico, mostrar um badge discreto acima da mensagem:

```
[Entender] ou [Precificar] ou [Recuperar] etc.
```

Cores: todas em amber/dourado para consistencia com os module tags da Home.

### 2.4 Botoes de acao inline nas respostas

Detectar padroes na resposta da Clara e renderizar botoes clicaveis:

- `[Ver no Comparativo]` -> navega para `/dashboard/entender/comparativo`
- `[Gerar Relatorio PDF]` -> dispara comando `/resumo`
- `[Ver Radar de Creditos]` -> navega para `/dashboard/recuperar/radar`
- `[Simular cenario]` -> navega para calculadora relevante

Pattern matching no markdown da resposta para converter links especiais em botoes.

---

## Fase 3: Atualizacoes de Escopo por Plano

### 3.1 CLARA_TOOL_SCOPE - Novos agentes por plano

Atualizar `PLAN_TOOL_SCOPE` no backend e `useFeatureAccess.ts` no frontend:

| Agente | STARTER | NAVIGATOR | PROFESSIONAL | ENTERPRISE |
|---|---|---|---|---|
| Entender | Basico (Score+Comparativo) | Completo | Completo | Completo |
| Precificar | -- | Basico | Completo | Completo |
| Recuperar | -- | -- | Completo | Completo |
| Planejar | -- | Parcial | Completo | Completo |
| Comandar | -- | -- | Parcial | Completo |

### 3.2 Respostas fora de escopo educativas

Quando usuario pergunta algo de um agente fora do plano, Clara responde educadamente explicando o que faz e indicando upgrade.

---

## Fase 4: Proatividade (preparacao)

### 4.1 Sugestoes proativas no painel

Quando o chat abre, alem da saudacao, Clara pode incluir 1 alerta proativo baseado no contexto:

- Score caiu > 10 pontos: "Seu Score caiu X pontos. Quer entender o motivo?"
- Creditos proximos de prescrever: "Identifiquei X creditos que vencem em Y meses."
- DRE com margem critica: "Sua margem esta em X%. Posso sugerir ajustes?"

Isso ja e possivel com os dados de `buildUserContext()` - basta adicionar logica no greeting.

---

## Secao Tecnica

### Arquivos a criar
- `src/components/common/ClaraSidePanel.tsx` - Novo painel lateral (substitui popup do FloatingAssistant)
- `src/components/common/ClaraAgentTag.tsx` - Badge de agente com emoji e nome
- `src/components/common/ClaraContextualSuggestions.tsx` - Chips de sugestao por pagina
- `src/components/common/ClaraActionButton.tsx` - Botoes de acao inline nas respostas

### Arquivos a editar
- `supabase/functions/clara-assistant/index.ts` - Expandir agentes, system prompts, temperature
- `src/components/common/FloatingAssistant.tsx` - Refatorar para usar ClaraSidePanel
- `src/hooks/clara/useClaraAgents.ts` - Atualizar tipos de agentes (5 em vez de 3)
- `src/hooks/clara/useClaraAgentIntegration.ts` - Atualizar patterns de roteamento

### Modelo de IA
- Manter Claude Sonnet 4 para queries complexas (ja configurado)
- Manter Gemini Flash para queries simples (ja configurado)
- Temperature variavel por agente (novo)
- NAO criar Edge Functions separadas por agente (desnecessario - o roteamento e via prompt)

### O que NAO muda
- Botoes da landing page
- Configuracoes do Stripe
- Logica de trial de 7 dias
- Limites diarios por plano (CLARA_DAILY_LIMITS)
- RAG semantico e Knowledge Graph (ja funcionam)
- Cache de respostas (ja funciona)
- Rate limiting (ja funciona)

### Ordem de implementacao
1. Backend: expandir agentes e prompts na Edge Function
2. Frontend: criar ClaraSidePanel e componentes auxiliares
3. Frontend: integrar sugestoes contextuais e badges
4. Frontend: adicionar botoes de acao inline
5. Testes e ajustes
