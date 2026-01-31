

# Plano: Padronização "Clara AI" e Correção do CTA da Landing Page

## 1. Status Atual

### CTA Section (Saúde Fiscal)
O código já está correto em `src/components/landing/CTASection.tsx`:
- Título: "Descubra a saúde fiscal da sua empresa"
- Botão: "Testar Grátis por 7 Dias" → link Stripe Starter
- Ícone: Heart (coração)

**Ação do usuário**: Fazer **hard reload** (Ctrl+Shift+R / Cmd+Shift+R) e **rolar até o final da página** para ver o CTA.

---

## 2. Padronização para "Clara AI"

Localizei 5 arquivos que usam "IA" isolado ou "Assistente IA" que devem ser alterados para manter consistência com a marca "Clara AI":

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `src/components/dashboard/ClaraCard.tsx` | `Assistente IA` | `Clara AI` |
| `src/components/dashboard/ClaraCard.tsx` | Badge `IA` | Badge `AI` |
| `src/components/landing/FeaturesSection.tsx` | Badge `IA` | Badge `AI` |
| `src/components/landing/HeroSection.tsx` | `Decisões com IA` | `Decisões com Clara AI` |
| `src/components/docs/TribuTalksPitchPdf.tsx` | Badge `IA` | Badge `AI` |

---

## 3. Alterações Detalhadas

### Arquivo 1: `src/components/dashboard/ClaraCard.tsx`

**Linha 45**: Subtítulo acima do nome
```tsx
// ANTES
<p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
  Assistente IA
</p>

// DEPOIS
<p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
  Clara AI
</p>
```

**Linhas 49-51**: Badge ao lado do nome "Clara"
```tsx
// ANTES
<span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
  IA
</span>

// DEPOIS  
<span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
  AI
</span>
```

### Arquivo 2: `src/components/landing/FeaturesSection.tsx`

**Linha 89**: Badge da feature Clara AI
```tsx
// ANTES
badge: "IA",

// DEPOIS
badge: "AI",
```

### Arquivo 3: `src/components/landing/HeroSection.tsx`

**Linha 59**: Benefício no Hero
```tsx
// ANTES
{ icon: Zap, text: "Decisões com IA", sub: "Clara AI responde dúvidas 24/7" },

// DEPOIS
{ icon: Zap, text: "Decisões com Clara AI", sub: "Sua copiloto tributária 24/7" },
```

### Arquivo 4: `src/components/docs/TribuTalksPitchPdf.tsx`

**Linha 171**: Badge no PDF comercial
```tsx
// ANTES
badge: "IA",

// DEPOIS
badge: "AI",
```

---

## 4. Padrão Final de Nomenclatura

| Contexto | Formato |
|----------|---------|
| Nome completo do produto | **Clara AI** |
| Badges visuais (chips) | **AI** |
| Descrições | "Copiloto tributário", "Sua copiloto tributária" |
| Rotas | `/clara-ai` (mantém) |
| Feature key interno | `clara_ai` (mantém) |

---

## 5. Resumo das Alterações

| Arquivo | Modificações |
|---------|-------------|
| `ClaraCard.tsx` | 2 alterações (subtítulo + badge) |
| `FeaturesSection.tsx` | 1 alteração (badge) |
| `HeroSection.tsx` | 1 alteração (texto benefício) |
| `TribuTalksPitchPdf.tsx` | 1 alteração (badge PDF) |
| **Total** | **5 alterações em 4 arquivos** |

