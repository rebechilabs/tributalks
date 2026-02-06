
# Plano de Correção Final - LP TribuTalks·Connect

## Resumo das Alterações

Este plano cobre os 4 ajustes finos solicitados para alinhar a landing page com a identidade "Dark Luxury".

---

## Ajuste 1: Imagem de Fundo do Hero

**Situação Atual:**  
A imagem atual (`photo-1582653291997-079a1c04e5a1`) mostra uma sala de reunião com tons claros, o que quebra a estética dark luxury.

**Solução:**  
Trocar para uma imagem noturna de sala de reunião executiva com:
- Vista para cidade à noite
- Iluminação âmbar/dourada
- Mobiliário escuro e sofisticado

**Imagem sugerida:** `photo-1497366216548-37526070297c` (sala de conferência moderna com vista para cidade à noite, tons escuros e iluminação quente)

**Arquivo:** `src/components/connect/ConnectHeroSection.tsx`

---

## Ajuste 2: Bloco do Formulário Typeform

**Situação Atual:**  
O formulário apenas mostra um container escuro sem feedback enquanto carrega.

**Solução:**  
1. Adicionar estado de loading com spinner dourado e texto "Carregando aplicação..."
2. Implementar timeout de 10 segundos
3. Se falhar, mostrar botão "Aplicar em nova aba" que abre o Typeform diretamente

**Arquivo:** `src/components/connect/ConnectFormSection.tsx`

**Mudanças técnicas:**
- Adicionar estados `isLoading` e `hasError` com `useState`
- Usar `useEffect` com `setTimeout` de 10s para detectar falha
- Mostrar `LoadingSpinner` com cor primária (dourada)
- Botão de fallback abre `https://gtyclpasfkm.typeform.com/to/hJER83zj`

---

## Ajuste 3: Contraste do Texto na Seção "Cadeira Única"

**Situação Atual:**  
Os parágrafos usam `text-muted-foreground` que resulta em contraste insuficiente.

**Solução:**  
Criar uma classe customizada ou usar estilo inline para aplicar a cor `#A1A1A1` nos parágrafos descritivos.

**Arquivo:** `src/components/connect/ConnectSolutionSection.tsx`

**Linhas afetadas:** 44-55 (os dois parágrafos que começam com "No TribuTalks·Connect...")

---

## Ajuste 4: Contador de Profissionais

**Situação Atual:**  
O texto mostra "131 profissionais já na fila."

**Solução:**  
Alterar para "523 profissionais já na fila." (número mais forte para prova social)

**Arquivo:** `src/components/connect/ConnectFormSection.tsx`  
**Linha:** 65

---

## Detalhes Técnicos

### Estrutura do Loading State (Ajuste 2)

```text
┌──────────────────────────────────────┐
│                                      │
│    [Typeform carregando...]          │
│                                      │
│         🔄 Spinner Dourado           │
│      "Carregando aplicação..."       │
│                                      │
│ ─────── após 10s de falha ─────────  │
│                                      │
│   [Botão: Aplicar em nova aba →]     │
│                                      │
└──────────────────────────────────────┘
```

### Cores Aplicadas

| Elemento | Cor Atual | Cor Nova |
|----------|-----------|----------|
| Parágrafos "Cadeira Única" | `text-muted-foreground` (~#71717A) | `#A1A1A1` |
| Spinner de loading | - | `text-primary` (âmbar) |
| Botão fallback | - | `bg-primary` (âmbar) |

---

## Arquivos a Modificar

1. `src/components/connect/ConnectHeroSection.tsx` - Nova imagem de fundo
2. `src/components/connect/ConnectFormSection.tsx` - Loading state + contador
3. `src/components/connect/ConnectSolutionSection.tsx` - Contraste do texto
