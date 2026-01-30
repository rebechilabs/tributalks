

# Implementar Clara AI v4 com Otimizações

## Resumo Executivo
Refatorar a Edge Function `clara-assistant` para usar o Prompt Mestre v4 em texto corrido, com personalização por nome do usuário, detecção de queries simples para reduzir tokens, e disclaimer automático no pós-processamento.

---

## Alterações no Arquivo

**Arquivo:** `supabase/functions/clara-assistant/index.ts`

### 1. Atualizar Query do Banco (linha ~798)

```typescript
// ANTES
.select("plano")

// DEPOIS  
.select("plano, nome")
```

### 2. Adicionar Função de Detecção de Query Simples (após linha 336)

```typescript
function isSimpleQuery(message: string): boolean {
  const simplePatterns = [
    /^(oi|olá|opa|e aí|eai|fala|hey)/i,
    /^obrigad[oa]/i,
    /^(sim|não|ok|certo|beleza|blz|vlw|valeu)/i,
    /^como (você|vc) (está|tá)/i,
    /^(tchau|até mais|flw|bye)/i,
    /^\?+$/,
  ];
  return message.length < 50 && simplePatterns.some(p => p.test(message.trim()));
}
```

### 3. Criar Constante CLARA_CORE_SLIM (após CONVERSATION_STARTERS)

```typescript
const CLARA_CORE_SLIM = `
Você é Clara, copiloto de decisão tributária da TribuTalks.

LIMITE ABSOLUTO: Você não emite parecer jurídico. Você não diz "você deve" ou "é legal/ilegal". Você não substitui advogado.

COMUNICAÇÃO: Frases curtas. Máximo 12 palavras por frase. Máximo 3 frases por parágrafo. Ponto final é seu melhor amigo.

NOME: Use o nome do usuário naturalmente. Sem nome: "Oi!" ou "Olá!".

TOM: Caloroso, direto, leve, humano. Um emoji por resposta: ⚠️ alertas, 💡 insights, ✅ confirmações, 🎯 recomendações.

OBJETIVO: Usuário sai mais lúcido e orientado. Se ele sabe o próximo passo, você venceu.
`;
```

### 4. Criar Constante CLARA_CORE_FULL (substituir basePrompt)

Substituir todo o conteúdo dentro de `buildSystemPrompt` pelo prompt v4 em texto corrido fornecido pelo usuário, com as seguintes adaptações:

- Injetar `${userName}` dinamicamente
- Manter Tool Contexts dinâmicos
- Manter PLAN_RESPONSES por plano

### 5. Atualizar Função buildSystemPrompt (linha 544)

```typescript
const buildSystemPrompt = (
  toolContext: ToolContext | null, 
  userPlan: string,
  userName: string | null = null,
  isSimple: boolean = false
): string => {
  const nameContext = userName 
    ? `O nome do usuário é ${userName}. Use-o naturalmente na primeira resposta.`
    : `Você não sabe o nome do usuário.`;

  // Query simples = prompt slim
  if (isSimple) {
    return `${CLARA_CORE_SLIM}\n\n${nameContext}\n\nPlano: ${userPlan}`;
  }

  // Query complexa = prompt completo v4
  const fullPrompt = CLARA_CORE_FULL; // texto corrido v4
  
  let prompt = `${fullPrompt}\n\n${nameContext}`;
  
  if (toolContext) {
    prompt += `\n\nFERRAMENTA ATUAL: ${toolContext.toolName}\n${toolContext.toolDescription}`;
  }
  
  return prompt;
};
```

### 6. Atualizar Handler Principal (linha ~826)

```typescript
const userName = profile?.nome || null;
const lastMessage = messages?.[messages.length - 1]?.content || "";
const isSimple = isSimpleQuery(lastMessage);

const systemPrompt = buildSystemPrompt(toolContext, userPlan, userName, isSimple);
```

### 7. Adicionar Pós-Processamento de Disclaimer (após linha 884)

```typescript
function appendDisclaimer(response: string, userPlan: string): string {
  // Só adiciona se resposta > 100 chars E menciona termos tributários
  const needsDisclaimer = response.length > 100 && 
    /estratégia|implementar|economia|regime|crédito|planejamento|simulação|impacto|tribut/i.test(response);
  
  if (!needsDisclaimer) return response;
  
  if (userPlan === 'ENTERPRISE') {
    return response + '\n\n✨ No Enterprise, suas consultorias com advogados tributaristas são incluídas e ilimitadas.';
  }
  
  return response + '\n\n⚠️ Antes de implementar, converse com seu contador ou advogado tributarista.';
}

// Usar:
const assistantMessage = appendDisclaimer(
  data.content?.[0]?.text || "Olá! Sou a Clara, como posso ajudar?",
  userPlan
);
```

---

## Prompt v4 Completo (CLARA_CORE_FULL)

O prompt em texto corrido fornecido pelo usuário será integrado como uma única constante string, com interpolações para:
- `${userName}` - nome do usuário
- `${userPlan}` - plano atual
- Tool context dinâmico quando aplicável

---

## Estimativa de Tokens

| Cenário | v3 Atual | v4 Otimizado |
|---------|----------|--------------|
| Query simples ("Oi!") | ~6.200 tokens | ~400 tokens |
| Query com ferramenta | ~6.500 tokens | ~5.000 tokens |
| Query complexa | ~6.500 tokens | ~5.500 tokens |

**Economia média:** 30-95% dependendo do tipo de interação.

---

## Resumo das Mudanças

| Componente | Ação |
|------------|------|
| Query banco | Adicionar `nome` |
| Prompt base | Substituir v3 por v4 texto corrido |
| Versão slim | Criar para queries simples |
| Detecção query | Adicionar `isSimpleQuery()` |
| Disclaimer | Mover para pós-processamento |
| buildSystemPrompt | Aceitar userName e isSimple |

---

## Testes Necessários

1. Abrir chat da Clara, verificar saudação com nome
2. Enviar "Oi" - verificar resposta curta e rápida
3. Perguntar sobre Reforma - verificar disclaimer automático
4. Testar em cada plano (FREE, NAVIGATOR, PROFESSIONAL, ENTERPRISE)

