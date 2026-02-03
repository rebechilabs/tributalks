
# Plano: Humanizar a Clara AI com Memória Conversacional

## Resumo

Transformar a experiência da Clara para ser mais humana - ela vai reconhecer o usuário pelo nome, lembrar de conversas passadas, e ter um fluxo conversacional mais natural.

---

## Diagnóstico do Problema

Atualmente a Clara tem toda a infraestrutura de memória (tabelas `clara_memory`, `clara_conversations`), mas:

1. **Mensagem de boas-vindas hardcoded**: A primeira mensagem é estática no código
2. **Conversas não são salvas**: O histórico some ao sair da página
3. **Memória não é recuperada**: Quando o usuário volta, a Clara não lembra de nada
4. **Nome não é usado na entrada**: O usuário já está logado mas a Clara não personaliza a saudação inicial

---

## Solução Proposta

### Fase 1: Saudação Personalizada Dinâmica

**Arquivo:** `src/pages/ClaraAI.tsx`

| Antes | Depois |
|-------|--------|
| Mensagem inicial hardcoded | Saudação dinâmica baseada no perfil |
| "Olá! Sou a Clara AI..." | "Oi [Nome]! Que bom te ver de novo..." ou "Oi! Ainda não sei seu nome..." |

**Comportamento:**
- Se tem nome no perfil → usa o nome
- Se não tem nome → pergunta gentilmente
- Se tem conversas anteriores → menciona ("Lembro que você estava perguntando sobre...")

---

### Fase 2: Persistência de Conversas

**Arquivo:** `src/pages/ClaraAI.tsx`

Salvar cada mensagem na tabela `clara_conversations`:
- Ao enviar mensagem do usuário
- Ao receber resposta da Clara
- Incluir contexto da tela e session_id

---

### Fase 3: Recuperação de Contexto Anterior

**Arquivo:** `src/pages/ClaraAI.tsx`

Ao carregar a página:
1. Buscar últimas 5 conversas do usuário
2. Se há conversas recentes (< 24h) → mostrar resumo
3. Se há conversas antigas → oferecer "Continuar de onde parou?"

---

### Fase 4: Prompt Enriquecido no Backend

**Arquivo:** `supabase/functions/clara-assistant/index.ts`

Adicionar ao contexto do sistema:
- Últimas 3 perguntas do usuário (resumidas)
- Preferências aprendidas
- Tópicos de interesse recorrentes

---

## Arquivos a Modificar

1. `src/pages/ClaraAI.tsx`
   - Remover mensagem hardcoded
   - Adicionar lógica de saudação dinâmica
   - Implementar persistência de conversas
   - Carregar histórico ao iniciar

2. `supabase/functions/clara-assistant/index.ts`
   - Adicionar seção "HISTÓRICO CONVERSACIONAL" ao prompt
   - Buscar últimas conversas do usuário
   - Incluir resumo no contexto

---

## Exemplo de Experiência Final

**Primeira visita (sem nome):**
```
Clara: "Oi! 👋 Sou a Clara, sua copiloto tributária. 
       Como posso te chamar?"
```

**Visita de usuário conhecido:**
```
Clara: "Oi Roberto! Bom te ver de novo. 🎯
       Da última vez falamos sobre Split Payment. 
       Quer continuar ou tem outra dúvida?"
```

**Retorno após dias:**
```
Clara: "Oi Roberto! Faz uns dias que não conversamos.
       Vi que seu Score melhorou 15 pontos. 🎉
       Como posso ajudar hoje?"
```

---

## Detalhes Técnicos

### Estrutura da Saudação Dinâmica

```text
SE usuário.nome existe:
  SE conversas_ultimas_24h.length > 0:
    "Oi {nome}! Continuamos de onde paramos?"
  SE NÃO:
    "Oi {nome}! Como posso ajudar hoje?"
SE NÃO:
  "Oi! Ainda não sei seu nome. Como posso te chamar?"
```

### Salvamento de Conversas

```text
Ao enviar/receber mensagem:
1. Gerar session_id (se não existir)
2. Inserir na tabela clara_conversations
3. Incluir: user_id, role, content, screen_context, created_at
```

### Contexto para o LLM

```text
HISTÓRICO CONVERSACIONAL:
- Última conversa: há 2 dias
- Último tópico: "Split Payment e impacto no caixa"
- Perguntas frequentes: regime tributário, prazos reforma
- Preferência de resposta: técnica com exemplos
```

---

## Resultado Esperado

A Clara vai parecer uma pessoa real que:
- Conhece o usuário pelo nome
- Lembra das conversas anteriores
- Continua de onde parou
- Aprende preferências ao longo do tempo

Isso transforma a experiência de "chatbot genérico" para "assistente pessoal".
