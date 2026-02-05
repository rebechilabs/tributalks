

## Plano: Adicionar Link do WhatsApp ao Mencionar Plano Enterprise

### Resumo
Configurar a Clara AI para que sempre que mencionar o plano Enterprise em suas conversas, ela escreva:
**"Para consultorias personalizadas assine o plano [Enterprise](link-whatsapp)."**

A palavra "Enterprise" será um link para o WhatsApp oficial do escritório.

---

### Mudanças Necessárias

**Arquivo:** `supabase/functions/clara-assistant/index.ts`

#### 1. Adicionar Constante do WhatsApp no Topo
Adicionar constante com o link do WhatsApp para uso no Edge Function:

```typescript
const WHATSAPP_ENTERPRISE = "https://wa.me/5511914523971";
```

---

#### 2. Adicionar Instrução no CLARA_CORE_FULL (Prompt Principal)

Na seção `## UPGRADE — Só quando útil` do prompt principal, adicionar instrução explícita:

```text
## UPGRADE — Só quando útil

NUNCA: "Você deveria fazer upgrade"
SEMPRE: "Isso está no [Plano]. Você teria [benefício]. Faz sentido?"

REGRA ENTERPRISE (OBRIGATÓRIO):
Sempre que mencionar o plano Enterprise, use EXATAMENTE este formato:
"Para consultorias personalizadas assine o plano [Enterprise](https://wa.me/5511914523971)."
- A palavra Enterprise DEVE ser um link markdown para o WhatsApp
- Use essa frase quando: recomendar upgrade para Enterprise, falar sobre consultoria jurídica, ou mencionar benefícios exclusivos Enterprise
```

---

#### 3. Adicionar Instrução no CLARA_CORE_SLIM (Versão Reduzida)

Adicionar a mesma instrução na versão slim para consistência:

```text
REGRA ENTERPRISE: Ao mencionar Enterprise, use: "[Enterprise](https://wa.me/5511914523971)"
```

---

#### 4. Atualizar a Função appendDisclaimer

Modificar a função que adiciona disclaimer para Enterprise users para usar o link correto:

```typescript
function appendDisclaimer(response: string, userPlan: string): string {
  // ... código existente ...
  
  if (userPlan === 'ENTERPRISE') {
    return response + '\n\n✨ No Enterprise, suas consultorias com advogados tributaristas são incluídas e ilimitadas.';
  }
  
  // Para outros planos, ao mencionar Enterprise
  return response + '\n\n⚠️ Antes de implementar, converse com seu contador ou advogado tributarista. Para consultorias personalizadas assine o plano [Enterprise](https://wa.me/5511914523971).';
}
```

---

### Resultado Esperado

Quando a Clara mencionar o plano Enterprise em qualquer contexto, ela formatará assim:

- **Recomendação de upgrade:** "Essa ferramenta está no plano [Enterprise](https://wa.me/5511914523971). Quer saber mais?"
- **Consultoria jurídica:** "Para consultorias personalizadas assine o plano [Enterprise](https://wa.me/5511914523971)."
- **Benefícios exclusivos:** "No [Enterprise](https://wa.me/5511914523971) você tem consultoria ilimitada."

O link em markdown será renderizado como hyperlink clicável no chat, levando diretamente ao WhatsApp do escritório.

---

### Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `supabase/functions/clara-assistant/index.ts` | Adicionar constante WHATSAPP_ENTERPRISE, atualizar CLARA_CORE_FULL, CLARA_CORE_SLIM e appendDisclaimer |

---

### Seção Técnica

A Clara AI usa markdown nas respostas, que é renderizado pelo componente `react-markdown` no frontend. Links no formato `[texto](url)` serão automaticamente convertidos em hyperlinks clicáveis.

O Edge Function será redeployado automaticamente após as mudanças.

