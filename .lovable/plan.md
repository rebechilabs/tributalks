

# Plano: Corrigir Resposta da Clara AI que não aparece

## Diagnóstico

A Clara AI não está exibindo respostas porque existe uma **incompatibilidade de formato**:

| Componente | Formato Esperado | Formato Recebido |
|------------|------------------|------------------|
| `TribuBot.tsx` | Streaming SSE (`data: {...}\n`) | JSON simples (`{"message": "..."}`) |

### O que acontece:
1. Usuário pergunta "Posso mudar de regime no meio do ano?"
2. Edge function processa e retorna: `{"message": "resposta aqui..."}`
3. `TribuBot.tsx` tenta ler como stream SSE com `reader.read()`
4. Procura por linhas começando com `data: `
5. Não encontra → resposta vazia/ignorada

## Solução

Modificar `TribuBot.tsx` para detectar e processar **ambos os formatos**:
- Se resposta é JSON → mostra direto
- Se resposta é SSE stream → processa como streaming

## Alterações

**Arquivo:** `src/pages/TribuBot.tsx`

### Mudança na função `handleSend`

```typescript
// Após verificar resp.ok (linha 121)
const contentType = resp.headers.get("content-type");

// Se for JSON (resposta não-streaming)
if (contentType?.includes("application/json")) {
  const data = await resp.json();
  if (data.message) {
    setMessages(prev => [...prev, { 
      role: "assistant", 
      content: data.message 
    }]);
  }
  setDailyCount(prev => prev + 1);
  return;
}

// Se for streaming, continua com lógica atual...
```

## Benefício

- Clara responderá corretamente a todas as perguntas
- Mantém compatibilidade com streaming (futuro)
- Não requer mudanças na edge function

## Impacto

- **Arquivos alterados:** 1 (`TribuBot.tsx`)
- **Risco:** Baixo (apenas adiciona tratamento alternativo)

