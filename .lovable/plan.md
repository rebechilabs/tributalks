

## Plano: Equalizar o Espaçamento da Imagem com a Frase

### Objetivo
Manter a mesma distância entre a **imagem cinematográfica** e a frase "A Reforma Tributária vai custar..." que existe entre essa frase e o botão "Comece seus 7 dias grátis".

---

### Análise Atual

**No Hero (botão):**
- A subheadline tem `mb-10` (2.5rem = 40px) antes do botão

**Na ProblemSection (frase):**
- A imagem termina sem nenhum espaçamento (`pt-0`) antes da frase

---

### Solução

Adicionar um padding-top de `pt-10` (40px) no container da ProblemSection para criar o mesmo espaçamento de 40px entre a imagem e a frase.

---

### Mudanças Técnicas

**Arquivo:** `src/components/landing/ProblemSection.tsx`

| Alteração | Antes | Depois |
|-----------|-------|--------|
| Padding do container | `pb-20 md:pb-32` | `pt-10 pb-20 md:pb-32` |

---

### Visualização

```text
┌─────────────────────────────────────────────┐
│  HERO                                       │
│  "Domine a Reforma Tributária..."           │
│  (subheadline)                              │
│           ↓ mb-10 (40px)                    │
│  [Comece seus 7 dias grátis]                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  PROBLEM SECTION                            │
│  [IMAGEM - fim da pista]                    │
│           ↓ pt-10 (40px) ← NOVO             │
│  "A Reforma Tributária vai custar..."       │
└─────────────────────────────────────────────┘
```

---

### Resultado Esperado

- Espaçamento de **40px** entre a imagem e a frase
- Mesmo espaçamento visual que existe entre a subheadline e o botão no Hero
- Consistência visual entre as seções

