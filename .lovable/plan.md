

## Plano: Ajustar a Imagem para que a Avenida Termine na Frase "A Reforma Tributária..."

### Objetivo
Posicionar o **fim da avenida** da imagem cinematográfica exatamente onde começa a frase "A Reforma Tributária vai custar..." (início da ProblemSection).

---

### Solução

Para baixar mais a imagem, vou:

1. **Aumentar a altura da seção Hero** - de `110vh` para `120vh` ou mais
2. **Ajustar o `backgroundPosition`** - de `30%` para algo menor (ex: `20%` ou `15%`) para empurrar a imagem mais para baixo

---

### Mudanças Técnicas

**Arquivo:** `src/components/landing/NewHeroSection.tsx`

| Alteração | Antes | Depois |
|-----------|-------|--------|
| Altura da seção | `min-h-[110vh]` | `min-h-[120vh]` |
| Posição da imagem | `center 30%` | `center 20%` |
| Bottom fade | `h-16` | `h-24` (transição mais suave) |

---

### Visualização

```text
┌─────────────────────────────────────────────┐
│  HERO SECTION (min-h-[120vh])               │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  "Domine a Reforma Tributária..."   │   │
│  │  [Comece seus 7 dias grátis]        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│         (mais espaço aqui)                 │
│                                             │
│  ┌─ PRÉDIOS E AVENIDA ─────────────────┐   │
│  │                                     │   │
│  │         FIM DA AVENIDA              │   │ ← Alinhado com início da próxima seção
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  "A Reforma Tributária vai custar..."      │ ← A frase começa aqui
└─────────────────────────────────────────────┘
```

---

### Resultado Esperado

- O fim da avenida ficará exatamente na linha onde começa a frase "A Reforma Tributária vai custar..."
- A transição entre Hero e ProblemSection será visualmente alinhada com a imagem

