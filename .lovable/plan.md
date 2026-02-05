

## Plano: Posicionar os Prédios Entre o Botão CTA e o Título da Seção Problema

### Objetivo
Fazer com que a parte focal da imagem cinematográfica (os prédios com linhas de dados douradas) apareça exatamente **no espaço entre**:
- O botão "Comece seus 7 dias grátis" (final do Hero)
- A frase "A Reforma Tributária vai custar..." (início da ProblemSection)

---

### Solução

Para que a imagem apareça nessa área de transição, vou:

1. **Estender a imagem de fundo** do Hero para cobrir também a área de transição
2. **Ajustar o posicionamento** para que os prédios fiquem na parte inferior do Hero
3. **Reduzir o overlay inferior** para deixar os prédios mais visíveis nessa área

---

### Mudanças Técnicas

**Arquivo:** `src/components/landing/NewHeroSection.tsx`

| Alteração | Antes | Depois |
|-----------|-------|--------|
| Posição da imagem | `center top` | `center 30%` (prédios na parte inferior do Hero) |
| Overlay inferior | `to-[#0A0A0A]/40` | `to-transparent` (mais visibilidade) |
| Bottom fade | `h-32` com gradiente | `h-16` gradiente suave |

---

### Visualização

```text
┌─────────────────────────────────────────────┐
│  HERO SECTION                               │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  "Domine a Reforma Tributária..."   │   │ ← Overlay forte (texto legível)
│  │                                     │   │
│  │  [Comece seus 7 dias grátis]        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─ PRÉDIOS APARECEM AQUI ─────────────┐   │ ← Overlay suave (imagem visível)
│  │  🏢🏢🏢 linhas douradas 🏢🏢🏢      │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  PROBLEM SECTION (bg sólido)               │
│  "A Reforma Tributária vai custar..."      │
└─────────────────────────────────────────────┘
```

---

### Resultado Esperado

- Os prédios cinematográficos ficarão visíveis na parte inferior da seção Hero
- O texto do Hero continuará legível com overlay forte no topo
- A transição para a ProblemSection será elegante

