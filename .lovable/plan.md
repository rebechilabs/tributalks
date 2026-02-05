

## Plano: Centralizar a Imagem Cinematográfica na Área de Transição

### O Que Você Quer
Posicionar o **centro focal da imagem** (os prédios com as linhas de dados douradas) exatamente na área entre o botão "Comece seus 7 dias grátis" e o título da próxima seção.

---

### Solução

Vou fazer ajustes no posicionamento da imagem e no espaçamento do conteúdo para que:

1. A imagem fique **centralizada verticalmente** na seção (não mais no fundo)
2. O conteúdo (título, subtítulo e botão) fique **mais compacto no topo**
3. O espaço abaixo do botão seja **maior e mais limpo** para exibir a imagem

---

### Mudanças Técnicas

**Arquivo:** `src/components/landing/NewHeroSection.tsx`

| Alteração | Antes | Depois |
|-----------|-------|--------|
| Posição da imagem | `center bottom` | `center center` |
| Alinhamento vertical | Centro (`items-center`) | Topo (`items-start`) |
| Padding inferior | `pb-32` / `pb-48` | Removido ou reduzido |
| Altura mínima | `min-h-screen` | Mantido para garantir espaço |
| Overlay inferior | 80% opacidade | 60% para melhor visibilidade |

---

### Resultado Esperado

- O **centro da imagem** (prédios + linhas de dados) ficará visível exatamente na área que você indicou
- O texto e botão ficarão na parte superior
- Transição elegante para a seção "Problema"

