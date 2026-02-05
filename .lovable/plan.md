

## Plano: Encostar a Foto no Botão "Comece seus 7 dias grátis"

### Objetivo
Mover a imagem cinematográfica de volta para o Hero Section, posicionando-a imediatamente abaixo do botão "Comece seus 7 dias grátis".

---

### Abordagem

A imagem será movida da `ProblemSection` para a `NewHeroSection`, aparecendo logo após o botão CTA. A estrutura será reorganizada para que:

1. O Hero contenha o texto + botão + imagem
2. A ProblemSection comece direto com a frase "A Reforma Tributária vai custar..."

---

### Visualização

```text
┌─────────────────────────────────────────────┐
│  HERO SECTION                               │
│                                             │
│  "Domine a Reforma Tributária..."           │
│  (subheadline)                              │
│                                             │
│  [Comece seus 7 dias grátis]                │
│           ↓ (encostado)                     │
│  ┌─────────────────────────────────────┐   │
│  │  IMAGEM CINEMATOGRÁFICA             │   │
│  │       (prédios + pista amarela)     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  PROBLEM SECTION                            │
│  "A Reforma Tributária vai custar..."       │
│  [Cards de benefícios]                     │
└─────────────────────────────────────────────┘
```

---

### Mudanças Técnicas

**Arquivo 1:** `src/components/landing/NewHeroSection.tsx`

| Alteração | Descrição |
|-----------|-----------|
| Importar imagem | Adicionar `import heroBg from "@/assets/hero-bg-cinematic.jpg"` |
| Remover `min-h-screen` | Permitir que a seção tenha altura flexível |
| Remover centralização vertical | Trocar `flex items-center justify-center` por layout vertical |
| Adicionar imagem após botão | Inserir div com a imagem cinematográfica logo abaixo do botão |
| Adicionar padding top | Manter espaço no topo para o header |

**Arquivo 2:** `src/components/landing/ProblemSection.tsx`

| Alteração | Descrição |
|-----------|-----------|
| Remover import da imagem | Não será mais necessário aqui |
| Remover div da imagem | Eliminar o container da imagem cinematográfica |
| Ajustar padding | Adicionar padding-top ao container do conteúdo |

---

### Código Proposto

**NewHeroSection.tsx:**
```tsx
import heroBg from "@/assets/hero-bg-cinematic.jpg";

<section className="relative bg-[#0A0A0A]">
  {/* Conteúdo centralizado */}
  <div className="container mx-auto px-4 md:px-8 pt-32 md:pt-40">
    <div className="max-w-4xl mx-auto text-center">
      {/* Título, subtítulo e botão */}
    </div>
  </div>
  
  {/* Imagem encostada no botão */}
  <div 
    className="h-[50vh] md:h-[60vh] mt-10 bg-cover bg-no-repeat"
    style={{ 
      backgroundImage: `url(${heroBg})`, 
      backgroundPosition: 'center bottom' 
    }}
  />
</section>
```

**ProblemSection.tsx:**
```tsx
<section className="bg-[#0A0A0A]">
  <div className="container mx-auto px-4 md:px-8 pt-6 pb-20 md:pb-32">
    {/* Frase "A Reforma Tributária vai custar..." */}
    {/* Cards de benefícios */}
  </div>
</section>
```

---

### Resultado Esperado

- A imagem cinematográfica ficará **encostada** logo abaixo do botão "Comece seus 7 dias grátis"
- A pista amarela terminará exatamente onde começa a frase "A Reforma Tributária vai custar..."
- Fluxo visual contínuo: Hero → Imagem → Frase

