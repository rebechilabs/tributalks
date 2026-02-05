

## Plano: Posicionar os Prédios Logo Após o Botão CTA

### Objetivo
Fazer com que os prédios da imagem cinematográfica comecem a aparecer **imediatamente abaixo** do botão "Comece seus 7 dias grátis".

---

### Solução

Vou ajustar o posicionamento da imagem de fundo para que a parte superior da imagem (onde ficam os prédios) comece logo após o conteúdo de texto. Isso requer:

1. **Mudar a posição da imagem para `center top`** - assim o topo da imagem (os prédios) ficará visível primeiro
2. **Reduzir significativamente o overlay superior** - para que os prédios não fiquem escurecidos
3. **Manter o conteúdo compacto no topo** - o texto e botão ficam na parte superior

---

### Mudanças Técnicas

**Arquivo:** `src/components/landing/NewHeroSection.tsx`

| Alteração | Antes | Depois |
|-----------|-------|--------|
| Posição da imagem | `center center` | `center top` |
| Gradiente superior | `from-[#0A0A0A]/80` | `from-[#0A0A0A]/90` (mais forte no topo para legibilidade do texto) |
| Gradiente meio | `via-transparent` | `via-[#0A0A0A]/20` (leve escurecimento) |
| Gradiente inferior | `to-[#0A0A0A]/60` | `to-[#0A0A0A]/40` (mais suave para mostrar os prédios) |

---

### Resultado Esperado

- O texto ficará legível no topo com overlay forte
- Os prédios aparecerão logo após o botão CTA
- Transição suave para a seção "Problema" abaixo

