

## Plano: Reposicionar a Imagem de Fundo do Hero

### Objetivo
Fazer com que a imagem de fundo desça na seção Hero, tornando o "desenho" cinematográfico mais visível no espaço entre o botão CTA e a seção "Problema".

---

### Solução Proposta

Vou alterar a estratégia de posicionamento da imagem. Em vez de usar apenas `backgroundPosition`, vou:

1. **Mover o conteúdo (texto e botão) para o topo** da seção Hero, liberando espaço abaixo para a imagem aparecer
2. **Ajustar a posição vertical da imagem** para que a parte principal fique visível na área inferior da seção
3. **Reduzir a intensidade do overlay** na parte inferior para deixar a imagem mais visível

---

### Mudanças Técnicas

**Arquivo:** `src/components/landing/NewHeroSection.tsx`

| Alteração | Antes | Depois |
|-----------|-------|--------|
| Alinhamento do conteúdo | Centro vertical | Topo da seção |
| Posição da imagem | `center 85%` | `center bottom` ou `center 100%` |
| Overlay inferior | Gradiente forte | Gradiente mais suave |

---

### Resultado Esperado

- O texto e botão ficarão na parte **superior** da seção Hero
- A imagem cinematográfica ficará mais visível na parte **inferior** da seção
- Transição suave para a seção "Problema" abaixo

