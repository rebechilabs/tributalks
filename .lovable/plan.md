

## Plano: Diminuir o Espaço entre a Foto e a Frase

### Análise Atual

| Seção | Espaçamento | Valor |
|-------|-------------|-------|
| Hero (subheadline → botão) | `mb-10` | 40px |
| ProblemSection (imagem → frase) | `pt-10` | 40px |

O usuário informou que o espaço está maior do que o desejado, então vou reduzir de `pt-10` para `pt-6` (24px).

---

### Mudança Técnica

**Arquivo:** `src/components/landing/ProblemSection.tsx`

| Alteração | Antes | Depois |
|-----------|-------|--------|
| Padding do container | `pt-10 pb-20 md:pb-32` | `pt-6 pb-20 md:pb-32` |

---

### Resultado Esperado

- Espaçamento de **24px** entre a imagem e a frase (redução de 16px)
- Visual mais compacto e conectado entre a imagem e o texto

