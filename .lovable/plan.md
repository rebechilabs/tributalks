

## Plano: Descer a Imagem Até o Fim da Pista Encostar na Frase

### Objetivo
Fazer com que o **fim da pista/avenida** da imagem cinematográfica fique exatamente encostando na frase "A Reforma Tributária vai custar...".

---

### Solução

Para descer ainda mais a imagem e fazer a pista encostar na frase, vou:

1. **Aumentar a altura da seção Hero** - de `120vh` para `140vh` (mais espaço para a imagem descer)
2. **Ajustar o `backgroundPosition`** - de `20%` para `10%` ou até `0%` (empurra a imagem mais para baixo)
3. **Remover o bottom fade** - para não escurecer o fim da pista

---

### Mudanças Técnicas

**Arquivo:** `src/components/landing/NewHeroSection.tsx`

| Alteração | Antes | Depois |
|-----------|-------|--------|
| Altura da seção | `min-h-[120vh]` | `min-h-[140vh]` |
| Posição da imagem | `center 20%` | `center 10%` |
| Bottom fade | `h-24` com gradiente | Removido ou `h-8` (mínimo) |

---

### Visualização

```text
┌─────────────────────────────────────────────┐
│  HERO SECTION (min-h-[140vh])               │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  "Domine a Reforma Tributária..."   │   │
│  │  [Comece seus 7 dias grátis]        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│         (espaço extra)                     │
│                                             │
│  ┌─ PRÉDIOS E AVENIDA ─────────────────┐   │
│  │                                     │   │
│  │                                     │   │
│  │         FIM DA PISTA ───────────────│───┼── ← Encostando na frase
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  "A Reforma Tributária vai custar..."      │ ← Frase começa exatamente aqui
└─────────────────────────────────────────────┘
```

---

### Resultado Esperado

- O fim da pista ficará exatamente encostando na linha onde começa a frase "A Reforma Tributária vai custar..."
- Transição visual perfeita entre a imagem e a seção Problema

