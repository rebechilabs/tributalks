
## Plano: Opção B - Mover a Imagem de Fundo para a ProblemSection

### Objetivo
Fazer com que a **última parte amarela da pista** termine exatamente colada na frase "A Reforma Tributária vai custar..." movendo a imagem cinematográfica para a ProblemSection.

---

### Abordagem

A imagem de fundo será movida para a `ProblemSection`, posicionada no **topo da seção** de forma que a pista amarela termine exatamente onde começa o texto. O Hero ficará com um fundo simples escuro.

---

### Mudanças Técnicas

**Arquivo 1:** `src/components/landing/NewHeroSection.tsx`

| Alteração | Descrição |
|-----------|-----------|
| Remover imagem de fundo | A seção terá apenas fundo sólido `bg-[#0A0A0A]` |
| Altura da seção | Reduzir para `min-h-screen` (100vh) |
| Remover bottom fade | Não é mais necessário |

**Arquivo 2:** `src/components/landing/ProblemSection.tsx`

| Alteração | Descrição |
|-----------|-----------|
| Adicionar imagem de fundo | Importar `heroBg` e usar como background no topo |
| Estrutura da seção | Dividir em duas partes: área da imagem + área do conteúdo |
| Posição da imagem | `background-position: center bottom` para que a pista termine no texto |
| Altura da área da imagem | Aproximadamente `50vh` ou `60vh` para mostrar os prédios |

---

### Visualização

```text
┌─────────────────────────────────────────────┐
│  HERO SECTION (fundo sólido #0A0A0A)        │
│                                             │
│  "Domine a Reforma Tributária..."           │
│  [Comece seus 7 dias grátis]                │
│                                             │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  PROBLEM SECTION                            │
│  ┌─────────────────────────────────────┐   │
│  │  IMAGEM DE FUNDO (prédios)          │   │
│  │         PISTA AMARELA               │   │
│  │              ▼                      │   │
│  │         FIM DA PISTA ═══════════════│   │
│  └─────────────────────────────────────┘   │
│  "A Reforma Tributária vai custar..."  ← COLADO
│                                             │
│  [Cards de benefícios]                     │
└─────────────────────────────────────────────┘
```

---

### Código Proposto

**ProblemSection.tsx (estrutura):**
```tsx
<section className="bg-[#0A0A0A]">
  {/* Área da imagem cinematográfica */}
  <div 
    className="h-[50vh] md:h-[60vh] bg-cover bg-no-repeat"
    style={{ 
      backgroundImage: `url(${heroBg})`, 
      backgroundPosition: 'center bottom' 
    }}
  />
  
  {/* Conteúdo com a frase */}
  <div className="container mx-auto px-4 md:px-8 py-20 md:py-32">
    <h2>"A Reforma Tributária vai custar..."</h2>
    {/* Cards */}
  </div>
</section>
```

---

### Resultado Esperado

- A pista amarela terminará **exatamente colada** na frase "A Reforma Tributária vai custar..."
- Transição visual perfeita: imagem → texto (sem espaços)
- O Hero ficará mais limpo com fundo sólido
