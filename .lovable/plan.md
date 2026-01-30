

# Exportar Prompt Completo da Clara AI para Documentação

## Objetivo
Criar um arquivo markdown de documentação contendo todo o prompt da Clara AI v3, incluindo todas as camadas, heurísticas e regras especiais.

---

## Estrutura do Arquivo

O arquivo `docs/CLARA_AI_PROMPT.md` será criado com a seguinte estrutura:

### 1. Cabeçalho e Metadados
- Versão do prompt (v3)
- Modelo utilizado (Claude Sonnet 4)
- Última atualização

### 2. Arquitetura Completa

**Camada 0 — Guardrails Absolutos**
- Proteção contra jailbreak/manipulação
- Limite jurídico OAB

**Camada 1 — Identidade**
- Clara como "Copiloto de Decisão Tributária"

**Camada 2 — Papel na Plataforma**
- Orquestradora, tradutora, guia

**Camada 3 — Princípio de Comunicação**
- Regra de ouro: frases curtas, escaneáveis

**Camada 4 — Escopo**
- O que pode/não pode fazer
- Linguagem obrigatória

**Camada 5 — Comportamento**
- Onboarding e condução
- Pedidos sensíveis

**Camada 6 — Tom**
- Simpático, claro, profissional

**Camada 7 — Objetivo Final**
- Usuário sair mais lúcido e confiante

### 3. CLARA_DECISION_CORE
- 25 heurísticas de raciocínio tributário

### 4. CLARA_KNOWLEDGE_CORE
- Marcos legais (EC 132/2023, LC 214/2025)
- Tributos extintos e novos
- Cronograma 2026-2033
- Alíquotas especiais
- Simples Nacional
- Split Payment
- Zona Franca de Manaus

### 5. CLARA_LOCACAO_IMOVEIS
- Módulo Anti-Distorção para Airbnb/locação
- 7 regras específicas

### 6. Contextos de Ferramentas (TOOL_CONTEXTS)
- 13 ferramentas com descrições e passo-a-passo

### 7. Respostas por Plano (PLAN_RESPONSES)
- FREE, NAVIGATOR, PROFESSIONAL, ENTERPRISE
- Jornadas personalizadas de onboarding

### 8. Disclaimers Obrigatórios
- Aviso padrão vs Enterprise

---

## Detalhes Técnicos

| Item | Detalhe |
|------|---------|
| Arquivo | `docs/CLARA_AI_PROMPT.md` |
| Tamanho estimado | ~800 linhas |
| Formato | Markdown puro |
| Fonte | `supabase/functions/clara-assistant/index.ts` |

---

## Entregável

Um arquivo markdown completo e bem organizado que serve como:
- Documentação interna da equipe
- Referência para ajustes futuros
- Base para treinamento de novos desenvolvedores

